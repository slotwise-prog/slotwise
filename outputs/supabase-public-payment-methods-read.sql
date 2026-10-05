-- Returns only public payment instructions. Does not alter table RLS or grants.
begin;
create or replace function public.get_public_payment_methods(target_slug text)
returns table (
  business_slug text,
  method_type text,
  method_name text,
  account_name text,
  account_number text,
  instructions text,
  active boolean
)
language sql stable security definer
set search_path = pg_catalog
as $$
  select m.business_slug, m.method_type, m.method_name, m.account_name,
         m.account_number, m.instructions, m.active
  from public.business_payment_methods m
  join public.businesses b on b.slug = m.business_slug
  join public.business_payment_settings s on s.business_slug = b.slug
  where b.slug = target_slug
    and upper(b.status) = 'ACTIVE'
    and b.business_package = 'PRO'
    and s.enabled = true
    and m.active = true
  order by m.method_type, m.method_name;
$$;
revoke all on function public.get_public_payment_methods(text) from public;
grant execute on function public.get_public_payment_methods(text) to anon, authenticated;
commit;
