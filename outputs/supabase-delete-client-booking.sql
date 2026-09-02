create or replace function public.delete_client_booking(booking_id_value text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_slug text;
begin
  select business_slug into target_slug from bookings where id = booking_id_value;
  if target_slug is null then
    raise exception 'Booking was not found.';
  end if;
  if not public.can_manage_business(target_slug) then
    raise exception 'You are not authorized to delete this booking.';
  end if;
  delete from bookings where id = booking_id_value and business_slug = target_slug;
end;
$$;

grant execute on function public.delete_client_booking(text) to authenticated;
