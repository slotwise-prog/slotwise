create table if not exists public.inquiries (
  id text primary key,
  business_slug text not null references public.businesses(slug) on delete cascade,
  customer_name text not null,
  phone text not null,
  email text,
  event_date text,
  event_time text,
  event_location text,
  event_type text,
  service_interest text,
  message text,
  internal_notes text,
  status text not null default 'NEW',
  source text not null default 'Manual',
  booking_id text references public.bookings(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.inquiries add column if not exists business_slug text references public.businesses(slug) on delete cascade;
alter table public.inquiries add column if not exists customer_name text;
alter table public.inquiries add column if not exists phone text;
alter table public.inquiries add column if not exists email text;
alter table public.inquiries add column if not exists event_date text;
alter table public.inquiries add column if not exists event_time text;
alter table public.inquiries add column if not exists event_location text;
alter table public.inquiries add column if not exists event_type text;
alter table public.inquiries add column if not exists service_interest text;
alter table public.inquiries add column if not exists message text;
alter table public.inquiries add column if not exists internal_notes text;
alter table public.inquiries add column if not exists status text not null default 'NEW';
alter table public.inquiries add column if not exists source text not null default 'Manual';
alter table public.inquiries add column if not exists booking_id text references public.bookings(id) on delete set null;
alter table public.inquiries add column if not exists created_at timestamptz not null default now();
alter table public.inquiries add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'inquiries_status_allowed'
  ) then
    alter table public.inquiries drop constraint inquiries_status_allowed;
  end if;

  alter table public.inquiries add constraint inquiries_status_allowed
  check (status in ('NEW', 'CONTACTED', 'PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED')) not valid;
end $$;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'inquiries_source_allowed'
  ) then
    alter table public.inquiries drop constraint inquiries_source_allowed;
  end if;

  alter table public.inquiries add constraint inquiries_source_allowed
  check (source in ('Website', 'Manual', 'Facebook', 'Messenger', 'Phone', 'Other')) not valid;
end $$;

create index if not exists inquiries_business_slug_idx
on public.inquiries (business_slug);

create index if not exists inquiries_booking_id_idx
on public.inquiries (booking_id);

create table if not exists public.inquiry_items (
  id text primary key,
  inquiry_id text not null references public.inquiries(id) on delete cascade,
  business_slug text not null references public.businesses(slug) on delete cascade,
  service_id text,
  item_name text not null,
  quantity numeric not null default 1,
  created_at timestamptz not null default now()
);

alter table public.inquiry_items add column if not exists inquiry_id text references public.inquiries(id) on delete cascade;
alter table public.inquiry_items add column if not exists business_slug text references public.businesses(slug) on delete cascade;
alter table public.inquiry_items add column if not exists service_id text;
alter table public.inquiry_items add column if not exists item_name text not null default 'Service';
alter table public.inquiry_items add column if not exists quantity numeric not null default 1;
alter table public.inquiry_items add column if not exists created_at timestamptz not null default now();

create index if not exists inquiry_items_inquiry_id_idx
on public.inquiry_items (inquiry_id);

create index if not exists inquiry_items_business_slug_idx
on public.inquiry_items (business_slug);

create or replace function public.touch_inquiry_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists touch_inquiry_updated_at_trigger on public.inquiries;
create trigger touch_inquiry_updated_at_trigger
before update on public.inquiries
for each row execute function public.touch_inquiry_updated_at();

alter table public.inquiries enable row level security;
alter table public.inquiry_items enable row level security;

drop policy if exists "Business users can read inquiries" on public.inquiries;
create policy "Business users can read inquiries"
on public.inquiries for select
to authenticated
using (public.can_manage_business(business_slug));

drop policy if exists "Business users can read inquiry items" on public.inquiry_items;
create policy "Business users can read inquiry items"
on public.inquiry_items for select
to authenticated
using (public.can_manage_business(business_slug));

