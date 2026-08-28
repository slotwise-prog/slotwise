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
alter table bookings add column if not exists estimated_total numeric;

create or replace function public.clear_untrusted_booking_totals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.estimated_total := null;
  new.metadata := coalesce(new.metadata, '{}'::jsonb) - 'estimated_total' - 'line_items';
  return new;
end;
$$;

drop trigger if exists clear_untrusted_booking_totals_trigger on bookings;
create trigger clear_untrusted_booking_totals_trigger
before insert on bookings
for each row execute function public.clear_untrusted_booking_totals();

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
alter table businesses add column if not exists page_background_color text;
alter table businesses add column if not exists page_background_type text not null default 'SOLID';
alter table businesses add column if not exists page_background_color_2 text;
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
  check (booking_template in ('GENERAL', 'BEAUTY', 'CLINIC', 'PROFESSIONAL_SERVICES', 'HOME_SERVICE', 'AUTO', 'CAR_WASH', 'LAUNDRY', 'TOURS_TRAVEL', 'STAYCATION_ACCOMMODATION')) not valid;
end $$;
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'businesses_background_type_allowed'
  ) then
    alter table businesses drop constraint businesses_background_type_allowed;
  end if;

  alter table businesses add constraint businesses_background_type_allowed
  check (page_background_type in ('SOLID', 'GRADIENT')) not valid;
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
  "staffSelectionEnabled": false,
  "allowMultipleServices": false
}'::jsonb;

create table if not exists booking_items (
  id text primary key,
  booking_id text not null references bookings(id) on delete cascade,
  business_slug text not null references businesses(slug) on delete cascade,
  service_id text,
  service_name_snapshot text not null,
  pricing_type_snapshot text not null default 'FIXED',
  unit_price_snapshot numeric,
  quantity numeric not null default 1,
  selected_tier_snapshot jsonb,
  line_total numeric,
  created_at timestamptz not null default now()
);

alter table booking_items add column if not exists service_id text;
alter table booking_items add column if not exists service_name_snapshot text not null default 'Service';
alter table booking_items add column if not exists pricing_type_snapshot text not null default 'FIXED';
alter table booking_items add column if not exists unit_price_snapshot numeric;
alter table booking_items add column if not exists quantity numeric not null default 1;
alter table booking_items add column if not exists selected_tier_snapshot jsonb;
alter table booking_items add column if not exists line_total numeric;

create index if not exists booking_items_booking_id_idx
on booking_items (booking_id);

create index if not exists booking_items_business_slug_idx
on booking_items (business_slug);

create table if not exists business_services (
  id text primary key,
  business_slug text not null references businesses(slug) on delete cascade,
  name text not null,
  duration_minutes integer,
  price numeric,
  pricing_type text not null default 'FIXED',
  pricing_unit text not null default 'FLAT',
  pricing_tiers jsonb not null default '[]'::jsonb,
  max_guests integer,
  included_guests integer,
  extra_guest_fee numeric,
  service_category text,
  image_url text,
  image_title text,
  image_caption text,
  unit_quantity integer not null default 1,
  description text,
  display_order integer not null default 0,
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

alter table business_services add column if not exists pricing_type text not null default 'FIXED';
alter table business_services add column if not exists pricing_unit text not null default 'FLAT';
alter table business_services add column if not exists pricing_tiers jsonb not null default '[]'::jsonb;
alter table business_services add column if not exists max_guests integer;
alter table business_services add column if not exists included_guests integer;
alter table business_services add column if not exists extra_guest_fee numeric;
alter table business_services add column if not exists service_category text;
alter table business_services add column if not exists image_url text;
alter table business_services add column if not exists image_title text;
alter table business_services add column if not exists image_caption text;
alter table business_services add column if not exists unit_quantity integer not null default 1;
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'business_services_pricing_type_allowed'
  ) then
    alter table business_services drop constraint business_services_pricing_type_allowed;
  end if;

  alter table business_services add constraint business_services_pricing_type_allowed
  check (pricing_type in ('PER_PAX', 'GROUP_TIER', 'PER_TRIP', 'PER_DAY', 'PER_NIGHT', 'FIXED')) not valid;
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
  check (pricing_unit in ('FLAT', 'PER_PAX', 'PER_PERSON', 'PER_GROUP', 'PER_TRIP', 'PER_DAY', 'PER_NIGHT', 'FIXED')) not valid;
