import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CreditCard, Package, Upload, X } from "lucide-react";

const money = (value) => `₱${Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function OrderNotice({ children, tone = "info" }) {
  return <div className={`ordersNotice ${tone}`} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}

export function PublicOrdersPage({ business, api, onBack }) {
  const [products, setProducts] = useState([]);
  const [paymentConfig, setPaymentConfig] = useState({ mode: "OFF", require_proof: false, methods: [] });
  const [cart, setCart] = useState({});
  const [form, setForm] = useState({ name: "", email: "", contact: "", fulfillment: "PICKUP", delivery: "" });
  const [step, setStep] = useState("shop");
  const [payment, setPayment] = useState({ option: "PAY_LATER", method: "", reference: "", note: "", proof: null });
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [proofPath, setProofPath] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api.getProducts(business.slug), api.getPaymentConfig(business.slug)])
      .then(async ([items, config]) => {
        if (!active) return;
        const productRows = Array.isArray(items) ? items : [];
        const withImages = await Promise.all(productRows.map(async (product) => {
          if (!product.image_path || !api.getProductImage) return product;
          try {
            return { ...product, image_path: await api.getProductImage(business.slug, product.image_path) };
          } catch {
            return { ...product, image_path: null };
          }
        }));
        setProducts(withImages);
        const rows = Array.isArray(config) ? config : [];
        const first = rows[0] || {};
        setPaymentConfig({ mode: first.mode || "OFF", require_proof: Boolean(first.require_proof), methods: rows.filter((row) => row.method_type) });
        setPayment((current) => ({ ...current, option: first.mode === "REQUIRED" ? "PAY_NOW" : "PAY_LATER", method: rows.find((row) => row.method_type)?.method_type || "" }));
      })
      .catch((loadError) => setError(loadError.message || "Orders are temporarily unavailable."))
      .finally(() => setLoading(false));
    return () => { active = false; };
  }, [api, business.slug]);

  const lines = useMemo(() => products.map((product) => ({ ...product, quantity: Number(cart[product.id] || 0) })).filter((product) => product.quantity > 0), [products, cart]);
  const total = lines.reduce((sum, item) => sum + Number(item.price || 0) * item.quantity, 0);
  const updateQuantity = (id, delta) => setCart((current) => ({ ...current, [id]: Math.max(0, Number(current[id] || 0) + delta) }));
  const paymentRequired = paymentConfig.mode === "REQUIRED";
  const paymentAllowed = paymentConfig.mode === "OPTIONAL" || paymentRequired;

  const submitOrder = async (event) => {
    event.preventDefault();
    setError("");
    if (!lines.length) return setError("Add at least one product to your order.");
    if (form.fulfillment === "DELIVERY" && !form.delivery.trim()) return setError("Enter your delivery details to continue.");
    if (paymentRequired && payment.option !== "PAY_NOW") return setError("Payment is required for this order.");
    setSaving(true);
    try {
      const result = await api.createOrder({
        business_slug: business.slug,
        customer_name: form.name.trim(),
        customer_email: form.email.trim(),
        customer_contact: form.contact.trim(),
        fulfillment_type: form.fulfillment,
        delivery_details: form.delivery.trim() ? { address: form.delivery.trim() } : {},
        payment_option: paymentAllowed && payment.option === "PAY_NOW" ? "PAY_NOW" : "PAY_LATER",
        items: lines.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      }, `web-${business.slug}-${crypto.randomUUID?.() || Date.now()}`);
      setOrder(Array.isArray(result) ? result[0] : result);
      if (paymentAllowed && payment.option === "PAY_NOW") setStep("payment");
      else setStep("success");
    } catch (submitError) {
      setError(submitError.message || "We could not submit this order.");
    } finally { setSaving(false); }
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    if (!order?.possession_token) return setError("This order session has expired. Please start again.");
    if (!payment.method) return setError("Choose a configured payment method.");
    setSaving(true); setError("");
    try {
      let uploadedPath = proofPath;
      if (payment.proof && !uploadedPath) {
        uploadedPath = await api.uploadProof({ orderId: order.order_id, businessSlug: business.slug, token: order.possession_token, file: payment.proof });
        setProofPath(uploadedPath);
      }
      const result = await api.submitPayment(order.order_id, business.slug, order.possession_token, payment.method, Number(order.total_amount || total), payment.reference, payment.note, uploadedPath);
      setOrder((current) => ({ ...current, payment_status: "PENDING_VERIFICATION", payment_id: Array.isArray(result) ? result[0]?.payment_id : result?.payment_id }));
      setStep("success");
    } catch (paymentError) { setError(paymentError.message || "Payment details could not be submitted."); }
    finally { setSaving(false); }
  };

  if (loading) return <main className="ordersPage"><div className="ordersShell"><p>Loading products...</p></div></main>;
  if (error && !products.length) return <main className="ordersPage"><div className="ordersShell"><button type="button" className="ordersBack" onClick={onBack}><ArrowLeft size={16} /> Back</button><OrderNotice tone="error">{error}</OrderNotice></div></main>;
  if (step === "success") return <main className="ordersPage"><section className="ordersSuccess"><span className="ordersSuccessIcon"><Check size={24} /></span><p className="ordersEyebrow">Order received</p><h1>Thank you, {form.name || "customer"}.</h1><p>Your order request has been saved for {business.business}.</p><dl><div><dt>Order reference</dt><dd>{order?.order_reference || "Pending"}</dd></div><div><dt>Total</dt><dd>{money(order?.total_amount ?? total)}</dd></div><div><dt>Payment</dt><dd>{order?.payment_status === "PENDING_VERIFICATION" ? "Pending Verification" : "Unpaid / Pay Later"}</dd></div></dl><button type="button" className="ordersPrimary" onClick={onBack}>Back to {business.business}</button></section></main>;

  return <main className="ordersPage"><section className="ordersShell"><button type="button" className="ordersBack" onClick={onBack}><ArrowLeft size={16} /> Back to {business.business}</button><header className="ordersHeader"><div><span className="ordersEyebrow">ONLINE ORDERING</span><h1>{business.business}</h1><p>Choose your products and send an order request. The business will confirm fulfillment details.</p></div><Package size={34} /></header><div className="ordersLayout"><section><div className="ordersSectionHeading"><div><span className="ordersEyebrow">PRODUCTS</span><h2>Build your order</h2></div><span>{lines.length} item{lines.length === 1 ? "" : "s"}</span></div><div className="ordersProductGrid">{products.map((product) => <article className="ordersProductCard" key={product.id}>{product.image_path && <img src={product.image_path} alt="" />}{!product.image_path && <div className="ordersProductPlaceholder"><Package size={24} /></div>}<div><h3>{product.name}</h3><p>{product.description || "Available from this business."}</p><strong>{money(product.price)}</strong><div className="ordersQuantity"><button type="button" aria-label={`Remove one ${product.name}`} onClick={() => updateQuantity(product.id, -1)}><X size={15} /></button><span>{cart[product.id] || 0}</span><button type="button" aria-label={`Add one ${product.name}`} onClick={() => updateQuantity(product.id, 1)}><ArrowRight size={15} /></button></div></div></article>)}</div>{!products.length && <OrderNotice>No products are available right now.</OrderNotice>}</section><aside className="ordersCheckout"><div className="ordersSummary"><div className="ordersSectionHeading"><h2>Order summary</h2><strong>{money(total)}</strong></div>{lines.length ? lines.map((item) => <div className="ordersSummaryLine" key={item.id}><span>{item.name} × {item.quantity}</span><strong>{money(Number(item.price) * item.quantity)}</strong></div>) : <p>Select products to begin.</p>}</div><form onSubmit={submitOrder} className="ordersForm"><h2>Your details</h2><label>Full name *<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" /></label><label>Email address *<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" /></label><label>Contact number *<input required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} autoComplete="tel" /></label><label>Fulfillment<select value={form.fulfillment} onChange={(e) => setForm({ ...form, fulfillment: e.target.value })}><option value="PICKUP">Pickup</option><option value="DELIVERY">Delivery</option></select></label>{form.fulfillment === "DELIVERY" && <label>Delivery details *<textarea required rows="3" value={form.delivery} onChange={(e) => setForm({ ...form, delivery: e.target.value })} /></label>}{paymentAllowed && <fieldset><legend>Payment option</legend><label className="ordersRadio"><input type="radio" checked={payment.option === "PAY_NOW"} disabled={paymentRequired} onChange={() => setPayment({ ...payment, option: "PAY_NOW" })} /> Pay Now</label>{!paymentRequired && <label className="ordersRadio"><input type="radio" checked={payment.option === "PAY_LATER"} onChange={() => setPayment({ ...payment, option: "PAY_LATER" })} /> Pay Later</label>}<small>{paymentRequired ? "Payment is required before the order can proceed." : "The business will review payment manually."}</small></fieldset>}{error && <OrderNotice tone="error">{error}</OrderNotice>}<button className="ordersPrimary" type="submit" disabled={saving || !lines.length}>{saving ? "Submitting..." : "Submit order"}<ArrowRight size={17} /></button></form></aside></div></section></main>;
}

export function OrderPaymentStep({ business, order, paymentConfig, api, onDone }) {
  const methods = paymentConfig.methods || [];
  const [method, setMethod] = useState(methods[0]?.method_type || "");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(""); try { const path = file ? await api.uploadProof({ orderId: order.order_id, businessSlug: business.slug, token: order.possession_token, file }) : ""; const result = await api.submitPayment(order.order_id, business.slug, order.possession_token, method, order.total_amount, reference, note, path); onDone(result); } catch (e) { setError(e.message || "Unable to submit payment."); } finally { setSaving(false); } };
  return <form className="ordersPaymentStep" onSubmit={submit}><div className="ordersPaymentHeading"><CreditCard size={22} /><div><span className="ordersEyebrow">PAYMENT DETAILS</span><h2>Complete your payment</h2><p>Payment will remain pending until the business verifies it.</p></div></div>{methods.map((item) => <label className={`ordersPaymentMethod ${method === item.method_type ? "selected" : ""}`} key={item.method_type}><input type="radio" name="order-payment-method" checked={method === item.method_type} onChange={() => setMethod(item.method_type)} /> <span><strong>{item.method_name || item.method_type}</strong><small>{item.instructions || item.account_name || "Follow the business payment instructions."}</small></span></label>)}<label>Payment reference<input value={reference} onChange={(e) => setReference(e.target.value)} /></label><label>Proof of payment{paymentConfig.require_proof && " *"}<input type="file" accept="image/jpeg,image/png,image/webp" required={paymentConfig.require_proof} onChange={(e) => setFile(e.target.files?.[0] || null)} /></label><label>Note<textarea rows="3" value={note} onChange={(e) => setNote(e.target.value)} /></label>{error && <OrderNotice tone="error">{error}</OrderNotice>}<button className="ordersPrimary" disabled={saving || !method}>{saving ? "Submitting payment..." : "Submit payment"}<Upload size={16} /></button></form>;
}

export function OrdersDashboardPanel({ businessSlug, api, accessToken }) {
  const [orders, setOrders] = useState([]); const [products, setProducts] = useState([]); const [settings, setSettings] = useState({ enabled: false, fulfillment_mode: "PICKUP" }); const [paymentSettings, setPaymentSettings] = useState({ mode: "OFF", require_proof: false }); const [paymentMethods, setPaymentMethods] = useState([]); const [allowed, setAllowed] = useState(false); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [subTab, setSubTab] = useState("orders"); const [productForm, setProductForm] = useState({ id: "", name: "", description: "", price: "", image_path: "", active: true, display_order: 0 }); const [productFile, setProductFile] = useState(null); const [uploadingImage, setUploadingImage] = useState(false); const [methodForm, setMethodForm] = useState({ method_type: "GCASH", method_name: "GCash", account_name: "", account_number: "", instructions: "", active: true });
  const load = async () => { setLoading(true); try { const access = await api.ordersAccess(businessSlug, accessToken); const canUse = Boolean(Array.isArray(access) ? access[0] : access); setAllowed(canUse); if (canUse) { const [rows, productRows, orderSettings, orderPaymentSettings, methods, paymentRows] = await Promise.all([api.getBusinessOrders(businessSlug, accessToken), api.getProductsAdmin(businessSlug, accessToken), api.getOrderingSettings(businessSlug, accessToken), api.getOrderPaymentSettings(businessSlug, accessToken), api.getPaymentMethods(businessSlug, accessToken), api.getOrderPayments(businessSlug, accessToken)]); const paymentsByOrder = (paymentRows || []).reduce((group, payment) => ({ ...group, [payment.order_id]: [...(group[payment.order_id] || []), { id: payment.id, method: payment.payment_method, amount_submitted: payment.amount_submitted, reference: payment.reference_number, status: payment.payment_status, submitted_at: payment.submitted_at, rejection_reason: payment.rejection_reason, proof_storage_path: payment.proof_storage_path }] }), {}); setOrders((Array.isArray(rows) ? rows : []).map((row) => { const item = row.order_data || row; return { ...item, payments: paymentsByOrder[item.id] || item.payments || [] }; })); setProducts(productRows || []); setSettings(orderSettings || { enabled: false, fulfillment_mode: "PICKUP" }); setPaymentSettings(orderPaymentSettings || { mode: "OFF", require_proof: false }); setPaymentMethods(methods || []); } } catch (e) { setError(e.message || "Unable to load Orders."); } finally { setLoading(false); } };
  useEffect(() => { load(); }, [businessSlug, accessToken]);
  const updateStatus = async (orderId, status) => { try { await api.setBusinessOrderStatus(businessSlug, orderId, status, accessToken); await load(); } catch (e) { setError(e.message || "Unable to update order."); } };
  const chooseProductImage = (event) => { const file = event.target.files?.[0]; if (!file) return; if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return setError("Use a JPG, PNG, or WebP image."); if (file.size > 5 * 1024 * 1024) return setError("Product images must be 5 MB or smaller."); setError(""); setProductFile(file); };
  const saveProduct = async (event) => { event.preventDefault(); setError(""); setUploadingImage(Boolean(productFile)); try { const productId = productForm.id || `PRODUCT-${crypto.randomUUID?.() || Date.now()}`; let imagePath = productForm.image_path || null; if (productFile) imagePath = await api.uploadProductImage({ businessSlug, productId, file: productFile }, accessToken); await api.saveProduct({ ...productForm, id: productId, business_slug: businessSlug, image_path: imagePath, price: Number(productForm.price), display_order: Number(productForm.display_order || 0) }, accessToken); setProductForm({ id: "", name: "", description: "", price: "", image_path: "", active: true, display_order: 0 }); setProductFile(null); await load(); } catch (e) { setError(e.message || "Unable to save product."); } finally { setUploadingImage(false); } };
  const removeProduct = async (product) => { if (!window.confirm(`Delete ${product.name}?`)) return; try { await api.deleteProduct(product.id, accessToken); await load(); } catch (e) { setError(e.message || "Unable to delete product."); } };
  const saveSettings = async (event) => { event.preventDefault(); try { await api.saveOrderingSettings({ business_slug: businessSlug, enabled: Boolean(settings.enabled), fulfillment_mode: settings.fulfillment_mode }, accessToken); await api.saveOrderPaymentSettings(businessSlug, paymentSettings.mode, Boolean(paymentSettings.require_proof), accessToken); await load(); } catch (e) { setError(e.message || "Unable to save Orders settings."); } };
  const saveMethod = async (event) => { event.preventDefault(); try { await api.savePaymentMethod({ ...methodForm, id: methodForm.id || `ORDERMETHOD-${businessSlug}-${methodForm.method_type}`, business_slug: businessSlug }, accessToken); setMethodForm({ method_type: "GCASH", method_name: "GCash", account_name: "", account_number: "", instructions: "", active: true }); await load(); } catch (e) { setError(e.message || "Unable to save payment method."); } };
  const decidePayment = async (orderItem, paymentItem, decision) => { try { await api.verifyOrderPayment(businessSlug, orderItem.id, paymentItem.id, decision, decision === "REJECTED" ? "Payment requires review." : null, accessToken); await load(); } catch (e) { setError(e.message || "Unable to update payment."); } };
  if (loading) return <section className="ordersDashboardPanel"><p>Loading Orders...</p></section>;
  if (!allowed) return <section className="ordersDashboardPanel"><span className="ordersEyebrow">ORDERS</span><h2>Orders is not enabled</h2><p>Enable the Orders entitlement for this business before using the ordering dashboard.</p></section>;
  return <section className="ordersDashboardPanel"><div className="clientDashboardHeader"><div><p className="eyebrow">Orders</p><h2>{subTab === "orders" ? "Customer orders" : subTab === "products" ? "Product catalog" : "Orders settings"}</h2><p>Manage ordering without changing your booking configuration.</p></div><button type="button" className="clientPrimaryButton" onClick={load}>Refresh</button></div><div className="ordersAdminTabs"><button type="button" className={subTab === "orders" ? "active" : ""} onClick={() => setSubTab("orders")}>Orders</button><button type="button" className={subTab === "products" ? "active" : ""} onClick={() => setSubTab("products")}>Products</button><button type="button" className={subTab === "settings" ? "active" : ""} onClick={() => setSubTab("settings")}>Settings</button></div>{error && <OrderNotice tone="error">{error}</OrderNotice>}{subTab === "orders" && (!orders.length ? <div className="clientEmptyState">No orders yet.</div> : <div className="ordersAdminList">{orders.map((item) => <article className="ordersAdminCard" key={item.id}><div><span className="ordersReference">{item.order_reference}</span><h3>{item.customer_name}</h3><p>{item.customer_email} · {item.fulfillment_type}</p><p>{(item.items || []).map((line) => `${line.name} × ${line.quantity}`).join(", ")}</p></div><div><strong>{money(item.total_amount)}</strong><span>Payment: {String(item.payment_status || "UNPAID").replaceAll("_", " ")}</span>{(item.payments || []).map((payment) => <div className="ordersPaymentReview" key={payment.id}><small>{payment.method} · {payment.status}</small>{payment.proof_storage_path && <button type="button" onClick={async () => { try { window.open(await api.getProofUrl(payment.proof_storage_path, accessToken), "_blank", "noopener,noreferrer"); } catch (e) { setError(e.message); } }}>View proof</button>}{payment.status === "PENDING_VERIFICATION" && <span><button type="button" onClick={() => decidePayment(item, payment, "VERIFIED")}>Verify</button><button type="button" onClick={() => decidePayment(item, payment, "REJECTED")}>Reject</button></span>}</div>)}<select value={item.order_status || "PENDING"} onChange={(e) => updateStatus(item.id, e.target.value)}><option value="PENDING">Pending</option><option value="PROCESSING">Processing</option><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></div></article>)}</div>)}{subTab === "products" && <div className="ordersManagementGrid"><form className="ordersForm" onSubmit={saveProduct}><h3>{productForm.id ? "Edit product" : "Add product"}</h3><label>Name *<input required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} /></label><label>Description<textarea rows="3" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} /></label><label>Price *<input required type="number" min="0" step="0.01" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} /></label><label>Product image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={chooseProductImage} />{productFile && <small>{productFile.name} · ready to upload</small>}{productForm.image_path && !productFile && <small>Existing image saved.</small>}</label><label className="ordersRadio"><input type="checkbox" checked={productForm.active} onChange={(e) => setProductForm({ ...productForm, active: e.target.checked })} /> Available for public ordering</label><button className="ordersPrimary" disabled={uploadingImage}>{uploadingImage ? "Uploading image..." : "Save product"}</button></form><div className="ordersAdminList">{products.map((product) => <article className="ordersAdminCard" key={product.id}>{product.image_path && <img className="ordersAdminProductImage" src={product.image_path} alt="" />}<div><h3>{product.name}</h3><p>{money(product.price)} · {product.active ? "Available" : "Hidden"}</p><p>{product.description}</p></div><div><button type="button" onClick={() => setProductForm(product)}>Edit</button><button type="button" onClick={() => removeProduct(product)}>Delete</button></div></article>)}</div></div>}{subTab === "settings" && <div className="ordersSettingsForm"><form onSubmit={saveSettings}><label className="ordersRadio"><input type="checkbox" checked={settings.enabled} onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })} /> Enable public ordering</label><label>Fulfillment<select value={settings.fulfillment_mode} onChange={(e) => setSettings({ ...settings, fulfillment_mode: e.target.value })}><option value="PICKUP">Pickup only</option><option value="DELIVERY">Delivery only</option><option value="PICKUP_AND_DELIVERY">Pickup and delivery</option></select></label><label>Order payment mode<select value={paymentSettings.mode} onChange={(e) => setPaymentSettings({ ...paymentSettings, mode: e.target.value })}><option value="OFF">Payments off</option><option value="OPTIONAL">Pay now optional</option><option value="REQUIRED">Pay now required</option></select></label><label className="ordersRadio"><input type="checkbox" checked={paymentSettings.require_proof} onChange={(e) => setPaymentSettings({ ...paymentSettings, require_proof: e.target.checked })} /> Require proof for Pay Now</label><button className="ordersPrimary">Save settings</button></form><form className="ordersForm" onSubmit={saveMethod}><h3>Payment methods</h3><label>Method<select value={methodForm.method_type} onChange={(e) => setMethodForm({ ...methodForm, method_type: e.target.value, method_name: e.target.value === "GCASH" ? "GCash" : e.target.value })}><option value="GCASH">GCash</option><option value="MAYA">Maya</option><option value="BANK_TRANSFER">Bank Transfer</option></select></label><label>Account name<input value={methodForm.account_name} onChange={(e) => setMethodForm({ ...methodForm, account_name: e.target.value })} /></label><label>Account number<input value={methodForm.account_number} onChange={(e) => setMethodForm({ ...methodForm, account_number: e.target.value })} /></label><label>Instructions<textarea rows="3" value={methodForm.instructions} onChange={(e) => setMethodForm({ ...methodForm, instructions: e.target.value })} /></label><label className="ordersRadio"><input type="checkbox" checked={methodForm.active} onChange={(e) => setMethodForm({ ...methodForm, active: e.target.checked })} /> Active</label><button className="ordersPrimary">Save payment method</button><div className="ordersMethodList">{paymentMethods.map((method) => <button type="button" key={method.id} onClick={() => setMethodForm(method)}>{method.method_name || method.method_type} · {method.active ? "Active" : "Hidden"}</button>)}</div></form><p>Configured booking payment methods remain separate from Orders settings.</p></div>}</section>;
}
