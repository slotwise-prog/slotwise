alter table public.business_users
add column if not exists authorized_branches jsonb not null default '["ALL"]'::jsonb;

create table if not exists public.client_records (
  id text primary key,
  business_slug text not null references public.businesses(slug) on delete cascade,
  full_name text not null,
  contact_number text not null,
  email text,
  assigned_branch text not null,
  notes text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_records_business_slug_idx
on public.client_records (business_slug);

create index if not exists client_records_branch_idx
on public.client_records (business_slug, assigned_branch);

alter table public.client_records enable row level security;

create or replace function public.can_manage_business_branch(target_slug text, target_branch text default null)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_smm_admin()
    or exists (
      select 1
      from public.business_users
      where user_id = auth.uid()
        and business_slug = target_slug
        and active = true
        and (
          target_branch is null
          or coalesce(authorized_branches, '["ALL"]'::jsonb) ? 'ALL'
          or coalesce(authorized_branches, '["ALL"]'::jsonb) ? target_branch
        )
    );
$$;

create or replace function public.business_has_package_capability(target_slug text, capability text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select public.is_smm_admin()
    or exists (
      select 1
      from business_users
      join businesses on businesses.slug = business_users.business_slug
      where business_users.user_id = auth.uid()
        and business_users.business_slug = target_slug
        and business_users.active = true
        and (
          upper(capability) in ('BOOKINGS', 'STATUS')
          or (upper(capability) in ('SERVICES', 'SCHEDULE', 'CUSTOMERS', 'BASIC_STATS')
            and businesses.business_package in ('BUSINESS', 'PRO'))
          or (upper(capability) in ('BLOCKED_DATES', 'CUSTOMER_HISTORY', 'ENHANCED_STATS', 'RESERVATION_CALENDAR', 'PAYMENT_VERIFICATION', 'MANUAL_RESERVATIONS')
            and businesses.business_package = 'PRO')
          or (
            upper(capability) = 'CLIENT_RECORDS'
            and lower(coalesce(
              businesses.feature_flags->>'clientRecords',
              businesses.feature_flags->>'client_records',
              businesses.feature_flags->>'client_records_enabled',
              'false'
            )) in ('true', '1', 'yes', 'enabled')
          )
        )
    );
$$;

drop policy if exists "Allow entitled client record reads" on public.client_records;
create policy "Allow entitled client record reads"
on public.client_records for select
to authenticated
using (
  public.business_has_package_capability(client_records.business_slug, 'CLIENT_RECORDS')
  and public.can_manage_business_branch(client_records.business_slug, client_records.assigned_branch)
);

drop policy if exists "Allow entitled client record inserts" on public.client_records;
create policy "Allow entitled client record inserts"
on public.client_records for insert
to authenticated
with check (
  public.business_has_package_capability(client_records.business_slug, 'CLIENT_RECORDS')
  and public.can_manage_business_branch(client_records.business_slug, client_records.assigned_branch)
);

drop policy if exists "Allow entitled client record updates" on public.client_records;
create policy "Allow entitled client record updates"
on public.client_records for update
to authenticated
using (
  public.business_has_package_capability(client_records.business_slug, 'CLIENT_RECORDS')
  and public.can_manage_business_branch(client_records.business_slug, client_records.assigned_branch)
)
with check (
  public.business_has_package_capability(client_records.business_slug, 'CLIENT_RECORDS')
  and public.can_manage_business_branch(client_records.business_slug, client_records.assigned_branch)
);

drop policy if exists "Allow entitled client record deletes" on public.client_records;
create policy "Allow entitled client record deletes"
on public.client_records for delete
to authenticated
using (
  public.business_has_package_capability(client_records.business_slug, 'CLIENT_RECORDS')
  and public.can_manage_business_branch(client_records.business_slug, client_records.assigned_branch)
);

create or replace function public.upsert_client_record(
  client_record_id text,
  business_slug_value text,
  full_name_value text,
  contact_number_value text,
  email_value text default '',
  assigned_branch_value text default '',
  notes_value text default ''
)
returns table (
  id text,
  business_slug text,
  full_name text,
  contact_number text,
  email text,
  assigned_branch text,
  notes text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.business_has_package_capability(business_slug_value, 'CLIENT_RECORDS') then
    raise exception 'Client Records add-on is not enabled for this business.';
  end if;

  if not public.can_manage_business_branch(business_slug_value, assigned_branch_value) then
    raise exception 'You are not authorized to manage this branch.';
  end if;

  insert into public.client_records (
    id,
    business_slug,
    full_name,
    contact_number,
    email,
    assigned_branch,
    notes,
    created_by,
    updated_at
  ) values (
    client_record_id,
    business_slug_value,
    full_name_value,
    contact_number_value,
    nullif(email_value, ''),
    assigned_branch_value,
    notes_value,
    auth.uid(),
    now()
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    contact_number = excluded.contact_number,
    email = excluded.email,
    assigned_branch = excluded.assigned_branch,
    notes = excluded.notes,
    updated_at = now()
  where client_records.business_slug = business_slug_value
    and public.can_manage_business_branch(client_records.business_slug, excluded.assigned_branch);

  return query
  select
    client_records.id,
    client_records.business_slug,
    client_records.full_name,
    client_records.contact_number,
    client_records.email,
    client_records.assigned_branch,
    client_records.notes,
    client_records.created_at,
    client_records.updated_at
  from public.client_records
  where client_records.id = client_record_id
    and client_records.business_slug = business_slug_value;
end;
$$;

create or replace function public.delete_client_record(client_record_id_value text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_slug text;
  target_branch text;
begin
  select business_slug, assigned_branch
    into target_slug, target_branch
  from public.client_records
  where id = client_record_id_value;

  if target_slug is null then
    raise exception 'Client record was not found.';
  end if;

  if not public.business_has_package_capability(target_slug, 'CLIENT_RECORDS')
    or not public.can_manage_business_branch(target_slug, target_branch) then
    raise exception 'You are not authorized to delete this client record.';
  end if;

  delete from public.client_records
  where id = client_record_id_value
    and business_slug = target_slug;
end;
$$;

update public.businesses
set feature_flags = coalesce(feature_flags, '{}'::jsonb)
  || jsonb_build_object(
    'clientRecords', true,
    'client_records', true,
    'client_records_enabled', true,
    'branches', jsonb_build_array('Pateros', 'Parañaque', 'Taguig / Lakeshore', 'Antipolo')
  )
where slug = 'the-facial-unlimited-ph';

update public.business_users
set authorized_branches = '["ALL"]'::jsonb
where business_slug = 'the-facial-unlimited-ph'
  and active = true
  and (
    authorized_branches is null
    or jsonb_array_length(authorized_branches) = 0
  );

revoke all on function public.can_manage_business_branch(text, text) from public;
revoke all on function public.upsert_client_record(text, text, text, text, text, text, text) from public;
revoke all on function public.delete_client_record(text) from public;

grant execute on function public.can_manage_business_branch(text, text) to authenticated;
grant execute on function public.business_has_package_capability(text, text) to authenticated;
grant execute on function public.upsert_client_record(text, text, text, text, text, text, text) to authenticated;
grant execute on function public.delete_client_record(text) to authenticated;
