-- Additive fields for the public Slotwise client onboarding request.
-- Existing setup requests remain readable and existing provisioning is unchanged.

alter table public.setup_requests
  add column if not exists business_description text,
  add column if not exists contact_email text,
  add column if not exists business_address text,
  add column if not exists selected_package text,
  add column if not exists booking_interval text,
  add column if not exists schedule_notes text,
  add column if not exists preferred_colors text,
  add column if not exists logo_url text,
  add column if not exists special_instructions text,
  add column if not exists requested_features text;

create index if not exists setup_requests_selected_package_idx
  on public.setup_requests (selected_package);

comment on column public.setup_requests.selected_package is
  'Package requested by the prospective client; approval remains an admin decision.';
