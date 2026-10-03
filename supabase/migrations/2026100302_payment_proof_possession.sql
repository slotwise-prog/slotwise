begin;

alter table public.business_payment_settings
  add column if not exists require_proof boolean not null default false;

alter table public.booking_payments
  add column if not exists proof_storage_path text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg','image/png','image/webp']::text[])
on conflict (id) do update set
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp']::text[];

drop policy if exists "Public customers can upload payment proofs" on storage.objects;
drop policy if exists "Authorized clients can read payment proofs" on storage.objects;
create policy "Authorized clients can read payment proofs"
on storage.objects for select to authenticated
using (
  bucket_id = 'payment-proofs'
  and public.can_manage_business(split_part(name, '/', 1))
  and public.business_has_package_capability(split_part(name, '/', 1), 'PAYMENT_VERIFICATION')
);

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
  if not public.business_has_package_capability(business_slug_value, 'PAYMENT_VERIFICATION') then
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

drop function if exists public.upsert_client_payment_settings(text, boolean, text, text, numeric);
create or replace function public.upsert_client_payment_settings(
  target_slug text, enabled_value boolean, requirement_type_value text,
  deposit_type_value text, deposit_value_value numeric,
  require_proof_value boolean default false
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.business_has_package_capability(target_slug, 'PAYMENT_VERIFICATION') then
    raise exception 'This package cannot manage payment verification.';
  end if;
  insert into business_payment_settings (id, business_slug, enabled, requirement_type, deposit_type, deposit_value, require_proof, updated_at)
  values ('PAYSET-' || target_slug, target_slug, coalesce(enabled_value,false), coalesce(requirement_type_value,'NO_PAYMENT_REQUIRED'), coalesce(deposit_type_value,'FIXED_AMOUNT'), coalesce(deposit_value_value,0), coalesce(require_proof_value,false), now())
  on conflict (business_slug) do update set
    enabled = excluded.enabled,
    requirement_type = excluded.requirement_type,
    deposit_type = excluded.deposit_type,
    deposit_value = excluded.deposit_value,
    require_proof = excluded.require_proof,
    updated_at = now();
end;
$$;

drop function if exists public.submit_public_booking_payment(text, text, text, numeric, text, text);
drop function if exists public.submit_public_booking_payment(text, text, text, numeric, text, text, text, text);
create or replace function public.submit_public_booking_payment(
  booking_id_value text, business_slug_value text, payment_method_value text,
  amount_submitted_value numeric, reference_number_value text, customer_note_value text,
  booking_possession_token_value text, proof_storage_path_value text default null
)
returns table (id text, payment_status text)
language plpgsql security definer set search_path = public as $$
declare next_id text; proof_required boolean;
begin
  if not public.validate_booking_possession(booking_id_value, business_slug_value, booking_possession_token_value) then
    raise exception 'Invalid booking possession.';
  end if;
  if not public.is_active_business(business_slug_value) then raise exception 'This business is not accepting live payments.'; end if;
  if not public.business_has_package_capability(business_slug_value, 'PAYMENT_VERIFICATION') then raise exception 'This package cannot submit payment verification.'; end if;
  if not exists (select 1 from business_payment_settings where business_slug = business_slug_value and enabled = true) then raise exception 'Payment verification is not enabled for this business.'; end if;
  select coalesce(require_proof,false) into proof_required from business_payment_settings where business_slug = business_slug_value and enabled = true;
  if proof_required and nullif(proof_storage_path_value,'') is null then raise exception 'Payment proof is required.'; end if;
  if nullif(proof_storage_path_value,'') is not null then
    if split_part(proof_storage_path_value,'/',1) <> business_slug_value or split_part(proof_storage_path_value,'/',2) <> booking_id_value then raise exception 'Invalid payment proof path.'; end if;
    if not exists (select 1 from storage.objects where bucket_id = 'payment-proofs' and name = proof_storage_path_value) then raise exception 'Payment proof object was not uploaded.'; end if;
  end if;
  if not exists (select 1 from business_payment_methods where business_slug = business_slug_value and active = true and method_type = payment_method_value) then raise exception 'Payment method is not available.'; end if;
  if coalesce(amount_submitted_value,0) <= 0 then raise exception 'Payment amount must be greater than zero.'; end if;
  next_id := 'PAY-' || booking_id_value || '-' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint::text;
  return query insert into booking_payments (id, booking_id, business_slug, payment_method, amount_submitted, reference_number, customer_note, proof_storage_path, payment_status)
  values (next_id, booking_id_value, business_slug_value, payment_method_value, amount_submitted_value, reference_number_value, customer_note_value, nullif(proof_storage_path_value,''), 'PENDING_VERIFICATION')
  returning booking_payments.id, booking_payments.payment_status;
end;
$$;

revoke all on function public.upsert_client_payment_settings(text, boolean, text, text, numeric, boolean) from public;
grant execute on function public.upsert_client_payment_settings(text, boolean, text, text, numeric, boolean) to authenticated;
revoke all on function public.submit_public_booking_payment(text, text, text, numeric, text, text, text, text) from public;
grant execute on function public.submit_public_booking_payment(text, text, text, numeric, text, text, text, text) to anon, authenticated;

update public.slotwise_updates
set summary = 'PRO users can now offer Pay Now or Pay Later after a successful booking, submit payment details and proof, and verify payments directly from the Slotwise dashboard.',
    content = E'Manual Payment & Payment Verification is available for PRO users.\n\nCustomers can choose Pay Now or Pay Later after a successful booking. Pay Now supports the configured payment method, amount, reference number, optional note, and payment proof upload when required. Submitted payments remain Pending Verification until the business checks the actual payment account. Owners can verify or reject payment details from Booking / Reservation Details. Booking Status and Payment Status remain separate, and the Booking PDF reflects the payment state without being an official receipt.\n\nHOW TO USE:\nCustomer: Submit Booking -> Choose Payment Option -> Pay Now / Pay Later\nBusiness: Dashboard -> Settings -> Payment Settings\nVerification: Bookings / Requests -> View Details -> Payment Details',
    is_published = true, applicable_packages = array['PRO']::text[], feature_badge = 'PRO FEATURE', published_at = '2026-10-01 00:00:00+00'
where id = 'manual-payment-verification-2026-10-01' or title = 'Manual Payment & Payment Verification';

commit;
