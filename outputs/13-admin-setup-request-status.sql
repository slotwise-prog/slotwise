-- Allow only active SMM administrators to review onboarding requests.
-- Public users retain insert-only access; no public read/update/delete access is added.

drop policy if exists "Allow admin setup request updates" on public.setup_requests;
create policy "Allow admin setup request updates"
on public.setup_requests for update
to authenticated
using (public.is_smm_admin())
with check (public.is_smm_admin());
