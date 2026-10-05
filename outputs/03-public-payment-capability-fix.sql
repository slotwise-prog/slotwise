begin;

-- The existing business_has_package_capability helper also requires an
-- authenticated business_users membership, which anonymous public payment
-- submissions do not have. Keep that dashboard helper unchanged and expose
-- only the narrow public payment capability needed by the two public RPCs.
create or replace function public.public_business_has_package_capability(
  target_slug text,
  capability text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select upper(coalesce(b.business_package, '')) = 'PRO'
    and upper(coalesce(b.status, '')) = 'ACTIVE'
    and upper(coalesce(capability, '')) = 'PAYMENT_VERIFICATION'
  from public.businesses b
  where b.slug = target_slug;
$$;

revoke all on function public.public_business_has_package_capability(text, text) from public;
grant execute on function public.public_business_has_package_capability(text, text) to anon, authenticated;

create or replace function public.authorize_payment_proof_upload(
  booking_id_value text,
  business_slug_value text,
  booking_possession_token_value text,
  file_extension_value text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare next_path text; normalized_extension text;
begin
  if not public.validate_booking_possession(booking_id_value, business_slug_value, booking_possession_token_value) then
    raise exception 'Invalid booking possession.';
  end if;
  if not public.public_business_has_package_capability(business_slug_value, 'PAYMENT_VERIFICATION') then
    raise exception 'This package cannot submit payment verification.';
  end if;
  if not public.is_active_business(business_slug_value) then
    raise exception 'This business is not accepting live payments.';
  end if;
  if not exists (
    select 1
    from public.business_payment_settings
    where business_slug = business_slug_value
      and enabled = true
  ) then
    raise exception 'Payment verification is not enabled for this business.';
  end if;
  normalized_extension := lower(file_extension_value);
  if normalized_extension not in ('jpg', 'jpeg', 'png', 'webp') then
    raise exception 'Unsupported payment proof type.';
  end if;
  next_path := business_slug_value || '/' || booking_id_value || '/' || gen_random_uuid()::text || '.' || normalized_extension;
  return next_path;
end;
$$;

revoke all on function public.authorize_payment_proof_upload(text, text, text, text) from public;
grant execute on function public.authorize_payment_proof_upload(text, text, text, text) to anon, authenticated;

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
  if not public.public_business_has_package_capability(business_slug_value, 'PAYMENT_VERIFICATION') then
    raise exception 'This package cannot submit payment verification.';
  end if;
  if not exists (
    select 1
    from public.business_payment_settings
    where business_slug = business_slug_value
      and enabled = true
  ) then
    raise exception 'Payment verification is not enabled for this business.';
  end if;
  select coalesce(require_proof, false)
    into proof_required
  from public.business_payment_settings
  where business_slug = business_slug_value
    and enabled = true;
  if proof_required and nullif(proof_storage_path_value, '') is null then
    raise exception 'Payment proof is required.';
  end if;
  if nullif(proof_storage_path_value, '') is not null then
    if split_part(proof_storage_path_value, '/', 1) <> business_slug_value
      or split_part(proof_storage_path_value, '/', 2) <> booking_id_value then
      raise exception 'Invalid payment proof path.';
    end if;
    if not exists (
      select 1
      from storage.objects
      where bucket_id = 'payment-proofs'
        and name = proof_storage_path_value
    ) then
      raise exception 'Payment proof object was not uploaded.';
    end if;
  end if;
  if not exists (
    select 1
    from public.business_payment_methods
    where business_slug = business_slug_value
      and active = true
      and method_type = payment_method_value
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
    )
    values (
      next_id, booking_id_value, business_slug_value, payment_method_value,
      amount_submitted_value, reference_number_value, customer_note_value,
      nullif(proof_storage_path_value, ''), 'PENDING_VERIFICATION'
    )
    returning booking_payments.id, booking_payments.payment_status;
end;
$$;

revoke all on function public.submit_public_booking_payment(text, text, text, numeric, text, text, text, text) from public;
grant execute on function public.submit_public_booking_payment(text, text, text, numeric, text, text, text, text) to anon, authenticated;

commit;
