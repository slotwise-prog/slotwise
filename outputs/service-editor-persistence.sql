begin;

alter table public.business_services add column if not exists service_category text;
alter table public.business_services add column if not exists image_url text;
alter table public.business_services add column if not exists image_title text;
alter table public.business_services add column if not exists image_caption text;
alter table public.business_services add column if not exists display_order integer not null default 0;

do $$
declare
  function_signature text;
begin
  for function_signature in
    select p.oid::regprocedure::text
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'upsert_client_service'
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
  service_unit_quantity integer default 1
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

  insert into public.business_services (
    id, business_slug, name, description, price, pricing_type, pricing_unit,
    pricing_tiers, max_guests, included_guests, extra_guest_fee,
    service_category, image_url, image_title, image_caption, unit_quantity,
    duration_minutes, display_order, status
  )
  values (
    service_id, target_slug, service_name, service_description, service_price,
    coalesce(service_pricing_type, 'FIXED'),
    coalesce(service_pricing_unit, 'FLAT'),
    coalesce(service_pricing_tiers, '[]'::jsonb),
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
  where public.business_services.business_slug = target_slug;
end;
$$;

grant execute on function public.upsert_client_service(
  text, text, text, text, numeric, integer, text, text, text, jsonb,
  integer, integer, integer, numeric, text, text, text, text, integer
) to authenticated;

commit;
