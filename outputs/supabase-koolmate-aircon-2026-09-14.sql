-- Run once in the Slotwise production Supabase SQL editor.
-- Reuses businesses/business_services; does not create users, policies, or another booking system.
begin;

do $$
declare existing_rule text;
begin
  if exists (select 1 from public.businesses b where b.business ilike '%koolmate%' and b.slug <> 'koolmate-aircon-services') then
    raise exception 'KOOLMATE already exists under another slug. Reconcile that record before running this setup; no duplicate was created.';
  end if;
  if exists (select 1 from public.businesses b where b.slug = 'koolmate-aircon-services' and b.business not ilike '%koolmate%') then
    raise exception 'The intended slug belongs to another business. Setup stopped.';
  end if;
  select pg_get_expr(c.conbin, c.conrelid) into existing_rule
  from pg_constraint c
  where c.conrelid = 'public.businesses'::regclass and c.conname = 'businesses_booking_template_allowed';
  if existing_rule is not null and position('AIRCON_SERVICES' in existing_rule) = 0 then
    alter table public.businesses drop constraint businesses_booking_template_allowed;
    execute format('alter table public.businesses add constraint businesses_booking_template_allowed check ((%s) or booking_template = %L)', existing_rule, 'AIRCON_SERVICES');
  elsif existing_rule is null then
    alter table public.businesses add constraint businesses_booking_template_allowed
      check (booking_template in ('GENERAL','BEAUTY','CLINIC','OPTICAL_CLINIC','HEALTH_WELLNESS','REAL_ESTATE','PEST_CONTROL','PROFESSIONAL_SERVICES','HOME_SERVICE','AUTO','CAR_WASH','LAUNDRY','TOURS_TRAVEL','STAYCATION_ACCOMMODATION','AIRCON_SERVICES'));
  end if;
end;
$$;

insert into public.businesses (slug, business, industry, booking_link, logo_url, cover_url, phone, address,
  messenger_link, description, business_type, booking_mode, booking_template, business_package, status,
  primary_color, accent_color, page_background_color, feature_flags)
values ('koolmate-aircon-services', 'KOOLMATE Air-Conditioning Services and Maintenance', 'Aircon Services / HVAC',
  '/koolmate-aircon-services', '/koolmate-logo.png', '/koolmate-hero.png', '0993-551-5531',
  '244 Mikas Street, Real 1, Bacoor, Cavite, Philippines, 4102', 'https://m.me/61591997337938',
  'Professional air-conditioning service for a cooler, cleaner, and more energy-efficient home or business.',
  'Aircon Services', 'booking', 'AIRCON_SERVICES', 'PRO', 'ACTIVE', '#0676FF', '#FFD21F', '#F4F8FF',
  '{"primaryEmail":"koolmateadmin070826@gmail.com","website":"https://koolmate.netlify.app/"}'::jsonb)
on conflict (slug) do update set booking_template = 'AIRCON_SERVICES', business_package = 'PRO';

-- Existing nonempty values take precedence over seed display configuration.
update public.businesses b set feature_flags =
  '{"airconBrandName":"KOOLMATE","airconTagline":"Cooler Air.\nCleaner Comfort.\nSmarter Savings.","airconBrandLine":"Choose KOOLMATE!","airconServiceAreas":["Bacoor / Cavite","San Mateo / Rizal","Nearby / Other Area"],"primaryEmail":"koolmateadmin070826@gmail.com","website":"https://koolmate.netlify.app/","airconServiceOptions":{
    "koolmate-installation-labor":{"installation":"Labor Only","unitType":"Split Type"},
    "koolmate-installation-1-2hp":{"installation":"Labor + Materials","unitType":"Split Type","capacity":"1HP to 2HP"},
    "koolmate-installation-2-3hp":{"installation":"Labor + Materials","unitType":"Split Type","capacity":"2.5HP to 3HP"},
    "koolmate-floor-mounted":{"installation":"Labor + Materials","unitType":"Floor Mounted"},
    "koolmate-ceiling-suspended":{"installation":"Labor + Materials","unitType":"Ceiling Suspended"},
    "koolmate-ceiling-cassette":{"installation":"Labor + Materials","unitType":"Ceiling Cassette"},
    "koolmate-cleaning-split":{"unitType":"Split Type","perUnit":true},
    "koolmate-cleaning-window":{"unitType":"Window Type"},
    "koolmate-cleaning-inverter":{"unitType":"Window Type Inverter"},
    "koolmate-cleaning-compact":{"unitType":"U-Shape / Compact"},
    "koolmate-cleaning-pulldown":{"unitType":"Pulldown"},
    "koolmate-relocation":{"relocation":true}
  }}'::jsonb || coalesce(b.feature_flags, '{}'::jsonb)
