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
alter table businesses add column if not exists demo_started_at timestamptz;
alter table businesses add column if not exists demo_expires_at timestamptz;
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
  pricing_type text not null default 'FIXED',
  pricing_unit text not null default 'FLAT',
  pricing_tiers jsonb not null default '[]'::jsonb,
  description text,
  display_order integer not null default 0,
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

alter table business_services add column if not exists pricing_type text not null default 'FIXED';
alter table business_services add column if not exists pricing_unit text not null default 'FLAT';
alter table business_services add column if not exists pricing_tiers jsonb not null default '[]'::jsonb;
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'business_services_pricing_type_allowed'
  ) then
    alter table business_services drop constraint business_services_pricing_type_allowed;
  end if;

  alter table business_services add constraint business_services_pricing_type_allowed
  check (pricing_type in ('PER_PAX', 'GROUP_TIER', 'PER_TRIP', 'PER_DAY', 'FIXED')) not valid;
end $$;
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'business_services_pricing_unit_allowed'
  ) then
    alter table business_services drop constraint business_services_pricing_unit_allowed;
  end if;

  alter table business_services add constraint business_services_pricing_unit_allowed
  check (pricing_unit in ('FLAT', 'PER_PAX', 'PER_PERSON', 'PER_GROUP', 'PER_TRIP', 'PER_DAY', 'FIXED')) not valid;
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

create table if not exists business_payment_settings (
  id text primary key,
  business_slug text not null unique references businesses(slug) on delete cascade,
  enabled boolean not null default false,
  requirement_type text not null default 'NO_PAYMENT_REQUIRED',
  deposit_type text not null default 'FIXED_AMOUNT',
  deposit_value numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'business_payment_settings_requirement_allowed'
  ) then
    alter table business_payment_settings drop constraint business_payment_settings_requirement_allowed;
  end if;

  alter table business_payment_settings add constraint business_payment_settings_requirement_allowed
  check (requirement_type in ('NO_PAYMENT_REQUIRED', 'DEPOSIT_REQUIRED', 'FULL_PAYMENT_REQUIRED')) not valid;
end $$;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'business_payment_settings_deposit_type_allowed'
  ) then
    alter table business_payment_settings drop constraint business_payment_settings_deposit_type_allowed;
  end if;

  alter table business_payment_settings add constraint business_payment_settings_deposit_type_allowed
  check (deposit_type in ('FIXED_AMOUNT', 'PERCENTAGE')) not valid;
end $$;

create index if not exists business_payment_settings_business_slug_idx
on business_payment_settings (business_slug);

create table if not exists business_payment_methods (
  id text primary key,
  business_slug text not null references businesses(slug) on delete cascade,
  method_type text not null default 'GCASH',
  method_name text not null,
  account_name text not null,
  account_number text not null,
  instructions text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'business_payment_methods_type_allowed'
  ) then
    alter table business_payment_methods drop constraint business_payment_methods_type_allowed;
  end if;

  alter table business_payment_methods add constraint business_payment_methods_type_allowed
  check (method_type in ('GCASH', 'MAYA', 'BANK_TRANSFER', 'OTHER')) not valid;
end $$;

create index if not exists business_payment_methods_business_slug_idx
on business_payment_methods (business_slug);

