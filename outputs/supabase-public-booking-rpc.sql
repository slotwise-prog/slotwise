create or replace function public.submit_public_booking(booking_payload jsonb)
returns public.bookings
language plpgsql
security definer
set search_path = public
as $$
declare saved_booking public.bookings;
begin
  if not public.is_active_business(booking_payload->>'business_slug') then
    raise exception 'This business is not accepting public bookings.' using errcode = '42501';
  end if;
  insert into public.bookings (id, customer, contact, business, business_slug, service, booking_date, slot, note, metadata, status, estimated_total)
  values (
    booking_payload->>'id', booking_payload->>'customer', booking_payload->>'contact', booking_payload->>'business',
    booking_payload->>'business_slug', booking_payload->>'service', booking_payload->>'booking_date', booking_payload->>'slot',
    booking_payload->>'note', coalesce(booking_payload->'metadata', '{}'::jsonb), 'PENDING',
    nullif(booking_payload->>'estimated_total', '')::numeric
  ) returning * into saved_booking;
  return saved_booking;
end;
$$;

revoke all on function public.submit_public_booking(jsonb) from public;
grant execute on function public.submit_public_booking(jsonb) to anon, authenticated;

create or replace function public.submit_public_booking_items(booking_id_value text, business_slug_value text, items_payload jsonb)
returns setof public.booking_items
language plpgsql
security definer
set search_path = public
as $$
declare item jsonb; saved_item public.booking_items;
begin
  if not public.is_active_business(business_slug_value) then raise exception 'This business is not accepting public bookings.' using errcode = '42501'; end if;
  if not exists (select 1 from public.bookings where id = booking_id_value and business_slug = business_slug_value) then raise exception 'Booking was not found.'; end if;
  for item in select * from jsonb_array_elements(coalesce(items_payload, '[]'::jsonb)) loop
    insert into public.booking_items (id, booking_id, business_slug, service_id, service_name_snapshot, pricing_type_snapshot, unit_price_snapshot, quantity, selected_tier_snapshot, line_total)
    values (item->>'id', booking_id_value, business_slug_value, item->>'service_id', coalesce(item->>'service_name_snapshot','Service'), coalesce(item->>'pricing_type_snapshot','FIXED'), nullif(item->>'unit_price_snapshot','')::numeric, coalesce((item->>'quantity')::numeric,1), item->'selected_tier_snapshot', nullif(item->>'line_total','')::numeric)
    returning * into saved_item;
    return next saved_item;
  end loop;
end;
$$;

revoke all on function public.submit_public_booking_items(text, text, jsonb) from public;
grant execute on function public.submit_public_booking_items(text, text, jsonb) to anon, authenticated;
