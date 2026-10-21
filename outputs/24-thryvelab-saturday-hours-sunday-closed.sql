-- ThryveLab-only configuration. Review and execute manually in the
-- authorized Supabase project. Existing bookings are not changed.

begin;

update public.business_availability
set
  open_days = 'Monday to Saturday',
  open_hours = '8:00 AM to 8:00 PM',
  slots = '["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"]'::jsonb,
  status = 'Active'
where business_slug = 'thryvelab';

update public.businesses
set feature_flags = coalesce(feature_flags, '{}'::jsonb)
  || jsonb_build_object('timezone', 'Asia/Manila', 'availabilityTimezone', 'Asia/Manila')
where slug = 'thryvelab';

commit;

select business_slug, open_days, open_hours, slots, status
from public.business_availability
where business_slug = 'thryvelab';
