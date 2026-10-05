-- XTREME DANCERS STUDIO PRO activation.
-- Run once in the Slotwise production Supabase SQL editor.
-- This reuses the existing slug and never creates a second business.
begin;

alter table public.business_services
  add column if not exists schedule jsonb not null default '{}'::jsonb;

update public.businesses
set
  business = 'XTREME DANCERS STUDIO',
  industry = 'Dance Class / Dance Studio',
  business_type = 'Dance Class / Dance Studio',
  status = 'ACTIVE',
  business_package = 'PRO',
  booking_template = 'GENERAL',
  phone = '0995 624 4174',
  description = 'Book your dance class, private session, or studio rental online.',
  primary_color = '#111514',
  accent_color = '#C9F45A',
  page_background_color = '#F3F5F2',
  page_background_type = 'SOLID',
  cover_url = '/xtreme-dancers-hero.png',
  feature_flags = coalesce(feature_flags, '{}'::jsonb) || jsonb_build_object(
    'bookingEnabled', true,
    'inquiryEnabled', false,
    'showPrices', true,
    'requireDate', true,
    'requireTime', true,
    'requireAddress', false,
    'primaryEmail', 'jaycrave14@gmail.com',
    'allowMultipleServices', false,
    'localDemoOnly', false,
    'paymentEnabled', true
  )
where slug = 'xtreme-dancers-studio';

insert into public.business_services (id, business_slug, name, description, duration_minutes, price, pricing_type, pricing_unit, schedule, display_order, status)
values
  ('xtreme-stepper-session', 'xtreme-dancers-studio', 'XTREME STEPPER - SESSION', 'Regular session: Monday to Friday 6:00 PM-7:30 PM; Saturday 5:00 PM-6:30 PM; Sunday 6:00 PM-7:30 PM.', 90, 350, 'FIXED', 'FLAT', '{"MONDAY":["6:00 PM"],"TUESDAY":["6:00 PM"],"WEDNESDAY":["6:00 PM"],"THURSDAY":["6:00 PM"],"FRIDAY":["6:00 PM"],"SATURDAY":["5:00 PM"],"SUNDAY":["6:00 PM"]}'::jsonb, 1, 'Active'),
  ('xtreme-stepper-monthly', 'xtreme-dancers-studio', 'XTREME STEPPER - MONTHLY (8 SESSIONS)', 'Monthly option: 8 sessions, twice per week.', null, 2500, 'FIXED', 'FLAT', '{}'::jsonb, 2, 'Active'),
  ('xtreme-weekend-kids-a', 'xtreme-dancers-studio', 'WEEKEND DANCE CLASS - KIDS A (AGES 4-6)', 'Saturday, 9:00 AM-10:30 AM. ₱300 per session.', 90, 300, 'FIXED', 'FLAT', '{"SATURDAY":["9:00 AM"]}'::jsonb, 3, 'Active'),
  ('xtreme-weekend-kids-b', 'xtreme-dancers-studio', 'WEEKEND DANCE CLASS - KIDS B (AGES 7-9)', 'Saturday, 10:30 AM-12:00 PM. ₱300 per session.', 90, 300, 'FIXED', 'FLAT', '{"SATURDAY":["10:30 AM"]}'::jsonb, 4, 'Active'),
  ('xtreme-weekend-teens', 'xtreme-dancers-studio', 'WEEKEND DANCE CLASS - TEENS (AGES 10-15)', 'Saturday, 1:00 PM-2:30 PM. ₱300 per session.', 90, 300, 'FIXED', 'FLAT', '{"SATURDAY":["1:00 PM"]}'::jsonb, 5, 'Active'),
  ('xtreme-weekend-stepper', 'xtreme-dancers-studio', 'WEEKEND DANCE CLASS - XTREME STEPPER', 'Saturday, 5:00 PM-6:30 PM. ₱350 per session.', 90, 350, 'FIXED', 'FLAT', '{"SATURDAY":["5:00 PM"]}'::jsonb, 6, 'Active'),
  ('xtreme-weekend-adult-moms', 'xtreme-dancers-studio', 'WEEKEND DANCE CLASS - ADULT / MOMS BEGINNER', 'Saturday, 6:30 PM-8:00 PM. ₱300 per session.', 90, 300, 'FIXED', 'FLAT', '{"SATURDAY":["6:30 PM"]}'::jsonb, 7, 'Active'),
  ('xtreme-private-class', 'xtreme-dancers-studio', 'PRIVATE CLASS', 'Private 1-on-1 class, 1 hour 30 minutes. Monday-Friday and Sunday, 9:00 AM-6:00 PM or 8:00 PM-10:00 PM.', 90, 500, 'FIXED', 'FLAT', '{"MONDAY":["9:00 AM","10:30 AM","12:00 PM","1:30 PM","3:00 PM","4:30 PM"],"TUESDAY":["9:00 AM","10:30 AM","12:00 PM","1:30 PM","3:00 PM","4:30 PM"],"WEDNESDAY":["9:00 AM","10:30 AM","12:00 PM","1:30 PM","3:00 PM","4:30 PM"],"THURSDAY":["9:00 AM","10:30 AM","12:00 PM","1:30 PM","3:00 PM","4:30 PM"],"FRIDAY":["9:00 AM","10:30 AM","12:00 PM","1:30 PM","3:00 PM","4:30 PM"],"SUNDAY":["9:00 AM","10:30 AM","12:00 PM","1:30 PM","3:00 PM","4:30 PM","8:00 PM"]}'::jsonb, 8, 'Active'),
  ('xtreme-studio-rental-non-aircon', 'xtreme-dancers-studio', 'STUDIO RENTAL - NON-AIRCON', 'Hourly studio rental.', 60, 350, 'FIXED', 'FLAT', '{}'::jsonb, 9, 'Active'),
  ('xtreme-studio-rental-aircon', 'xtreme-dancers-studio', 'STUDIO RENTAL - WITH AIRCON', 'Hourly studio rental.', 60, 500, 'FIXED', 'FLAT', '{}'::jsonb, 10, 'Active')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  duration_minutes = excluded.duration_minutes,
  price = excluded.price,
  pricing_type = excluded.pricing_type,
  pricing_unit = excluded.pricing_unit,
  schedule = excluded.schedule,
  display_order = excluded.display_order,
  status = excluded.status;