create or replace function public.upsert_client_inquiry(inquiry_payload jsonb, items_payload jsonb default '[]'::jsonb)
returns table (
  id text,
  business_slug text,
  customer_name text,
  phone text,
  email text,
  event_date text,
  event_time text,
  event_location text,
  event_type text,
  service_interest text,
  message text,
  internal_notes text,
  status text,
  source text,
  booking_id text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_slug text := inquiry_payload->>'business_slug';
  target_id text := inquiry_payload->>'id';
  item jsonb;
begin
  if target_slug is null or target_slug = '' then
    raise exception 'Business is required.';
  end if;

  if not public.can_manage_business(target_slug) then
    raise exception 'You are not authorized to manage inquiries for this business.';
  end if;

  if target_id is null or target_id = '' then
    raise exception 'Inquiry ID is required.';
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
    nullif(inquiry_payload->>'customer_name', ''),
    nullif(inquiry_payload->>'phone', ''),
    nullif(inquiry_payload->>'email', ''),
    inquiry_payload->>'event_date',
    inquiry_payload->>'event_time',
    inquiry_payload->>'event_location',
    inquiry_payload->>'event_type',
    inquiry_payload->>'service_interest',
    inquiry_payload->>'message',
    inquiry_payload->>'internal_notes',
    coalesce(nullif(upper(inquiry_payload->>'status'), ''), 'NEW'),
    coalesce(nullif(inquiry_payload->>'source', ''), 'Manual'),
    nullif(inquiry_payload->>'booking_id', '')
  )
  on conflict (id) do update set
    customer_name = excluded.customer_name,
    phone = excluded.phone,
    email = excluded.email,
    event_date = excluded.event_date,
    event_time = excluded.event_time,
    event_location = excluded.event_location,
    event_type = excluded.event_type,
    service_interest = excluded.service_interest,
    message = excluded.message,
    internal_notes = excluded.internal_notes,
    status = excluded.status,
    source = excluded.source,
    booking_id = coalesce(public.inquiries.booking_id, excluded.booking_id)
  where public.inquiries.business_slug = target_slug
    and public.can_manage_business(public.inquiries.business_slug);

  delete from public.inquiry_items
  where inquiry_id = target_id
    and business_slug = target_slug;

  if jsonb_typeof(items_payload) = 'array' then
    for item in select * from jsonb_array_elements(items_payload)
    loop
      insert into public.inquiry_items (
        id,
        inquiry_id,
        business_slug,
        service_id,
        item_name,
        quantity
      ) values (
        coalesce(item->>'id', target_id || '-item-' || floor(random() * 1000000)::text),
        target_id,
        target_slug,
        nullif(item->>'service_id', ''),
        coalesce(nullif(item->>'item_name', ''), 'Service'),
        coalesce(nullif(item->>'quantity', '')::numeric, 1)
      );
    end loop;
  end if;

  return query
  select
    inquiries.id,
    inquiries.business_slug,
    inquiries.customer_name,
    inquiries.phone,
    inquiries.email,
    inquiries.event_date,
    inquiries.event_time,
    inquiries.event_location,
    inquiries.event_type,
    inquiries.service_interest,
    inquiries.message,
    inquiries.internal_notes,
    inquiries.status,
    inquiries.source,
    inquiries.booking_id,
    inquiries.created_at,
    inquiries.updated_at
  from public.inquiries
  where inquiries.id = target_id
    and inquiries.business_slug = target_slug;
end;
$$;

create or replace function public.convert_inquiry_to_booking(inquiry_id_value text, booking_payload jsonb, items_payload jsonb default '[]'::jsonb)
returns table (
  booking_id text,
  inquiry_id text,
  business_slug text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_inquiry public.inquiries%rowtype;
  target_slug text;
  target_booking_id text := booking_payload->>'id';
  item jsonb;
begin
  select * into target_inquiry
  from public.inquiries
  where id = inquiry_id_value;

  if target_inquiry.id is null then
    raise exception 'Inquiry was not found.';
  end if;

  target_slug := target_inquiry.business_slug;

  if not public.can_manage_business(target_slug) then
    raise exception 'You are not authorized to convert this inquiry.';
  end if;

  if target_inquiry.booking_id is not null and target_inquiry.booking_id <> '' then
    raise exception 'This inquiry has already been converted to a booking.';
  end if;

  if target_booking_id is null or target_booking_id = '' then
    raise exception 'Booking ID is required.';
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
    target_booking_id,
    coalesce(nullif(booking_payload->>'customer', ''), target_inquiry.customer_name),
    coalesce(nullif(booking_payload->>'contact', ''), target_inquiry.phone),
    nullif(booking_payload->>'business', ''),
    target_slug,
    coalesce(nullif(booking_payload->>'service', ''), target_inquiry.service_interest, 'Inquiry'),
    coalesce(booking_payload->>'booking_date', target_inquiry.event_date, ''),
    coalesce(booking_payload->>'slot', target_inquiry.event_time, 'Inquiry only'),
    coalesce(booking_payload->>'note', target_inquiry.message),
    coalesce(booking_payload->'metadata', '{}'::jsonb)
      || jsonb_build_object('source', 'inquiry', 'source_inquiry_id', target_inquiry.id, 'created_by', auth.uid()),
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
        coalesce(item->>'id', target_booking_id || '-item-' || floor(random() * 1000000)::text),
        target_booking_id,
        target_slug,
        nullif(item->>'service_id', ''),
        coalesce(nullif(item->>'service_name_snapshot', ''), target_inquiry.service_interest, 'Service'),
        coalesce(nullif(item->>'pricing_type_snapshot', ''), 'FIXED'),
        nullif(item->>'unit_price_snapshot', '')::numeric,
        coalesce(nullif(item->>'quantity', '')::numeric, 1),
        item->'selected_tier_snapshot',
        nullif(item->>'line_total', '')::numeric
      );
    end loop;
  end if;

  update public.inquiries
  set booking_id = target_booking_id,
      status = 'CONFIRMED'
  where id = target_inquiry.id
    and business_slug = target_slug;

  return query select target_booking_id, target_inquiry.id, target_slug;
end;
$$;

revoke all on function public.upsert_client_inquiry(jsonb, jsonb) from public;
grant execute on function public.upsert_client_inquiry(jsonb, jsonb) to authenticated;

revoke all on function public.convert_inquiry_to_booking(text, jsonb, jsonb) from public;
grant execute on function public.convert_inquiry_to_booking(text, jsonb, jsonb) to authenticated;
