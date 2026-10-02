const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxBytes = 5 * 1024 * 1024;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Upload service is not configured." }, 500);

  try {
    const form = await request.formData();
    const bookingId = String(form.get("booking_id") || "");
    const businessSlug = String(form.get("business_slug") || "");
    const possessionToken = String(form.get("possession_token") || "");
    const file = form.get("file");
    if (!bookingId || !businessSlug || !possessionToken || !(file instanceof File)) return json({ error: "Booking, possession, and file are required." }, 400);
    if (!allowedTypes.has(file.type) || file.size <= 0 || file.size > maxBytes) return json({ error: "Payment proof must be JPG, PNG, or WEBP and 5 MB or less." }, 400);

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const authorizeResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/authorize_payment_proof_upload`, {
      method: "POST",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id_value: bookingId, business_slug_value: businessSlug, booking_possession_token_value: possessionToken, file_extension_value: extension }),
    });
    const authorized = await authorizeResponse.json().catch(() => null);
    if (!authorizeResponse.ok || typeof authorized !== "string") return json({ error: "Booking possession could not be verified." }, 403);

    const objectResponse = await fetch(`${supabaseUrl}/storage/v1/object/payment-proofs/${authorized.split("/").map(encodeURIComponent).join("/")}`, {
      method: "POST",
      headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, "Content-Type": file.type, "x-upsert": "false" },
      body: await file.arrayBuffer(),
    });
    if (!objectResponse.ok) return json({ error: "Payment proof could not be stored." }, 502);
    return json({ path: authorized }, 200);
  } catch {
    return json({ error: "Payment proof upload failed." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
