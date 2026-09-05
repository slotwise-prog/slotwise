-- Phisavong World Travel and Tours: editable PRO TOURS_TRAVEL setup.
-- Run once in the Supabase SQL Editor after deploying the matching frontend.

-- Safe compatibility checks for older Slotwise database versions.
alter table public.businesses add column if not exists business_package text not null default 'STARTER';
alter table public.businesses add column if not exists business_type text;
alter table public.businesses add column if not exists booking_mode text default 'booking';
alter table public.businesses add column if not exists booking_template text not null default 'GENERAL';
alter table public.businesses add column if not exists phone text;
alter table public.businesses add column if not exists messenger_link text;
alter table public.businesses add column if not exists description text;
alter table public.businesses add column if not exists logo_url text;
alter table public.businesses add column if not exists primary_color text;
alter table public.businesses add column if not exists accent_color text;
alter table public.businesses add column if not exists page_background_color text;
alter table public.businesses add column if not exists feature_flags jsonb not null default '{}'::jsonb;

alter table public.business_services add column if not exists pricing_type text not null default 'FIXED';
alter table public.business_services add column if not exists pricing_unit text not null default 'FLAT';
alter table public.business_services add column if not exists pricing_tiers jsonb not null default '[]'::jsonb;
alter table public.business_services add column if not exists service_category text;
alter table public.business_services add column if not exists image_url text;
alter table public.business_services add column if not exists description text;
alter table public.business_services add column if not exists display_order integer not null default 0;
alter table public.business_services add column if not exists status text not null default 'Active';

insert into public.businesses (
  slug, business, industry, booking_link, status, business_package,
  business_type, booking_mode, booking_template, phone, messenger_link,
  description, primary_color, accent_color, page_background_color, feature_flags
) values (
  'phisavong-world-travel-and-tours',
  'Phisavong World Travel and Tours',
  'Travel and Tour Services',
  '/phisavong-world-travel-and-tours',
  'ACTIVE',
  'PRO',
  'Travel and Tour Services',
  'booking-inquiry',
  'TOURS_TRAVEL',
  '045 652 1472',
  'https://www.facebook.com/PhisavongWorldTravel',
  'Explore more. Travel with confidence.',
  '#C99718',
  '#FBF7EA',
  '#FCFBF7',
  jsonb_build_object(
    'showPrices', true,
    'bookingEnabled', true,
    'inquiryEnabled', true,
    'requireDate', true,
    'requireTime', true,
    'requireAddress', false,
    'mobileNumbers', '0995 189 6553 / 0928 423 2743',
    'primaryEmail', 'info@phisavongworldtravel.com',
    'additionalEmails', 'reservation@phisavongworldtravel.com, phisavongworldtravel@gmail.com',
    'website', 'https://www.phisavongworldtravel.com/'
  )
) on conflict (slug) do nothing;

update public.businesses
set business = 'Phisavong World Travel and Tours',
    industry = 'Travel and Tour Services',
    booking_link = '/phisavong-world-travel-and-tours',
    status = 'ACTIVE',
    business_package = 'PRO',
    business_type = 'Travel and Tour Services',
    booking_mode = 'booking-inquiry',
    booking_template = 'TOURS_TRAVEL',
    phone = '045 652 1472',
    messenger_link = 'https://www.facebook.com/PhisavongWorldTravel',
    description = 'Explore more. Travel with confidence.',
    primary_color = '#C99718',
    accent_color = '#FBF7EA',
    page_background_color = '#FCFBF7',
    feature_flags = coalesce(feature_flags, '{}'::jsonb) || jsonb_build_object(
      'showPrices', true,
      'bookingEnabled', true,
      'inquiryEnabled', true,
      'requireDate', true,
      'requireTime', true,
      'requireAddress', false,
      'mobileNumbers', '0995 189 6553 / 0928 423 2743',
      'primaryEmail', 'info@phisavongworldtravel.com',
      'additionalEmails', 'reservation@phisavongworldtravel.com, phisavongworldtravel@gmail.com',
      'website', 'https://www.phisavongworldtravel.com/'
    )
where slug = 'phisavong-world-travel-and-tours';

insert into public.business_availability (id, business_slug, open_days, open_hours, slots)
values (
  'phisavong-world-travel-availability',
  'phisavong-world-travel-and-tours',
  'Monday to Saturday',
  '9:00 AM to 6:00 PM',
  '["9:00 AM","10:00 AM","11:00 AM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM"]'::jsonb
)
on conflict (id) do update set
  open_days = excluded.open_days,
  open_hours = excluded.open_hours,
  slots = excluded.slots;

