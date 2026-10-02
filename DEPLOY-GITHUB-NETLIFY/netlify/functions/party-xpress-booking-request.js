const DEFAULT_INTEGRATION_ID = "party_xpress_rentals_v1";

function json(statusCode, body, origin = "") {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function isAllowedOrigin(origin = "") {
  const allowed = String(process.env.PARTY_XPRESS_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return !allowed.length || !origin || allowed.includes(origin);
}

function cleanText(value, maxLength = 500) {
  return String(value || "").trim().slice(0, maxLength);
}

function serviceReference(value) {
  if (typeof value === "string" || typeof value === "number") return cleanText(value, 120);
  if (!value || typeof value !== "object") return "";
  return cleanText(
    value.service_id || value.serviceId || value.slotwise_service_id || value.slotwiseServiceId ||
    value.id || value.rental_id || value.rentalId || value.slug || value.name || value.service || value.item_name,
    120,
  );
}

exports.handler = async (event) => {
  const origin = event.headers.origin || event.headers.Origin || "";

  if (event.httpMethod === "OPTIONS") return json(204, {}, origin);
  if (event.httpMethod !== "POST") return json(405, { ok: false, error: "method_not_allowed" }, origin);
  if (!isAllowedOrigin(origin)) return json(403, { ok: false, error: "origin_not_allowed" }, origin);

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return json(500, { ok: false, error: "server_not_configured" }, origin);
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { ok: false, error: "invalid_json" }, origin);
  }

  if (cleanText(payload.website || payload.company || payload.hp_field, 120)) {
    return json(200, { ok: true, accepted: true }, origin);
  }

  const integrationId = cleanText(payload.integration_id, 120);
  const expectedIntegrationId = process.env.PARTY_XPRESS_INTEGRATION_ID || DEFAULT_INTEGRATION_ID;
  if (integrationId !== expectedIntegrationId) {
    return json(403, { ok: false, error: "invalid_integration" }, origin);
  }

  const selectedServices = Array.isArray(payload.selected_services) ? payload.selected_services : [];
  const submission = {
    selected_services: selectedServices.map(serviceReference).filter(Boolean).slice(0, 10),
    event_date: cleanText(payload.event_date, 20),
    preferred_event_time: cleanText(payload.preferred_event_time, 40),
    event_type: cleanText(payload.event_type, 80),
    event_location: cleanText(payload.event_location, 500),
    estimated_guest_count: payload.estimated_guest_count === "" || payload.estimated_guest_count === null || payload.estimated_guest_count === undefined ? null : Number(payload.estimated_guest_count),
    customer_full_name: cleanText(payload.customer_full_name, 160),
    mobile_number: cleanText(payload.mobile_number, 80),
    email_address: cleanText(payload.email_address, 160),
    special_requests: cleanText(payload.special_requests, 1200),
    source: "party_xpress_website",
  };

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/rpc/create_party_xpress_public_inquiry`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ submission_payload: submission }),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    console.error("Party Xpress public inquiry failed", data);
    return json(response.status >= 500 ? 500 : 400, {
      ok: false,
      error: "submission_failed",
      message: data?.message || "Unable to submit booking request.",
    }, origin);
  }

  const record = Array.isArray(data) ? data[0] : data;
  return json(200, {
    ok: true,
    inquiry_id: record?.inquiry_id || record?.id,
    status: record?.status || "NEW",
    source: "party_xpress_website",
    message: "Booking request submitted.",
  }, origin);
};
