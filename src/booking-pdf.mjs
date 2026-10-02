const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const PAGE_LEFT = 48;
const PAGE_RIGHT = PAGE_WIDTH - 48;
const CONTENT_WIDTH = PAGE_RIGHT - PAGE_LEFT;
const FOOTER_LIMIT = PAGE_HEIGHT - 66;
const encoder = new TextEncoder();

const WIN_ANSI_SPECIALS = {
  "€": 0x80, "‚": 0x82, "ƒ": 0x83, "„": 0x84, "…": 0x85, "†": 0x86,
  "‡": 0x87, "ˆ": 0x88, "‰": 0x89, "Š": 0x8a, "‹": 0x8b, "Œ": 0x8c,
  "Ž": 0x8e, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95,
  "–": 0x96, "—": 0x97, "˜": 0x98, "™": 0x99, "š": 0x9a, "›": 0x9b,
  "œ": 0x9c, "ž": 0x9e, "Ÿ": 0x9f,
};

function cleanValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return "";
  const text = String(value).trim();
  return /^(undefined|null|nan)$/i.test(text) ? "" : text;
}

function pdfText(value) {
  return cleanValue(value)
    .replaceAll("₱", "PHP ")
    .replaceAll("\u00a0", " ")
    .replaceAll("\u2022", "-")
    .replaceAll("\u2013", "-")
    .replaceAll("\u2014", "-")
    .replaceAll("\u2026", "...")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "");
}

function winAnsiHex(value) {
  return [...pdfText(value)].map((character) => {
    const codePoint = character.codePointAt(0);
    if (WIN_ANSI_SPECIALS[character] !== undefined) return WIN_ANSI_SPECIALS[character].toString(16).padStart(2, "0");
    if (codePoint <= 0xff) return codePoint.toString(16).padStart(2, "0");
    return "3f";
  }).join("").toUpperCase();
}

function escapePdfName(value) {
  return String(value || "")
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(0, 70) || "Record";
}

function safeDate(value) {
  const text = cleanValue(value);
  if (!text) return "";
  let date;
  const day = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (day) date = new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]));
  else date = new Date(text);
  return Number.isNaN(date.getTime())
    ? text
    : date.toLocaleDateString("en-PH", { month: "long", day: "numeric", year: "numeric" });
}

