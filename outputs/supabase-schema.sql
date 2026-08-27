create table if not exists leads (
  id text primary key,
  name text not null,
  business text not null,
  industry text not null,
  contact text not null,
  offer text not null,
  status text not null default 'New',
  created_at timestamptz not null default now()
);

create table if not exists bookings (
  id text primary key,
  customer text not null,
  contact text not null,
  business text not null,
  business_slug text,
  service text not null,
  booking_date text,
  slot text not null,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  status text not null default 'Confirmed',
  created_at timestamptz not null default now()
);

create index if not exists bookings_business_slug_idx
on bookings (business_slug);

alter table bookings add column if not exists booking_date text;
alter table bookings add column if not exists metadata jsonb not null default '{}'::jsonb;

create table if not exists businesses (
  slug text primary key,
  business text not null,
  industry text not null,
  booking_link text not null,
  cover_url text,
  status text not null default 'DEMO',
  created_at timestamptz not null default now()
);

alter table businesses alter column status set default 'DEMO';

alter table businesses add column if not exists logo_url text;
alter table businesses add column if not exists primary_color text default '#bd5d6d';
alter table businesses add column if not exists accent_color text default '#f6dfe3';
alter table businesses add column if not exists phone text;
alter table businesses add column if not exists messenger_link text;
alter table businesses add column if not exists address text;
alter table businesses add column if not exists description text;
alter table businesses add column if not exists business_type text;
alter table businesses add column if not exists booking_mode text default 'booking';
alter table businesses add column if not exists booking_template text not null default 'GENERAL';
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'businesses_booking_template_allowed'
  ) then
    alter table businesses drop constraint businesses_booking_template_allowed;
  end if;

  alter table businesses add constraint businesses_booking_template_allowed
  check (booking_template in ('GENERAL', 'BEAUTY', 'CLINIC', 'HOME_SERVICE', 'AUTO', 'TOURS_TRAVEL')) not valid;
end $$;
alter table businesses add column if not exists business_package text not null default 'STARTER';
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'businesses_package_allowed'
  ) then
    alter table businesses add constraint businesses_package_allowed
    check (business_package in ('STARTER', 'BUSINESS', 'PRO')) not valid;
  end if;
end $$;
alter table businesses add column if not exists feature_flags jsonb not null default '{
  "bookingEnabled": true,
  "inquiryEnabled": true,
  "showPrices": true,
  "requireDate": true,
  "requireTime": true,
  "requireAddress": false,
  "clientAdminEnabled": false,
  "customerListEnabled": false,
  "analyticsEnabled": false,
  "staffSelectionEnabled": false
}'::jsonb;

create table if not exists business_services (
  id text primary key,
  business_slug text not null references businesses(slug) on delete cascade,
  name text not null,
  duration_minutes integer,
  price numeric,
  pricing_unit text not null default 'FLAT',
  description text,
  display_order integer not null default 0,
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

alter table business_services add column if not exists pricing_unit text not null default 'FLAT';
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'business_services_pricing_unit_allowed'
  ) then
    alter table business_services drop constraint business_services_pricing_unit_allowed;
  end if;

  alter table business_services add constraint business_services_pricing_unit_allowed
  check (pricing_unit in ('FLAT', 'PER_PAX', 'PER_PERSON', 'PER_GROUP')) not valid;
end $$;

create index if not exists business_services_business_slug_idx
on business_services (business_slug);

create table if not exists business_availability (
  id text primary key,
  business_slug text not null references businesses(slug) on delete cascade,
  open_days text,
  open_hours text,
  slots jsonb not null default '["9:30 AM", "10:15 AM", "1:00 PM", "3:30 PM"]'::jsonb,
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

create index if not exists business_availability_business_slug_idx
on business_availability (business_slug);

create table if not exists business_blocked_dates (
  id text primary key,
  business_slug text not null references businesses(slug) on delete cascade,
  blocked_date date not null,
  reason text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists business_blocked_dates_business_slug_idx
on business_blocked_dates (business_slug);

create unique index if not exists business_blocked_dates_unique_active_idx
on business_blocked_dates (business_slug, blocked_date)
where active = true;

create table if not exists setup_requests (
  id text primary key,
  business_slug text,
  business_name text not null,
  owner_name text not null,
  contact text not null,
  industry text not null,
  facebook_page text,
  services text,
  open_days text,
  open_hours text,
  staff text,
  rules text,
  questions text,
  status text not null default 'Ready for review',
  created_at timestamptz not null default now()
);

alter table setup_requests add column if not exists business_slug text;

create table if not exists admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'ADMIN',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists business_users (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  business_slug text not null references businesses(slug) on delete cascade,
  role text not null default 'OWNER',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, business_slug)
);

create index if not exists business_users_user_id_idx
on business_users (user_id);

create index if not exists business_users_business_slug_idx
on business_users (business_slug);

create or replace function public.is_active_business(target_slug text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from businesses
    where slug = target_slug
      and upper(status) = 'ACTIVE'
  );
$$;

grant execute on function public.is_active_business(text) to anon, authenticated;

create or replace function public.is_smm_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from admin_users
    where user_id = auth.uid()
      and active = true
  );
