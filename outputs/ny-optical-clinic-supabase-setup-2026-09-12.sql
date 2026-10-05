begin;

alter table public.businesses
drop constraint if exists businesses_booking_template_allowed;

alter table public.businesses
add constraint businesses_booking_template_allowed
check (
  booking_template in (
    'GENERAL',
    'BEAUTY',
    'CLINIC',
    'OPTICAL_CLINIC',
    'HEALTH_WELLNESS',
    'REAL_ESTATE',
    'PEST_CONTROL',
    'PROFESSIONAL_SERVICES',
    'HOME_SERVICE',
    'AUTO',
    'CAR_WASH',
    'LAUNDRY',
    'TOURS_TRAVEL',
    'STAYCATION_ACCOMMODATION'
  )
);

insert into public.businesses (
  slug,
  business,
  industry,
  booking_link,
  phone,
  messenger_link,
  description,
  business_type,
  booking_mode,
  booking_template,
  business_package,
  status,
  primary_color,
  accent_color,
  page_background_color,
  feature_flags
)
values (
  'ny-optical-clinic',
  'NY Optical Clinic',
  'Optical Clinic',
  '/ny-optical-clinic',
  '09610928597',
  'https://www.facebook.com/profile.php?id=61593258592352',
  'Book your optical consultation or choose the package that fits your vision care needs.',
  'Optical Clinic',
  'booking',
  'OPTICAL_CLINIC',
  'STARTER',
  'DEMO',
  '#173FA3',
  '#E8EFFD',
  '#F5F8FC',
  '{"localDemoOnly":true,"opticalHeroEyebrow":"OPTICAL CLINIC","primaryEmail":"nyopticalclinic@gmail.com"}'::jsonb
)
on conflict (slug) do update set
  business = excluded.business,
  industry = excluded.industry,
  booking_link = excluded.booking_link,
  phone = excluded.phone,
  messenger_link = excluded.messenger_link,
  description = excluded.description,
  business_type = excluded.business_type,
  booking_mode = excluded.booking_mode,
  booking_template = excluded.booking_template,
  business_package = excluded.business_package,
  status = excluded.status,
  primary_color = excluded.primary_color,
  accent_color = excluded.accent_color,
  page_background_color = excluded.page_background_color,
  feature_flags = excluded.feature_flags;

insert into public.business_users (
  user_id,
  business_slug,
  role,
  active,
  authorized_branches
)
values (
  '297268d9-4ff0-4f85-850d-c0a51e3c5006',
  'ny-optical-clinic',
  'OWNER',
  true,
  '["ALL"]'::jsonb
)
on conflict (user_id, business_slug) do update set
  role = excluded.role,
  active = excluded.active,
  authorized_branches = excluded.authorized_branches;

commit;

select slug, business, booking_template, business_package, status
from public.businesses
where slug = 'ny-optical-clinic';

select user_id, business_slug, role, active, authorized_branches
from public.business_users
where business_slug = 'ny-optical-clinic';
