create or replace function public.create_manual_reservation(booking_payload jsonb, items_payload jsonb default '[]'::jsonb)
returns table (
  id text,
  customer text,
  contact text,
  business text,
  business_slug text,
  service text,
  booking_date text,
  slot text,
  note text,
  metadata jsonb,
  status text,
  estimated_total numeric,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_slug text := booking_payload->>'business_slug';
  target_id text := booking_payload->>'id';
  item jsonb;
begin
  if target_slug is null or target_slug = '' then
    raise exception 'Business is required.';
  end if;

  if not public.business_has_package_capability(target_slug, 'MANUAL_RESERVATIONS') then
    raise exception 'Manual reservations are available for PRO businesses only.';
  end if;

  if public.business_has_package_capability(target_slug, 'CLIENT_RECORDS')
    and coalesce(booking_payload->'metadata'->>'branch', booking_payload->'metadata'->>'assigned_branch', '') <> ''
    and not public.can_manage_business_branch(target_slug, coalesce(booking_payload->'metadata'->>'branch', booking_payload->'metadata'->>'assigned_branch')) then
    raise exception 'You are not authorized to create reservations for this branch.';
  end if;

  if target_id is null or target_id = '' then
    raise exception 'Reservation ID is required.';
  end if;

  insert into public.bookings (
    id,
    customer,
    contact,
    business,
    business_slug,
    service,
    booking_date,
    slot,
    note,
    metadata,
    status,
    estimated_total
  ) values (
    target_id,
    nullif(booking_payload->>'customer', ''),
    nullif(booking_payload->>'contact', ''),
    nullif(booking_payload->>'business', ''),
    target_slug,
    nullif(booking_payload->>'service', ''),
    coalesce(booking_payload->>'booking_date', ''),
    coalesce(booking_payload->>'slot', 'Inquiry only'),
    booking_payload->>'note',
    coalesce(booking_payload->'metadata', '{}'::jsonb)
      || jsonb_build_object('source', 'manual', 'created_by', auth.uid()),
    coalesce(nullif(upper(booking_payload->>'status'), ''), 'CONFIRMED'),
    nullif(booking_payload->>'estimated_total', '')::numeric
  );

  if jsonb_typeof(items_payload) = 'array' then
    for item in select * from jsonb_array_elements(items_payload)
    loop
      insert into public.booking_items (
        id,
        booking_id,
        business_slug,
        service_id,
        service_name_snapshot,
        pricing_type_snapshot,
        unit_price_snapshot,
        quantity,
        selected_tier_snapshot,
        line_total
      ) values (
        coalesce(item->>'id', target_id || '-item-' || floor(random() * 1000000)::text),
        target_id,
        target_slug,
        nullif(item->>'service_id', ''),
        coalesce(nullif(item->>'service_name_snapshot', ''), booking_payload->>'service', 'Service'),
        coalesce(nullif(item->>'pricing_type_snapshot', ''), 'FIXED'),
        nullif(item->>'unit_price_snapshot', '')::numeric,
        coalesce(nullif(item->>'quantity', '')::numeric, 1),
        item->'selected_tier_snapshot',
        nullif(item->>'line_total', '')::numeric
      );
    end loop;
  end if;

  return query
  select
    bookings.id,
    bookings.customer,
    bookings.contact,
    bookings.business,
    bookings.business_slug,
    bookings.service,
    bookings.booking_date,
    bookings.slot,
    bookings.note,
    bookings.metadata,
    bookings.status,
    bookings.estimated_total,
    bookings.created_at
  from public.bookings
  where bookings.id = target_id
    and bookings.business_slug = target_slug;
end;
$$;

revoke all on function public.create_manual_reservation(jsonb, jsonb) from public;
grant execute on function public.create_manual_reservation(jsonb, jsonb) to authenticated;

create or replace function public.business_has_package_capability(target_slug text, capability text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_smm_admin()
    or exists (
      select 1
      from business_users
      join businesses on businesses.slug = business_users.business_slug
      where business_users.user_id = auth.uid()
        and business_users.business_slug = target_slug
        and business_users.active = true
        and (
          upper(capability) in ('BOOKINGS', 'STATUS')
          or (upper(capability) in ('SERVICES', 'SCHEDULE', 'CUSTOMERS', 'BASIC_STATS')
            and businesses.business_package in ('BUSINESS', 'PRO'))
          or (upper(capability) in ('BLOCKED_DATES', 'CUSTOMER_HISTORY', 'ENHANCED_STATS', 'RESERVATION_CALENDAR', 'PAYMENT_VERIFICATION', 'MANUAL_RESERVATIONS')
            and businesses.business_package = 'PRO')
        )
    );
$$;

grant execute on function public.business_has_package_capability(text, text) to authenticated;
