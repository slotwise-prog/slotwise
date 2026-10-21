-- Additive custom branding support. Review and run manually in the Slotwise Supabase project.
alter table public.setup_requests
  add column if not exists primary_color text,
  add column if not exists secondary_color text,
  add column if not exists accent_color text,
  add column if not exists page_background_color text,
  add column if not exists text_color text;

alter table public.businesses
  add column if not exists secondary_color text,
  add column if not exists text_color text;

create or replace function public.update_client_business_profile(
  target_slug text,
  business_name_value text,
  description_value text,
  phone_value text,
  mobile_numbers_value text,
  primary_email_value text,
  notification_email_value text,
  additional_emails_value text,
  website_value text,
  messenger_link_value text,
  logo_url_value text,
  primary_color_value text,
  secondary_color_value text,
  accent_color_value text,
  page_background_color_value text,
  text_color_value text
)
returns public.businesses
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_business public.businesses%rowtype;
  normalized_notification_email text := nullif(lower(trim(coalesce(notification_email_value, ''))), '');
begin
  if not exists (
    select 1 from public.business_users as bu
    where bu.user_id = auth.uid() and bu.business_slug = target_slug and bu.active = true
  ) then
    raise exception 'Not authorized for this business';
  end if;
  if normalized_notification_email is not null
     and normalized_notification_email !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' then
    raise exception 'Enter a valid notification email address.';
  end if;
  update public.businesses as b
  set business = nullif(trim(business_name_value), ''),
      description = coalesce(description_value, ''),
      phone = coalesce(phone_value, ''),
      messenger_link = coalesce(messenger_link_value, ''),
      logo_url = coalesce(logo_url_value, ''),
      notification_email = normalized_notification_email,
      primary_color = coalesce(nullif(primary_color_value, ''), b.primary_color),
      secondary_color = coalesce(nullif(secondary_color_value, ''), b.secondary_color),
      accent_color = coalesce(nullif(accent_color_value, ''), b.accent_color),
      page_background_color = coalesce(nullif(page_background_color_value, ''), b.page_background_color),
      text_color = coalesce(nullif(text_color_value, ''), b.text_color),
      feature_flags = coalesce(b.feature_flags, '{}'::jsonb) || jsonb_build_object(
        'mobileNumbers', coalesce(mobile_numbers_value, ''),
        'primaryEmail', coalesce(primary_email_value, ''),
        'additionalEmails', coalesce(additional_emails_value, ''),
        'website', coalesce(website_value, '')
      )
  where b.slug = target_slug
  returning b.* into updated_business;
  return updated_business;
end;
$$;

revoke all on function public.update_client_business_profile(text,text,text,text,text,text,text,text,text,text,text,text,text) from public;
revoke all on function public.update_client_business_profile(text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text) from public;
grant execute on function public.update_client_business_profile(text,text,text,text,text,text,text,text,text,text,text,text,text,text,text,text) to authenticated;
