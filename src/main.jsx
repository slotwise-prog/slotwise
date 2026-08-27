import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BarChart3,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  ExternalLink,
  LayoutDashboard,
  MessageSquare,
  QrCode,
  Sparkles,
  Users,
  User,
  Phone,
  FileText,
  Scissors,
  Stethoscope,
  Plane,
  ArrowLeft,
  Paintbrush,
  Palette,
  WandSparkles,
  Droplets,
  ShowerHead,
  Heart,
  ClipboardCheck,
  ClipboardPlus,
  Cross,
  CalendarCheck,
  Snowflake,
  Wrench,
  Settings,
  Zap,
  Search,
  Car,
  Bike,
  Camera,
  GraduationCap,
  BriefcaseBusiness,
  House,
  Monitor,
  Truck,
  CircleDot,
  ShieldCheck,
  Map as MapIcon,
  MapPinned,
  Ship,
  Van,
  CarFront,
  PlaneLanding,
  MapPin,
  Waves,
  Mountain,
  Utensils,
} from "lucide-react";
import "./styles.css";

const services = [
  { name: "Salon appointment", length: "60 min", price: "PHP 350", fields: ["Preferred stylist", "Hair length"] },
  { name: "Dental consultation", length: "30 min", price: "PHP 500", fields: ["Tooth pain?", "Preferred dentist"] },
  { name: "Travel package consult", length: "45 min", price: "Free", fields: ["Destination", "Travelers"] },
];

const slots = ["9:30 AM", "10:15 AM", "1:00 PM", "3:30 PM"];

const defaultFeatureFlags = {
  bookingEnabled: true,
  inquiryEnabled: true,
  showPrices: true,
  requireDate: true,
  requireTime: true,
  requireAddress: false,
  clientAdminEnabled: false,
  customerListEnabled: false,
  analyticsEnabled: false,
  staffSelectionEnabled: false,
};

const defaultAvailability = {
  days: "Monday to Saturday",
  hours: "9:00 AM to 6:00 PM",
  slots,
};

const packageOptions = [
  { value: "STARTER", label: "Starter", price: "PHP 499 lifetime" },
  { value: "BUSINESS", label: "Business", price: "PHP 799 lifetime" },
  { value: "PRO", label: "Pro", price: "PHP 1,499 lifetime" },
];

const bookingTemplateOptions = [
  { value: "GENERAL", label: "General" },
  { value: "BEAUTY", label: "Beauty / Salon" },
  { value: "CLINIC", label: "Clinic / Dental" },
  { value: "HOME_SERVICE", label: "Home Service" },
  { value: "AUTO", label: "Auto / Car Wash" },
  { value: "TOURS_TRAVEL", label: "Tours & Travel" },
];

const packageCapabilityMap = {
  STARTER: {
    services: false,
    schedule: false,
    customers: false,
    basicStats: false,
    blockedDates: false,
    reservationCalendar: false,
    paymentVerification: false,
    customerHistory: false,
    enhancedStats: false,
  },
  BUSINESS: {
    services: true,
    schedule: true,
    customers: true,
    basicStats: true,
    blockedDates: false,
    reservationCalendar: false,
    paymentVerification: false,
    customerHistory: false,
    enhancedStats: false,
  },
  PRO: {
    services: true,
    schedule: true,
    customers: true,
    basicStats: true,
    blockedDates: true,
    reservationCalendar: true,
    paymentVerification: true,
    customerHistory: true,
    enhancedStats: true,
  },
};

function getTodayDateValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatBookingDate(dateValue) {
  if (!dateValue) return "Choose a date";
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatBookingWeekday(dateValue) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function getMonthKey(date) {
  return date.toISOString().slice(0, 7);
}

function getDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function getInitialsName(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name || "Customer";
  return `${parts[0]} ${parts[1].charAt(0)}.`;
}

function buildMonthDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      date,
      key: getDateKey(date),
      inMonth: date.getMonth() === month,
      day: date.getDate(),
    };
  });
}

