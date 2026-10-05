begin;

insert into public.business_services (
  id,
  business_slug,
  name,
  description,
  price,
  pricing_type,
  pricing_unit,
  display_order,
  status
) values
  ('facial-unlimited-service-slot-1', 'the-facial-unlimited-ph', 'Treatment Slot 1', '', null, 'FIXED', 'FLAT', 0, 'Active'),
  ('facial-unlimited-service-slot-2', 'the-facial-unlimited-ph', 'Treatment Slot 2', '', null, 'FIXED', 'FLAT', 1, 'Active'),
  ('facial-unlimited-service-slot-3', 'the-facial-unlimited-ph', 'Treatment Slot 3', '', null, 'FIXED', 'FLAT', 2, 'Active')
on conflict (id) do update set
  business_slug = excluded.business_slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  pricing_type = excluded.pricing_type,
  pricing_unit = excluded.pricing_unit,
  display_order = excluded.display_order,
  status = excluded.status;

commit;

select id, business_slug, name, price, pricing_type, pricing_unit, status
from public.business_services
where business_slug = 'the-facial-unlimited-ph'
order by display_order, name;
