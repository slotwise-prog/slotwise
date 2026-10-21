-- READ-ONLY diagnostics for Migration 16.
-- Run in the authorized Slotwise Supabase SQL Editor.
-- This script contains no INSERT, UPDATE, DELETE, DROP, or DDL statements.

-- 1) Confirm the target business and configured capacity.
select
  b.slug,
  b.business,
  b.status,
  b.business_package,
  b.feature_flags->'service_capacities' as service_capacities,
  b.feature_flags->'service_capacities'->>'XTREME STEPPER - SESSION' as xtreme_stepper_capacity
from public.businesses b
where b.slug = 'xtreme-dancers-studio';

-- 2) Confirm the two Migration 16 functions exist and inspect definitions.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type,
  p.prosecdef as security_definer,
  p.proconfig as function_settings,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (
    (p.proname = 'get_public_booking_capacity'
      and pg_get_function_identity_arguments(p.oid) = 'business_slug_value text, service_value text, booking_date_value text, slot_value text')
    or (p.proname = 'submit_public_booking'
      and pg_get_function_identity_arguments(p.oid) = 'booking_payload jsonb')
  )
order by p.proname;

-- 3) Confirm EXECUTE grants for the public booking roles.
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  coalesce(array_to_string(p.proacl, E'\n'), '(no explicit ACL)') as access_control_list
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('get_public_booking_capacity', 'submit_public_booking')
order by p.proname;

-- 4) Confirm the target service exists and inspect all Xtreme service names.
select
  bs.business_slug,
  bs.id,
  bs.name,
  bs.status,
  bs.duration_minutes,
  bs.price
from public.business_services bs
where bs.business_slug = 'xtreme-dancers-studio'
order by bs.display_order, bs.name;

-- 5) Read-only capacity counts by existing Xtreme schedule.
-- Capacity-consuming statuses are everything except CANCELLED and REJECTED,
-- matching the Migration 16 RPC.
select
  b.booking_date,
  b.slot,
  b.service,
  count(*) filter (where upper(coalesce(b.status, 'PENDING')) not in ('CANCELLED', 'REJECTED'))::integer as capacity_consuming_bookings,
  count(*) filter (where upper(coalesce(b.status, 'PENDING')) in ('CANCELLED', 'REJECTED'))::integer as released_bookings,
  16 - count(*) filter (where upper(coalesce(b.status, 'PENDING')) not in ('CANCELLED', 'REJECTED'))::integer as calculated_remaining
from public.bookings b
where b.business_slug = 'xtreme-dancers-studio'
  and b.service = 'XTREME STEPPER - SESSION'
group by b.booking_date, b.slot, b.service
order by b.booking_date, b.slot;

-- 6) Confirm the public booking RPC retains the email validation and capacity guard.
select
  position('A valid customer email address is required.' in pg_get_functiondef(p.oid)) > 0 as email_validation_present,
  position('pg_advisory_xact_lock' in pg_get_functiondef(p.oid)) > 0 as advisory_lock_present,
  position('fully booked' in lower(pg_get_functiondef(p.oid))) > 0 as full_capacity_rejection_present
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'submit_public_booking'
  and pg_get_function_identity_arguments(p.oid) = 'booking_payload jsonb';

-- 7) Confirm RLS remains enabled on the underlying bookings table.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('businesses', 'business_services', 'bookings');