function hasKeyword(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function resolveServiceIcon(serviceName = "", business = {}) {
  const serviceText = serviceName.toLowerCase();
  const businessText = `${business.business || ""} ${business.name || ""} ${business.industry || ""} ${business.businessType || ""} ${business.description || ""}`.toLowerCase();
  const isToursTravel = normalizeBookingTemplate(business.bookingTemplate) === "TOURS_TRAVEL"
    || hasKeyword(businessText, ["tour", "travel", "island", "vacation", "trip", "airport", "transfer", "van rental"]);
  const isBeauty = hasKeyword(businessText, ["salon", "beauty", "hair", "nail", "spa", "facial", "wellness"]);
  const isClinic = hasKeyword(businessText, ["clinic", "dental", "dentist", "medical", "care"]);
  const isHomeService = hasKeyword(businessText, ["aircon", "air con", "hvac", "home", "cleaning", "repair", "maintenance", "plumbing", "electrical", "appliance"]);
  const isAuto = hasKeyword(businessText, ["car", "auto", "wash", "detailing", "motorcycle", "vehicle"]);

  if (hasKeyword(serviceText, ["city tour"])) return MapPinned;
  if (hasKeyword(serviceText, ["island hopping", "island", "boat", "ferry"])) return Ship;
  if (hasKeyword(serviceText, ["van rental", "van service", "private van"])) return Van;
  if (hasKeyword(serviceText, ["car rental", "rent a car"])) return CarFront;
  if (hasKeyword(serviceText, ["airport transfer", "airport pickup", "airport pick up", "pickup", "pick up"])) return PlaneLanding;
  if (hasKeyword(serviceText, ["hotel transfer", "hotel pickup", "hotel pick up"])) return MapPin;
  if (hasKeyword(serviceText, ["whale shark", "diving", "snorkeling", "beach"])) return Waves;
  if (hasKeyword(serviceText, ["adventure", "hiking", "trek", "mountain"])) return Mountain;
  if (hasKeyword(serviceText, ["photography", "photo"])) return Camera;
  if (hasKeyword(serviceText, ["food tour", "food crawl", "culinary"])) return Utensils;
  if (hasKeyword(serviceText, ["tour", "travel", "package", "trip"])) return MapIcon;

  if (hasKeyword(serviceText, ["haircut", "hair cut", "trim"])) return Scissors;
  if (hasKeyword(serviceText, ["hair color", "hair dye", "color", "dye"])) return isBeauty ? Palette : Paintbrush;
  if (hasKeyword(serviceText, ["styling", "style"])) return WandSparkles;
  if (hasKeyword(serviceText, ["shampoo", "wash"])) return isAuto ? Droplets : ShowerHead;
  if (hasKeyword(serviceText, ["nail", "manicure", "pedicure", "facial", "treatment"])) return isClinic ? Cross : Sparkles;
  if (hasKeyword(serviceText, ["spa", "massage"])) return Heart;

  if (hasKeyword(serviceText, ["checkup", "check up"])) return ClipboardCheck;
  if (hasKeyword(serviceText, ["consultation", "consult"])) return isClinic ? Stethoscope : MessageSquare;
  if (hasKeyword(serviceText, ["appointment"])) return CalendarCheck;
  if (hasKeyword(serviceText, ["extraction", "tooth"])) return isClinic ? ClipboardPlus : Stethoscope;

  if (hasKeyword(serviceText, ["aircon", "air con", "hvac"])) return Snowflake;
  if (hasKeyword(serviceText, ["repair", "installation", "install", "maintenance", "appliance"])) return hasKeyword(serviceText, ["repair", "maintenance", "appliance"]) ? Settings : Wrench;
  if (hasKeyword(serviceText, ["electrical", "electric"])) return Zap;
  if (hasKeyword(serviceText, ["plumbing", "leak", "pipe"])) return Droplets;
  if (hasKeyword(serviceText, ["inspection", "inspect"])) return Search;

  if (hasKeyword(serviceText, ["car wash", "vehicle wash"])) return Car;
  if (hasKeyword(serviceText, ["exterior wash", "interior cleaning"])) return hasKeyword(serviceText, ["exterior"]) ? Droplets : Sparkles;
  if (hasKeyword(serviceText, ["detailing", "detail"])) return Sparkles;
  if (hasKeyword(serviceText, ["wax"])) return ShieldCheck;
  if (hasKeyword(serviceText, ["motorcycle", "bike"])) return Bike;

  if (hasKeyword(serviceText, ["tutor", "lesson", "class"])) return GraduationCap;
  if (hasKeyword(serviceText, ["business"])) return BriefcaseBusiness;
  if (hasKeyword(serviceText, ["home visit"])) return House;
  if (hasKeyword(serviceText, ["online"])) return Monitor;
  if (hasKeyword(serviceText, ["delivery"])) return Truck;

  if (hasKeyword(serviceText, ["cleaning"])) {
    if (isHomeService) return Sparkles;
    if (isClinic) return Sparkles;
    if (isAuto) return Droplets;
  }

  if (hasKeyword(serviceText, ["repair"])) return Wrench;
  if (hasKeyword(serviceText, ["consultation", "consult"])) return MessageSquare;
  return isToursTravel ? MapPinned : CircleDot;
}

function resolveBusinessTone(business = {}) {
  const businessText = `${business.business || ""} ${business.name || ""} ${business.industry || ""} ${business.businessType || ""} ${business.description || ""}`.toLowerCase();
  const template = normalizeBookingTemplate(business.bookingTemplate);
  if (template === "TOURS_TRAVEL") return "tours-travel";
  if (template === "HOME_SERVICE") return "home-service";
  if (template === "AUTO") return "auto";
  if (template === "CLINIC") return "clinic";
  if (template === "BEAUTY") return "beauty";
  if (hasKeyword(businessText, ["clinic", "dental", "dentist", "medical", "care"])) return "clinic";
  if (hasKeyword(businessText, ["travel", "stay", "hotel", "tour", "cabin"])) return "travel";
  if (hasKeyword(businessText, ["aircon", "air con", "hvac", "home", "repair", "maintenance", "plumbing", "electrical", "appliance"])) return "home-service";
  if (hasKeyword(businessText, ["car", "auto", "wash", "detailing", "motorcycle", "vehicle"])) return "auto";
  if (hasKeyword(businessText, ["salon", "beauty", "hair", "nail", "spa", "facial", "wellness"])) return "beauty";
  return "general";
}

function getToneThemeDefaults(tone) {
  if (tone === "tours-travel") return { primaryColor: "#0f766e", accentColor: "#e6f7f1" };
  if (tone === "home-service") return { primaryColor: "#155e75", accentColor: "#eaf7fb" };
  if (tone === "auto") return { primaryColor: "#1f2937", accentColor: "#eef2f7" };
  if (tone === "clinic") return { primaryColor: "#148d84", accentColor: "#dff7f3" };
  if (tone === "travel") return { primaryColor: "#b16f16", accentColor: "#fff1d3" };
  if (tone === "general") return { primaryColor: "#38516f", accentColor: "#f2f6fb" };
  return { primaryColor: "#bd5d6d", accentColor: "#f6dfe3" };
}

function isBeautyFallbackCover(cover = "") {
  return cover.includes("1560066984-138dadb4c035");
}

function isBeautyDefaultColor(value = "") {
  return ["#bd5d6d", "#f6dfe3"].includes((value || "").toLowerCase());
}

function getBusinessCoverStyle(business = {}, tone = "beauty") {
  const cover = business.cover || "";
  if (cover && !(tone === "home-service" && isBeautyFallbackCover(cover))) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(22, 37, 48, 0.2), rgba(22, 37, 48, 0.78)), url(${cover})`,
    };
  }
  if (tone === "home-service") {
    return {
      backgroundImage: "linear-gradient(145deg, #0f3f4f 0%, #155e75 48%, #2563eb 100%)",
    };
  }
  if (tone === "auto") {
    return {
      backgroundImage: "linear-gradient(145deg, #111827 0%, #1f2937 52%, #ea580c 100%)",
    };
  }
  if (tone === "general") {
    return {
      backgroundImage: "linear-gradient(145deg, #243b53 0%, #38516f 54%, #2f80ed 100%)",
    };
  }
  if (tone === "tours-travel") {
    return {
      backgroundImage: "linear-gradient(145deg, #083344 0%, #0f766e 50%, #f59e0b 100%)",
    };
  }
  return {
    backgroundImage: `linear-gradient(180deg, rgba(54, 35, 30, 0.2), rgba(54, 35, 30, 0.76)), url(${cover})`,
  };
}

function dedupeServices(serviceDetails = [], serviceNames = []) {
  const byName = new Map();
  serviceDetails.forEach((service, index) => {
    const name = (service.name || "").trim();
    if (!name) return;
    const key = name.toLowerCase();
    if (!byName.has(key)) {
      byName.set(key, {
        ...service,
        name,
        displayOrder: service.displayOrder ?? index,
      });
    }
  });
  serviceNames.forEach((name, index) => {
    const cleanName = (name || "").trim();
    if (!cleanName) return;
    const key = cleanName.toLowerCase();
    if (!byName.has(key)) {
      byName.set(key, { name: cleanName, description: "", price: null, durationMinutes: null, displayOrder: serviceDetails.length + index, status: "Active" });
    }
  });
  const details = [...byName.values()].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  return {
    serviceDetails: details,
    services: details.map((service) => service.name),
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const databaseMode = supabaseUrl && supabaseAnonKey ? "Online database" : "Local demo storage";
const clientStatuses = ["DEMO", "UNPAID", "ACTIVE", "SUSPENDED"];

function normalizePackage(value) {
  const nextPackage = (value || "STARTER").toUpperCase();
  return packageCapabilityMap[nextPackage] ? nextPackage : "STARTER";
}

function normalizeBookingTemplate(value) {
  const nextTemplate = (value || "GENERAL").toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return bookingTemplateOptions.some((item) => item.value === nextTemplate) ? nextTemplate : "GENERAL";
}

function normalizePricingUnit(value, fallback = "FLAT") {
  const nextUnit = (value || fallback || "FLAT").toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return ["FLAT", "PER_PAX", "PER_PERSON", "PER_GROUP", "PER_TRIP", "PER_DAY", "FIXED"].includes(nextUnit) ? nextUnit : "FLAT";
}

function normalizePricingType(value, fallback = "FIXED") {
  const nextType = (value || fallback || "FIXED").toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return ["PER_PAX", "GROUP_TIER", "PER_TRIP", "PER_DAY", "FIXED"].includes(nextType) ? nextType : "FIXED";
}

function normalizePricingTiers(value) {
  const tiers = Array.isArray(value) ? value : [];
  return tiers
    .map((tier) => ({
      minGuests: Number(tier.minGuests ?? tier.min_guests),
      maxGuests: Number(tier.maxGuests ?? tier.max_guests),
      price: Number(tier.price),
    }))
    .filter((tier) => tier.minGuests > 0 && tier.maxGuests >= tier.minGuests && tier.price >= 0)
    .sort((a, b) => a.minGuests - b.minGuests);
}

function validatePricingTiers(tiers) {
  const normalized = normalizePricingTiers(tiers);
  for (let index = 1; index < normalized.length; index += 1) {
    if (normalized[index].minGuests <= normalized[index - 1].maxGuests) {
      return { ok: false, message: "Pricing tiers cannot overlap." };
    }
  }
  return { ok: true, tiers: normalized };
}

function getPricingForGuests(serviceDetail, guestCount) {
  const pricingType = normalizePricingType(serviceDetail.pricingType, serviceDetail.pricingUnit);
  const price = serviceDetail.price === null || serviceDetail.price === undefined ? null : Number(serviceDetail.price);
  if (pricingType === "GROUP_TIER") {
    const selectedTier = normalizePricingTiers(serviceDetail.pricingTiers).find((tier) => (
      guestCount >= tier.minGuests && guestCount <= tier.maxGuests
    ));
    return selectedTier
      ? { pricingType, unitPrice: selectedTier.price, selectedTier, estimatedTotal: selectedTier.price, totalAvailable: true }
      : { pricingType, unitPrice: null, selectedTier: null, estimatedTotal: null, totalAvailable: false };
  }
  if (pricingType === "PER_PAX") {
    return { pricingType, unitPrice: price, selectedTier: null, estimatedTotal: price === null ? null : price * guestCount, totalAvailable: price !== null };
  }
  if (pricingType === "PER_DAY") {
    return { pricingType, unitPrice: price, selectedTier: null, estimatedTotal: null, totalAvailable: false };
  }
  return { pricingType, unitPrice: price, selectedTier: null, estimatedTotal: price, totalAvailable: price !== null };
}

function normalizePaymentRequirement(value) {
  const next = (value || "NO_PAYMENT_REQUIRED").toUpperCase();
  return ["NO_PAYMENT_REQUIRED", "DEPOSIT_REQUIRED", "FULL_PAYMENT_REQUIRED"].includes(next) ? next : "NO_PAYMENT_REQUIRED";
}

function getRequiredPaymentAmount(settings = {}, estimatedTotal = null) {
  const requirement = normalizePaymentRequirement(settings.requirement_type);
  if (!settings.enabled || requirement === "NO_PAYMENT_REQUIRED") return null;
  if (requirement === "FULL_PAYMENT_REQUIRED") return estimatedTotal;
  if ((settings.deposit_type || "FIXED_AMOUNT") === "PERCENTAGE" && estimatedTotal !== null) {
    return Math.round(estimatedTotal * (Number(settings.deposit_value || 0) / 100));
  }
  return Number(settings.deposit_value || 0);
}

function maskAccountNumber(value = "") {
  const clean = String(value);
  if (clean.length <= 6) return clean;
  return `${clean.slice(0, 4)}***${clean.slice(-4)}`;
}

function formatPeso(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "Rate on request";
  return `PHP ${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatServicePriceLabel(detail = {}, fallbackPricingType = "FIXED") {
  const pricingType = normalizePricingType(detail.pricingType ?? detail.pricing_type, detail.pricingUnit ?? detail.pricing_unit ?? fallbackPricingType);
  const price = detail.price;
  const base = formatPeso(price);
  const tiers = normalizePricingTiers(detail.pricingTiers ?? detail.pricing_tiers);
  if (pricingType === "GROUP_TIER" && tiers.length) {
    const prices = tiers.map((tier) => tier.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return minPrice === maxPrice ? `${formatPeso(minPrice)} / group` : `${formatPeso(minPrice)} - ${formatPeso(maxPrice)}`;
  }
  if (base === "Rate on request") return base;
  if (pricingType === "PER_PAX") return `${base} / pax`;
  if (pricingType === "PER_TRIP") return `${base} / trip`;
  if (pricingType === "PER_DAY") return `${base} / day`;
  return base;
}

function getPackageCapabilities(value, featureFlags = {}) {
  const packageKey = normalizePackage(value);
  const base = packageCapabilityMap[packageKey];
  return {
    packageKey,
    ...base,
    showPrices: featureFlags.showPrices !== false,
    bookingEnabled: featureFlags.bookingEnabled !== false,
    inquiryEnabled: featureFlags.inquiryEnabled !== false,
  };
}

function getStatusClass(value) {
  return (value || "PENDING").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

async function supabaseRequest(table, options = {}) {
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}${options.query || ""}`, {
    method: options.method || "GET",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${options.accessToken || supabaseAnonKey}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Database request failed for ${table}`);
  }

  if (response.status === 204) return [];
  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : [];
}

async function supabaseAuthRequest(path, body) {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase is not connected.");
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : {};
  if (!response.ok) throw new Error(data.error_description || data.msg || data.error || "Authentication failed.");
  return data;
}

async function supabaseRpcRequest(functionName, body, accessToken = "") {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase is not connected.");
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/${functionName}`, {
    method: "POST",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken || supabaseAnonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const responseText = await response.text();
  const data = responseText ? JSON.parse(responseText) : [];
  if (!response.ok) throw new Error(data.message || data.error_description || "Request failed.");
  return data;
}

function getStoredAdminSession() {
  try {
    return JSON.parse(localStorage.getItem("slotwiseAdminSession") || "null");
  } catch {
    return null;
  }
}

function storeAdminSession(session) {
  localStorage.setItem("slotwiseAdminSession", JSON.stringify(session));
}

function clearAdminSession() {
  localStorage.removeItem("slotwiseAdminSession");
}

function getStoredClientSession() {
  try {
    return JSON.parse(localStorage.getItem("slotwiseClientSession") || "null");
  } catch {
    return null;
  }
}

function storeClientSession(session) {
  localStorage.setItem("slotwiseClientSession", JSON.stringify(session));
}

function clearClientSession() {
  localStorage.removeItem("slotwiseClientSession");
}

function normalizeSetupRequest(row) {
  return {
    id: row.id,
    businessSlug: row.businessSlug || row.business_slug || "",
    businessName: row.businessName || row.business_name || "",
    ownerName: row.ownerName || row.owner_name || "",
    contact: row.contact || "",
    industry: row.industry || "",
    facebookPage: row.facebookPage || row.facebook_page || "",
    services: row.services || "",
    openDays: row.openDays || row.open_days || "",
    openHours: row.openHours || row.open_hours || "",
    staff: row.staff || "",
    rules: row.rules || "",
    questions: row.questions || "",
    status: row.status || "Ready for review",
  };
}

function setupRequestToDatabase(setup) {
  return {
    id: setup.id,
    business_slug: setup.businessSlug,
    business_name: setup.businessName,
    owner_name: setup.ownerName,
    contact: setup.contact,
    industry: setup.industry,
    facebook_page: setup.facebookPage,
    services: setup.services,
    open_days: setup.openDays,
    open_hours: setup.openHours,
    staff: setup.staff,
    rules: setup.rules,
    questions: setup.questions,
    status: setup.status,
  };
}

function normalizeDatabaseBusiness(row, serviceRows = [], availabilityRow = null, paymentSettingsRow = null, paymentMethodRows = []) {
  const bookingTemplate = normalizeBookingTemplate(row.booking_template);
  const tone = resolveBusinessTone({
    business: row.business,
    name: row.industry || row.business_type,
    businessType: row.business_type || row.industry,
    description: row.description,
    bookingTemplate,
  });
  const themeDefaults = getToneThemeDefaults(tone);
  const activeServices = filterLegacyToursSeedRows(serviceRows, bookingTemplate)
    .filter((service) => service.status !== "Inactive")
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  const normalizedServices = dedupeServices(
    activeServices.map((service) => ({
      id: service.id,
      name: service.name,
      durationMinutes: service.duration_minutes,
      price: service.price,
      pricingUnit: normalizePricingUnit(service.pricing_unit),
      pricingType: normalizePricingType(service.pricing_type, service.pricing_unit),
      pricingTiers: normalizePricingTiers(service.pricing_tiers),
      description: service.description || "",
      displayOrder: service.display_order || 0,
      status: service.status,
    })),
    activeServices.map((service) => service.name),
  );
  return {
    source: "database",
    slug: row.slug,
    name: row.industry || row.business_type || "Service business",
    business: row.business,
    link: row.booking_link || `slotwise.app/book/${row.slug}`,
    logo: row.logo_url || "",
    primaryColor: tone === "home-service" && isBeautyDefaultColor(row.primary_color) ? themeDefaults.primaryColor : row.primary_color || themeDefaults.primaryColor,
    accentColor: tone === "home-service" && isBeautyDefaultColor(row.accent_color) ? themeDefaults.accentColor : row.accent_color || themeDefaults.accentColor,
    phone: row.phone || "",
    messengerLink: row.messenger_link || "",
    address: row.address || "",
    description: row.description || "",
    businessType: row.business_type || row.industry || "Service business",
    bookingMode: row.booking_mode || "booking",
    bookingTemplate,
    status: (row.status || "ACTIVE").toUpperCase(),
    package: normalizePackage(row.business_package),
    featureFlags: row.feature_flags || {},
    availability: {
      days: availabilityRow?.open_days || defaultAvailability.days,
      hours: availabilityRow?.open_hours || defaultAvailability.hours,
      slots: Array.isArray(availabilityRow?.slots) ? availabilityRow.slots : slots,
      blockedDates: availabilityRow?.blocked_dates || [],
    },
    cover: row.cover_url || "",
    serviceDetails: normalizedServices.serviceDetails,
    services: normalizedServices.services,
    forms: tone === "home-service" ? ["Service concern"] : ["Notes before the appointment"],
    paymentSettings: paymentSettingsRow || { enabled: false, requirement_type: "NO_PAYMENT_REQUIRED", deposit_type: "FIXED_AMOUNT", deposit_value: 0 },
    paymentMethods: paymentMethodRows || [],
  };
}

function makeSlug(value) {
  return (value || "client-business")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48) || "client-business";
}

function parseSetupServices(value) {
  const parsed = (value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => item.split(" - ")[0].trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : ["Consultation", "Appointment", "Follow-up"];
}

function buildBusinessFromSetup(setup) {
  if (!setup) return null;
  const slug = makeSlug(setup.businessSlug || setup.slug || setup.businessName);
  const lowerIndustry = (setup.industry || "").toLowerCase();
  const isHomeService = ["aircon", "air con", "hvac", "home", "repair", "maintenance", "plumbing", "electrical", "appliance"].some((keyword) => lowerIndustry.includes(keyword));
  const bookingTemplate = normalizeBookingTemplate(setup.bookingTemplate || inferBookingTemplateFromIndustry(setup.industry));
  const cover = lowerIndustry.includes("clinic") || lowerIndustry.includes("dental")
    ? "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
    : lowerIndustry.includes("travel") || lowerIndustry.includes("stay")
      ? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
      : isHomeService
        ? ""
        : "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80";
  const themeDefaults = getToneThemeDefaults(isHomeService ? "home-service" : lowerIndustry.includes("clinic") || lowerIndustry.includes("dental") ? "clinic" : lowerIndustry.includes("travel") || lowerIndustry.includes("stay") ? "travel" : "beauty");
  const setupStructuredServices = getSavableStructuredServices(setup.serviceEntries, bookingTemplate);
  const parsedServices = setupStructuredServices.length
    ? dedupeServices(setupStructuredServices, setupStructuredServices.map((service) => service.name))
    : setup.services?.trim()
      ? dedupeServices(parseServiceDetails(setup.services), parseSetupServices(setup.services))
      : dedupeServices([], []);

  return {
    source: "setup",
    slug,
    name: setup.industry || "Service business",
    business: setup.businessName || "Client Business",
    link: `slotwise.app/book/${slug}`,
    logo: "",
    primaryColor: themeDefaults.primaryColor,
    accentColor: themeDefaults.accentColor,
    phone: setup.contact || "",
    messengerLink: setup.facebookPage || "",
    address: "",
    description: setup.rules || (isHomeService ? "Professional service for homes and businesses." : "Book online in less than a minute. Choose a service, pick a time, and get confirmation."),
    businessType: setup.industry || "Service business",
    bookingMode: "booking",
    bookingTemplate,
    status: (setup.status || "DEMO").toUpperCase(),
    package: normalizePackage(setup.package),
    featureFlags: { ...defaultFeatureFlags },
    availability: {
      days: setup.openDays || defaultAvailability.days,
      hours: setup.openHours || defaultAvailability.hours,
      slots,
    },
    cover,
    serviceDetails: parsedServices.serviceDetails,
    services: parsedServices.services,
    forms: (setup.questions || (isHomeService ? "Service concern" : "Notes before the appointment"))
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3),
  };
}

function normalizeBusinessConfig(business) {
  const tone = resolveBusinessTone(business);
  const themeDefaults = getToneThemeDefaults(tone);
  const normalizedServices = dedupeServices(business.serviceDetails || [], business.services || []);
  return {
    ...business,
    logo: business.logo || "",
    primaryColor: tone === "home-service" && isBeautyDefaultColor(business.primaryColor) ? themeDefaults.primaryColor : business.primaryColor || themeDefaults.primaryColor,
    accentColor: tone === "home-service" && isBeautyDefaultColor(business.accentColor) ? themeDefaults.accentColor : business.accentColor || themeDefaults.accentColor,
    phone: business.phone || "",
    messengerLink: business.messengerLink || "",
    address: business.address || "",
    description: business.description || (tone === "home-service"
      ? "Professional service for homes and businesses."
      : "Book online in less than a minute. Choose a service, pick a time, and get confirmation without creating an account."),
    businessType: business.businessType || business.name || "Service business",
    bookingMode: business.bookingMode || "booking",
    bookingTemplate: normalizeBookingTemplate(business.bookingTemplate),
    status: (business.status || "ACTIVE").toUpperCase(),
    package: normalizePackage(business.package),
    featureFlags: { ...defaultFeatureFlags, ...(business.featureFlags || {}) },
    availability: { ...defaultAvailability, ...(business.availability || {}) },
    services: normalizedServices.services,
    serviceDetails: normalizedServices.serviceDetails,
    forms: business.forms?.length ? business.forms : [tone === "home-service" ? "Service concern" : "Notes before the appointment"],
    paymentSettings: business.paymentSettings || { enabled: false, requirement_type: "NO_PAYMENT_REQUIRED", deposit_type: "FIXED_AMOUNT", deposit_value: 0 },
    paymentMethods: business.paymentMethods || [],
  };
}

function parseServiceDetails(value) {
  const parsed = (value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item, index) => {
      const parts = item.split(" - ").map((part) => part.trim()).filter(Boolean);
      const [name, ...details] = parts;
      const service = {
        name: name || `Service ${index + 1}`,
        description: "",
        price: null,
        durationMinutes: null,
        displayOrder: index,
        status: "Active",
        pricingUnit: "FLAT",
        pricingType: "FIXED",
        pricingTiers: [],
      };

      details.forEach((detail) => {
        const priceMatch = detail.match(/(?:php|p)\s*([\d,.]+)/i);
        const durationMatch = detail.match(/(\d+)\s*(?:min|mins|minute|minutes)/i);
        if (priceMatch) service.price = Number(priceMatch[1].replace(/,/g, ""));
        if (durationMatch) service.durationMinutes = Number(durationMatch[1]);
        if (/(per\s*pax|\/\s*pax|per\s*person|\/\s*person)/i.test(detail)) service.pricingUnit = "PER_PAX";
        if (/(per\s*pax|\/\s*pax|per\s*person|\/\s*person)/i.test(detail)) service.pricingType = "PER_PAX";
        if (/(per\s*group|\/\s*group)/i.test(detail)) service.pricingUnit = "PER_GROUP";
        if (/(per\s*trip|\/\s*trip)/i.test(detail)) service.pricingType = "PER_TRIP";
        if (/(per\s*day|\/\s*day)/i.test(detail)) service.pricingType = "PER_DAY";
        if (/(fixed|package price)/i.test(detail)) service.pricingType = "FIXED";
        if (/group\s*tier|tier/i.test(detail)) {
          service.pricingType = "GROUP_TIER";
          service.pricingUnit = "PER_GROUP";
          service.pricingTiers = detail
            .replace(/group\s*tier\s*:/i, "")
            .split(",")
            .map((tierText) => {
              const tierMatch = tierText.match(/(\d+)\s*-\s*(\d+)\s*=\s*(?:php|p)?\s*([\d,.]+)/i);
              return tierMatch ? {
                minGuests: Number(tierMatch[1]),
                maxGuests: Number(tierMatch[2]),
                price: Number(tierMatch[3].replace(/,/g, "")),
              } : null;
            })
            .filter(Boolean);
        }
        if (!priceMatch && !durationMatch) {
          service.description = service.description ? `${service.description}. ${detail}` : detail;
        }
      });

      return service;
    });

  return parsed.length > 0 ? parsed : [
    { name: "Consultation", description: "", price: null, durationMinutes: 30, displayOrder: 0, status: "Active", pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [] },
  ];
}

function emptyStructuredServices(count = 3) {
  return Array.from({ length: count }, (_, index) => ({
    id: "",
    name: "",
    description: "",
    price: "",
    durationMinutes: "",
    displayOrder: index,
    status: "Active",
    pricingType: "FIXED",
    pricingUnit: "FLAT",
    pricingTiers: [],
    expanded: true,
  }));
}

function serviceRowToStructured(service = {}, index = 0) {
  return {
    id: service.id || "",
    name: service.name || "",
    description: service.description || "",
    price: service.price ?? "",
    durationMinutes: service.duration_minutes ?? service.durationMinutes ?? "",
    displayOrder: service.display_order ?? service.displayOrder ?? index,
    status: service.status || "Active",
    pricingType: normalizePricingType(service.pricing_type || service.pricingType, service.pricing_unit || service.pricingUnit),
    pricingUnit: normalizePricingUnit(service.pricing_unit || service.pricingUnit),
    pricingTiers: normalizePricingTiers(service.pricing_tiers || service.pricingTiers),
    expanded: index < 3,
  };
}

function normalizeStructuredServices(value, minimumSlots = 3) {
  const source = Array.isArray(value) && value.length ? value : emptyStructuredServices(minimumSlots);
  const normalized = source.map(serviceRowToStructured);
  while (normalized.length < minimumSlots) normalized.push(...emptyStructuredServices(1));
  return normalized.map((service, index) => ({ ...service, displayOrder: index }));
}

function getSavableStructuredServices(value, bookingTemplate = "GENERAL") {
  const isTravel = normalizeBookingTemplate(bookingTemplate) === "TOURS_TRAVEL";
  return normalizeStructuredServices(value, 0)
    .filter((service) => service.name.trim())
    .map((service, index) => {
      const pricingType = isTravel ? normalizePricingType(service.pricingType, service.pricingUnit) : "FIXED";
      return {
        ...service,
        name: service.name.trim(),
        description: service.description.trim(),
        price: service.price === "" ? null : Number(service.price),
        durationMinutes: service.durationMinutes === "" ? null : Number(service.durationMinutes),
        displayOrder: index,
        status: service.status || "Active",
        pricingType,
        pricingUnit: isTravel ? normalizePricingUnit(service.pricingUnit, pricingType) : "FLAT",
        pricingTiers: isTravel && pricingType === "GROUP_TIER" ? normalizePricingTiers(service.pricingTiers) : [],
      };
    });
}

function structuredServicesToLegacyText(services = [], bookingTemplate = "GENERAL") {
  return getSavableStructuredServices(services, bookingTemplate)
    .map((service) => {
      const pieces = [service.name];
      if (service.price !== null && service.price !== "") pieces.push(`PHP ${service.price}`);
      if (service.durationMinutes) pieces.push(`${service.durationMinutes} minutes`);
      if (service.description) pieces.push(service.description);
      return pieces.join(" - ");
    })
    .join("\n");
}

function parseServicesToStructured(value, bookingTemplate = "GENERAL") {
  return normalizeStructuredServices(parseServiceDetails(value).map(serviceRowToStructured), 3)
    .map((service) => normalizeBookingTemplate(bookingTemplate) === "TOURS_TRAVEL" ? service : {
      ...service,
      pricingType: "FIXED",
      pricingUnit: "FLAT",
      pricingTiers: [],
    });
}

function getServiceManagerCopy(bookingTemplate = "GENERAL") {
  const template = normalizeBookingTemplate(bookingTemplate);
  if (template === "TOURS_TRAVEL") return { title: "Tour Packages", single: "Tour package", add: "Add Another Package" };
  if (template === "CLINIC") return { title: "Services / Treatments", single: "Service / treatment", add: "Add Another Service" };
  if (template === "AUTO") return { title: "Services / Packages", single: "Service / package", add: "Add Another Service" };
  return { title: "Services", single: "Service", add: "Add Another Service" };
}

function isStandalonePaxTierService(service = {}) {
  const name = (service.name || "").trim().toLowerCase();
  return /^\d+\s*[-–]\s*\d+\s*(pax|guests?|persons?|people)?$/.test(name)
    || /^\d+\s*(pax|guests?|persons?|people)$/.test(name);
}

const legacyToursServiceNames = new Set([
  "services + prices",
  "1-2 pax",
  "1–2 pax",
  "3-4 pax",
  "3–4 pax",
  "5-6 pax",
  "5–6 pax",
]);

function isLegacyToursSeedService(service = {}) {
  return legacyToursServiceNames.has((service.name || "").trim().toLowerCase())
    || isStandalonePaxTierService(service);
}

function filterLegacyToursSeedRows(serviceRows = [], bookingTemplate = "GENERAL") {
  if (normalizeBookingTemplate(bookingTemplate) !== "TOURS_TRAVEL") return serviceRows;
  return serviceRows.filter((service) => !isLegacyToursSeedService(service));
}

function inferBookingTemplateFromIndustry(industry = "") {
  const lower = industry.toLowerCase();
  if (/(travel|tour|stay|cabin|resort)/i.test(lower)) return "TOURS_TRAVEL";
  if (/(clinic|dental|doctor|medical)/i.test(lower)) return "CLINIC";
  if (/(home|aircon|repair|cleaning|maintenance|plumbing|electrical)/i.test(lower)) return "HOME_SERVICE";
  if (/(auto|car|wash|detailing)/i.test(lower)) return "AUTO";
  if (/(salon|beauty|hair|lash|nail|makeup)/i.test(lower)) return "BEAUTY";
  return "GENERAL";
}

function setupToBusinessDatabase(setup, slug) {
  const business = buildBusinessFromSetup({ ...setup, businessSlug: slug });
  return {
    slug,
    business: setup.businessName,
    industry: setup.industry,
    booking_link: `/${slug}`,
    cover_url: business.cover,
    logo_url: setup.logo || setup.logoUrl || "",
    primary_color: setup.primaryColor || business.primaryColor,
    accent_color: setup.accentColor || business.accentColor,
    phone: setup.contact || "",
    messenger_link: setup.facebookPage || "",
    address: setup.address || "",
    description: setup.rules || business.description,
    business_type: setup.industry || "Service business",
    booking_mode: setup.bookingMode || "booking",
    booking_template: normalizeBookingTemplate(setup.bookingTemplate),
    business_package: normalizePackage(setup.package),
    feature_flags: { ...defaultFeatureFlags, ...(setup.featureFlags || {}) },
    status: (setup.status || "DEMO").toUpperCase(),
  };
}

function setupToServiceRows(setup, slug, requestId) {
  const sourceServices = getSavableStructuredServices(setup.serviceEntries, setup.bookingTemplate || inferBookingTemplateFromIndustry(setup.industry));
  const servicesToSave = sourceServices.length ? sourceServices : (setup.services?.trim() ? parseServiceDetails(setup.services) : []);
  return servicesToSave.map((service, index) => ({
    id: service.id || `${requestId}-SVC-${index + 1}`,
    business_slug: slug,
    name: service.name,
    duration_minutes: service.durationMinutes,
    price: service.price,
    pricing_unit: normalizePricingUnit(service.pricingUnit),
    pricing_type: normalizePricingType(service.pricingType, service.pricingUnit),
    pricing_tiers: normalizePricingTiers(service.pricingTiers),
    description: service.description,
    display_order: service.displayOrder,
    status: service.status,
  }));
}

function setupToAvailabilityDatabase(setup, slug, requestId) {
  const adminSlots = (setup.slotsText || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return {
    id: `${requestId}-AVAIL`,
    business_slug: slug,
    open_days: setup.openDays || defaultAvailability.days,
    open_hours: setup.openHours || defaultAvailability.hours,
    slots: adminSlots.length ? adminSlots : slots,
    status: "Active",
  };
}

function getPublicSlugFromLocation() {
  const hash = window.location.hash || "";
  if (hash.startsWith("#book/")) return hash.replace("#book/", "").trim();
  if (hash === "#client") return "client";

  const path = window.location.pathname.replace(/^\/+|\/+$/g, "");
  if (!path || path === "index.html") return "";
  if (path === "smm-admin") return "";
  if (path === "client-login" || path === "client-dashboard") return "";
  return path.split("/")[0];
}

const templates = [
  {
    icon: <Scissors />,
    slug: "glowbeauty",
    name: "Salon & Beauty",
    business: "Glow Beauty Studio",
    link: "glowbeauty.slotwise.app",
    logo: "",
    primaryColor: "#bd5d6d",
    accentColor: "#f6dfe3",
    phone: "0912 345 6789",
    messengerLink: "https://m.me/glowbeauty",
    address: "Sample salon address",
    description: "Enhance your glow. Reveal your best self.",
    businessType: "Salon & Beauty",
    bookingMode: "booking",
    bookingTemplate: "BEAUTY",
    featureFlags: { ...defaultFeatureFlags, customerListEnabled: true },
    availability: { ...defaultAvailability },
    cover: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80",
    accent: "beauty",
    tagline: "For salons, lashes, brows, nails, and makeup bookings.",
    highlight: "Best for repeat clients and stylist schedules",
    stat: "18 bookings today",
    services: ["Hair color", "Hair treatment", "Makeup appointment"],
    forms: ["Preferred stylist", "Hair length", "Allergies"],
  },
  {
    icon: <Stethoscope />,
    slug: "drjoseclinic",
    name: "Clinic & Dental",
    business: "Dr. Jose Dental Clinic",
    link: "drjoseclinic.slotwise.app",
    logo: "",
    primaryColor: "#148d84",
    accentColor: "#dff7f3",
    phone: "0917 222 8100",
    messengerLink: "https://m.me/drjoseclinic",
    address: "Sample clinic address",
    description: "Your visit, booked with care. Private details. Clear schedule.",
    businessType: "Clinic & Dental",
    bookingMode: "booking",
    bookingTemplate: "CLINIC",
    featureFlags: { ...defaultFeatureFlags, requireAddress: false, customerListEnabled: true },
    availability: { ...defaultAvailability, hours: "8:00 AM to 5:00 PM" },
    cover: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
    accent: "clinic",
    tagline: "For dentists, clinics, consultations, and patient intake.",
    highlight: "Best for intake questions and appointment reminders",
    stat: "12 patients booked",
    services: ["Dental consult", "Tooth extraction", "Follow-up check"],
    forms: ["Tooth pain?", "Preferred dentist", "Insurance"],
  },
  {
    icon: <Plane />,
    slug: "liamscabin",
    name: "Travel & Staycation",
    business: "Liam's Cabin",
    link: "liamscabin.slotwise.app",
    logo: "",
    primaryColor: "#b16f16",
    accentColor: "#fff1d3",
    phone: "0918 333 2200",
    messengerLink: "https://m.me/liamscabin",
    address: "Cavinti, Laguna",
    description: "Reserve your date. Plan your visit with ease.",
    businessType: "Travel & Staycation",
    bookingMode: "inquiry",
    bookingTemplate: "GENERAL",
    featureFlags: { ...defaultFeatureFlags, requireAddress: false },
    availability: { ...defaultAvailability, days: "Daily" },
    cover: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    accent: "travel",
    tagline: "For stays, tours, travel consults, and document help.",
    highlight: "Best for date requests and guest details",
    stat: "7 inquiries this week",
    services: ["Room booking", "Travel package", "Document assistance"],
    forms: ["Travel date", "Guests", "Payment method"],
  },
  {
    icon: <MapPinned />,
    slug: "kagana-tours-test",
    name: "Tours & Travel",
    business: "Kagana Tours Test",
    link: "kagana-tours-test.slotwise.app",
    logo: "",
    primaryColor: "#0f766e",
    accentColor: "#e6f7f1",
    phone: "0917 555 2026",
    messengerLink: "https://m.me/kaganatours",
    address: "Cebu City",
    description: "Choose your tour package and preferred travel date.",
    businessType: "Tours & Travel",
    bookingMode: "booking",
    bookingTemplate: "TOURS_TRAVEL",
    featureFlags: { ...defaultFeatureFlags, requireAddress: true },
    availability: { ...defaultAvailability, days: "Daily", hours: "7:00 AM to 7:00 PM", slots: ["6:00 AM", "8:00 AM", "10:00 AM", "1:00 PM"] },
    cover: "",
    accent: "travel",
    tagline: "For tours, transfers, van rentals, and reservation requests.",
    highlight: "Best for guest count, pickup details, and package requests",
    stat: "Sample travel page",
    services: ["Cebu City Tour", "Island Hopping Package", "Airport Transfer"],
    serviceDetails: [
      { name: "Cebu City Tour", description: "Private city tour with pickup", price: 999, pricingUnit: "PER_PAX", pricingType: "PER_PAX", pricingTiers: [], durationMinutes: 480, displayOrder: 0, status: "Active" },
      { name: "Island Hopping Package", description: "Boat day tour with guide coordination", price: 1500, pricingUnit: "PER_GROUP", pricingType: "GROUP_TIER", pricingTiers: [{ minGuests: 1, maxGuests: 2, price: 3500 }, { minGuests: 3, maxGuests: 4, price: 4500 }, { minGuests: 5, maxGuests: 6, price: 5500 }, { minGuests: 7, maxGuests: 10, price: 7500 }], durationMinutes: 540, displayOrder: 1, status: "Active" },
      { name: "Airport Transfer", description: "Point-to-point pickup or drop-off", price: 1200, pricingUnit: "PER_TRIP", pricingType: "PER_TRIP", pricingTiers: [], durationMinutes: 90, displayOrder: 2, status: "Active" },
    ],
    forms: ["Pickup location", "Guest count", "Special requests"],
  },
];

const demoSteps = [
  {
    title: "Set up your business",
    tag: "Owner setup",
    text: "Add business name, industry, logo, opening hours, staff, and your public booking page link.",
    detail: "Glow Beauty Studio / Salon template / 2 staff / Open Monday to Saturday",
    ownerTitle: "Business profile",
    ownerItems: ["Business: Glow Beauty Studio", "Industry: Salon / beauty", "Staff: Ana, Bea", "Hours: Mon-Sat, 9 AM-6 PM"],
    customerTitle: "Public page preview",
    customerItems: ["glowbeauty.slotwise.app", "Logo, cover photo, and services", "Book button visible on mobile"],
  },
  {
    title: "Create services",
    tag: "Service menu",
    text: "Add service duration, price, optional deposit, buffer time, and custom questions for each service.",
    detail: "Hair color / 60 minutes / PHP 350 / 15-minute cleanup buffer",
    ownerTitle: "Service builder",
    ownerItems: ["Hair color - PHP 350", "Duration: 60 minutes", "Buffer: 15 minutes", "Questions: Hair length, stylist"],
    customerTitle: "Service selection",
    customerItems: ["Hair color", "Hair treatment", "Makeup appointment"],
  },
  {
    title: "Share the booking page",
    tag: "Customer flow",
    text: "Post the link on Facebook, Messenger, Instagram bio, Google Business Profile, or QR code.",
    detail: "glowbeauty.slotwise.app goes straight to service, date, time, and customer details",
    ownerTitle: "Share tools",
    ownerItems: ["Copy booking link", "Download QR code", "Post to Facebook", "Add to Instagram bio"],
    customerTitle: "Customer opens link",
    customerItems: ["No account required", "Choose service", "Pick date and time"],
  },
  {
    title: "Accept bookings",
    tag: "Live schedule",
    text: "Customers book without an account. Slotwise blocks taken times and suggests the next available slot.",
    detail: "Maria books 10:15 AM / Email confirmation sent / Staff notified",
    ownerTitle: "New booking received",
    ownerItems: ["Maria Santos", "Hair color at 10:15 AM", "Status: Confirmed", "Staff: Ana"],
    customerTitle: "Confirmation screen",
    customerItems: ["Booking confirmed", "Reference: SW-1048", "Email confirmation sent"],
  },
  {
    title: "Manage the day",
    tag: "Dashboard",
    text: "Track bookings, check-ins, customer notes, deposits, cancellations, and follow-up reminders.",
    detail: "18 bookings today / PHP 4,850 deposits / 3 customers need follow-up",
    ownerTitle: "Today dashboard",
    ownerItems: ["18 bookings", "PHP 4,850 deposits", "3 follow-ups", "2 reschedule requests"],
    customerTitle: "Customer self-service",
    customerItems: ["View booking", "Reschedule if allowed", "Download receipt"],
  },
];

function App() {
  const [page, setPage] = useState("home");
  const [serviceIndex, setServiceIndex] = useState(0);
  const [slot, setSlot] = useState(slots[1]);
  const [heroSlide, setHeroSlide] = useState(0);
  const [demoStep, setDemoStep] = useState(0);
  const [demoOpen, setDemoOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState("3-day trial");
  const [selectedBusinessSlug, setSelectedBusinessSlug] = useState("glowbeauty");
  const [publicBusinessSlug, setPublicBusinessSlug] = useState("");
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [leadMessage, setLeadMessage] = useState("");
  const [leads, setLeads] = useState(() => JSON.parse(localStorage.getItem("slotwiseLeads") || "[]"));
  const [bookings, setBookings] = useState(() => JSON.parse(localStorage.getItem("slotwiseBookings") || "[]"));
  const [setupRequests, setSetupRequests] = useState(() => JSON.parse(localStorage.getItem("slotwiseSetupRequests") || "[]"));
  const [databaseBusinesses, setDatabaseBusinesses] = useState([]);
  const service = services[serviceIndex];
  const selectedFields = useMemo(() => service.fields.join(" + "), [service]);
  const activeDemo = demoSteps[demoStep];
  const latestSetupRequest = setupRequests[0];
  const clientBusiness = buildBusinessFromSetup(latestSetupRequest);
  const businessCatalog = useMemo(() => {
    const setupBusinesses = setupRequests.map(buildBusinessFromSetup).filter(Boolean);
    const bySlug = new Map();
    [...templates, ...setupBusinesses, ...databaseBusinesses].forEach((business) => {
      const previous = bySlug.get(business.slug) || {};
      const isDatabaseBusiness = business.source === "database";
      const next = normalizeBusinessConfig({
        ...previous,
        ...business,
        services: isDatabaseBusiness ? (business.services || []) : (business.services?.length ? business.services : previous.services),
        serviceDetails: isDatabaseBusiness ? (business.serviceDetails || []) : (business.serviceDetails?.length ? business.serviceDetails : previous.serviceDetails),
        forms: business.forms?.length ? business.forms : previous.forms,
        availability: { ...(previous.availability || {}), ...(business.availability || {}) },
        featureFlags: { ...(previous.featureFlags || {}), ...(business.featureFlags || {}) },
      });
      bySlug.set(business.slug, next);
    });
    return Array.from(bySlug.values());
  }, [setupRequests, databaseBusinesses]);
  const selectedBusiness = businessCatalog.find((item) => item.slug === selectedBusinessSlug) || businessCatalog[0] || normalizeBusinessConfig(templates[0]);
  const publicBusiness = publicBusinessSlug === "client"
    ? clientBusiness && normalizeBusinessConfig(clientBusiness)
    : businessCatalog.find((item) => item.slug === publicBusinessSlug);

  const previewSlides = [
    { key: "booking", label: "Booking page", title: "Customer booking sample" },
    { key: "dashboard", label: "Owner dashboard", title: "Owner dashboard sample" },
    { key: "customers", label: "Customers", title: "Customer database sample" },
  ];

  const loadBusinessConfigs = async (scopeSlug = "") => {
    if (!supabaseUrl || !supabaseAnonKey) return [];
    const businessQuery = scopeSlug
      ? `?select=*&slug=eq.${encodeURIComponent(scopeSlug)}`
      : "?select=*&order=created_at.desc";
    const serviceQuery = scopeSlug
      ? `?select=*&business_slug=eq.${encodeURIComponent(scopeSlug)}&order=display_order.asc`
      : "?select=*&order=display_order.asc";
    const availabilityQuery = scopeSlug
      ? `?select=*&business_slug=eq.${encodeURIComponent(scopeSlug)}&order=created_at.desc`
      : "?select=*&order=created_at.desc";
    const blockedDatesQuery = scopeSlug
      ? `?select=id,business_slug,blocked_date,active&business_slug=eq.${encodeURIComponent(scopeSlug)}&active=eq.true&order=blocked_date.asc`
      : "?select=id,business_slug,blocked_date,active&active=eq.true&order=blocked_date.asc";
    const paymentSettingsQuery = scopeSlug
      ? `?select=*&business_slug=eq.${encodeURIComponent(scopeSlug)}`
      : "?select=*";
    const paymentMethodsQuery = scopeSlug
      ? `?select=*&business_slug=eq.${encodeURIComponent(scopeSlug)}&active=eq.true`
      : "?select=*&active=eq.true";
    const [onlineBusinesses, onlineServices, onlineAvailability, onlineBlockedDates, onlinePaymentSettings, onlinePaymentMethods] = await Promise.all([
      supabaseRequest("businesses", { query: businessQuery }),
      supabaseRequest("business_services", { query: serviceQuery }),
      supabaseRequest("business_availability", { query: availabilityQuery }),
      supabaseRequest("business_blocked_dates", { query: blockedDatesQuery }).catch(() => []),
      supabaseRequest("business_payment_settings", { query: paymentSettingsQuery }).catch(() => []),
      supabaseRequest("business_payment_methods", { query: paymentMethodsQuery }).catch(() => []),
    ]);
    const servicesByBusiness = (onlineServices || []).reduce((grouped, service) => {
      grouped[service.business_slug] = grouped[service.business_slug] || [];
      grouped[service.business_slug].push(service);
      return grouped;
    }, {});
    const availabilityByBusiness = (onlineAvailability || []).reduce((grouped, availability) => {
      grouped[availability.business_slug] = grouped[availability.business_slug] || availability;
      return grouped;
    }, {});
    const blockedDatesByBusiness = (onlineBlockedDates || []).reduce((grouped, blockedDate) => {
      grouped[blockedDate.business_slug] = grouped[blockedDate.business_slug] || [];
      grouped[blockedDate.business_slug].push(blockedDate);
      return grouped;
    }, {});
    const paymentSettingsByBusiness = (onlinePaymentSettings || []).reduce((grouped, item) => {
      grouped[item.business_slug] = item;
      return grouped;
    }, {});
    const paymentMethodsByBusiness = (onlinePaymentMethods || []).reduce((grouped, item) => {
      grouped[item.business_slug] = grouped[item.business_slug] || [];
      grouped[item.business_slug].push(item);
      return grouped;
    }, {});
    const normalized = (onlineBusinesses || []).map((business) => (
      normalizeBusinessConfig(normalizeDatabaseBusiness(
        business,
        servicesByBusiness[business.slug] || [],
        {
          ...(availabilityByBusiness[business.slug] || {}),
          blocked_dates: blockedDatesByBusiness[business.slug] || [],
        },
        paymentSettingsByBusiness[business.slug] || null,
        paymentMethodsByBusiness[business.slug] || [],
      ))
    ));

    setDatabaseBusinesses((current) => {
      if (!scopeSlug) return normalized;
      return [...normalized, ...current.filter((business) => business.slug !== scopeSlug)];
    });
    return normalized;
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHeroSlide((current) => (current + 1) % previewSlides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [previewSlides.length]);

  useEffect(() => {
    const cleanPath = window.location.pathname.replace(/^\/+|\/+$/g, "");
    const isSmmAdminPath = cleanPath === "smm-admin";
    if (isSmmAdminPath) {
      setPage("smmAdmin");
    }
    if (cleanPath === "client-login") {
      setPage("clientLogin");
    }
    if (cleanPath === "client-dashboard") {
      setPage("clientDashboard");
    }
    if (window.location.hash === "#admin") {
      setPage("admin");
    }
    if (window.location.hash === "#owner") {
      setPage("owner");
    }
    if (window.location.hash === "#setup") {
      setPage("setup");
    }
    const routeSlug = getPublicSlugFromLocation();
    if (routeSlug) {
      setPublicBusinessSlug(routeSlug);
      setPage("publicBusiness");
    }

    async function loadOnlineData() {
      if (!supabaseUrl || !supabaseAnonKey) return;
      if (isSmmAdminPath) return;
      try {
        const [onlineLeads, onlineBookings, onlineSetupRequests] = await Promise.all([
          supabaseRequest("leads", { query: "?select=*&order=created_at.desc" }),
          supabaseRequest("bookings", { query: "?select=*&order=created_at.desc" }),
          supabaseRequest("setup_requests", { query: "?select=*&order=created_at.desc" }),
        ]);
        setLeads(onlineLeads || []);
        setBookings(onlineBookings || []);
        setSetupRequests((onlineSetupRequests || []).map(normalizeSetupRequest));
      } catch {
        // Keep the local demo data if online loading fails.
      }

      try {
        await loadBusinessConfigs(routeSlug);
      } catch {
        // Business config tables are additive; keep templates/setup data if they are not present yet.
      }
    }
    loadOnlineData();
  }, []);

  const saveLead = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextLead = {
      id: `LEAD-${Date.now()}`,
      name: data.get("name"),
      business: data.get("business"),
      industry: data.get("industry"),
      contact: data.get("contact"),
      offer: selectedOffer,
      status: "New",
    };
    let savedLead = nextLead;
    let savedOnline = false;
    let nextMessage = "";
    try {
      if (supabaseUrl && supabaseAnonKey) {
        const [onlineLead] = await supabaseRequest("leads", { method: "POST", body: nextLead });
        savedLead = onlineLead || nextLead;
        savedOnline = true;
      }
    } catch (error) {
      nextMessage = "Your request was received. We will contact you shortly.";
    }
    const nextLeads = [savedLead, ...leads];
    setLeads(nextLeads);
    localStorage.setItem("slotwiseLeads", JSON.stringify(nextLeads));
    setLeadSubmitted(true);
    setLeadMessage(nextMessage || "Your request was received. We will contact you shortly.");
    event.currentTarget.reset();
  };

  const saveSetupRequest = async (setup) => {
    const slug = makeSlug(setup.slug || setup.businessName);
    const requestId = `SETUP-${Date.now()}`;
    const nextRequest = { ...setup, businessSlug: slug, slug, id: requestId, status: "Ready for review" };
    let savedRequest = nextRequest;
    let saveResult = {
      savedOnline: false,
      slug,
      publicPath: `/${slug}`,
      message: "Saved locally only. Supabase is not connected.",
    };
    try {
      if (supabaseUrl && supabaseAnonKey) {
        const [onlineRequest] = await supabaseRequest("setup_requests", {
          method: "POST",
          body: setupRequestToDatabase(nextRequest),
        });
        savedRequest = onlineRequest ? normalizeSetupRequest(onlineRequest) : nextRequest;
        saveResult = {
          savedOnline: true,
          slug,
          publicPath: `/${slug}`,
          message: "Saved online to Supabase. SMM admin can review and provision the permanent page.",
        };
      }
    } catch (error) {
      // Keep the setup request in local demo storage if the online database rejects it.
      saveResult = {
        savedOnline: false,
        slug,
        publicPath: `/${slug}`,
        message: `Saved locally only. Supabase rejected it: ${error.message}`,
      };
    }
    const nextRequests = [savedRequest, ...setupRequests];
    setSetupRequests(nextRequests);
    localStorage.setItem("slotwiseSetupRequests", JSON.stringify(nextRequests));
    return saveResult;
  };

  const saveAdminClient = async (client, originalSlug = "", accessToken = "") => {
    const slug = originalSlug || makeSlug(client.slug || client.businessName);
    const requestId = `ADMIN-${Date.now()}`;
    const nextClient = { ...client, slug, businessSlug: slug, id: requestId };

    if (!supabaseUrl || !supabaseAnonKey) {
      return { savedOnline: false, blocked: true, message: "Supabase is not connected." };
    }

    const duplicate = await supabaseRequest("businesses", {
      query: `?select=slug&slug=eq.${encodeURIComponent(slug)}`,
      accessToken,
    });
    if (!originalSlug && duplicate?.length) {
      return {
        savedOnline: false,
        blocked: true,
        message: `The slug "${slug}" is already used. Choose another slug.`,
      };
    }

    const businessBody = setupToBusinessDatabase(nextClient, slug);
    if (originalSlug) {
      await supabaseRequest("businesses", {
        method: "PATCH",
        query: `?slug=eq.${encodeURIComponent(originalSlug)}`,
        body: businessBody,
        accessToken,
      });
      await supabaseRequest("business_availability", {
        method: "DELETE",
        query: `?business_slug=eq.${encodeURIComponent(originalSlug)}`,
        accessToken,
      });
    } else {
      await supabaseRequest("businesses", { method: "POST", body: businessBody, accessToken });
    }

    const serviceRows = setupToServiceRows(nextClient, slug, requestId);
    if (originalSlug) {
      const existingServices = await supabaseRequest("business_services", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(originalSlug)}`,
        accessToken,
      }).catch(() => []);
      const nextIds = new Set(serviceRows.map((service) => service.id));
      for (const service of serviceRows) {
        const existing = existingServices.find((item) => item.id === service.id);
        if (existing) {
          await supabaseRequest("business_services", {
            method: "PATCH",
            query: `?id=eq.${encodeURIComponent(service.id)}`,
            body: service,
            accessToken,
          });
        } else {
          await supabaseRequest("business_services", { method: "POST", body: service, accessToken });
        }
      }
      for (const existing of existingServices) {
        if (!nextIds.has(existing.id)) {
          await supabaseRequest("business_services", {
            method: "PATCH",
            query: `?id=eq.${encodeURIComponent(existing.id)}`,
            body: { status: "Inactive" },
            accessToken,
          });
        }
      }
    } else if (serviceRows.length) {
      await supabaseRequest("business_services", {
        method: "POST",
        body: serviceRows,
        accessToken,
      });
    }
    await supabaseRequest("business_availability", {
      method: "POST",
      body: setupToAvailabilityDatabase(nextClient, slug, requestId),
      accessToken,
    });
    await loadBusinessConfigs();
    return {
      savedOnline: true,
      slug,
      publicPath: `/${slug}`,
      message: originalSlug ? "Client updated." : "Client created.",
    };
  };

  const updateClientStatus = async (slug, status, accessToken = "") => {
    await supabaseRequest("businesses", {
      method: "PATCH",
      query: `?slug=eq.${encodeURIComponent(slug)}`,
      body: { status },
      accessToken,
    });
    setDatabaseBusinesses((current) => current.map((business) => (
      business.slug === slug ? { ...business, status } : business
    )));
    if (publicBusinessSlug === slug) await loadBusinessConfigs(slug);
  };

  const updateBookingStatus = async (bookingId, status, accessToken = "") => {
    await supabaseRpcRequest("update_client_booking_status", {
      booking_id: bookingId,
      next_status: status,
    }, accessToken);
  };

  const saveClientService = async (serviceData, accessToken = "") => {
    await supabaseRpcRequest("upsert_client_service", serviceData, accessToken);
  };

  const deleteClientService = async (serviceId, accessToken = "") => {
    await supabaseRpcRequest("delete_client_service", { service_id_value: serviceId }, accessToken);
  };

  const saveClientAvailability = async (availabilityData, accessToken = "") => {
    await supabaseRpcRequest("update_client_availability", availabilityData, accessToken);
  };

  const saveClientBlockedDate = async (blockedDateData, accessToken = "") => {
    await supabaseRpcRequest("upsert_client_blocked_date", blockedDateData, accessToken);
  };

  const setClientBlockedDateActive = async (blockedDateId, active, accessToken = "") => {
    await supabaseRpcRequest("set_client_blocked_date_active", {
      blocked_date_id: blockedDateId,
      next_active: active,
    }, accessToken);
  };

  const submitPublicPayment = async (payment) => {
    return supabaseRpcRequest("submit_public_booking_payment", payment);
  };

  const saveClientPaymentSettings = async (settingsData, accessToken = "") => {
    return supabaseRpcRequest("upsert_client_payment_settings", settingsData, accessToken);
  };

  const saveClientPaymentMethod = async (methodData, accessToken = "") => {
    return supabaseRpcRequest("upsert_client_payment_method", methodData, accessToken);
  };

  const verifyClientPayment = async (paymentId, accessToken = "") => {
    return supabaseRpcRequest("verify_booking_payment", { payment_id_value: paymentId }, accessToken);
  };

  const rejectClientPayment = async (paymentId, rejectionNote, accessToken = "") => {
    return supabaseRpcRequest("reject_booking_payment", { payment_id_value: paymentId, rejection_note_value: rejectionNote }, accessToken);
  };

  const saveBooking = async (booking) => {
    let nextBooking = { ...booking, id: `SW-${Date.now().toString().slice(-5)}`, status: booking.status || "Confirmed" };
    try {
      if (supabaseUrl && supabaseAnonKey) {
        const { businessSlug, ...databaseBooking } = nextBooking;
        const [onlineBooking] = await supabaseRequest("bookings", {
          method: "POST",
          body: databaseBooking,
          prefer: "return=minimal",
        });
        nextBooking = onlineBooking || nextBooking;
      }
    } catch (error) {
      console.error("Slotwise booking insert failed", {
        message: error.message,
        business_slug: nextBooking.business_slug,
        service: nextBooking.service,
        slot: nextBooking.slot,
      });
      throw new Error(`Booking could not be saved online: ${error.message}`);
    }
    const nextBookings = [nextBooking, ...bookings];
    setBookings(nextBookings);
    localStorage.setItem("slotwiseBookings", JSON.stringify(nextBookings));
    return nextBooking;
  };

  if (page === "booking") {
    return <BookingPrototype business={selectedBusiness} onBack={() => setPage("home")} onSaveBooking={saveBooking} onSubmitPayment={submitPublicPayment} />;
  }

  if (page === "owner") {
    return (
      <OwnerDashboard
        business={selectedBusiness}
        bookings={bookings}
        onBack={() => setPage("home")}
        onOpenBooking={() => setPage("booking")}
      />
    );
  }

  if (page === "setup") {
    return (
      <SetupWizard
        onBack={() => setPage("home")}
        onSaveSetup={saveSetupRequest}
        onOpenClient={(slug) => {
          const nextSlug = slug || "client";
          window.history.pushState(null, "", `/${nextSlug}`);
          setPublicBusinessSlug(nextSlug);
          setPage("publicBusiness");
        }}
      />
    );
  }

  if (page === "publicBusiness") {
    if (publicBusiness && publicBusiness.status === "SUSPENDED") {
      return <BusinessUnavailablePage business={publicBusiness} onBack={() => setPage("home")} />;
    }

    return publicBusiness ? (
      <BookingPrototype business={publicBusiness} onBack={() => setPage("home")} onSaveBooking={saveBooking} onSubmitPayment={submitPublicPayment} />
    ) : (
      <BusinessNotFoundPage slug={publicBusinessSlug} onBack={() => setPage("home")} onSetup={() => setPage("setup")} />
    );
  }

  if (page === "smmAdmin") {
    return (
      <SmmMasterAdmin
        businesses={databaseBusinesses}
        bookings={bookings}
        onBack={() => setPage("home")}
        onRefresh={() => loadBusinessConfigs()}
        onSaveClient={saveAdminClient}
        onUpdateStatus={updateClientStatus}
        onPreview={(slug) => {
          window.history.pushState(null, "", `/${slug}`);
          setPublicBusinessSlug(slug);
          setPage("publicBusiness");
        }}
      />
    );
  }

  if (page === "clientLogin" || page === "clientDashboard") {
    return (
      <ClientDashboard
        initialView={page === "clientLogin" ? "login" : "dashboard"}
        onBack={() => setPage("home")}
        onUpdateBookingStatus={updateBookingStatus}
        onSaveService={saveClientService}
        onDeleteService={deleteClientService}
        onSaveAvailability={saveClientAvailability}
        onSaveBlockedDate={saveClientBlockedDate}
        onSetBlockedDateActive={setClientBlockedDateActive}
        onSavePaymentSettings={saveClientPaymentSettings}
        onSavePaymentMethod={saveClientPaymentMethod}
        onVerifyPayment={verifyClientPayment}
        onRejectPayment={rejectClientPayment}
      />
    );
  }

  if (page === "admin") {
    return (
      <AdminView
        leads={leads}
        bookings={bookings}
        setupRequests={setupRequests}
        businesses={templates}
        databaseMode={databaseMode}
        onBack={() => setPage("home")}
        onOpenClient={() => { setPublicBusinessSlug("client"); setPage("publicBusiness"); }}
      />
    );
  }

  return (
    <main>
      <section className="hero">
        <nav className="nav" aria-label="Main navigation">
          <a className="brand" href="#">
            <img className="brandLogo" src="/slotwise-logo.png" alt="Slotwise" />
          </a>
          <div className="navLinks">
            <a href="#product">Product</a>
            <a href="#templates">Templates</a>
            <button className="navDemoButton" onClick={() => setDemoOpen(true)}>Demo</button>
            <a href="#pricing">Pricing</a>
            <a href="#signup">Sign up</a>
          </div>
          <a className="navCta" href="#signup">Start trial</a>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="eyebrow">Book smarter. Manage easier.</p>
            <h1>Online booking software for small service businesses.</h1>
            <p className="subcopy">
              Slotwise helps salons, clinics, travel agencies, car washes, tutors, and home services accept bookings,
              organize customers, and manage daily schedules from one clean dashboard.
            </p>
            <div className="heroActions">
              <a className="primary" href="#signup">Join launch list <ChevronRight size={18} /></a>
              <button className="secondary" onClick={() => setDemoOpen(true)}>See how it works</button>
              <button className="secondary" onClick={() => { setSelectedBusinessSlug("glowbeauty"); setPage("booking"); }}>Try a booking page</button>
              <button className="secondary" onClick={() => { setSelectedBusinessSlug("glowbeauty"); setPage("owner"); }}>View owner dashboard</button>
            </div>
            <div className="trustRow">
              <span><Check size={16} /> 3-day free trial</span>
              <span><Check size={16} /> PHP 149 launch monthly</span>
              <span><Check size={16} /> Lifetime promo</span>
              <span><Check size={16} /> {databaseMode}</span>
            </div>
          </div>

          <div className="productStack" id="demo">
            <div className="previewCarousel" aria-label="Slotwise sample screens">
              <div className="carouselTop">
                <span>{previewSlides[heroSlide].title}</span>
                <div className="carouselControls">
                  <button
                    aria-label="Previous sample screen"
                    onClick={() => setHeroSlide((current) => (current + previewSlides.length - 1) % previewSlides.length)}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    aria-label="Next sample screen"
                    onClick={() => setHeroSlide((current) => (current + 1) % previewSlides.length)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>

              {heroSlide === 0 && (
                <div className="bookingCard carouselCard">
                  <div className="sampleBanner">Sample customer booking page</div>
                  <div className="phoneTop">
                    <span>glowbeauty.slotwise.app</span>
                    <span className="liveDot">Sample</span>
                  </div>
                  <h2>How customers book</h2>
                  <p className="sampleExplain">This preview shows what your customers see when they open your Slotwise booking link.</p>
                  <div className="serviceList">
                    {services.map((item, index) => (
                      <button
                        key={item.name}
                        className={index === serviceIndex ? "service active" : "service"}
                        onClick={() => setServiceIndex(index)}
                      >
                        <span>
                          <strong>{item.name}</strong>
                          <small>{item.length} / {item.price}</small>
                        </span>
                        {index === serviceIndex && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                  <div className="slotGrid" aria-label="Available appointment times">
                    {slots.map((item) => (
                      <button key={item} className={item === slot ? "slot active" : "slot"} onClick={() => setSlot(item)}>
                        {item}
                      </button>
                    ))}
                  </div>
                  <div className="formPreview">
                    <span>Smart form</span>
                    <strong>{selectedFields}</strong>
                  </div>
                  <button className="confirmButton">Confirm booking</button>
                </div>
              )}

              {heroSlide === 1 && (
                <div className="ownerPreviewCard carouselCard">
                  <div className="sampleBanner">Sample owner dashboard</div>
                  <div className="ownerPreviewHeader">
                    <div>
                      <span>Glow Beauty Studio</span>
                      <strong>Today's schedule</strong>
                    </div>
                    <em>Live sample</em>
                  </div>
                  <div className="ownerPreviewMetrics">
                    <div><span>Bookings</span><strong>18</strong></div>
                    <div><span>Deposits</span><strong>PHP 4,850</strong></div>
                    <div><span>Follow-ups</span><strong>3</strong></div>
                  </div>
                  <div className="ownerPreviewRows">
                    <article><time>10:15</time><strong>Maria Santos</strong><span>Hair color / Checked in</span></article>
                    <article><time>1:00</time><strong>Jose Reyes</strong><span>Makeup appointment / Confirmed</span></article>
                    <article><time>3:30</time><strong>Ana Cruz</strong><span>Hair treatment / Reminder sent</span></article>
                  </div>
                  <button className="confirmButton" onClick={() => { setSelectedBusinessSlug("glowbeauty"); setPage("owner"); }}>Open dashboard sample</button>
                </div>
              )}

              {heroSlide === 2 && (
                <div className="customerPreviewCard carouselCard">
                  <div className="sampleBanner">Sample customer database</div>
                  <h2>Customers stay organized</h2>
                  <p className="sampleExplain">Business owners can see repeat customers, notes, contact details, and follow-up opportunities.</p>
                  <div className="customerPreviewList">
                    <article><strong>Maria Santos</strong><span>Returning customer</span><em>Last visit: Today</em></article>
                    <article><strong>Jose Reyes</strong><span>New lead from Facebook</span><em>Booked: 1:00 PM</em></article>
                    <article><strong>Ana Cruz</strong><span>Needs follow-up</span><em>Review request ready</em></article>
                  </div>
                  <div className="ownerLinkBox">
                    <strong>glowbeauty.slotwise.app</strong>
                    <span>Share in Facebook ads, Messenger, Instagram bio, or QR posters.</span>
                  </div>
                </div>
              )}

              <div className="carouselDots" aria-label="Sample screen navigation">
                {previewSlides.map((item, index) => (
                  <button
                    key={item.key}
                    className={heroSlide === index ? "active" : ""}
                    aria-label={`Show ${item.label}`}
                    onClick={() => setHeroSlide(index)}
                  />
                ))}
              </div>
            </div>
            <div className="miniPanel">
              <span>{previewSlides[heroSlide].label}</span>
              <strong>{heroSlide === 0 ? slot : heroSlide === 1 ? "Owner view" : "Customer list"}</strong>
              <p>
                {heroSlide === 0
                  ? "Customers book from the public page."
                  : heroSlide === 1
                    ? "Owners manage bookings after customers reserve a slot."
                    : "Every booking can become a saved customer record."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="product">
        <div className="sectionHeader">
          <p className="eyebrow">What you get</p>
          <h2>A simple booking system your customers can use right away.</h2>
        </div>
        <div className="featureGrid">
          <Feature icon={<CalendarDays />} title="Booking page" text="Each business gets a shareable page for services, staff, dates, times, and customer details." />
          <Feature icon={<LayoutDashboard />} title="Owner dashboard" text="View bookings, customer history, daily schedule, statuses, revenue, and monthly activity." />
          <Feature icon={<Users />} title="Customer database" text="Keep names, contacts, notes, repeat visits, and follow-up opportunities organized." />
          <Feature icon={<QrCode />} title="QR check-in" text="Add QR codes for arrivals, queues, attendance, and simple service status updates." />
          <Feature icon={<MessageSquare />} title="Notifications" text="Start with email confirmations, then offer SMS reminders as a paid add-on." />
          <Feature icon={<Sparkles />} title="AI assistant later" text="Let owners ask plain questions about bookings, returning customers, and revenue trends." />
        </div>
      </section>

      <section className="section templates" id="templates">
        <div className="sectionHeader">
          <p className="eyebrow">Ready-made templates</p>
          <h2>Choose a setup that matches your business.</h2>
        </div>
        <div className="templateGrid">
          {templates.map((template) => (
            <article className={`templateCard templateCard-${template.accent}`} key={template.name}>
              <div className="templatePhoto" style={{ backgroundImage: `linear-gradient(180deg, rgba(11, 18, 41, 0.05), rgba(11, 18, 41, 0.68)), url(${template.cover})` }}>
                <div className="templateIcon">{template.icon}</div>
                <span>{template.stat}</span>
              </div>
              <div className="templateIntro">
                <small>{template.business}</small>
                <h3>{template.name}</h3>
                <p>{template.tagline}</p>
              </div>
              <div className="templateLinkPreview">
                <span>{template.link}</span>
                <em>Sample</em>
              </div>
              <div className="templateHighlight">{template.highlight}</div>
              <div className="templateBlock">
                <span>Default services</span>
                <div className="templatePills">
                  {template.services.map((item) => <strong key={item}>{item}</strong>)}
                </div>
              </div>
              <div className="templateBlock">
                <span>Smart form fields</span>
                <div className="templatePills muted">
                  {template.forms.map((item) => <strong key={item}>{item}</strong>)}
                </div>
              </div>
              <button className="templateButton" onClick={() => { setSelectedBusinessSlug(template.slug); setPage("booking"); }}>
                Open booking page
              </button>
              <button className="templateButton secondaryTemplateButton" onClick={() => { setSelectedBusinessSlug(template.slug); setPage("owner"); }}>
                View owner dashboard
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboardBand">
        <div className="dashText">
          <p className="eyebrow">Dashboard preview</p>
          <h2>Designed for owners who manage bookings every day.</h2>
          <p>See your schedule, customer details, deposits, and follow-ups in one organized dashboard.</p>
          <button className="dashboardPreviewButton" onClick={() => { setSelectedBusinessSlug("glowbeauty"); setPage("owner"); }}>
            Open owner dashboard sample <ExternalLink size={17} />
          </button>
        </div>
        <div className="dashboard">
          <div className="metric"><Clock /><span>Today</span><strong>18 bookings</strong></div>
          <div className="metric"><CreditCard /><span>Deposits</span><strong>PHP 4,850</strong></div>
          <div className="metric"><BarChart3 /><span>Month</span><strong>+27%</strong></div>
          <div className="schedule">
            <span>10:15 AM</span><strong>Maria Santos</strong><em>Hair color / Checked in</em>
          </div>
          <div className="schedule">
            <span>1:00 PM</span><strong>Jose Reyes</strong><em>Dental consult / Confirmed</em>
          </div>
        </div>
      </section>

      <section className="section pricing" id="pricing">
        <div className="sectionHeader">
          <p className="eyebrow">Launch pricing</p>
          <h2>Short trial, low monthly price, and a limited lifetime deal.</h2>
        </div>
        <div className="priceGrid">
          <Plan name="Trial" price="Free" note="3 days" onChoose={() => setSelectedOffer("3-day trial")} items={["No card needed", "Create one booking page", "Test the dashboard", "Share with sample customers"]} />
          <Plan name="Launch Monthly" price="PHP 149" note="per month for first 3 months" featured onChoose={() => setSelectedOffer("PHP 149 monthly")} items={["Then PHP 199/month", "Unlimited bookings", "Customer list", "Calendar dashboard", "Email confirmations"]} />
          <Plan name="Lifetime Promo" price="PHP 1,999" note="one-time early supporter price" onChoose={() => setSelectedOffer("PHP 1,999 lifetime")} items={["First 100 businesses", "1 business page", "Up to 3 staff", "Core features forever", "Paid add-ons separate"]} />
        </div>
      </section>

      <section className="signupSection" id="signup">
        <div className="signupCopy">
          <p className="eyebrow">Launch signup</p>
          <h2>Reserve your Slotwise launch offer.</h2>
          <p>
            Get early access to your own online booking page, customer list, booking dashboard, and launch promo pricing.
          </p>
          <div className="launchChecklist">
            <span><Check size={16} /> Own booking page</span>
            <span><Check size={16} /> Customer bookings</span>
            <span><Check size={16} /> Simple dashboard</span>
            <span><Check size={16} /> Launch promo price</span>
          </div>
          <button className="setupPreviewButton" onClick={() => setPage("setup")}>Preview setup wizard</button>
        </div>
        <form className="leadForm" onSubmit={saveLead}>
          <div className="selectedOffer">Selected offer: <strong>{selectedOffer}</strong></div>
          <label>
            Your name
            <input name="name" required placeholder="Maria Santos" />
          </label>
          <label>
            Business name
            <input name="business" required placeholder="Glow Beauty Studio" />
          </label>
          <label>
            Industry
            <select name="industry" defaultValue="Salon / beauty">
              <option>Salon / beauty</option>
              <option>Clinic / dental</option>
              <option>Travel / staycation</option>
              <option>Car wash</option>
              <option>Home services</option>
              <option>Other service business</option>
            </select>
          </label>
          <label>
            Contact number or email
            <input name="contact" required placeholder="0912 345 6789" />
          </label>
          <button type="submit">Reserve launch offer</button>
          {leadSubmitted && (
            <div className="formSuccessBox">
              <p>{leadMessage}</p>
              <button type="button" onClick={() => setPage("setup")}>Continue setup details</button>
            </div>
          )}
        </form>
      </section>

      <button className="floatingDemoButton" onClick={() => setDemoOpen(true)} aria-label="Open Slotwise guided demo">
        <Sparkles size={19} />
        How it works
      </button>

      {demoOpen && (
        <div className="demoOverlay" role="dialog" aria-modal="true" aria-label="Slotwise guided demo">
          <div className="floatingDemo">
            <div className="floatingDemoTop">
              <div>
                <p className="eyebrow">How Slotwise works</p>
                <h2>How it works</h2>
              </div>
              <button className="closeDemo" onClick={() => setDemoOpen(false)} aria-label="Close guided demo">Close</button>
            </div>
            <div className="demoGrid">
              <div className="demoSteps">
                {demoSteps.map((step, index) => (
                  <button
                    key={step.title}
                    className={index === demoStep ? "demoStep active" : "demoStep"}
                    onClick={() => setDemoStep(index)}
                  >
                    <span>{index + 1}</span>
                    <strong>{step.title}</strong>
                  </button>
                ))}
              </div>
              <div className="demoPreview">
                <span className="demoTag">{activeDemo.tag}</span>
                <h3>{activeDemo.title}</h3>
                <p>{activeDemo.text}</p>
                <div className="demoDetail">
                  <Check size={18} />
                  <strong>{activeDemo.detail}</strong>
                </div>
                <RealisticDemo activeDemo={activeDemo} demoStep={demoStep} />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function RealisticDemo({ activeDemo, demoStep }) {
  return (
    <div className="realDemo">
      <div className="ownerMockup">
        <div className="mockupTop">
          <span>Owner dashboard</span>
          <em>Step {demoStep + 1}</em>
        </div>
        <div className="mockupTitle">
          <LayoutDashboard size={18} />
          <strong>{activeDemo.ownerTitle}</strong>
        </div>
        <div className="mockupList">
          {activeDemo.ownerItems.map((item) => (
            <div className="mockupItem" key={item}>
              <Check size={15} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="phoneMockup">
        <div className="phoneNotch" />
        <div className="phoneBrowser">glowbeauty.slotwise.app</div>
        <div className="phoneHero">
          <span>Glow Beauty</span>
          <strong>{activeDemo.customerTitle}</strong>
        </div>
        <div className="phoneList">
          {activeDemo.customerItems.map((item) => (
            <div className="phoneItem" key={item}>{item}</div>
          ))}
        </div>
        <button className="phoneButton">{demoStep >= 3 ? "View booking" : "Continue booking"}</button>
      </div>
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <article className="feature">
      <div className="icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function BookingPrototype({ business, onBack, onSaveBooking, onSubmitPayment }) {
  const [pickedService, setPickedService] = useState(business.services[0]);
  const availableSlots = business.availability?.slots?.length ? business.availability.slots : slots;
  const [pickedSlot, setPickedSlot] = useState(availableSlots[1] || availableSlots[0] || "10:15 AM");
  const [selectedBookingDate, setSelectedBookingDate] = useState(getTodayDateValue());
  const [guestCount, setGuestCount] = useState(2);
  const [confirmed, setConfirmed] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const flags = { ...defaultFeatureFlags, ...(business.featureFlags || {}) };
  const clientStatus = (business.status || "ACTIVE").toUpperCase();
  const isProductionActive = clientStatus === "ACTIVE";
  const isDemoPreview = clientStatus === "DEMO";
  const isAwaitingActivation = clientStatus === "UNPAID";
  const blockedDates = business.availability?.blockedDates || [];
  const isBlockedDate = blockedDates.some((blockedDate) => blockedDate.blocked_date === selectedBookingDate && blockedDate.active !== false);
  const selectedDateLabel = formatBookingDate(selectedBookingDate);
  const selectedWeekdayLabel = formatBookingWeekday(selectedBookingDate);
  const bookingTone = resolveBusinessTone(business);
  const isClinic = bookingTone === "clinic";
  const isToursTravel = bookingTone === "tours-travel";
  const isTravel = bookingTone === "travel" || isToursTravel;
  const isHomeService = bookingTone === "home-service";
  const brandInitial = (business.business || "S").trim().charAt(0).toUpperCase();
  const brandCategory = isToursTravel ? "Tours & Travel" : isClinic ? "Care & Wellness" : isTravel ? "Stay & Travel" : isHomeService ? "Aircon Services" : bookingTone === "auto" ? "Auto Services" : bookingTone === "general" ? "Service Business" : "Beauty & Wellness";
  const brandLine = isClinic
    ? ["Your visit, booked with care.", "Private details. Clear schedule."]
    : isToursTravel
      ? ["Tour packages, transfers, and reservations.", "Send your request in less than a minute."]
      : isTravel
      ? ["Reserve your date.", "Plan your visit with ease."]
      : isHomeService
        ? ["Aircon Cleaning • Repair • Installation", "Professional service for homes and businesses."]
        : bookingTone === "auto"
          ? ["Book a wash, detail, or service.", "Choose your preferred schedule."]
          : bookingTone === "general"
            ? ["Book the service you need.", "Choose a schedule that works for you."]
            : ["Enhance your glow.", "Reveal your best self."];
  const headingText = isToursTravel ? "Book Your Tour" : isHomeService ? "Book a Service" : flags.bookingEnabled ? "Book an appointment" : "Send an inquiry";
  const headerSubtext = isToursTravel ? (business.description || "Choose your tour package and preferred travel date.") : isHomeService ? "Choose the service you need and your preferred date and time." : business.description;
  const serviceStepLabel = isToursTravel ? "Choose a Tour Package" : isHomeService ? "Choose a Service" : "Choose a service";
  const timeStepLabel = isToursTravel ? "Select Travel Date" : isHomeService ? "Choose date and time" : "Pick a time";
  const slotLabel = isToursTravel ? "Preferred Time / Pickup Time" : "";
  const detailsStepLabel = isToursTravel ? "Guest Details" : isHomeService ? "Your contact details" : "Your details";
  const noteLabel = isToursTravel ? "Special Requests / Notes" : isHomeService ? "Service concern / notes" : `${business.forms[0]} / notes`;
  const notePlaceholder = isToursTravel ? "Preferred pickup details, guest needs, or questions for the tour operator" : isHomeService ? "Describe the issue, unit type, or anything the technician should know" : business.forms.join(", ");
  const submitLabel = isToursTravel ? "Submit Reservation Request" : isHomeService ? "Submit Service Request" : flags.bookingEnabled ? "Submit booking request" : "Send inquiry";
  const paymentSettings = business.paymentSettings || {};
  const paymentMethods = (business.paymentMethods || []).filter((method) => method.active !== false);
  const getServiceDetail = (serviceName) => {
    const detail = business.serviceDetails?.find((item) => item.name === serviceName);
    return {
      durationMinutes: detail?.durationMinutes ?? null,
      price: detail?.price ?? null,
      pricingUnit: normalizePricingUnit(detail?.pricingUnit, isToursTravel ? "PER_PAX" : "FLAT"),
      pricingType: normalizePricingType(detail?.pricingType, isToursTravel ? detail?.pricingUnit || "PER_PAX" : "FIXED"),
      pricingTiers: normalizePricingTiers(detail?.pricingTiers),
      description: detail?.description || "",
    };
  };
  const pickedServiceDetail = getServiceDetail(pickedService);
  const pickedPricing = getPricingForGuests(pickedServiceDetail, guestCount);
  const pickedPricingUnit = normalizePricingUnit(pickedServiceDetail.pricingUnit, isToursTravel ? "PER_PAX" : "FLAT");
  const estimatedTotal = isToursTravel ? pickedPricing.estimatedTotal : Number(pickedServiceDetail.price || 0);
  const servicePriceLabel = (detail) => {
    return formatServicePriceLabel(detail, isToursTravel ? "PER_PAX" : "FIXED");
  };
  const serviceMetaLabel = (detail) => [
    detail.durationMinutes ? `${detail.durationMinutes} min` : "",
    detail.price !== null || detail.pricingTiers?.length ? servicePriceLabel(detail) : "",
  ].filter(Boolean).join(" • ");
  const requiredPaymentAmount = getRequiredPaymentAmount(paymentSettings, estimatedTotal);
  const paymentRequired = isProductionActive && paymentSettings.enabled && requiredPaymentAmount !== null && paymentMethods.length > 0;

  useEffect(() => {
    setPickedService(business.services[0]);
    setPickedSlot(availableSlots[1] || availableSlots[0] || "10:15 AM");
    setSelectedBookingDate(getTodayDateValue());
    setGuestCount(2);
    setConfirmed(null);
    setBookingError("");
    setPaymentOpen(false);
    setPaymentStatus("");
  }, [business.slug]);

  const submitBooking = async (event) => {
    event.preventDefault();
    const bookingForm = event.currentTarget;
    setBookingError("");
    setSubmitting(true);
    const data = new FormData(bookingForm);
    const currentGuestCount = Math.max(1, Number(data.get("guestCount") || guestCount) || 1);
    const pickupLocation = String(data.get("address") || "").trim();
    const booking = {
      customer: data.get("customer"),
      contact: data.get("contact"),
      business: business.business,
      businessSlug: business.slug,
      business_slug: business.slug,
      service: pickedService,
      booking_date: flags.requireDate ? selectedBookingDate : "",
      slot: flags.requireTime ? pickedSlot : "Inquiry only",
      note: data.get("note"),
      status: isProductionActive ? (isToursTravel ? "PENDING" : "Confirmed") : `${clientStatus} preview`,
      metadata: isToursTravel ? {
        booking_template: "TOURS_TRAVEL",
        guest_count: currentGuestCount,
        pricing_unit: pickedPricingUnit,
        pricing_type: pickedPricing.pricingType,
        unit_price: pickedPricing.unitPrice,
        selected_tier: pickedPricing.selectedTier,
        estimated_total: pickedPricing.estimatedTotal,
        pickup_location: pickupLocation,
      } : undefined,
    };
    if (!booking.customer || !booking.contact || !booking.business_slug || !booking.service || !booking.slot || (flags.requireDate && !booking.booking_date) || (isToursTravel && currentGuestCount < 1)) {
      setBookingError("Please complete the required booking details before submitting.");
      setSubmitting(false);
      return;
    }
    if (isBlockedDate) {
      setBookingError("This date is unavailable. Please choose another date.");
      setSubmitting(false);
      return;
    }
    if (isToursTravel) {
      const submittedPricing = getPricingForGuests(pickedServiceDetail, currentGuestCount);
      if (submittedPricing.pricingType === "GROUP_TIER" && !submittedPricing.totalAvailable) {
        setBookingError("Please contact the business for availability and pricing for this group size.");
        setSubmitting(false);
        return;
      }
      booking.metadata = {
        ...booking.metadata,
        pricing_type: submittedPricing.pricingType,
        unit_price: submittedPricing.unitPrice,
        selected_tier: submittedPricing.selectedTier,
        estimated_total: submittedPricing.estimatedTotal,
      };
    }
    try {
      const savedBooking = isProductionActive ? await onSaveBooking(booking) : booking;
      setConfirmed(savedBooking);
      bookingForm.reset();
      setGuestCount(2);
    } catch (error) {
      console.error("Booking submission failed", error);
      setBookingError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPaymentDetails = async (event) => {
    event.preventDefault();
    if (!confirmed?.id) return;
    const data = new FormData(event.currentTarget);
    setPaymentStatus("");
    try {
      await onSubmitPayment({
        booking_id_value: confirmed.id,
        business_slug_value: business.slug,
        payment_method_value: data.get("paymentMethod"),
        amount_submitted_value: Number(data.get("amountSubmitted") || 0),
        reference_number_value: data.get("referenceNumber"),
        customer_note_value: data.get("paymentNote") || "",
      });
      setPaymentStatus("Payment details submitted. Payment is pending business verification.");
      setPaymentOpen(false);
    } catch (error) {
      console.error("Payment detail submission failed", error);
      setPaymentStatus("Payment details could not be submitted. Please contact the business.");
    }
  };

  return (
    <main
      className={`bookingPage premiumBookingPage ${bookingTone}`}
      style={{
        "--booking-primary": business.primaryColor,
        "--booking-accent": business.accentColor,
      }}
    >
      <button className="backButton premiumBackButton" onClick={onBack}><ArrowLeft size={18} /> Back to Slotwise</button>
      <section className="publicBooking premiumPublicBooking">
        <aside className="premiumBrandPanel" style={getBusinessCoverStyle(business, bookingTone)}>
          <div className="brandMark">{brandInitial}</div>
          <div className="brandStory">
            <span>{brandCategory}</span>
            <h1>{business.business}</h1>
            <i />
            <p>{brandLine[0]}<br />{brandLine[1]}</p>
          </div>
          <div className="bookingTrustCard">
            <div><CalendarDays size={22} /><span><strong>{isHomeService ? "Easy Online Booking" : "Easy online booking"}</strong><small>{isHomeService ? "Choose your service and schedule" : "Book in less than a minute"}</small></span></div>
            <div><Check size={22} /><span><strong>{isHomeService ? "Convenient Service Visit" : "Instant confirmation"}</strong><small>{isHomeService ? "Select your preferred date and time" : "We'll confirm your appointment"}</small></span></div>
            <div><Sparkles size={22} /><span><strong>{isHomeService ? "Request Confirmation" : "Simple and private"}</strong><small>{isHomeService ? "The business will confirm your schedule" : "Your details stay organized"}</small></span></div>
          </div>
        </aside>

        <form className="publicForm premiumPublicForm" onSubmit={submitBooking}>
          {(isDemoPreview || isAwaitingActivation) && (
            <div className={isDemoPreview ? "clientStatusNotice demo" : "clientStatusNotice unpaid"}>
              <strong>{isDemoPreview ? "Demo preview" : "Awaiting activation"}</strong>
              <span>
                {isDemoPreview
                  ? "Test the booking flow. Submissions on this preview are simulated and will not be saved as live bookings."
                  : "System setup is complete and awaiting activation. Submissions are preview only until the client is activated."}
              </span>
            </div>
          )}
          <div className="bookingFormHeader">
            <div>
              <h2>{headingText}</h2>
              <p>{headerSubtext}</p>
              {(business.phone || business.address) && (
                <div className="bookingContactLine">
                  {business.phone && <span>{business.phone}</span>}
                  {business.address && <span>{business.address}</span>}
                </div>
              )}
            </div>
            <span>{isToursTravel ? <MapPinned size={22} /> : <Sparkles size={22} />}</span>
          </div>

          {flags.bookingEnabled && (
          <div className="bookingStep">
            <div className="bookingStepTitle"><span>1</span><strong>{serviceStepLabel}</strong></div>
            <div className="premiumServiceGrid">
              {business.services.map((item) => {
                const ServiceIcon = resolveServiceIcon(item, business);
                return (
                  <button type="button" key={item} className={pickedService === item ? "premiumService active" : "premiumService"} onClick={() => setPickedService(item)}>
                    <span className="serviceIcon"><ServiceIcon size={22} /></span>
                    <strong>{item}</strong>
                    {getServiceDetail(item).description && <p className="serviceDescription">{getServiceDetail(item).description}</p>}
                    {flags.showPrices && serviceMetaLabel(getServiceDetail(item)) && <small>{serviceMetaLabel(getServiceDetail(item))}</small>}
                    {pickedService === item && <em><Check size={16} /></em>}
                  </button>
                );
              })}
            </div>
          </div>
          )}

          {flags.requireTime && (
          <div className="bookingStep">
            <div className="bookingStepTitle"><span>2</span><strong>{timeStepLabel}</strong></div>
            {isBlockedDate && (
              <div className="clientStatusNotice unpaid">
                <strong>Date unavailable</strong>
                <span>This business marked {selectedDateLabel} as unavailable.</span>
              </div>
            )}
            <div className="timeAndDate">
              <div className="premiumSlotGrid">
                {slotLabel && <span className="slotGroupLabel">{slotLabel}</span>}
                {availableSlots.map((item) => (
                  <button type="button" key={item} disabled={isBlockedDate} className={pickedSlot === item ? "premiumSlot active" : "premiumSlot"} onClick={() => setPickedSlot(item)}>{item}</button>
                ))}
              </div>
              <div className="selectedDateCard">
                <CalendarDays size={26} />
                <span>{isToursTravel ? "Travel date" : "Selected"}</span>
                <strong>{selectedDateLabel}</strong>
                <small>{selectedWeekdayLabel}</small>
                <input
                  aria-label="Select booking date"
                  type="date"
                  value={selectedBookingDate}
                  min={getTodayDateValue()}
                  onChange={(event) => setSelectedBookingDate(event.target.value)}
                  required={flags.requireDate}
                />
              </div>
            </div>
          </div>
          )}

          <div className="bookingStep">
            <div className="bookingStepTitle"><span>3</span><strong>{detailsStepLabel}</strong></div>
            <label className="premiumInput"><User size={20} /><span>Your name<input name="customer" required placeholder="Maria Santos" /></span></label>
            <label className="premiumInput"><Phone size={20} /><span>Phone or contact number<input name="contact" required placeholder="0912 345 6789" /></span></label>
            {isToursTravel && (
              <label className="guestStepper">
                <span>Total guests</span>
                <div>
                  <button type="button" onClick={() => setGuestCount((current) => Math.max(1, current - 1))}>-</button>
                  <input name="guestCount" type="number" min="1" value={guestCount} onChange={(event) => setGuestCount(Math.max(1, Number(event.target.value) || 1))} required />
                  <button type="button" onClick={() => setGuestCount((current) => current + 1)}>+</button>
                </div>
              </label>
            )}
            {flags.requireAddress && <label className="premiumInput"><House size={20} /><span>{isToursTravel ? "Pickup Location / Hotel" : isHomeService ? "Service address" : "Address"}<input name="address" required placeholder={isToursTravel ? "Hotel, airport, pier, or pickup area" : "Street, barangay, city"} /></span></label>}
            <label className="premiumInput"><FileText size={20} /><span>{noteLabel}<textarea name="note" placeholder={notePlaceholder} rows="3" /></span></label>
          </div>

          {isToursTravel && (
            <div className="reservationSummary">
              <span>Reservation Summary</span>
              <strong>{pickedService}</strong>
              <p>{selectedDateLabel} {flags.requireTime ? `at ${pickedSlot}` : ""} • {guestCount} guest{guestCount > 1 ? "s" : ""}</p>
              {pickedPricing.pricingType === "GROUP_TIER" && !pickedPricing.totalAvailable && <em>Please contact the business for this group size.</em>}
              {flags.showPrices && pickedPricing.pricingType !== "PER_DAY" && pickedPricing.totalAvailable && <em>Estimated total: {formatPeso(estimatedTotal)}</em>}
              {flags.showPrices && pickedPricing.pricingType === "PER_DAY" && <em>Rate: {servicePriceLabel(pickedServiceDetail)}</em>}
            </div>
          )}

          <button className="premiumConfirmButton" type="submit" disabled={submitting || isBlockedDate}>
            {submitting ? "Submitting request..." : submitLabel} <ChevronRight size={22} />
          </button>
          {bookingError && <p className="formError premiumError">{bookingError}</p>}
          {confirmed && (
            <div className="formSuccess premiumSuccess">
              <strong>{isProductionActive ? (isToursTravel ? "Reservation Request Received" : "Booking Request Received") : "Demo booking completed"}</strong>
              <span>
                {isProductionActive && isToursTravel
                  ? "Your reservation request has been received. The tour operator may contact you to confirm availability and final details."
                  : isProductionActive
                  ? "Your booking request has been received. The business may contact you to confirm your appointment."
                  : "No live booking was created."}
              </span>
              <dl>
                <div><dt>Business</dt><dd>{business.business}</dd></div>
                <div><dt>{isToursTravel ? "Tour Package" : "Service"}</dt><dd>{confirmed.service}</dd></div>
                <div><dt>{isToursTravel ? "Travel Date" : "Date"}</dt><dd>{confirmed.booking_date ? formatBookingDate(confirmed.booking_date) : "Not required"}</dd></div>
                <div><dt>{isToursTravel ? "Preferred Time" : "Time"}</dt><dd>{confirmed.slot}</dd></div>
                {isToursTravel && <div><dt>Guests</dt><dd>{confirmed.metadata?.guest_count || guestCount}</dd></div>}
                {isToursTravel && <div><dt>Pricing Type</dt><dd>{confirmed.metadata?.pricing_type || "FIXED"}</dd></div>}
                {isToursTravel && confirmed.metadata?.selected_tier && <div><dt>Selected Group Rate</dt><dd>{confirmed.metadata.selected_tier.minGuests}-{confirmed.metadata.selected_tier.maxGuests} pax - {formatPeso(confirmed.metadata.selected_tier.price)}</dd></div>}
                {isToursTravel && flags.showPrices && <div><dt>Estimated Total</dt><dd>{confirmed.metadata?.estimated_total ? formatPeso(confirmed.metadata.estimated_total) : servicePriceLabel(pickedServiceDetail)}</dd></div>}
                <div><dt>Name</dt><dd>{confirmed.customer}</dd></div>
                <div><dt>Reference</dt><dd>{confirmed.id || "Request received"}</dd></div>
              </dl>
              <div className="bookingSuccessActions">
                <button type="button" onClick={() => setConfirmed(null)}>Book Another</button>
                {business.messengerLink && <a href={business.messengerLink} target="_blank" rel="noreferrer">Contact Business</a>}
              </div>
              {paymentRequired && (
                <div className="paymentInstructions">
                  <span>{isToursTravel ? "Reservation Deposit" : "Payment Required"}</span>
                  <p><strong>Estimated Total:</strong> {estimatedTotal === null ? "Rate on request" : formatPeso(estimatedTotal)}</p>
                  <p><strong>Required {normalizePaymentRequirement(paymentSettings.requirement_type) === "DEPOSIT_REQUIRED" ? "Deposit" : "Payment"}:</strong> {formatPeso(requiredPaymentAmount)}</p>
                  <div className="paymentMethodList">
                    {paymentMethods.map((method) => (
                      <article key={method.id}>
                        <strong>{method.method_name || method.method_type}</strong>
                        <small>{method.account_name}</small>
                        <small>{method.account_number}</small>
                        {method.instructions && <p>{method.instructions}</p>}
                      </article>
                    ))}
                  </div>
                  <button type="button" onClick={() => setPaymentOpen((current) => !current)}>I've Made My Payment</button>
                  {paymentOpen && (
                    <form className="paymentDetailForm" onSubmit={submitPaymentDetails}>
                      <select name="paymentMethod" required>
                        {paymentMethods.map((method) => <option value={method.method_type} key={method.id}>{method.method_name || method.method_type}</option>)}
                      </select>
                      <input name="amountSubmitted" type="number" min="0" step="0.01" placeholder="Amount sent" required />
                      <input name="referenceNumber" placeholder="Payment reference number" required />
                      <textarea name="paymentNote" placeholder="Optional note" rows="2" />
                      <p>Submitting payment details does not automatically confirm your reservation. Payment will be verified by the business.</p>
                      <button type="submit">Submit Payment Details</button>
                    </form>
                  )}
                </div>
              )}
              {paymentStatus && <span>{paymentStatus}</span>}
            </div>
          )}
        </form>
      </section>
      <p className="privacyNote">We respect your time and privacy.</p>
    </main>
  );
}

function BusinessNotFoundPage({ slug, onBack, onSetup }) {
  return (
    <main className="setupPage">
      <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
      <section className="setupComplete">
        <span><CalendarDays size={22} /></span>
        <p className="eyebrow">Business booking page</p>
        <h1>Business page not found.</h1>
        <p>
          {slug ? `No active business configuration was found for "${slug}".` : "No business slug was provided."}
          {" "}Submit a setup wizard form or check the booking link.
        </p>
        <div className="setupCompleteActions">
          <button onClick={onSetup}>Open setup wizard</button>
        </div>
      </section>
    </main>
  );
}

function BusinessUnavailablePage({ business, onBack }) {
  return (
    <main className="setupPage">
      <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
      <section className="setupComplete">
        <span><CalendarDays size={22} /></span>
        <p className="eyebrow">Booking page unavailable</p>
        <h1>{business?.business || "This booking page"} is currently unavailable.</h1>
        <p>Please contact the business directly or try again later.</p>
        {(business?.messengerLink || business?.phone) && (
          <div className="setupCompleteActions">
            {business.messengerLink && <a href={business.messengerLink} target="_blank" rel="noreferrer">Contact Business</a>}
            {business.phone && <span>{business.phone}</span>}
          </div>
        )}
      </section>
    </main>
  );
}

function StructuredServiceManager({ services, onChange, onDeleteService, bookingTemplate = "GENERAL", compact = false }) {
  const copy = getServiceManagerCopy(bookingTemplate);
  const isTravel = normalizeBookingTemplate(bookingTemplate) === "TOURS_TRAVEL";
  const updateService = (index, updates) => {
    onChange(services.map((service, itemIndex) => itemIndex === index ? { ...service, ...updates } : service));
  };
  const removeService = async (index) => {
    const service = services[index];
    if (service?.id && onDeleteService) {
      const ok = window.confirm("Delete this service/package?\n\nThis will permanently remove it from this business and it will no longer appear on the public booking page.");
      if (!ok) return;
      await onDeleteService(service);
    }
    const next = services.filter((_, itemIndex) => itemIndex !== index);
    onChange(next.map((service, itemIndex) => ({ ...service, displayOrder: itemIndex })));
  };
  const moveService = (index, direction) => {
    const next = [...services];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((service, itemIndex) => ({ ...service, displayOrder: itemIndex })));
  };
  const updateTier = (serviceIndex, tierIndex, updates) => {
    const tiers = normalizePricingTiers(services[serviceIndex].pricingTiers);
    updateService(serviceIndex, {
      pricingTiers: tiers.map((tier, itemIndex) => itemIndex === tierIndex ? { ...tier, ...updates } : tier),
    });
  };

  return (
    <section className={compact ? "structuredServiceManager compact" : "structuredServiceManager"}>
      <div className="structuredServiceTop">
        <div>
          <p className="eyebrow">{copy.title}</p>
          <h3>{copy.title}</h3>
        </div>
        <button type="button" onClick={() => onChange([...services, ...emptyStructuredServices(1)])}>+ {copy.add}</button>
      </div>
      <div className="structuredServiceList">
        {!services.length && (
          <div className="clientEmptyState">No services/packages yet.</div>
        )}
        {services.map((service, index) => {
          const expanded = service.expanded !== false;
          return (
            <article className={expanded ? "structuredServiceCard expanded" : "structuredServiceCard"} key={`${service.id || "new"}-${index}`}>
              <button type="button" className="structuredServiceSummary" onClick={() => updateService(index, { expanded: !expanded })}>
                <strong>{service.name || `${copy.single} ${index + 1}`}</strong>
                <span>{service.price !== "" ? formatPeso(service.price) : "No price"}</span>
                <em>{service.status || "Active"}</em>
              </button>
              {expanded && (
                <div className="structuredServiceFields">
                  <input value={service.name} onChange={(event) => updateService(index, { name: event.target.value })} placeholder={`${copy.single} name`} />
                  <input value={service.description} onChange={(event) => updateService(index, { description: event.target.value })} placeholder="Description" />
                  <input type="number" min="0" value={service.price} onChange={(event) => updateService(index, { price: event.target.value })} placeholder="Price" />
                  <input type="number" min="0" value={service.durationMinutes} onChange={(event) => updateService(index, { durationMinutes: event.target.value })} placeholder="Duration in minutes" />
                  {isTravel && (
                    <>
                      <select value={normalizePricingType(service.pricingType, service.pricingUnit)} onChange={(event) => updateService(index, { pricingType: event.target.value, pricingUnit: normalizePricingUnit(service.pricingUnit, event.target.value) })}>
                        <option value="PER_PAX">Per pax</option>
                        <option value="GROUP_TIER">Group tier</option>
                        <option value="PER_TRIP">Per trip</option>
                        <option value="PER_DAY">Per day</option>
                        <option value="FIXED">Fixed</option>
                      </select>
                      <select value={normalizePricingUnit(service.pricingUnit, service.pricingType)} onChange={(event) => updateService(index, { pricingUnit: event.target.value })}>
                        <option value="PER_PAX">/ pax</option>
                        <option value="PER_GROUP">/ group</option>
                        <option value="PER_TRIP">/ trip</option>
                        <option value="PER_DAY">/ day</option>
                        <option value="FIXED">fixed</option>
                      </select>
                    </>
                  )}
                  <select value={service.status || "Active"} onChange={(event) => updateService(index, { status: event.target.value })}>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                  {isTravel && normalizePricingType(service.pricingType, service.pricingUnit) === "GROUP_TIER" && (
                    <div className="pricingTierEditor serviceTierEditor">
                      <span>Group pricing tiers</span>
                      {normalizePricingTiers(service.pricingTiers).map((tier, tierIndex) => (
                        <div key={`${index}-${tierIndex}`}>
                          <input type="number" min="1" value={tier.minGuests} onChange={(event) => updateTier(index, tierIndex, { minGuests: Number(event.target.value) })} placeholder="Min pax" />
                          <input type="number" min="1" value={tier.maxGuests} onChange={(event) => updateTier(index, tierIndex, { maxGuests: Number(event.target.value) })} placeholder="Max pax" />
                          <input type="number" min="0" value={tier.price} onChange={(event) => updateTier(index, tierIndex, { price: Number(event.target.value) })} placeholder="Price" />
                          <button type="button" onClick={() => updateService(index, { pricingTiers: normalizePricingTiers(service.pricingTiers).filter((_, itemIndex) => itemIndex !== tierIndex) })}>Remove</button>
                        </div>
                      ))}
                      <button type="button" onClick={() => updateService(index, { pricingTiers: [...normalizePricingTiers(service.pricingTiers), { minGuests: 1, maxGuests: 2, price: 0 }] })}>+ Add Pricing Tier</button>
                    </div>
                  )}
                  <div className="structuredServiceActions">
                    <button type="button" onClick={() => moveService(index, -1)} disabled={index === 0}>Move Up</button>
                    <button type="button" onClick={() => moveService(index, 1)} disabled={index === services.length - 1}>Move Down</button>
                    <button type="button" onClick={() => removeService(index)}>{service.id ? "Delete" : "Remove"}</button>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

const setupSteps = ["Business", "Services", "Schedule", "Rules", "Review"];

function SetupWizard({ onBack, onSaveSetup, onOpenClient }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [slugEdited, setSlugEdited] = useState(false);
  const [form, setForm] = useState({
    businessName: "",
    slug: "",
    ownerName: "",
    contact: "",
    industry: "Salon / beauty",
    facebookPage: "",
    services: "",
    serviceEntries: emptyStructuredServices(),
    openDays: "Monday to Saturday",
    openHours: "9:00 AM to 6:00 PM",
    staff: "Ana - Hair color, hair treatment\nBea - Makeup appointment",
    rules: "15-minute buffer between bookings. Customers can reschedule up to 24 hours before.",
    questions: "Preferred staff\nAny notes before the appointment?",
  });

  const updateForm = (event) => {
    const { name, value } = event.target;
    if (name === "slug") setSlugEdited(true);
    setForm((current) => {
      const next = { ...current, [name]: name === "slug" ? makeSlug(value) : value };
      if (name === "businessName" && !slugEdited) {
        next.slug = makeSlug(value);
      }
      return next;
    });
  };

  const setupBookingTemplate = inferBookingTemplateFromIndustry(form.industry);
  const updateSetupServices = (serviceEntries) => {
    const nextEntries = normalizeStructuredServices(serviceEntries);
    setForm((current) => ({
      ...current,
      serviceEntries: nextEntries,
      services: structuredServicesToLegacyText(nextEntries, setupBookingTemplate),
    }));
  };

  const finishSetup = async (event) => {
    event.preventDefault();
    const result = await onSaveSetup(form);
    setSaveStatus(result);
    if (result?.blocked) {
      setSubmitted(false);
      setStep(0);
      return;
    }
    setSubmitted(true);
  };

  const nextStep = () => setStep((current) => Math.min(current + 1, setupSteps.length - 1));
  const previousStep = () => setStep((current) => Math.max(current - 1, 0));

  if (submitted) {
    const publicPath = saveStatus?.publicPath || `/${makeSlug(form.slug || form.businessName)}`;
    const createdSlug = saveStatus?.slug || makeSlug(form.slug || form.businessName);

    return (
      <main className="setupPage">
        <section className="setupComplete">
          <span><Check size={22} /></span>
          <p className="eyebrow">Setup details received</p>
          <h1>Your booking page details are ready for review.</h1>
          <p>
            Slotwise saved the business setup details. The next step is to review the services,
            create the booking page, and send the customer their preview link.
          </p>
          {saveStatus && (
            <div className={saveStatus.savedOnline ? "setupSaveStatus online" : "setupSaveStatus local"}>
              {saveStatus.message}
            </div>
          )}
          <div className="setupPublicLink">
            <span>Permanent booking page</span>
            <strong>{publicPath}</strong>
          </div>
          <div className="setupCompleteActions">
            <button onClick={() => onOpenClient(createdSlug)}>Open booking page</button>
            <button onClick={onBack}>Back to site</button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="setupPage">
      <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
      <section className="setupShell">
        <aside className="setupSidebar">
          <p className="eyebrow">Slotwise setup wizard</p>
          <h1>Prepare your booking page faster.</h1>
          <p>Answer a few details so Slotwise can create the right services, schedule, booking rules, and customer questions.</p>
          <div className="setupSteps">
            {setupSteps.map((item, index) => (
              <button key={item} className={index === step ? "active" : ""} onClick={() => setStep(index)}>
                <span>{index + 1}</span>
                {item}
              </button>
            ))}
          </div>
        </aside>

        <form className="setupForm" onSubmit={finishSetup}>
          <div className="setupProgress"><span style={{ width: `${((step + 1) / setupSteps.length) * 100}%` }} /></div>
          {saveStatus?.blocked && (
            <div className="setupSaveStatus local setupInlineStatus">{saveStatus.message}</div>
          )}

          {step === 0 && (
            <div className="setupPanel">
              <p className="eyebrow">Step 1</p>
              <h2>Business information</h2>
              <div className="setupFieldGrid">
                <label>Business name<input name="businessName" value={form.businessName} onChange={updateForm} required placeholder="Glow Beauty Studio" /></label>
                <label>Booking page slug<input name="slug" value={form.slug} onChange={updateForm} required placeholder="glow-beauty-studio" /></label>
                <label>Owner name<input name="ownerName" value={form.ownerName} onChange={updateForm} required placeholder="Maria Santos" /></label>
                <label>Contact number or email<input name="contact" value={form.contact} onChange={updateForm} required placeholder="0912 345 6789" /></label>
                <label>Industry<select name="industry" value={form.industry} onChange={updateForm}>
                  <option>Salon / beauty</option>
                  <option>Clinic / dental</option>
                  <option>Travel / staycation</option>
                  <option>Car wash</option>
                  <option>Home services</option>
                  <option>Other service business</option>
                </select></label>
              </div>
              <p className="fieldHelp">Public link preview: /{form.slug || makeSlug(form.businessName)}</p>
              <label>Facebook page or website<input name="facebookPage" value={form.facebookPage} onChange={updateForm} placeholder="facebook.com/yourbusiness" /></label>
            </div>
          )}

          {step === 1 && (
            <div className="setupPanel">
              <p className="eyebrow">Step 2</p>
              <h2>Services and prices</h2>
              <p>Add each service with price and duration. Blank slots will not be saved.</p>
              <StructuredServiceManager services={form.serviceEntries} onChange={updateSetupServices} bookingTemplate={setupBookingTemplate} />
            </div>
          )}

          {step === 2 && (
            <div className="setupPanel">
              <p className="eyebrow">Step 3</p>
              <h2>Schedule</h2>
              <div className="setupFieldGrid">
                <label>Open days<input name="openDays" value={form.openDays} onChange={updateForm} placeholder="Monday to Saturday" /></label>
                <label>Open hours<input name="openHours" value={form.openHours} onChange={updateForm} placeholder="9:00 AM to 6:00 PM" /></label>
              </div>
              <label>Staff and services handled<textarea name="staff" value={form.staff} onChange={updateForm} rows="6" /></label>
            </div>
          )}

          {step === 3 && (
            <div className="setupPanel">
              <p className="eyebrow">Step 4</p>
              <h2>Booking rules and questions</h2>
              <label>Booking rules<textarea name="rules" value={form.rules} onChange={updateForm} rows="5" /></label>
              <label>Questions customers should answer<textarea name="questions" value={form.questions} onChange={updateForm} rows="5" /></label>
            </div>
          )}

          {step === 4 && (
            <div className="setupPanel">
              <p className="eyebrow">Step 5</p>
              <h2>Review setup details</h2>
              <div className="setupReview">
                <article><span>Business</span><strong>{form.businessName || "Business name"}</strong><em>{form.industry}</em></article>
                <article><span>Contact</span><strong>{form.ownerName || "Owner name"}</strong><em>{form.contact || "Contact details"}</em></article>
                <article><span>Public page</span><strong>/{form.slug || makeSlug(form.businessName)}</strong><em>Permanent client booking URL</em></article>
                <article><span>Schedule</span><strong>{form.openDays}</strong><em>{form.openHours}</em></article>
                <article><span>Services</span><strong>{getSavableStructuredServices(form.serviceEntries, setupBookingTemplate).length} services listed</strong><em>Ready for page setup</em></article>
              </div>
            </div>
          )}

          <div className="setupNav">
            <button type="button" onClick={previousStep} disabled={step === 0}>Back</button>
            {step < setupSteps.length - 1 ? (
              <button type="button" onClick={nextStep}>Next</button>
            ) : (
              <button type="submit">Submit setup details</button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}

function OwnerDashboard({ business, bookings, onBack, onOpenBooking }) {
  const businessBookings = bookings.filter((booking) => (booking.businessSlug || booking.business_slug) === business.slug);
  const sampleBookings = [
    { id: "sample-1", customer: "Maria Santos", service: business.services[0], slot: "10:15 AM", contact: "0912 345 6789", status: "Confirmed" },
    { id: "sample-2", customer: "Jose Reyes", service: business.services[1] || business.services[0], slot: "1:00 PM", contact: "0917 222 8100", status: "Checked in" },
    { id: "sample-3", customer: "Ana Cruz", service: business.services[2] || business.services[0], slot: "3:30 PM", contact: "ana@example.com", status: "Follow-up" },
  ];
  const visibleBookings = businessBookings.length > 0 ? businessBookings : sampleBookings;
  const deposits = visibleBookings.length * 350;
  const ownerCustomers = visibleBookings.map((booking, index) => ({
    name: booking.customer,
    contact: booking.contact || "Contact saved",
    detail: index === 0 ? "Returning customer" : index === 1 ? "First booking" : "Needs follow-up",
  }));

  return (
    <main className="ownerPage">
      <div className="ownerShell">
        <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
        <section className="ownerHero">
          <div>
            <p className="eyebrow">Sample owner dashboard</p>
            <h1>{business.business}</h1>
            <p>
              This is what a business owner sees after customers book: appointments, customers, services,
              booking link, payments, and follow-ups in one place.
            </p>
          </div>
          <div className="ownerActions">
            <button className="primary" onClick={onOpenBooking}>Open public booking page <ExternalLink size={17} /></button>
            <button className="secondary" onClick={onBack}>Back to website</button>
          </div>
        </section>

        <section className="ownerMetrics" aria-label="Dashboard summary">
          <div className="ownerMetric">
            <span>Today's bookings</span>
            <strong>{visibleBookings.length}</strong>
            <em>{businessBookings.length > 0 ? "From your test data" : "Sample data"}</em>
          </div>
          <div className="ownerMetric">
            <span>Saved customers</span>
            <strong>{ownerCustomers.length}</strong>
            <em>Ready for follow-up</em>
          </div>
          <div className="ownerMetric">
            <span>Deposits tracked</span>
            <strong>PHP {deposits.toLocaleString()}</strong>
            <em>Sample estimate</em>
          </div>
          <div className="ownerMetric">
            <span>Next slot</span>
            <strong>{visibleBookings[0]?.slot || "10:15 AM"}</strong>
            <em>Auto-suggested</em>
          </div>
        </section>

        <section className="ownerGrid">
          <div className="ownerPanel ownerSchedulePanel">
            <div className="ownerPanelHeader">
              <div>
                <span>Today</span>
                <h2>Booking schedule</h2>
              </div>
              <button>+ Add booking</button>
            </div>
            <div className="ownerScheduleList">
              {visibleBookings.map((booking) => (
                <article className="ownerBookingRow" key={booking.id}>
                  <time>{booking.slot}</time>
                  <div>
                    <strong>{booking.customer}</strong>
                    <span>{booking.service}</span>
                  </div>
                  <em>{booking.status || "Confirmed"}</em>
                </article>
              ))}
            </div>
          </div>

          <div className="ownerPanel">
            <div className="ownerPanelHeader">
              <div>
                <span>Customers</span>
                <h2>Customer list</h2>
              </div>
            </div>
            {ownerCustomers.map((customer) => (
              <article className="customerRow" key={customer.name}>
                <div>
                  <strong>{customer.name}</strong>
                  <span>{customer.contact}</span>
                </div>
                <em>{customer.detail}</em>
              </article>
            ))}
          </div>

          <div className="ownerPanel">
            <div className="ownerPanelHeader">
              <div>
                <span>Services</span>
                <h2>Menu setup</h2>
              </div>
            </div>
            {business.services.map((serviceName, index) => (
              <article className="serviceAdminRow" key={serviceName}>
                <div>
                  <strong>{serviceName}</strong>
                  <span>{index === 0 ? "60 min / PHP 350" : index === 1 ? "45 min / PHP 500" : "30 min / Free consult"}</span>
                </div>
                <em>Live</em>
              </article>
            ))}
          </div>

          <div className="ownerPanel">
            <div className="ownerPanelHeader">
              <div>
                <span>Share link</span>
                <h2>Booking page</h2>
              </div>
            </div>
            <div className="ownerLinkBox">
              <strong>{business.link}</strong>
              <span>Use this link in Facebook ads, Messenger, Instagram bio, or QR posters.</span>
            </div>
            <div className="quickActions">
              <button>Copy link</button>
              <button>Download QR</button>
              <button>Send reminder</button>
              <button>Ask review</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminView({ leads, bookings, setupRequests, businesses, databaseMode, onBack, onOpenClient }) {
  const totalBookings = bookings.length;
  const totalLeads = leads.length;
  const businessesWithBookings = businesses.map((business) => ({
    ...business,
    count: bookings.filter((booking) => (booking.businessSlug || booking.business_slug) === business.slug).length,
  }));

  return (
    <main className="adminPage">
      <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
      <section className="adminHero">
        <p className="eyebrow">Slotwise admin</p>
        <h1>Leads and bookings</h1>
        <p>Use this view to test whether your Facebook ad traffic is turning into real prospects and sample bookings.</p>
        <div className="databaseStatus">Storage mode: <strong>{databaseMode}</strong></div>
        {setupRequests.length > 0 && (
          <button className="adminClientButton" onClick={onOpenClient}>Open latest client booking page</button>
        )}
      </section>
      <section className="adminStats">
        <div><span>Total leads</span><strong>{totalLeads}</strong></div>
        <div><span>Total bookings</span><strong>{totalBookings}</strong></div>
        <div><span>Setup forms</span><strong>{setupRequests.length}</strong></div>
      </section>
      <section className="adminGrid">
        <div className="adminPanel">
          <h2>Businesses</h2>
          {businessesWithBookings.map((business) => (
            <article className="adminRow" key={business.slug}>
              <strong>{business.business}</strong>
              <span>{business.name} / {business.link}</span>
              <em>{business.count} bookings</em>
            </article>
          ))}
        </div>
        <div className="adminPanel">
          <h2>Saved leads</h2>
          {leads.length === 0 ? <p>No leads yet.</p> : leads.map((lead) => (
            <article className="adminRow" key={lead.id}>
              <strong>{lead.business}</strong>
              <span>{lead.name} / {lead.industry}</span>
              <em>{lead.contact} / {lead.offer} / {lead.status}</em>
            </article>
          ))}
        </div>
        <div className="adminPanel">
          <h2>Bookings</h2>
          {bookings.length === 0 ? <p>No bookings yet. Open the live booking page and submit one.</p> : bookings.map((booking) => (
            <article className="adminRow" key={booking.id}>
              <strong>{booking.customer}</strong>
              <span>{booking.business}</span>
              <span>{booking.service} / {booking.slot}</span>
              <em>{booking.contact} / {booking.status}</em>
            </article>
          ))}
        </div>
        <div className="adminPanel">
          <h2>Setup details</h2>
          {setupRequests.length === 0 ? <p>No setup forms yet.</p> : setupRequests.map((setup) => (
            <article className="adminRow" key={setup.id}>
              <strong>{setup.businessName}</strong>
              <span>{setup.ownerName} / {setup.industry}</span>
              <span>{setup.openDays} / {setup.openHours}</span>
              <em>{setup.status}</em>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function emptyAdminClient() {
  return {
    businessName: "",
    slug: "",
    industry: "Salon / beauty",
    status: "DEMO",
    package: "STARTER",
    bookingMode: "booking",
    bookingTemplate: "GENERAL",
    contact: "",
    facebookPage: "",
    address: "",
    rules: "Book online in less than a minute. Choose a service, pick a time, and get confirmation.",
    logo: "",
    primaryColor: "#bd5d6d",
    accentColor: "#f6dfe3",
    services: "",
    serviceEntries: emptyStructuredServices(),
    openDays: "Monday to Saturday",
    openHours: "9:00 AM to 6:00 PM",
    slotsText: slots.join(", "),
    featureFlags: { ...defaultFeatureFlags },
  };
}

function businessToAdminClient(business) {
  const serviceEntries = normalizeStructuredServices(
    business.serviceDetails?.length
      ? filterLegacyToursSeedRows(business.serviceDetails, business.bookingTemplate).map(serviceRowToStructured)
      : (business.services || []).map((service, index) => serviceRowToStructured({ name: service, displayOrder: index }, index)),
  );
  const serviceText = structuredServicesToLegacyText(serviceEntries, business.bookingTemplate);

  return {
    businessName: business.business || "",
    slug: business.slug || "",
    industry: business.businessType || business.name || "Service business",
    status: business.status || "DEMO",
    package: normalizePackage(business.package),
    bookingMode: business.bookingMode || "booking",
    bookingTemplate: normalizeBookingTemplate(business.bookingTemplate),
    contact: business.phone || "",
    facebookPage: business.messengerLink || "",
    address: business.address || "",
    rules: business.description || "",
    logo: business.logo || "",
    primaryColor: business.primaryColor || "#bd5d6d",
    accentColor: business.accentColor || "#f6dfe3",
    services: serviceText,
    serviceEntries,
    openDays: business.availability?.days || defaultAvailability.days,
    openHours: business.availability?.hours || defaultAvailability.hours,
    slotsText: (business.availability?.slots || slots).join(", "),
    featureFlags: { ...defaultFeatureFlags, ...(business.featureFlags || {}) },
  };
}

function SmmMasterAdmin({ businesses, bookings, onBack, onRefresh, onSaveClient, onUpdateStatus, onPreview }) {
  const [authState, setAuthState] = useState("checking");
  const [adminSession, setAdminSession] = useState(null);
  const [adminRole, setAdminRole] = useState("");
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [mode, setMode] = useState("list");
  const [editingSlug, setEditingSlug] = useState("");
  const [form, setForm] = useState(emptyAdminClient);
  const [clientAccess, setClientAccess] = useState([]);
  const [accessForm, setAccessForm] = useState({ userId: "", role: "OWNER" });
  const [statusMessage, setStatusMessage] = useState("");
  const [copiedMessage, setCopiedMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const loadClientAccess = async (session) => {
    if (!session?.access_token) return [];
    const rows = await supabaseRequest("business_users", {
      query: "?select=id,user_id,business_slug,role,active,created_at&order=created_at.desc",
      accessToken: session.access_token,
    });
    setClientAccess(rows || []);
    return rows || [];
  };

  const verifyAdmin = async (session) => {
    const rows = await supabaseRequest("admin_users", {
      query: "?select=user_id,role,active&active=eq.true",
      accessToken: session.access_token,
    });
    const adminRow = rows?.find((row) => row.user_id === session.user?.id);
    if (!adminRow) {
      clearAdminSession();
      setAdminSession(null);
      setAdminRole("");
      setAuthState("denied");
      return false;
    }
    setAdminSession(session);
    setAdminRole(adminRow.role);
    setAuthState("authorized");
    await onRefresh();
    await loadClientAccess(session);
    return true;
  };

  useEffect(() => {
    async function restoreSession() {
      const stored = getStoredAdminSession();
      if (!stored?.access_token) {
        setAuthState("login");
        return;
      }
      try {
        let session = stored;
        if (stored.expires_at && stored.expires_at * 1000 < Date.now() + 30000 && stored.refresh_token) {
          session = await supabaseAuthRequest("token?grant_type=refresh_token", {
            refresh_token: stored.refresh_token,
          });
          storeAdminSession(session);
        }
        await verifyAdmin(session);
      } catch {
        clearAdminSession();
        setAuthState("login");
      }
    }
    restoreSession();
  }, []);

  const signInAdmin = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    setAuthState("checking");
    try {
      const session = await supabaseAuthRequest("token?grant_type=password", loginForm);
      storeAdminSession(session);
      const ok = await verifyAdmin(session);
      if (!ok) setStatusMessage("Admin access is not authorized.");
    } catch (error) {
      clearAdminSession();
      setAuthState("login");
      setStatusMessage(error.message);
    }
  };

  const logoutAdmin = () => {
    clearAdminSession();
    setAdminSession(null);
    setAdminRole("");
    setAuthState("login");
    setMode("list");
    setStatusMessage("");
  };

  const startAdd = () => {
    setEditingSlug("");
    setForm(emptyAdminClient());
    setAccessForm({ userId: "", role: "OWNER" });
    setMode("form");
    setStatusMessage("");
  };

  const startEdit = (business) => {
    setEditingSlug(business.slug);
    setForm(businessToAdminClient(business));
    setAccessForm({ userId: "", role: "OWNER" });
    setMode("form");
    setStatusMessage("");
  };

  const updateForm = (event) => {
    const { name, value, type, checked } = event.target;
    if (name.startsWith("flag.")) {
      const flag = name.replace("flag.", "");
      setForm((current) => ({
        ...current,
        featureFlags: { ...current.featureFlags, [flag]: checked },
      }));
      return;
    }
    setForm((current) => {
      const next = { ...current, [name]: type === "checkbox" ? checked : value };
      if (name === "businessName" && !editingSlug) next.slug = makeSlug(value);
      if (name === "slug") next.slug = makeSlug(value);
      if (name === "bookingTemplate") {
        next.serviceEntries = normalizeStructuredServices(current.serviceEntries).map((service) => normalizeBookingTemplate(value) === "TOURS_TRAVEL" ? service : {
          ...service,
          pricingType: "FIXED",
          pricingUnit: "FLAT",
          pricingTiers: [],
        });
        next.services = structuredServicesToLegacyText(next.serviceEntries, value);
      }
      return next;
    });
  };

  const updateAdminServices = (serviceEntries) => {
    const nextEntries = normalizeStructuredServices(serviceEntries);
    setForm((current) => ({
      ...current,
      serviceEntries: nextEntries,
      services: structuredServicesToLegacyText(nextEntries, current.bookingTemplate),
    }));
  };

  const deleteAdminService = async (service) => {
    if (!editingSlug || !service.id) return;
    await supabaseRequest("business_services", {
      method: "DELETE",
      query: `?id=eq.${encodeURIComponent(service.id)}&business_slug=eq.${encodeURIComponent(editingSlug)}`,
      accessToken: adminSession?.access_token,
    });
    setStatusMessage("Service deleted.");
  };

  const submitClient = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage("");
    try {
      const result = await onSaveClient(form, editingSlug, adminSession?.access_token);
      setStatusMessage(result.message);
      await loadClientAccess(adminSession);
      if (result.savedOnline) setMode("list");
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (business, nextStatus) => {
    if (business.status === nextStatus) return;
    const highImpact = (business.status === "ACTIVE" && nextStatus === "SUSPENDED")
      || (business.status === "SUSPENDED" && nextStatus === "ACTIVE");
    if (highImpact && !window.confirm(`Change ${business.business} from ${business.status} to ${nextStatus}?`)) return;
    await onUpdateStatus(business.slug, nextStatus, adminSession?.access_token);
    setStatusMessage(`${business.business} is now ${nextStatus}.`);
  };

  const copyLink = async (slug) => {
    const url = `${window.location.origin}/${slug}`;
    await navigator.clipboard?.writeText(url);
    setStatusMessage(`Copied ${url}`);
  };

  const copyClientLoginLink = async () => {
    const url = `${window.location.origin}/client-login`;
    await navigator.clipboard?.writeText(url);
    setStatusMessage(`Copied ${url}`);
  };

  const openPublicPage = (slug) => {
    window.open(`${window.location.origin}/${slug}`, "_blank", "noopener,noreferrer");
  };

  const assignClientAccess = async (event) => {
    event.preventDefault();
    const targetSlug = editingSlug || form.slug;
    if (!targetSlug || !accessForm.userId.trim()) return;
    setStatusMessage("");
    try {
      const existing = clientAccess.find((item) => (
        item.business_slug === targetSlug && item.user_id === accessForm.userId.trim()
      ));
      if (existing) {
        await supabaseRequest("business_users", {
          method: "PATCH",
          query: `?id=eq.${encodeURIComponent(existing.id)}`,
          body: { role: accessForm.role, active: true },
          accessToken: adminSession?.access_token,
        });
      } else {
        await supabaseRequest("business_users", {
          method: "POST",
          body: {
            id: `BU-${targetSlug}-${accessForm.userId.trim().slice(0, 8)}-${Date.now().toString().slice(-5)}`,
            user_id: accessForm.userId.trim(),
            business_slug: targetSlug,
            role: accessForm.role,
            active: true,
          },
          accessToken: adminSession?.access_token,
        });
      }
      await loadClientAccess(adminSession);
      setAccessForm({ userId: "", role: "OWNER" });
      setStatusMessage("Client access assigned.");
    } catch (error) {
      console.error("Client status update failed", error);
      setStatusMessage("Unable to save changes. Please try again.");
    }
  };

  const setAccessActive = async (accessRow, active) => {
    setStatusMessage("");
    try {
      await supabaseRequest("business_users", {
        method: "PATCH",
        query: `?id=eq.${encodeURIComponent(accessRow.id)}`,
        body: { active },
        accessToken: adminSession?.access_token,
      });
      await loadClientAccess(adminSession);
      setStatusMessage(active ? "Client access activated." : "Client access deactivated.");
    } catch (error) {
      console.error("Client service save failed", error);
      setStatusMessage("Unable to save changes. Please try again.");
    }
  };

  const removeAccess = async (accessRow) => {
    if (!window.confirm("Remove this client dashboard access?")) return;
    setStatusMessage("");
    try {
      await supabaseRequest("business_users", {
        method: "DELETE",
        query: `?id=eq.${encodeURIComponent(accessRow.id)}`,
        accessToken: adminSession?.access_token,
      });
      await loadClientAccess(adminSession);
      setStatusMessage("Client access removed.");
    } catch (error) {
      console.error("Client schedule save failed", error);
      setStatusMessage("Unable to save changes. Please try again.");
    }
  };

  const currentClientAccess = clientAccess.filter((item) => item.business_slug === (editingSlug || form.slug));
  const hasActiveClientAccess = currentClientAccess.some((item) => item.active);
  const publicLink = `${window.location.origin}/${editingSlug || form.slug || "business-slug"}`;
  const clientLoginLink = `${window.location.origin}/client-login`;
  const dashboardLink = `${window.location.origin}/client-dashboard`;
  const packageDisplay = packageOptions.find((item) => item.value === normalizePackage(form.package));
  const packageText = packageDisplay ? `${packageDisplay.label} - ${packageDisplay.price}` : "Starter - PHP 499 lifetime";
  const demoHandoffMessage = `Hi! Your customized booking system preview is ready.

Business:
${form.businessName || "Your business"}

Package:
${packageText}

Preview your system here:
${publicLink}

You may test the booking flow before activation.

Please note that this is currently in Demo Mode, so test bookings are not saved as live bookings yet.

Once payment is confirmed, we can activate the same system and link immediately.

- SMM Solutions by Pabs Rivera`;
  const activeHandoffMessage = form.status === "SUSPENDED"
    ? `Hi! Your Slotwise booking system for ${form.businessName || "your business"} is currently suspended.

Please contact SMM Solutions by Pabs Rivera if you want to reactivate access.`
    : form.status === "UNPAID"
      ? `Hi! Your customized system setup is complete and currently awaiting activation.

Business:
${form.businessName || "Your business"}

Package:
${packageText}

Preview your system here:
${publicLink}

Once payment is confirmed, we can activate the same system and link immediately.

- SMM Solutions by Pabs Rivera`
      : `Hi! Your online booking system is now ${form.status === "ACTIVE" ? "ACTIVE" : "ready for preview"}.

Business:
${form.businessName || "Your business"}

Package:
${packageText}

Booking Page:
${publicLink}

Client Login:
${clientLoginLink}

${hasActiveClientAccess ? "Your customers may now submit real bookings through your booking page.\n\nYou can manage your bookings through your Client Dashboard." : "Client dashboard access is not assigned yet."}

Thank you for choosing SMM Solutions by Pabs Rivera.`;
  const loginHandoffMessage = `CLIENT DASHBOARD ACCESS

Business:
${form.businessName || "Your business"}

Login Page:
${clientLoginLink}

Dashboard:
${dashboardLink}

Client Dashboard:
${hasActiveClientAccess ? "Ready" : "Not Assigned"}

Use the email/account credentials provided separately by SMM Solutions.

For security, passwords are not included in this message.

After login, you will only see the bookings and features assigned to your business/package.`;
  const handoffMessages = [
    { key: "demo", title: "Demo Message", highlight: form.status === "DEMO", text: demoHandoffMessage },
    { key: "active", title: form.status === "ACTIVE" ? "Activated / Paid Message" : form.status === "UNPAID" ? "Pending Activation Message" : form.status === "SUSPENDED" ? "Suspended Note" : "Activated / Paid Message", highlight: form.status === "ACTIVE" || form.status === "UNPAID" || form.status === "SUSPENDED", text: activeHandoffMessage },
    { key: "login", title: "Login Details Message", highlight: hasActiveClientAccess, text: loginHandoffMessage },
  ];
  const readinessItems = [
    ["Business Details", Boolean(form.businessName && form.slug)],
    ["Services", getSavableStructuredServices(form.serviceEntries, form.bookingTemplate).length > 0],
    ["Schedule", Boolean(form.openDays && form.openHours && form.slotsText)],
    ["Package", Boolean(form.package)],
    ["Public Page", Boolean(form.slug)],
    ["Client Login", hasActiveClientAccess],
    ["Status", form.status || "DEMO"],
  ];

  const copyHandoffMessage = async (messageKey, messageText) => {
    await navigator.clipboard?.writeText(messageText);
    setCopiedMessage(messageKey);
    setStatusMessage("Copied message.");
  };

  if (authState === "checking") {
    return (
      <main className="adminPage smmAdminPage">
        <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
        <section className="adminHero smmAdminGate">
          <p className="eyebrow">SMM Master Admin</p>
          <h1>Checking admin session...</h1>
          <p>Client data will load after authorization is confirmed.</p>
        </section>
      </main>
    );
  }

  if (authState === "denied") {
    return (
      <main className="adminPage smmAdminPage">
        <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
        <section className="adminHero smmAdminGate">
          <p className="eyebrow">SMM Master Admin</p>
          <h1>Admin access is not authorized.</h1>
          <p>This account is signed in but is not an active approved SMM admin.</p>
          <div className="smmAdminActions">
            <button onClick={logoutAdmin}>Logout</button>
          </div>
        </section>
      </main>
    );
  }

  if (authState === "login") {
    return (
      <main className="adminPage smmAdminPage">
        <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
        <section className="adminHero smmAdminGate">
          <p className="eyebrow">SMM Master Admin</p>
          <h1>Sign in to continue.</h1>
          <p>Use the email and password for an approved SMM admin account.</p>
          <form className="smmUnlockForm" onSubmit={signInAdmin}>
            <input type="email" value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" required />
            <input type="password" value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" required />
            <button type="submit">Sign In</button>
          </form>
          {statusMessage && <div className="setupSaveStatus local">{statusMessage}</div>}
        </section>
      </main>
    );
  }

  return (
    <main className="adminPage smmAdminPage">
      <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
      <section className="adminHero smmAdminHero">
        <div>
          <p className="eyebrow">SMM Master Admin</p>
          <h1>Client systems</h1>
          <p>Create, preview, activate, suspend, and edit client booking pages from one place.</p>
        </div>
        <div className="smmAdminActions">
          <span className="databaseStatus">Role: <strong>{adminRole}</strong></span>
          <button onClick={startAdd}>+ Add Client</button>
          <button onClick={onRefresh}>Refresh</button>
          <button onClick={logoutAdmin}>Logout</button>
        </div>
      </section>
      {statusMessage && <div className="setupSaveStatus online smmStatusMessage">{statusMessage}</div>}

      {mode === "form" ? (
        <form className="smmClientForm" onSubmit={submitClient}>
          <div className="smmFormTop">
            <div>
              <p className="eyebrow">{editingSlug ? "Edit client" : "Add client"}</p>
              <h2>{editingSlug ? form.businessName : "New client system"}</h2>
            </div>
            <button type="button" onClick={() => setMode("list")}>Cancel</button>
          </div>
          <div className="setupFieldGrid">
            <label>Business name<input name="businessName" value={form.businessName} onChange={updateForm} required /></label>
            <label>Slug<input name="slug" value={form.slug} onChange={updateForm} required readOnly={Boolean(editingSlug)} /></label>
            <label>Business type<input name="industry" value={form.industry} onChange={updateForm} /></label>
            <label>Booking page template<select name="bookingTemplate" value={normalizeBookingTemplate(form.bookingTemplate)} onChange={updateForm}>
              {bookingTemplateOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}
            </select></label>
            <label>Status<select name="status" value={form.status} onChange={updateForm}>{clientStatuses.filter((status) => status !== "SUSPENDED").map((status) => <option key={status}>{status}</option>)}</select></label>
            <label>System mode<select name="bookingMode" value={form.bookingMode} onChange={updateForm}>
              <option value="booking">Booking</option>
              <option value="inquiry">Inquiry</option>
              <option value="booking-inquiry">Booking + Inquiry</option>
            </select></label>
            <label>Phone/contact<input name="contact" value={form.contact} onChange={updateForm} /></label>
            <label>Messenger/contact link<input name="facebookPage" value={form.facebookPage} onChange={updateForm} /></label>
            <label>Address<input name="address" value={form.address} onChange={updateForm} /></label>
            <label>Logo URL<input name="logo" value={form.logo} onChange={updateForm} /></label>
            <label>Primary color<input name="primaryColor" type="color" value={form.primaryColor} onChange={updateForm} /></label>
            <label>Accent color<input name="accentColor" type="color" value={form.accentColor} onChange={updateForm} /></label>
            <label>Open days<input name="openDays" value={form.openDays} onChange={updateForm} /></label>
            <label>Open hours<input name="openHours" value={form.openHours} onChange={updateForm} /></label>
            <label>Time slots<input name="slotsText" value={form.slotsText} onChange={updateForm} /></label>
          </div>
          <section className="smmPackageControl">
            <div>
              <p className="eyebrow">Package</p>
              <h3>{packageOptions.find((item) => item.value === normalizePackage(form.package))?.label || "Starter"} plan</h3>
              <span>Package controls client dashboard access. Status controls whether live bookings are allowed.</span>
            </div>
            <select name="package" value={normalizePackage(form.package)} onChange={updateForm} aria-label="Client package">
              {packageOptions.map((item) => <option value={item.value} key={item.value}>{item.label} - {item.price}</option>)}
            </select>
          </section>
          <section className="smmOpsGrid">
            <div className="smmOpsPanel">
              <p className="eyebrow">Client access</p>
              <h3>{currentClientAccess.some((item) => item.active) ? "Assigned" : "Not assigned"}</h3>
              {editingSlug ? (
                <>
                  <form className="smmInlineForm" onSubmit={assignClientAccess}>
                    <input value={accessForm.userId} onChange={(event) => setAccessForm((current) => ({ ...current, userId: event.target.value }))} placeholder="Auth User UUID" required />
                    <select value={accessForm.role} onChange={(event) => setAccessForm((current) => ({ ...current, role: event.target.value }))}>
                      <option>OWNER</option>
                      <option>STAFF</option>
                    </select>
                    <button type="submit">Assign Client Access</button>
                  </form>
                  <div className="smmAccessList">
                    {currentClientAccess.length ? currentClientAccess.map((item) => (
                      <article key={item.id}>
                        <strong>{item.role}</strong>
                        <span>User UUID: {item.user_id}</span>
                        <em>{item.active ? "Active" : "Inactive"}</em>
                        <div>
                          <button type="button" onClick={() => setAccessActive(item, !item.active)}>{item.active ? "Deactivate" : "Activate"}</button>
                          <button type="button" onClick={() => removeAccess(item)}>Remove</button>
                        </div>
                      </article>
                    )) : <span>No client dashboard user assigned yet.</span>}
                  </div>
                </>
              ) : (
                <span>Save the client first, then edit it to assign an existing Supabase Auth user.</span>
              )}
            </div>
            <div className="smmOpsPanel">
              <p className="eyebrow">Client system ready</p>
              <h3>{form.businessName || "New client"}</h3>
              <p><strong>Package:</strong> {normalizePackage(form.package)}</p>
              <p><strong>Status:</strong> {form.status}</p>
              <p><strong>Public Booking Page:</strong> {publicLink}</p>
              <p><strong>Client Login:</strong> {clientLoginLink}</p>
              <p><strong>Dashboard:</strong> {dashboardLink}</p>
              <div className="smmLinkActions">
                <button type="button" onClick={() => openPublicPage(editingSlug || form.slug)}>Open Public Page</button>
                <button type="button" onClick={() => copyLink(editingSlug || form.slug)}>Copy Public Link</button>
                <button type="button" onClick={copyClientLoginLink}>Copy Client Login Link</button>
              </div>
            </div>
            <div className="smmOpsPanel">
              <p className="eyebrow">Readiness checklist</p>
              <div className="smmChecklist">
                {readinessItems.map(([label, value]) => (
                  <span key={label}>
                    <strong>{value === true ? "✓" : value === false ? "Needs setup" : value}</strong>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </section>
          <section className="smmHandoffGenerator">
            <div className="smmFormTop">
              <div>
                <p className="eyebrow">Client handoff</p>
                <h3>Ready-to-copy messages</h3>
              </div>
              <span>{hasActiveClientAccess ? "Client Dashboard: Ready" : "Client Dashboard: Not Assigned"}</span>
            </div>
            <div className="smmMessageGrid">
              {handoffMessages.map((message) => (
                <article className={message.highlight ? "smmMessageCard active" : "smmMessageCard"} key={message.key}>
                  <div>
                    <strong>{message.title}</strong>
                    {message.highlight && <em>Suggested for current status</em>}
                  </div>
                  <textarea readOnly value={message.text} rows="12" />
                  <button type="button" onClick={() => copyHandoffMessage(message.key, message.text)}>
                    {copiedMessage === message.key ? "Copied!" : "Copy Message"}
                  </button>
                </article>
              ))}
            </div>
          </section>
          <label>Description<textarea name="rules" value={form.rules} onChange={updateForm} rows="3" /></label>
          <StructuredServiceManager services={form.serviceEntries} onChange={updateAdminServices} onDeleteService={deleteAdminService} bookingTemplate={form.bookingTemplate} />
          <div className="smmFlagGrid">
            {Object.keys(defaultFeatureFlags).map((flag) => (
              <label key={flag}>
                <input type="checkbox" name={`flag.${flag}`} checked={Boolean(form.featureFlags[flag])} onChange={updateForm} />
                {flag}
              </label>
            ))}
          </div>
          <button className="smmSaveButton" type="submit" disabled={saving}>{saving ? "Saving..." : "Save client"}</button>
        </form>
      ) : (
        <section className="smmClientList">
          {businesses.map((business) => {
            const bookingCount = bookings.filter((booking) => (booking.businessSlug || booking.business_slug) === business.slug).length;
            const assignedAccess = clientAccess.filter((item) => item.business_slug === business.slug && item.active);
            return (
              <article className="smmClientCard" key={business.slug}>
                <div>
                  <span className={`smmStatus ${business.status?.toLowerCase()}`}>{business.status}</span>
                  <h2>{business.business}</h2>
                  <p>{business.slug}</p>
                  <small>{business.businessType} / {business.bookingMode} / {normalizePackage(business.package)} / {business.services.length} services / {bookingCount} bookings</small>
                  <small>Client login: {assignedAccess.length ? `Assigned (${assignedAccess.map((item) => item.role).join(", ")})` : "Not assigned"}</small>
                </div>
                <div className="smmClientLink">/{business.slug}</div>
                <div className="smmClientControls">
                  <button onClick={() => onPreview(business.slug)}>Preview</button>
                  <button onClick={() => startEdit(business)}>Edit</button>
                  <button onClick={() => copyLink(business.slug)}>Copy Link</button>
                  <select value={business.status} onChange={(event) => changeStatus(business, event.target.value)}>
                    {clientStatuses.map((status) => <option key={status}>{status}</option>)}
                  </select>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}

function ClientDashboard({
  initialView,
  onBack,
  onUpdateBookingStatus,
  onSaveService,
  onDeleteService,
  onSaveAvailability,
  onSaveBlockedDate,
  onSetBlockedDateActive,
  onSavePaymentSettings,
  onSavePaymentMethod,
  onVerifyPayment,
  onRejectPayment,
}) {
  const [authState, setAuthState] = useState("checking");
  const [clientSession, setClientSession] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [businessUsers, setBusinessUsers] = useState([]);
  const [selectedBusinessSlug, setSelectedBusinessSlug] = useState("");
  const [clientBusiness, setClientBusiness] = useState(null);
  const [clientBookings, setClientBookings] = useState([]);
  const [clientServices, setClientServices] = useState([]);
  const [clientAvailability, setClientAvailability] = useState({ ...defaultAvailability });
  const [blockedDates, setBlockedDates] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({ enabled: false, requirement_type: "NO_PAYMENT_REQUIRED", deposit_type: "FIXED_AMOUNT", deposit_value: 0 });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bookingPayments, setBookingPayments] = useState([]);
  const [activeTab, setActiveTab] = useState(initialView === "login" ? "dashboard" : "dashboard");
  const [filter, setFilter] = useState("All");
  const [calendarFilter, setCalendarFilter] = useState("All");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getTodayDateValue());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const emptyServiceForm = { id: "", name: "", description: "", price: "", durationMinutes: 60, status: "Active", pricingType: "FIXED", pricingUnit: "FLAT", pricingTiers: [] };
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [clientServiceEntries, setClientServiceEntries] = useState(emptyStructuredServices());
  const [availabilityForm, setAvailabilityForm] = useState({ days: defaultAvailability.days, hours: defaultAvailability.hours, slotsText: slots.join(", ") });
  const [blockedDateForm, setBlockedDateForm] = useState({ blockedDate: "", reason: "" });
  const [paymentMethodForm, setPaymentMethodForm] = useState({ method_type: "GCASH", method_name: "GCash", account_name: "", account_number: "", instructions: "", active: true });

  const loadClientData = async (session) => {
    const mappings = await supabaseRequest("business_users", {
      query: "?select=id,user_id,business_slug,role,active&active=eq.true",
      accessToken: session.access_token,
    });
    if (!mappings?.length) {
      setAuthState("denied");
      return false;
    }

    const chosenSlug = selectedBusinessSlug || mappings[0].business_slug;
    const [businessRow] = await supabaseRequest("businesses", {
      query: `?select=*&slug=eq.${encodeURIComponent(chosenSlug)}`,
      accessToken: session.access_token,
    });
    const serviceRows = await supabaseRequest("business_services", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(chosenSlug)}&order=display_order.asc`,
      accessToken: session.access_token,
    });
    const [availabilityRow] = await supabaseRequest("business_availability", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(chosenSlug)}&order=created_at.desc`,
      accessToken: session.access_token,
    });
    const blockedDateRows = await supabaseRequest("business_blocked_dates", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(chosenSlug)}&active=eq.true&order=blocked_date.asc`,
      accessToken: session.access_token,
    }).catch(() => []);
    const bookingRows = await supabaseRequest("bookings", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(chosenSlug)}&order=created_at.desc`,
      accessToken: session.access_token,
    });
    const [paymentSettingsRow] = await supabaseRequest("business_payment_settings", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(chosenSlug)}`,
      accessToken: session.access_token,
    }).catch(() => []);
    const paymentMethodRows = await supabaseRequest("business_payment_methods", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(chosenSlug)}&order=created_at.desc`,
      accessToken: session.access_token,
    }).catch(() => []);
    const paymentRows = await supabaseRequest("booking_payments", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(chosenSlug)}&order=submitted_at.desc`,
      accessToken: session.access_token,
    }).catch(() => []);
    const normalizedAvailability = {
      days: availabilityRow?.open_days || defaultAvailability.days,
      hours: availabilityRow?.open_hours || defaultAvailability.hours,
      slots: Array.isArray(availabilityRow?.slots) ? availabilityRow.slots : slots,
      blockedDates: blockedDateRows || [],
    };

    setBusinessUsers(mappings);
    setSelectedBusinessSlug(chosenSlug);
    setClientBusiness(normalizeBusinessConfig(normalizeDatabaseBusiness(businessRow, serviceRows, {
      ...(availabilityRow || {}),
      blocked_dates: blockedDateRows || [],
    }, paymentSettingsRow || null, paymentMethodRows || [])));
    const visibleServiceRows = filterLegacyToursSeedRows(serviceRows || [], businessRow?.booking_template);
    setClientBookings(bookingRows || []);
    setClientServices(visibleServiceRows);
    setClientServiceEntries(normalizeStructuredServices(visibleServiceRows.map(serviceRowToStructured)));
    setClientAvailability(normalizedAvailability);
    setAvailabilityForm({
      days: normalizedAvailability.days,
      hours: normalizedAvailability.hours,
      slotsText: normalizedAvailability.slots.join(", "),
    });
    setBlockedDates(blockedDateRows || []);
    setPaymentSettings(paymentSettingsRow || { enabled: false, requirement_type: "NO_PAYMENT_REQUIRED", deposit_type: "FIXED_AMOUNT", deposit_value: 0 });
    setPaymentMethods(paymentMethodRows || []);
    setBookingPayments(paymentRows || []);
    setAuthState("authorized");
    return true;
  };

  useEffect(() => {
    async function restoreClientSession() {
      const stored = getStoredClientSession();
      if (!stored?.access_token) {
        setAuthState("login");
        return;
      }
      try {
        let session = stored;
        if (stored.expires_at && stored.expires_at * 1000 < Date.now() + 30000 && stored.refresh_token) {
          session = await supabaseAuthRequest("token?grant_type=refresh_token", {
            refresh_token: stored.refresh_token,
          });
          storeClientSession(session);
        }
        setClientSession(session);
        await loadClientData(session);
      } catch {
        clearClientSession();
        setAuthState("login");
      }
    }
    restoreClientSession();
  }, []);

  const signInClient = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    setAuthState("checking");
    try {
      const session = await supabaseAuthRequest("token?grant_type=password", loginForm);
      storeClientSession(session);
      setClientSession(session);
      await loadClientData(session);
      window.history.pushState(null, "", "/client-dashboard");
    } catch (error) {
      clearClientSession();
      setAuthState("login");
      setStatusMessage(error.message);
    }
  };

  const logoutClient = () => {
    clearClientSession();
    setClientSession(null);
    setClientBusiness(null);
    setClientBookings([]);
    setAuthState("login");
    window.history.pushState(null, "", "/client-login");
  };

  const changeBusiness = async (event) => {
    const nextSlug = event.target.value;
    setSelectedBusinessSlug(nextSlug);
    if (clientSession) {
      setStatusMessage("");
      const [businessRow] = await supabaseRequest("businesses", {
        query: `?select=*&slug=eq.${encodeURIComponent(nextSlug)}`,
        accessToken: clientSession.access_token,
      });
      const serviceRows = await supabaseRequest("business_services", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&order=display_order.asc`,
        accessToken: clientSession.access_token,
      });
      const [availabilityRow] = await supabaseRequest("business_availability", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&order=created_at.desc`,
        accessToken: clientSession.access_token,
      });
      const blockedDateRows = await supabaseRequest("business_blocked_dates", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&active=eq.true&order=blocked_date.asc`,
        accessToken: clientSession.access_token,
      }).catch(() => []);
      const bookingRows = await supabaseRequest("bookings", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&order=created_at.desc`,
        accessToken: clientSession.access_token,
      });
      const [paymentSettingsRow] = await supabaseRequest("business_payment_settings", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}`,
        accessToken: clientSession.access_token,
      }).catch(() => []);
      const paymentMethodRows = await supabaseRequest("business_payment_methods", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&order=created_at.desc`,
        accessToken: clientSession.access_token,
      }).catch(() => []);
      const paymentRows = await supabaseRequest("booking_payments", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&order=submitted_at.desc`,
        accessToken: clientSession.access_token,
      }).catch(() => []);
      const normalizedAvailability = {
        days: availabilityRow?.open_days || defaultAvailability.days,
        hours: availabilityRow?.open_hours || defaultAvailability.hours,
        slots: Array.isArray(availabilityRow?.slots) ? availabilityRow.slots : slots,
        blockedDates: blockedDateRows || [],
      };
      setClientBusiness(normalizeBusinessConfig(normalizeDatabaseBusiness(businessRow, serviceRows, {
        ...(availabilityRow || {}),
        blocked_dates: blockedDateRows || [],
      }, paymentSettingsRow || null, paymentMethodRows || [])));
      const visibleServiceRows = filterLegacyToursSeedRows(serviceRows || [], businessRow?.booking_template);
      setClientBookings(bookingRows || []);
      setClientServices(visibleServiceRows);
      setClientServiceEntries(normalizeStructuredServices(visibleServiceRows.map(serviceRowToStructured)));
      setClientAvailability(normalizedAvailability);
      setAvailabilityForm({
        days: normalizedAvailability.days,
        hours: normalizedAvailability.hours,
        slotsText: normalizedAvailability.slots.join(", "),
      });
      setBlockedDates(blockedDateRows || []);
      setPaymentSettings(paymentSettingsRow || { enabled: false, requirement_type: "NO_PAYMENT_REQUIRED", deposit_type: "FIXED_AMOUNT", deposit_value: 0 });
      setPaymentMethods(paymentMethodRows || []);
      setBookingPayments(paymentRows || []);
      setSelectedBooking(null);
    }
  };

  const updateStatus = async (booking, nextStatus) => {
    setStatusMessage("");
    try {
      await onUpdateBookingStatus(booking.id, nextStatus, clientSession?.access_token);
      const updatedBookings = clientBookings.map((item) => (
        item.id === booking.id ? { ...item, status: nextStatus } : item
      ));
      setClientBookings(updatedBookings);
      setSelectedBooking((current) => current?.id === booking.id ? { ...current, status: nextStatus } : current);
      setStatusMessage("Booking status updated.");
    } catch (error) {
      console.error("Client blocked date save failed", error);
      setStatusMessage("Unable to save changes. Please try again.");
    }
  };

  const editService = (service = null) => {
    setServiceForm(service ? {
      id: service.id,
      name: service.name || "",
      description: service.description || "",
      price: service.price ?? "",
      durationMinutes: service.duration_minutes || 60,
      pricingType: normalizePricingType(service.pricing_type, service.pricing_unit),
      pricingUnit: normalizePricingUnit(service.pricing_unit),
      pricingTiers: normalizePricingTiers(service.pricing_tiers),
      status: service.status || "Active",
    } : emptyServiceForm);
  };

  const submitService = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    try {
      const isClientToursTravel = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "TOURS_TRAVEL";
      const tierValidation = validatePricingTiers(serviceForm.pricingTiers);
      if (isClientToursTravel && serviceForm.pricingType === "GROUP_TIER" && (!tierValidation.ok || tierValidation.tiers.length === 0)) {
        setStatusMessage(tierValidation.message || "Add at least one valid pricing tier.");
        return;
      }
      const payload = {
        service_id: serviceForm.id || `svc-${Date.now()}`,
        target_slug: selectedBusinessSlug,
        service_name: serviceForm.name,
        service_description: serviceForm.description,
        service_price: serviceForm.price === "" ? null : Number(serviceForm.price),
        service_duration: Number(serviceForm.durationMinutes) || 60,
        service_status: serviceForm.status,
        service_pricing_type: isClientToursTravel ? normalizePricingType(serviceForm.pricingType) : "FIXED",
        service_pricing_unit: isClientToursTravel ? normalizePricingUnit(serviceForm.pricingUnit, serviceForm.pricingType) : "FLAT",
        service_pricing_tiers: isClientToursTravel ? tierValidation.tiers : [],
      };
      await onSaveService(payload, clientSession?.access_token);
      const nextServices = serviceForm.id
        ? clientServices.map((service) => service.id === serviceForm.id ? {
          ...service,
          name: payload.service_name,
          description: payload.service_description,
          price: payload.service_price,
          duration_minutes: payload.service_duration,
          pricing_type: payload.service_pricing_type,
          pricing_unit: payload.service_pricing_unit,
          pricing_tiers: payload.service_pricing_tiers,
          status: payload.service_status,
        } : service)
        : [...clientServices, {
          id: payload.service_id,
          business_slug: selectedBusinessSlug,
          name: payload.service_name,
          description: payload.service_description,
          price: payload.service_price,
          duration_minutes: payload.service_duration,
          pricing_type: payload.service_pricing_type,
          pricing_unit: payload.service_pricing_unit,
          pricing_tiers: payload.service_pricing_tiers,
          status: payload.service_status,
        }];
      setClientServices(nextServices);
      setClientBusiness((current) => normalizeBusinessConfig({
        ...current,
        serviceDetails: nextServices.map((service) => ({
          name: service.name,
          durationMinutes: service.duration_minutes,
          price: service.price,
          pricingType: service.pricing_type,
          pricingUnit: service.pricing_unit,
          pricingTiers: service.pricing_tiers,
          description: service.description || "",
        })),
        services: nextServices.filter((service) => service.status !== "Inactive").map((service) => service.name),
      }));
      editService();
      setStatusMessage("Service saved.");
    } catch (error) {
      console.error("Client blocked date update failed", error);
      setStatusMessage("Unable to save changes. Please try again.");
    }
  };

  const submitStructuredServices = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    try {
      const isClientToursTravel = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "TOURS_TRAVEL";
      const savableServices = getSavableStructuredServices(clientServiceEntries, clientBusiness?.bookingTemplate);
      for (const service of savableServices) {
        if (isClientToursTravel && service.pricingType === "GROUP_TIER" && !validatePricingTiers(service.pricingTiers).ok) {
          setStatusMessage(`Fix pricing tiers for ${service.name}.`);
          return;
        }
      }
      const currentIds = new Set(clientServices.map((service) => service.id));
      const nextIds = new Set(savableServices.filter((service) => service.id).map((service) => service.id));
      for (const service of savableServices) {
        await onSaveService({
          service_id: service.id || `svc-${Date.now()}-${service.displayOrder}`,
          target_slug: selectedBusinessSlug,
          service_name: service.name,
          service_description: service.description,
          service_price: service.price,
          service_duration: service.durationMinutes,
          service_status: service.status,
          service_pricing_type: isClientToursTravel ? normalizePricingType(service.pricingType) : "FIXED",
          service_pricing_unit: isClientToursTravel ? normalizePricingUnit(service.pricingUnit, service.pricingType) : "FLAT",
          service_pricing_tiers: isClientToursTravel ? service.pricingTiers : [],
        }, clientSession?.access_token);
      }
      for (const oldService of clientServices) {
        if (currentIds.has(oldService.id) && !nextIds.has(oldService.id)) {
          await onSaveService({
            service_id: oldService.id,
            target_slug: selectedBusinessSlug,
            service_name: oldService.name,
            service_description: oldService.description || "",
            service_price: oldService.price,
            service_duration: oldService.duration_minutes,
            service_status: "Inactive",
            service_pricing_type: oldService.pricing_type || "FIXED",
            service_pricing_unit: oldService.pricing_unit || "FLAT",
            service_pricing_tiers: oldService.pricing_tiers || [],
          }, clientSession?.access_token);
        }
      }
      const serviceRows = await supabaseRequest("business_services", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(selectedBusinessSlug)}&order=display_order.asc`,
        accessToken: clientSession?.access_token,
      });
      const refreshedServiceRows = serviceRows;
      const visibleServiceRows = filterLegacyToursSeedRows(refreshedServiceRows || [], clientBusiness?.bookingTemplate);
      setClientServices(visibleServiceRows);
      setClientServiceEntries(normalizeStructuredServices(visibleServiceRows.map(serviceRowToStructured)));
      setClientBusiness((current) => normalizeBusinessConfig(normalizeDatabaseBusiness({
        slug: current.slug,
        business: current.business,
        industry: current.name,
        booking_link: current.link,
        logo_url: current.logo,
        primary_color: current.primaryColor,
        accent_color: current.accentColor,
        phone: current.phone,
        messenger_link: current.messengerLink,
        address: current.address,
        description: current.description,
        business_type: current.businessType,
        booking_mode: current.bookingMode,
        booking_template: current.bookingTemplate,
        business_package: current.package,
        feature_flags: current.featureFlags,
        status: current.status,
        cover_url: current.cover,
      }, refreshedServiceRows || [], {
        open_days: clientAvailability.days,
        open_hours: clientAvailability.hours,
        slots: clientAvailability.slots,
        blocked_dates: blockedDates,
      }, paymentSettings || null, paymentMethods || [])));
      setStatusMessage("Services saved.");
    } catch (error) {
      console.error("Client service save failed", error);
      setStatusMessage("Unable to save services. Please try again.");
    }
  };

  const deleteStructuredService = async (service) => {
    if (!service?.id) return;
    await onDeleteService(service.id, clientSession?.access_token);
    setClientServices((current) => current.filter((item) => item.id !== service.id));
    setClientServiceEntries((current) => current.filter((item) => item.id !== service.id).map((item, index) => ({ ...item, displayOrder: index })));
    setClientBusiness((current) => normalizeBusinessConfig({
      ...current,
      serviceDetails: (current.serviceDetails || []).filter((item) => item.id !== service.id && item.name !== service.name),
      services: (current.services || []).filter((item) => item !== service.name),
    }));
    setStatusMessage("Service deleted.");
  };

  const submitAvailability = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    try {
      const nextSlots = availabilityForm.slotsText.split(",").map((item) => item.trim()).filter(Boolean);
      await onSaveAvailability({
        target_slug: selectedBusinessSlug,
        open_days_value: availabilityForm.days,
        open_hours_value: availabilityForm.hours,
        slots_value: nextSlots,
      }, clientSession?.access_token);
      const nextAvailability = { days: availabilityForm.days, hours: availabilityForm.hours, slots: nextSlots, blockedDates };
      setClientAvailability(nextAvailability);
      setClientBusiness((current) => normalizeBusinessConfig({ ...current, availability: nextAvailability }));
      setStatusMessage("Schedule saved.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const submitBlockedDate = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    try {
      const payload = {
        blocked_date_id: `blk-${Date.now()}`,
        target_slug: selectedBusinessSlug,
        blocked_date_value: blockedDateForm.blockedDate,
        blocked_reason: blockedDateForm.reason,
      };
      await onSaveBlockedDate(payload, clientSession?.access_token);
      const nextBlockedDates = [...blockedDates, {
        id: payload.blocked_date_id,
        business_slug: selectedBusinessSlug,
        blocked_date: payload.blocked_date_value,
        reason: payload.blocked_reason,
        active: true,
      }];
      setBlockedDates(nextBlockedDates);
      setClientBusiness((current) => normalizeBusinessConfig({ ...current, availability: { ...current.availability, blockedDates: nextBlockedDates } }));
      setBlockedDateForm({ blockedDate: "", reason: "" });
      setStatusMessage("Blocked date added.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const removeBlockedDate = async (blockedDate) => {
    setStatusMessage("");
    try {
      await onSetBlockedDateActive(blockedDate.id, false, clientSession?.access_token);
      const nextBlockedDates = blockedDates.filter((item) => item.id !== blockedDate.id);
      setBlockedDates(nextBlockedDates);
      setClientBusiness((current) => normalizeBusinessConfig({ ...current, availability: { ...current.availability, blockedDates: nextBlockedDates } }));
      setStatusMessage("Blocked date removed.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const submitPaymentSettings = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    try {
      const payload = {
        target_slug: selectedBusinessSlug,
        enabled_value: Boolean(paymentSettings.enabled),
        requirement_type_value: normalizePaymentRequirement(paymentSettings.requirement_type),
        deposit_type_value: paymentSettings.deposit_type || "FIXED_AMOUNT",
        deposit_value_value: Number(paymentSettings.deposit_value || 0),
      };
      await onSavePaymentSettings(payload, clientSession?.access_token);
      setStatusMessage("Payment settings saved.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const submitPaymentMethod = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    try {
      const payload = {
        method_id_value: paymentMethodForm.id || `paymethod-${Date.now()}`,
        target_slug: selectedBusinessSlug,
        method_type_value: paymentMethodForm.method_type,
        method_name_value: paymentMethodForm.method_name,
        account_name_value: paymentMethodForm.account_name,
        account_number_value: paymentMethodForm.account_number,
        instructions_value: paymentMethodForm.instructions,
        active_value: Boolean(paymentMethodForm.active),
      };
      await onSavePaymentMethod(payload, clientSession?.access_token);
      const nextMethods = paymentMethodForm.id
        ? paymentMethods.map((method) => method.id === paymentMethodForm.id ? { ...method, ...payload, id: payload.method_id_value, business_slug: selectedBusinessSlug, method_type: payload.method_type_value, method_name: payload.method_name_value, account_name: payload.account_name_value, account_number: payload.account_number_value, instructions: payload.instructions_value, active: payload.active_value } : method)
        : [{ id: payload.method_id_value, business_slug: selectedBusinessSlug, method_type: payload.method_type_value, method_name: payload.method_name_value, account_name: payload.account_name_value, account_number: payload.account_number_value, instructions: payload.instructions_value, active: payload.active_value }, ...paymentMethods];
      setPaymentMethods(nextMethods);
      setPaymentMethodForm({ method_type: "GCASH", method_name: "GCash", account_name: "", account_number: "", instructions: "", active: true });
      setStatusMessage("Payment method saved.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const updatePaymentVerification = async (payment, action) => {
    const confirmedAction = action === "verify"
      ? window.confirm("Have you confirmed this payment in your actual GCash, Maya, bank, or payment account?")
      : window.confirm("Reject this submitted payment detail?");
    if (!confirmedAction) return;
    const rejectionNote = action === "reject" ? window.prompt("Optional rejection note", "Reference number could not be found.") || "" : "";
    setStatusMessage("");
    try {
      if (action === "verify") {
        await onVerifyPayment(payment.id, clientSession?.access_token);
      } else {
        await onRejectPayment(payment.id, rejectionNote, clientSession?.access_token);
      }
      const nextStatus = action === "verify" ? "VERIFIED" : "REJECTED";
      setBookingPayments((current) => current.map((item) => item.id === payment.id ? { ...item, payment_status: nextStatus, rejection_note: rejectionNote } : item));
      setStatusMessage(action === "verify" ? "Payment verified." : "Payment rejected.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  };

  const filteredBookings = clientBookings.filter((booking) => (
    filter === "All" || (booking.status || "").toUpperCase() === filter.toUpperCase()
  ));
  const pendingCount = clientBookings.filter((booking) => ["PENDING", "NEW"].includes((booking.status || "").toUpperCase())).length;
  const confirmedCount = clientBookings.filter((booking) => (booking.status || "").toUpperCase() === "CONFIRMED").length;
  const completedCount = clientBookings.filter((booking) => (booking.status || "").toUpperCase() === "COMPLETED").length;
  const cancelledCount = clientBookings.filter((booking) => (booking.status || "").toUpperCase() === "CANCELLED").length;
  const todayCount = clientBookings.filter((booking) => (booking.booking_date || "").startsWith("2026-05-21")).length;
  const currentRole = businessUsers.find((item) => item.business_slug === selectedBusinessSlug)?.role || "OWNER";
  const capabilities = getPackageCapabilities(clientBusiness?.package, clientBusiness?.featureFlags);
  const isClientToursTravel = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "TOURS_TRAVEL";
  const paymentsByBooking = bookingPayments.reduce((grouped, payment) => {
    grouped[payment.booking_id] = grouped[payment.booking_id] || [];
    grouped[payment.booking_id].push(payment);
    return grouped;
  }, {});
  const selectedBookingPayments = selectedBooking ? paymentsByBooking[selectedBooking.id] || [] : [];
  const latestSelectedPayment = selectedBookingPayments[0];
  const pendingPaymentCount = bookingPayments.filter((payment) => payment.payment_status === "PENDING_VERIFICATION").length;
  const verifiedPaymentCount = bookingPayments.filter((payment) => payment.payment_status === "VERIFIED").length;
  const customers = Object.values(clientBookings.reduce((grouped, booking) => {
    const key = `${booking.customer || "Customer"}-${booking.contact || ""}`;
    const previous = grouped[key];
    if (!previous || new Date(booking.created_at || 0) >= new Date(previous.created_at || 0)) {
      grouped[key] = {
        customer: booking.customer,
        contact: booking.contact,
        latestService: booking.service,
        latestDate: booking.booking_date || booking.created_at || "",
        created_at: booking.created_at,
        history: clientBookings.filter((item) => item.customer === booking.customer && item.contact === booking.contact),
      };
    }
    return grouped;
  }, {}));

  useEffect(() => {
    const tabAllowed = {
      dashboard: true,
      bookings: true,
      customers: capabilities.customers,
      services: capabilities.services,
      schedule: capabilities.schedule,
      reservationCalendar: capabilities.reservationCalendar,
      blockedDates: capabilities.blockedDates,
      paymentSettings: capabilities.paymentVerification,
      account: true,
    };
    if (!tabAllowed[activeTab]) setActiveTab("dashboard");
  }, [activeTab, capabilities.customers, capabilities.services, capabilities.schedule, capabilities.reservationCalendar, capabilities.blockedDates, capabilities.paymentVerification]);

  if (authState === "checking") {
    return (
      <main className="clientDashboardPage">
        <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
        <section className="clientAuthPanel">
          <p className="eyebrow">Client dashboard</p>
          <h1>Checking client session...</h1>
          <p>Your dashboard will load after your account and business access are verified.</p>
        </section>
      </main>
    );
  }

  if (authState === "denied") {
    return (
      <main className="clientDashboardPage">
        <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
        <section className="clientAuthPanel">
          <p className="eyebrow">Client dashboard</p>
          <h1>Client access is not authorized.</h1>
          <p>This account is not mapped to an active business. Please contact SMM Solutions.</p>
          <button className="clientPrimaryButton" onClick={logoutClient}>Logout</button>
        </section>
      </main>
    );
  }

  if (authState === "login") {
    return (
      <main className="clientDashboardPage">
        <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
        <section className="clientAuthPanel">
          <p className="eyebrow">Client Dashboard</p>
          <h1>Sign in to manage your bookings.</h1>
          <p>Use the email and password provided by SMM Solutions.</p>
          <form className="clientLoginForm" onSubmit={signInClient}>
            <input type="email" value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" required />
            <input type="password" value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} placeholder="Password" required />
            <button type="submit">Sign In</button>
          </form>
          {statusMessage && <div className="setupSaveStatus local">{statusMessage}</div>}
        </section>
      </main>
    );
  }

  return (
    <main className="clientDashboardPage">
      <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
      <section className="clientDashboardShell">
        <aside className="clientDashboardNav">
          <p className="eyebrow">Client dashboard</p>
          <h1>{clientBusiness?.business}</h1>
          {businessUsers.length > 1 && (
            <select value={selectedBusinessSlug} onChange={changeBusiness}>
              {businessUsers.map((item) => <option value={item.business_slug} key={item.id}>{item.business_slug}</option>)}
            </select>
          )}
          <button className={activeTab === "dashboard" ? "active" : ""} onClick={() => setActiveTab("dashboard")}>Dashboard</button>
          <button className={activeTab === "bookings" ? "active" : ""} onClick={() => setActiveTab("bookings")}>{isClientToursTravel ? "Reservations" : "Bookings / Requests"}</button>
          {capabilities.customers && <button className={activeTab === "customers" ? "active" : ""} onClick={() => setActiveTab("customers")}>{isClientToursTravel ? "Guests / Customers" : "Customers"}</button>}
          {capabilities.services && <button className={activeTab === "services" ? "active" : ""} onClick={() => setActiveTab("services")}>{isClientToursTravel ? "Tour Packages" : "Services"}</button>}
          {capabilities.schedule && <button className={activeTab === "schedule" ? "active" : ""} onClick={() => setActiveTab("schedule")}>{isClientToursTravel ? "Availability" : "Schedule"}</button>}
          {capabilities.reservationCalendar && <button className={activeTab === "reservationCalendar" ? "active" : ""} onClick={() => setActiveTab("reservationCalendar")}><CalendarDays size={16} /> Reservation Calendar</button>}
          {capabilities.blockedDates && <button className={activeTab === "blockedDates" ? "active" : ""} onClick={() => setActiveTab("blockedDates")}>Blocked Dates</button>}
          {capabilities.paymentVerification && <button className={activeTab === "paymentSettings" ? "active" : ""} onClick={() => setActiveTab("paymentSettings")}>Payment Settings</button>}
          <button className={activeTab === "account" ? "active" : ""} onClick={() => setActiveTab("account")}>Account</button>
          <button onClick={logoutClient}>Logout</button>
        </aside>

        <section className="clientDashboardContent">
          {statusMessage && <div className="setupSaveStatus online setupInlineStatus">{statusMessage}</div>}

          {activeTab === "dashboard" && (
            <>
              <div className="clientDashboardHeader">
                <p className="eyebrow">Welcome back</p>
                <h2>{clientBusiness?.business}</h2>
                <p>{clientBusiness?.bookingMode === "inquiry" ? "Review new inquiries and customer messages." : "Review bookings and keep appointment statuses updated."}</p>
                <span className="clientPackageBadge">{packageOptions.find((item) => item.value === capabilities.packageKey)?.label || "Starter"} package</span>
              </div>
              <div className="clientMetricGrid">
                <article><span>Today</span><strong>{todayCount}</strong></article>
                <article><span>Pending</span><strong>{pendingCount}</strong></article>
                <article><span>Confirmed</span><strong>{confirmedCount}</strong></article>
                <article><span>Total</span><strong>{clientBookings.length}</strong></article>
                {capabilities.enhancedStats && <article><span>Completed</span><strong>{completedCount}</strong></article>}
                {capabilities.enhancedStats && <article><span>Cancelled</span><strong>{cancelledCount}</strong></article>}
                {capabilities.paymentVerification && <article><span>Pending Payment Verification</span><strong>{pendingPaymentCount}</strong></article>}
                {capabilities.paymentVerification && <article><span>Verified Payments</span><strong>{verifiedPaymentCount}</strong></article>}
              </div>
              <BookingList bookings={clientBookings.slice(0, 6)} onSelect={setSelectedBooking} onStatusChange={updateStatus} />
            </>
          )}

          {activeTab === "bookings" && (
            <>
              <div className="clientDashboardHeader">
                <p className="eyebrow">Bookings / Requests</p>
                <h2>Customer activity</h2>
              </div>
              <div className="clientFilterRow">
                {["All", "Pending", "Confirmed", "Completed", "Cancelled"].map((item) => (
                  <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>
                ))}
              </div>
              <BookingList bookings={filteredBookings} onSelect={setSelectedBooking} onStatusChange={updateStatus} />
            </>
          )}

          {activeTab === "customers" && capabilities.customers && (
            <section>
              <div className="clientDashboardHeader">
                <p className="eyebrow">Customers</p>
                <h2>Customer list</h2>
              </div>
              <div className="clientSimpleGrid">
                {customers.length ? customers.map((customer) => (
                  <article className="clientAccountPanel" key={`${customer.customer}-${customer.contact}`}>
                    <h3>{customer.customer}</h3>
                    <p><strong>Contact:</strong> {customer.contact}</p>
                    <p><strong>Latest service:</strong> {customer.latestService}</p>
                    <p><strong>Latest date:</strong> {customer.latestDate || "No date"}</p>
                    {capabilities.customerHistory && (
                      <div className="clientHistoryList">
                        <strong>{customer.history.length} total bookings</strong>
                        {customer.history.slice(0, 5).map((item) => (
                          <small key={item.id}>{item.service} / {item.booking_date || "No date"} / {item.status}</small>
                        ))}
                      </div>
                    )}
                  </article>
                )) : <div className="clientEmptyState">No customers yet.</div>}
              </div>
            </section>
          )}

          {activeTab === "services" && capabilities.services && (
            <section>
              <div className="clientDashboardHeader">
                <p className="eyebrow">Services</p>
                <h2>{isClientToursTravel ? "Manage tour packages" : "Manage services"}</h2>
              </div>
              <form onSubmit={submitStructuredServices}>
                <StructuredServiceManager services={clientServiceEntries} onChange={setClientServiceEntries} onDeleteService={deleteStructuredService} bookingTemplate={clientBusiness?.bookingTemplate} compact />
                <button className="clientPrimaryButton" type="submit">Save Services</button>
              </form>
            </section>
          )}

          {activeTab === "schedule" && capabilities.schedule && (
            <section>
              <div className="clientDashboardHeader">
                <p className="eyebrow">Schedule</p>
                <h2>Weekly availability</h2>
              </div>
              <form className="clientManagementForm" onSubmit={submitAvailability}>
                <input value={availabilityForm.days} onChange={(event) => setAvailabilityForm((current) => ({ ...current, days: event.target.value }))} placeholder="Open days" required />
                <input value={availabilityForm.hours} onChange={(event) => setAvailabilityForm((current) => ({ ...current, hours: event.target.value }))} placeholder="Open hours" required />
                <input value={availabilityForm.slotsText} onChange={(event) => setAvailabilityForm((current) => ({ ...current, slotsText: event.target.value }))} placeholder="Time slots, comma-separated" required />
                <button type="submit">Save schedule</button>
              </form>
            </section>
          )}

          {activeTab === "reservationCalendar" && capabilities.reservationCalendar && (
            <ReservationCalendar
              bookings={clientBookings}
              blockedDates={blockedDates}
              business={clientBusiness}
              monthDate={calendarMonth}
              selectedDate={selectedCalendarDate}
              statusFilter={calendarFilter}
              onMonthChange={setCalendarMonth}
              onDateSelect={setSelectedCalendarDate}
              onFilterChange={setCalendarFilter}
              onSelectBooking={setSelectedBooking}
              onStatusChange={updateStatus}
            />
          )}

          {activeTab === "blockedDates" && capabilities.blockedDates && (
            <section>
              <div className="clientDashboardHeader">
                <p className="eyebrow">Blocked Dates</p>
                <h2>Days off</h2>
              </div>
              <form className="clientManagementForm" onSubmit={submitBlockedDate}>
                <input type="date" value={blockedDateForm.blockedDate} onChange={(event) => setBlockedDateForm((current) => ({ ...current, blockedDate: event.target.value }))} required />
                <input value={blockedDateForm.reason} onChange={(event) => setBlockedDateForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Reason" />
                <button type="submit">Block date</button>
              </form>
              <div className="clientBookingList">
                {blockedDates.length ? blockedDates.map((blockedDate) => (
                  <article className="clientBookingCard" key={blockedDate.id}>
                    <div>
                      <strong>{blockedDate.blocked_date}</strong>
                      <span>{blockedDate.reason || "Unavailable"}</span>
                    </div>
                    <p>Customers cannot book this date.</p>
                    <div className="clientBookingActions">
                      <button onClick={() => removeBlockedDate(blockedDate)}>Remove</button>
                    </div>
                  </article>
                )) : <div className="clientEmptyState">No blocked dates.</div>}
              </div>
            </section>
          )}

          {activeTab === "paymentSettings" && capabilities.paymentVerification && (
            <section>
              <div className="clientDashboardHeader">
                <p className="eyebrow">Payment Settings</p>
                <h2>Manual payment verification</h2>
                <p>Customers submit payment details only. You still verify money manually in your actual payment account.</p>
              </div>
              <form className="clientManagementForm paymentSettingsForm" onSubmit={submitPaymentSettings}>
                <label><input type="checkbox" checked={Boolean(paymentSettings.enabled)} onChange={(event) => setPaymentSettings((current) => ({ ...current, enabled: event.target.checked }))} /> Enable Manual Payment Verification</label>
                <select value={normalizePaymentRequirement(paymentSettings.requirement_type)} onChange={(event) => setPaymentSettings((current) => ({ ...current, requirement_type: event.target.value }))}>
                  <option value="NO_PAYMENT_REQUIRED">No Payment Required</option>
                  <option value="DEPOSIT_REQUIRED">Reservation Deposit Required</option>
                  <option value="FULL_PAYMENT_REQUIRED">Full Payment Required</option>
                </select>
                <select value={paymentSettings.deposit_type || "FIXED_AMOUNT"} onChange={(event) => setPaymentSettings((current) => ({ ...current, deposit_type: event.target.value }))}>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                  <option value="PERCENTAGE">Percentage</option>
                </select>
                <input type="number" min="0" value={paymentSettings.deposit_value || 0} onChange={(event) => setPaymentSettings((current) => ({ ...current, deposit_value: event.target.value }))} placeholder="Deposit value" />
                <button type="submit">Save Payment Settings</button>
              </form>
              <form className="clientManagementForm" onSubmit={submitPaymentMethod}>
                <select value={paymentMethodForm.method_type} onChange={(event) => setPaymentMethodForm((current) => ({ ...current, method_type: event.target.value, method_name: event.target.options[event.target.selectedIndex].text }))}>
                  <option value="GCASH">GCash</option>
                  <option value="MAYA">Maya</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
                <input value={paymentMethodForm.method_name} onChange={(event) => setPaymentMethodForm((current) => ({ ...current, method_name: event.target.value }))} placeholder="Method name" required />
                <input value={paymentMethodForm.account_name} onChange={(event) => setPaymentMethodForm((current) => ({ ...current, account_name: event.target.value }))} placeholder="Account name" required />
                <input value={paymentMethodForm.account_number} onChange={(event) => setPaymentMethodForm((current) => ({ ...current, account_number: event.target.value }))} placeholder="Account number" required />
                <input value={paymentMethodForm.instructions} onChange={(event) => setPaymentMethodForm((current) => ({ ...current, instructions: event.target.value }))} placeholder="Optional instructions" />
                <select value={paymentMethodForm.active ? "Active" : "Inactive"} onChange={(event) => setPaymentMethodForm((current) => ({ ...current, active: event.target.value === "Active" }))}>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
                <button type="submit">{paymentMethodForm.id ? "Save Method" : "Add Method"}</button>
              </form>
              <div className="clientBookingList">
                {paymentMethods.length ? paymentMethods.map((method) => (
                  <article className="clientBookingCard" key={method.id}>
                    <div>
                      <strong>{method.method_name || method.method_type}</strong>
                      <span>{method.account_name} / {maskAccountNumber(method.account_number)}</span>
                      <small>{method.active ? "Active" : "Inactive"}</small>
                    </div>
                    <p>{method.instructions || "No special instructions"}</p>
                    <div className="clientBookingActions">
                      <button onClick={() => setPaymentMethodForm(method)}>Edit</button>
                    </div>
                  </article>
                )) : <div className="clientEmptyState">No payment methods yet.</div>}
              </div>
            </section>
          )}

          {activeTab === "account" && (
            <section className="clientAccountPanel">
              <p className="eyebrow">Account</p>
              <h2>{clientBusiness?.business}</h2>
              <p><strong>Email:</strong> {clientSession?.user?.email}</p>
              <p><strong>Role:</strong> {currentRole}</p>
              <p><strong>Package:</strong> {packageOptions.find((item) => item.value === capabilities.packageKey)?.label || "Starter"}</p>
              <p><strong>Public URL:</strong> {window.location.origin}/{clientBusiness?.slug}</p>
              <button className="clientPrimaryButton" onClick={logoutClient}>Logout</button>
            </section>
          )}

          {selectedBooking && (
            <section className="clientBookingDetails">
              <div>
                <p className="eyebrow">Booking details</p>
                <h2>{selectedBooking.customer}</h2>
              </div>
              <p><strong>Phone:</strong> {selectedBooking.contact}</p>
              <p><strong>{isClientToursTravel ? "Tour Package" : "Service"}:</strong> {selectedBooking.service}</p>
              <p><strong>{isClientToursTravel ? "Travel Date" : "Date"}:</strong> {selectedBooking.booking_date || "Not required"}</p>
              <p><strong>{isClientToursTravel ? "Preferred Time" : "Time"}:</strong> {selectedBooking.slot || "Inquiry only"}</p>
              {isClientToursTravel && <p><strong>Guest Count:</strong> {selectedBooking.metadata?.guest_count || "Not provided"}</p>}
              {isClientToursTravel && <p><strong>Pricing Type:</strong> {selectedBooking.metadata?.pricing_type || "Not saved"}</p>}
              {isClientToursTravel && selectedBooking.metadata?.unit_price !== undefined && <p><strong>Rate:</strong> {formatPeso(selectedBooking.metadata.unit_price)}</p>}
              {isClientToursTravel && selectedBooking.metadata?.selected_tier && <p><strong>Selected Group Rate:</strong> {selectedBooking.metadata.selected_tier.minGuests}-{selectedBooking.metadata.selected_tier.maxGuests} pax - {formatPeso(selectedBooking.metadata.selected_tier.price)}</p>}
              {isClientToursTravel && <p><strong>Estimated Total:</strong> {selectedBooking.metadata?.estimated_total ? formatPeso(selectedBooking.metadata.estimated_total) : "Rate only"}</p>}
              {isClientToursTravel && selectedBooking.metadata?.pickup_location && <p><strong>Pickup Location:</strong> {selectedBooking.metadata.pickup_location}</p>}
              <p><strong>{isClientToursTravel ? "Special Requests" : "Notes"}:</strong> {selectedBooking.note || "No notes"}</p>
              {capabilities.paymentVerification && (
                <div className="paymentDashboardPanel">
                  <p className="eyebrow">Payment</p>
                  {latestSelectedPayment ? (
                    <>
                      <p><strong>Status:</strong> {latestSelectedPayment.payment_status}</p>
                      <p><strong>Method:</strong> {latestSelectedPayment.payment_method}</p>
                      <p><strong>Amount Sent:</strong> {formatPeso(latestSelectedPayment.amount_submitted)}</p>
                      <p><strong>Reference:</strong> {latestSelectedPayment.reference_number}</p>
                      <p><strong>Note:</strong> {latestSelectedPayment.customer_note || "No note"}</p>
                      {latestSelectedPayment.rejection_note && <p><strong>Rejection Note:</strong> {latestSelectedPayment.rejection_note}</p>}
                      {latestSelectedPayment.payment_status === "PENDING_VERIFICATION" && (
                        <div className="clientBookingActions">
                          <button onClick={() => updatePaymentVerification(latestSelectedPayment, "verify")}>Verify Payment</button>
                          <button onClick={() => updatePaymentVerification(latestSelectedPayment, "reject")}>Reject Payment</button>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>No payment details submitted yet.</p>
                  )}
                </div>
              )}
              <label>Status
                <select value={(selectedBooking.status || "PENDING").toUpperCase()} onChange={(event) => updateStatus(selectedBooking, event.target.value)}>
                  {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <button onClick={() => setSelectedBooking(null)}>Close</button>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}

function ReservationCalendar({
  bookings,
  blockedDates,
  business,
  monthDate,
  selectedDate,
  statusFilter,
  onMonthChange,
  onDateSelect,
  onFilterChange,
  onSelectBooking,
  onStatusChange,
}) {
  const isToursTravel = normalizeBookingTemplate(business?.bookingTemplate) === "TOURS_TRAVEL";
  const monthKey = getMonthKey(monthDate);
  const monthDays = buildMonthDays(monthDate);
  const serviceOptions = [...new Set((bookings || []).map((booking) => booking.service).filter(Boolean))];
  const statusOptions = ["All", "Pending", "Confirmed", "Completed", "Cancelled", ...serviceOptions];
  const visibleBookings = (bookings || []).filter((booking) => {
    if (!(booking.booking_date || "").startsWith(monthKey)) return false;
    const statusMatch = ["All", "Pending", "Confirmed", "Completed", "Cancelled"].includes(statusFilter)
      ? statusFilter === "All" || (booking.status || "").toUpperCase() === statusFilter.toUpperCase()
      : booking.service === statusFilter;
    return statusMatch;
  });
  const bookingsByDate = visibleBookings.reduce((grouped, booking) => {
    const key = booking.booking_date;
    if (!key) return grouped;
    grouped[key] = grouped[key] || [];
    grouped[key].push(booking);
    return grouped;
  }, {});
  const blockedByDate = (blockedDates || []).reduce((grouped, blockedDate) => {
    if (!blockedDate.blocked_date) return grouped;
    grouped[blockedDate.blocked_date] = blockedDate;
    return grouped;
  }, {});
  const selectedBookings = bookingsByDate[selectedDate] || [];
  const selectedBlocked = blockedByDate[selectedDate];
  const monthCounts = {
    total: visibleBookings.length,
    pending: visibleBookings.filter((booking) => ["PENDING", "NEW"].includes((booking.status || "").toUpperCase())).length,
    confirmed: visibleBookings.filter((booking) => (booking.status || "").toUpperCase() === "CONFIRMED").length,
    completed: visibleBookings.filter((booking) => (booking.status || "").toUpperCase() === "COMPLETED").length,
    cancelled: visibleBookings.filter((booking) => (booking.status || "").toUpperCase() === "CANCELLED").length,
  };
  const monthTitle = monthDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const moveMonth = (amount) => {
    const next = new Date(monthDate);
    next.setMonth(next.getMonth() + amount);
    onMonthChange(next);
    onDateSelect(getDateKey(new Date(next.getFullYear(), next.getMonth(), 1)));
  };
  const today = () => {
    const now = new Date();
    onMonthChange(now);
    onDateSelect(getTodayDateValue());
  };
  const reservationLabel = isToursTravel ? "Reservations" : "Bookings";
  const guestText = (booking) => {
    const guests = booking.metadata?.guest_count;
    return guests ? `${guests} Guest${Number(guests) > 1 ? "s" : ""}` : "";
  };

  return (
    <section className="reservationCalendarPanel">
      <div className="clientDashboardHeader calendarHeader">
        <div>
          <p className="eyebrow">Reservation Calendar</p>
          <h2>{monthTitle}</h2>
          <p>{isToursTravel ? "View tour reservations by travel date." : "View bookings by selected date."}</p>
        </div>
        <div className="calendarControls">
          <button type="button" onClick={() => moveMonth(-1)}><ChevronLeft size={16} /> Previous</button>
          <button type="button" onClick={today}>Today</button>
          <button type="button" onClick={() => moveMonth(1)}>Next <ChevronRight size={16} /></button>
        </div>
      </div>
      <div className="clientMetricGrid calendarMetricGrid">
        <article><span>This Month</span><strong>{monthCounts.total}</strong></article>
        <article><span>Pending</span><strong>{monthCounts.pending}</strong></article>
        <article><span>Confirmed</span><strong>{monthCounts.confirmed}</strong></article>
        <article><span>Completed</span><strong>{monthCounts.completed}</strong></article>
        <article><span>Cancelled</span><strong>{monthCounts.cancelled}</strong></article>
      </div>
      <div className="clientFilterRow">
        {statusOptions.map((item) => (
          <button className={statusFilter === item ? "active" : ""} onClick={() => onFilterChange(item)} key={item}>{item}</button>
        ))}
      </div>
      <div className="reservationCalendarGrid">
        {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => <strong className="calendarDayName" key={day}>{day}</strong>)}
        {monthDays.map((day) => {
          const dayBookings = bookingsByDate[day.key] || [];
          const blocked = blockedByDate[day.key];
          return (
            <button type="button" className={`calendarDateCell ${day.inMonth ? "" : "muted"} ${selectedDate === day.key ? "active" : ""}`} key={day.key} onClick={() => onDateSelect(day.key)}>
              <span>{day.day}</span>
              {blocked && <em className="calendarBlocked">Blocked</em>}
              {dayBookings.slice(0, 2).map((booking) => (
                <i className={`calendarBookingDot ${getStatusClass(booking.status)}`} key={booking.id} onClick={(event) => { event.stopPropagation(); onSelectBooking(booking); }}>
                  <b>{booking.service}</b>
                  <small>{getInitialsName(booking.customer)}{guestText(booking) ? ` • ${guestText(booking)}` : ""}</small>
                  <small>{(booking.status || "PENDING").toUpperCase()}</small>
                </i>
              ))}
              {dayBookings.length > 2 && <small className="calendarMore">+{dayBookings.length - 2} more</small>}
            </button>
          );
        })}
      </div>
      <div className="reservationAgenda">
        <div className="clientDashboardHeader">
          <p className="eyebrow">{reservationLabel} for {formatBookingDate(selectedDate)}</p>
          <h2>{selectedBookings.length} {reservationLabel}</h2>
          {selectedBlocked && <p><strong>Blocked:</strong> {selectedBlocked.reason || "Unavailable"}</p>}
        </div>
        <div className="clientBookingList">
          {selectedBookings.length ? selectedBookings.map((booking) => (
            <article className="clientBookingCard" key={booking.id}>
              <div>
                <strong>{booking.service}</strong>
                <span>{booking.customer}{guestText(booking) ? ` • ${guestText(booking)}` : ""}</span>
                <small>{booking.slot || "No preferred time"} / {(booking.status || "PENDING").toUpperCase()}</small>
              </div>
              <p>{booking.note || "No notes provided"}</p>
              <div className="clientBookingActions">
                <select value={(booking.status || "PENDING").toUpperCase()} onChange={(event) => onStatusChange(booking, event.target.value)}>
                  {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((item) => <option key={item}>{item}</option>)}
                </select>
                <button onClick={() => onSelectBooking(booking)}>View Details</button>
              </div>
            </article>
          )) : <div className="clientEmptyState"><strong>No reservations on this date.</strong><span>New bookings will appear here automatically.</span></div>}
        </div>
      </div>
    </section>
  );
}

function BookingList({ bookings, onSelect, onStatusChange }) {
  if (!bookings.length) return <div className="clientEmptyState"><strong>No bookings yet.</strong><span>New bookings will appear here when customers submit through your booking page.</span></div>;
  return (
    <div className="clientBookingList">
      {bookings.map((booking) => (
        <article className="clientBookingCard" key={booking.id}>
          <div>
            <strong>{booking.customer}</strong>
            <span>{booking.service}</span>
            <small>{booking.booking_date || "No date required"} / {booking.slot || "Inquiry only"}</small>
            <em>{booking.contact}</em>
          </div>
          <p>{booking.note || "No notes provided"}</p>
          <div className="clientBookingActions">
            <span className={`clientStatusPill ${getStatusClass(booking.status)}`}>{(booking.status || "PENDING").toUpperCase()}</span>
            <select value={(booking.status || "PENDING").toUpperCase()} onChange={(event) => onStatusChange(booking, event.target.value)}>
              {["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <button onClick={() => onSelect(booking)}>View Details</button>
          </div>
        </article>
      ))}
    </div>
  );
}

function Plan({ name, price, note, items, featured, onChoose }) {
  return (
    <article className={featured ? "plan featured" : "plan"}>
      <span className="planName">{name}</span>
      <strong>{price}</strong>
      <p>{note}</p>
      {items.map((item) => (
        <div className="planItem" key={item}><Check size={16} /> {item}</div>
      ))}
      <a href="#signup" onClick={onChoose}>{featured ? "Choose monthly" : "Select plan"}</a>
    </article>
  );
}

createRoot(document.getElementById("root")).render(<App />);

