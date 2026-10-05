begin;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'inquiries_source_allowed'
  ) then
    alter table public.inquiries drop constraint inquiries_source_allowed;
  end if;

  alter table public.inquiries add constraint inquiries_source_allowed
  check (source in ('Website', 'Manual', 'Facebook', 'Messenger', 'Phone', 'Other', 'party_xpress_website')) not valid;
end $$;

create or replace function public.create_party_xpress_public_inquiry(submission_payload jsonb)
returns table (
  inquiry_id text,
  business_slug text,
  status text,
  source text,
  service_interest text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_slug constant text := 'party-xpress-rentals';
  target_business public.businesses%rowtype;
  target_id text := 'PX-' || to_char(now(), 'YYYYMMDDHH24MISS') || '-' || floor(random() * 1000000)::text;
  selected_services text[];
  selected_service text;
  selected_service_row public.business_services%rowtype;
  selected_service_names text[] := array[]::text[];
  service_index integer := 0;
  event_date_value text := trim(coalesce(submission_payload->>'event_date', ''));
  event_time_value text := trim(coalesce(submission_payload->>'preferred_event_time', ''));
  event_type_value text := trim(coalesce(submission_payload->>'event_type', ''));
  event_location_value text := trim(coalesce(submission_payload->>'event_location', ''));
  customer_name_value text := trim(coalesce(submission_payload->>'customer_full_name', ''));
  phone_value text := trim(coalesce(submission_payload->>'mobile_number', ''));
  email_value text := trim(coalesce(submission_payload->>'email_address', ''));
  guest_count_value integer;
  message_value text := trim(coalesce(submission_payload->>'special_requests', ''));
begin
  select * into target_business
  from public.businesses
  where businesses.slug = target_slug
    and upper(coalesce(businesses.status, '')) = 'ACTIVE';

  if target_business.slug is null then
    raise exception 'Party Xpress Rentals is not available for public booking requests.';
  end if;

  if customer_name_value = '' then
    raise exception 'Customer full name is required.';
  end if;

  if phone_value = '' then
    raise exception 'Mobile number is required.';
  end if;

  if email_value = '' then
    raise exception 'Email address is required.';
  end if;

  if event_date_value = '' then
    raise exception 'Event date is required.';
  end if;

  if event_time_value = '' then
    raise exception 'Preferred event time is required.';
  end if;

  if event_location_value = '' then
    raise exception 'Event location is required.';
  end if;

  if jsonb_typeof(submission_payload->'selected_services') <> 'array' then
    raise exception 'Select at least one service.';
  end if;

  select array_agg(trim(value))
    into selected_services
  from jsonb_array_elements_text(submission_payload->'selected_services') as value
  where trim(value) <> '';

  if selected_services is null or array_length(selected_services, 1) is null then
    raise exception 'Select at least one service.';
  end if;

  if submission_payload ? 'estimated_guest_count'
    and nullif(trim(coalesce(submission_payload->>'estimated_guest_count', '')), '') is not null then
    guest_count_value := nullif(trim(submission_payload->>'estimated_guest_count'), '')::integer;
    if guest_count_value < 1 then
      raise exception 'Estimated number of guests must be at least 1.';
    end if;
  end if;

  insert into public.inquiries (
    id,
    business_slug,
    customer_name,
    phone,
    email,
    event_date,
    event_time,
    event_location,
    event_type,
    service_interest,
    message,
    internal_notes,
    status,
    source,
    booking_id
  ) values (
    target_id,
    target_slug,
    customer_name_value,
    phone_value,
    email_value,
    event_date_value,
    event_time_value,
    event_location_value,
    event_type_value,
    '',
    message_value,
    case
      when guest_count_value is null then null
      else 'Estimated guests: ' || guest_count_value::text
    end,
    'NEW',
    'party_xpress_website',
    null
  );

  foreach selected_service in array selected_services
  loop
    select * into selected_service_row
    from public.business_services
    where business_services.business_slug = target_slug
      and business_services.status = 'Active'
      and (
        business_services.id = selected_service
        or lower(business_services.name) = lower(selected_service)
      )
    order by case when business_services.id = selected_service then 0 else 1 end
    limit 1;

    if selected_service_row.id is null then
      raise exception 'Selected service is not available: %', selected_service;
    end if;

    service_index := service_index + 1;
    selected_service_names := selected_service_names || selected_service_row.name;

    insert into public.inquiry_items (
      id,
      inquiry_id,
      business_slug,
      service_id,
      item_name,
      quantity
    ) values (
      target_id || '-item-' || service_index::text,
      target_id,
      target_slug,
      selected_service_row.id,
      selected_service_row.name,
      1
    );
  end loop;

  update public.inquiries
  set service_interest = array_to_string(selected_service_names, ', ')
  where inquiries.id = target_id
    and inquiries.business_slug = target_slug;

  return query
  select
    inquiries.id,
    inquiries.business_slug,
    inquiries.status,
    inquiries.source,
    inquiries.service_interest,
    inquiries.created_at
  from public.inquiries
  where inquiries.id = target_id
    and inquiries.business_slug = target_slug;
end;
$$;

revoke all on function public.create_party_xpress_public_inquiry(jsonb) from public;
grant execute on function public.create_party_xpress_public_inquiry(jsonb) to service_role;

commit;
