-- TEMPORARY PAYMENT DIAGNOSTIC BUILD: read-only, no account details or IDs.
select
  b.slug as business_slug,
  b.business_package,
  b.status,
  s.enabled as manual_payment_enabled,
  s.requirement_type as payment_requirement_type,
  m.method_type,
  m.business_slug as method_business_slug,
  m.method_name,
  m.active as method_active
from public.businesses b
left join public.business_payment_settings s on s.business_slug = b.slug
left join public.business_payment_methods m on m.business_slug = b.slug
where b.slug = 'xtreme-dancers-studio'
order by m.method_type, m.active desc;

-- Inspect the deployed read policies, not just the local migration file.
select policyname, roles, cmd, qual
from pg_catalog.pg_policies
where schemaname = 'public'
  and tablename = 'business_payment_methods'
  and cmd in ('SELECT', 'ALL')
order by policyname;
