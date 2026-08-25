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
  status text not null default 'Confirmed',
  created_at timestamptz not null default now()
);

create index if not exists bookings_business_slug_idx
on bookings (business_slug);

alter table bookings add column if not exists booking_date text;

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
  description text,
  display_order integer not null default 0,
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

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

insert into businesses (slug, business, industry, booking_link, cover_url)
values
  ('glowbeauty', 'Glow Beauty Studio', 'Salon & Beauty', 'glowbeauty.slotwise.app', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80'),
  ('drjoseclinic', 'Dr. Jose Dental Clinic', 'Clinic & Dental', 'drjoseclinic.slotwise.app', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80'),
  ('liamscabin', 'Liam''s Cabin', 'Travel & Staycation', 'liamscabin.slotwise.app', 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80')
on conflict (slug) do nothing;
