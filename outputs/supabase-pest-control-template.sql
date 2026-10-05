begin;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'businesses_booking_template_allowed') then
    alter table public.businesses drop constraint businesses_booking_template_allowed;
  end if;

  alter table public.businesses add constraint businesses_booking_template_allowed
  check (booking_template in (
    'GENERAL', 'BEAUTY', 'CLINIC', 'HEALTH_WELLNESS', 'REAL_ESTATE', 'PEST_CONTROL',
    'PROFESSIONAL_SERVICES', 'HOME_SERVICE', 'AUTO', 'CAR_WASH', 'LAUNDRY',
    'TOURS_TRAVEL', 'STAYCATION_ACCOMMODATION'
  )) not valid;
end $$;

insert into public.businesses (
  slug, business, industry, booking_link, status, business_package,
  business_type, booking_mode, booking_template, phone, messenger_link, logo_url,
  description, primary_color, accent_color, page_background_color,
  page_background_type, feature_flags
) values (
  'dmonster-pest-control-services',
  'D’Monster Pest Control Services',
  'Pest Control',
  '/dmonster-pest-control-services',
  'ACTIVE',
  'STARTER',
  'Pest Control',
  'booking',
  'PEST_CONTROL',
  '09057024649',
  'https://www.facebook.com/share/19gzkn37Jn/',
  '/dmonster-logo.png',
  'Request pest control service for your home or business in just a few simple steps.',
  '#A51D24',
  '#F4E8E8',
  '#F5F5F4',
  'SOLID',
  jsonb_build_object(
    'bookingEnabled', true,
    'inquiryEnabled', true,
    'showPrices', false,
    'requireDate', true,
    'requireTime', true,
    'requireAddress', true,
    'clientAdminEnabled', false,
    'customerListEnabled', false,
    'analyticsEnabled', false,
    'staffSelectionEnabled', false,
    'allowMultipleServices', false,
    'primaryEmail', 'dmonsterpestcontrolservices@gmail.com'
  )
)
on conflict (slug) do update set
  business = excluded.business,
  industry = excluded.industry,
  booking_link = excluded.booking_link,
  status = excluded.status,
  business_package = excluded.business_package,
  business_type = excluded.business_type,
  booking_mode = excluded.booking_mode,
  booking_template = excluded.booking_template,
  phone = excluded.phone,
  messenger_link = excluded.messenger_link,
  logo_url = excluded.logo_url,
  description = excluded.description,
  primary_color = excluded.primary_color,
  accent_color = excluded.accent_color,
  page_background_color = excluded.page_background_color,
  page_background_type = excluded.page_background_type,
  feature_flags = coalesce(public.businesses.feature_flags, '{}'::jsonb) || excluded.feature_flags;

insert into public.business_services (
  id, business_slug, name, description, price, pricing_type, pricing_unit, display_order, status
) values
  ('dmonster-pest-general', 'dmonster-pest-control-services', 'General Pest Control', 'Including common pests such as rats, cockroaches, flies, and mosquitoes.', 3500, 'FIXED', 'FLAT', 0, 'Active'),
  ('dmonster-pest-termite', 'dmonster-pest-control-services', 'Termite Treatment', 'Termite treatment estimate based on property type, floors, and area.', 7500, 'FIXED', 'FLAT', 1, 'Active'),
  ('dmonster-pest-soil-poisoning', 'dmonster-pest-control-services', 'Soil Poisoning', 'Soil poisoning service priced by covered area.', 200, 'FIXED', 'FLAT', 2, 'Active'),
  ('dmonster-pest-reticulation', 'dmonster-pest-control-services', 'Reticulation System', 'Reticulation system installation priced by area.', 200, 'FIXED', 'FLAT', 3, 'Active')
on conflict (id) do update set
  business_slug = excluded.business_slug,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  pricing_type = excluded.pricing_type,
  pricing_unit = excluded.pricing_unit,
  display_order = excluded.display_order,
  status = excluded.status;

update public.business_services
set status = 'Inactive'
where business_slug = 'dmonster-pest-control-services'
  and id in (
    'dmonster-pest-cockroach',
    'dmonster-pest-rodent',
    'dmonster-pest-mosquito',
    'dmonster-pest-soil-reticulation',
    'dmonster-pest-other'
  );

insert into public.business_availability (id, business_slug, open_days, open_hours, slots, status)
values (
  'dmonster-pest-control-availability',
  'dmonster-pest-control-services',
  'Operate Any Time',
  'Open 24/7',
  '["9:30 AM", "10:15 AM", "1:00 PM", "3:30 PM"]'::jsonb,
  'Active'
)
on conflict (id) do update set
  open_days = excluded.open_days,
  open_hours = excluded.open_hours,
  slots = excluded.slots,
  status = excluded.status;

commit;