function money(value) {
  if (value === null || value === undefined || value === "" || !Number.isFinite(Number(value))) return "";
  return `PHP ${Number(value).toLocaleString("en-PH", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function hexToRgb(hex, fallback = [0.1, 0.25, 0.6]) {
  const match = String(hex || "").match(/^#?([\da-f]{6})$/i);
  if (!match) return fallback;
  return [0, 2, 4].map((index) => parseInt(match[1].slice(index, index + 2), 16) / 255);
}

function formatDeparture(departure = {}) {
  if (typeof departure === "string") return cleanValue(departure);
  if (!departure || typeof departure !== "object") return "";
  const start = safeDate(departure.startDate || departure.start_date || departure.date || departure.departureDate);
  const end = safeDate(departure.endDate || departure.end_date || departure.returnDate);
  if (start && end && start !== end) return `${start} to ${end}`;
  return start || end;
}

function pricingIsQuoteOnly(metadata = {}, total) {
  const state = String(metadata.pricing_status || metadata.pest_pricing_status || "").toLowerCase();
  const type = String(metadata.pricing_type || "").toUpperCase();
  const departureRate = Number(metadata.selected_departure?.price);
  const hasDepartureRate = Number.isFinite(departureRate) && departureRate > 0;
  return ["assessment_required", "rate_only", "quote", "quote_only", "custom_inquiry", "inquiry"].includes(state)
    || ["CUSTOM_INQUIRY", "IMAGE_BASED_PRICING"].includes(type)
    || ((total === null || total === undefined || total === "") && !hasDepartureRate);
}

function bookingFieldRows({ booking, template, quoteOnly }) {
  const metadata = booking.metadata || {};
  const templateKey = String(metadata.booking_template || template || "GENERAL").toUpperCase();
  const rows = [];
  const add = (label, value, formatter = cleanValue) => {
    const formatted = formatter(value);
    if (formatted) rows.push([label, formatted]);
  };
  const notes = metadata.special_requests || metadata.additional_requirements || booking.note;

  if (templateKey === "TOURS_TRAVEL") {
    add("Departure", formatDeparture(metadata.selected_departure));
    const departureRate = Number(metadata.selected_departure?.price);
    if (Number.isFinite(departureRate) && departureRate > 0) {
      const unit = cleanValue(metadata.selected_departure?.pricingUnit || metadata.selected_departure?.pricing_unit).replace(/^PER_/, "").toLowerCase();
      add("Selected Departure Rate", `${money(departureRate)}${unit ? ` / ${unit}` : ""}`);
    }
    add("Desired Tour Start", metadata.travel_start_date || booking.booking_date, safeDate);
    add("Return / End Date", metadata.return_date || metadata.travel_end_date, safeDate);
    add("Pax", metadata.guest_count || metadata.applicant_count);
    add("Preferred Hotel Category", metadata.preferred_hotel_category);
    add("Room Type", metadata.room_type);
    add("Origin", metadata.origin);
    add("Destination", metadata.destination);
    add("Pickup Location", metadata.pickup_location);
    add("Requested Inclusions", metadata.requested_inclusions);
    add("Notes", notes);
  } else if (templateKey === "STAYCATION_ACCOMMODATION") {
    add("Unit", booking.service);
    add("Check-in", metadata.check_in || booking.booking_date, safeDate);
    add("Check-out", metadata.check_out, safeDate);
    add("Number of Guests", metadata.guest_count);
    add("Nights", metadata.number_of_nights);
    add("Notes", notes);
  } else if (["BEAUTY", "CLINIC", "OPTICAL_CLINIC", "HEALTH_WELLNESS"].includes(templateKey)) {
    add("Service / Treatment", booking.service);
    add("Appointment Date", booking.booking_date, safeDate);
    add("Appointment Time", booking.slot);
    add("Notes", notes);
  } else if (["HOME_SERVICE", "AIRCON_SERVICES", "PEST_CONTROL"].includes(templateKey)) {
    add("Service", booking.service);
    add("Service Date", booking.booking_date, safeDate);
    add("Time", booking.slot);
    add("Service Address", metadata.service_location || metadata.customer_address || booking.address);
    const details = metadata.aircon_details;
    if (details && typeof details === "object") {
      const labels = {
        service_category: "Category", installation_option: "Installation", unit_type: "Unit Type",
        capacity: "HP / Capacity", number_of_units: "Number of Units", brand_model: "Brand / Model",
        issue_concern: "Problem / Concern", service_area: "Service Area", landmark: "Landmark",
      };
      Object.entries(labels).forEach(([key, label]) => add(label, details[key]));
    }
    add("Notes", notes);
  } else if (templateKey === "REAL_ESTATE") {
    add("Property Type", metadata.property_type || booking.service);
    add("Preferred Location", metadata.preferred_location);
    add("Budget Range", metadata.budget_range);
    add("Purpose", metadata.property_purpose);
    add("Requirements", notes);
  } else {
    add("Class / Service", booking.service);
    add("Date", booking.booking_date, safeDate);
    add("Time", booking.slot);
    add("Session / Package", metadata.session_number || metadata.session || metadata.package_name);
    add("Event Type", metadata.event_type);
    add("Event Date", metadata.event_date, safeDate);
    add("Event Time", metadata.preferred_event_time);
    add("Event Location", metadata.event_location);
    add("Estimated Guests", metadata.estimated_guest_count);
    add("Notes", notes);
  }

  if (templateKey !== "TOURS_TRAVEL" && metadata.guest_count && !rows.some(([label]) => label.includes("Guest") || label === "Pax")) {
    add("Guests", metadata.guest_count);
  }
  if (quoteOnly && !rows.some(([label]) => label === "Pricing")) add("Pricing", "To Be Confirmed");
  return rows;
}

function wrapLine(text, maxChars) {
  const result = [];
  for (const sourceLine of String(text).split(/\r?\n/)) {
    const words = sourceLine.split(/\s+/).filter(Boolean);
    if (!words.length) {
      result.push("");
      continue;
    }
    let line = "";
    for (const word of words) {
      if (word.length > maxChars) {
        if (line) result.push(line);
        line = "";
        for (let index = 0; index < word.length; index += maxChars) result.push(word.slice(index, index + maxChars));
      } else if (!line) line = word;
      else if (`${line} ${word}`.length <= maxChars) line += ` ${word}`;
      else {
        result.push(line);
        line = word;
      }
    }
    if (line) result.push(line);
  }
  return result;
}

function imageToJpeg(logoUrl) {
  if (!logoUrl || typeof document === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const scale = Math.min(1, 360 / image.naturalWidth, 220 / image.naturalHeight);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext("2d");
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL("image/jpeg", 0.86).split(",")[1];
        const binary = atob(base64);
        const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
        resolve({ bytes, width: canvas.width, height: canvas.height });
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => resolve(null);
    image.src = logoUrl;
  });
}

function joinBytes(parts) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const result = new Uint8Array(size);
  let offset = 0;
  parts.forEach((part) => {
    result.set(part, offset);
    offset += part.length;
  });
  return result;
}

function createPdfBytes(pageContents, accent, logo) {
  const objects = [];
  const addObject = (value) => {
    objects.push(value);
    return objects.length;
  };
  const catalogId = addObject("");
  const pagesId = addObject("");
  const regularFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const boldFontId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
  const logoId = logo ? addObject({ image: logo }) : null;
  const pageIds = [];

  pageContents.forEach((content, index) => {
    const contentBytes = encoder.encode(content.join("\n"));
    const contentId = addObject(joinBytes([
      encoder.encode(`<< /Length ${contentBytes.length} >>\nstream\n`),
      contentBytes,
      encoder.encode("\nendstream"),
    ]));
    const resources = `/Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >>${logoId && index === 0 ? ` /XObject << /Im1 ${logoId} 0 R >>` : ""}`;
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << ${resources} >> /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  const chunks = [encoder.encode("%PDF-1.4\n%Slotwise\n")];
  const offsets = [0];
  let byteOffset = chunks[0].length;
  objects.forEach((object, index) => {
    offsets.push(byteOffset);
    const header = encoder.encode(`${index + 1} 0 obj\n`);
    let body;
    if (object && typeof object === "object" && object.image) {
      const { bytes, width, height } = object.image;
      body = joinBytes([
        encoder.encode(`<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${bytes.length} >>\nstream\n`),
        bytes,
        encoder.encode("\nendstream"),
      ]);
    } else if (object instanceof Uint8Array) body = object;
    else body = encoder.encode(String(object));
    const footer = encoder.encode("\nendobj\n");
    chunks.push(header, body, footer);
    byteOffset += header.length + body.length + footer.length;
  });
  const xrefOffset = byteOffset;
  const xref = [`xref\n0 ${objects.length + 1}\n`, "0000000000 65535 f \n"];
  offsets.slice(1).forEach((offset) => xref.push(`${String(offset).padStart(10, "0")} 00000 n \n`));
  xref.push(`trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  chunks.push(encoder.encode(xref.join("")));
  return joinBytes(chunks);
}

