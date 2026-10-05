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
  business_type, booking_mode, booking_template, phone, messenger_link,
  description, primary_color, accent_color, page_background_color,
  page_background_type, feature_flags
) values (
  'inner-sparc-realty-corporation',
  'Inner SPARC Realty Corporation',
  'Real Estate',
  '/inner-sparc-realty-corporation',
  'ACTIVE',
  'STARTER',
  'Real Estate',
  'inquiry',
  'REAL_ESTATE',
  '0999-994-3304',
  '',
  'Send us your property inquiry and let our team assist you.',
  '#17324D',
  '#EEE7DA',
  '#F7F4EE',
  'SOLID',
  jsonb_build_object(
    'bookingEnabled', true,
    'inquiryEnabled', true,
    'showPrices', false,
    'requireDate', false,
    'requireTime', false,
    'requireAddress', true,
    'clientAdminEnabled', false,
    'customerListEnabled', false,
    'analyticsEnabled', false,
    'staffSelectionEnabled', false,
    'allowMultipleServices', false,
    'primaryEmail', 'libacaoga@gmail.com'
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
  description = excluded.description,
  primary_color = excluded.primary_color,
  accent_color = excluded.accent_color,
  page_background_color = excluded.page_background_color,
  page_background_type = excluded.page_background_type,
  feature_flags = coalesce(public.businesses.feature_flags, '{}'::jsonb) || excluded.feature_flags;

commit;