end $$;

create index if not exists business_services_business_slug_idx
on business_services (business_slug);

create or replace function public.prevent_accommodation_double_booking()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  template_value text;
  check_in_value date;
  check_out_value date;
  requested_guests integer;
  matching_unit business_services%rowtype;
  overlap_count integer;
begin
  template_value := coalesce(new.metadata->>'booking_template', '');
  if template_value <> 'STAYCATION_ACCOMMODATION' then
    return new;
  end if;

  check_in_value := nullif(new.metadata->>'check_in', '')::date;
  check_out_value := nullif(new.metadata->>'check_out', '')::date;
  requested_guests := greatest(coalesce((new.metadata->>'guest_count')::integer, 1), 1);

  if check_in_value is null or check_out_value is null or check_out_value <= check_in_value then
    raise exception 'Check-out date must be after check-in date.';
  end if;

  select *
  into matching_unit
  from business_services
  where business_slug = new.business_slug
    and name = new.service
    and status <> 'Inactive'
  order by display_order asc
  limit 1;

  if matching_unit.id is null then
    raise exception 'Selected unit is not available.';
  end if;

  if matching_unit.max_guests is not null and requested_guests > matching_unit.max_guests then
    raise exception 'This unit cannot accommodate the selected number of guests.';
  end if;

  select count(*)
  into overlap_count
  from bookings
  where business_slug = new.business_slug
    and service = new.service
    and upper(status) in ('PENDING', 'CONFIRMED')
    and coalesce(metadata->>'booking_template', '') = 'STAYCATION_ACCOMMODATION'
    and nullif(metadata->>'check_in', '')::date < check_out_value
    and nullif(metadata->>'check_out', '')::date > check_in_value;

  if overlap_count >= greatest(coalesce(matching_unit.unit_quantity, 1), 1) then
    raise exception 'This unit is unavailable for the selected dates.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_accommodation_double_booking_trigger on bookings;
create trigger prevent_accommodation_double_booking_trigger
before insert on bookings
for each row execute function public.prevent_accommodation_double_booking();

create or replace function public.normalize_booking_item_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  service_row business_services%rowtype;
  pax numeric;
  tier jsonb;
  included_guest_count numeric;
  extra_guest_count numeric;
  nightly_extra_fee numeric;
begin
  if not exists (
    select 1
    from businesses
    where businesses.slug = new.business_slug
      and upper(businesses.status) = 'ACTIVE'
  ) then
    raise exception 'Booking items can only be saved for active businesses.';
  end if;

  if not exists (
    select 1
    from bookings
    where bookings.id = new.booking_id
      and bookings.business_slug = new.business_slug
  ) then
    raise exception 'Booking item does not match an existing booking.';
  end if;

  select *
  into service_row
  from business_services
  where business_slug = new.business_slug
    and status <> 'Inactive'
    and (
      (new.service_id is not null and id = new.service_id)
      or (new.service_id is null and name = new.service_name_snapshot)
    )
  order by display_order asc
  limit 1;

  if service_row.id is null then
    raise exception 'Selected service is not available.';
  end if;

  pax := greatest(coalesce(new.quantity, 1), 1);

  new.service_id := service_row.id;
  new.service_name_snapshot := service_row.name;
  new.pricing_type_snapshot := coalesce(service_row.pricing_type, 'FIXED');
  new.quantity := case
    when new.pricing_type_snapshot in ('PER_PAX', 'PER_DAY') then pax
    else 1
  end;

  if service_row.price is null and new.pricing_type_snapshot <> 'GROUP_TIER' then
    raise exception 'Selected service has incomplete pricing.';
  end if;

  if new.pricing_type_snapshot = 'GROUP_TIER' then
    select item
    into tier
    from jsonb_array_elements(coalesce(service_row.pricing_tiers, '[]'::jsonb)) item
    where pax >= (item->>'minGuests')::numeric
      and pax <= (item->>'maxGuests')::numeric
    order by (item->>'minGuests')::numeric asc
    limit 1;

    if tier is null then
      raise exception 'No group pricing tier matches this guest count.';
    end if;

    new.unit_price_snapshot := (tier->>'price')::numeric;
    new.selected_tier_snapshot := tier;
    new.line_total := (tier->>'price')::numeric;
    new.quantity := pax;
  elsif new.pricing_type_snapshot = 'PER_NIGHT' then
    included_guest_count := greatest(coalesce(service_row.included_guests, service_row.max_guests, 1), 1);
    extra_guest_count := greatest(coalesce((new.selected_tier_snapshot->>'totalGuests')::numeric, included_guest_count) - included_guest_count, 0);
    nightly_extra_fee := coalesce(service_row.extra_guest_fee, 0);
    new.unit_price_snapshot := service_row.price;
    new.line_total := (service_row.price * pax) + (nightly_extra_fee * extra_guest_count * pax);
    new.selected_tier_snapshot := jsonb_build_object(
      'nights', pax,
      'totalGuests', coalesce((new.selected_tier_snapshot->>'totalGuests')::numeric, included_guest_count),
      'includedGuests', included_guest_count,
      'extraGuests', extra_guest_count,
      'extraGuestFee', nightly_extra_fee
    );
  elsif new.pricing_type_snapshot in ('PER_PAX', 'PER_DAY') then
    new.unit_price_snapshot := service_row.price;
    new.line_total := service_row.price * pax;
  else
    new.unit_price_snapshot := service_row.price;
    new.line_total := service_row.price;
    new.quantity := 1;
  end if;

  return new;
