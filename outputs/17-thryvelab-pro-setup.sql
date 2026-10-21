-- ThryveLab Slotwise PRO setup
-- Review and run manually in the authorized Slotwise Supabase project.
-- This script is idempotent, targets only slug `thryvelab`, and intentionally
-- leaves the business UNPAID until an authorized admin completes provisioning.

begin;

alter table public.businesses
  add column if not exists business_package text not null default 'STARTER';
alter table public.businesses
  add column if not exists business_type text;
alter table public.businesses
  add column if not exists booking_mode text default 'booking';
alter table public.businesses
  add column if not exists booking_template text not null default 'GENERAL';
alter table public.businesses
  add column if not exists phone text;
alter table public.businesses
  add column if not exists description text;
alter table public.businesses
  add column if not exists logo_url text;
alter table public.businesses
  add column if not exists primary_color text;
alter table public.businesses
  add column if not exists secondary_color text;
alter table public.businesses
  add column if not exists accent_color text;
alter table public.businesses
  add column if not exists page_background_color text;
alter table public.businesses
  add column if not exists text_color text;
alter table public.businesses
  add column if not exists feature_flags jsonb not null default '{}'::jsonb;

alter table public.business_services
  add column if not exists schedule jsonb not null default '{}'::jsonb;
alter table public.business_services
  add column if not exists pricing_type text not null default 'FIXED';
alter table public.business_services
  add column if not exists pricing_unit text not null default 'FLAT';
alter table public.business_services
  add column if not exists service_category text;
alter table public.business_services
  add column if not exists display_order integer not null default 0;
alter table public.business_services
  add column if not exists status text not null default 'Active';

insert into public.businesses (
  slug, business, industry, booking_link, status, business_package,
  business_type, booking_mode, booking_template, description, logo_url,
  primary_color, secondary_color, accent_color, page_background_color,
  text_color, feature_flags
) values (
  'thryvelab',
  'ThryveLab',
  'Fitness & Wellness Coaching',
  '/thryvelab',
  'UNPAID',
  'PRO',
  'Fitness & Wellness Coaching',
  'booking',
  'HEALTH_WELLNESS',
  'Personalized fitness and wellness coaching by Thelma Almonte Margate.',
  '/thryvelab-logo.png',
  '#198F83',
  '#8FD9CC',
  '#F5CF45',
  '#FFFFFF',
  '#183B43',
  jsonb_build_object(
    'bookingEnabled', true,
    'inquiryEnabled', false,
    'showPrices', true,
    'requireDate', true,
    'requireTime', true,
    'requireAddress', false,
    'allowMultipleServices', false,
    'paymentEnabled', false,
    'coachName', 'Thelma Almonte Margate',
    'currency', 'PHP',
    'timezone', 'Asia/Manila',
    'wellnessHeroEyebrow', 'PERSONALIZED COACHING',
    'wellnessHeroTitle', 'Small habits. Big results.',
    'wellnessFooterTagline', 'SMALL HABITS. BIG RESULTS.',
    'scheduleNeedsAdminConfig', true,
    'wowPersonalTrainingNeedsAdminConfig', true,
    'freeConsultationNeedsAdminConfig', true
  )
)
on conflict (slug) do update set
  business = excluded.business,
  industry = excluded.industry,
  booking_link = excluded.booking_link,
  -- Preserve an existing authorized lifecycle state; do not auto-activate.
  business_package = 'PRO',
  business_type = excluded.business_type,
  booking_mode = excluded.booking_mode,
  booking_template = excluded.booking_template,
  description = excluded.description,
  logo_url = excluded.logo_url,
  primary_color = excluded.primary_color,
  secondary_color = excluded.secondary_color,
  accent_color = excluded.accent_color,
  page_background_color = excluded.page_background_color,
  text_color = excluded.text_color,
  feature_flags = coalesce(public.businesses.feature_flags, '{}'::jsonb) || excluded.feature_flags;

insert into public.business_services (
  id, business_slug, name, description, duration_minutes, price,
  pricing_type, pricing_unit, schedule, service_category, display_order, status
) values
  ('thryvelab-thryvestart-7-days', 'thryvelab', 'ThryveStart - 7 Days', 'Group fitness package: 3 sessions over 7 days. Each class appointment is 30 minutes.', 30, 299, 'FIXED', 'FLAT', '{}'::jsonb, 'GROUP FITNESS', 1, 'Active'),
  ('thryvelab-thryvestart-2-weeks', 'thryvelab', 'ThryveStart - 2 Weeks', 'Group fitness package: 6 sessions over 2 weeks. Each class appointment is 30 minutes.', 30, 549, 'FIXED', 'FLAT', '{}'::jsonb, 'GROUP FITNESS', 2, 'Active'),
  ('thryvelab-thryveactive-4-weeks', 'thryvelab', 'ThryveActive - 4 Weeks', 'Group fitness package: 12 sessions over 4 weeks. Each class appointment is 30 minutes.', 30, 999, 'FIXED', 'FLAT', '{}'::jsonb, 'GROUP FITNESS', 3, 'Active'),
  ('thryvelab-thryvetransform-8-weeks', 'thryvelab', 'ThryveTransform - 8 Weeks', 'Group fitness package: 24 sessions over 8 weeks. Each class appointment is 30 minutes.', 30, 1799, 'FIXED', 'FLAT', '{}'::jsonb, 'GROUP FITNESS', 4, 'Active'),
  ('thryvelab-thryvecommit-12-weeks', 'thryvelab', 'ThryveCommit - 12 Weeks', 'Group fitness package: 36 sessions over 12 weeks. Each class appointment is 30 minutes.', 30, 2499, 'FIXED', 'FLAT', '{}'::jsonb, 'GROUP FITNESS', 5, 'Active'),
  ('thryvelab-wow-personal-training', 'thryvelab', 'WOW Personal Training', 'Personal-training package details, price, duration, and inclusions are pending administrator configuration.', null, null, 'FIXED', 'FLAT', '{}'::jsonb, 'WOW PERSONAL TRAINING', 6, 'Active'),
  ('thryvelab-free-wellness-consultation', 'thryvelab', 'Free Wellness Consultation', 'Free consultation. Duration and availability are pending administrator configuration.', null, 0, 'FIXED', 'FLAT', '{}'::jsonb, 'FREE WELLNESS CONSULTATION', 7, 'Active')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  pricing_type = excluded.pricing_type,
  pricing_unit = excluded.pricing_unit,
  service_category = excluded.service_category,
  display_order = excluded.display_order,
  status = excluded.status;

insert into public.business_availability (id, business_slug, open_days, open_hours, slots, status)
values (
  'thryvelab-availability',
  'thryvelab',
  'Schedule to be configured by admin',
  'Schedule to be configured by admin',
  '[]'::jsonb,
  'Inactive'
)
on conflict (id) do update set
  open_days = excluded.open_days,
  open_hours = excluded.open_hours,
  slots = excluded.slots,
  status = excluded.status;

commit;

select slug, business, status, business_package, booking_template, logo_url
from public.businesses
where slug = 'thryvelab';

select id, name, service_category, duration_minutes, price, status
from public.business_services
where business_slug = 'thryvelab'
order by display_order;
