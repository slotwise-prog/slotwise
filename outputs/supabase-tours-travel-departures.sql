begin;

alter table public.business_services
add column if not exists departures jsonb not null default '[]'::jsonb;

-- Preserve departures previously encoded inside pricing_tiers by earlier frontend builds.
update public.business_services service
set departures = legacy.departures
from (
  select id, jsonb_agg(jsonb_build_object(
    'id', coalesce(item->>'id', 'departure-' || ordinality::text),
    'startDate', coalesce(item->>'startDate', item->>'departureStart', item->>'departure_start'),
    'endDate', coalesce(item->>'endDate', item->>'departureEnd', item->>'departure_end', ''),
    'price', coalesce(item->'price', item->'departurePrice', item->'departure_price'),
    'pricingUnit', coalesce(item->>'pricingUnit', item->>'departurePricingUnit', item->>'departure_pricing_unit', 'PER_PAX'),
    'status', upper(coalesce(item->>'status', item->>'departureStatus', item->>'departure_status', 'AVAILABLE')),
    'notes', coalesce(item->>'notes', item->>'departureNotes', item->>'departure_notes', '')
  ) order by ordinality) as departures
  from public.business_services,
       jsonb_array_elements(coalesce(pricing_tiers, '[]'::jsonb)) with ordinality as rows(item, ordinality)
  where item->>'kind' = 'DEPARTURE'
     or item ? 'departureStart'
     or item ? 'departure_start'
  group by id
) legacy
where service.id = legacy.id
  and service.departures = '[]'::jsonb;

do $$
declare
  function_signature text;
begin
  for function_signature in
    select p.oid::regprocedure::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'upsert_client_service'
  loop
    execute format('drop function %s', function_signature);
  end loop;
end $$;

create function public.upsert_client_service(
  service_id text,
  target_slug text,
  service_name text,
  service_description text,
  service_price numeric,
  service_duration integer,
  service_status text,
  service_pricing_type text default 'FIXED',
  service_pricing_unit text default 'FLAT',
  service_pricing_tiers jsonb default '[]'::jsonb,
  service_display_order integer default 0,
  service_max_guests integer default null,
  service_included_guests integer default null,
  service_extra_guest_fee numeric default null,
  service_category text default '',
  service_image_url text default '',
  service_image_title text default '',
  service_image_caption text default '',
  service_unit_quantity integer default 1,
  service_departures jsonb default '[]'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.business_has_package_capability(target_slug, 'SERVICES') then
    raise exception 'This package cannot manage services.';
  end if;

  insert into business_services (
    id, business_slug, name, description, price, pricing_type, pricing_unit,
    pricing_tiers, departures, max_guests, included_guests, extra_guest_fee,
    service_category, image_url, image_title, image_caption, unit_quantity,
    duration_minutes, display_order, status
  ) values (
    service_id, target_slug, service_name, service_description, service_price,
    coalesce(service_pricing_type, 'FIXED'), coalesce(service_pricing_unit, 'FLAT'),
    coalesce(service_pricing_tiers, '[]'::jsonb), coalesce(service_departures, '[]'::jsonb),
    service_max_guests, service_included_guests, service_extra_guest_fee,
    coalesce(service_category, ''), coalesce(service_image_url, ''),
    coalesce(service_image_title, ''), coalesce(service_image_caption, ''),
    greatest(coalesce(service_unit_quantity, 1), 1), service_duration,
    coalesce(service_display_order, 0), service_status
  )
  on conflict (id) do update set
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    pricing_type = excluded.pricing_type,
    pricing_unit = excluded.pricing_unit,
    pricing_tiers = excluded.pricing_tiers,
    departures = excluded.departures,
    max_guests = excluded.max_guests,
    included_guests = excluded.included_guests,
    extra_guest_fee = excluded.extra_guest_fee,
    service_category = excluded.service_category,
    image_url = excluded.image_url,
    image_title = excluded.image_title,
    image_caption = excluded.image_caption,
    unit_quantity = excluded.unit_quantity,
    duration_minutes = excluded.duration_minutes,
    display_order = excluded.display_order,
    status = excluded.status
  where business_services.business_slug = target_slug;
end;
$$;

grant execute on function public.upsert_client_service(text, text, text, text, numeric, integer, text, text, text, jsonb, integer, integer, integer, numeric, text, text, text, text, integer, jsonb) to authenticated;

notify pgrst, 'reload schema';

commit;

select id, business_slug, name, departures
from public.business_services
where business_slug = 'phisavong-world-travel-and-tours'
  and name ilike '%Shanghai%';
