const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type",
};

const bucket = "order-product-images";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "Image service is not configured." }, 500);

  try {
    const body = await request.json();
    const businessSlug = String(body.business_slug || "").trim();
    const imagePath = String(body.image_path || "").trim();
    if (!/^[a-z0-9-]+$/.test(businessSlug) || !imagePath.startsWith(`${businessSlug}/`) || imagePath.includes("..") || imagePath.includes("\\") || !/^[A-Za-z0-9._/-]+$/.test(imagePath)) {
      return json({ error: "Invalid product image request." }, 400);
    }

    const headers = { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` };
    const businessResponse = await fetch(`${supabaseUrl}/rest/v1/businesses?select=slug&slug=eq.${encodeURIComponent(businessSlug)}&status=eq.ACTIVE`, { headers });
    const businessRows = await businessResponse.json().catch(() => []);
    if (!businessResponse.ok || !businessRows.length) return json({ error: "Product image is unavailable." }, 404);

    const entitlementResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/orders_public_enabled`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ target_slug: businessSlug }) });
    const entitlement = await entitlementResponse.json().catch(() => false);
    if (!entitlementResponse.ok || entitlement !== true) return json({ error: "Product image is unavailable." }, 404);

    const productResponse = await fetch(`${supabaseUrl}/rest/v1/business_products?select=id&business_slug=eq.${encodeURIComponent(businessSlug)}&image_path=eq.${encodeURIComponent(imagePath)}&active=eq.true`, { headers });
    const productRows = await productResponse.json().catch(() => []);
    if (!productResponse.ok || !productRows.length) return json({ error: "Product image is unavailable." }, 404);

    const signedResponse = await fetch(`${supabaseUrl}/storage/v1/object/sign/${bucket}/${imagePath.split("/").map(encodeURIComponent).join("/")}`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ expiresIn: 900 }) });
    const signed = await signedResponse.json().catch(() => ({}));
    if (!signedResponse.ok) return json({ error: "Product image could not be signed." }, 502);
    const signedUrl = signed.signedURL || signed.signedUrl || signed.path;
    if (!signedUrl) return json({ error: "Product image could not be signed." }, 502);
    return json({ signed_url: /^https?:\/\//i.test(signedUrl) ? signedUrl : `${supabaseUrl}/storage/v1${signedUrl}` });
  } catch {
    return json({ error: "Product image request failed." }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
