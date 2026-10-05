-- Public booking eligibility: ACTIVE and DEMO (unless the configured demo has expired).
-- UNPAID and SUSPENDED remain blocked. No RLS read/update/delete policies are changed.
begin;

create or replace function public.can_accept_public_bookings(target_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses
    where slug = target_slug
      and (
        upper(status) = 'ACTIVE'
        or (
          upper(status) = 'DEMO'
          and (demo_expires_at is null or now() < demo_expires_at)
        )
      )
  );
$$;

grant execute on function public.can_accept_public_bookings(text) to anon, authenticated;

create or replace function public.normalize_booking_item_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  service_row public.business_services%rowtype;
  pax numeric;
  tier jsonb;
  included_guest_count numeric;
  extra_guest_count numeric;
  nightly_extra_fee numeric;
begin
  if not public.can_accept_public_bookings(new.business_slug) then
    raise exception 'Booking items can only be saved for businesses accepting public bookings.';
  end if;

  if not exists (
    select 1 from public.bookings
    where bookings.id = new.booking_id
      and bookings.business_slug = new.business_slug
  ) then
    raise exception 'Booking item does not match an existing booking.';
  end if;

  select * into service_row
  from public.business_services
  where business_slug = new.business_slug
    and status <> 'Inactive'
    and (
      (new.service_id is not null and id = new.service_id)
      or (new.service_id is null and name = new.service_name_snapshot)
    )
  order by display_order asc
  limit 1;

  if service_row.id is null then
    raise exception 'Selected service is not available.';
  end if;

  pax := greatest(coalesce(new.quantity, 1), 1);
  new.service_id := service_row.id;
  new.service_name_snapshot := service_row.name;
  new.pricing_type_snapshot := coalesce(service_row.pricing_type, 'FIXED');
  new.quantity := case
    when new.pricing_type_snapshot in ('PER_PAX', 'PER_DAY') then pax
    else 1
  end;

  if (service_row.price is null or service_row.price <= 0)
     and new.pricing_type_snapshot not in ('GROUP_TIER', 'CUSTOM_INQUIRY', 'IMAGE_BASED_PRICING') then
    new.pricing_type_snapshot := 'CUSTOM_INQUIRY';
  end if;

  if new.pricing_type_snapshot = 'GROUP_TIER'
     and jsonb_array_length(coalesce(service_row.pricing_tiers, '[]'::jsonb)) = 0 then
    new.pricing_type_snapshot := 'CUSTOM_INQUIRY';
  end if;

  if new.pricing_type_snapshot in ('CUSTOM_INQUIRY', 'IMAGE_BASED_PRICING') then
    new.unit_price_snapshot := null;
    new.line_total := null;
    new.quantity := 1;
    return new;
  end if;

  if new.pricing_type_snapshot = 'GROUP_TIER' then
    select item into tier
    from jsonb_array_elements(coalesce(service_row.pricing_tiers, '[]'::jsonb)) item
    where pax >= (item->>'minGuests')::numeric
      and pax <= (item->>'maxGuests')::numeric
    order by (item->>'minGuests')::numeric asc
    limit 1;
    if tier is null then
      raise exception 'No group pricing tier matches this guest count.';
    end if;
    new.unit_price_snapshot := (tier->>'price')::numeric;
    new.selected_tier_snapshot := tier;
    new.line_total := (tier->>'price')::numeric;
    new.quantity := pax;
  elsif new.pricing_type_snapshot = 'PER_NIGHT' then
    included_guest_count := greatest(coalesce(service_row.included_guests, service_row.max_guests, 1), 1);
    extra_guest_count := greatest(coalesce((new.selected_tier_snapshot->>'totalGuests')::numeric, included_guest_count) - included_guest_count, 0);
    nightly_extra_fee := coalesce(service_row.extra_guest_fee, 0);
    new.unit_price_snapshot := service_row.price;
    new.line_total := (service_row.price * pax) + (nightly_extra_fee * extra_guest_count * pax);
    new.selected_tier_snapshot := jsonb_build_object(
      'nights', pax,
      'totalGuests', coalesce((new.selected_tier_snapshot->>'totalGuests')::numeric, included_guest_count),
      'includedGuests', included_guest_count,
      'extraGuests', extra_guest_count,
      'extraGuestFee', nightly_extra_fee
    );
  elsif new.pricing_type_snapshot in ('PER_PAX', 'PER_DAY') then
    new.unit_price_snapshot := service_row.price;
    new.line_total := service_row.price * pax;
  else
    new.unit_price_snapshot := service_row.price;
    new.line_total := service_row.price;
    new.quantity := 1;
  end if;
  return new;
