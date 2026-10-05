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
) values (
  'booking-pdf-download-2026-10-01',
  'Booking PDF Download',
  'PRO users can now generate professional booking or reservation PDFs directly from the dashboard, while customers can also download their own booking copy after successfully submitting a booking request.',
  E'Booking PDF Download is now available for both businesses and customers under the PRO Package.\n\nBusiness owners can generate and download a professional PDF directly from Booking / Reservation Details.\n\nCustomers can also download their own booking copy from the confirmation screen after successfully submitting a booking request.\n\nThe PDF may include applicable business information, customer details, booking or reservation information, booking reference, current status, pricing information, schedule details, and template-specific information in a clean printable format.\n\nCustomer PDFs contain customer-safe booking information only and do not expose private dashboard or internal management information.\n\nHOW TO USE:\nBusiness: Bookings / Requests -> View Details -> Download PDF\nCustomer: Complete Booking -> Submit Successfully -> Confirmation -> Download Booking PDF',
  'NEW_FEATURE',
  array['PRO']::text[],
  'PRO FEATURE',
  true,
  '2026-10-01 00:00:00+00'
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
