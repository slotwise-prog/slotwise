begin;

-- Opt-in capacity configuration. Only Xtreme Stepper is configured here;
-- businesses and services without this map retain the existing behavior.
update public.businesses
set feature_flags = jsonb_set(
  coalesce(feature_flags, '{}'::jsonb),
  '{service_capacities}',
  coalesce(feature_flags->'service_capacities', '{}'::jsonb)
    || jsonb_build_object('XTREME STEPPER - SESSION', 16),
  true
)
where slug = 'xtreme-dancers-studio';

create or replace function public.get_public_booking_capacity(
  business_slug_value text,
  service_value text,
  booking_date_value text,
  slot_value text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  target_business public.businesses;
  max_capacity integer;
  booked_count integer;
begin
  select * into target_business from public.businesses where slug = business_slug_value limit 1;
  max_capacity := nullif(target_business.feature_flags->'service_capacities'->>service_value, '')::integer;
  if max_capacity is null or max_capacity < 1 then
    return jsonb_build_object('capacity', null, 'booked', 0, 'remaining', null, 'fully_booked', false);
  end if;

  select count(*)::integer into booked_count
  from public.bookings
  where business_slug = business_slug_value
    and service = service_value
    and booking_date = booking_date_value
    and slot = slot_value
    and upper(coalesce(status, 'PENDING')) not in ('CANCELLED', 'REJECTED');

  return jsonb_build_object('capacity', max_capacity, 'booked', booked_count,
    'remaining', greatest(max_capacity - booked_count, 0),
    'fully_booked', booked_count >= max_capacity);
end;
$$;

revoke all on function public.get_public_booking_capacity(text, text, text, text) from public;
grant execute on function public.get_public_booking_capacity(text, text, text, text) to anon, authenticated;

create or replace function public.submit_public_booking(booking_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_booking public.bookings;
  raw_token text;
  target_business public.businesses;
  max_capacity integer;
  booked_count integer;
  capacity_key text;
  customer_email text;
begin
  if not public.can_accept_public_bookings(booking_payload->>'business_slug') then
    raise exception 'This business is not accepting public bookings.' using errcode = '42501';
  end if;

  customer_email := nullif(trim(coalesce(
    booking_payload->'metadata'->>'customer_email',
    booking_payload->'metadata'->>'traveler_email', ''
  )), '');
  if customer_email is null or customer_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'A valid customer email address is required.';
  end if;

  select * into target_business from public.businesses
  where slug = booking_payload->>'business_slug' limit 1;
  capacity_key := booking_payload->>'service';
  max_capacity := nullif(target_business.feature_flags->'service_capacities'->>capacity_key, '')::integer;

  if max_capacity is not null and max_capacity > 0 then
    -- Serialize competing submissions for this exact business/service/schedule.
    perform pg_advisory_xact_lock(hashtextextended(
      concat_ws('|', booking_payload->>'business_slug', capacity_key,
        booking_payload->>'booking_date', booking_payload->>'slot'), 0));
    select count(*)::integer into booked_count
    from public.bookings
    where business_slug = booking_payload->>'business_slug'
      and service = capacity_key
      and booking_date = booking_payload->>'booking_date'
      and slot = booking_payload->>'slot'
      and upper(coalesce(status, 'PENDING')) not in ('CANCELLED', 'REJECTED');
    if booked_count >= max_capacity then
      raise exception 'This class is fully booked. Please choose another schedule.' using errcode = 'P0001';
    end if;
  end if;

  raw_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.bookings (
    id, customer, contact, business, business_slug, service, booking_date,
    slot, note, metadata, status, estimated_total, public_possession_token_hash
  ) values (
    booking_payload->>'id', booking_payload->>'customer', booking_payload->>'contact',
    booking_payload->>'business', booking_payload->>'business_slug', booking_payload->>'service',
    booking_payload->>'booking_date', booking_payload->>'slot', booking_payload->>'note',
    coalesce(booking_payload->'metadata', '{}'::jsonb)
      || jsonb_build_object('source', coalesce(booking_payload->'metadata'->>'source', 'online'),
        'test_booking', exists (select 1 from public.businesses where slug = booking_payload->>'business_slug' and upper(status) = 'DEMO')),
    'PENDING', nullif(booking_payload->>'estimated_total', '')::numeric,
    encode(extensions.digest(raw_token::text, 'sha256'::text), 'hex')
  ) returning * into saved_booking;
  return (to_jsonb(saved_booking) - 'public_possession_token_hash')
    || jsonb_build_object('public_possession_token', raw_token);
end;
$$;

revoke all on function public.submit_public_booking(jsonb) from public;
grant execute on function public.submit_public_booking(jsonb) to anon, authenticated;
commit;
