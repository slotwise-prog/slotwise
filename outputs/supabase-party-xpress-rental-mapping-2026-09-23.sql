-- Party Xpress catalog-to-Slotwise service mapping.
-- Run this in the production Slotwise Supabase SQL Editor.
-- Existing Inflatables and Snacks rows are preserved; these are the expanded rental rows.
begin;

do $$
begin
  if not exists (select 1 from public.businesses where slug = 'party-xpress-rentals') then
    raise exception 'Party Xpress business row is missing.';
  end if;
end $$;

with rentals(id, name, price, display_order) as (
  values
    ('party-xpress-pink-and-blue-castle', 'Pink and Blue Castle', 2000::numeric, 10),
    ('party-xpress-cocomelon-bounce-house', 'Cocomelon Bounce House', 2500::numeric, 11),
    ('party-xpress-white-bounce-house', 'White Bounce House', 2500::numeric, 12),
    ('party-xpress-red-and-blue-castle-slides', 'Red and Blue Castle Slides', null::numeric, 13),
    ('party-xpress-peppa-pig-bounce-house', 'Peppa Pig Bounce House', 2500::numeric, 14),
    ('party-xpress-orange-and-blue-castle', 'Orange and Blue Castle', null::numeric, 15),
    ('party-xpress-unicorn-bounce-house-and-slide', 'Unicorn Bounce House and Slide', 2000::numeric, 16),
    ('party-xpress-dinosaur-bounce-house-and-slide', 'Dinosaur Bounce House and Slide', 2000::numeric, 17),
    ('party-xpress-purple-and-green-water-slide', 'Purple and Green Water Slide', null::numeric, 18),
    ('party-xpress-white-castle-ball-pit', 'White Castle Ball Pit', null::numeric, 19),
    ('party-xpress-yellow-and-blue-bounce-house', 'Yellow and Blue Bounce House', null::numeric, 20),
    ('party-xpress-truck-bounce-house', 'Truck Bounce House', 2000::numeric, 21),
    ('party-xpress-yellow-and-red-inflatable-slide', 'Yellow and Red Inflatable Slide', null::numeric, 22),
    ('party-xpress-shark-head-inflatable-picture-taking', 'Shark Head Inflatable — Picture Taking', 1000::numeric, 23)
)
insert into public.business_services (
  id, business_slug, name, price, pricing_type, pricing_unit,
  service_category, description, display_order, status
)
select
  r.id,
  'party-xpress-rentals',
  r.name,
  r.price,
  'FIXED',
  'FLAT',
  'Inflatables',
  'Party Xpress rental catalog item.',
  r.display_order,
  'Active'
from rentals r
on conflict (id) do update set
  business_slug = excluded.business_slug,
  name = excluded.name,
  price = excluded.price,
  pricing_type = excluded.pricing_type,
  pricing_unit = excluded.pricing_unit,
  service_category = excluded.service_category,
  description = excluded.description,
  display_order = excluded.display_order,
  status = excluded.status
where public.business_services.business_slug = 'party-xpress-rentals';

commit;

-- Verify the mapping required by the failed request.
select id, business_slug, name, price, pricing_type, status, display_order
from public.business_services
where business_slug = 'party-xpress-rentals'
  and service_category = 'Inflatables'
order by display_order;
