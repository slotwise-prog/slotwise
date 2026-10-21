begin;

-- Private, server-side configuration. Keep disabled until the ThryveLab owner
-- supplies a real Google Meet or Zoom URL and an authorized operator enables it.
create table if not exists public.business_meeting_settings (
  business_slug text primary key references public.businesses(slug) on delete cascade,
  meeting_link text,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint business_meeting_settings_link_check check (
    meeting_link is null
    or meeting_link ~* '^https://(meet\.google\.com/[a-z0-9-]+|([a-z0-9-]+\.)?zoom\.us/j/[0-9]+)([/?#].*)?$'
  )
);

alter table public.business_meeting_settings enable row level security;
revoke all on table public.business_meeting_settings from anon, authenticated;

insert into public.business_meeting_settings (business_slug, meeting_link, enabled)
values ('thryvelab', null, false)
on conflict (business_slug) do nothing;

create or replace function public.queue_payment_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.bookings%rowtype;
  business_name text;
  owner_email text;
  customer_email text;
  configured_meeting_link text;
  meeting_delivery_enabled boolean := false;
  payload jsonb;
  event_name text;
  key text;
begin
  select * into b from public.bookings where id = new.booking_id;
  select x.business into business_name from public.businesses as x where x.slug = new.business_slug;
  owner_email := public.resolve_business_notification_email(new.business_slug);
  customer_email := nullif(lower(trim(coalesce(b.metadata->>'customer_email', b.metadata->>'traveler_email', ''))), '');

  if (tg_op = 'INSERT' and new.payment_status = 'PENDING_VERIFICATION')
     or (tg_op = 'UPDATE' and old.payment_status is distinct from new.payment_status and new.payment_status = 'PENDING_VERIFICATION') then
    payload := jsonb_build_object(
      'business_name', coalesce(business_name,b.business,'Slotwise business'),
      'booking_reference', new.booking_id,
      'customer_name', b.customer,
      'payment_method', new.payment_method,
      'amount_submitted', new.amount_submitted,
      'reference_number', new.reference_number,
      'submitted_at', new.submitted_at
    );
    perform public.enqueue_slotwise_notification(
      'PAYMENT_SUBMITTED_OWNER','OWNER',owner_email,new.business_slug,'PAYMENT',new.id,payload,
      'PAYMENT_SUBMITTED_OWNER:'||new.id
    );
  end if;

  if tg_op = 'UPDATE'
     and old.payment_status is distinct from new.payment_status
     and new.payment_status in ('VERIFIED','REJECTED') then
    event_name := case when new.payment_status = 'VERIFIED' then 'PAYMENT_VERIFIED_CUSTOMER' else 'PAYMENT_REJECTED_CUSTOMER' end;
    key := event_name||':'||new.id||':'||new.payment_status;
    payload := jsonb_build_object(
      'business_name',coalesce(business_name,b.business,'Slotwise business'),
      'booking_reference',new.booking_id,
      'customer_name',b.customer,
      'payment_method',new.payment_method,
      'amount_submitted',new.amount_submitted,
      'payment_status',new.payment_status
    );
    perform public.enqueue_slotwise_notification(event_name,'CUSTOMER',customer_email,new.business_slug,'PAYMENT',new.id,payload,key);

    if new.payment_status = 'VERIFIED' and new.business_slug = 'thryvelab' then
      select s.meeting_link, s.enabled
        into configured_meeting_link, meeting_delivery_enabled
      from public.business_meeting_settings as s
      where s.business_slug = 'thryvelab';

      if meeting_delivery_enabled
         and configured_meeting_link is not null
         and customer_email is not null then
        payload := jsonb_build_object(
          'business_name','ThryveLab',
          'booking_reference',new.booking_id,
          'customer_name',b.customer,
          'service',b.service,
          'booking_date',nullif(b.booking_date,''),
          'booking_time',nullif(b.slot,''),
          'time_zone','Philippine Time (Asia/Manila)',
          'meeting_link',configured_meeting_link,
          'contact_email','almonte.thelma@outlook.com',
          'contact_phone','+63 921 482 7629'
        );
        perform public.enqueue_slotwise_notification(
          'THRYVELAB_SESSION_DETAILS_CUSTOMER','CUSTOMER',customer_email,'thryvelab','PAYMENT',new.id,payload,
          'THRYVELAB_SESSION_DETAILS_CUSTOMER:'||new.id
        );
      end if;
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.queue_payment_notifications() from public, anon, authenticated;

commit;

-- AFTER REVIEW: configure the real owner-supplied link with a separate manual
-- statement in Supabase SQL Editor. Do not enable this row with a placeholder.
-- update public.business_meeting_settings
-- set meeting_link = 'OWNER-SUPPLIED-GOOGLE-MEET-OR-ZOOM-URL', enabled = true, updated_at = now()
-- where business_slug = 'thryvelab';