end;
$$;

create or replace function public.submit_public_booking(booking_payload jsonb)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare saved_booking public.bookings;
begin
  if not public.can_accept_public_bookings(booking_payload->>'business_slug') then
    raise exception 'This business is not accepting public bookings.' using errcode = '42501';
  end if;
  insert into public.bookings (
    id, customer, contact, business, business_slug, service, booking_date, slot,
    note, metadata, status, estimated_total
  ) values (
    booking_payload->>'id',
    booking_payload->>'customer',
    booking_payload->>'contact',
    booking_payload->>'business',
    booking_payload->>'business_slug',
    booking_payload->>'service',
    booking_payload->>'booking_date',
    booking_payload->>'slot',
    booking_payload->>'note',
    coalesce(booking_payload->'metadata', '{}'::jsonb)
      || jsonb_build_object(
        'source', coalesce(booking_payload->'metadata'->>'source', 'online'),
        'test_booking', exists (
          select 1 from public.businesses
          where slug = booking_payload->>'business_slug'
            and upper(status) = 'DEMO'
        )
      ),
    'PENDING',
    nullif(booking_payload->>'estimated_total', '')::numeric
  ) returning * into saved_booking;
  return saved_booking;
end;
$$;

revoke all on function public.submit_public_booking(jsonb) from public;
grant execute on function public.submit_public_booking(jsonb) to anon, authenticated;

create or replace function public.submit_public_booking_items(
  booking_id_value text,
  business_slug_value text,
  items_payload jsonb
)
returns setof public.booking_items
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  saved_item public.booking_items;
begin
  if not public.can_accept_public_bookings(business_slug_value) then
    raise exception 'This business is not accepting public bookings.' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.bookings
    where id = booking_id_value and business_slug = business_slug_value
  ) then
    raise exception 'Booking was not found.';
  end if;
  for item in select * from jsonb_array_elements(coalesce(items_payload, '[]'::jsonb)) loop
    insert into public.booking_items (
      id, booking_id, business_slug, service_id, service_name_snapshot,
      pricing_type_snapshot, unit_price_snapshot, quantity, selected_tier_snapshot, line_total
    ) values (
      item->>'id', booking_id_value, business_slug_value, item->>'service_id',
      coalesce(item->>'service_name_snapshot', 'Service'),
      coalesce(item->>'pricing_type_snapshot', 'FIXED'),
      nullif(item->>'unit_price_snapshot', '')::numeric,
      coalesce((item->>'quantity')::numeric, 1),
      item->'selected_tier_snapshot',
      nullif(item->>'line_total', '')::numeric
    ) returning * into saved_item;
    return next saved_item;
  end loop;
end;
$$;

revoke all on function public.submit_public_booking_items(text, text, jsonb) from public;
grant execute on function public.submit_public_booking_items(text, text, jsonb) to anon, authenticated;

drop policy if exists "Allow public booking inserts" on public.bookings;
create policy "Allow public booking inserts"
on public.bookings for insert
with check (public.can_accept_public_bookings(bookings.business_slug));

drop policy if exists "Allow public booking item inserts" on public.booking_items;
create policy "Allow public booking item inserts"
on public.booking_items for insert
with check (public.can_accept_public_bookings(booking_items.business_slug));

commit;

-- Verify Xtreme's current production row after applying the migration.
select slug, status, demo_expires_at,
       public.can_accept_public_bookings(slug) as public_booking_allowed
from public.businesses
where slug = 'xtreme-dancers-studio';