export async function createBookingPdf({
  business = {},
  booking = {},
  template = "GENERAL",
  bookingItems = [],
  total = null,
  pricingStatus = "",
  statusLabel = "Pending",
  payment = null,
  documentType = "booking",
  context = "dashboard",
}) {
  const metadata = booking.metadata || {};
  const quoteOnly = pricingIsQuoteOnly({ ...metadata, pricing_status: pricingStatus || metadata.pricing_status }, total);
  const accent = hexToRgb(business.primaryColor || business.accentColor);
  const pages = [];
  let commands;
  let y;

  const text = (x, top, value, size = 9, bold = false, color = [0.13, 0.16, 0.2]) => {
    const safe = cleanValue(value);
    if (!safe) return;
    const baseline = PAGE_HEIGHT - top - size;
    commands.push(`${color.map((part) => part.toFixed(3)).join(" ")} rg BT /${bold ? "F2" : "F1"} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${baseline.toFixed(2)} Tm <${winAnsiHex(safe)}> Tj ET`);
  };
  const line = (x1, top, x2, color = [0.86, 0.88, 0.91]) => {
    const py = PAGE_HEIGHT - top;
    commands.push(`${color.map((part) => part.toFixed(3)).join(" ")} RG 0.8 w ${x1.toFixed(2)} ${py.toFixed(2)} m ${x2.toFixed(2)} ${py.toFixed(2)} l S`);
  };
  const startPage = (continuation = false) => {
    commands = [];
    pages.push(commands);
    if (continuation) {
      text(PAGE_LEFT, 34, `${business.business || "Business"}  |  ${booking.id || "Booking record"}`, 8, true, [0.38, 0.42, 0.47]);
      line(PAGE_LEFT, 54, PAGE_RIGHT);
      y = 70;
    } else y = 0;
  };
  const ensureSpace = (height) => {
    if (y + height > FOOTER_LIMIT) startPage(true);
  };
  const section = (title) => {
    ensureSpace(34);
    y += 8;
    text(PAGE_LEFT, y, title, 10, true, accent);
    y += 16;
    line(PAGE_LEFT, y, PAGE_RIGHT, [0.88, 0.89, 0.92]);
    y += 9;
  };
  const paragraph = (label, value) => {
    const safe = cleanValue(value);
    if (!safe) return;
    const labelWidth = 114;
    const valueX = PAGE_LEFT + labelWidth;
    const maxChars = Math.max(24, Math.floor((PAGE_RIGHT - valueX) / 4.5));
    const lines = wrapLine(safe, maxChars);
    let index = 0;
    while (index < lines.length) {
      if (y + 14 > FOOTER_LIMIT) startPage(true);
      const firstLine = index === 0;
      text(PAGE_LEFT, y, firstLine ? label : `${label} (cont.)`, 8.5, true, [0.38, 0.42, 0.47]);
      const availableLines = Math.max(1, Math.floor((FOOTER_LIMIT - y - 13) / 13));
      const linesOnPage = Math.min(lines.length - index, availableLines);
      for (let offset = 0; offset < linesOnPage; offset += 1) {
        text(valueX, y + offset * 13, lines[index + offset], 9, false);
      }
      y += linesOnPage * 13 + 3;
      index += linesOnPage;
      if (index < lines.length) startPage(true);
    }
  };

  startPage();
  const logo = await imageToJpeg(business.logo);
  const businessName = cleanValue(business.business || business.name) || "Business";
  text(PAGE_LEFT, 42, businessName, 16, true, [0.09, 0.12, 0.17]);
  let contactY = 63;
  [business.phone, business.primaryEmail, business.website, business.messengerLink].forEach((item) => {
    const value = cleanValue(item);
    if (value) {
      const lines = wrapLine(value, 74);
      lines.forEach((part) => {
        text(PAGE_LEFT, contactY, part, 8, false, [0.36, 0.4, 0.45]);
        contactY += 11;
      });
    }
  });
  if (logo) {
    const width = Math.min(64, 64 * (logo.width / logo.height));
    const height = Math.min(52, 52 * (logo.height / logo.width));
    const x = PAGE_RIGHT - width;
    const top = 34 + (52 - height) / 2;
    commands.push(`q ${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${x.toFixed(2)} ${(PAGE_HEIGHT - top - height).toFixed(2)} cm /Im1 Do Q`);
  }
  const isInquiry = documentType === "inquiry" || String(metadata.request_type || "").toLowerCase().includes("inquiry");
  const isConfirmation = String(booking.status || "").toUpperCase() === "CONFIRMED";
  const title = isInquiry ? "Inquiry Summary" : isConfirmation ? "Booking Confirmation" : "Reservation Details";
  const titleTop = Math.max(102, contactY + 9);
  text(PAGE_LEFT, titleTop, title, 19, true, accent);
  y = titleTop + 31;
  line(PAGE_LEFT, y, PAGE_RIGHT, accent);
  y += 14;

  section("RECORD SUMMARY");
  paragraph("Reference", booking.id);
  paragraph("Status", statusLabel);
  paragraph("Date Created", safeDate(booking.created_at));

  section("CUSTOMER");
  paragraph("Name", booking.customer || booking.customer_name || booking.full_name);
  paragraph("Mobile Number", booking.contact || booking.phone || booking.mobile_number);
  paragraph("Email", metadata.customer_email || metadata.traveler_email || booking.email);
  paragraph("Address", metadata.customer_address || booking.address);

  section("BOOKING DETAILS");
  const templateRows = bookingFieldRows({ booking, template, quoteOnly });
  templateRows.forEach(([label, value]) => paragraph(label, value));

  const normalizedItems = bookingItems.filter((item) => cleanValue(item.serviceName || item.service_name || item.name));
  if (normalizedItems.length) {
    section("SERVICES / PACKAGES");
    normalizedItems.forEach((item) => {
      const name = item.serviceName || item.service_name || item.name;
      const quantity = Number(item.quantity || 1);
      const safeLineTotal = Number(item.lineTotal);
      const priceIsUnavailable = item.lineTotal === null || item.lineTotal === undefined || item.lineTotal === ""
        || ["CUSTOM_INQUIRY", "IMAGE_BASED_PRICING"].includes(String(item.pricingType || item.pricing_type || "").toUpperCase())
        || (quoteOnly && Number.isFinite(safeLineTotal) && safeLineTotal === 0);
      const lineAmount = priceIsUnavailable || !Number.isFinite(safeLineTotal)
        ? (quoteOnly ? "To Be Confirmed" : "Contact for Rate")
        : money(safeLineTotal);
      paragraph("Service / Package", name);
      if (quantity > 1) paragraph("Quantity", quantity);
      paragraph("Amount", lineAmount);
    });
  }

  section("PRICING");
  const totalNumber = Number(total);
  const hasValidTotal = total !== null && total !== undefined && total !== "" && Number.isFinite(totalNumber) && !quoteOnly;
  paragraph("Estimated Total", hasValidTotal ? money(totalNumber) : (String(template || "").toUpperCase() === "TOURS_TRAVEL" ? "Contact for Rate" : "To Be Confirmed"));
  paragraph("Pricing Basis", metadata.pricing_basis || metadata.pricing_note || metadata.pest_pricing_formula);

  const paymentRows = payment ? [
    ["Payment Option", cleanValue(payment.payment_option).replaceAll("_", " ")],
    ["Payment Status", cleanValue(payment.payment_status).replaceAll("_", " ")],
    ["Payment Method", cleanValue(payment.payment_method)],
    ["Amount Submitted", payment.amount_submitted !== null && payment.amount_submitted !== undefined ? money(payment.amount_submitted) : ""],
    ["Payment Reference", cleanValue(payment.reference_number)],
    ["Payment Proof", payment.proof_submitted || payment.proof_storage_path ? "Submitted" : ""],
  ].filter(([, value]) => value) : [];
  if (paymentRows.length) {
    const disclaimerLines = wrapLine("Payment information shown on this document does not constitute automatic verification of payment. The business must confirm payment manually.", 95).length;
    const paymentBlockHeight = 34 + paymentRows.length * 16 + disclaimerLines * 11 + 8;
    if (y + paymentBlockHeight > FOOTER_LIMIT) startPage(true);
    section("PAYMENT INFORMATION");
    paymentRows.forEach(([label, value]) => paragraph(label, value));
    ensureSpace(36);
    y += 4;
    wrapLine("This booking document is not an official payment receipt. Payment information shown here does not constitute automatic verification; the business must confirm payment manually.", 95)
      .forEach((part) => {
        ensureSpace(12);
        text(PAGE_LEFT, y, part, 8, false, [0.43, 0.46, 0.5]);
        y += 11;
      });
  }

  pages.forEach((page, index) => {
    text(PAGE_LEFT, PAGE_HEIGHT - 43, "Powered by Slotwise", 8, false, [0.46, 0.49, 0.53]);
    text(PAGE_RIGHT - 55, PAGE_HEIGHT - 43, `Page ${index + 1} of ${pages.length}`, 8, false, [0.46, 0.49, 0.53]);
    line(PAGE_LEFT, PAGE_HEIGHT - 55, PAGE_RIGHT, [0.88, 0.89, 0.92]);
  });

  const bytes = createPdfBytes(pages, accent, logo);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const reference = escapePdfName(booking.id || (isInquiry ? "Inquiry" : "Reservation"));
  const customer = escapePdfName(booking.customer || booking.customer_name || "Customer");
  const prefix = isInquiry ? "Inquiry" : isConfirmation ? "Booking" : "Reservation";
  const filename = `${prefix}-${reference}-${customer}.pdf`;
  return { filename, blob, pages: pages.length };
}

export async function downloadBookingPdf(options) {
  if (typeof document === "undefined" || typeof URL === "undefined") throw new Error("PDF download is only available in the dashboard browser.");
  const result = await createBookingPdf(options);
  const { blob, filename } = result;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
  return result;
}
