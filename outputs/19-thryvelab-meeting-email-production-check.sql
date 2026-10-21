-- READ ONLY: run once in the authorized Supabase SQL Editor.
-- The meeting URL is intentionally masked and is never returned by this check.
with migration_objects as (
  select
    to_regclass('public.business_meeting_settings') is not null as settings_table_exists,
    exists (
      select 1
      from pg_proc p
      join pg_namespace n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname = 'queue_payment_notifications'
        and pg_get_functiondef(p.oid) like '%THRYVELAB_SESSION_DETAILS_CUSTOMER%'
        and pg_get_functiondef(p.oid) like '%new.business_slug = ''thryvelab''%'
        and pg_get_functiondef(p.oid) like '%new.payment_status = ''VERIFIED''%'
    ) as thryvelab_trigger_logic_exists,
    exists (
      select 1
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      join pg_proc p on p.oid = t.tgfoid
      where n.nspname = 'public'
        and c.relname = 'booking_payments'
        and t.tgname = 'slotwise_payment_notification'
        and p.proname = 'queue_payment_notifications'
        and not t.tgisinternal
    ) as payment_trigger_exists
),
settings_state as (
  select
    case
      when not (select settings_table_exists from migration_objects) then false
      else exists (
        select 1
        from public.business_meeting_settings
        where business_slug = 'thryvelab'
      )
    end as thryvelab_row_exists,
    case
      when not (select settings_table_exists from migration_objects) then false
      else coalesce((
        select enabled
        from public.business_meeting_settings
        where business_slug = 'thryvelab'
      ), false)
    end as delivery_enabled,
    case
      when not (select settings_table_exists from migration_objects) then false
      else coalesce((
        select meeting_link ~* '^https://(meet\.google\.com/[a-z0-9-]+|([a-z0-9-]+\.)?zoom\.us/j/[0-9]+)([/?#].*)?$'
        from public.business_meeting_settings
        where business_slug = 'thryvelab'
      ), false)
    end as valid_link_configured
)
select 'Migration 19 settings table' as check_name,
       (select settings_table_exists::text from migration_objects) as actual_value,
       'true' as expected_value,
       case when (select settings_table_exists from migration_objects) then 'PASS' else 'FAIL' end as status
union all
select 'ThryveLab settings row', (select thryvelab_row_exists::text from settings_state), 'true',
       case when (select thryvelab_row_exists from settings_state) then 'PASS' else 'FAIL' end
union all
select 'Verified-payment trigger logic', (select thryvelab_trigger_logic_exists::text from migration_objects), 'true',
       case when (select thryvelab_trigger_logic_exists from migration_objects) then 'PASS' else 'FAIL' end
union all
select 'Payment notification trigger', (select payment_trigger_exists::text from migration_objects), 'true',
       case when (select payment_trigger_exists from migration_objects) then 'PASS' else 'FAIL' end
union all
select 'Valid meeting link configured', (select valid_link_configured::text from settings_state), 'true',
       case when (select valid_link_configured from settings_state) then 'PASS' else 'NOT CONFIGURED' end
union all
select 'Automated delivery enabled', (select delivery_enabled::text from settings_state), 'true',
       case when (select delivery_enabled from settings_state) then 'PASS' else 'DISABLED' end;
