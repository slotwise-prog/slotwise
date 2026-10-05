begin;

-- Keep manual payment customer-facing access behind both the PRO capability
-- and the business owner's explicit Accept Manual Payments toggle.
create or replace function public.submit_public_booking_payment(
  booking_id_value text,
  business_slug_value text,
  payment_method_value text,
  amount_submitted_value numeric,
  reference_number_value text,
  customer_note_value text
)
returns table (id text, payment_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  next_id text;
begin
  if not public.is_active_business(business_slug_value) then
    raise exception 'This business is not accepting live payments.';
  end if;

  if not public.business_has_package_capability(business_slug_value, 'PAYMENT_VERIFICATION') then
    raise exception 'This package cannot accept manual payments.';
  end if;

  if not exists (
    select 1 from bookings
    where bookings.id = booking_id_value
      and bookings.business_slug = business_slug_value
  ) then
    raise exception 'Booking was not found.';
  end if;

  if not exists (
    select 1 from business_payment_settings
    where business_slug = business_slug_value
      and enabled = true
  ) then
    raise exception 'Manual payments are not enabled for this business.';
  end if;

  if not exists (
    select 1 from business_payment_methods
    where business_slug = business_slug_value
      and active = true
      and method_type = payment_method_value
  ) then
    raise exception 'Payment method is not available.';
  end if;

  if coalesce(nullif(trim(reference_number_value), ''), '') = '' then
    raise exception 'A payment reference is required.';
  end if;

  next_id := 'PAY-' || booking_id_value || '-' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint::text;

  return query
  insert into booking_payments (
    id, booking_id, business_slug, payment_method, amount_submitted,
    reference_number, customer_note, payment_status
  ) values (
    next_id, booking_id_value, business_slug_value, payment_method_value,
    greatest(coalesce(amount_submitted_value, 0), 0), reference_number_value,
    customer_note_value, 'PENDING_VERIFICATION'
  )
  returning booking_payments.id, booking_payments.payment_status;
end;
$$;

grant execute on function public.submit_public_booking_payment(text, text, text, numeric, text, text) to anon, authenticated;

commit;