$$;

create or replace function public.can_manage_business(target_slug text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_smm_admin()
    or exists (
      select 1
      from business_users
      where user_id = auth.uid()
        and business_slug = target_slug
        and active = true
    );
$$;

create or replace function public.update_client_booking_status(booking_id text, next_status text)
returns table (
  id text,
  business_slug text,
  status text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if upper(next_status) not in ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED') then
    raise exception 'Invalid booking status';
  end if;

  return query
  update bookings
  set status = upper(next_status)
  where bookings.id = booking_id
    and public.can_manage_business(bookings.business_slug)
  returning bookings.id, bookings.business_slug, bookings.status;
end;
$$;

grant execute on function public.is_smm_admin() to authenticated;
grant execute on function public.can_manage_business(text) to authenticated;
grant execute on function public.update_client_booking_status(text, text) to authenticated;

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
          or (upper(capability) in ('BLOCKED_DATES', 'CUSTOMER_HISTORY', 'ENHANCED_STATS')
            and businesses.business_package = 'PRO')
        )
    );
$$;

create or replace function public.upsert_client_service(
  service_id text,
  target_slug text,
  service_name text,
  service_description text,
  service_price numeric,
  service_duration integer,
  service_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.business_has_package_capability(target_slug, 'SERVICES') then
    raise exception 'This package cannot manage services.';
  end if;

  insert into business_services (
    id,
    business_slug,
    name,
    description,
    price,
    duration_minutes,
    status
  )
  values (
    service_id,
    target_slug,
    service_name,
    service_description,
    service_price,
    service_duration,
    service_status
  )
  on conflict (id)
  do update set
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    duration_minutes = excluded.duration_minutes,
    status = excluded.status
  where business_services.business_slug = target_slug;
end;
$$;

create or replace function public.update_client_availability(
  target_slug text,
  open_days_value text,
  open_hours_value text,
  slots_value jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.business_has_package_capability(target_slug, 'SCHEDULE') then
    raise exception 'This package cannot manage schedule.';
  end if;

  delete from business_availability
  where business_slug = target_slug;

  insert into business_availability (
    id,
    business_slug,
    open_days,
    open_hours,
    slots,
    status
  )
  values (
    'AVAIL-' || target_slug,
    target_slug,
    open_days_value,
    open_hours_value,
    coalesce(slots_value, '[]'::jsonb),
    'Active'
  );
end;
$$;

create or replace function public.upsert_client_blocked_date(
  blocked_date_id text,
  target_slug text,
  blocked_date_value date,
  blocked_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.business_has_package_capability(target_slug, 'BLOCKED_DATES') then
    raise exception 'This package cannot manage blocked dates.';
  end if;

  insert into business_blocked_dates (
    id,
    business_slug,
    blocked_date,
    reason,
    active
  )
  values (
    blocked_date_id,
    target_slug,
    blocked_date_value,
    blocked_reason,
    true
  )
  on conflict (id)
  do update set
    blocked_date = excluded.blocked_date,
    reason = excluded.reason,
    active = true
  where business_blocked_dates.business_slug = target_slug;
end;
$$;

create or replace function public.set_client_blocked_date_active(
  blocked_date_id text,
  next_active boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_slug text;
begin
  select business_slug into target_slug
  from business_blocked_dates
  where id = blocked_date_id;

  if target_slug is null or not public.business_has_package_capability(target_slug, 'BLOCKED_DATES') then
    raise exception 'This package cannot manage blocked dates.';
  end if;

  update business_blocked_dates
  set active = next_active
  where id = blocked_date_id
    and business_slug = target_slug;
end;
$$;

grant execute on function public.business_has_package_capability(text, text) to authenticated;
grant execute on function public.upsert_client_service(text, text, text, text, numeric, integer, text) to authenticated;
grant execute on function public.update_client_availability(text, text, text, jsonb) to authenticated;
grant execute on function public.upsert_client_blocked_date(text, text, date, text) to authenticated;
grant execute on function public.set_client_blocked_date_active(text, boolean) to authenticated;

insert into businesses (slug, business, industry, booking_link, cover_url)
values
  ('glowbeauty', 'Glow Beauty Studio', 'Salon & Beauty', 'glowbeauty.slotwise.app', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'),
  ('drjoseclinic', 'Dr. Jose Dental Clinic', 'Clinic & Dental', 'drjoseclinic.slotwise.app', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80'),
  ('liamscabin', 'Liam''s Cabin', 'Travel & Staycation', 'liamscabin.slotwise.app', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80')
on conflict (slug) do nothing;
