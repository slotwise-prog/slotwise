begin;

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
  target_accept_inquiries boolean;
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

  select b.* into target_business
  from public.businesses as b
  where b.slug = target_slug
    and upper(b.status) = 'ACTIVE';

  if target_business.slug is null then
    raise exception 'This business is not currently accepting public inquiries.';
  end if;

  -- The frontend business configuration uses camelCase JSON keys. The
  -- snake_case fallback keeps older manually-authored records compatible.
  target_accept_inquiries := coalesce(
    (target_business.feature_flags->>'acceptInquiries')::boolean,
    (target_business.feature_flags->>'accept_inquiries')::boolean,
    upper(target_business.booking_mode) = 'INQUIRY'
  );
  if target_accept_inquiries is not true then
    raise exception 'This business is not currently accepting inquiries.';
  end if;

  target_id := 'INQ-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 20));
  target_reference := 'INQ-' || upper(substr(regexp_replace(target_slug, '[^a-zA-Z0-9]', '', 'g'), 1, 6))
    || '-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.inquiries as i (
    id, business_slug, reference, customer_name, phone, email, service_interest, message, status, source
  ) values (
    target_id, target_slug, target_reference, trim(customer_name_value), trim(phone_value), nullif(trim(coalesce(email_value, '')), ''),
    nullif(trim(coalesce(service_interest_value, '')), ''), trim(message_value), 'NEW', 'Website'
  );

  return query
  select i.id, i.business_slug, i.reference, i.customer_name, i.phone, i.email,
    i.service_interest, i.message, i.status, i.source, i.created_at
  from public.inquiries as i
  where i.id = target_id;
end;
$$;

revoke all on function public.submit_public_inquiry(text, text, text, text, text, text) from public;
grant execute on function public.submit_public_inquiry(text, text, text, text, text, text) to anon, authenticated;

commit;
