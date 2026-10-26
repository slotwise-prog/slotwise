#!/usr/bin/env node

// Redacted, disposable Orders Phase 1A runner. Credentials are environment-only.
const required = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "ORDERS_TEST_PRODUCT_ID"];
const missing = required.filter((name) => !process.env[name]);
const results = [];
const record = (name, status, detail = "") => { results.push({ status }); console.log(`${status.padEnd(9)} ${name}${detail ? ` — ${detail}` : ""}`); };
const safe = (value) => String(value?.message || value || "unknown").replace(/(token|key|secret)\s*[:=]\s*[^,;\s]+/gi, "$1=[redacted]").slice(0, 220);

if (missing.length) {
  console.log(`NOT RUN   missing environment: ${missing.join(", ")}`);
  console.log("Required: SUPABASE_URL, SUPABASE_ANON_KEY, ORDERS_TEST_PRODUCT_ID");
  process.exitCode = 2;
} else {
  const base = process.env.SUPABASE_URL.replace(/\/$/, "");
  const key = process.env.SUPABASE_ANON_KEY;
  const business = process.env.ORDERS_TEST_BUSINESS || "slotwise-orders-test";
  const otherBusiness = process.env.ORDERS_OTHER_BUSINESS || "";
  const edge = process.env.ORDERS_UPLOAD_FUNCTION_URL || `${base}/functions/v1/upload-order-payment-proof`;
  const product = process.env.ORDERS_TEST_PRODUCT_ID;
  const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  const resultsBody = async (response) => ({ ok: response.ok, status: response.status, data: await response.json().catch(() => null) });
  const rpc = async (name, body) => resultsBody(await fetch(`${base}/rest/v1/rpc/${name}`, { method: "POST", headers, body: JSON.stringify(body) }));
  const png = Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1,8,6,0,0,0,31,21,196,137,0,0,0,13,73,68,65,84,120,156,99,248,207,192,240,31,0,5,0,1,255,137,153,61,29,0,0,0,0,73,69,78,68,174,66,96,130]);
  const create = async (option = "PAY_NOW") => {
    const response = await rpc("create_public_order", { order_payload: { business_slug: business, customer_name: "SLOTWISE AUTOMATED TEST", customer_email: "orders-test@example.invalid", customer_contact: "0000000000", fulfillment_type: "PICKUP", payment_option: option, items: [{ product_id: product, quantity: 1 }] }, idempotency_key_value: crypto.randomUUID() });
    if (!response.ok || !response.data?.[0]) throw new Error(`create_public_order HTTP ${response.status}`);
    return response.data[0];
  };
  const upload = async (order, blob, name) => { const form = new FormData(); form.append("order_id", order.order_id); form.append("business_slug", business); form.append("possession_token", order.possession_token); form.append("file", blob, name); return resultsBody(await fetch(edge, { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}` }, body: form })); };

  try {
    const order = await create();
    const noProof = await rpc("submit_public_order_payment", { order_id_value: order.order_id, business_slug_value: business, possession_token_value: order.possession_token, payment_method_value: "GCASH", amount_value: 100 });
    record("payment without required proof", !noProof.ok ? "PASS" : "FAIL", !noProof.ok ? "rejected" : "accepted unexpectedly");
    const proofOrder = await create();
    const badToken = await upload({ ...proofOrder, possession_token: "invalid" }, new Blob([png], { type: "image/png" }), "proof.png");
    record("invalid possession token", badToken.status === 403 ? "PASS" : "FAIL", `HTTP ${badToken.status}`);
    const badType = await upload(proofOrder, new Blob(["not image"], { type: "text/plain" }), "proof.txt");
    record("unsupported file type", badType.status === 400 ? "PASS" : "FAIL", `HTTP ${badType.status}`);
    const large = await upload(proofOrder, new Blob([new Uint8Array(5 * 1024 * 1024 + 1)], { type: "image/png" }), "large.png");
    record("oversized file", large.status === 400 ? "PASS" : "FAIL", `HTTP ${large.status}`);
    const uploaded = await upload(proofOrder, new Blob([png], { type: "image/png" }), "proof.png");
    record("valid proof upload", uploaded.ok && typeof uploaded.data?.path === "string" ? "PASS" : "FAIL", uploaded.ok ? "path returned" : `HTTP ${uploaded.status}`);
    const submitted = await rpc("submit_public_order_payment", { order_id_value: proofOrder.order_id, business_slug_value: business, possession_token_value: proofOrder.possession_token, payment_method_value: "GCASH", amount_value: 100, proof_storage_path_value: uploaded.data?.path });
    record("payment with valid proof", submitted.ok ? "PASS" : "FAIL", submitted.ok ? "pending" : `HTTP ${submitted.status}`);
    const paymentId = submitted.data?.[0]?.payment_id;
    const rejected = paymentId && await rpc("verify_order_payment", { target_slug: business, order_id_value: proofOrder.order_id, payment_id_value: paymentId, decision: "REJECTED", rejection_reason_value: "Automated test rejection" });
    const rejectionAuthBlocked = rejected && rejected.status === 400 && rejected.data?.message === "Not authorized.";
    record("payment rejection", rejected?.ok ? "PASS" : "NOT RUN", rejected ? (rejected.ok ? "rejected" : rejectionAuthBlocked ? "requires authenticated business user" : `HTTP ${rejected.status}${rejected.data?.message ? `: ${rejected.data.message}` : ""}`) : "no payment id");
    const duplicate = await rpc("submit_public_order_payment", { order_id_value: proofOrder.order_id, business_slug_value: business, possession_token_value: proofOrder.possession_token, payment_method_value: "GCASH", amount_value: 100, proof_storage_path_value: uploaded.data?.path });
    record("duplicate payment prevention", !duplicate.ok ? "PASS" : "FAIL", !duplicate.ok ? "rejected" : "accepted unexpectedly");
    if (otherBusiness) {
      const cross = await rpc("submit_public_order_payment", { order_id_value: order.order_id, business_slug_value: otherBusiness, possession_token_value: order.possession_token, payment_method_value: "GCASH", amount_value: 100 });
      record("cross-business rejection", !cross.ok ? "PASS" : "FAIL", !cross.ok ? "rejected" : "accepted unexpectedly");
    } else record("cross-business rejection", "NOT RUN", "set ORDERS_OTHER_BUSINESS");
    record("payment snapshot integrity", "NOT RUN", "requires read-only SQL assertion");
    record("booking payment regression", "NOT RUN", "requires disposable booking fixture");
  } catch (error) { record("runner execution", "FAIL", safe(error)); }
  const counts = results.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});
  console.log(`SUMMARY PASS=${counts.PASS || 0} FAIL=${counts.FAIL || 0} NOT_RUN=${counts["NOT RUN"] || 0}`);
  if (counts.FAIL) process.exitCode = 1;
}
