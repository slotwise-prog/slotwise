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

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const databaseMode = supabaseUrl && supabaseAnonKey ? "Online database" : "Local demo storage";
const clientStatuses = ["DEMO", "UNPAID", "ACTIVE", "SUSPENDED"];

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

function normalizeDatabaseBusiness(row, serviceRows = [], availabilityRow = null) {
  return {
    slug: row.slug,
    name: row.industry || row.business_type || "Service business",
    business: row.business,
    link: row.booking_link || `slotwise.app/book/${row.slug}`,
    logo: row.logo_url || "",
    primaryColor: row.primary_color || "#bd5d6d",
    accentColor: row.accent_color || "#f6dfe3",
    phone: row.phone || "",
    messengerLink: row.messenger_link || "",
    address: row.address || "",
    description: row.description || "",
    businessType: row.business_type || row.industry || "Service business",
    bookingMode: row.booking_mode || "booking",
    status: (row.status || "ACTIVE").toUpperCase(),
    featureFlags: row.feature_flags || {},
    availability: {
      days: availabilityRow?.open_days || defaultAvailability.days,
      hours: availabilityRow?.open_hours || defaultAvailability.hours,
      slots: Array.isArray(availabilityRow?.slots) ? availabilityRow.slots : slots,
    },
    cover: row.cover_url || "",
    serviceDetails: serviceRows
      .filter((service) => service.status !== "Inactive")
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map((service) => ({
        name: service.name,
        durationMinutes: service.duration_minutes,
        price: service.price,
        description: service.description || "",
      })),
    services: serviceRows
      .filter((service) => service.status !== "Inactive")
      .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
      .map((service) => service.name),
    forms: ["Notes before the appointment"],
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
  const cover = lowerIndustry.includes("clinic") || lowerIndustry.includes("dental")
    ? "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
    : lowerIndustry.includes("travel") || lowerIndustry.includes("stay")
      ? "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
      : "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=80";

  return {
    slug,
    name: setup.industry || "Service business",
    business: setup.businessName || "Client Business",
    link: `slotwise.app/book/${slug}`,
    logo: "",
    primaryColor: "#bd5d6d",
    accentColor: "#f6dfe3",
    phone: setup.contact || "",
    messengerLink: setup.facebookPage || "",
    address: "",
    description: setup.rules || "Book online in less than a minute. Choose a service, pick a time, and get confirmation.",
    businessType: setup.industry || "Service business",
    bookingMode: "booking",
    status: (setup.status || "DEMO").toUpperCase(),
    featureFlags: { ...defaultFeatureFlags },
    availability: {
      days: setup.openDays || defaultAvailability.days,
      hours: setup.openHours || defaultAvailability.hours,
      slots,
    },
    cover,
    serviceDetails: parseServiceDetails(setup.services),
    services: parseSetupServices(setup.services),
    forms: (setup.questions || "Notes before the appointment")
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 3),
  };
}

function normalizeBusinessConfig(business) {
  return {
    ...business,
    logo: business.logo || "",
    primaryColor: business.primaryColor || "#bd5d6d",
    accentColor: business.accentColor || "#f6dfe3",
    phone: business.phone || "",
    messengerLink: business.messengerLink || "",
    address: business.address || "",
    description: business.description || "Book online in less than a minute. Choose a service, pick a time, and get confirmation without creating an account.",
    businessType: business.businessType || business.name || "Service business",
    bookingMode: business.bookingMode || "booking",
    status: (business.status || "ACTIVE").toUpperCase(),
    featureFlags: { ...defaultFeatureFlags, ...(business.featureFlags || {}) },
    availability: { ...defaultAvailability, ...(business.availability || {}) },
    services: business.services || [],
    serviceDetails: business.serviceDetails || [],
    forms: business.forms?.length ? business.forms : ["Notes before the appointment"],
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
      };

      details.forEach((detail) => {
        const priceMatch = detail.match(/(?:php|p)\s*([\d,.]+)/i);
        const durationMatch = detail.match(/(\d+)\s*(?:min|mins|minute|minutes)/i);
        if (priceMatch) service.price = Number(priceMatch[1].replace(/,/g, ""));
        if (durationMatch) service.durationMinutes = Number(durationMatch[1]);
        if (!priceMatch && !durationMatch) {
          service.description = service.description ? `${service.description}. ${detail}` : detail;
        }
      });

      return service;
    });

  return parsed.length > 0 ? parsed : [
    { name: "Consultation", description: "", price: null, durationMinutes: 30, displayOrder: 0, status: "Active" },
  ];
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
    feature_flags: { ...defaultFeatureFlags, ...(setup.featureFlags || {}) },
    status: (setup.status || "DEMO").toUpperCase(),
  };
}

