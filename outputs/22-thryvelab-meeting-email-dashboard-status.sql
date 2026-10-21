-- Migration 22: expose only the ThryveLab meeting-email delivery status
-- to an authorized ThryveLab dashboard user. This does not grant table access.

create or replace function public.get_thryvelab_meeting_email_status(payment_id_value text)
returns table (
  status text,
  sent_at timestamptz,
  recipient_email text,
  error_message text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_slug text;
  settings_enabled boolean := false;
  configured_link text;
begin
  select bp.business_slug
    into target_slug
  from public.booking_payments as bp
  where bp.id::text = payment_id_value;

  if target_slug is distinct from 'thryvelab' then
    raise exception 'Payment does not belong to ThryveLab.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.business_users as bu
    where bu.user_id = auth.uid()
      and bu.business_slug = 'thryvelab'
      and bu.active = true
  ) then
    raise exception 'Not authorized for ThryveLab.' using errcode = '42501';
  end if;

  return query
    select nl.status, nl.sent_at, nl.recipient_email, nl.error_message, nl.created_at
    from public.notification_logs as nl
    where nl.business_slug = 'thryvelab'
      and nl.event_type = 'THRYVELAB_SESSION_DETAILS_CUSTOMER'
      and nl.related_entity_type = 'PAYMENT'
      and nl.related_entity_id = payment_id_value
    order by nl.created_at desc
    limit 1;

  if found then
    return;
  end if;

  select s.enabled, s.meeting_link
    into settings_enabled, configured_link
  from public.business_meeting_settings as s
  where s.business_slug = 'thryvelab';

  if not coalesce(settings_enabled, false) or nullif(trim(coalesce(configured_link, '')), '') is null then
    return query select 'NOT_CONFIGURED'::text, null::timestamptz, null::text, null::text, now();
  else
    return query select 'PENDING'::text, null::timestamptz, null::text, null::text, now();
  end if;
end;
$$;

revoke all on function public.get_thryvelab_meeting_email_status(text) from public, anon, authenticated;
grant execute on function public.get_thryvelab_meeting_email_status(text) to authenticated;
