-- Read-only: inspect the installed production implementation and constraints.
select p.oid::regprocedure as signature, p.prosecdef as security_definer,
       pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('upsert_client_service_record', 'can_manage_business_branch', 'business_has_package_capability');

select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'client_service_records'
order by ordinal_position;

select c.conname, pg_get_constraintdef(c.oid) as definition
from pg_constraint c
where c.conrelid = to_regclass('public.client_service_records');

select t.tgname, pg_get_triggerdef(t.oid) as trigger_definition,
       pg_get_functiondef(t.tgfoid) as function_definition
from pg_trigger t
where t.tgrelid = to_regclass('public.client_service_records') and not t.tgisinternal;

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'client_service_records';

select relname, relrowsecurity, relforcerowsecurity
from pg_class where oid = to_regclass('public.client_service_records');
