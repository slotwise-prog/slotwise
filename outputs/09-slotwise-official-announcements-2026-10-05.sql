begin;

insert into public.slotwise_updates (
  id,
  title,
  summary,
  content,
  update_type,
  applicable_packages,
  feature_badge,
  is_published,
  published_at
) values
(
  'automatic-email-notifications-live-2026-10-05',
  'Automatic Email Notifications Are Now Live',
  'Slotwise can now automatically send email notifications for important booking, inquiry, and payment activities.',
  E'Slotwise can now automatically send email notifications for important booking, inquiry, and payment activities.\n\nBusiness owners and customers can receive relevant updates for new bookings and inquiries, booking status changes, payment submissions, and payment verification results.\n\nThis helps businesses respond faster while keeping customers updated without needing to manually send every notification.\n\nAvailable notification events include:\n\n- New Booking Received\n- Booking Status Updates\n- New Inquiry Received\n- Payment Submitted\n- Payment Verified or Rejected\n\nAnother step toward making Slotwise a more complete and convenient booking management system.',
  'NEW_FEATURE',
  array['ALL']::text[],
  null,
  true,
  '2026-10-05 00:00:00+00'
),
(
  'customers-can-send-inquiries-before-booking-2026-10-04',
  'Customers Can Now Send Inquiries Before Booking',
  'Customers can now choose to inquire first before creating a booking.',
  E'Slotwise now gives customers the option to either Book Now or Inquire First when they visit a business''s public page.\n\nThe new inquiry feature allows customers to ask questions, select what service they''re interested in, and provide their contact details without having to create a booking immediately.\n\nBusiness owners can manage incoming inquiries directly from their Slotwise dashboard and convert qualified inquiries into bookings when needed.\n\nThis gives customers more flexibility while helping businesses capture potential clients who may not be ready to book yet.',
  'NEW_FEATURE',
  array['ALL']::text[],
  null,
  true,
  '2026-10-04 00:00:00+00'
)
on conflict (id) do update set
  title = excluded.title,
  summary = excluded.summary,
  content = excluded.content,
  update_type = excluded.update_type,
  applicable_packages = excluded.applicable_packages,
  feature_badge = excluded.feature_badge,
  is_published = excluded.is_published,
  published_at = excluded.published_at;

commit;
