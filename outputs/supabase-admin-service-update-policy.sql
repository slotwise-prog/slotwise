begin;

alter table public.business_services enable row level security;

drop policy if exists "Allow admin service updates" on public.business_services;

create policy "Allow admin service updates"
on public.business_services
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  )
)
with check (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  )
);

commit;

select policyname, cmd, roles
from pg_policies
where schemaname = 'public'
  and tablename = 'business_services'
order by policyname;
