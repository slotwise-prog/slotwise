-- Narrow public onboarding insert policy.
-- Anonymous users may create review requests only; no public read/update/delete access is granted.

alter table public.setup_requests enable row level security;

drop policy if exists "Allow public setup inserts" on public.setup_requests;
create policy "Allow public setup inserts"
on public.setup_requests
for insert
to anon, authenticated
with check (
  status = 'Ready for review'
  and length(trim(business_name)) between 2 and 160
  and length(trim(owner_name)) between 2 and 160
  and length(trim(contact)) between 3 and 80
  and length(trim(industry)) between 2 and 120
  and (contact_email is null or length(trim(contact_email)) <= 320)
  and (selected_package is null or selected_package in ('STARTER', 'BUSINESS', 'PRO'))
);
