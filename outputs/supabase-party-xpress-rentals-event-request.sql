begin;

insert into public.businesses (
  slug,
  business,
  industry,
  booking_link,
  status,
  business_package,
  business_type,
  booking_mode,
  booking_template,
  phone,
  messenger_link,
  address,
  description,
  primary_color,
  accent_color,
  page_background_color,
  page_background_type,
  logo_url,
  feature_flags
) values (
  'party-xpress-rentals',
  'Party Xpress Rentals',
  'Party Rentals',
  '/party-xpress-rentals',
  'Active',
  'PRO',
  'Party Rentals',
  'booking',
  'GENERAL',
  '',
  '',
  '',
  'Party rental booking requests for events, inflatables, snacks, and add-ons.',
  '#cf2e2e',
  '#fff1b8',
  '#ffffff',
  'SOLID',
  '/party-xpress-logo.png',
  jsonb_build_object(
    'bookingEnabled', true,
    'inquiryEnabled', true,
    'showPrices', true,
    'requireDate', true,
    'requireTime', true,
    'requireAddress', true,
    'clientAdminEnabled', true,
    'customerListEnabled', true,
    'analyticsEnabled', true,
    'staffSelectionEnabled', false,
    'allowMultipleServices', true
  )
)
on conflict (slug) do update set
  business = excluded.business,
  industry = excluded.industry,
  booking_link = excluded.booking_link,
  status = excluded.status,
  business_type = excluded.business_type,
  booking_mode = excluded.booking_mode,
  booking_template = excluded.booking_template,
  description = excluded.description,
  primary_color = excluded.primary_color,
  accent_color = excluded.accent_color,
  page_background_color = excluded.page_background_color,
  page_background_type = excluded.page_background_type,
  logo_url = excluded.logo_url,
  business_package = 'PRO',
  feature_flags = coalesce(public.businesses.feature_flags, '{}'::jsonb) || excluded.feature_flags;

insert into public.business_services (
  id,
  business_slug,
  name,
  description,
  duration_minutes,
  price,
  pricing_type,
  pricing_unit,
  display_order,
  status
) values
  ('party-xpress-inflatables', 'party-xpress-rentals', 'Inflatables', 'Inflatable rental options for parties and events.', null, null, 'FIXED', 'FLAT', 0, 'Active'),
  ('party-xpress-snacks', 'party-xpress-rentals', 'Snacks', 'Snack add-ons for party packages and event setups.', null, null, 'FIXED', 'FLAT', 1, 'Active')
on conflict (id) do update set
  business_slug = excluded.business_slug,
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  pricing_type = excluded.pricing_type,
  pricing_unit = excluded.pricing_unit,
  display_order = excluded.display_order,
  status = excluded.status;

insert into public.business_availability (
  id,
  business_slug,
  open_days,
  open_hours,
  slots,
  status
) values (
  'party-xpress-rentals-availability',
  'party-xpress-rentals',
  'Monday to Sunday',
  'Open 24/7',
  '[]'::jsonb,
  'Active'
)
on conflict (id) do update set
  business_slug = excluded.business_slug,
  open_days = excluded.open_days,
  open_hours = excluded.open_hours,
  slots = excluded.slots,
  status = excluded.status;

commit;
