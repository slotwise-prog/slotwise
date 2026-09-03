-- Allow quote-only travel/service inquiries to create booking items.
-- Numeric-price services continue to use the existing validation below.
create or replace function public.normalize_booking_item_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  service_row business_services%rowtype;
  pax numeric;
  tier jsonb;
  included_guest_count numeric;
  extra_guest_count numeric;
  nightly_extra_fee numeric;
begin
  if not exists (
    select 1 from businesses
    where businesses.slug = new.business_slug and upper(businesses.status) = 'ACTIVE'
  ) then
    raise exception 'Booking items can only be saved for active businesses.';
  end if;

  if not exists (
    select 1 from bookings
    where bookings.id = new.booking_id and bookings.business_slug = new.business_slug
  ) then
    raise exception 'Booking item does not match an existing booking.';
  end if;

  select * into service_row from business_services
  where business_slug = new.business_slug and status <> 'Inactive'
    and ((new.service_id is not null and id = new.service_id)
      or (new.service_id is null and name = new.service_name_snapshot))
  order by display_order asc limit 1;

  if service_row.id is null then
    raise exception 'Selected service is not available.';
  end if;

  pax := greatest(coalesce(new.quantity, 1), 1);
  new.service_id := service_row.id;
  new.service_name_snapshot := service_row.name;
  new.pricing_type_snapshot := coalesce(service_row.pricing_type, 'FIXED');
  new.quantity := case when new.pricing_type_snapshot in ('PER_PAX', 'PER_DAY') then pax else 1 end;

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
  elsif new.pricing_type_snapshot = 'GROUP_TIER' then
    select item into tier from jsonb_array_elements(coalesce(service_row.pricing_tiers, '[]'::jsonb)) item
    where pax >= (item->>'minGuests')::numeric and pax <= (item->>'maxGuests')::numeric
    order by (item->>'minGuests')::numeric asc limit 1;
    if tier is null then raise exception 'No group pricing tier matches this guest count.'; end if;
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
