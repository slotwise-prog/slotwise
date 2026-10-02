begin;

create extension if not exists pgcrypto;

alter table public.bookings
  add column if not exists public_possession_token_hash text;

create index if not exists bookings_public_possession_hash_idx
  on public.bookings (public_possession_token_hash);

create or replace function public.validate_booking_possession(
  booking_id_value text,
  business_slug_value text,
  raw_token_value text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select nullif(raw_token_value, '') is not null
    and exists (
      select 1 from public.bookings
      where id = booking_id_value
        and business_slug = business_slug_value
        and public_possession_token_hash = encode(extensions.digest(raw_token_value::text, 'sha256'::text), 'hex')
    );
$$;

revoke all on function public.validate_booking_possession(text, text, text) from public;
grant execute on function public.validate_booking_possession(text, text, text) to anon, authenticated;

drop function if exists public.submit_public_booking(jsonb);
create or replace function public.submit_public_booking(booking_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  saved_booking public.bookings;
  raw_token text;
begin
  if not public.can_accept_public_bookings(booking_payload->>'business_slug') then
    raise exception 'This business is not accepting public bookings.' using errcode = '42501';
  end if;

  raw_token := encode(extensions.gen_random_bytes(32), 'hex');

  insert into public.bookings (
    id, customer, contact, business, business_slug, service, booking_date,
    slot, note, metadata, status, estimated_total, public_possession_token_hash
  ) values (
    booking_payload->>'id',
    booking_payload->>'customer',
    booking_payload->>'contact',
    booking_payload->>'business',
    booking_payload->>'business_slug',
    booking_payload->>'service',
    booking_payload->>'booking_date',
    booking_payload->>'slot',
    booking_payload->>'note',
    coalesce(booking_payload->'metadata', '{}'::jsonb)
      || jsonb_build_object(
        'source', coalesce(booking_payload->'metadata'->>'source', 'online'),
        'test_booking', exists (
          select 1 from public.businesses
          where slug = booking_payload->>'business_slug'
            and upper(status) = 'DEMO'
        )
      ),
    'PENDING',
    nullif(booking_payload->>'estimated_total', '')::numeric,
    encode(extensions.digest(raw_token::text, 'sha256'::text), 'hex')
  ) returning * into saved_booking;

  return (to_jsonb(saved_booking) - 'public_possession_token_hash')
    || jsonb_build_object('public_possession_token', raw_token);
end;
$$;

revoke all on function public.submit_public_booking(jsonb) from public;
grant execute on function public.submit_public_booking(jsonb) to anon, authenticated;

commit;
