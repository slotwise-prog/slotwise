begin;

update public.slotwise_updates
set content = E'Slotwise can now automatically send email notifications for important booking, inquiry, and payment activities.\n\nBusiness owners and customers can receive relevant updates for new bookings and inquiries, booking status changes, payment submissions, and payment verification results.\n\nThis helps businesses respond faster while keeping customers updated without needing to manually send every notification.\n\nAvailable notification events include:\n\n- New Booking Received\n- Booking Status Updates\n- New Inquiry Received\n- Payment Submitted\n- Payment Verified or Rejected\n\nAnother step toward making Slotwise a more complete and convenient booking management system.\n\nIMPORTANT SETUP REQUIRED\n\nDashboard → Account → Automatic Notifications\n\nEnter your preferred Notification Email and save your changes.\n\nMake sure the email address is correct and accessible to you.\n\nChanging the Notification Email does NOT change the public contact email displayed to customers.'
where id = 'automatic-email-notifications-live-2026-10-05';

commit;
