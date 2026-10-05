begin;

create table if not exists public.slotwise_updates (
  id text primary key,
  title text not null,
  summary text not null,
  content text,
  update_type text not null default 'UPDATE',
  applicable_packages text[] not null default array['ALL']::text[],
  feature_badge text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  constraint slotwise_updates_type_allowed
    check (update_type in ('UPDATE', 'NEW_FEATURE', 'IMPROVEMENT', 'FIX', 'IMPORTANT')),
  constraint slotwise_updates_packages_allowed
    check (
      applicable_packages <@ array['ALL', 'STARTER', 'BUSINESS', 'PRO']::text[]
      and array_length(applicable_packages, 1) is not null
    )
);

create index if not exists slotwise_updates_published_idx
  on public.slotwise_updates (is_published, published_at desc);

alter table public.slotwise_updates enable row level security;

drop policy if exists "Authenticated users can read published Slotwise updates" on public.slotwise_updates;
create policy "Authenticated users can read published Slotwise updates"
  on public.slotwise_updates
  for select
  to authenticated
  using (is_published = true);

create table if not exists public.slotwise_update_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  business_slug text not null references public.businesses(slug) on delete cascade,
  last_viewed_at timestamptz not null default now(),
  primary key (user_id, business_slug)
);

alter table public.slotwise_update_reads enable row level security;

drop policy if exists "Business users can read their Slotwise update state" on public.slotwise_update_reads;
create policy "Business users can read their Slotwise update state"
  on public.slotwise_update_reads
  for select
  to authenticated
  using (
    user_id = auth.uid()
    and public.can_manage_business(business_slug)
  );

drop policy if exists "Business users can upsert their Slotwise update state" on public.slotwise_update_reads;
create policy "Business users can upsert their Slotwise update state"
  on public.slotwise_update_reads
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and public.can_manage_business(business_slug)
  );

drop policy if exists "Business users can update their Slotwise update state" on public.slotwise_update_reads;
create policy "Business users can update their Slotwise update state"
  on public.slotwise_update_reads
  for update
  to authenticated
  using (
    user_id = auth.uid()
    and public.can_manage_business(business_slug)
  )
  with check (
    user_id = auth.uid()
    and public.can_manage_business(business_slug)
  );

create or replace function public.mark_slotwise_updates_viewed(business_slug_value text)
returns public.slotwise_update_reads
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_row public.slotwise_update_reads;
begin
  if not public.can_manage_business(business_slug_value) then
    raise exception 'Not allowed to update this business update state.';
  end if;

  insert into public.slotwise_update_reads (user_id, business_slug, last_viewed_at)
  values (auth.uid(), business_slug_value, now())
  on conflict (user_id, business_slug) do update
    set last_viewed_at = excluded.last_viewed_at
  returning * into updated_row;

  return updated_row;
end;
$$;

grant execute on function public.mark_slotwise_updates_viewed(text) to authenticated;

insert into public.slotwise_updates (
  id,
  title,
  summary,
  content,
  update_type,
  applicable_packages,
  feature_badge,
  is_published,
  published_at
) values
  (
    'manual-reservation-creation-2026-09-10',
    'Manual Reservation Creation',
    'Pro users can now create reservations manually directly from the Client Dashboard.',
    'Slotwise Pro users can now create reservations directly from the Client Dashboard for customers who book through Messenger, phone calls, walk-ins, or other offline channels. Manual reservations are saved alongside online bookings, allowing businesses to keep their schedules and customer reservations organized in one place.',
    'NEW_FEATURE',
    array['PRO']::text[],
    'PRO',
    true,
    '2026-09-10 00:00:00+00'
  ),
  (
    'improved-247-scheduling-2026-09-10',
    'Improved 24/7 Scheduling',
    'Businesses marked as 24/7 now use a compact preferred date and time selector instead of fixed office-hour time slots.',
    'Normal business-hour schedules keep their regular available-time-slot behavior.',
    'IMPROVEMENT',
    array['ALL']::text[],
    null,
    true,
    '2026-09-10 00:00:00+00'
  ),
  (
    'booking-pdf-download-2026-10-01',
    'Booking PDF Download',
    'PRO users can now generate professional booking or reservation PDFs directly from the dashboard, while customers can also download their own booking copy after successfully submitting a booking request.',
    E'Booking PDF Download is now available for both businesses and customers under the PRO Package.\n\nBusiness owners can generate and download a professional PDF directly from Booking / Reservation Details.\n\nCustomers can also download their own booking copy from the confirmation screen after successfully submitting a booking request.\n\nThe PDF may include applicable business information, customer details, booking or reservation information, booking reference, current status, pricing information, schedule details, and template-specific information in a clean printable format.\n\nCustomer PDFs contain customer-safe booking information only and do not expose private dashboard or internal management information.\n\nHOW TO USE:\nBusiness: Bookings / Requests -> View Details -> Download PDF\nCustomer: Complete Booking -> Submit Successfully -> Confirmation -> Download Booking PDF',
    'NEW_FEATURE',
    array['PRO']::text[],
    'PRO FEATURE',
    true,
    '2026-10-01 00:00:00+00'
  )
on conflict (id) do update set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  update_type = excluded.update_type,
  applicable_packages = excluded.applicable_packages,
  feature_badge = excluded.feature_badge,
  is_published = excluded.is_published,
  published_at = excluded.published_at;

commit;
