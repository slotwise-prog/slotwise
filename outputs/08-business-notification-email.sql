begin;

alter table public.businesses add column if not exists notification_email text;

create or replace function public.resolve_business_notification_email(target_slug text)
returns text
language sql
security definer
set search_path = public
as $$
  select nullif(lower(trim(coalesce(b.notification_email, b.feature_flags->>'primaryEmail', ''))), '')
  from public.businesses as b
  where b.slug = target_slug;
$$;

create or replace function public.update_client_business_profile(
  target_slug text,
  business_name_value text,
  description_value text,
  phone_value text,
  mobile_numbers_value text,
  primary_email_value text,
  notification_email_value text,
  additional_emails_value text,
  website_value text,
  messenger_link_value text,
  logo_url_value text,
  primary_color_value text,
  accent_color_value text
)
returns public.businesses
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_business public.businesses%rowtype;
  normalized_notification_email text := nullif(lower(trim(coalesce(notification_email_value, ''))), '');
begin
  if not exists (
    select 1 from public.business_users as bu
    where bu.user_id = auth.uid() and bu.business_slug = target_slug and bu.active = true
  ) then
    raise exception 'Not authorized for this business';
  end if;
  if normalized_notification_email is not null
     and normalized_notification_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Enter a valid notification email address.';
  end if;

  update public.businesses as b
  set business = nullif(trim(business_name_value), ''),
      description = coalesce(description_value, ''),
      phone = coalesce(phone_value, ''),
      messenger_link = coalesce(messenger_link_value, ''),
      logo_url = coalesce(logo_url_value, ''),
      notification_email = normalized_notification_email,
      primary_color = coalesce(nullif(primary_color_value, ''), b.primary_color),
      accent_color = coalesce(nullif(accent_color_value, ''), b.accent_color),
      feature_flags = coalesce(b.feature_flags, '{}'::jsonb) || jsonb_build_object(
        'mobileNumbers', coalesce(mobile_numbers_value, ''),
        'primaryEmail', coalesce(primary_email_value, ''),
        'additionalEmails', coalesce(additional_emails_value, ''),
        'website', coalesce(website_value, '')
      )
  where b.slug = target_slug
  returning b.* into updated_business;

  return updated_business;
end;
$$;

create or replace function public.queue_booking_received_notifications()
returns trigger language plpgsql security definer set search_path = public as $$
declare business_name text; owner_email text; customer_email text; payload jsonb;
begin
  select b.business into business_name from public.businesses as b where b.slug = new.business_slug;
  owner_email := public.resolve_business_notification_email(new.business_slug);
  customer_email := nullif(lower(trim(coalesce(new.metadata->>'customer_email', new.metadata->>'traveler_email', ''))), '');
  payload := jsonb_build_object('business_name', coalesce(business_name, new.business, 'Slotwise business'), 'booking_reference', new.id, 'customer_name', new.customer, 'contact_number', new.contact, 'customer_email', customer_email, 'service', new.service, 'booking_date', new.booking_date, 'booking_time', new.slot, 'details', coalesce(new.note, ''));
  perform public.enqueue_slotwise_notification('BOOKING_RECEIVED_OWNER','OWNER',owner_email,new.business_slug,'BOOKING',new.id,payload,'BOOKING_RECEIVED_OWNER:'||new.id);
  perform public.enqueue_slotwise_notification('BOOKING_RECEIVED_CUSTOMER','CUSTOMER',customer_email,new.business_slug,'BOOKING',new.id,payload,'BOOKING_RECEIVED_CUSTOMER:'||new.id);
  return new;
end; $$;

create or replace function public.queue_inquiry_received_notifications()
returns trigger language plpgsql security definer set search_path = public as $$
declare business_name text; owner_email text; payload jsonb;
begin
  select b.business into business_name from public.businesses as b where b.slug = new.business_slug;
  owner_email := public.resolve_business_notification_email(new.business_slug);
  payload := jsonb_build_object('business_name',coalesce(business_name,'Slotwise business'),'inquiry_reference',coalesce(new.reference,new.id),'customer_name',new.customer_name,'phone',new.phone,'customer_email',new.email,'inquiry_about',coalesce(new.service_interest,'General Inquiry'),'message',new.message,'created_at',new.created_at);
  perform public.enqueue_slotwise_notification('INQUIRY_RECEIVED_OWNER','OWNER',owner_email,new.business_slug,'INQUIRY',new.id,payload,'INQUIRY_RECEIVED_OWNER:'||new.id);
  perform public.enqueue_slotwise_notification('INQUIRY_RECEIVED_CUSTOMER','CUSTOMER',new.email,new.business_slug,'INQUIRY',new.id,payload,'INQUIRY_RECEIVED_CUSTOMER:'||new.id);
  return new;
end; $$;

create or replace function public.queue_payment_notifications()
returns trigger language plpgsql security definer set search_path = public as $$
declare b public.bookings%rowtype; business_name text; owner_email text; customer_email text; payload jsonb; event_name text; key text;
begin
  select * into b from public.bookings where id = new.booking_id;
  select x.business into business_name from public.businesses as x where x.slug = new.business_slug;
  owner_email := public.resolve_business_notification_email(new.business_slug);
  customer_email := nullif(lower(trim(coalesce(b.metadata->>'customer_email', b.metadata->>'traveler_email', ''))), '');
  if (tg_op = 'INSERT' and new.payment_status = 'PENDING_VERIFICATION') or (tg_op = 'UPDATE' and old.payment_status is distinct from new.payment_status and new.payment_status = 'PENDING_VERIFICATION') then
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

revoke all on function public.resolve_business_notification_email(text) from public, anon, authenticated;
revoke all on function public.update_client_business_profile(text,text,text,text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.update_client_business_profile(text,text,text,text,text,text,text,text,text,text,text,text,text) to authenticated;

commit;
