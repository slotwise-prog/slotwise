-- Reapply the minimum policy required for anonymous public bookings.
-- Public users can INSERT only for businesses explicitly marked ACTIVE.
-- No public SELECT, UPDATE, or DELETE policy is created.

create or replace function public.is_active_business(target_slug text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.businesses
    where businesses.slug = target_slug
      and upper(coalesce(businesses.status, '')) = 'ACTIVE'
  );
$$;

revoke all on function public.is_active_business(text) from public;
grant execute on function public.is_active_business(text) to anon, authenticated;

alter table public.bookings enable row level security;

drop policy if exists "Allow public booking inserts" on public.bookings;
create policy "Allow public booking inserts"
on public.bookings
for insert
to anon, authenticated
with check (public.is_active_business(bookings.business_slug));

alter table public.booking_items enable row level security;

drop policy if exists "Allow public booking item inserts" on public.booking_items;
create policy "Allow public booking item inserts"
on public.booking_items
for insert
to anon, authenticated
with check (public.is_active_business(booking_items.business_slug));

notify pgrst, 'reload schema';
