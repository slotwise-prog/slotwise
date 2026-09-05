begin;

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
  if upper(next_status) not in (
    'PENDING',
    'QUOTATION_SENT',
    'WAITING_FOR_APPROVAL',
    'FOR_AMENDMENT',
    'CONFIRMED',
    'COMPLETED',
    'CANCELLED'
  ) then
    raise exception 'Invalid booking status';
  end if;

  return query
  update public.bookings
  set status = upper(next_status)
  where bookings.id = booking_id
    and public.can_manage_business(bookings.business_slug)
  returning bookings.id, bookings.business_slug, bookings.status;
end;
$$;

revoke all on function public.update_client_booking_status(text, text) from public;
grant execute on function public.update_client_booking_status(text, text) to authenticated;

commit;
