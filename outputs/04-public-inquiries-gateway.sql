begin;

create extension if not exists pgcrypto;

alter table public.inquiries add column if not exists reference text;
create unique index if not exists inquiries_reference_unique_idx on public.inquiries(reference) where reference is not null;

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'inquiries_status_allowed'
  ) then
    alter table public.inquiries drop constraint inquiries_status_allowed;
  end if;

  alter table public.inquiries add constraint inquiries_status_allowed
  check (status in ('NEW', 'IN_PROGRESS', 'REPLIED', 'CLOSED', 'CONTACTED', 'PENDING', 'CONFIRMED', 'DECLINED', 'CANCELLED')) not valid;
end $$;

create or replace function public.submit_public_inquiry(
  business_slug_value text,
  customer_name_value text,
  phone_value text,
  email_value text default null,
  service_interest_value text default null,
  message_value text default null
)
returns table (
  id text,
  business_slug text,
  reference text,
  customer_name text,
  phone text,
  email text,
  service_interest text,
  message text,
  status text,
  source text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_business public.businesses%rowtype;
  target_id text;
  target_reference text;
  target_slug text := lower(trim(business_slug_value));
begin
  if target_slug is null or target_slug = '' then
    raise exception 'Business is required.';
  end if;
  if length(trim(coalesce(customer_name_value, ''))) < 2 then
    raise exception 'Full name is required.';
  end if;
  if length(trim(coalesce(phone_value, ''))) < 5 then
    raise exception 'Contact number is required.';
  end if;
  if length(trim(coalesce(message_value, ''))) < 3 then
    raise exception 'Inquiry details are required.';
  end if;

  select * into target_business
  from public.businesses
  where slug = target_slug
    and upper(status) = 'ACTIVE';

  if target_business.slug is null then
    raise exception 'This business is not currently accepting public inquiries.';
  end if;
  if coalesce((target_business.feature_flags->>'accept_inquiries')::boolean, upper(target_business.booking_mode) = 'INQUIRY') = false then
    raise exception 'This business is not currently accepting inquiries.';
  end if;

  target_id := 'INQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 20));
  target_reference := 'INQ-' || upper(substr(regexp_replace(target_slug, '[^a-zA-Z0-9]', '', 'g'), 1, 6))
    || '-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.inquiries (
    id, business_slug, reference, customer_name, phone, email, service_interest, message, status, source
  ) values (
    target_id, target_slug, target_reference, trim(customer_name_value), trim(phone_value), nullif(trim(coalesce(email_value, '')), ''),
    nullif(trim(coalesce(service_interest_value, '')), ''), trim(message_value), 'NEW', 'Website'
  );

  return query
  select i.id, i.business_slug, target_reference, i.customer_name, i.phone, i.email,
    i.service_interest, i.message, i.status, i.source, i.created_at
  from public.inquiries i
  where i.id = target_id;
end;
$$;

revoke all on function public.submit_public_inquiry(text, text, text, text, text, text) from public;
grant execute on function public.submit_public_inquiry(text, text, text, text, text, text) to anon, authenticated;

commit;