end;
$$;

create or replace function public.sync_booking_estimated_total()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_booking_id text;
begin
  target_booking_id := coalesce(new.booking_id, old.booking_id);

  update bookings
  set estimated_total = (
    select coalesce(sum(line_total), 0)
    from booking_items
    where booking_items.booking_id = target_booking_id
  ),
  metadata = jsonb_set(
    coalesce(metadata, '{}'::jsonb),
    '{estimated_total}',
    to_jsonb((
      select coalesce(sum(line_total), 0)
      from booking_items
      where booking_items.booking_id = target_booking_id
    )),
    true
  )
  where bookings.id = target_booking_id;

  return coalesce(new, old);
end;
$$;

drop trigger if exists normalize_booking_item_snapshot_trigger on booking_items;
create trigger normalize_booking_item_snapshot_trigger
before insert or update on booking_items
for each row execute function public.normalize_booking_item_snapshot();

drop trigger if exists sync_booking_estimated_total_trigger on booking_items;
create trigger sync_booking_estimated_total_trigger
after insert or update or delete on booking_items
for each row execute function public.sync_booking_estimated_total();

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

create table if not exists smm_offers (
  id text primary key default 'global',
  enabled boolean not null default true,
  show_on_demo boolean not null default true,
  show_on_dashboard boolean not null default true,
  cta_label text not null default 'Message SMM Solutions',
  offer_one_title text not null default 'Need help getting started?',
  offer_one_message text not null default 'We can guide you through setup, branding, and the right package for your business.',
  offer_one_image_url text,
  offer_two_title text not null default 'Want to upgrade your page?',
  offer_two_message text not null default 'We can unlock more controls as your business grows without changing your booking flow.',
  offer_two_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists announcements (
  id text primary key,
  title text not null,
  message text not null,
  announcement_type text not null default 'GENERAL',
  image_url text,
  image_clickable boolean not null default true,
  cta_type text not null default 'NONE',
  cta_label text,
  cta_url text,
  cta_destination text,
  placement text not null default 'BOTH',
  business_slug text references businesses(slug) on delete cascade,
  target_packages text[] not null default ARRAY['ALL']::text[],
  target_statuses text[] not null default ARRAY['ALL']::text[],
  enabled boolean not null default true,
  dismissible boolean not null default true,
  priority text not null default 'NORMAL',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table announcements add column if not exists announcement_type text not null default 'GENERAL';
alter table announcements add column if not exists image_url text;
alter table announcements add column if not exists image_clickable boolean not null default true;
alter table announcements add column if not exists cta_type text not null default 'NONE';
alter table announcements add column if not exists cta_label text;
alter table announcements add column if not exists cta_url text;
alter table announcements add column if not exists cta_destination text;
alter table announcements add column if not exists placement text not null default 'BOTH';
alter table announcements add column if not exists business_slug text;
alter table announcements add column if not exists target_packages text[] not null default ARRAY['ALL']::text[];
alter table announcements add column if not exists target_statuses text[] not null default ARRAY['ALL']::text[];
alter table announcements add column if not exists enabled boolean not null default true;
alter table announcements add column if not exists dismissible boolean not null default true;
alter table announcements add column if not exists priority text not null default 'NORMAL';
alter table announcements add column if not exists starts_at timestamptz;
alter table announcements add column if not exists ends_at timestamptz;
alter table announcements add column if not exists created_at timestamptz not null default now();
alter table announcements add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'announcements_type_allowed') then
    alter table announcements drop constraint announcements_type_allowed;
  end if;
alter table announcements add constraint announcements_type_allowed
  check (announcement_type in ('GENERAL', 'PACKAGE_UPSELL', 'RESELLER', 'IMPORTANT_NOTICE')) not valid;
end $$;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'announcements_cta_type_allowed') then
    alter table announcements drop constraint announcements_cta_type_allowed;
  end if;
  alter table announcements add constraint announcements_cta_type_allowed
  check (cta_type in ('NONE', 'MESSENGER', 'INTERNAL_PAGE', 'EXTERNAL_LINK')) not valid;