function setupToServiceRows(setup, slug, requestId) {
  return parseServiceDetails(setup.services).map((service, index) => ({
    id: `${requestId}-SVC-${index + 1}`,
    business_slug: slug,
    name: service.name,
    duration_minutes: service.durationMinutes,
    price: service.price,
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
      const next = normalizeBusinessConfig({
        ...previous,
        ...business,
        services: business.services?.length ? business.services : previous.services,
        serviceDetails: business.serviceDetails?.length ? business.serviceDetails : previous.serviceDetails,
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
    const [onlineBusinesses, onlineServices, onlineAvailability] = await Promise.all([
      supabaseRequest("businesses", { query: businessQuery }),
      supabaseRequest("business_services", { query: serviceQuery }),
      supabaseRequest("business_availability", { query: availabilityQuery }),
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
    const normalized = (onlineBusinesses || []).map((business) => (
      normalizeBusinessConfig(normalizeDatabaseBusiness(
        business,
        servicesByBusiness[business.slug] || [],
        availabilityByBusiness[business.slug]
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
    const isSmmAdminPath = window.location.pathname.replace(/^\/+|\/+$/g, "") === "smm-admin";
    if (isSmmAdminPath) {
      setPage("smmAdmin");
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
      await supabaseRequest("business_services", {
        method: "DELETE",
        query: `?business_slug=eq.${encodeURIComponent(originalSlug)}`,
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

    await supabaseRequest("business_services", {
      method: "POST",
      body: setupToServiceRows(nextClient, slug, requestId),
      accessToken,
    });
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
    return <BookingPrototype business={selectedBusiness} onBack={() => setPage("home")} onSaveBooking={saveBooking} />;
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
      <BookingPrototype business={publicBusiness} onBack={() => setPage("home")} onSaveBooking={saveBooking} />
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

function BookingPrototype({ business, onBack, onSaveBooking }) {
  const [pickedService, setPickedService] = useState(business.services[0]);
  const availableSlots = business.availability?.slots?.length ? business.availability.slots : slots;
  const [pickedSlot, setPickedSlot] = useState(availableSlots[1] || availableSlots[0] || "10:15 AM");
  const [confirmed, setConfirmed] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const flags = { ...defaultFeatureFlags, ...(business.featureFlags || {}) };
  const clientStatus = (business.status || "ACTIVE").toUpperCase();
  const isProductionActive = clientStatus === "ACTIVE";
  const isDemoPreview = clientStatus === "DEMO";
  const isAwaitingActivation = clientStatus === "UNPAID";
  const isClinic = (business.name || "").toLowerCase().includes("clinic") || (business.name || "").toLowerCase().includes("dental");
  const isTravel = (business.name || "").toLowerCase().includes("travel") || (business.name || "").toLowerCase().includes("stay");
  const bookingTone = isClinic ? "clinic" : isTravel ? "travel" : "beauty";
  const brandInitial = (business.business || "S").trim().charAt(0).toUpperCase();
  const brandCategory = isClinic ? "Care & Wellness" : isTravel ? "Stay & Travel" : "Beauty & Wellness";
  const brandLine = isClinic
    ? ["Your visit, booked with care.", "Private details. Clear schedule."]
    : isTravel
      ? ["Reserve your date.", "Plan your visit with ease."]
      : ["Enhance your glow.", "Reveal your best self."];
  const getServiceDetail = (serviceName) => {
    const detail = business.serviceDetails?.find((item) => item.name === serviceName);
    return {
      durationMinutes: detail?.durationMinutes || 60,
      price: detail?.price ?? 350,
    };
  };

  useEffect(() => {
    setPickedService(business.services[0]);
    setPickedSlot(availableSlots[1] || availableSlots[0] || "10:15 AM");
    setConfirmed(null);
    setBookingError("");
  }, [business.slug]);

  const submitBooking = async (event) => {
    event.preventDefault();
    const bookingForm = event.currentTarget;
    setBookingError("");
    const data = new FormData(bookingForm);
    const booking = {
      customer: data.get("customer"),
      contact: data.get("contact"),
      business: business.business,
      businessSlug: business.slug,
      business_slug: business.slug,
      service: pickedService,
      booking_date: "2026-05-21",
      slot: flags.requireTime ? pickedSlot : "Inquiry only",
      note: data.get("note"),
      status: isProductionActive ? "Confirmed" : `${clientStatus} preview`,
    };
    if (!booking.customer || !booking.contact || !booking.business_slug || !booking.service || !booking.slot) {
      setBookingError("Please complete the required booking details before submitting.");
      return;
    }
    try {
      if (isProductionActive) {
        await onSaveBooking(booking);
      }
      setConfirmed(booking);
      bookingForm.reset();
    } catch (error) {
      setBookingError(error.message || "Booking could not be saved. Please try again.");
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
        <aside className="premiumBrandPanel" style={{ backgroundImage: `linear-gradient(180deg, rgba(54, 35, 30, 0.2), rgba(54, 35, 30, 0.76)), url(${business.cover})` }}>
          <div className="brandMark">{brandInitial}</div>
          <div className="brandStory">
            <span>{brandCategory}</span>
            <h1>{business.business}</h1>
            <i />
            <p>{brandLine[0]}<br />{brandLine[1]}</p>
          </div>
          <div className="bookingTrustCard">
            <div><CalendarDays size={22} /><span><strong>Easy online booking</strong><small>Book in less than a minute</small></span></div>
            <div><Check size={22} /><span><strong>Instant confirmation</strong><small>We'll confirm your appointment</small></span></div>
            <div><Sparkles size={22} /><span><strong>Simple and private</strong><small>Your details stay organized</small></span></div>
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
              <h2>{flags.bookingEnabled ? "Book an appointment" : "Send an inquiry"}</h2>
              <p>{business.description}</p>
            </div>
            <span><Sparkles size={22} /></span>
          </div>

          {flags.bookingEnabled && (
          <div className="bookingStep">
            <div className="bookingStepTitle"><span>1</span><strong>Choose a service</strong></div>
            <div className="premiumServiceGrid">
              {business.services.map((item) => (
                <button type="button" key={item} className={pickedService === item ? "premiumService active" : "premiumService"} onClick={() => setPickedService(item)}>
                  <span className="serviceIcon"><Sparkles size={22} /></span>
                  <strong>{item}</strong>
                  {flags.showPrices && <small>{getServiceDetail(item).durationMinutes} min • PHP {getServiceDetail(item).price}</small>}
                  {pickedService === item && <em><Check size={16} /></em>}
                </button>
              ))}
            </div>
          </div>
          )}

          {flags.requireTime && (
          <div className="bookingStep">
            <div className="bookingStepTitle"><span>2</span><strong>Pick a time</strong></div>
            <div className="timeAndDate">
              <div className="premiumSlotGrid">
                {availableSlots.map((item) => (
                  <button type="button" key={item} className={pickedSlot === item ? "premiumSlot active" : "premiumSlot"} onClick={() => setPickedSlot(item)}>{item}</button>
                ))}
              </div>
              <div className="selectedDateCard">
                <CalendarDays size={26} />
                <span>Selected</span>
                <strong>May 21, 2026</strong>
                <small>Thursday</small>
              </div>
            </div>
          </div>
          )}

          <div className="bookingStep">
            <div className="bookingStepTitle"><span>3</span><strong>Your details</strong></div>
            <label className="premiumInput"><User size={20} /><span>Your name<input name="customer" required placeholder="Maria Santos" /></span></label>
            <label className="premiumInput"><Phone size={20} /><span>Contact number<input name="contact" required placeholder="0912 345 6789" /></span></label>
            <label className="premiumInput"><FileText size={20} /><span>{business.forms[0]} / notes<textarea name="note" placeholder={business.forms.join(", ")} rows="2" /></span></label>
          </div>

          <button className="premiumConfirmButton" type="submit">{flags.bookingEnabled ? "Confirm booking" : "Send inquiry"} <ChevronRight size={22} /></button>
          {bookingError && <p className="formError premiumError">{bookingError}</p>}
          {confirmed && (
            <p className="formSuccess premiumSuccess">
              {isProductionActive
                ? `Booking confirmed for ${confirmed.customer} at ${confirmed.slot}. A confirmation has been recorded.`
                : `Preview completed for ${confirmed.customer}. This was not saved as a live production booking.`}
            </p>
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
      </section>
    </main>
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
    services: "Hair color - PHP 350 - 60 minutes\nHair treatment - PHP 250 - 45 minutes",
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
              <p>Add each service with price and duration. One service per line is perfect.</p>
              <label>Service list<textarea name="services" value={form.services} onChange={updateForm} rows="8" /></label>
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
                <article><span>Services</span><strong>{form.services.split("\n").filter(Boolean).length} services listed</strong><em>Ready for page setup</em></article>
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
    bookingMode: "booking",
    contact: "",
    facebookPage: "",
    address: "",
    rules: "Book online in less than a minute. Choose a service, pick a time, and get confirmation.",
    logo: "",
    primaryColor: "#bd5d6d",
    accentColor: "#f6dfe3",
    services: "Consultation - PHP 350 - 60 minutes",
    openDays: "Monday to Saturday",
    openHours: "9:00 AM to 6:00 PM",
    slotsText: slots.join(", "),
    featureFlags: { ...defaultFeatureFlags },
  };
}

function businessToAdminClient(business) {
  const serviceText = business.serviceDetails?.length
    ? business.serviceDetails.map((service) => `${service.name} - PHP ${service.price ?? 0} - ${service.durationMinutes || 60} minutes`).join("\n")
    : (business.services || []).map((service) => `${service} - PHP 350 - 60 minutes`).join("\n");

  return {
    businessName: business.business || "",
    slug: business.slug || "",
    industry: business.businessType || business.name || "Service business",
    status: business.status || "DEMO",
    bookingMode: business.bookingMode || "booking",
    contact: business.phone || "",
    facebookPage: business.messengerLink || "",
    address: business.address || "",
    rules: business.description || "",
    logo: business.logo || "",
    primaryColor: business.primaryColor || "#bd5d6d",
    accentColor: business.accentColor || "#f6dfe3",
    services: serviceText,
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
  const [statusMessage, setStatusMessage] = useState("");
  const [saving, setSaving] = useState(false);

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
    setMode("form");
    setStatusMessage("");
  };

  const startEdit = (business) => {
    setEditingSlug(business.slug);
    setForm(businessToAdminClient(business));
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
      return next;
    });
  };

  const submitClient = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatusMessage("");
    try {
      const result = await onSaveClient(form, editingSlug, adminSession?.access_token);
      setStatusMessage(result.message);
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
          <label>Description<textarea name="rules" value={form.rules} onChange={updateForm} rows="3" /></label>
          <label>Services<textarea name="services" value={form.services} onChange={updateForm} rows="6" /></label>
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
            return (
              <article className="smmClientCard" key={business.slug}>
                <div>
                  <span className={`smmStatus ${business.status?.toLowerCase()}`}>{business.status}</span>
                  <h2>{business.business}</h2>
                  <p>{business.slug}</p>
                  <small>{business.businessType} / {business.bookingMode} / {business.services.length} services / {bookingCount} bookings</small>
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

