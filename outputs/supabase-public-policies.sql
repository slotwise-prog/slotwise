alter table leads enable row level security;
alter table bookings enable row level security;
alter table businesses enable row level security;
alter table business_services enable row level security;
alter table business_availability enable row level security;
alter table business_blocked_dates enable row level security;
alter table business_payment_settings enable row level security;
alter table business_payment_methods enable row level security;
alter table booking_payments enable row level security;
alter table setup_requests enable row level security;
alter table admin_users enable row level security;
alter table business_users enable row level security;

drop policy if exists "Allow public lead reads for demo admin" on leads;
drop policy if exists "Allow public booking reads for demo admin" on bookings;
drop policy if exists "Allow public business provisioning inserts" on businesses;
drop policy if exists "Allow public business admin updates" on businesses;
drop policy if exists "Allow public business service provisioning inserts" on business_services;
drop policy if exists "Allow public business service admin deletes" on business_services;
drop policy if exists "Allow public business availability provisioning inserts" on business_availability;
drop policy if exists "Allow public business availability admin deletes" on business_availability;
drop policy if exists "Allow public business blocked date reads" on business_blocked_dates;
drop policy if exists "Allow authenticated business blocked date reads" on business_blocked_dates;
drop policy if exists "Allow admin blocked date inserts" on business_blocked_dates;
drop policy if exists "Allow admin blocked date updates" on business_blocked_dates;
drop policy if exists "Allow admin blocked date deletes" on business_blocked_dates;
drop policy if exists "Allow public payment setting reads" on business_payment_settings;
drop policy if exists "Allow authenticated payment setting reads" on business_payment_settings;
drop policy if exists "Allow admin payment setting inserts" on business_payment_settings;
drop policy if exists "Allow admin payment setting updates" on business_payment_settings;
drop policy if exists "Allow admin payment setting deletes" on business_payment_settings;
drop policy if exists "Allow public payment method reads" on business_payment_methods;
drop policy if exists "Allow authenticated payment method reads" on business_payment_methods;
drop policy if exists "Allow admin payment method inserts" on business_payment_methods;
drop policy if exists "Allow admin payment method updates" on business_payment_methods;
drop policy if exists "Allow admin payment method deletes" on business_payment_methods;
drop policy if exists "Allow managed booking payment reads" on booking_payments;
drop policy if exists "Allow managed booking payment inserts" on booking_payments;
drop policy if exists "Allow managed booking payment updates" on booking_payments;
drop policy if exists "Allow managed booking payment deletes" on booking_payments;
drop policy if exists "Allow public setup reads for demo admin" on setup_requests;
drop policy if exists "Allow mapped client booking reads" on bookings;
drop policy if exists "Allow admin business user reads" on business_users;
drop policy if exists "Allow own business user reads" on business_users;
drop policy if exists "Allow admin business user inserts" on business_users;
drop policy if exists "Allow admin business user updates" on business_users;
drop policy if exists "Allow admin business user deletes" on business_users;

drop policy if exists "Allow public lead inserts" on leads;
create policy "Allow public lead inserts"
on leads for insert
to anon
with check (true);

drop policy if exists "Allow admin lead reads" on leads;
create policy "Allow admin lead reads"
on leads for select
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  )
);

drop policy if exists "Allow public booking inserts" on bookings;
create policy "Allow public booking inserts"
on bookings for insert
with check (public.is_active_business(bookings.business_slug));

drop policy if exists "Allow admin booking reads" on bookings;
drop policy if exists "Allow authenticated booking reads" on bookings;
create policy "Allow authenticated booking reads"
on bookings for select
to authenticated
using (public.can_manage_business(bookings.business_slug));

drop policy if exists "Allow public business reads" on businesses;
create policy "Allow public business reads"
on businesses for select
to anon, authenticated
using (true);

drop policy if exists "Allow admin business inserts" on businesses;
create policy "Allow admin business inserts"
on businesses for insert
to authenticated
with check (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  )
);

