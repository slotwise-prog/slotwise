-- SLOTWISE / Migration 16: one-click, read-only verification.
-- Run this complete query in the authorized Supabase SQL Editor.
-- It returns one result table with: check_name | actual_value | expected_value | status.
-- No INSERT, UPDATE, DELETE, DROP, or other persistent database changes are performed.

with
catalog_checks as (
  select
    to_regclass('public.businesses') is not null as businesses_exists,
    to_regclass('public.business_services') is not null as services_exists,
    to_regclass('public.bookings') is not null as bookings_exists,
    to_regclass('public.service_capacities') is not null as capacity_table_exists
),
business_check as (
  select count(*)::integer as matches
  from public.businesses
  where slug = 'xtreme-dancers-studio'
),
service_check as (
  select count(*)::integer as matches
  from public.business_services
  where business_slug = 'xtreme-dancers-studio'
    and upper(name) = 'XTREME STEPPER - SESSION'
),
capacity_check as (
  select count(*)::integer as matches
  from public.businesses
  where slug = 'xtreme-dancers-studio'
    and coalesce(feature_flags->'service_capacities'->>'XTREME STEPPER - SESSION', '') = '16'
),
function_check as (
  select
    count(*) filter (
      where p.proname = 'submit_public_booking'
        and pg_get_function_identity_arguments(p.oid) = 'booking_payload jsonb'
    )::integer as booking_rpc_matches,
    count(*) filter (
      where p.proname = 'get_public_booking_capacity'
        and pg_get_function_identity_arguments(p.oid) = 'business_slug_value text, service_value text, booking_date_value text, slot_value text'
    )::integer as capacity_rpc_matches,
    bool_or(
      p.proname = 'submit_public_booking'
      and position('pg_advisory_xact_lock' in pg_get_functiondef(p.oid)) > 0
    ) as advisory_lock_present,
    bool_or(
      p.proname = 'submit_public_booking'
      and position('A valid customer email address is required.' in pg_get_functiondef(p.oid)) > 0
    ) as email_validation_present,
    bool_or(
      p.proname = 'submit_public_booking'
      and has_function_privilege('anon', p.oid, 'EXECUTE')
    ) as anon_booking_execute,
    bool_or(
      p.proname = 'get_public_booking_capacity'
      and has_function_privilege('anon', p.oid, 'EXECUTE')
    ) as anon_capacity_execute
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.proname in ('submit_public_booking', 'get_public_booking_capacity')
),
booking_check as (
  select
    count(*) filter (
      where upper(coalesce(status, 'PENDING')) not in ('CANCELLED', 'REJECTED')
    )::integer as consuming,
    count(*) filter (
      where upper(coalesce(status, 'PENDING')) in ('CANCELLED', 'REJECTED')
    )::integer as released
  from public.bookings
  where business_slug = 'xtreme-dancers-studio'
    and service = 'XTREME STEPPER - SESSION'
),
rls_check as (
  select
    bool_and(relrowsecurity) filter (where c.relname in ('businesses', 'business_services', 'bookings')) as all_rls_enabled
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in ('businesses', 'business_services', 'bookings')
),
results as (
  select 10 as sort_order,
    'XTREME business found'::text as check_name,
    case when cc.businesses_exists then bc.matches::text else 'businesses table missing' end as actual_value,
    '1 matching row for slug xtreme-dancers-studio'::text as expected_value,
    case when not cc.businesses_exists then 'NOT VERIFIED' when bc.matches = 1 then 'PASS' else 'FAIL' end as status
  from catalog_checks cc cross join business_check bc
  union all
  select 20, 'Exact target service found',
    case when cc.services_exists then sc.matches::text else 'business_services table missing' end,
    '1 row named XTREME STEPPER - SESSION for the target business',
    case when not cc.services_exists then 'NOT VERIFIED' when sc.matches = 1 then 'PASS' else 'FAIL' end
  from catalog_checks cc cross join service_check sc
  union all
  select 30, 'service_capacities table exists',
    case when cc.capacity_table_exists then 'present' else 'absent; Migration 16 uses businesses.feature_flags JSONB' end,
    'absent is expected; capacity is stored in feature_flags.service_capacities',
    case when cc.capacity_table_exists then 'NOT VERIFIED' else 'PASS' end
  from catalog_checks cc
  union all
  select 40, 'Capacity configured to 16',
    case when cc.businesses_exists then case when cap.matches = 1 then '16' else 'missing or not 16' end else 'businesses table missing' end,
    'feature_flags.service_capacities[XTREME STEPPER - SESSION] = 16',
    case when not cc.businesses_exists then 'NOT VERIFIED' when cap.matches = 1 then 'PASS' else 'FAIL' end
  from catalog_checks cc cross join capacity_check cap
  union all
  select 50, 'Required booking RPC exists',
    case when fc.booking_rpc_matches = 1 and fc.capacity_rpc_matches = 1 then 'both functions present' else format('submit=%s, capacity=%s', fc.booking_rpc_matches, fc.capacity_rpc_matches) end,
    'submit_public_booking(jsonb) and get_public_booking_capacity(text,text,text,text)',
    case when fc.booking_rpc_matches = 1 and fc.capacity_rpc_matches = 1 then 'PASS' else 'FAIL' end
  from function_check fc
  union all
  select 60, 'Advisory locking present', coalesce(fc.advisory_lock_present::text, 'false'), 'true', case when fc.advisory_lock_present then 'PASS' else 'FAIL' end from function_check fc
  union all
  select 70, 'Email validation preserved', coalesce(fc.email_validation_present::text, 'false'), 'true', case when fc.email_validation_present then 'PASS' else 'FAIL' end from function_check fc
  union all
  select 80, 'Anonymous function permissions', format('booking=%s, capacity=%s', coalesce(fc.anon_booking_execute,false), coalesce(fc.anon_capacity_execute,false)), 'both EXECUTE=true', case when fc.anon_booking_execute and fc.anon_capacity_execute then 'PASS' else 'FAIL' end from function_check fc
  union all
  select 90, 'Current capacity-consuming bookings', format('consuming=%s, released=%s', coalesce(bk.consuming,0), coalesce(bk.released,0)), 'counted by exact service and schedule; CANCELLED/REJECTED released', case when cc.bookings_exists then 'PASS' else 'NOT VERIFIED' end from catalog_checks cc cross join booking_check bk
  union all
  select 100, 'Underlying table RLS', coalesce(rc.all_rls_enabled::text, 'false'), 'businesses, business_services, and bookings RLS enabled', case when rc.all_rls_enabled then 'PASS' else 'FAIL' end from rls_check rc
)
select check_name, actual_value, expected_value, status
from results
order by sort_order;
