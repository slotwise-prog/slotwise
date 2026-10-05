begin;

insert into public.businesses (
  slug, business, industry, booking_link, status, business_package,
  business_type, booking_mode, booking_template, phone, messenger_link,
  description, primary_color, accent_color, page_background_color,
  page_background_type, logo_url, cover_url, feature_flags
) values (
  'the-facial-unlimited-ph',
  'The Facial Unlimited PH',
  'Aesthetic Beauty Clinic',
  '/the-facial-unlimited-ph',
  'ACTIVE',
  'PRO',
  'Aesthetic Beauty Clinic',
  'booking',
  'BEAUTY',
  '(0960) 822 5004',
  'https://www.facebook.com/profile.php?id=61592702334620',
  'Choose your preferred treatment and schedule your visit at a time that works for you.',
  '#3B3B91',
  '#F0EFFF',
  '#FAFAFF',
  'SOLID',
  '/facial-unlimited-logo.png',
  '/facial-unlimited-cover.png',
  jsonb_build_object(
    'bookingEnabled', true,
    'inquiryEnabled', true,
    'showPrices', true,
    'requireDate', true,
    'requireTime', true,
    'clientAdminEnabled', true,
    'customerListEnabled', true,
    'analyticsEnabled', true,
    'staffSelectionEnabled', false,
    'allowMultipleServices', false,
    'primaryEmail', 'tfucareer.philippines@gmail.com'
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
  logo_url = excluded.logo_url,
  cover_url = excluded.cover_url,
  feature_flags = coalesce(public.businesses.feature_flags, '{}'::jsonb) || excluded.feature_flags;

insert into public.business_services (
  id, business_slug, name, description, price, pricing_type,
  pricing_unit, display_order, status
) values
  ('facial-unlimited-service-slot-1', 'the-facial-unlimited-ph', 'Treatment Slot 1', '', null, 'FIXED', 'FLAT', 0, 'Active'),
  ('facial-unlimited-service-slot-2', 'the-facial-unlimited-ph', 'Treatment Slot 2', '', null, 'FIXED', 'FLAT', 1, 'Active'),
  ('facial-unlimited-service-slot-3', 'the-facial-unlimited-ph', 'Treatment Slot 3', '', null, 'FIXED', 'FLAT', 2, 'Active')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  pricing_type = excluded.pricing_type,
  pricing_unit = excluded.pricing_unit,
  display_order = excluded.display_order,
  status = excluded.status;

insert into public.business_availability (id, business_slug, open_days, open_hours, slots, status)
values (
  'facial-unlimited-availability',
  'the-facial-unlimited-ph',
  'Monday to Sunday',
  '9:00 AM to 6:00 PM',
  '["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"]'::jsonb,
  'Active'
)
on conflict (id) do update set
  open_days = excluded.open_days,
  open_hours = excluded.open_hours,
  slots = excluded.slots,
  status = excluded.status;

commit;