drop policy if exists "Allow admin business updates" on businesses;
create policy "Allow admin business updates"
on businesses for update
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  )
)
with check (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  )
);

drop policy if exists "Allow public business service reads" on business_services;
create policy "Allow public business service reads"
on business_services for select
to anon, authenticated
using (true);

drop policy if exists "Allow admin service inserts" on business_services;
create policy "Allow admin service inserts"
on business_services for insert
to authenticated
with check (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  )
);

drop policy if exists "Allow admin service deletes" on business_services;
create policy "Allow admin service deletes"
on business_services for delete
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  )
);

drop policy if exists "Allow public business availability reads" on business_availability;
create policy "Allow public business availability reads"
on business_availability for select
to anon, authenticated
using (true);

drop policy if exists "Allow admin availability inserts" on business_availability;
create policy "Allow admin availability inserts"
on business_availability for insert
to authenticated
with check (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  )
);

drop policy if exists "Allow admin availability deletes" on business_availability;
create policy "Allow admin availability deletes"
on business_availability for delete
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  )
);

drop policy if exists "Allow public business blocked date reads" on business_blocked_dates;
create policy "Allow public business blocked date reads"
on business_blocked_dates for select
to anon
using (active = true);

drop policy if exists "Allow authenticated business blocked date reads" on business_blocked_dates;
create policy "Allow authenticated business blocked date reads"
on business_blocked_dates for select
to authenticated
using (active = true or public.can_manage_business(business_blocked_dates.business_slug));

drop policy if exists "Allow admin blocked date inserts" on business_blocked_dates;
create policy "Allow admin blocked date inserts"
on business_blocked_dates for insert
to authenticated
with check (public.is_smm_admin());

drop policy if exists "Allow admin blocked date updates" on business_blocked_dates;
create policy "Allow admin blocked date updates"
on business_blocked_dates for update
to authenticated
using (public.is_smm_admin())
with check (public.is_smm_admin());

drop policy if exists "Allow admin blocked date deletes" on business_blocked_dates;
create policy "Allow admin blocked date deletes"
on business_blocked_dates for delete
to authenticated
using (public.is_smm_admin());

drop policy if exists "Allow public payment setting reads" on business_payment_settings;
create policy "Allow public payment setting reads"
on business_payment_settings for select
to anon
using (
  enabled = true
  and exists (
    select 1 from businesses
    where businesses.slug = business_payment_settings.business_slug
      and upper(businesses.status) = 'ACTIVE'
      and businesses.business_package = 'PRO'
  )
);

drop policy if exists "Allow authenticated payment setting reads" on business_payment_settings;
create policy "Allow authenticated payment setting reads"
on business_payment_settings for select
to authenticated
using (
  public.business_has_package_capability(business_payment_settings.business_slug, 'PAYMENT_VERIFICATION')
  or (
    enabled = true
    and exists (
      select 1 from businesses
      where businesses.slug = business_payment_settings.business_slug
        and upper(businesses.status) = 'ACTIVE'
        and businesses.business_package = 'PRO'
    )
  )
);

drop policy if exists "Allow admin payment setting inserts" on business_payment_settings;
create policy "Allow admin payment setting inserts"
on business_payment_settings for insert
to authenticated
with check (public.is_smm_admin());

drop policy if exists "Allow admin payment setting updates" on business_payment_settings;
create policy "Allow admin payment setting updates"
on business_payment_settings for update
to authenticated
using (public.is_smm_admin())
with check (public.is_smm_admin());

drop policy if exists "Allow admin payment setting deletes" on business_payment_settings;
create policy "Allow admin payment setting deletes"
on business_payment_settings for delete
to authenticated
using (public.is_smm_admin());

