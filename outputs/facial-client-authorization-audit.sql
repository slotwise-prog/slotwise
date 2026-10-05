-- Read-only production audit. No permission or record changes.
select u.id as auth_user_id, u.email, bu.id as membership_id,
       bu.business_slug, bu.role, bu.active, bu.authorized_branches,
       b.business_package,
       b.feature_flags -> 'clientRecords' as client_records_camel,
       b.feature_flags -> 'client_records' as client_records_snake,
       b.feature_flags -> 'client_records_enabled' as client_records_enabled,
       b.feature_flags -> 'branches' as configured_branches
from auth.users u
left join public.business_users bu on bu.user_id = u.id
left join public.businesses b on b.slug = bu.business_slug
where u.email = 'tfucareer.philippines@gmail.com';

select p.oid::regprocedure as signature, pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in
 ('is_smm_admin', 'can_manage_business_branch', 'business_has_package_capability', 'upsert_client_service_record');

select policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('business_users', 'client_records', 'client_service_records');