create table if not exists booking_payments (
  id text primary key,
  booking_id text not null references bookings(id) on delete cascade,
  business_slug text not null references businesses(slug) on delete cascade,
  payment_method text not null,
  amount_submitted numeric not null default 0,
  reference_number text not null,
  customer_note text,
  payment_status text not null default 'PENDING_VERIFICATION',
  rejection_note text,
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references auth.users(id)
);

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'booking_payments_status_allowed'
  ) then
    alter table booking_payments drop constraint booking_payments_status_allowed;
  end if;

  alter table booking_payments add constraint booking_payments_status_allowed
  check (payment_status in ('AWAITING_PAYMENT', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED')) not valid;
end $$;

create index if not exists booking_payments_business_slug_idx
on booking_payments (business_slug);

create index if not exists booking_payments_booking_id_idx
on booking_payments (booking_id);

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
          or (upper(capability) in ('BLOCKED_DATES', 'CUSTOMER_HISTORY', 'ENHANCED_STATS', 'RESERVATION_CALENDAR', 'PAYMENT_VERIFICATION')
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
  service_status text,
  service_pricing_type text default 'FIXED',
  service_pricing_unit text default 'FLAT',
  service_pricing_tiers jsonb default '[]'::jsonb,
  service_display_order integer default 0
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
    pricing_type,
    pricing_unit,
    pricing_tiers,
    duration_minutes,
    display_order,
    status
  )
  values (
    service_id,
    target_slug,
    service_name,
    service_description,
    service_price,
    coalesce(service_pricing_type, 'FIXED'),
    coalesce(service_pricing_unit, 'FLAT'),
    coalesce(service_pricing_tiers, '[]'::jsonb),
    service_duration,
    coalesce(service_display_order, 0),
    service_status
  )
  on conflict (id)
  do update set
    name = excluded.name,
    description = excluded.description,
    price = excluded.price,
    pricing_type = excluded.pricing_type,
    pricing_unit = excluded.pricing_unit,
    pricing_tiers = excluded.pricing_tiers,
    duration_minutes = excluded.duration_minutes,
    display_order = excluded.display_order,
    status = excluded.status
  where business_services.business_slug = target_slug;
end;
$$;

create or replace function public.delete_client_service(service_id_value text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_slug text;
begin
  select business_slug into target_slug
  from business_services
  where id = service_id_value;

  if target_slug is null or not public.business_has_package_capability(target_slug, 'SERVICES') then
    raise exception 'This package cannot delete services.';
  end if;

  delete from business_services
  where id = service_id_value
    and business_slug = target_slug;
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

create or replace function public.upsert_client_payment_settings(
  target_slug text,
  enabled_value boolean,
  requirement_type_value text,
  deposit_type_value text,
  deposit_value_value numeric
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.business_has_package_capability(target_slug, 'PAYMENT_VERIFICATION') then
    raise exception 'This package cannot manage payment verification.';
  end if;

  insert into business_payment_settings (
    id,
    business_slug,
    enabled,
    requirement_type,
    deposit_type,
    deposit_value,
    updated_at
  )
  values (
    'PAYSET-' || target_slug,
    target_slug,
    coalesce(enabled_value, false),
    coalesce(requirement_type_value, 'NO_PAYMENT_REQUIRED'),
    coalesce(deposit_type_value, 'FIXED_AMOUNT'),
    coalesce(deposit_value_value, 0),
    now()
  )
  on conflict (business_slug)
  do update set
    enabled = excluded.enabled,
    requirement_type = excluded.requirement_type,
    deposit_type = excluded.deposit_type,
    deposit_value = excluded.deposit_value,
    updated_at = now()
  where business_payment_settings.business_slug = target_slug;
end;
$$;

create or replace function public.upsert_client_payment_method(
  method_id_value text,
  target_slug text,
  method_type_value text,
  method_name_value text,
  account_name_value text,
  account_number_value text,
  instructions_value text,
  active_value boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.business_has_package_capability(target_slug, 'PAYMENT_VERIFICATION') then
    raise exception 'This package cannot manage payment verification.';
  end if;

  insert into business_payment_methods (
    id,
    business_slug,
    method_type,
    method_name,
    account_name,
    account_number,
    instructions,
    active,
    updated_at
  )
  values (
    method_id_value,
    target_slug,
    coalesce(method_type_value, 'GCASH'),
    method_name_value,
    account_name_value,
    account_number_value,
    instructions_value,
    coalesce(active_value, true),
    now()
  )
  on conflict (id)
  do update set
    method_type = excluded.method_type,
    method_name = excluded.method_name,
    account_name = excluded.account_name,
    account_number = excluded.account_number,
    instructions = excluded.instructions,
    active = excluded.active,
    updated_at = now()
  where business_payment_methods.business_slug = target_slug;
end;
$$;

create or replace function public.submit_public_booking_payment(
  booking_id_value text,
  business_slug_value text,
  payment_method_value text,
  amount_submitted_value numeric,
  reference_number_value text,
  customer_note_value text
)
returns table (
  id text,
  payment_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  next_id text;
begin
  if not public.is_active_business(business_slug_value) then
    raise exception 'This business is not accepting live payments.';
  end if;

  if not exists (
    select 1
    from bookings
    where bookings.id = booking_id_value
      and bookings.business_slug = business_slug_value
  ) then
    raise exception 'Booking was not found.';
  end if;

  if not exists (
    select 1
    from business_payment_settings
    where business_slug = business_slug_value
      and enabled = true
      and requirement_type <> 'NO_PAYMENT_REQUIRED'
  ) then
    raise exception 'Payment verification is not enabled for this business.';
  end if;

  if not exists (
    select 1
    from business_payment_methods
    where business_slug = business_slug_value
      and active = true
      and method_type = payment_method_value
  ) then
    raise exception 'Payment method is not available.';
  end if;

  next_id := 'PAY-' || booking_id_value || '-' || floor(extract(epoch from clock_timestamp()) * 1000)::bigint::text;

  return query
  insert into booking_payments (
    id,
    booking_id,
    business_slug,
    payment_method,
    amount_submitted,
    reference_number,
    customer_note,
    payment_status
  )
  values (
    next_id,
    booking_id_value,
    business_slug_value,
    payment_method_value,
    coalesce(amount_submitted_value, 0),
    reference_number_value,
    customer_note_value,
    'PENDING_VERIFICATION'
  )
  returning booking_payments.id, booking_payments.payment_status;
end;
$$;

create or replace function public.verify_booking_payment(payment_id_value text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_slug text;
begin
  select business_slug into target_slug
  from booking_payments
  where id = payment_id_value;

  if target_slug is null or not public.business_has_package_capability(target_slug, 'PAYMENT_VERIFICATION') then
    raise exception 'This package cannot verify payments.';
  end if;

  update booking_payments
  set payment_status = 'VERIFIED',
      verified_at = now(),
      verified_by = auth.uid(),
      rejection_note = null
  where id = payment_id_value
    and business_slug = target_slug;
end;
$$;

create or replace function public.reject_booking_payment(payment_id_value text, rejection_note_value text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_slug text;
begin
  select business_slug into target_slug
  from booking_payments
  where id = payment_id_value;

  if target_slug is null or not public.business_has_package_capability(target_slug, 'PAYMENT_VERIFICATION') then
    raise exception 'This package cannot verify payments.';
  end if;

  update booking_payments
  set payment_status = 'REJECTED',
      rejection_note = rejection_note_value,
      verified_at = null,
      verified_by = null
  where id = payment_id_value
    and business_slug = target_slug;
end;
$$;

grant execute on function public.business_has_package_capability(text, text) to authenticated;
grant execute on function public.upsert_client_service(text, text, text, text, numeric, integer, text, text, text, jsonb, integer) to authenticated;
grant execute on function public.delete_client_service(text) to authenticated;
grant execute on function public.update_client_availability(text, text, text, jsonb) to authenticated;
grant execute on function public.upsert_client_blocked_date(text, text, date, text) to authenticated;
grant execute on function public.set_client_blocked_date_active(text, boolean) to authenticated;
grant execute on function public.upsert_client_payment_settings(text, boolean, text, text, numeric) to authenticated;
grant execute on function public.upsert_client_payment_method(text, text, text, text, text, text, text, boolean) to authenticated;
grant execute on function public.submit_public_booking_payment(text, text, text, numeric, text, text) to anon, authenticated;
grant execute on function public.verify_booking_payment(text) to authenticated;
grant execute on function public.reject_booking_payment(text, text) to authenticated;

insert into businesses (slug, business, industry, booking_link, cover_url)
values
  ('glowbeauty', 'Glow Beauty Studio', 'Salon & Beauty', 'glowbeauty.slotwise.app', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'),
  ('drjoseclinic', 'Dr. Jose Dental Clinic', 'Clinic & Dental', 'drjoseclinic.slotwise.app', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80'),
  ('liamscabin', 'Liam''s Cabin', 'Travel & Staycation', 'liamscabin.slotwise.app', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80')
on conflict (slug) do nothing;
