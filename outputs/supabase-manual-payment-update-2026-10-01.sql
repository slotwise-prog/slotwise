begin;

insert into public.slotwise_updates (
  id, title, summary, content, update_type, applicable_packages,
  feature_badge, is_published, published_at
) values (
  'manual-payment-verification-2026-10-01',
  'Manual Payment & Payment Verification',
  'PRO users can now offer manual payment options after a successful booking and verify customer-submitted payments directly from the Slotwise dashboard.',
  E'Manual Payment & Payment Verification is now available for PRO users.\n\nAfter successfully submitting a booking request, customers can choose to pay using the business\'s available manual payment methods or wait for the business to contact them regarding payment.\n\nCustomers who choose Pay Now can view the business\'s configured payment instructions and submit applicable payment information such as amount, reference, and payment proof.\n\nSubmitted payments are marked Pending Verification and are not automatically treated as paid. Business owners must verify the transaction through their actual GCash, Maya, or bank account before marking the payment as verified.\n\nBooking Status and Payment Status remain separate. Payment information is also reflected in the applicable Booking PDF while clearly indicating whether payment is Not Submitted, Pending Verification, Verified, or Rejected. Customer email remains optional. Until automatic email notifications are enabled, businesses should contact customers manually.\n\nHOW TO USE:\nBusiness: Dashboard -> Settings -> Payment Settings\nCustomer: Submit Booking -> Choose Payment Option -> Pay Now / Wait for Confirmation\nVerification: Bookings / Requests -> View Details -> Payment Details',
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
