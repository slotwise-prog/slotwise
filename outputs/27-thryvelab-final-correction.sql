-- ThryveLab-only final correction.
-- Review and execute manually in the authorized Supabase project.
-- No bookings, payment records, or existing service IDs are modified.

begin;

-- Rename the existing PHP 299 starter row without changing its ID,
-- description, duration, pricing, or inclusions.
update public.business_services
set name = '7-Day Starter Kit Entry Offer'
where business_slug = 'thryvelab'
  and price = 299
  and name ~* '^ThryveStart\s*[-–]\s*7\s*Days$';

-- Monday through Saturday only. The final 7:30 PM start is valid for
-- 30-minute sessions ending at 8:00 PM.
update public.business_availability
set open_days = 'Monday to Saturday',
    open_hours = '8:00 AM to 8:00 PM',
    slots = '["8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"]'::jsonb,
    status = 'Active'
where business_slug = 'thryvelab';

update public.businesses
set feature_flags = coalesce(feature_flags, '{}'::jsonb)
  || jsonb_build_object('timezone', 'Asia/Manila', 'availabilityTimezone', 'Asia/Manila')
where slug = 'thryvelab';

-- If WOW Personal Training exists under its approved name/category, make it
-- publishable without inventing price, duration, or package inclusions.
update public.business_services
set status = 'Active',
    service_category = case
      when nullif(trim(coalesce(service_category, '')), '') is null then 'WOW PERSONAL TRAINING'
      else service_category
    end
where business_slug = 'thryvelab'
  and (name ilike '%WOW%Personal%Training%' or upper(coalesce(service_category, '')) = 'WOW PERSONAL TRAINING');

commit;

-- Verify the result after execution.
select id, business_slug, name, description, price, duration_minutes, status,
       service_category, schedule
from public.business_services
where business_slug = 'thryvelab'
  and (name = '7-Day Starter Kit Entry Offer'
       or name ilike '%WOW%Personal%Training%'
       or upper(coalesce(service_category, '')) = 'WOW PERSONAL TRAINING')
order by display_order asc, created_at asc;

select business_slug, open_days, open_hours, slots, status
from public.business_availability
where business_slug = 'thryvelab';
