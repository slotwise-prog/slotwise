begin;

-- Repairs the Migration 19 acceptance RPC in place. The explicit table aliases
-- prevent PostgreSQL from resolving booking_id against the returned table column
-- and the function's output variable with the same name.
create or replace function public.record_thryvelab_terms_acceptance(
  booking_id_value text,
  business_slug_value text,
  booking_possession_token_value text,
  terms_version_value text,
  terms_effective_date_value text,
  acknowledgment_values jsonb
)
returns table (booking_id text, accepted_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if business_slug_value <> 'thryvelab' then
    raise exception 'Terms acceptance is only available for ThryveLab.';
  end if;
  if not public.validate_booking_possession(booking_id_value, business_slug_value, booking_possession_token_value) then
    raise exception 'Invalid booking possession.';
  end if;
  if terms_version_value <> '2026-10-14' or terms_effective_date_value <> 'October 14, 2026' then
    raise exception 'Unsupported ThryveLab terms version.';
  end if;
  if coalesce(acknowledgment_values ->> 'terms', 'false') <> 'true'
     or coalesce(acknowledgment_values ->> 'review', 'false') <> 'true'
     or coalesce(acknowledgment_values ->> 'policy', 'false') <> 'true' then
    raise exception 'All required ThryveLab acknowledgments must be accepted.';
  end if;
  if coalesce(acknowledgment_values ->> 'starter_required', 'false') = 'true'
     and coalesce(acknowledgment_values ->> 'starter', 'false') <> 'true' then
    raise exception 'The 7-Day Starter Kit acknowledgment is required.';
  end if;
  if not exists (
    select 1 from public.bookings as b
    where b.id = booking_id_value and b.business_slug = 'thryvelab'
  ) then
    raise exception 'ThryveLab booking was not found.';
  end if;
  return query
    insert into public.thryvelab_terms_acceptances as ta (
      booking_id, business_slug, terms_version, terms_effective_date, acknowledgment_values
    ) values (
      booking_id_value, 'thryvelab', terms_version_value,
      terms_effective_date_value::date, acknowledgment_values
    )
    on conflict (booking_id) do update set
      terms_version = excluded.terms_version,
      terms_effective_date = excluded.terms_effective_date,
      accepted_at = now(),
      acknowledgment_values = excluded.acknowledgment_values
    returning ta.booking_id, ta.accepted_at;
end;
$$;

revoke all on function public.record_thryvelab_terms_acceptance(text, text, text, text, text, jsonb) from public;
grant execute on function public.record_thryvelab_terms_acceptance(text, text, text, text, text, jsonb) to anon, authenticated;

commit;
