const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-slotwise-dispatch-secret",
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
const esc = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] || char));

const subjects: Record<string, string> = {
  BOOKING_RECEIVED_OWNER: "New Booking Received",
  BOOKING_RECEIVED_CUSTOMER: "We received your booking request",
  INQUIRY_RECEIVED_OWNER: "New Inquiry Received",
  INQUIRY_RECEIVED_CUSTOMER: "We received your inquiry",
  PAYMENT_SUBMITTED_OWNER: "Payment Submitted for Verification",
  PAYMENT_VERIFIED_CUSTOMER: "Payment Verified",
  PAYMENT_REJECTED_CUSTOMER: "Payment Verification Update",
  BOOKING_STATUS_CHANGED_CUSTOMER: "Booking Status Update",
};

const rows = (payload: Record<string, unknown>, keys: [string, string][]) => keys.map(([label, key]) => `<tr><td style="padding:6px 0;color:#68716a"><strong>${esc(label)}</strong></td><td style="padding:6px 0">${esc(payload[key]) || "—"}</td></tr>`).join("");

function renderEmail(eventType: string, payload: Record<string, unknown>) {
  const business = esc(payload.business_name || "Slotwise business");
  const isOwner = eventType.endsWith("_OWNER");
  const isInquiry = eventType.startsWith("INQUIRY");
  const title = esc(subjects[eventType] || "Slotwise Notification");
  let heading = title;
  let intro = "";
  let content = "";
  if (eventType === "BOOKING_RECEIVED_OWNER") { heading = "NEW BOOKING RECEIVED"; intro = "A new booking request has been received."; content = `<table>${rows(payload, [["Business", "business_name"], ["Booking Reference", "booking_reference"], ["Customer", "customer_name"], ["Contact", "contact_number"], ["Customer Email", "customer_email"], ["Service", "service"], ["Requested Date", "booking_date"], ["Requested Time", "booking_time"]])}</table>`; }
  else if (eventType === "BOOKING_RECEIVED_CUSTOMER") { heading = "BOOKING REQUEST RECEIVED"; intro = `Hi ${esc(payload.customer_name)}, your booking request has been successfully submitted to ${business}. The business will review your request and contact you regarding confirmation.`; content = `<table>${rows(payload, [["Booking Reference", "booking_reference"], ["Service", "service"], ["Requested Date", "booking_date"], ["Requested Time", "booking_time"]])}</table>`; }
  else if (eventType === "INQUIRY_RECEIVED_OWNER") { heading = "NEW CUSTOMER INQUIRY"; intro = "A new customer inquiry has been received."; content = `<table>${rows(payload, [["Inquiry Reference", "inquiry_reference"], ["Customer", "customer_name"], ["Contact", "phone"], ["Customer Email", "customer_email"], ["Inquiry About", "inquiry_about"], ["Message", "message"], ["Date Received", "created_at"]])}</table>`; }
  else if (eventType === "INQUIRY_RECEIVED_CUSTOMER") { heading = "INQUIRY RECEIVED"; intro = `Hi ${esc(payload.customer_name)}, your inquiry has been sent successfully to ${business}. The business will contact you using the information you provided.`; content = `<table>${rows(payload, [["Inquiry Reference", "inquiry_reference"], ["Inquiry About", "inquiry_about"]])}</table>`; }
  else if (eventType === "PAYMENT_SUBMITTED_OWNER") { heading = "PAYMENT SUBMITTED"; intro = "Payment details were submitted and are pending manual verification. Open your Slotwise Client Dashboard to review the payment details."; content = `<table>${rows(payload, [["Booking Reference", "booking_reference"], ["Customer", "customer_name"], ["Payment Method", "payment_method"], ["Amount Sent", "amount_submitted"], ["Reference", "reference_number"], ["Submitted At", "submitted_at"]])}</table>`; }
  else if (eventType === "PAYMENT_VERIFIED_CUSTOMER") { heading = "PAYMENT VERIFIED"; intro = `Your submitted payment has been verified by ${business}.`; content = `<table>${rows(payload, [["Booking Reference", "booking_reference"], ["Payment Method", "payment_method"], ["Verified Amount", "amount_submitted"]])}</table>`; }
  else if (eventType === "PAYMENT_REJECTED_CUSTOMER") { heading = "PAYMENT COULD NOT BE VERIFIED"; intro = `${business} could not verify the submitted payment details. Please contact the business or submit the correct payment information as instructed.`; content = `<table>${rows(payload, [["Booking Reference", "booking_reference"], ["Payment Method", "payment_method"]])}</table>`; }
  else { heading = "BOOKING STATUS UPDATE"; intro = `Your booking status with ${business} is now ${esc(payload.status)}.`; content = `<table>${rows(payload, [["Booking Reference", "booking_reference"], ["Service", "service"], ["Date", "booking_date"], ["Time", "booking_time"], ["Status", "status"]])}</table>`; }
  const html = `<!doctype html><html><body style="margin:0;background:#f5f7f4;font-family:Arial,sans-serif;color:#182019"><div style="max-width:620px;margin:24px auto;background:#fff;border:1px solid #e0e6df;border-radius:12px;overflow:hidden"><div style="background:#101510;color:#fff;padding:22px 26px;font-weight:800;letter-spacing:.12em">SLOTWISE</div><div style="padding:28px 26px"><p style="color:#5a8b19;font-size:12px;font-weight:700;letter-spacing:.1em">${business}</p><h1 style="font-size:24px;margin:8px 0 16px">${heading}</h1><p style="line-height:1.55">${intro}</p>${content}<p style="margin-top:24px;color:#68716a;font-size:13px">Powered by Slotwise / SMM Solutions</p></div></div></body></html>`;
  return { subject: `${title} — ${business}`, html };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const expected = Deno.env.get("SLOTWISE_DISPATCH_SECRET");
  const received = request.headers.get("x-slotwise-dispatch-secret");
  if (!expected || !received || received !== expected) {
    console.error("Notification dispatcher auth failed", {
      runtimeSecretConfigured: Boolean(expected),
      dispatchHeaderPresent: Boolean(received),
      reason: !expected ? "runtime_secret_missing" : !received ? "dispatch_header_missing" : "secret_mismatch",
    });
    return json({ error: "Unauthorized" }, 401);
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const brevoKey = Deno.env.get("BREVO_API_KEY");
  const fromEmail = Deno.env.get("SLOTWISE_FROM_EMAIL");
  const fromName = Deno.env.get("SLOTWISE_FROM_NAME") || "Slotwise Notifications";
  if (!supabaseUrl || !serviceKey || !brevoKey || !fromEmail) return json({ error: "Notification service is not configured" }, 500);
  const authHeaders = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" };
  let notificationId = "";
  try {
    const body = await request.json();
    notificationId = body?.notification_id || body?.record?.id || body?.new?.id || "";
    if (!notificationId) return json({ error: "notification_id is required" }, 400);
    const getResponse = await fetch(`${supabaseUrl}/rest/v1/notification_logs?id=eq.${encodeURIComponent(notificationId)}&select=*`, { headers: authHeaders });
    const records = await getResponse.json();
    const record = records?.[0];
    if (!record) return json({ error: "Notification not found" }, 404);
    if (record.status === "SENT" || record.status === "SKIPPED_NO_RECIPIENT") return json({ status: record.status });
    if (!record.recipient_email) return json({ status: "SKIPPED_NO_RECIPIENT" });
    await fetch(`${supabaseUrl}/rest/v1/notification_logs?id=eq.${encodeURIComponent(notificationId)}`, { method: "PATCH", headers: authHeaders, body: JSON.stringify({ attempt_count: Number(record.attempt_count || 0) + 1 }) });
    const template = renderEmail(record.event_type, record.payload || {});
    const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", { method: "POST", headers: { "api-key": brevoKey, "Content-Type": "application/json" }, body: JSON.stringify({ sender: { email: fromEmail, name: fromName }, to: [{ email: record.recipient_email }], subject: template.subject, htmlContent: template.html }) });
    const result = await brevoResponse.json().catch(() => ({}));
    if (!brevoResponse.ok) throw new Error(`Brevo ${brevoResponse.status}: ${String(result.message || "delivery failed").slice(0, 300)}`);
    await fetch(`${supabaseUrl}/rest/v1/notification_logs?id=eq.${encodeURIComponent(notificationId)}`, { method: "PATCH", headers: authHeaders, body: JSON.stringify({ status: "SENT", provider_message_id: result.messageId || null, sent_at: new Date().toISOString(), error_message: null }) });
    return json({ status: "SENT" });
  } catch (error) {
    if (notificationId) await fetch(`${supabaseUrl}/rest/v1/notification_logs?id=eq.${encodeURIComponent(notificationId)}`, { method: "PATCH", headers: authHeaders, body: JSON.stringify({ status: "FAILED", error_message: String(error?.message || "Notification delivery failed").slice(0, 500) }) }).catch(() => {});
    return json({ status: "FAILED" }, 200);
  }
});