drop policy if exists "Allow public payment method reads" on business_payment_methods;
create policy "Allow public payment method reads"
on business_payment_methods for select
to anon
using (
  active = true
  and exists (
    select 1 from businesses
    join business_payment_settings on business_payment_settings.business_slug = businesses.slug
    where businesses.slug = business_payment_methods.business_slug
      and upper(businesses.status) = 'ACTIVE'
      and businesses.business_package = 'PRO'
      and business_payment_settings.enabled = true
      and business_payment_settings.requirement_type <> 'NO_PAYMENT_REQUIRED'
  )
);

drop policy if exists "Allow authenticated payment method reads" on business_payment_methods;
create policy "Allow authenticated payment method reads"
on business_payment_methods for select
to authenticated
using (
  public.business_has_package_capability(business_payment_methods.business_slug, 'PAYMENT_VERIFICATION')
  or (
    active = true
    and exists (
      select 1 from businesses
      join business_payment_settings on business_payment_settings.business_slug = businesses.slug
      where businesses.slug = business_payment_methods.business_slug
        and upper(businesses.status) = 'ACTIVE'
        and businesses.business_package = 'PRO'
        and business_payment_settings.enabled = true
        and business_payment_settings.requirement_type <> 'NO_PAYMENT_REQUIRED'
    )
  )
);

drop policy if exists "Allow admin payment method inserts" on business_payment_methods;
create policy "Allow admin payment method inserts"
on business_payment_methods for insert
to authenticated
with check (public.is_smm_admin());

drop policy if exists "Allow admin payment method updates" on business_payment_methods;
create policy "Allow admin payment method updates"
on business_payment_methods for update
to authenticated
using (public.is_smm_admin())
with check (public.is_smm_admin());

drop policy if exists "Allow admin payment method deletes" on business_payment_methods;
create policy "Allow admin payment method deletes"
on business_payment_methods for delete
to authenticated
using (public.is_smm_admin());

drop policy if exists "Allow managed booking payment reads" on booking_payments;
create policy "Allow managed booking payment reads"
on booking_payments for select
to authenticated
using (public.business_has_package_capability(booking_payments.business_slug, 'PAYMENT_VERIFICATION'));

drop policy if exists "Allow managed booking payment inserts" on booking_payments;
create policy "Allow managed booking payment inserts"
on booking_payments for insert
to authenticated
with check (public.is_smm_admin());

drop policy if exists "Allow managed booking payment updates" on booking_payments;
create policy "Allow managed booking payment updates"
on booking_payments for update
to authenticated
using (public.is_smm_admin())
with check (public.is_smm_admin());

drop policy if exists "Allow managed booking payment deletes" on booking_payments;
create policy "Allow managed booking payment deletes"
on booking_payments for delete
to authenticated
using (public.is_smm_admin());

drop policy if exists "Allow public setup inserts" on setup_requests;
create policy "Allow public setup inserts"
on setup_requests for insert
to anon
with check (true);

drop policy if exists "Allow admin setup reads" on setup_requests;
create policy "Allow admin setup reads"
on setup_requests for select
to authenticated
using (
  exists (
    select 1 from admin_users
    where admin_users.user_id = auth.uid()
      and admin_users.active = true
  )
);

drop policy if exists "Allow own admin authorization read" on admin_users;
create policy "Allow own admin authorization read"
on admin_users for select
to authenticated
using (user_id = auth.uid() and active = true);

drop policy if exists "Allow own business user reads" on business_users;
create policy "Allow own business user reads"
on business_users for select
to authenticated
using (
  (user_id = auth.uid() and active = true)
  or public.is_smm_admin()
);

drop policy if exists "Allow admin business user inserts" on business_users;
create policy "Allow admin business user inserts"
on business_users for insert
to authenticated
with check (public.is_smm_admin());

drop policy if exists "Allow admin business user updates" on business_users;
create policy "Allow admin business user updates"
on business_users for update
to authenticated
using (public.is_smm_admin())
with check (public.is_smm_admin());

drop policy if exists "Allow admin business user deletes" on business_users;
create policy "Allow admin business user deletes"
on business_users for delete
to authenticated
using (public.is_smm_admin());
