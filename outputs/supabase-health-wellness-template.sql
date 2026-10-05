begin;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'businesses_booking_template_allowed') then
    alter table public.businesses drop constraint businesses_booking_template_allowed;
  end if;

  alter table public.businesses add constraint businesses_booking_template_allowed
  check (booking_template in (
    'GENERAL', 'BEAUTY', 'CLINIC', 'HEALTH_WELLNESS', 'REAL_ESTATE', 'PEST_CONTROL', 'PROFESSIONAL_SERVICES',
    'HOME_SERVICE', 'AUTO', 'CAR_WASH', 'LAUNDRY', 'TOURS_TRAVEL',
    'STAYCATION_ACCOMMODATION'
  )) not valid;
end $$;

insert into public.businesses (
  slug, business, industry, booking_link, status, business_package,
  business_type, booking_mode, booking_template, phone, messenger_link,
  description, primary_color, accent_color, page_background_color,
  page_background_type, feature_flags
) values (
  'the-vitality-collective',
  'The Vitality Collective',
  'Health & Wellness',
  '/the-vitality-collective',
  'ACTIVE',
  'BUSINESS',
  'Health & Wellness',
  'inquiry',
  'HEALTH_WELLNESS',
  '09926377497',
  '',
  'Explore thoughtfully selected wellness options designed to fit into your everyday routine.',
  '#5B3FD3',
  '#F8DCEB',
  '#FCFAFD',
  'SOLID',
  jsonb_build_object(
    'bookingEnabled', true,
    'inquiryEnabled', true,
    'showPrices', true,
    'requireDate', false,
    'requireTime', false,
    'clientAdminEnabled', true,
    'customerListEnabled', true,
    'analyticsEnabled', false,
    'staffSelectionEnabled', false,
    'allowMultipleServices', false,
    'primaryEmail', 'chin.nnej02@gmail.com',
    'wellnessHeroEyebrow', 'EVERYDAY WELLNESS',
    'wellnessHeroTitle', 'Find Your Everyday Balance',
    'wellnessFooterTagline', 'Wellness made simpler for everyday life.'
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

insert into public.business_services (
  id, business_slug, name, description, price, pricing_type,
  pricing_unit, display_order, status
) values
  ('vitality-daily-balance-15', 'the-vitality-collective', 'Daily Balance 15', 'A simple wellness option for an everyday routine.', 1949, 'FIXED', 'FLAT', 0, 'Active'),
  ('vitality-daily-balance-30', 'the-vitality-collective', 'Daily Balance 30', 'A practical wellness option for consistent everyday use.', 3249, 'FIXED', 'FLAT', 1, 'Active'),
  ('vitality-daily-balance-60', 'the-vitality-collective', 'Daily Balance 60', 'A longer-lasting option for your regular wellness routine.', 4250, 'FIXED', 'FLAT', 2, 'Active'),
  ('vitality-metabolic-support-plus', 'the-vitality-collective', 'Metabolic Support Plus', 'Thoughtfully selected support for an active wellness lifestyle.', 4099, 'FIXED', 'FLAT', 3, 'Active'),
  ('vitality-appetite-balance', 'the-vitality-collective', 'Appetite Balance', 'A wellness option designed to complement a mindful daily routine.', 2250, 'FIXED', 'FLAT', 4, 'Active')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  pricing_type = excluded.pricing_type,
  pricing_unit = excluded.pricing_unit,
  display_order = excluded.display_order,
  status = excluded.status;

insert into public.business_availability (id, business_slug, open_days, open_hours, slots, status)
values ('vitality-availability', 'the-vitality-collective', 'Monday to Sunday', '8:00 AM to 5:00 PM', '[]'::jsonb, 'Active')
on conflict (id) do update set
  open_days = excluded.open_days,
  open_hours = excluded.open_hours,
  slots = excluded.slots,
  status = excluded.status;

commit;
