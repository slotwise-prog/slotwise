-- Read-only diagnostic for the ThryveLab WOW Personal Training service.
select
  id,
  business_slug,
  name,
  description,
  price,
  duration_minutes,
  status,
  service_category,
  schedule
from public.business_services
where business_slug = 'thryvelab'
  and (
    upper(coalesce(service_category, '')) = 'WOW PERSONAL TRAINING'
    or name ilike '%WOW%Personal%Training%'
  )
order by display_order asc, created_at asc;
