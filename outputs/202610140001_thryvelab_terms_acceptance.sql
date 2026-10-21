begin;

-- ThryveLab-only acceptance record. This migration is intentionally prepared for
-- manual review and execution; it is not run by the application build.
create table if not exists public.thryvelab_terms_acceptances (
  booking_id text primary key references public.bookings(id) on delete cascade,
  business_slug text not null references public.businesses(slug) on delete cascade,
  terms_version text not null,
  terms_effective_date date not null,
  accepted_at timestamptz not null default now(),
  acknowledgment_values jsonb not null,
  constraint thryvelab_terms_acceptances_business_check check (business_slug = 'thryvelab')
);

alter table public.thryvelab_terms_acceptances enable row level security;
revoke all on table public.thryvelab_terms_acceptances from anon, authenticated;

create or replace function public.record_thryvelab_terms_acceptance(
  booking_id_value text,
  business_slug_value text,
  booking_possession_token_value text,
  terms_version_value text,
  terms_effective_date_value text,
  acknowledgment_values jsonb
)
returns table (booking_id text, accepted_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if business_slug_value <> 'thryvelab' then
    raise exception 'Terms acceptance is only available for ThryveLab.';
  end if;
  if not public.validate_booking_possession(booking_id_value, business_slug_value, booking_possession_token_value) then
    raise exception 'Invalid booking possession.';
  end if;
  if terms_version_value <> '2026-10-14' or terms_effective_date_value <> 'October 14, 2026' then
    raise exception 'Unsupported ThryveLab terms version.';
  end if;
  if coalesce(acknowledgment_values ->> 'terms', 'false') <> 'true'
     or coalesce(acknowledgment_values ->> 'review', 'false') <> 'true'
     or coalesce(acknowledgment_values ->> 'policy', 'false') <> 'true' then
    raise exception 'All required ThryveLab acknowledgments must be accepted.';
  end if;
  if coalesce(acknowledgment_values ->> 'starter_required', 'false') = 'true'
     and coalesce(acknowledgment_values ->> 'starter', 'false') <> 'true' then
    raise exception 'The 7-Day Starter Kit acknowledgment is required.';
  end if;
  if not exists (
    select 1 from public.bookings as b
    where b.id = booking_id_value and b.business_slug = 'thryvelab'
  ) then
    raise exception 'ThryveLab booking was not found.';
  end if;
  return query
    insert into public.thryvelab_terms_acceptances as ta (
      booking_id, business_slug, terms_version, terms_effective_date, acknowledgment_values
    ) values (
      booking_id_value, 'thryvelab', terms_version_value,
      terms_effective_date_value::date, acknowledgment_values
    )
    on conflict (booking_id) do update set
      terms_version = excluded.terms_version,
      terms_effective_date = excluded.terms_effective_date,
      accepted_at = now(),
      acknowledgment_values = excluded.acknowledgment_values
    returning ta.booking_id, ta.accepted_at;
end;
$$;

revoke all on function public.record_thryvelab_terms_acceptance(text, text, text, text, text, jsonb) from public;
grant execute on function public.record_thryvelab_terms_acceptance(text, text, text, text, text, jsonb) to anon, authenticated;

-- Preserve the existing public payment validation and add only the ThryveLab
-- acceptance gate before a payment row can be created.
drop function if exists public.submit_public_booking_payment(text, text, text, numeric, text, text);
drop function if exists public.submit_public_booking_payment(text, text, text, numeric, text, text, text, text);
create or replace function public.submit_public_booking_payment(
  booking_id_value text, business_slug_value text, payment_method_value text,
  amount_submitted_value numeric, reference_number_value text, customer_note_value text,
  booking_possession_token_value text, proof_storage_path_value text default null
)
returns table (id text, payment_status text)
language plpgsql
security definer
set search_path = public
as $$
declare next_id text; proof_required boolean;
begin
  if not public.validate_booking_possession(booking_id_value, business_slug_value, booking_possession_token_value) then
    raise exception 'Invalid booking possession.';
  end if;
  if not public.is_active_business(business_slug_value) then
    raise exception 'This business is not accepting live payments.';
  end if;
  if business_slug_value = 'thryvelab' and not exists (
    select 1 from public.thryvelab_terms_acceptances as ta where ta.booking_id = booking_id_value
  ) then
    raise exception 'ThryveLab terms acceptance is required before payment.';
  end if;
  if not public.public_business_has_package_capability(business_slug_value, 'PAYMENT_VERIFICATION') then
    raise exception 'This package cannot submit payment verification.';
  end if;
  if not exists (
    select 1 from public.business_payment_settings
    where business_slug = business_slug_value and enabled = true
  ) then
    raise exception 'Payment verification is not enabled for this business.';
  end if;
  select coalesce(require_proof, false) into proof_required
  from public.business_payment_settings
  where business_slug = business_slug_value and enabled = true;
  if proof_required and nullif(proof_storage_path_value, '') is null then
    raise exception 'Payment proof is required.';
  end if;
  if nullif(proof_storage_path_value, '') is not null then
    if split_part(proof_storage_path_value, '/', 1) <> business_slug_value
       or split_part(proof_storage_path_value, '/', 2) <> booking_id_value then
      raise exception 'Invalid payment proof path.';
    end if;
    if not exists (
      select 1 from storage.objects
      where bucket_id = 'payment-proofs' and name = proof_storage_path_value
    ) then
      raise exception 'Payment proof object was not uploaded.';
    end if;
  end if;
  if not exists (
    select 1 from public.business_payment_methods
    where business_slug = business_slug_value and active = true and method_type = payment_method_value
  ) then
    raise exception 'Payment method is not available.';
  end if;
  if coalesce(amount_submitted_value, 0) <= 0 then
    raise exception 'Payment amount must be greater than zero.';
  end if;
  next_id := 'PAY-' || booking_id_value || '-' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint::text;
  return query
    insert into public.booking_payments (
      id, booking_id, business_slug, payment_method, amount_submitted,
      reference_number, customer_note, proof_storage_path, payment_status
    ) values (
      next_id, booking_id_value, business_slug_value, payment_method_value,
      amount_submitted_value, reference_number_value, customer_note_value,
      nullif(proof_storage_path_value, ''), 'PENDING_VERIFICATION'
    ) returning booking_payments.id, booking_payments.payment_status;
end;
$$;

revoke all on function public.submit_public_booking_payment(text, text, text, numeric, text, text, text, text) from public;
grant execute on function public.submit_public_booking_payment(text, text, text, numeric, text, text, text, text) to anon, authenticated;

commit;