end $$;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'announcements_placement_allowed') then
    alter table announcements drop constraint announcements_placement_allowed;
  end if;
  alter table announcements add constraint announcements_placement_allowed
  check (placement in ('DEMO_PREVIEW', 'CLIENT_DASHBOARD', 'BOTH')) not valid;
end $$;

do $$
begin
  if exists (select 1 from pg_constraint where conname = 'announcements_priority_allowed') then
    alter table announcements drop constraint announcements_priority_allowed;
  end if;
  alter table announcements add constraint announcements_priority_allowed
  check (priority in ('NORMAL', 'IMPORTANT')) not valid;
end $$;

create index if not exists announcements_enabled_idx on announcements (enabled, priority, created_at desc);
create index if not exists announcements_business_slug_idx on announcements (business_slug);
create index if not exists announcements_cta_type_idx on announcements (cta_type);

create table if not exists announcement_dismissals (
  id text primary key,
  announcement_id text not null references announcements(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  business_slug text not null references businesses(slug) on delete cascade,
  dismissed_at timestamptz not null default now()
);

alter table announcement_dismissals add column if not exists announcement_id text not null;
alter table announcement_dismissals add column if not exists user_id uuid not null;
alter table announcement_dismissals add column if not exists business_slug text not null;
alter table announcement_dismissals add column if not exists dismissed_at timestamptz not null default now();

create unique index if not exists announcement_dismissals_unique_idx
on announcement_dismissals (announcement_id, user_id, business_slug);

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
  service_display_order integer default 0,
  service_max_guests integer default null,
  service_included_guests integer default null,
  service_extra_guest_fee numeric default null,
  service_category text default '',
  service_image_url text default '',
  service_image_title text default '',
  service_image_caption text default '',
  service_unit_quantity integer default 1
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
    max_guests,
    included_guests,
    extra_guest_fee,
    service_category,
    image_url,
    image_title,
    image_caption,
    unit_quantity,
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
    service_max_guests,
    service_included_guests,
    service_extra_guest_fee,
    coalesce(service_category, ''),
    coalesce(service_image_url, ''),
    coalesce(service_image_title, ''),
    coalesce(service_image_caption, ''),
    greatest(coalesce(service_unit_quantity, 1), 1),
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
    max_guests = excluded.max_guests,
    included_guests = excluded.included_guests,
    extra_guest_fee = excluded.extra_guest_fee,
    service_category = excluded.service_category,
    image_url = excluded.image_url,
    image_title = excluded.image_title,
    image_caption = excluded.image_caption,
    unit_quantity = excluded.unit_quantity,
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
grant execute on function public.upsert_client_service(text, text, text, text, numeric, integer, text, text, text, jsonb, integer, integer, integer, numeric, text, text, text, text, integer) to authenticated;
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
  ('glowbeauty', 'Glow Beauty Studio', 'Salon & Beauty', 'glowbeauty.slotwise.app', ''),
  ('drjoseclinic', 'Dr. Jose Dental Clinic', 'Clinic & Dental', 'drjoseclinic.slotwise.app', ''),
  ('liamscabin', 'Liam''s Cabin', 'Travel & Staycation', 'liamscabin.slotwise.app', '')
on conflict (slug) do nothing;

insert into storage.buckets (id, name, public)
values ('business-media', 'business-media', true)
on conflict (id) do update set public = excluded.public;
