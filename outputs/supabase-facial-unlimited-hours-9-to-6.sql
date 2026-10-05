update public.business_availability
set
  open_hours = '9:00 AM to 6:00 PM',
  slots = '["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"]'::jsonb,
  status = 'Active'
where business_slug = 'the-facial-unlimited-ph';

insert into public.business_availability (id, business_slug, open_days, open_hours, slots, status)
select
  'facial-unlimited-availability',
  'the-facial-unlimited-ph',
  'Monday to Sunday',
  '9:00 AM to 6:00 PM',
  '["9:00 AM","10:00 AM","11:00 AM","12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"]'::jsonb,
  'Active'
where not exists (
  select 1 from public.business_availability
  where business_slug = 'the-facial-unlimited-ph'
);

select business_slug, open_days, open_hours, slots, status
from public.business_availability
where business_slug = 'the-facial-unlimited-ph';
