begin;

create table if not exists public.client_service_records (
  id text primary key,
  business_slug text not null references public.businesses(slug) on delete cascade,
  client_record_id text not null references public.client_records(id) on delete cascade,
  branch text not null,
  reservation_id text references public.bookings(id) on delete set null,
  service_date date not null,
  session_number integer,
  service_id text references public.business_services(id) on delete set null,
  service_name_snapshot text not null,
  service_charge numeric not null default 0,
  amount_paid numeric not null default 0,
  balance numeric not null default 0,
  notes text,
  signature_reference text,
  created_by uuid references auth.users(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint client_service_records_non_negative_amounts
    check (service_charge >= 0 and amount_paid >= 0)
);

create index if not exists client_service_records_business_slug_idx
on public.client_service_records (business_slug);

create index if not exists client_service_records_client_idx
on public.client_service_records (client_record_id, service_date desc);

create index if not exists client_service_records_branch_idx
on public.client_service_records (business_slug, branch);

alter table public.client_service_records enable row level security;

drop policy if exists "Allow entitled client service record reads" on public.client_service_records;
create policy "Allow entitled client service record reads"
on public.client_service_records for select
to authenticated
using (
  public.business_has_package_capability(client_service_records.business_slug, 'CLIENT_RECORDS')
  and public.can_manage_business_branch(client_service_records.business_slug, client_service_records.branch)
);

drop policy if exists "Allow entitled client service record inserts" on public.client_service_records;
create policy "Allow entitled client service record inserts"
on public.client_service_records for insert
to authenticated
with check (
  public.business_has_package_capability(client_service_records.business_slug, 'CLIENT_RECORDS')
  and public.can_manage_business_branch(client_service_records.business_slug, client_service_records.branch)
);

drop policy if exists "Allow entitled client service record updates" on public.client_service_records;
create policy "Allow entitled client service record updates"
on public.client_service_records for update
to authenticated
using (
  public.business_has_package_capability(client_service_records.business_slug, 'CLIENT_RECORDS')
  and public.can_manage_business_branch(client_service_records.business_slug, client_service_records.branch)
)
with check (
  public.business_has_package_capability(client_service_records.business_slug, 'CLIENT_RECORDS')
  and public.can_manage_business_branch(client_service_records.business_slug, client_service_records.branch)
);

drop policy if exists "Allow entitled client service record deletes" on public.client_service_records;
create policy "Allow entitled client service record deletes"
on public.client_service_records for delete
to authenticated
using (
  public.business_has_package_capability(client_service_records.business_slug, 'CLIENT_RECORDS')
  and public.can_manage_business_branch(client_service_records.business_slug, client_service_records.branch)
);

create or replace function public.upsert_client_service_record(
  service_record_id text,
  business_slug_value text,
  client_record_id_value text,
  branch_value text,
  service_date_value date,
  session_number_value integer default null,
  service_id_value text default null,
  service_name_snapshot_value text default '',
  service_charge_value numeric default 0,
  amount_paid_value numeric default 0,
  notes_value text default '',
  signature_reference_value text default '',
  reservation_id_value text default null
)
returns table (
  id text,
  business_slug text,
  client_record_id text,
  branch text,
  reservation_id text,
  service_date date,
  session_number integer,
  service_id text,
  service_name_snapshot text,
  service_charge numeric,
  amount_paid numeric,
  balance numeric,
  notes text,
  signature_reference text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  computed_balance numeric;
begin
  if not public.business_has_package_capability(business_slug_value, 'CLIENT_RECORDS') then
    raise exception 'Client Records add-on is not enabled for this business.';
  end if;

  if not public.can_manage_business_branch(business_slug_value, branch_value) then
    raise exception 'You are not authorized to manage this branch.';
  end if;

  if not exists (
    select 1
    from public.client_records
    where client_records.id = client_record_id_value
      and client_records.business_slug = business_slug_value
  ) then
    raise exception 'Client record was not found for this business.';
  end if;

  if reservation_id_value is not null and not exists (
    select 1
    from public.bookings
    where bookings.id = reservation_id_value
      and bookings.business_slug = business_slug_value
  ) then
    raise exception 'Linked reservation was not found for this business.';
  end if;

  if service_id_value is not null and not exists (
    select 1
    from public.business_services
    where business_services.id = service_id_value
      and business_services.business_slug = business_slug_value
  ) then
    raise exception 'Selected service was not found for this business.';
  end if;

  computed_balance := coalesce(service_charge_value, 0) - coalesce(amount_paid_value, 0);

  insert into public.client_service_records (
    id,
    business_slug,
    client_record_id,
    branch,
    reservation_id,
    service_date,
    session_number,
    service_id,
    service_name_snapshot,
    service_charge,
    amount_paid,
    balance,
    notes,
    signature_reference,
    created_by,
    updated_at
  ) values (
    service_record_id,
    business_slug_value,
    client_record_id_value,
    branch_value,
    reservation_id_value,
    service_date_value,
    session_number_value,
    service_id_value,
    service_name_snapshot_value,
    coalesce(service_charge_value, 0),
    coalesce(amount_paid_value, 0),
    computed_balance,
    nullif(notes_value, ''),
    nullif(signature_reference_value, ''),
    auth.uid(),
    now()
  )
  on conflict on constraint client_service_records_pkey do update set
    branch = excluded.branch,
    reservation_id = excluded.reservation_id,
    service_date = excluded.service_date,
    session_number = excluded.session_number,
    service_id = excluded.service_id,
    service_name_snapshot = excluded.service_name_snapshot,
    service_charge = excluded.service_charge,
    amount_paid = excluded.amount_paid,
    balance = excluded.balance,
    notes = excluded.notes,
    signature_reference = excluded.signature_reference,
    updated_at = now()
  where client_service_records.business_slug = business_slug_value
    and public.can_manage_business_branch(client_service_records.business_slug, excluded.branch);

  return query
  select
    client_service_records.id,
    client_service_records.business_slug,
    client_service_records.client_record_id,
    client_service_records.branch,
    client_service_records.reservation_id,
    client_service_records.service_date,
    client_service_records.session_number,
    client_service_records.service_id,
    client_service_records.service_name_snapshot,
    client_service_records.service_charge,
    client_service_records.amount_paid,
    client_service_records.balance,
    client_service_records.notes,
    client_service_records.signature_reference,
    client_service_records.created_at,
    client_service_records.updated_at
  from public.client_service_records
  where client_service_records.id = service_record_id
    and client_service_records.business_slug = business_slug_value;
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

revoke all on function public.upsert_client_service_record(text, text, text, text, date, integer, text, text, numeric, numeric, text, text, text) from public;
grant execute on function public.upsert_client_service_record(text, text, text, text, date, integer, text, text, numeric, numeric, text, text, text) to authenticated;
grant select, insert, update, delete on public.client_service_records to authenticated;

commit;