insert into public.business_services (
  id, business_slug, name, description, price, pricing_type, pricing_unit,
  pricing_tiers, service_category, image_url, display_order, status
) values
  ('phisavong-airline-ticketing', 'phisavong-world-travel-and-tours', 'Airline Ticketing', 'Flights based on your destination and preferred schedule.', null, 'FIXED', 'FLAT', '[]', 'Flights', '', 0, 'Active'),
  ('phisavong-holiday-packages', 'phisavong-world-travel-and-tours', 'Holiday Packages', 'Domestic and international holiday packages based on your preferred destination.', null, 'FIXED', 'FLAT', '[]', 'Tours & Holidays', 'https://www.phisavongworldtravel.com/', 1, 'Active'),
  ('phisavong-worldwide-fit-group', 'phisavong-world-travel-and-tours', 'Worldwide F.I.T. & Group Tour Packages', 'Flexible independent travel and group tour package inquiries.', null, 'FIXED', 'FLAT', '[]', 'Tours & Holidays', '', 2, 'Active'),
  ('phisavong-series-tours', 'phisavong-world-travel-and-tours', 'Series Tours', 'Ask about available scheduled series tours and departures.', null, 'FIXED', 'FLAT', '[]', 'Tours & Holidays', '', 3, 'Active'),
  ('phisavong-sightseeing', 'phisavong-world-travel-and-tours', 'Sightseeing Tours', 'Sightseeing arrangements based on destination and preferred schedule.', null, 'FIXED', 'FLAT', '[]', 'Special Interest Tours', '', 4, 'Active'),
  ('phisavong-eco-agro', 'phisavong-world-travel-and-tours', 'Eco & Agro Tours', 'Nature, environmental, and agricultural tour inquiries.', null, 'FIXED', 'FLAT', '[]', 'Special Interest Tours', '', 5, 'Active'),
  ('phisavong-educational', 'phisavong-world-travel-and-tours', 'Educational Tours', 'Educational travel arrangements for schools and groups.', null, 'FIXED', 'FLAT', '[]', 'Special Interest Tours', '', 6, 'Active'),
  ('phisavong-health-wellness', 'phisavong-world-travel-and-tours', 'Health & Wellness Tours', 'Travel arrangements focused on health and wellness experiences.', null, 'FIXED', 'FLAT', '[]', 'Special Interest Tours', '', 7, 'Active'),
  ('phisavong-cruises', 'phisavong-world-travel-and-tours', 'Cruises', 'Cruise inquiries based on route, travel date, and number of travelers.', null, 'FIXED', 'FLAT', '[]', 'Cruise & Ferry', '', 8, 'Active'),
  ('phisavong-visa', 'phisavong-world-travel-and-tours', 'Visa Assistance', 'Initial visa assistance inquiry based on destination country and intended travel date.', null, 'FIXED', 'FLAT', '[]', 'Travel Support', 'https://www.phisavongworldtravel.com/', 9, 'Active'),
  ('phisavong-insurance', 'phisavong-world-travel-and-tours', 'Travel Insurance', 'Travel insurance inquiry based on destination and travel dates.', null, 'FIXED', 'FLAT', '[]', 'Travel Support', '', 10, 'Active'),
  ('phisavong-ferry', 'phisavong-world-travel-and-tours', 'Ferry Tickets', 'Ferry ticket inquiry based on route, date, and number of travelers.', null, 'FIXED', 'FLAT', '[]', 'Cruise & Ferry', '', 11, 'Active'),
  ('phisavong-transportation', 'phisavong-world-travel-and-tours', 'Transportation', 'Transportation inquiry based on pickup, destination, date, and passenger count.', null, 'FIXED', 'FLAT', '[]', 'Transportation', '', 12, 'Active'),
  ('phisavong-other-inquiry', 'phisavong-world-travel-and-tours', 'Other Travel Inquiry', 'Tell us about another travel service you need.', null, 'FIXED', 'FLAT', '[]', 'Other', '', 13, 'Active'),
  ('phisavong-exciting-thailand', 'phisavong-world-travel-and-tours', 'Exciting Thailand - 4 Days', 'Stay at a decent yet affordable hotel with Bangkok land transfer, one RT-PCR, and a city temple tour.', 14600, 'PER_PAX', 'PER_PAX', '[]', 'Published Package', 'https://www.phisavongworldtravel.com/', 14, 'Active')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  pricing_type = excluded.pricing_type,
  pricing_unit = excluded.pricing_unit,
  pricing_tiers = excluded.pricing_tiers,
  service_category = excluded.service_category,
  image_url = excluded.image_url,
  display_order = excluded.display_order,
  status = excluded.status;

create or replace function public.update_client_business_profile(
  target_slug text,
  business_name_value text,
  description_value text,
  phone_value text,
  mobile_numbers_value text,
  primary_email_value text,
  additional_emails_value text,
  website_value text,
  messenger_link_value text,
  logo_url_value text,
  primary_color_value text,
  accent_color_value text
)
returns public.businesses
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_business public.businesses%rowtype;
begin
  if not exists (
    select 1 from public.business_users
    where user_id = auth.uid() and business_slug = target_slug and active = true
  ) then
    raise exception 'Not authorized for this business';
  end if;

  update public.businesses
  set business = nullif(trim(business_name_value), ''),
      description = coalesce(description_value, ''),
      phone = coalesce(phone_value, ''),
      messenger_link = coalesce(messenger_link_value, ''),
      logo_url = coalesce(logo_url_value, ''),
      primary_color = coalesce(nullif(primary_color_value, ''), primary_color),
      accent_color = coalesce(nullif(accent_color_value, ''), accent_color),
      feature_flags = coalesce(feature_flags, '{}'::jsonb) || jsonb_build_object(
        'mobileNumbers', coalesce(mobile_numbers_value, ''),
        'primaryEmail', coalesce(primary_email_value, ''),
        'additionalEmails', coalesce(additional_emails_value, ''),
        'website', coalesce(website_value, '')
      )
  where slug = target_slug
  returning * into updated_business;

  return updated_business;
end;
$$;

revoke all on function public.update_client_business_profile(text,text,text,text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.update_client_business_profile(text,text,text,text,text,text,text,text,text,text,text,text) to authenticated;
