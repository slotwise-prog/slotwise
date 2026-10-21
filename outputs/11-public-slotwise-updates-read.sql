-- Allow the public marketing Updates page to read published announcements only.
-- Unpublished/internal updates remain protected by RLS.
begin;

alter table public.slotwise_updates enable row level security;

drop policy if exists "Public can read published Slotwise updates" on public.slotwise_updates;
create policy "Public can read published Slotwise updates"
  on public.slotwise_updates
  for select
  to anon
  using (is_published = true);

commit;
