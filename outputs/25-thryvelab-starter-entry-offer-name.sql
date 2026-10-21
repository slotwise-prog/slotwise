-- ThryveLab-only service label update. Review and execute manually.
-- The existing service row, ID, price, duration, description, and inclusions
-- are preserved; only the public name changes.

update public.business_services
set name = '7-Day Starter Kit Entry Offer'
where business_slug = 'thryvelab'
  and price = 299
  and name ~* '^ThryveStart\s*[-–]\s*7\s*Days$';

select id, business_slug, name, price, duration_minutes
from public.business_services
where business_slug = 'thryvelab'
  and name = '7-Day Starter Kit Entry Offer';