update public.business_services
set status = 'Inactive'
where business_slug = 'xtreme-dancers-studio'
  and id not in (
    'xtreme-stepper-session', 'xtreme-stepper-monthly', 'xtreme-weekend-kids-a',
    'xtreme-weekend-kids-b', 'xtreme-weekend-teens', 'xtreme-weekend-stepper',
    'xtreme-weekend-adult-moms', 'xtreme-private-class',
    'xtreme-studio-rental-non-aircon', 'xtreme-studio-rental-aircon'
  );

insert into public.business_availability (id, business_slug, open_days, open_hours, slots, status)
values (
  'xtreme-dancers-studio-availability',
  'xtreme-dancers-studio',
  'Monday to Sunday',
  'Class schedules vary by selected service; Private Class 9:00 AM-6:00 PM and 8:00 PM-10:00 PM',
  '["9:00 AM", "10:30 AM", "1:00 PM", "5:00 PM", "6:00 PM", "6:30 PM", "8:00 PM"]'::jsonb,
  'Active'
)
on conflict (id) do update set
  open_days = excluded.open_days,
  open_hours = excluded.open_hours,
  slots = excluded.slots,
  status = excluded.status;

insert into public.business_payment_methods (id, business_slug, method_type, method_name, account_name, account_number, instructions, active)
values ('xtreme-dancers-gcash', 'xtreme-dancers-studio', 'GCASH', 'GCash', 'XTREME DANCERS STUDIO', '0995 624 4174', 'Payment references remain pending verification until reviewed by the business.', true)
on conflict (id) do update set
  method_name = excluded.method_name,
  account_name = excluded.account_name,
  account_number = excluded.account_number,
  instructions = excluded.instructions,
  active = true;

commit;

select slug, business, status, business_package, booking_template
from public.businesses where slug = 'xtreme-dancers-studio';

select id, name, price, duration_minutes, status
from public.business_services
where business_slug = 'xtreme-dancers-studio'
order by display_order;