where b.slug = 'koolmate-aircon-services';

-- Seed only missing service names. Never replace staff-managed pricing or IDs.
with supplied(id, name, price, category, display_order) as (values
 ('koolmate-installation-labor', 'Installation Labor Only', 4500::numeric, 'Installation', 0),
 ('koolmate-installation-1-2hp', 'Installation Labor + Materials - 1HP to 2HP', 7500, 'Installation', 1),
 ('koolmate-installation-2-3hp', 'Installation Labor + Materials - 2.5HP to 3HP', 8500, 'Installation', 2),
 ('koolmate-floor-mounted', 'Floor Mounted Installation', 14500, 'Installation', 3),
 ('koolmate-ceiling-suspended', 'Ceiling Suspended Installation', 14500, 'Installation', 4),
 ('koolmate-ceiling-cassette', 'Ceiling Cassette Installation', 14500, 'Installation', 5),
 ('koolmate-cleaning-split', 'Cleaning - Split Type', 1000, 'Cleaning', 6),
 ('koolmate-cleaning-window', 'Cleaning - Window Type', 600, 'Cleaning', 7),
 ('koolmate-cleaning-inverter', 'Cleaning - Window Type Inverter', 700, 'Cleaning', 8),
 ('koolmate-cleaning-compact', 'Cleaning - U-Shape / Compact', 1200, 'Cleaning', 9),
 ('koolmate-cleaning-pulldown', 'Pulldown Cleaning', 3500, 'Cleaning', 10),
 ('koolmate-system-reprocess', 'System Reprocess', 5500, 'Repair & Maintenance', 11),
 ('koolmate-relocation', 'Relocation', 6500, 'Repair & Maintenance', 12),
 ('koolmate-dismantling', 'Dismantling', 600, 'Repair & Maintenance', 13),
 ('koolmate-refrigerant', 'Charging Refrigerant', 3500, 'Repair & Maintenance', 14),
 ('koolmate-checkup', 'Check-up', 500, 'Repair & Maintenance', 15),
 ('koolmate-sales', 'Aircon Sales / Unit Recommendation', null, 'Aircon Sales / Quote', 16)
)
insert into public.business_services (id, business_slug, name, price, pricing_type, pricing_unit, service_category, description, display_order, status)
select s.id, 'koolmate-aircon-services', s.name, s.price,
  'FIXED', 'FLAT', s.category, '', s.display_order, 'Active'
from supplied s
where not exists (select 1 from public.business_services actual where actual.business_slug = 'koolmate-aircon-services' and lower(actual.name) = lower(s.name))
on conflict (id) do nothing;

-- No business hours were supplied. Do not invent slots or overwrite existing availability.
insert into public.business_availability (id, business_slug, open_days, open_hours, slots, status)
select 'koolmate-availability', 'koolmate-aircon-services', '', '', '[]'::jsonb, 'Active'
where not exists (select 1 from public.business_availability a where a.business_slug = 'koolmate-aircon-services');

commit;

select b.slug, b.business_package, b.booking_template, b.status,
  (select count(*) from public.business_services s where s.business_slug = b.slug) as service_count
from public.businesses b where b.slug = 'koolmate-aircon-services';

-- Verify the seeded services using the canonical schema column names.
select id, business_slug, name as service, price, pricing_type, status,
  display_order as sort_order
from public.business_services
where business_slug = 'koolmate-aircon-services'
order by display_order;
