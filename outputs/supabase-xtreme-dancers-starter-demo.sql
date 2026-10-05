-- XTREME DANCERS STUDIO - Starter test demo only.
-- Run in the Slotwise Supabase SQL Editor after deploying the matching Slotwise source.
-- This provisions only this demo business, its 3 sample services, and sample time slots.
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
  description,
  primary_color,
  accent_color,
  page_background_color,
  page_background_type,
  demo_started_at,
  demo_expires_at,
  feature_flags
) values (
  'xtreme-dancers-studio',
  'XTREME DANCERS STUDIO',
  'Dance Class / Dance Studio',
  '/xtreme-dancers-studio',
  'DEMO',
  'STARTER',
  'Dance Class / Dance Studio',
  'booking',
  'GENERAL',
  '0995 624 4174',
  'Book a sample dance session online. Demo services and class times are for testing only.',
  '#171B19',
  '#C9F45A',
  '#F3F5F2',
  'SOLID',
  now(),
  now() + interval '24 hours',
  jsonb_build_object(
    'bookingEnabled', true,
    'inquiryEnabled', false,
    'showPrices', true,
    'requireDate', true,
    'requireTime', true,
    'requireAddress', false,
    'clientAdminEnabled', true,
    'customerListEnabled', false,
    'analyticsEnabled', false,
    'staffSelectionEnabled', false,
    'allowMultipleServices', false,
    'localDemoOnly', false,
    'primaryEmail', 'jaycrave14@gmail.com',
    'sampleServiceNotice', 'TEST DEMO: Sample classes, prices, and times are shown for testing only. Final schedules and services will be confirmed if activated.'
  )
)
on conflict (slug) do update set
  business = excluded.business,
  industry = excluded.industry,
  booking_link = excluded.booking_link,
  status = 'DEMO',
  business_package = 'STARTER',
  business_type = excluded.business_type,
  booking_mode = excluded.booking_mode,
  booking_template = 'GENERAL',
  phone = excluded.phone,
  description = excluded.description,
  primary_color = excluded.primary_color,
  accent_color = excluded.accent_color,
  page_background_color = excluded.page_background_color,
  page_background_type = excluded.page_background_type,
  demo_started_at = coalesce(public.businesses.demo_started_at, excluded.demo_started_at),
  demo_expires_at = coalesce(public.businesses.demo_expires_at, excluded.demo_expires_at),
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
  (
    'xtreme-dancers-stepper',
    'xtreme-dancers-studio',
    'XTREME STEPPER',
    'High-energy dance fitness session for participants who want a fun and active workout.',
    60,
    350,
    'FIXED',
    'FLAT',
    0,
    'Active'
  ),
  (
    'xtreme-dancers-weekend-class',
    'xtreme-dancers-studio',
    'WEEKEND DANCE CLASS',
    'Weekend dance class for students who want to learn, move, and enjoy structured dance sessions.',
    60,
    300,
    'FIXED',
    'FLAT',
    1,
    'Active'
  ),
  (
    'xtreme-dancers-private-class',
    'xtreme-dancers-studio',
    'PRIVATE CLASS',
    'Private 1-on-1 dance class with a 1 hour and 30 minute session.',
    90,
    500,
    'FIXED',
    'FLAT',
    2,
    'Active'
  )
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  pricing_type = excluded.pricing_type,
  pricing_unit = excluded.pricing_unit,
  display_order = excluded.display_order,
  status = excluded.status
where public.business_services.business_slug = 'xtreme-dancers-studio';

insert into public.business_availability (
  id,
  business_slug,
  open_days,
  open_hours,
  slots,
  status
) values (
  'xtreme-dancers-studio-demo-availability',
  'xtreme-dancers-studio',
  'Monday to Sunday',
  'Sample demo times only',
  '["10:00 AM", "1:00 PM", "4:00 PM"]'::jsonb,
  'Active'
)
on conflict (id) do update set
  open_days = excluded.open_days,
  open_hours = excluded.open_hours,
  slots = excluded.slots,
  status = excluded.status
where public.business_availability.business_slug = 'xtreme-dancers-studio';

commit;

-- Verify the provisioned demo without writing additional data.
select slug, business, status, business_package, demo_expires_at
from public.businesses
where slug = 'xtreme-dancers-studio';

select id, name, price, pricing_type, duration_minutes, status
from public.business_services
where business_slug = 'xtreme-dancers-studio'
order by display_order;

select business_slug, open_days, open_hours, slots, status
from public.business_availability
where business_slug = 'xtreme-dancers-studio';
