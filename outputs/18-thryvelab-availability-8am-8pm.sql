-- ThryveLab-only availability configuration.
-- Review and execute manually in the authorized Slotwise Supabase project.
-- This changes only the thryvelab availability row and business timezone metadata.
-- It does not modify bookings, blocked dates, services, prices, or other businesses.

begin;

update public.business_availability
set
  open_days = 'Monday to Sunday',
  open_hours = '8:00 AM to 8:00 PM',
  slots = '["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"]'::jsonb,
  status = 'Active'
where business_slug = 'thryvelab';

update public.businesses
set feature_flags = coalesce(feature_flags, '{}'::jsonb)
  || jsonb_build_object('timezone', 'Asia/Manila', 'availabilityTimezone', 'Asia/Manila')
where slug = 'thryvelab';

commit;

-- Verify the targeted rows after the update.
select
  ba.business_slug,
  ba.open_days,
  ba.open_hours,
  ba.slots,
  ba.status,
  b.feature_flags ->> 'timezone' as timezone,
  b.feature_flags ->> 'availabilityTimezone' as availability_timezone
from public.business_availability ba
join public.businesses b on b.slug = ba.business_slug
where ba.business_slug = 'thryvelab';

-- Expected for the five configured 30-minute group-fitness services:
-- 8:00 AM is the first start, 7:30 PM is the last start, and each appointment ends by 8:00 PM.
-- WOW Personal Training and Free Wellness Consultation currently have no configured
-- duration in the source setup, so their final end time cannot be guaranteed until an
-- authorized admin configures their duration.
