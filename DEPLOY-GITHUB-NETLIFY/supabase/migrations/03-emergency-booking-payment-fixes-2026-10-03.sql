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
  'emergency-booking-payment-fixes-2026-10-03',
  'Booking & Payment System Emergency Fixes',
  'Recent booking and payment issues have been addressed to improve payment visibility, booking flow reliability, and the overall customer experience.',
  E'EMERGENCY UPDATE\nSYSTEM FIX\n\nWe\'ve released a set of important fixes and improvements to the Slotwise booking experience.\n\nWHAT WAS FIXED\n\n• Optional Payment Visibility\nPRO businesses using Manual Payments with "No Payment Required" can now properly offer customers the option to Pay Now or Pay Later after submitting a booking.\n\n• Payment Method Loading\nResolved an issue that prevented active payment methods such as GCash from appearing correctly on the public booking page.\n\n• Pay Now / Pay Later Flow\nCustomers can now clearly choose whether to submit their payment details immediately or wait for the business to contact them regarding payment.\n\n• Improved Payment Experience\nThe post-booking payment interface has been improved with clearer payment information, booking amount visibility, payment instructions, and manual verification guidance.\n\n• Payment Verification Clarity\nSubmitted payment information is clearly treated as Pending Verification. Submitting payment details does not automatically mark a payment as verified.\n\n• Booking Experience Improvements\nAdditional interface and usability fixes have been applied to make the booking process easier to understand and use across desktop and mobile devices.\n\nIMPORTANT\n\nPayment verification remains manual. Businesses should always confirm submitted payments through their actual GCash, Maya, bank, or configured payment account before marking a payment as verified.\n\nThis update does not announce secure Payment Proof / Receipt Upload, booking possession-token security, Edge Function proof upload, proof-required settings, or secure signed proof viewing until those features are deployed and verified.',
  'IMPORTANT',
  array['ALL']::text[],
  'EMERGENCY UPDATE',
  true,
  '2026-10-03 00:00:00+00'
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
