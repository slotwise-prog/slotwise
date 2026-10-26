const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);
const maxBytes = 5 * 1024 * 1024;
const bucket = "order-payment-proofs";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Upload service is not configured." }, 500);

  try {
    const form = await request.formData();
    const orderId = String(form.get("order_id") || "").trim();
    const businessSlug = String(form.get("business_slug") || "").trim();
    const possessionToken = String(form.get("possession_token") || "");
    const file = form.get("file");

    if (!orderId || !businessSlug || !possessionToken || !(file instanceof File)) {
      return json({ error: "Order, possession token, and file are required." }, 400);
    }
    if (!/^[a-z0-9-]+$/.test(businessSlug) || !/^[A-Za-z0-9_-]+$/.test(orderId)) {
      return json({ error: "Invalid order identity." }, 400);
    }

    const extension = allowedTypes.get(file.type);
    if (!extension || file.size <= 0 || file.size > maxBytes) {
      return json({ error: "Payment proof must be JPG, PNG, or WEBP and 5 MB or less." }, 400);
    }

    const authorizeResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/authorize_order_payment_proof_upload`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id_value: orderId,
        business_slug_value: businessSlug,
        possession_token_value: possessionToken,
        file_extension_value: extension,
      }),
    });
    const authorized = await authorizeResponse.json().catch(() => null);
    if (!authorizeResponse.ok || typeof authorized !== "string") {
      return json({ error: "Order possession could not be verified." }, 403);
    }

    const expectedPrefix = `${businessSlug}/${orderId}/`;
    if (!authorized.startsWith(expectedPrefix) || authorized.includes("..") || authorized.includes("\\")) {
      return json({ error: "Invalid order payment proof path." }, 403);
    }

    const objectResponse = await fetch(
      `${supabaseUrl}/storage/v1/object/${bucket}/${authorized.split("/").map(encodeURIComponent).join("/")}`,
      {
        method: "POST",
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": file.type,
          "x-upsert": "false",
        },
        body: await file.arrayBuffer(),
      },
    );
    if (!objectResponse.ok) return json({ error: "Order payment proof could not be stored." }, 502);
    return json({ path: authorized }, 200);
  } catch {
    return json({ error: "Order payment proof upload failed." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
