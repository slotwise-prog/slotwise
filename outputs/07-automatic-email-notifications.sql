begin;

create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null unique,
  business_slug text references public.businesses(slug) on delete set null,
  event_type text not null,
  recipient_type text not null check (recipient_type in ('OWNER', 'CUSTOMER')),
  recipient_email text,
  related_entity_type text not null,
  related_entity_id text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'PENDING' check (status in ('PENDING', 'SENT', 'FAILED', 'SKIPPED_NO_RECIPIENT')),
  provider text default 'BREVO',
  provider_message_id text,
  attempt_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index if not exists notification_logs_status_idx on public.notification_logs(status, created_at);
create index if not exists notification_logs_business_idx on public.notification_logs(business_slug, created_at desc);
alter table public.notification_logs enable row level security;

create or replace function public.enqueue_slotwise_notification(
  event_type_value text,
  recipient_type_value text,
  recipient_email_value text,
  business_slug_value text,
  related_entity_type_value text,
  related_entity_id_value text,
  payload_value jsonb,
  idempotency_key_value text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare notification_id uuid;
begin
  insert into public.notification_logs (
    idempotency_key, business_slug, event_type, recipient_type, recipient_email,
    related_entity_type, related_entity_id, payload, status
  ) values (
    idempotency_key_value, business_slug_value, event_type_value, recipient_type_value,
    nullif(lower(trim(coalesce(recipient_email_value, ''))), ''), related_entity_type_value,
    related_entity_id_value, coalesce(payload_value, '{}'::jsonb),
    case when nullif(trim(coalesce(recipient_email_value, '')), '') is null then 'SKIPPED_NO_RECIPIENT' else 'PENDING' end
  ) on conflict (idempotency_key) do nothing
  returning id into notification_id;
  return notification_id;
end;
$$;

create or replace function public.queue_booking_received_notifications()
returns trigger language plpgsql security definer set search_path = public as $$
declare business_name text; owner_email text; customer_email text; payload jsonb;
begin
  select b.business, nullif(lower(trim(coalesce(b.feature_flags->>'primaryEmail', ''))), '')
    into business_name, owner_email from public.businesses b where b.slug = new.business_slug;
  customer_email := nullif(lower(trim(coalesce(new.metadata->>'customer_email', new.metadata->>'traveler_email', ''))), '');
  payload := jsonb_build_object('business_name', coalesce(business_name, new.business, 'Slotwise business'), 'booking_reference', new.id, 'customer_name', new.customer, 'contact_number', new.contact, 'customer_email', customer_email, 'service', new.service, 'booking_date', new.booking_date, 'booking_time', new.slot, 'details', coalesce(new.note, ''));
  perform public.enqueue_slotwise_notification('BOOKING_RECEIVED_OWNER','OWNER',owner_email,new.business_slug,'BOOKING',new.id,payload,'BOOKING_RECEIVED_OWNER:'||new.id);
  perform public.enqueue_slotwise_notification('BOOKING_RECEIVED_CUSTOMER','CUSTOMER',customer_email,new.business_slug,'BOOKING',new.id,payload,'BOOKING_RECEIVED_CUSTOMER:'||new.id);
  return new;
end; $$;

create or replace function public.queue_booking_status_notification()
returns trigger language plpgsql security definer set search_path = public as $$
declare business_name text; customer_email text; payload jsonb;
begin
  if old.status is not distinct from new.status then return new; end if;
  select b.business into business_name from public.businesses b where b.slug = new.business_slug;
  customer_email := nullif(lower(trim(coalesce(new.metadata->>'customer_email', new.metadata->>'traveler_email', ''))), '');
  payload := jsonb_build_object('business_name',coalesce(business_name,new.business,'Slotwise business'),'booking_reference',new.id,'customer_name',new.customer,'service',new.service,'booking_date',new.booking_date,'booking_time',new.slot,'status',new.status);
  perform public.enqueue_slotwise_notification('BOOKING_STATUS_CHANGED_CUSTOMER','CUSTOMER',customer_email,new.business_slug,'BOOKING',new.id,payload,'BOOKING_STATUS_CHANGED_CUSTOMER:'||new.id||':'||upper(new.status));
  return new;
end; $$;

create or replace function public.queue_inquiry_received_notifications()
returns trigger language plpgsql security definer set search_path = public as $$
declare business_name text; owner_email text; payload jsonb;
begin
  select b.business, nullif(lower(trim(coalesce(b.feature_flags->>'primaryEmail', ''))), '') into business_name, owner_email from public.businesses b where b.slug = new.business_slug;
  payload := jsonb_build_object('business_name',coalesce(business_name,'Slotwise business'),'inquiry_reference',coalesce(new.reference,new.id),'customer_name',new.customer_name,'phone',new.phone,'customer_email',new.email,'inquiry_about',coalesce(new.service_interest,'General Inquiry'),'message',new.message,'created_at',new.created_at);
  perform public.enqueue_slotwise_notification('INQUIRY_RECEIVED_OWNER','OWNER',owner_email,new.business_slug,'INQUIRY',new.id,payload,'INQUIRY_RECEIVED_OWNER:'||new.id);
  perform public.enqueue_slotwise_notification('INQUIRY_RECEIVED_CUSTOMER','CUSTOMER',new.email,new.business_slug,'INQUIRY',new.id,payload,'INQUIRY_RECEIVED_CUSTOMER:'||new.id);
  return new;
end; $$;

create or replace function public.queue_inquiry_status_notification()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- REPLIED is intentionally not emailed: status alone does not prove a reply was sent.
  return new;
end; $$;

create or replace function public.queue_payment_notifications()
returns trigger language plpgsql security definer set search_path = public as $$
declare b public.bookings%rowtype; business_name text; owner_email text; customer_email text; payload jsonb; event_name text; key text;
begin
  select * into b from public.bookings where id = new.booking_id;
  select x.business, nullif(lower(trim(coalesce(x.feature_flags->>'primaryEmail', ''))), '') into business_name, owner_email from public.businesses x where x.slug = new.business_slug;
  customer_email := nullif(lower(trim(coalesce(b.metadata->>'customer_email', b.metadata->>'traveler_email', ''))), '');
  if (tg_op = 'INSERT' and new.payment_status = 'PENDING_VERIFICATION')
     or (tg_op = 'UPDATE' and old.payment_status is distinct from new.payment_status and new.payment_status = 'PENDING_VERIFICATION') then
    payload := jsonb_build_object('business_name',coalesce(business_name,b.business,'Slotwise business'),'booking_reference',new.booking_id,'customer_name',b.customer,'payment_method',new.payment_method,'amount_submitted',new.amount_submitted,'reference_number',new.reference_number,'submitted_at',new.submitted_at);
    perform public.enqueue_slotwise_notification('PAYMENT_SUBMITTED_OWNER','OWNER',owner_email,new.business_slug,'PAYMENT',new.id,payload,'PAYMENT_SUBMITTED_OWNER:'||new.id);
  end if;
  if tg_op = 'UPDATE' and old.payment_status is distinct from new.payment_status and new.payment_status in ('VERIFIED','REJECTED') then
    event_name := case when new.payment_status = 'VERIFIED' then 'PAYMENT_VERIFIED_CUSTOMER' else 'PAYMENT_REJECTED_CUSTOMER' end;
    key := event_name||':'||new.id||':'||new.payment_status;
    payload := jsonb_build_object('business_name',coalesce(business_name,b.business,'Slotwise business'),'booking_reference',new.booking_id,'customer_name',b.customer,'payment_method',new.payment_method,'amount_submitted',new.amount_submitted,'payment_status',new.payment_status);
    perform public.enqueue_slotwise_notification(event_name,'CUSTOMER',customer_email,new.business_slug,'PAYMENT',new.id,payload,key);
  end if;
  return new;
end; $$;

drop trigger if exists slotwise_booking_received_notification on public.bookings;
create trigger slotwise_booking_received_notification after insert on public.bookings for each row execute function public.queue_booking_received_notifications();
drop trigger if exists slotwise_booking_status_notification on public.bookings;
create trigger slotwise_booking_status_notification after update of status on public.bookings for each row execute function public.queue_booking_status_notification();
drop trigger if exists slotwise_inquiry_received_notification on public.inquiries;
create trigger slotwise_inquiry_received_notification after insert on public.inquiries for each row execute function public.queue_inquiry_received_notifications();
drop trigger if exists slotwise_inquiry_status_notification on public.inquiries;
create trigger slotwise_inquiry_status_notification after update of status on public.inquiries for each row execute function public.queue_inquiry_status_notification();
drop trigger if exists slotwise_payment_notification on public.booking_payments;
create trigger slotwise_payment_notification after insert or update of payment_status on public.booking_payments for each row execute function public.queue_payment_notifications();

revoke all on public.notification_logs from anon, authenticated;
revoke all on function public.enqueue_slotwise_notification(text,text,text,text,text,text,jsonb,text) from public, anon, authenticated;

commit;
