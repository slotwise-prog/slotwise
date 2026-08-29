import React, { useEffect, useMemo, useRef, useState } from "react";
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
  HeartPulse,
  ShieldPlus,
  Landmark,
  BadgeDollarSign,
  Scale,
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
  LayoutGrid,
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
  BedDouble,
  Building2,
  Moon,
  Shirt,
  WashingMachine,
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
  allowMultipleServices: false,
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
  { value: "PROFESSIONAL_SERVICES", label: "Consultant / Professional Services" },
  { value: "HOME_SERVICE", label: "Home Service" },
  { value: "AUTO", label: "Auto / Car Wash" },
  { value: "CAR_WASH", label: "Car Wash" },
  { value: "LAUNDRY", label: "Laundry Shop" },
  { value: "TOURS_TRAVEL", label: "Tours & Travel" },
  { value: "STAYCATION_ACCOMMODATION", label: "Staycation / Accommodation" },
];

const packageCapabilityMap = {
  STARTER: {
    services: false,
    photoManagement: false,
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
    photoManagement: true,
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
    photoManagement: true,
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
  const isStaycationAccommodation = normalizeBookingTemplate(business.bookingTemplate) === "STAYCATION_ACCOMMODATION";
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

  if (hasKeyword(serviceText, ["villa", "cabin", "house"])) return House;
  if (hasKeyword(serviceText, ["room", "suite", "bed"])) return BedDouble;
  if (hasKeyword(serviceText, ["unit", "condo", "apartment", "hotel"])) return Building2;

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
  if (hasKeyword(serviceText, ["laundry", "wash", "fold", "dry cleaning", "pickup", "pickup and delivery", "pick up and delivery"])) return WashingMachine;
  return isStaycationAccommodation ? BedDouble : isToursTravel ? MapPinned : CircleDot;
}

function resolveConsultantServiceIcon(detail = {}, business = {}) {
  const text = `${detail.imageTitle || ""} ${detail.serviceCategory || ""} ${detail.description || ""} ${business.business || ""} ${business.industry || ""} ${business.businessType || ""}`.toLowerCase();
  if (hasKeyword(text, ["hmo", "health plan", "medical", "health"])) return HeartPulse;
  if (hasKeyword(text, ["insurance"])) return ShieldPlus;
  if (hasKeyword(text, ["real estate", "property", "house", "home"])) return Building2;
  if (hasKeyword(text, ["loan", "financing", "finance", "credit"])) return BadgeDollarSign;
  if (hasKeyword(text, ["travel", "tour", "trip", "vacation"])) return Plane;
  if (hasKeyword(text, ["education", "school", "training", "course", "class"])) return GraduationCap;
  if (hasKeyword(text, ["legal", "law", "attorney", "consult"])) return Scale;
  return BriefcaseBusiness;
}

function resolveTemplateSectionIcon(bookingTemplate = "GENERAL") {
  const template = normalizeBookingTemplate(bookingTemplate);
  if (template === "BEAUTY") return Sparkles;
  if (template === "CLINIC") return Stethoscope;
  if (template === "PROFESSIONAL_SERVICES") return BriefcaseBusiness;
  if (template === "HOME_SERVICE") return Wrench;
  if (template === "AUTO") return CarFront;
  if (template === "CAR_WASH") return Droplets;
  if (template === "LAUNDRY") return WashingMachine;
  if (template === "TOURS_TRAVEL") return Plane;
  if (template === "STAYCATION_ACCOMMODATION") return BedDouble;
  return LayoutGrid;
}

function resolveBusinessTone(business = {}) {
  const businessText = `${business.business || ""} ${business.name || ""} ${business.industry || ""} ${business.businessType || ""} ${business.description || ""}`.toLowerCase();
  const template = normalizeBookingTemplate(business.bookingTemplate);
  if (template === "STAYCATION_ACCOMMODATION") return "staycation-accommodation";
  if (template === "TOURS_TRAVEL") return "tours-travel";
  if (template === "PROFESSIONAL_SERVICES") return "professional-services";
  if (template === "CAR_WASH") return "carwash";
  if (template === "LAUNDRY") return "laundry";
  if (template === "HOME_SERVICE") return "home-service";
  if (template === "AUTO") return "auto";
  if (template === "CLINIC") return "clinic";
  if (template === "BEAUTY") return "beauty";
  if (hasKeyword(businessText, ["laundry", "wash and fold", "wash & fold", "dry cleaning", "pickup and delivery", "pick up and delivery"])) return "laundry";
  if (hasKeyword(businessText, ["clinic", "dental", "dentist", "medical", "care"])) return "clinic";
  if (hasKeyword(businessText, ["travel", "stay", "hotel", "tour", "cabin"])) return "travel";
  if (hasKeyword(businessText, ["aircon", "air con", "hvac", "home", "repair", "maintenance", "plumbing", "electrical", "appliance"])) return "home-service";
  if (hasKeyword(businessText, ["car", "auto", "wash", "detailing", "motorcycle", "vehicle"])) return "auto";
  if (hasKeyword(businessText, ["salon", "beauty", "hair", "nail", "spa", "facial", "wellness"])) return "beauty";
  return "general";
}

function getToneThemeDefaults(tone) {
  if (tone === "staycation-accommodation") return { primaryColor: "#7a4f2f", accentColor: "#f8efe6", pageBackgroundColor: "#F4EFE8" };
  if (tone === "tours-travel") return { primaryColor: "#0f766e", accentColor: "#e6f7f1", pageBackgroundColor: "#F6F2E5" };
  if (tone === "professional-services") return { primaryColor: "#334155", accentColor: "#e8eef7", pageBackgroundColor: "#F4F7FB" };
  if (tone === "carwash") return { primaryColor: "#1f2937", accentColor: "#eef2f7", pageBackgroundColor: "#F3F6FA" };
  if (tone === "laundry") return { primaryColor: "#2d5b87", accentColor: "#e7f1fb", pageBackgroundColor: "#F2F7FB" };
  if (tone === "home-service") return { primaryColor: "#155e75", accentColor: "#eaf7fb", pageBackgroundColor: "#F1F5F9" };
  if (tone === "auto") return { primaryColor: "#1f2937", accentColor: "#eef2f7", pageBackgroundColor: "#F2F4F7" };
  if (tone === "clinic") return { primaryColor: "#148d84", accentColor: "#dff7f3", pageBackgroundColor: "#EEF4F8" };
  if (tone === "travel") return { primaryColor: "#b16f16", accentColor: "#fff1d3", pageBackgroundColor: "#F7F3E8" };
  if (tone === "general") return { primaryColor: "#38516f", accentColor: "#f2f6fb", pageBackgroundColor: "#F4F6F8" };
  return { primaryColor: "#bd5d6d", accentColor: "#f6dfe3", pageBackgroundColor: "#FBF3F5" };
}

function normalizeHexColor(value, fallback = "") {
  const next = String(value || "").trim();
  return /^#([0-9a-fA-F]{6})$/.test(next) ? next.toUpperCase() : fallback;
}

function getBusinessPageBackgroundStyle(business = {}, tone = "general") {
  const themeDefaults = getToneThemeDefaults(tone);
  const backgroundType = (business.pageBackgroundType || business.page_background_type || "SOLID").toUpperCase();
  const color1 = normalizeHexColor(business.pageBackgroundColor || business.page_background_color, themeDefaults.pageBackgroundColor);
  const color2 = normalizeHexColor(business.pageBackgroundColor2 || business.page_background_color_2, "");
  if (backgroundType === "GRADIENT" && color2) {
    return {
      backgroundColor: color1,
      backgroundImage: `linear-gradient(145deg, ${color1}, ${color2})`,
      backgroundRepeat: "no-repeat",
      backgroundAttachment: "fixed",
      backgroundSize: "cover",
    };
  }
  return {
    backgroundColor: color1,
    backgroundImage: "none",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    backgroundSize: "cover",
  };
}

function getTemplateFallbackCover(tone = "beauty") {
  const tones = {
    "staycation-accommodation": { title: "STAYCATION", subtitle: "Relax • Sleep • Stay", start: "#4b2f23", end: "#b7794b" },
    "tours-travel": { title: "TRAVEL", subtitle: "Explore • Discover • Go", start: "#0b525b", end: "#f59e0b" },
    "professional-services": { title: "CONSULTING", subtitle: "Plan • Guide • Deliver", start: "#0f172a", end: "#64748b" },
    carwash: { title: "CAR WASH", subtitle: "Wash • Shine • Drive", start: "#111827", end: "#60a5fa" },
    laundry: { title: "LAUNDRY", subtitle: "Wash • Dry • Fold", start: "#2d5b87", end: "#7cc4ff" },
    "home-service": { title: "HOME SERVICE", subtitle: "Repair • Clean • Fix", start: "#0f3f4f", end: "#2563eb" },
    auto: { title: "AUTO", subtitle: "Detail • Wash • Drive", start: "#111827", end: "#ea580c" },
    clinic: { title: "CLINIC", subtitle: "Care • Wellness • Visit", start: "#0f766e", end: "#7dd3fc" },
    general: { title: "BUSINESS", subtitle: "Book • Manage • Repeat", start: "#243b53", end: "#2f80ed" },
    beauty: { title: "BEAUTY", subtitle: "Glow • Style • Shine", start: "#bd5d6d", end: "#f6dfe3" },
  };
  const asset = tones[tone] || tones.beauty;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600" role="img" aria-label="${asset.title}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${asset.start}" />
          <stop offset="100%" stop-color="${asset.end}" />
        </linearGradient>
        <linearGradient id="o" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.18)" />
          <stop offset="100%" stop-color="rgba(255,255,255,0.02)" />
        </linearGradient>
      </defs>
      <rect width="1200" height="1600" fill="url(#g)" />
      <circle cx="960" cy="250" r="180" fill="rgba(255,255,255,0.12)" />
      <circle cx="220" cy="310" r="120" fill="rgba(255,255,255,0.09)" />
      <rect x="130" y="980" width="940" height="360" rx="48" fill="url(#o)" />
      <text x="100" y="210" fill="rgba(255,255,255,0.82)" font-size="70" font-family="Arial, sans-serif" letter-spacing="6">${asset.subtitle}</text>
      <text x="100" y="610" fill="#ffffff" font-size="150" font-family="Georgia, serif" font-weight="700">${asset.title}</text>
      <text x="100" y="760" fill="rgba(255,255,255,0.88)" font-size="54" font-family="Arial, sans-serif">Branded booking preview</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function isBeautyDefaultColor(value = "") {
  return ["#bd5d6d", "#f6dfe3"].includes((value || "").toLowerCase());
}

function getBusinessCoverStyle(business = {}, tone = "beauty") {
  const cover = business.cover || "";
  if (cover) {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(22, 37, 48, 0.2), rgba(22, 37, 48, 0.78)), url(${cover})`,
    };
  }
  return {
    backgroundImage: `linear-gradient(180deg, rgba(54, 35, 30, 0.2), rgba(54, 35, 30, 0.76)), url(${getTemplateFallbackCover(tone)})`,
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
const demoDurationHours = 24;

function createDemoWindow() {
  const started = new Date();
  const expires = new Date(started.getTime() + demoDurationHours * 60 * 60 * 1000);
  return {
    demo_started_at: started.toISOString(),
    demo_expires_at: expires.toISOString(),
  };
}

function formatFriendlyDateTime(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function isDemoExpired(business = {}) {
  return (business.status || "").toUpperCase() === "DEMO"
    && Boolean(business.demoExpiresAt || business.demo_expires_at)
    && Date.now() >= new Date(business.demoExpiresAt || business.demo_expires_at).getTime();
}

function getDemoExpiryState(business = {}) {
  if ((business.status || "").toUpperCase() !== "DEMO") return { state: "not-demo", label: "Not demo" };
  const expiresAt = business.demoExpiresAt || business.demo_expires_at;
  if (!expiresAt) return { state: "missing", label: "Demo Expiry Not Set" };
  if (isDemoExpired(business)) return { state: "expired", label: "Demo Expired", dateLabel: formatFriendlyDateTime(expiresAt) };
  return { state: "active", label: "Demo Active", dateLabel: formatFriendlyDateTime(expiresAt) };
}

function normalizePackage(value) {
  const nextPackage = (value || "STARTER").toUpperCase();
  return packageCapabilityMap[nextPackage] ? nextPackage : "STARTER";
}

function normalizeBookingTemplate(value) {
  const normalizedValue = (value || "GENERAL").toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  const templateAliases = {
    CONSULTANT: "PROFESSIONAL_SERVICES",
    PROFESSIONAL: "PROFESSIONAL_SERVICES",
    PROFESSIONAL_SERVICE: "PROFESSIONAL_SERVICES",
  };
  const nextTemplate = templateAliases[normalizedValue] || normalizedValue;
  return bookingTemplateOptions.some((item) => item.value === nextTemplate) ? nextTemplate : "GENERAL";
}

const bookingTemplatePublicCopy = {
  PROFESSIONAL_SERVICES: {
    category: "Plans & Services",
    tagline: ["Professional guidance.", "Simple online booking."],
    trust: [["Explore plans", "Review available plans and services"], ["Send an inquiry", "Choose what fits your needs"], ["Simple and private", "Your details stay organized"]],
  },
  BEAUTY: {
    category: "Beauty & Wellness",
    tagline: ["Enhance your glow.", "Reveal your best self."],
    trust: [["Easy online booking", "Book in less than a minute"], ["Appointment confirmation", "We'll confirm your appointment"], ["Simple and private", "Your details stay organized"]],
  },
  CLINIC: {
    category: "Care & Wellness",
    tagline: ["Quality care.", "Easy appointment booking."],
    trust: [["Easy appointment booking", "Choose your preferred schedule"], ["Visit confirmation", "The clinic will confirm your appointment"], ["Simple and private", "Your details stay organized"]],
  },
  HOME_SERVICE: {
    category: "Home Services",
    tagline: ["Reliable service.", "Book at your convenience."],
    trust: [["Easy Online Booking", "Choose your service and schedule"], ["Convenient Service Visit", "Select your preferred date and time"], ["Request Confirmation", "The business will confirm your schedule"]],
  },
  AUTO: {
    category: "Auto Services",
    tagline: ["Professional vehicle care.", "Book your service online."],
    trust: [["Easy online booking", "Choose your vehicle service"], ["Schedule confirmation", "The business will confirm your time"], ["Simple and organized", "Your service details stay together"]],
  },
  CAR_WASH: {
    category: "Auto Services",
    tagline: ["Professional vehicle care.", "Book your service online."],
    trust: [["Easy online booking", "Choose your wash or detailing service"], ["Schedule confirmation", "The business will confirm your time"], ["Simple and organized", "Your service details stay together"]],
  },
  LAUNDRY: {
    category: "Laundry Shop",
    tagline: ["Fresh, clean, convenient.", "Schedule your service."],
    trust: [["Easy service request", "Choose pickup or shop service"], ["Schedule confirmation", "The shop will confirm your request"], ["Care instructions", "Keep your laundry notes organized"]],
  },
  TOURS_TRAVEL: {
    category: "Tours & Travel",
    tagline: ["Plan your next experience.", "Book with ease."],
    trust: [["Explore packages", "Choose your preferred tour"], ["Reservation request", "The operator will confirm availability"], ["Guest details", "Keep trip information organized"]],
  },
  STAYCATION_ACCOMMODATION: {
    category: "Staycation & Accommodation",
    tagline: ["Your stay starts here.", "Reserve with ease."],
    trust: [["Choose your stay", "Select a room or unit"], ["Reservation confirmation", "The host will confirm availability"], ["Guest details", "Keep stay information organized"]],
  },
  GENERAL: {
    category: "Service Business",
    tagline: ["Book your service.", "Quick and easy."],
    trust: [["Easy online booking", "Choose the service you need"], ["Request confirmation", "The business will confirm your schedule"], ["Simple and private", "Your details stay organized"]],
  },
};

function getBookingTemplateCopy(template, business = {}) {
  const normalizedTemplate = normalizeBookingTemplate(template);
  const fallback = bookingTemplatePublicCopy[normalizedTemplate] || bookingTemplatePublicCopy.GENERAL;
  const genericDescriptions = new Set([
    "Book online in less than a minute. Choose a service, pick a time, and get confirmation.",
    "Book online in less than a minute. Choose a service, pick a time, and get confirmation without creating an account.",
  ]);
  const customCopy = (business.tagline || business.heroTagline || business.description || "").trim();
  if (!customCopy || genericDescriptions.has(customCopy)) return fallback;
  const sentences = customCopy.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) || [customCopy];
  return {
    ...fallback,
    tagline: sentences.length > 1 ? [sentences[0], sentences.slice(1).join(" ")] : [sentences[0], ""],
  };
}

function getBookingTemplateTone(bookingTemplate) {
  const nextTemplate = normalizeBookingTemplate(bookingTemplate);
  if (nextTemplate === "STAYCATION_ACCOMMODATION") return "staycation-accommodation";
  if (nextTemplate === "TOURS_TRAVEL") return "tours-travel";
  if (nextTemplate === "PROFESSIONAL_SERVICES") return "professional-services";
  if (nextTemplate === "CAR_WASH") return "carwash";
  if (nextTemplate === "LAUNDRY") return "laundry";
  if (nextTemplate === "HOME_SERVICE") return "home-service";
  if (nextTemplate === "AUTO") return "auto";
  if (nextTemplate === "CLINIC") return "clinic";
  if (nextTemplate === "BEAUTY") return "beauty";
  return "general";
}

function normalizePricingUnit(value, fallback = "FLAT") {
  const nextUnit = (value || fallback || "FLAT").toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return ["FLAT", "PER_PAX", "PER_PERSON", "PER_GROUP", "PER_TRIP", "PER_DAY", "PER_NIGHT", "PER_YEAR", "FIXED"].includes(nextUnit) ? nextUnit : "FLAT";
}

function normalizePricingType(value, fallback = "FIXED") {
  const nextType = (value || fallback || "FIXED").toUpperCase().replace(/[^A-Z0-9]+/g, "_");
  return ["PER_PAX", "GROUP_TIER", "PER_TRIP", "PER_DAY", "PER_NIGHT", "STARTING_AT", "CUSTOM_INQUIRY", "IMAGE_BASED_PRICING", "FIXED"].includes(nextType) ? nextType : "FIXED";
}

function isInquiryPricingType(value = "") {
  return ["CUSTOM_INQUIRY", "IMAGE_BASED_PRICING"].includes(normalizePricingType(value));
}

function getNightCount(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(`${checkIn}T00:00:00`);
  const end = new Date(`${checkOut}T00:00:00`);
  const nights = Math.round((end - start) / 86400000);
  return Number.isFinite(nights) ? nights : 0;
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

function hasValidPricingConfiguration(serviceDetail = {}) {
  const pricingType = normalizePricingType(serviceDetail.pricingType, serviceDetail.pricingUnit);
  const price = serviceDetail.price === "" || serviceDetail.price === null || serviceDetail.price === undefined ? null : Number(serviceDetail.price);
  if (isInquiryPricingType(pricingType)) return true;
  if (pricingType === "GROUP_TIER") {
    const tiers = validatePricingTiers(serviceDetail.pricingTiers);
    return tiers.ok && tiers.tiers.length > 0;
  }
  return price !== null && !Number.isNaN(price);
}

function isPublishableServiceForTemplate(serviceDetail = {}, bookingTemplate = "GENERAL") {
  const template = normalizeBookingTemplate(bookingTemplate);
  if (template === "PROFESSIONAL_SERVICES") return Boolean(String(serviceDetail.name || "").trim());
  return hasValidPricingConfiguration(serviceDetail);
}

function getPricingForGuests(serviceDetail, guestCount) {
  const pricingType = normalizePricingType(serviceDetail.pricingType, serviceDetail.pricingUnit);
  const price = serviceDetail.price === null || serviceDetail.price === undefined ? null : Number(serviceDetail.price);
  if (isInquiryPricingType(pricingType)) {
    return { pricingType, unitPrice: null, selectedTier: null, estimatedTotal: null, totalAvailable: true };
  }
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
    return { pricingType, unitPrice: price, selectedTier: null, estimatedTotal: price === null ? null : price * guestCount, totalAvailable: price !== null };
  }
  if (pricingType === "PER_NIGHT") {
    return { pricingType, unitPrice: price, selectedTier: null, estimatedTotal: price === null ? null : price * guestCount, totalAvailable: price !== null };
  }
  if (pricingType === "STARTING_AT") {
    return { pricingType, unitPrice: price, selectedTier: null, estimatedTotal: price, totalAvailable: price !== null };
  }
  return { pricingType, unitPrice: price, selectedTier: null, estimatedTotal: price, totalAvailable: price !== null };
}

function calculateLineItem(serviceDetail = {}, context = {}) {
  const quantity = Math.max(1, Number(context.pax || context.days || context.nights || 1) || 1);
  const pricing = getPricingForGuests(serviceDetail, quantity);
  const pricingType = pricing.pricingType;
  const serviceName = serviceDetail.name || serviceDetail.service || "Selected service";
  const serviceId = serviceDetail.id || null;
  const basePrice = serviceDetail.price === null || serviceDetail.price === undefined ? null : Number(serviceDetail.price);
  let lineTotal = pricing.estimatedTotal;
  let lineLabel = basePrice === null ? "Pricing unavailable" : formatPeso(basePrice);
  let snapshotQuantity = 1;

  if (pricingType === "PER_PAX") {
    snapshotQuantity = quantity;
    lineLabel = `${formatPeso(pricing.unitPrice)} x ${quantity} pax`;
  } else if (pricingType === "PER_TRIP") {
    lineLabel = `${formatPeso(pricing.unitPrice)} / trip`;
  } else if (pricingType === "PER_DAY") {
    snapshotQuantity = quantity;
    lineTotal = pricing.unitPrice === null ? null : pricing.unitPrice * quantity;
    lineLabel = `${formatPeso(pricing.unitPrice)} x ${quantity} day${quantity > 1 ? "s" : ""}`;
  } else if (pricingType === "PER_NIGHT") {
    const nights = Math.max(1, Number(context.nights || 1) || 1);
    const totalGuests = Math.max(1, Number(context.totalGuests || context.pax || 1) || 1);
    const includedGuests = Math.max(1, Number(serviceDetail.includedGuests || serviceDetail.maxGuests || totalGuests) || totalGuests);
    const extraGuestFee = serviceDetail.extraGuestFee === "" || serviceDetail.extraGuestFee === null || serviceDetail.extraGuestFee === undefined ? 0 : Number(serviceDetail.extraGuestFee);
    const extraGuests = Math.max(0, totalGuests - includedGuests);
    const baseTotal = pricing.unitPrice === null ? null : pricing.unitPrice * nights;
    const extraTotal = baseTotal === null ? null : extraGuestFee * extraGuests * nights;
    snapshotQuantity = nights;
    lineTotal = baseTotal === null ? null : baseTotal + extraTotal;
    lineLabel = `${formatPeso(pricing.unitPrice)} x ${nights} night${nights > 1 ? "s" : ""}${extraGuests && extraGuestFee ? ` + ${extraGuests} extra guest${extraGuests > 1 ? "s" : ""}` : ""}`;
    pricing.selectedTier = { nights, totalGuests, includedGuests, extraGuests, extraGuestFee };
  } else if (pricingType === "GROUP_TIER") {
    lineLabel = pricing.selectedTier
      ? `${pricing.selectedTier.minGuests}-${pricing.selectedTier.maxGuests} pax rate`
      : "Group rate unavailable";
  } else if (pricingType === "STARTING_AT") {
    lineLabel = `Starting at ${formatPeso(pricing.unitPrice)}`;
  } else if (isInquiryPricingType(pricingType)) {
    lineLabel = "See Plan Details / Inquire for Pricing";
    lineTotal = null;
  }

  return {
    serviceId,
    serviceName,
    pricingType,
    unitPrice: pricing.unitPrice,
    quantity: snapshotQuantity,
    selectedTier: pricing.selectedTier,
    lineTotal,
    totalAvailable: pricing.totalAvailable,
    lineLabel,
  };
}

function calculateBookingTotal(selectedServices = [], context = {}) {
  const lineItems = selectedServices.map((service) => calculateLineItem(service, context));
  const invalidItem = lineItems.find((item) => !item.totalAvailable || (!isInquiryPricingType(item.pricingType) && (item.lineTotal === null || item.lineTotal === undefined || Number.isNaN(Number(item.lineTotal)))));
  const estimatedTotal = invalidItem ? null : lineItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  return {
    lineItems,
    estimatedTotal,
    totalAvailable: !invalidItem,
    invalidItem,
  };
}

function getBookingLineItems(booking = {}) {
  const metadataItems = Array.isArray(booking.metadata?.line_items) ? booking.metadata.line_items : [];
  const directItems = Array.isArray(booking.booking_items) ? booking.booking_items : [];
  const items = directItems.length ? directItems : metadataItems;
  if (items.length) {
    return items.map((item) => ({
      serviceName: item.service_name_snapshot || item.serviceName || item.service_name || item.name || booking.service,
      pricingType: item.pricing_type_snapshot || item.pricingType || item.pricing_type || "FIXED",
      unitPrice: item.unit_price_snapshot ?? item.unitPrice ?? item.unit_price ?? null,
      quantity: Number(item.quantity || 1),
      selectedTier: item.selected_tier_snapshot || item.selectedTier || item.selected_tier || null,
      lineTotal: item.line_total ?? item.lineTotal ?? null,
      lineLabel: item.line_label || item.lineLabel || "",
    }));
  }
  return [{
    serviceName: booking.service || "Booking request",
    pricingType: booking.metadata?.pricing_type || "FIXED",
    unitPrice: booking.metadata?.unit_price ?? booking.metadata?.estimated_total ?? booking.estimated_total ?? null,
    quantity: booking.metadata?.guest_count || 1,
    selectedTier: booking.metadata?.selected_tier || null,
    lineTotal: booking.metadata?.estimated_total ?? booking.estimated_total ?? null,
    lineLabel: "",
  }];
}

function getBookingServiceSummary(booking = {}) {
  const items = getBookingLineItems(booking);
  if (items.length > 1) return `${items.length} Services`;
  return items[0]?.serviceName || booking.service || "Booking request";
}

function attachBookingItems(bookings = [], bookingItems = []) {
  const itemsByBooking = (bookingItems || []).reduce((grouped, item) => {
    grouped[item.booking_id] = grouped[item.booking_id] || [];
    grouped[item.booking_id].push(item);
    return grouped;
  }, {});
  return (bookings || []).map((booking) => ({
    ...booking,
    booking_items: itemsByBooking[booking.id] || booking.booking_items || [],
  }));
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
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "Pricing unavailable";
  return `PHP ${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatServicePriceLabel(detail = {}, fallbackPricingType = "FIXED") {
  const pricingType = normalizePricingType(detail.pricingType ?? detail.pricing_type, detail.pricingUnit ?? detail.pricing_unit ?? fallbackPricingType);
  const price = detail.price;
  const base = formatPeso(price);
  const tiers = normalizePricingTiers(detail.pricingTiers ?? detail.pricing_tiers);
  if (pricingType === "CUSTOM_INQUIRY" || pricingType === "IMAGE_BASED_PRICING") return "See Plan Details / Inquire for Pricing";
  if (pricingType === "GROUP_TIER" && tiers.length) {
    const prices = tiers.map((tier) => tier.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return minPrice === maxPrice ? `${formatPeso(minPrice)} / group` : `${formatPeso(minPrice)} - ${formatPeso(maxPrice)}`;
  }
  if (base === "Pricing unavailable") return base;
  if (pricingType === "PER_PAX") return `${base} / pax`;
  if (pricingType === "PER_TRIP") return `${base} / trip`;
  if (pricingType === "PER_DAY") return `${base} / day`;
  if (pricingType === "PER_NIGHT") return `${base} / night`;
  if (pricingType === "STARTING_AT") return `Starting at ${base}`;
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

async function supabaseStorageUpload(path, file, accessToken = "", options = {}) {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase is not connected.");
  const response = await fetch(`${supabaseUrl}/storage/v1/object/business-media/${path}`, {
    method: "PUT",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken || supabaseAnonKey}`,
      "Content-Type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file,
  });
  const responseText = await response.text();
  if (!response.ok) throw new Error(responseText || "Upload failed.");
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/business-media/${path}`;
  const verifyResponse = await fetch(publicUrl, { method: "GET" });
  if (!verifyResponse.ok) {
    throw new Error("Upload completed, but the saved photo could not be read back.");
  }
  return options.returnStoredPath ? path : publicUrl;
}

function resolveBusinessMediaUrl(value = "") {
  const next = String(value || "").trim();
  if (!next) return "";
  if (/^https?:\/\//i.test(next)) return next;
  if (!supabaseUrl) return next;
  return `${supabaseUrl}/storage/v1/object/public/business-media/${next.replace(/^\/+/, "")}`;
}

function normalizeServiceLink(value = "") {
  const next = String(value || "").trim();
  if (!next) return "";
  if (/^(https?:\/\/|mailto:|tel:|sms:)/i.test(next)) return next;
  if (/^[a-z][a-z0-9+.-]*:/i.test(next)) return "";
  return `https://${next.replace(/^\/+/, "")}`;
}

function isDirectImageLink(value = "") {
  const href = normalizeServiceLink(value);
  return Boolean(href && /\.(png|jpe?g|webp|gif|svg|avif)(?:[?#].*)?$/i.test(href));
}

function validateBrandMediaFile(file) {
  if (!file) throw new Error("Please choose a file.");
  const allowedTypes = new Set(["image/png", "image/jpeg", "image/webp"]);
  if (!allowedTypes.has(file.type)) throw new Error("Only PNG, JPG, and WEBP files are allowed.");
  if (file.size > 5 * 1024 * 1024) throw new Error("File size must be 5 MB or less.");
}

function validateAnnouncementMediaFile(file) {
  validateBrandMediaFile(file);
}

function getFileExtension(file) {
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  return "jpg";
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
    serviceEntries: normalizeStructuredServices(row.serviceEntries || row.service_entries || [], 0),
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
    service_entries: normalizeStructuredServices(setup.serviceEntries || [], 0),
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
      maxGuests: service.max_guests ?? service.maxGuests ?? "",
      includedGuests: service.included_guests ?? service.includedGuests ?? "",
      extraGuestFee: service.extra_guest_fee ?? service.extraGuestFee ?? "",
      serviceCategory: service.service_category || service.serviceCategory || "",
      imageUrl: service.image_url || service.imageUrl || "",
      imageTitle: service.image_title || service.imageTitle || "",
      imageCaption: service.image_caption || service.imageCaption || "",
      unitQuantity: service.unit_quantity ?? service.unitQuantity ?? 1,
      description: service.description || "",
      displayOrder: service.display_order || 0,
      status: service.status,
    })).filter((service) => isPublishableServiceForTemplate(service, bookingTemplate)),
    activeServices.filter((service) => isPublishableServiceForTemplate(service, bookingTemplate)).map((service) => service.name),
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
    pageBackgroundType: (row.page_background_type || row.pageBackgroundType || "SOLID").toUpperCase(),
    phone: row.phone || "",
    messengerLink: row.messenger_link || "",
    address: row.address || "",
    description: row.description || "",
    businessType: row.business_type || row.industry || "Service business",
    bookingMode: row.booking_mode || "booking",
    bookingTemplate,
    demoStartedAt: row.demo_started_at || null,
    demoExpiresAt: row.demo_expires_at || null,
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
    pageBackgroundColor: normalizeHexColor(row.page_background_color || row.pageBackgroundColor, themeDefaults.pageBackgroundColor),
    pageBackgroundColor2: normalizeHexColor(row.page_background_color_2 || row.pageBackgroundColor2, ""),
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
    ? dedupeServices(setupStructuredServices.filter(hasValidPricingConfiguration), setupStructuredServices.filter(hasValidPricingConfiguration).map((service) => service.name))
    : setup.services?.trim()
      ? dedupeServices(parseServiceDetails(setup.services).filter(hasValidPricingConfiguration), parseSetupServices(setup.services))
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
    pageBackgroundType: (setup.pageBackgroundType || "SOLID").toUpperCase(),
    pageBackgroundColor: setup.pageBackgroundColor || themeDefaults.pageBackgroundColor,
    pageBackgroundColor2: setup.pageBackgroundColor2 || "",
    phone: setup.contact || "",
    messengerLink: setup.facebookPage || "",
    address: "",
    description: setup.rules || (isHomeService ? "Professional service for homes and businesses." : "Book online in less than a minute. Choose a service, pick a time, and get confirmation."),
    businessType: setup.industry || "Service business",
    bookingMode: "booking",
    bookingTemplate,
    demoStartedAt: setup.demoStartedAt || setup.demo_started_at || null,
    demoExpiresAt: setup.demoExpiresAt || setup.demo_expires_at || null,
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
    pageBackgroundType: (business.pageBackgroundType || business.page_background_type || "SOLID").toUpperCase(),
    pageBackgroundColor: normalizeHexColor(business.pageBackgroundColor || business.page_background_color, themeDefaults.pageBackgroundColor),
    pageBackgroundColor2: normalizeHexColor(business.pageBackgroundColor2 || business.page_background_color_2, ""),
    phone: business.phone || "",
    messengerLink: business.messengerLink || "",
    address: business.address || "",
    description: business.description || (tone === "home-service"
      ? "Professional service for homes and businesses."
      : "Book online in less than a minute. Choose a service, pick a time, and get confirmation without creating an account."),
    businessType: business.businessType || business.name || "Service business",
    bookingMode: business.bookingMode || "booking",
    bookingTemplate: normalizeBookingTemplate(business.bookingTemplate),
    demoStartedAt: business.demoStartedAt || business.demo_started_at || null,
    demoExpiresAt: business.demoExpiresAt || business.demo_expires_at || null,
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

const announcementTypeOptions = ["GENERAL", "PACKAGE_UPSELL", "RESELLER", "IMPORTANT_NOTICE"];
const announcementPlacementOptions = ["DEMO_PREVIEW", "CLIENT_DASHBOARD", "BOTH"];
const announcementPriorityOptions = ["NORMAL", "IMPORTANT"];
const announcementPackageAudienceOptions = ["ALL", "STARTER", "BUSINESS", "PRO"];
const announcementStatusAudienceOptions = ["ALL", "DEMO", "STARTER", "BUSINESS", "PRO", "UNPAID", "ACTIVE"];
const announcementCtaTypeOptions = ["NONE", "MESSENGER", "INTERNAL_PAGE", "EXTERNAL_LINK"];
const announcementInternalPageOptions = [
  { value: "internal:packages", label: "Package Information" },
  { value: "internal:overview", label: "Slotwise Overview" },
  { value: "internal:reseller", label: "Reseller Program" },
  { value: "internal:signup", label: "Launch Signup" },
];
const announcementPresetOptions = [
  {
    id: "starter-business",
    title: "Need More Control?",
    message: "Upgrade to BUSINESS to unlock additional business management tools.",
    announcement_type: "PACKAGE_UPSELL",
    cta_label: "View BUSINESS",
    cta_type: "INTERNAL_PAGE",
    cta_destination: "internal:packages",
    target_packages: ["STARTER"],
    target_statuses: ["ALL"],
    placement: "BOTH",
    priority: "NORMAL",
  },
  {
    id: "business-pro",
    title: "Unlock Advanced Features",
    message: "Upgrade to PRO for our complete Booking & Inquiry System experience.",
    announcement_type: "PACKAGE_UPSELL",
    cta_label: "View PRO",
    cta_type: "INTERNAL_PAGE",
    cta_destination: "internal:packages",
    target_packages: ["BUSINESS"],
    target_statuses: ["ALL"],
    placement: "BOTH",
    priority: "NORMAL",
  },
  {
    id: "reseller",
    title: "Earn With SMM Solutions",
    message: "Offer Booking & Inquiry Systems to your own clients and earn from every completed sale.",
    announcement_type: "RESELLER",
    cta_label: "View Reseller Program",
    cta_type: "INTERNAL_PAGE",
    cta_destination: "internal:reseller",
    target_packages: ["ALL"],
    target_statuses: ["ALL"],
    placement: "BOTH",
    priority: "NORMAL",
  },
  {
    id: "general",
    title: "What's New",
    message: "Check out the latest updates available for your system.",
    announcement_type: "GENERAL",
    cta_label: "",
    cta_type: "NONE",
    cta_destination: "",
    target_packages: ["ALL"],
    target_statuses: ["ALL"],
    placement: "BOTH",
    priority: "NORMAL",
  },
];

function normalizeAnnouncement(announcement = {}) {
  const placement = announcementPlacementOptions.includes((announcement.placement || "BOTH").toUpperCase()) ? (announcement.placement || "BOTH").toUpperCase() : "BOTH";
  const priority = announcementPriorityOptions.includes((announcement.priority || "NORMAL").toUpperCase()) ? (announcement.priority || "NORMAL").toUpperCase() : "NORMAL";
  const announcementType = announcementTypeOptions.includes((announcement.announcement_type || announcement.type || "GENERAL").toUpperCase())
    ? (announcement.announcement_type || announcement.type || "GENERAL").toUpperCase()
    : "GENERAL";
  const ctaType = announcementCtaTypeOptions.includes((announcement.cta_type || announcement.ctaType || "NONE").toUpperCase())
    ? (announcement.cta_type || announcement.ctaType || "NONE").toUpperCase()
    : "NONE";
  const normalizeAudienceList = (value, allowed, fallback) => {
    const list = Array.isArray(value) ? value : (typeof value === "string" && value.trim() ? value.split(",") : []);
    const filtered = list.map((item) => String(item || "").trim().toUpperCase()).filter(Boolean).filter((item) => allowed.includes(item));
    return filtered.length ? filtered : fallback;
  };
  return {
    ...announcement,
    id: announcement.id || `ANN-${Date.now()}`,
    title: announcement.title || "What's New",
    message: announcement.message || "",
    announcement_type: announcementType,
    cta_label: announcement.cta_label || announcement.ctaLabel || "",
    cta_url: announcement.cta_url || announcement.ctaUrl || "",
    cta_type: ctaType,
    cta_destination: announcement.cta_destination || announcement.ctaDestination || "",
    image_url: announcement.image_url || announcement.imageUrl || "",
    image_clickable: announcement.image_clickable !== false,
    placement,
    business_slug: announcement.business_slug || announcement.businessSlug || "",
    target_packages: normalizeAudienceList(announcement.target_packages || announcement.targetPackages, announcementPackageAudienceOptions, ["ALL"]),
    target_statuses: normalizeAudienceList(announcement.target_statuses || announcement.targetStatuses, announcementStatusAudienceOptions, ["ALL"]),
    enabled: announcement.enabled !== false,
    dismissible: announcement.dismissible !== false,
    priority,
    starts_at: announcement.starts_at || announcement.startsAt || null,
    ends_at: announcement.ends_at || announcement.endsAt || null,
    created_at: announcement.created_at || announcement.createdAt || null,
    updated_at: announcement.updated_at || announcement.updatedAt || null,
  };
}

function announcementIsActive(announcement, now = new Date()) {
  if (!announcement?.enabled) return false;
  const startsAt = announcement.starts_at ? new Date(announcement.starts_at) : null;
  const endsAt = announcement.ends_at ? new Date(announcement.ends_at) : null;
  if (startsAt && startsAt.getTime() > now.getTime()) return false;
  if (endsAt && endsAt.getTime() < now.getTime()) return false;
  return true;
}

function announcementMatchesBusiness(announcement, business, placement = "BOTH") {
  if (!announcementIsActive(announcement)) return false;
  const nextPlacement = (placement || "BOTH").toUpperCase();
  if (announcement.placement !== "BOTH" && announcement.placement !== nextPlacement) return false;
  if (announcement.business_slug && business?.slug && announcement.business_slug !== business.slug) return false;
  const packageKey = normalizePackage(business?.package || "STARTER");
  const statusKey = (business?.status || "DEMO").toUpperCase();
  const packageMatch = announcement.target_packages.includes("ALL") || announcement.target_packages.includes(packageKey);
  const statusMatch = announcement.target_statuses.includes("ALL") || announcement.target_statuses.includes(statusKey);
  return packageMatch && statusMatch;
}

function sortAnnouncements(announcements = []) {
  return [...announcements].sort((a, b) => {
    const aPriority = (a.priority || "NORMAL") === "IMPORTANT" ? 1 : 0;
    const bPriority = (b.priority || "NORMAL") === "IMPORTANT" ? 1 : 0;
    if (aPriority !== bPriority) return bPriority - aPriority;
    return new Date(b.created_at || b.createdAt || 0) - new Date(a.created_at || a.createdAt || 0);
  });
}

function resolveAnnouncementCtaHref(announcement = {}, business = null) {
  const ctaType = (announcement.cta_type || announcement.ctaType || "NONE").toUpperCase();
  const ctaUrl = String(announcement.cta_url || announcement.ctaUrl || "").trim();
  const ctaDestination = String(announcement.cta_destination || announcement.ctaDestination || "").trim();
  if (ctaType === "NONE") return "";
  if (ctaType === "MESSENGER") {
    return business?.messengerLink || business?.phone && `tel:${String(business.phone).replace(/\s+/g, "")}` || ctaUrl || ctaDestination || "";
  }
  if (ctaType === "INTERNAL_PAGE") {
    const next = ctaDestination || ctaUrl;
    if (next === "internal:packages") return "#pricing";
    if (next === "internal:reseller") return "#signup";
    if (next === "internal:overview") return "#product";
    if (next === "internal:client-login") return "/client-login";
    if (next === "internal:client-dashboard") return "/client-dashboard";
    return "";
  }
  if (ctaType === "EXTERNAL_LINK") {
    return ctaUrl;
  }
  return ctaUrl || ctaDestination || "";
}

function getAnnouncementIcon(announcementType) {
  const nextType = (announcementType || "GENERAL").toUpperCase();
  if (nextType === "PACKAGE_UPSELL") return WandSparkles;
  if (nextType === "RESELLER") return BriefcaseBusiness;
  if (nextType === "IMPORTANT_NOTICE") return ShieldCheck;
  return MessageSquare;
}

function getAnnouncementAudienceLabel(announcement) {
  const packages = announcement.target_packages || ["ALL"];
  const statuses = announcement.target_statuses || ["ALL"];
  const packageLabel = packages.includes("ALL") ? "All packages" : packages.join(" + ");
  const statusLabel = statuses.includes("ALL") ? "All statuses" : statuses.join(" + ");
  return `${packageLabel} · ${statusLabel}`;
}

function getAnnouncementPlacementLabel(announcement) {
  const next = (announcement.placement || "BOTH").toUpperCase();
  if (next === "DEMO_PREVIEW") return "Demo preview";
  if (next === "CLIENT_DASHBOARD") return "Client dashboard";
  return "Both";
}

function getAnnouncementPreviewTone(announcement) {
  if ((announcement.priority || "NORMAL") === "IMPORTANT") return "important";
  if ((announcement.announcement_type || "GENERAL") === "PACKAGE_UPSELL") return "upsell";
  if ((announcement.announcement_type || "GENERAL") === "RESELLER") return "reseller";
  return "general";
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
        if (/(per\s*night|\/\s*night)/i.test(detail)) {
          service.pricingType = "PER_NIGHT";
          service.pricingUnit = "PER_NIGHT";
        }
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
    id: `svc-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 10)}`,
    name: "",
    description: "",
    price: "",
    durationMinutes: "",
    displayOrder: index,
    status: "Active",
    pricingType: "FIXED",
    pricingUnit: "FLAT",
    pricingTiers: [],
    maxGuests: "",
    includedGuests: "",
    extraGuestFee: "",
    imageUrl: "",
    imageTitle: "",
    imageCaption: "",
    unitQuantity: 1,
    expanded: true,
  }));
}

function serviceRowToStructured(service = {}, index = 0) {
  return {
    id: service.id || "",
    name: service.name || "",
    serviceCategory: service.service_category || service.serviceCategory || "",
    description: service.description || "",
    price: service.price ?? "",
    durationMinutes: service.duration_minutes ?? service.durationMinutes ?? "",
    displayOrder: service.display_order ?? service.displayOrder ?? index,
    status: service.status || "Active",
    pricingType: normalizePricingType(service.pricing_type || service.pricingType, service.pricing_unit || service.pricingUnit),
    pricingUnit: normalizePricingUnit(service.pricing_unit || service.pricingUnit),
    pricingTiers: normalizePricingTiers(service.pricing_tiers || service.pricingTiers),
    maxGuests: service.max_guests ?? service.maxGuests ?? "",
    includedGuests: service.included_guests ?? service.includedGuests ?? "",
    extraGuestFee: service.extra_guest_fee ?? service.extraGuestFee ?? "",
    imageUrl: service.image_url || service.imageUrl || "",
    imageTitle: service.image_title || service.imageTitle || "",
    imageCaption: service.image_caption || service.imageCaption || "",
    unitQuantity: service.unit_quantity ?? service.unitQuantity ?? 1,
    expanded: service.expanded ?? index < 3,
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
  const isAccommodation = normalizeBookingTemplate(bookingTemplate) === "STAYCATION_ACCOMMODATION";
  const isConsultant = normalizeBookingTemplate(bookingTemplate) === "PROFESSIONAL_SERVICES";
  return normalizeStructuredServices(value, 0)
    .filter((service) => service.name.trim())
    .map((service, index) => {
      const pricingType = isAccommodation
        ? "PER_NIGHT"
        : isTravel
          ? normalizePricingType(service.pricingType, service.pricingUnit)
          : isConsultant
            ? normalizePricingType(service.pricingType, service.pricingUnit)
            : "FIXED";
      return {
        ...service,
        name: service.name.trim(),
        description: service.description.trim(),
        price: service.price === "" ? null : Number(service.price),
        durationMinutes: service.durationMinutes === "" ? null : Number(service.durationMinutes),
        displayOrder: index,
        status: service.status || "Active",
        pricingType,
        pricingUnit: isAccommodation ? "PER_NIGHT" : isTravel || isConsultant ? normalizePricingUnit(service.pricingUnit, pricingType) : "FLAT",
        pricingTiers: (isTravel || isConsultant) && pricingType === "GROUP_TIER" ? normalizePricingTiers(service.pricingTiers) : [],
        maxGuests: service.maxGuests === "" ? null : Number(service.maxGuests),
        includedGuests: service.includedGuests === "" ? null : Number(service.includedGuests),
        extraGuestFee: service.extraGuestFee === "" ? null : Number(service.extraGuestFee),
        imageUrl: service.imageUrl || "",
        imageTitle: service.imageTitle || "",
        imageCaption: service.imageCaption || "",
        unitQuantity: service.unitQuantity === "" ? 1 : Number(service.unitQuantity || 1),
      };
    });
}

function serviceRowMatchesStructured(row = {}, service = {}) {
  const sameText = (left, right) => String(left ?? "").trim() === String(right ?? "").trim();
  const sameNumber = (left, right) => (
    (left === null || left === "") && (right === null || right === "")
  ) || Number(left) === Number(right);
  return sameText(row.name, service.name)
    && sameText(row.service_category, service.serviceCategory)
    && sameText(row.description, service.description)
    && sameNumber(row.price, service.price)
    && sameNumber(row.duration_minutes, service.durationMinutes)
    && normalizePricingType(row.pricing_type, row.pricing_unit) === normalizePricingType(service.pricingType, service.pricingUnit)
    && normalizePricingUnit(row.pricing_unit) === normalizePricingUnit(service.pricingUnit)
    && sameNumber(row.max_guests, service.maxGuests)
    && sameNumber(row.included_guests, service.includedGuests)
    && sameNumber(row.extra_guest_fee, service.extraGuestFee)
    && sameText(row.image_url, service.imageUrl)
    && sameText(row.image_title, service.imageTitle)
    && sameText(row.image_caption, service.imageCaption)
    && Number(row.display_order || 0) === Number(service.displayOrder || 0)
    && String(row.status || "Active").toUpperCase() === String(service.status || "Active").toUpperCase();
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
    .map((service) => normalizeBookingTemplate(bookingTemplate) === "TOURS_TRAVEL" ? service : normalizeBookingTemplate(bookingTemplate) === "STAYCATION_ACCOMMODATION" ? {
      ...service,
      pricingType: "PER_NIGHT",
      pricingUnit: "PER_NIGHT",
      durationMinutes: "",
    } : {
      ...service,
      pricingType: "FIXED",
      pricingUnit: "FLAT",
      pricingTiers: [],
    });
}

function getServiceManagerCopy(bookingTemplate = "GENERAL") {
  const template = normalizeBookingTemplate(bookingTemplate);
  if (template === "TOURS_TRAVEL") return { title: "Tour Packages", single: "Tour package", add: "Add Another Package" };
  if (template === "STAYCATION_ACCOMMODATION") return { title: "Rooms / Units", single: "Room / unit", add: "Add Room / Unit" };
  if (template === "PROFESSIONAL_SERVICES") return { title: "Plans & Services", single: "Plan / product", add: "Add Another Plan" };
  if (template === "CAR_WASH") return { title: "Car Wash Services", single: "Car wash service", add: "Add Another Service" };
  if (template === "LAUNDRY") return { title: "Laundry Services", single: "Laundry service", add: "Add Another Service" };
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
  if (/(staycation|accommodation|resort|villa|transient|apartment|condotel|hotel|guest house|cabin|beach house|room|rental)/i.test(lower)) return "STAYCATION_ACCOMMODATION";
  if (/(travel|tour)/i.test(lower)) return "TOURS_TRAVEL";
  if (/(consultant|consulting|professional services|professional service|agency|advisory|advisor|accounting|legal|lawyer|real estate|broker|marketing|design|freelance|profession)/i.test(lower)) return "PROFESSIONAL_SERVICES";
  if (/(car wash|carwash|auto detailing|detailing|vehicle cleaning|motorcycle wash|motor wash)/i.test(lower)) return "CAR_WASH";
  if (/(laundry|wash\s*&\s*fold|wash and fold|dry cleaning|pickup.*delivery|pick up.*delivery)/i.test(lower)) return "LAUNDRY";
  if (/(clinic|dental|doctor|medical)/i.test(lower)) return "CLINIC";
  if (/(home|aircon|repair|cleaning|maintenance|plumbing|electrical)/i.test(lower)) return "HOME_SERVICE";
  if (/(car wash|carwash|auto detailing|detailing|vehicle cleaning|motorcycle wash|motor wash)/i.test(lower)) return "CAR_WASH";
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
    cover_url: setup.cover || setup.coverUrl || "",
    logo_url: setup.logo || setup.logoUrl || "",
    page_background_type: (setup.pageBackgroundType || "SOLID").toUpperCase(),
    primary_color: setup.primaryColor || business.primaryColor,
    accent_color: setup.accentColor || business.accentColor,
    page_background_color: normalizeHexColor(setup.pageBackgroundColor, business.pageBackgroundColor || ""),
    page_background_color_2: normalizeHexColor(setup.pageBackgroundColor2, business.pageBackgroundColor2 || ""),
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
    demo_started_at: setup.demoStartedAt || null,
    demo_expires_at: setup.demoExpiresAt || null,
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
    max_guests: service.maxGuests,
    included_guests: service.includedGuests,
    extra_guest_fee: service.extraGuestFee,
    service_category: service.serviceCategory || "",
    image_url: service.imageUrl,
    image_title: service.imageTitle || "",
    image_caption: service.imageCaption || "",
    unit_quantity: service.unitQuantity,
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
    cover: getTemplateFallbackCover("beauty"),
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
    cover: getTemplateFallbackCover("clinic"),
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
    cover: getTemplateFallbackCover("staycation-accommodation"),
    accent: "travel",
    tagline: "For stays, tours, travel consults, and document help.",
    highlight: "Best for date requests and guest details",
    stat: "7 inquiries this week",
    services: ["Room booking", "Travel package", "Document assistance"],
    forms: ["Travel date", "Guests", "Payment method"],
  },
  {
    icon: <BriefcaseBusiness />,
    slug: "primepoint-consulting",
    name: "Consultant / Professional Services",
    business: "PrimePoint Consulting",
    link: "primepoint.slotwise.app",
    logo: "",
    primaryColor: "#334155",
    accentColor: "#e8eef7",
    phone: "0917 555 4412",
    messengerLink: "https://m.me/primepointconsulting",
    address: "Sample consulting office address",
    description: "Advice, strategy, and service sessions booked in one simple flow.",
    businessType: "Consulting / Professional Services",
    bookingMode: "booking",
    bookingTemplate: "PROFESSIONAL_SERVICES",
    featureFlags: { ...defaultFeatureFlags, requireAddress: false, customerListEnabled: true },
    availability: { ...defaultAvailability, days: "Monday to Friday", hours: "9:00 AM to 6:00 PM", slots: ["9:00 AM", "11:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"] },
    cover: getTemplateFallbackCover("professional-services"),
    accent: "professional",
    tagline: "For consultants, advisors, agencies, and professional sessions.",
    highlight: "Best for appointment-based consultations and service retainers",
    stat: "Consults booked this week",
    services: ["Maxicare Health Plans", "MediCard Individual & Family Plans"],
    serviceDetails: [
      {
        name: "Maxicare Health Plans",
        serviceCategory: "HMO / Health Plan",
        description: "Choose from available Maxicare health plans based on your preferred coverage and benefits.",
        price: null,
        pricingUnit: "FLAT",
        pricingType: "IMAGE_BASED_PRICING",
        pricingTiers: [],
        durationMinutes: null,
        displayOrder: 0,
        status: "Active",
        imageUrl: "",
        imageTitle: "Maxicare Health Plans",
        imageCaption: "See Plan Details / Inquire for Pricing",
      },
      {
        name: "MediCard Individual & Family Plans",
        serviceCategory: "HMO / Health Plan",
        description: "Individual and family healthcare plans with Standard and VIP options.",
        price: 10739,
        pricingUnit: "PER_YEAR",
        pricingType: "STARTING_AT",
        pricingTiers: [],
        durationMinutes: null,
        displayOrder: 1,
        status: "Active",
        imageUrl: "",
        imageTitle: "MediCard Individual & Family Plans",
        imageCaption: "Starting at PHP 10,739 per year",
      },
    ],
    forms: ["Company name", "Coverage needs", "Preferred consultation notes"],
  },
  {
    icon: <WashingMachine />,
    slug: "freshfold-laundry",
    name: "Laundry Shop",
    business: "FreshFold Laundry",
    link: "freshfold.slotwise.app",
    logo: "",
    primaryColor: "#2d5b87",
    accentColor: "#e7f1fb",
    phone: "0917 444 8899",
    messengerLink: "https://m.me/freshfoldlaundry",
    address: "Sample laundry shop address",
    description: "Wash, dry, fold, and delivery made simple.",
    businessType: "Laundry Shop",
    bookingMode: "booking",
    bookingTemplate: "LAUNDRY",
    featureFlags: { ...defaultFeatureFlags, requireAddress: true, customerListEnabled: true },
    availability: { ...defaultAvailability, days: "Monday to Sunday", hours: "7:00 AM to 8:00 PM", slots: ["7:00 AM", "9:00 AM", "12:00 PM", "3:00 PM", "5:00 PM"] },
    cover: getTemplateFallbackCover("laundry"),
    accent: "laundry",
    tagline: "For wash & fold, dry cleaning, pickup, and delivery bookings.",
    highlight: "Best for recurring laundry requests and pickup scheduling",
    stat: "Same-day pickup options",
    services: ["Wash & Fold", "Dry Cleaning", "Pickup & Delivery"],
    serviceDetails: [
      { name: "Wash & Fold", description: "Regular laundry service per kilo", price: 80, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: 180, displayOrder: 0, status: "Active" },
      { name: "Dry Cleaning", description: "Garment care for delicate items", price: 150, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: 240, displayOrder: 1, status: "Active" },
      { name: "Pickup & Delivery", description: "Courier pickup and drop-off service", price: 120, pricingUnit: "PER_TRIP", pricingType: "PER_TRIP", pricingTiers: [], durationMinutes: 60, displayOrder: 2, status: "Active" },
    ],
    forms: ["Pickup address", "Laundry notes", "Delivery instructions"],
  },
  {
    icon: <CarFront />,
    slug: "sparkshine-carwash",
    name: "Car Wash",
    business: "SparkShine Car Wash",
    link: "sparkshine.slotwise.app",
    logo: "",
    primaryColor: "#1f2937",
    accentColor: "#eef2f7",
    phone: "0917 666 4400",
    messengerLink: "https://m.me/sparkshinecarwash",
    address: "Sample car wash address",
    description: "Book a wash, detail, or quick service with ease.",
    businessType: "Car Wash",
    bookingMode: "booking",
    bookingTemplate: "CAR_WASH",
    featureFlags: { ...defaultFeatureFlags, requireAddress: true, customerListEnabled: true },
    availability: { ...defaultAvailability, days: "Monday to Sunday", hours: "7:00 AM to 7:00 PM", slots: ["7:00 AM", "9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"] },
    cover: getTemplateFallbackCover("carwash"),
    accent: "carwash",
    tagline: "For car wash, detailing, cleaning, and pickup requests.",
    highlight: "Best for vehicles, recurring washes, and quick reservations",
    stat: "Same-day slots available",
    services: ["Exterior Wash", "Full Detail", "Interior Cleaning"],
    serviceDetails: [
      { name: "Exterior Wash", description: "Hand wash and rinse", price: 150, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: 60, displayOrder: 0, status: "Active" },
      { name: "Full Detail", description: "Interior and exterior detailing", price: 650, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: 180, displayOrder: 1, status: "Active" },
      { name: "Interior Cleaning", description: "Vacuum, wipe down, and finish", price: 250, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: 90, displayOrder: 2, status: "Active" },
    ],
    forms: ["Vehicle type", "Pickup location", "Special instructions"],
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
  const [smmOffers, setSmmOffers] = useState(null);
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

  const loadBusinessConfigs = async (scopeSlug = "", accessToken = "") => {
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
      supabaseRequest("businesses", { query: businessQuery, accessToken }),
      supabaseRequest("business_services", { query: serviceQuery, accessToken }),
      supabaseRequest("business_availability", { query: availabilityQuery, accessToken }),
      supabaseRequest("business_blocked_dates", { query: blockedDatesQuery, accessToken }).catch(() => []),
      supabaseRequest("business_payment_settings", { query: paymentSettingsQuery, accessToken }).catch(() => []),
      supabaseRequest("business_payment_methods", { query: paymentMethodsQuery, accessToken }).catch(() => []),
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
        const [onlineLeads, onlineBookings, onlineSetupRequests, onlineOffers] = await Promise.all([
          supabaseRequest("leads", { query: "?select=*&order=created_at.desc" }),
          supabaseRequest("bookings", { query: "?select=*&order=created_at.desc" }),
          supabaseRequest("setup_requests", { query: "?select=*&order=created_at.desc" }),
          supabaseRequest("smm_offers", { query: "?select=*&id=eq.global" }).catch(() => []),
        ]);
        setLeads(onlineLeads || []);
        setBookings(onlineBookings || []);
        setSetupRequests((onlineSetupRequests || []).map(normalizeSetupRequest));
        setSmmOffers(normalizeSmmOffers((onlineOffers || [])[0] || null));
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

    const previousBusiness = originalSlug ? databaseBusinesses.find((business) => business.slug === originalSlug) : null;
    const nextStatus = (nextClient.status || "DEMO").toUpperCase();
    const previousStatus = (previousBusiness?.status || "").toUpperCase();
    const shouldStartDemo = nextStatus === "DEMO" && (!originalSlug || previousStatus !== "DEMO");
    const demoWindow = shouldStartDemo
      ? createDemoWindow()
      : {
        demo_started_at: previousBusiness?.demoStartedAt || nextClient.demoStartedAt || null,
        demo_expires_at: previousBusiness?.demoExpiresAt || nextClient.demoExpiresAt || null,
      };
    const businessBody = {
      ...setupToBusinessDatabase({ ...nextClient, demoStartedAt: demoWindow.demo_started_at, demoExpiresAt: demoWindow.demo_expires_at }, slug),
    };
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
    const confirmedServiceRows = await supabaseRequest("business_services", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(slug)}&order=display_order.asc`,
      accessToken,
    });
    const unconfirmedService = serviceRows.find((service) => {
      const confirmed = confirmedServiceRows.find((row) => row.id === service.id)
        || confirmedServiceRows.find((row) => row.name === service.name);
      return !confirmed || !serviceRowMatchesStructured(confirmed, serviceRowToStructured(service));
    });
    if (unconfirmedService) {
      throw new Error(`Service save could not be confirmed from the database: ${unconfirmedService.name}.`);
    }
    await supabaseRequest("business_availability", {
      method: "POST",
      body: setupToAvailabilityDatabase(nextClient, slug, requestId),
      accessToken,
    });
    const refreshedBusinesses = await loadBusinessConfigs(slug, accessToken);
    const confirmedBusiness = (refreshedBusinesses || []).find((business) => business.slug === slug);
    if (!confirmedBusiness) {
      throw new Error("Theme could not be saved.");
    }
    const expectedBusiness = normalizeBusinessConfig(normalizeDatabaseBusiness({
      ...businessBody,
      slug,
      business: businessBody.business,
    }, [], null, null, []));
    const confirmedFields = {
      bookingTemplate: normalizeBookingTemplate(confirmedBusiness.bookingTemplate),
      primaryColor: normalizeHexColor(confirmedBusiness.primaryColor, ""),
      accentColor: normalizeHexColor(confirmedBusiness.accentColor, ""),
      pageBackgroundType: (confirmedBusiness.pageBackgroundType || "SOLID").toUpperCase(),
      pageBackgroundColor: normalizeHexColor(confirmedBusiness.pageBackgroundColor, ""),
      pageBackgroundColor2: normalizeHexColor(confirmedBusiness.pageBackgroundColor2, ""),
      logo: confirmedBusiness.logo || "",
      cover: confirmedBusiness.cover || "",
    };
    const expectedFields = {
      bookingTemplate: expectedBusiness.bookingTemplate,
      primaryColor: normalizeHexColor(expectedBusiness.primaryColor, ""),
      accentColor: normalizeHexColor(expectedBusiness.accentColor, ""),
      pageBackgroundType: (expectedBusiness.pageBackgroundType || "SOLID").toUpperCase(),
      pageBackgroundColor: normalizeHexColor(expectedBusiness.pageBackgroundColor, ""),
      pageBackgroundColor2: normalizeHexColor(expectedBusiness.pageBackgroundColor2, ""),
      logo: expectedBusiness.logo || "",
      cover: expectedBusiness.cover || "",
    };
    const mismatch = Object.entries(expectedFields).find(([key, value]) => value !== confirmedFields[key]);
    if (mismatch) {
      throw new Error(`Business field did not persist: ${mismatch[0]}.`);
    }
    return {
      savedOnline: true,
      slug,
      publicPath: `/${slug}`,
      message: originalSlug ? "Client updated. Theme saved successfully. Database: Synced ✓" : "Client created. Theme saved successfully. Database: Synced ✓",
    };
  };

  const updateClientStatus = async (slug, status, accessToken = "") => {
    const currentBusiness = databaseBusinesses.find((business) => business.slug === slug);
    const body = { status };
    if ((status || "").toUpperCase() === "DEMO" && (currentBusiness?.status || "").toUpperCase() !== "DEMO") {
      Object.assign(body, createDemoWindow());
    }
    await supabaseRequest("businesses", {
      method: "PATCH",
      query: `?slug=eq.${encodeURIComponent(slug)}`,
      body,
      accessToken,
    });
    setDatabaseBusinesses((current) => current.map((business) => (
      business.slug === slug ? normalizeBusinessConfig({ ...business, status, demoStartedAt: body.demo_started_at || business.demoStartedAt, demoExpiresAt: body.demo_expires_at || business.demoExpiresAt }) : business
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
        const { businessSlug, bookingItems, ...databaseBooking } = nextBooking;
        const [onlineBooking] = await supabaseRequest("bookings", {
          method: "POST",
          body: databaseBooking,
          prefer: "return=minimal",
        });
        if (bookingItems?.length) {
          await supabaseRequest("booking_items", {
            method: "POST",
            body: bookingItems.map((item, index) => ({
              id: `${nextBooking.id}-item-${index + 1}`,
              booking_id: nextBooking.id,
              business_slug: nextBooking.business_slug,
              service_id: item.serviceId,
              service_name_snapshot: item.serviceName,
              pricing_type_snapshot: item.pricingType,
              unit_price_snapshot: item.unitPrice,
              quantity: item.quantity,
              selected_tier_snapshot: item.selectedTier,
              line_total: item.lineTotal,
            })),
            prefer: "return=minimal",
          });
        }
        nextBooking = { ...(onlineBooking || nextBooking), booking_items: bookingItems || [] };
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
    return <BookingPrototype business={selectedBusiness} onBack={() => setPage("home")} onSaveBooking={saveBooking} onSubmitPayment={submitPublicPayment} smmOffers={smmOffers} />;
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
    if (publicBusiness && isDemoExpired(publicBusiness)) {
      return <DemoExpiredPage business={publicBusiness} onBack={() => setPage("home")} />;
    }
    return publicBusiness ? (
      <BookingPrototype business={publicBusiness} onBack={() => setPage("home")} onSaveBooking={saveBooking} onSubmitPayment={submitPublicPayment} smmOffers={smmOffers} />
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
        smmOffers={smmOffers}
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

function SmmOffersFeed({ offers = null, placement = "BOTH", compact = false, business = null }) {
  if (!offers?.enabled) return null;
  if (placement === "DEMO_PREVIEW" && offers.show_on_demo === false) return null;
  if (placement === "CLIENT_DASHBOARD" && offers.show_on_dashboard === false) return null;
  const cards = [
    {
      id: "offer-one",
      title: offers.offer_one_title,
      message: offers.offer_one_message,
      imageUrl: offers.offer_one_image_url,
    },
    {
      id: "offer-two",
      title: offers.offer_two_title,
      message: offers.offer_two_message,
      imageUrl: offers.offer_two_image_url,
    },
  ].filter((item) => item.title || item.message || item.imageUrl);
  if (!cards.length) return null;
  const contactHref = business?.messengerLink || "https://m.me/slotwise";
  return (
    <section className={compact ? "smmOffers compact" : "smmOffers"}>
      <div className="smmOffersHeader">
        <div>
          <p className="eyebrow">SMM offers</p>
          <h3>{compact ? "Current promos" : "More from SMM Solutions"}</h3>
          <small>{offers.cta_label || "Message SMM Solutions"}</small>
        </div>
        <a className="smmOffersCta" href={contactHref} target={contactHref.startsWith("http") ? "_blank" : undefined} rel={contactHref.startsWith("http") ? "noreferrer" : undefined}>
          {offers.cta_label || "Message SMM Solutions"}
        </a>
      </div>
      <div className="smmOffersGrid">
        {cards.map((card) => (
          <article key={card.id} className="smmOfferCard">
            {card.imageUrl && <img src={card.imageUrl} alt={card.title || "SMM offer"} className="smmOfferImage" loading="lazy" />}
            <strong>{card.title || "SMM offer"}</strong>
            <p>{card.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function BookingPrototype({ business: incomingBusiness, onBack, onSaveBooking, onSubmitPayment, smmOffers = null }) {
  const business = useMemo(() => normalizeBusinessConfig({
    ...(incomingBusiness || {}),
    services: Array.isArray(incomingBusiness?.services) ? incomingBusiness.services : [],
    serviceDetails: Array.isArray(incomingBusiness?.serviceDetails) ? incomingBusiness.serviceDetails : [],
    forms: Array.isArray(incomingBusiness?.forms) && incomingBusiness.forms.length ? incomingBusiness.forms : undefined,
    availability: incomingBusiness?.availability && typeof incomingBusiness.availability === "object" ? incomingBusiness.availability : {},
    featureFlags: incomingBusiness?.featureFlags && typeof incomingBusiness.featureFlags === "object" ? incomingBusiness.featureFlags : {},
  }), [incomingBusiness]);
  const [pickedService, setPickedService] = useState(business.services[0]);
  const [pickedServices, setPickedServices] = useState([business.services[0]].filter(Boolean));
  const [selectedPlanImage, setSelectedPlanImage] = useState(null);
  const availableSlots = business.availability?.slots?.length ? business.availability.slots : slots;
  const [pickedSlot, setPickedSlot] = useState(availableSlots[1] || availableSlots[0] || "10:15 AM");
  const [selectedBookingDate, setSelectedBookingDate] = useState(getTodayDateValue());
  const [selectedCheckoutDate, setSelectedCheckoutDate] = useState(() => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    return next.toISOString().slice(0, 10);
  });
  const [guestCount, setGuestCount] = useState(2);
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
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
  const demoExpiryState = getDemoExpiryState(business);
  const blockedDates = business.availability?.blockedDates || [];
  const isBlockedDate = blockedDates.some((blockedDate) => blockedDate.blocked_date === selectedBookingDate && blockedDate.active !== false);
  const selectedDateLabel = formatBookingDate(selectedBookingDate);
  const selectedWeekdayLabel = formatBookingWeekday(selectedBookingDate);
  const bookingTone = resolveBusinessTone(business);
  const isClinic = bookingTone === "clinic";
  const isToursTravel = bookingTone === "tours-travel";
  const isAccommodation = normalizeBookingTemplate(business.bookingTemplate) === "STAYCATION_ACCOMMODATION";
  const isLaundry = normalizeBookingTemplate(business.bookingTemplate) === "LAUNDRY";
  const isTravel = bookingTone === "travel" || isToursTravel;
  const isHomeService = bookingTone === "home-service";
  const isConsultant = bookingTone === "professional-services";
  const brandInitial = (business.business || "S").trim().charAt(0).toUpperCase();
  const templateCopy = getBookingTemplateCopy(business.bookingTemplate, business);
  const brandCategory = templateCopy.category;
  const brandLine = templateCopy.tagline;
  const headingText = isAccommodation ? "Reserve Your Stay" : isToursTravel ? "Book Your Tour" : isLaundry ? "Book Laundry Pickup" : isConsultant ? "Plans & Services" : isHomeService ? "Book a Service" : flags.bookingEnabled ? "Book an appointment" : "Send an inquiry";
  const headerSubtext = isAccommodation ? (business.description || "Choose your room or unit, check-in date, check-out date, and guest count.") : isToursTravel ? (business.description || "Choose your tour package and preferred travel date.") : isLaundry ? (business.description || "Choose your laundry service, pickup date, and pickup time.") : isConsultant ? (business.description || "Choose a plan, view the full details, and send your inquiry.") : isHomeService ? "Choose the service you need and your preferred date and time." : business.description;
  const serviceStepLabel = isAccommodation ? "Choose Room / Unit" : isToursTravel ? "Choose a Tour Package" : isLaundry ? "Choose a Laundry Service" : isConsultant ? "Plans & Services" : isHomeService ? "Choose a Service" : "Choose a service";
  const ServiceStepIcon = resolveTemplateSectionIcon(business.bookingTemplate);
  const timeStepLabel = isAccommodation ? "Check-in & Check-out" : isToursTravel ? "Select Travel Date" : isLaundry ? "Pickup Date & Time" : isHomeService ? "Choose date and time" : "Pick a time";
  const slotLabel = isToursTravel ? "Preferred Time / Pickup Time" : isLaundry ? "Pickup Time" : "";
  const detailsStepLabel = isAccommodation ? "Guest Information" : isToursTravel ? "Guest Details" : isLaundry ? "Pickup Details" : isHomeService ? "Your contact details" : "Your details";
  const noteLabel = isAccommodation ? "Special Requests" : isToursTravel ? "Special Requests / Notes" : isLaundry ? "Laundry notes" : isConsultant ? "Inquiry / Notes" : isHomeService ? "Service concern / notes" : `${business.forms[0]} / notes`;
  const notePlaceholder = isAccommodation ? "Arrival notes, requests, or questions for the host" : isToursTravel ? "Preferred pickup details, guest needs, or questions for the tour operator" : isLaundry ? "Fabric care, folding instructions, delivery notes, or special requests" : isConsultant ? "Tell us which plan you need, coverage questions, or who should contact you." : isHomeService ? "Describe the issue, unit type, or anything the technician should know" : business.forms.join(", ");
  const submitLabel = isAccommodation ? "Submit Reservation" : isToursTravel ? "Submit Reservation Request" : isLaundry ? "Submit Pickup Request" : isConsultant ? "Send Inquiry" : isHomeService ? "Submit Service Request" : flags.bookingEnabled ? "Submit booking request" : "Send inquiry";
  const paymentSettings = business.paymentSettings || {};
  const paymentMethods = (business.paymentMethods || []).filter((method) => method.active !== false);
  const allowMultipleServices = Boolean(flags.allowMultipleServices);
  const getServiceDetail = (serviceName) => {
    const detail = business.serviceDetails?.find((item) => item.name === serviceName);
    return {
      id: detail?.id || null,
      name: serviceName,
      durationMinutes: detail?.durationMinutes ?? null,
      price: detail?.price ?? null,
      pricingUnit: normalizePricingUnit(detail?.pricingUnit, isAccommodation ? "PER_NIGHT" : isToursTravel ? "PER_PAX" : "FLAT"),
      pricingType: normalizePricingType(detail?.pricingType, isAccommodation ? "PER_NIGHT" : isToursTravel ? detail?.pricingUnit || "PER_PAX" : "FIXED"),
      pricingTiers: normalizePricingTiers(detail?.pricingTiers),
      maxGuests: detail?.maxGuests ?? null,
      includedGuests: detail?.includedGuests ?? null,
      extraGuestFee: detail?.extraGuestFee ?? null,
      imageUrl: detail?.imageUrl || "",
      serviceCategory: detail?.serviceCategory || detail?.category || "",
      unitQuantity: detail?.unitQuantity ?? 1,
      description: detail?.description || "",
    };
  };
  const selectedServiceNames = allowMultipleServices ? pickedServices : [pickedService].filter(Boolean);
  const selectedServiceDetails = selectedServiceNames.map(getServiceDetail);
  const pickedServiceDetail = getServiceDetail(pickedService);
  const stayNights = getNightCount(selectedBookingDate, selectedCheckoutDate);
  const accommodationGuests = adultCount + childCount;
  const needsGuestCount = isAccommodation || selectedServiceDetails.some((detail) => ["PER_PAX", "GROUP_TIER"].includes(normalizePricingType(detail.pricingType, detail.pricingUnit)));
  const bookingCalculation = calculateBookingTotal(selectedServiceDetails, { pax: isAccommodation ? accommodationGuests : guestCount, totalGuests: accommodationGuests, nights: stayNights || 1 });
  const pickedPricing = bookingCalculation.lineItems[0] || calculateLineItem(pickedServiceDetail, { pax: guestCount, nights: stayNights || 1, totalGuests: accommodationGuests });
  const pickedPricingUnit = normalizePricingUnit(pickedServiceDetail.pricingUnit, isAccommodation ? "PER_NIGHT" : isToursTravel ? "PER_PAX" : "FLAT");
  const estimatedTotal = bookingCalculation.estimatedTotal;
  const primaryServiceLabel = selectedServiceNames.length > 1 ? `${selectedServiceNames.length} Services` : selectedServiceNames[0] || pickedService;
  const servicePriceLabel = (detail) => {
    return formatServicePriceLabel(detail, isAccommodation ? "PER_NIGHT" : isToursTravel ? "PER_PAX" : "FIXED");
  };
  const serviceMetaLabel = (detail) => [
    isConsultant && detail.serviceCategory ? detail.serviceCategory : "",
    isAccommodation && detail.maxGuests ? `Up to ${detail.maxGuests} guests` : detail.durationMinutes ? `${detail.durationMinutes} min` : "",
    detail.price !== null || detail.pricingTiers?.length ? servicePriceLabel(detail) : "",
  ].filter(Boolean).join(" • ");
  const requiredPaymentAmount = getRequiredPaymentAmount(paymentSettings, estimatedTotal);
  const paymentRequired = isProductionActive && paymentSettings.enabled && requiredPaymentAmount !== null && paymentMethods.length > 0;

  useEffect(() => {
    setPickedService(business.services[0]);
    setPickedServices([business.services[0]].filter(Boolean));
    setPickedSlot(availableSlots[1] || availableSlots[0] || "10:15 AM");
    setSelectedBookingDate(getTodayDateValue());
    setSelectedCheckoutDate(() => {
      const next = new Date();
      next.setDate(next.getDate() + 1);
      return next.toISOString().slice(0, 10);
    });
    setGuestCount(2);
    setAdultCount(2);
    setChildCount(0);
    setConfirmed(null);
    setBookingError("");
    setPaymentOpen(false);
    setPaymentStatus("");
  }, [business.slug]);

  const openServiceLink = (detail) => {
    const href = normalizeServiceLink(detail?.imageUrl);
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const toggleService = (serviceName) => {
    if (!allowMultipleServices) {
      setPickedService(serviceName);
      setPickedServices([serviceName]);
      return;
    }
    setPickedService(serviceName);
    setPickedServices((current) => {
      if (current.includes(serviceName)) {
        const next = current.filter((item) => item !== serviceName);
        return next.length ? next : [serviceName];
      }
      return [...current, serviceName];
    });
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    const bookingForm = event.currentTarget;
    setBookingError("");
    setSubmitting(true);
    const data = new FormData(bookingForm);
    const currentGuestCount = Math.max(1, Number(data.get("guestCount") || guestCount) || 1);
    const currentAdults = Math.max(1, Number(data.get("adultCount") || adultCount) || 1);
    const currentChildren = Math.max(0, Number(data.get("childCount") || childCount) || 0);
    const currentTotalGuests = isAccommodation ? currentAdults + currentChildren : currentGuestCount;
    const currentNights = isAccommodation ? getNightCount(selectedBookingDate, selectedCheckoutDate) : 1;
    const submittedCalculation = calculateBookingTotal(selectedServiceDetails, {
      pax: isAccommodation ? currentTotalGuests : currentGuestCount,
      totalGuests: currentTotalGuests,
      nights: currentNights || 1,
    });
    const pickupLocation = String(data.get("address") || "").trim();
    const booking = {
      customer: data.get("customer"),
      contact: data.get("contact"),
      business: business.business,
      businessSlug: business.slug,
      business_slug: business.slug,
      service: primaryServiceLabel,
      booking_date: flags.requireDate ? selectedBookingDate : "",
      slot: isAccommodation ? `${formatBookingDate(selectedBookingDate)} to ${formatBookingDate(selectedCheckoutDate)}` : flags.requireTime ? pickedSlot : "Inquiry only",
      note: data.get("note"),
      status: isProductionActive ? (isToursTravel ? "PENDING" : "Confirmed") : `${clientStatus} preview`,
      estimated_total: submittedCalculation.estimatedTotal,
      metadata: {
        booking_template: business.bookingTemplate,
        guest_count: currentTotalGuests,
        adult_count: isAccommodation ? currentAdults : undefined,
        child_count: isAccommodation ? currentChildren : undefined,
        check_in: isAccommodation ? selectedBookingDate : undefined,
        check_out: isAccommodation ? selectedCheckoutDate : undefined,
        number_of_nights: isAccommodation ? currentNights : undefined,
        pricing_unit: pickedPricingUnit,
        pricing_type: pickedPricing.pricingType,
        unit_price: pickedPricing.unitPrice,
        selected_tier: pickedPricing.selectedTier,
        estimated_total: submittedCalculation.estimatedTotal,
        line_items: submittedCalculation.lineItems,
        allow_multiple_services: allowMultipleServices,
        pickup_location: pickupLocation,
      },
      bookingItems: submittedCalculation.lineItems,
    };
    if (!booking.customer || !booking.contact || !booking.business_slug || !selectedServiceNames.length || !booking.slot || (flags.requireDate && !booking.booking_date) || (needsGuestCount && currentTotalGuests < 1)) {
      setBookingError("Please complete the required booking details before submitting.");
      setSubmitting(false);
      return;
    }
    if (!bookingCalculation.totalAvailable) {
      setBookingError(bookingCalculation.invalidItem?.pricingType === "GROUP_TIER"
        ? "Please contact the business for availability and pricing for this group size."
        : "One selected service has incomplete pricing. Please choose another service or contact the business.");
      setSubmitting(false);
      return;
    }
    if (isBlockedDate) {
      setBookingError("This date is unavailable. Please choose another date.");
      setSubmitting(false);
      return;
    }
    if (isAccommodation && currentNights < 1) {
      setBookingError("Check-out date must be after check-in date.");
      setSubmitting(false);
      return;
    }
    if (isAccommodation && pickedServiceDetail.maxGuests && currentTotalGuests > Number(pickedServiceDetail.maxGuests)) {
      setBookingError(`This unit accommodates up to ${pickedServiceDetail.maxGuests} guests.`);
      setSubmitting(false);
      return;
    }
    if (isToursTravel || isAccommodation || allowMultipleServices) {
      if (!submittedCalculation.totalAvailable) {
        setBookingError("Please contact the business for availability and pricing for this group size.");
        setSubmitting(false);
        return;
      }
      booking.metadata = {
        ...booking.metadata,
        pricing_type: submittedCalculation.lineItems[0]?.pricingType || "FIXED",
        unit_price: submittedCalculation.lineItems[0]?.unitPrice ?? null,
        selected_tier: submittedCalculation.lineItems[0]?.selectedTier || null,
        estimated_total: submittedCalculation.estimatedTotal,
        line_items: submittedCalculation.lineItems,
      };
      booking.estimated_total = submittedCalculation.estimatedTotal;
      booking.bookingItems = submittedCalculation.lineItems;
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
        ...getBusinessPageBackgroundStyle(business, bookingTone),
      }}
    >
      <button className="backButton premiumBackButton" onClick={onBack}><ArrowLeft size={18} /> Back to Slotwise</button>
      <section className="publicBooking premiumPublicBooking">
        <aside className="premiumBrandPanel" style={getBusinessCoverStyle(business, bookingTone)}>
          <div className="brandMark">
            {business.logo ? <img src={business.logo} alt={`${business.business} logo`} /> : <span>{brandInitial}</span>}
          </div>
          <div className="brandStory">
            <span>{brandCategory}</span>
            <h1>{business.business}</h1>
            <i />
            <p>{brandLine[0]}{brandLine[1] && <><br />{brandLine[1]}</>}</p>
          </div>
          <div className="bookingTrustCard">
            <div><CalendarDays size={22} /><span><strong>{templateCopy.trust[0][0]}</strong><small>{templateCopy.trust[0][1]}</small></span></div>
            <div><Check size={22} /><span><strong>{templateCopy.trust[1][0]}</strong><small>{templateCopy.trust[1][1]}</small></span></div>
            <div><Sparkles size={22} /><span><strong>{templateCopy.trust[2][0]}</strong><small>{templateCopy.trust[2][1]}</small></span></div>
          </div>
        </aside>

        <form className="publicForm premiumPublicForm" onSubmit={submitBooking}>
          {(isDemoPreview || isAwaitingActivation) && (
            <div className={isDemoPreview ? "clientStatusNotice demo" : "clientStatusNotice unpaid"}>
              <strong>{isDemoPreview ? "Demo preview" : "Awaiting activation"}</strong>
              <span>
                {isDemoPreview
                  ? `Test the booking flow. Submissions on this preview are simulated and will not be saved as live bookings.${demoExpiryState.dateLabel ? ` Available until: ${demoExpiryState.dateLabel}.` : " Demo expiry not set."}`
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
            <div className="bookingStepTitle"><span>1</span><strong><ServiceStepIcon size={16} />{serviceStepLabel}</strong></div>
            <div className={isConsultant ? "premiumServiceGrid consultantServiceGrid" : "premiumServiceGrid"}>
              {business.services.map((item) => {
                const detail = getServiceDetail(item);
                const ServiceIcon = resolveServiceIcon(item, business);
                const ConsultantIcon = resolveConsultantServiceIcon(detail, business);
                const isSelected = selectedServiceNames.includes(item);
                const serviceLink = normalizeServiceLink(detail.imageUrl);
                const mediaUrl = isConsultant ? "" : detail.imageUrl;
                const planLabel = detail.price === null
                  ? "See Plan Details / Inquire for Pricing"
                  : formatServicePriceLabel(detail, detail.pricingType);
                return (
                  isConsultant ? (
                    <article
                      key={detail.id || item}
                      className={isSelected ? "premiumService active consultantPlanCard" : "premiumService consultantPlanCard"}
                      aria-pressed={isSelected}
                      onClick={() => toggleService(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleService(item);
                        }
                      }}
                    >
                      <div className="consultantPlanHeader">
                        <span className="serviceIcon consultantPlanIcon consultantPlanIconCompact"><ConsultantIcon size={21} /></span>
                        {isSelected && <em><Check size={16} /></em>}
                      </div>
                      <strong>{detail.imageTitle || item}</strong>
                      {detail.serviceCategory && <small className="serviceCategoryTag">{detail.serviceCategory}</small>}
                      <small className="servicePriceTag">{planLabel}</small>
                      {detail.description && <p className="serviceDescription">{detail.description}</p>}
                      <div className="consultantPlanActions">
                        {serviceLink && (
                          <a className="planActionButton" href={serviceLink} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                            Open Plan / Service Link
                          </a>
                        )}
                      </div>
                    </article>
                  ) : (
                    <button type="button" key={detail.id || item} className={isSelected ? "premiumService active" : "premiumService"} onClick={() => toggleService(item)} aria-pressed={isSelected}>
                      <span className={isConsultant ? "serviceIcon consultantPlanIcon" : "serviceIcon"}>{mediaUrl ? <img src={mediaUrl} alt="" /> : <ServiceIcon size={22} />}</span>
                      <strong>{detail.imageTitle || item}</strong>
                      {detail.imageCaption && <p className="serviceImageCaption">{detail.imageCaption}</p>}
                      {detail.description && <p className="serviceDescription">{detail.description}</p>}
                      {flags.showPrices && serviceMetaLabel(detail) && <small>{serviceMetaLabel(detail)}</small>}
                      {isSelected && <em><Check size={16} /></em>}
                    </button>
                  )
                );
              })}
            </div>
            {allowMultipleServices && <p className="multiServiceCount">{selectedServiceNames.length} service{selectedServiceNames.length > 1 ? "s" : ""} selected</p>}
          </div>
          )}

          {(flags.requireTime || isAccommodation) && (
          <div className="bookingStep">
            <div className="bookingStepTitle"><span>2</span><strong>{timeStepLabel}</strong></div>
            {isBlockedDate && (
              <div className="clientStatusNotice unpaid">
                <strong>Date unavailable</strong>
                <span>This business marked {selectedDateLabel} as unavailable.</span>
              </div>
            )}
            <div className="timeAndDate">
              {!isAccommodation && (
                <div className="premiumSlotGrid">
                  {slotLabel && <span className="slotGroupLabel">{slotLabel}</span>}
                  {availableSlots.map((item) => (
                    <button type="button" key={item} disabled={isBlockedDate} className={pickedSlot === item ? "premiumSlot active" : "premiumSlot"} onClick={() => setPickedSlot(item)}>{item}</button>
                  ))}
                </div>
              )}
              <div className="selectedDateCard">
                <CalendarDays size={26} />
                <span>{isAccommodation ? "Stay dates" : isToursTravel ? "Travel date" : "Selected"}</span>
                <strong>{isAccommodation ? `${stayNights || 0} Night${stayNights === 1 ? "" : "s"}` : selectedDateLabel}</strong>
                <small>{isAccommodation ? `${formatBookingDate(selectedBookingDate)} to ${formatBookingDate(selectedCheckoutDate)}` : selectedWeekdayLabel}</small>
                <input
                  aria-label={isAccommodation ? "Select check-in date" : "Select booking date"}
                  type="date"
                  value={selectedBookingDate}
                  min={getTodayDateValue()}
                  onChange={(event) => setSelectedBookingDate(event.target.value)}
                  required={flags.requireDate}
                />
                {isAccommodation && (
                  <input
                    aria-label="Select check-out date"
                    type="date"
                    value={selectedCheckoutDate}
                    min={selectedBookingDate || getTodayDateValue()}
                    onChange={(event) => setSelectedCheckoutDate(event.target.value)}
                    required
                  />
                )}
              </div>
            </div>
          </div>
          )}

          <div className="bookingStep">
            <div className="bookingStepTitle"><span>3</span><strong>{detailsStepLabel}</strong></div>
            <label className="premiumInput"><User size={20} /><span>{isAccommodation ? "Full Name" : "Your name"}<input name="customer" required placeholder="Maria Santos" /></span></label>
            <label className="premiumInput"><Phone size={20} /><span>{isAccommodation ? "Mobile Number" : "Phone or contact number"}<input name="contact" required placeholder="0912 345 6789" /></span></label>
            {isAccommodation ? (
              <div className="accommodationGuestGrid">
                <label className="guestStepper">
                  <span>Adults</span>
                  <div>
                    <button type="button" onClick={() => setAdultCount((current) => Math.max(1, current - 1))}>-</button>
                    <input name="adultCount" type="number" min="1" value={adultCount} onChange={(event) => setAdultCount(Math.max(1, Number(event.target.value) || 1))} required />
                    <button type="button" onClick={() => setAdultCount((current) => current + 1)}>+</button>
                  </div>
                </label>
                <label className="guestStepper">
                  <span>Children</span>
                  <div>
                    <button type="button" onClick={() => setChildCount((current) => Math.max(0, current - 1))}>-</button>
                    <input name="childCount" type="number" min="0" value={childCount} onChange={(event) => setChildCount(Math.max(0, Number(event.target.value) || 0))} />
                    <button type="button" onClick={() => setChildCount((current) => current + 1)}>+</button>
                  </div>
                </label>
              </div>
            ) : needsGuestCount && (
              <label className="guestStepper">
                <span>{isToursTravel ? "Total guests" : "Quantity / pax"}</span>
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

          {(isToursTravel || allowMultipleServices || flags.showPrices) && (
            <div className="reservationSummary">
              <span>Booking Summary</span>
              <strong>{primaryServiceLabel}</strong>
              <p>{selectedDateLabel} {flags.requireTime ? `at ${pickedSlot}` : ""}{needsGuestCount ? ` • ${guestCount} ${isToursTravel ? "guest" : "pax"}${guestCount > 1 ? "s" : ""}` : ""}</p>
              <div className="bookingLineItems">
                {bookingCalculation.lineItems.map((item) => (
                  <div key={item.serviceName}>
                    <span>{item.serviceName}<small>{item.lineLabel}</small></span>
                    <strong>{item.lineTotal === null ? "Pricing unavailable" : formatPeso(item.lineTotal)}</strong>
                  </div>
                ))}
              </div>
              {!bookingCalculation.totalAvailable && <em>This booking option needs pricing configured before it can be submitted.</em>}
              {flags.showPrices && bookingCalculation.totalAvailable && <em>Estimated total: {formatPeso(estimatedTotal)}</em>}
            </div>
          )}

          <button className="premiumConfirmButton" type="submit" disabled={submitting || isBlockedDate}>
            {submitting ? "Submitting request..." : submitLabel} <ChevronRight size={22} />
          </button>
          {bookingError && <p className="formError premiumError">{bookingError}</p>}
          {selectedPlanImage && (
            <div className="planImageOverlay" role="dialog" aria-modal="true" aria-label={selectedPlanImage.title}>
              <button type="button" className="planImageBackdrop" onClick={() => setSelectedPlanImage(null)} aria-label="Close image viewer" />
              <section className="planImageModal">
                <button type="button" className="planImageClose" onClick={() => setSelectedPlanImage(null)}>Close</button>
                <img src={selectedPlanImage.src} alt={selectedPlanImage.title} />
                <div className="planImageMeta">
                  <strong>{selectedPlanImage.title}</strong>
                  {selectedPlanImage.caption && <p>{selectedPlanImage.caption}</p>}
                </div>
              </section>
            </div>
          )}
          {confirmed && (
            <div className="formSuccess premiumSuccess">
              <strong>{isProductionActive ? (isToursTravel ? "Reservation Request Received" : "Booking Request Received") : "Demo booking completed"}</strong>
              <span>
                {isProductionActive && (isToursTravel || isAccommodation)
                  ? `Your reservation request has been received. The ${isAccommodation ? "host" : "tour operator"} may contact you to confirm availability and final details.`
                  : isProductionActive
                  ? "Your booking request has been received. The business may contact you to confirm your appointment."
                  : "No live booking was created."}
              </span>
              <dl>
                <div><dt>Business</dt><dd>{business.business}</dd></div>
                <div><dt>{selectedServiceNames.length > 1 ? "Services" : isAccommodation ? "Room / Unit" : isToursTravel ? "Tour Package" : "Service"}</dt><dd>{confirmed.service}</dd></div>
                <div><dt>{isAccommodation ? "Check-in" : isToursTravel ? "Travel Date" : "Date"}</dt><dd>{confirmed.booking_date ? formatBookingDate(confirmed.booking_date) : "Not required"}</dd></div>
                {isAccommodation && <div><dt>Check-out</dt><dd>{formatBookingDate(confirmed.metadata?.check_out)}</dd></div>}
                {isAccommodation && <div><dt>Nights</dt><dd>{confirmed.metadata?.number_of_nights || stayNights}</dd></div>}
                <div><dt>{isAccommodation ? "Stay" : isToursTravel ? "Preferred Time" : "Time"}</dt><dd>{confirmed.slot}</dd></div>
                {(isToursTravel || isAccommodation) && <div><dt>Guests</dt><dd>{confirmed.metadata?.guest_count || guestCount}</dd></div>}
                {isToursTravel && <div><dt>Pricing Type</dt><dd>{confirmed.metadata?.pricing_type || "FIXED"}</dd></div>}
                {isToursTravel && confirmed.metadata?.selected_tier && <div><dt>Selected Group Rate</dt><dd>{confirmed.metadata.selected_tier.minGuests}-{confirmed.metadata.selected_tier.maxGuests} pax - {formatPeso(confirmed.metadata.selected_tier.price)}</dd></div>}
                {flags.showPrices && <div><dt>Estimated Total</dt><dd>{confirmed.metadata?.estimated_total || confirmed.estimated_total ? formatPeso(confirmed.metadata?.estimated_total || confirmed.estimated_total) : servicePriceLabel(pickedServiceDetail)}</dd></div>}
                <div><dt>Name</dt><dd>{confirmed.customer}</dd></div>
                <div><dt>Reference</dt><dd>{confirmed.id || "Request received"}</dd></div>
              </dl>
              <div className="bookingSuccessActions">
                <button type="button" onClick={() => setConfirmed(null)}>Book Another</button>
                {business.messengerLink && <a href={business.messengerLink} target="_blank" rel="noreferrer">Contact Business</a>}
              </div>
              {paymentRequired && (
                <div className="paymentInstructions">
                  <span>{isToursTravel || isAccommodation ? "Reservation Deposit" : "Payment Required"}</span>
                  <p><strong>Estimated Total:</strong> {estimatedTotal === null ? "Pricing unavailable" : formatPeso(estimatedTotal)}</p>
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
              {(isDemoPreview || isAwaitingActivation) && smmOffers?.enabled && smmOffers?.show_on_demo !== false && (
                <SmmOffersFeed offers={smmOffers} placement="DEMO_PREVIEW" compact />
              )}
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

function DemoExpiredPage({ business, onBack }) {
  return (
    <main className="setupPage">
      <button className="backButton" onClick={onBack}><ArrowLeft size={18} /> Back to site</button>
      <section className="setupComplete">
        <span><Clock size={22} /></span>
        <p className="eyebrow">Demo expired</p>
        <h1>This personalized system preview has ended.</h1>
        <p>
          Interested in activating your system? Please contact SMM Solutions by Pabs Rivera.
          The same configured system can be activated after payment.
        </p>
        {business?.demoExpiresAt && (
          <div className="setupSaveStatus local">Expired: {formatFriendlyDateTime(business.demoExpiresAt)}</div>
        )}
      </section>
    </main>
  );
}

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Slotwise app render error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="setupPage">
          <section className="setupComplete">
            <span><ShieldCheck size={22} /></span>
            <p className="eyebrow">Page error</p>
            <h1>This booking page could not load.</h1>
            <p>Please refresh the page or return to the site if the problem continues.</p>
            <div className="setupCompleteActions">
              <button onClick={() => window.location.reload()}>Reload</button>
            </div>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

function StructuredServiceManager({ services, onChange, onDeleteService, bookingTemplate = "GENERAL", compact = false, photoManagement = false }) {
  const copy = getServiceManagerCopy(bookingTemplate);
  const isTravel = normalizeBookingTemplate(bookingTemplate) === "TOURS_TRAVEL";
  const isAccommodation = normalizeBookingTemplate(bookingTemplate) === "STAYCATION_ACCOMMODATION";
  const isConsultant = normalizeBookingTemplate(bookingTemplate) === "PROFESSIONAL_SERVICES";
  const updateService = (index, updates) => {
    onChange(services.map((service, itemIndex) => itemIndex === index ? { ...service, ...updates } : service));
  };
  const toggleServiceStatus = (index) => {
    const service = services[index];
    updateService(index, { status: (service.status || "Active") === "Inactive" ? "Active" : "Inactive" });
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
            <article className={expanded ? "structuredServiceCard expanded" : "structuredServiceCard"} key={service.id || `new-${index}`}>
              <button type="button" className="structuredServiceSummary" onClick={() => updateService(index, { expanded: !expanded })}>
                <strong>{service.name || `${copy.single} ${index + 1}`}</strong>
                <span>{hasValidPricingConfiguration(service) ? formatPeso(normalizePricingType(service.pricingType, service.pricingUnit) === "GROUP_TIER" ? normalizePricingTiers(service.pricingTiers)[0]?.price : service.price) : "Pricing required"}</span>
                <em>{isConsultant ? ((service.status || "Active") === "Inactive" ? "Disabled" : "Enabled") : (service.status || "Active")}</em>
              </button>
              {expanded && (
                <div className="structuredServiceFields">
                  <input value={service.name} onChange={(event) => updateService(index, { name: event.target.value })} placeholder={`${copy.single} name`} />
                  {normalizeBookingTemplate(bookingTemplate) === "PROFESSIONAL_SERVICES" && <input value={service.serviceCategory || ""} onChange={(event) => updateService(index, { serviceCategory: event.target.value })} placeholder="Category / label" />}
                  <input value={service.description} onChange={(event) => updateService(index, { description: event.target.value })} placeholder="Description" />
                  <input type="number" min="0" value={service.price} onChange={(event) => updateService(index, { price: event.target.value })} placeholder={isAccommodation ? "Price per night" : "Price"} />
                  {!isAccommodation && <input type="number" min="0" value={service.durationMinutes} onChange={(event) => updateService(index, { durationMinutes: event.target.value })} placeholder="Duration in minutes" />}
                  {photoManagement && (
                    <>
                      <input type="number" min="1" value={service.maxGuests} onChange={(event) => updateService(index, { maxGuests: event.target.value })} placeholder="Maximum guests" />
                      <input type="number" min="1" value={service.includedGuests} onChange={(event) => updateService(index, { includedGuests: event.target.value })} placeholder="Included guests" />
                      <input type="number" min="0" value={service.extraGuestFee} onChange={(event) => updateService(index, { extraGuestFee: event.target.value })} placeholder="Extra guest fee / night" />
                      <input type="number" min="1" value={service.unitQuantity} onChange={(event) => updateService(index, { unitQuantity: event.target.value })} placeholder="Available quantity" />
                      <label className="serviceImageUpload">
                        <span>Plan / Service Link</span>
                        <input
                          type="text"
                          inputMode="url"
                          value={service.imageUrl || ""}
                          onChange={(event) => updateService(index, { imageUrl: event.target.value })}
                          placeholder="Paste any link: website, Google Drive, Facebook, Canva, PDF, image, etc."
                        />
                      </label>
                      <input value={service.imageTitle} onChange={(event) => updateService(index, { imageTitle: event.target.value })} placeholder="Link title (optional)" />
                      <input value={service.imageCaption} onChange={(event) => updateService(index, { imageCaption: event.target.value })} placeholder="Link description (optional)" />
                      {service.imageUrl && (
                        <a
                          className="planActionButton"
                          href={normalizeServiceLink(service.imageUrl) || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => { if (!normalizeServiceLink(service.imageUrl)) event.preventDefault(); }}
                        >
                          Test / Open Link
                        </a>
                      )}
                    </>
                  )}
                  {isAccommodation && !photoManagement && (
                    <>
                      <input type="number" min="1" value={service.maxGuests} onChange={(event) => updateService(index, { maxGuests: event.target.value })} placeholder="Maximum guests" />
                      <input type="number" min="1" value={service.includedGuests} onChange={(event) => updateService(index, { includedGuests: event.target.value })} placeholder="Included guests" />
                      <input type="number" min="0" value={service.extraGuestFee} onChange={(event) => updateService(index, { extraGuestFee: event.target.value })} placeholder="Extra guest fee / night" />
                      <input type="number" min="1" value={service.unitQuantity} onChange={(event) => updateService(index, { unitQuantity: event.target.value })} placeholder="Available quantity" />
                      <label className="serviceImageUpload">
                        <span>Plan / Service Link</span>
                        <input
                          type="text"
                          inputMode="url"
                          value={service.imageUrl || ""}
                          onChange={(event) => updateService(index, { imageUrl: event.target.value })}
                          placeholder="Paste any link: website, Google Drive, Facebook, Canva, PDF, image, etc."
                        />
                      </label>
                      <input value={service.imageTitle} onChange={(event) => updateService(index, { imageTitle: event.target.value })} placeholder="Link title (optional)" />
                      <input value={service.imageCaption} onChange={(event) => updateService(index, { imageCaption: event.target.value })} placeholder="Link description (optional)" />
                      {service.imageUrl && (
                        <a
                          className="planActionButton"
                          href={normalizeServiceLink(service.imageUrl) || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => { if (!normalizeServiceLink(service.imageUrl)) event.preventDefault(); }}
                        >
                          Test / Open Link
                        </a>
                      )}
                    </>
                  )}
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
                  {isConsultant && <button type="button" onClick={() => toggleServiceStatus(index)}>{(service.status || "Active") === "Inactive" ? "Enable plan" : "Disable plan"}</button>}
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
  const [serviceImageUploading, setServiceImageUploading] = useState(false);
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
      const nextValue = name === "pageBackgroundColor"
        ? normalizeHexColor(value, current.pageBackgroundColor || "")
        : name === "slug"
          ? makeSlug(value)
          : value;
      const next = { ...current, [name]: nextValue };
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
    if (serviceImageUploading) {
      setSaveStatus({ blocked: true, message: "Please wait for the service photo upload to finish." });
      return;
    }
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
              <h2>{setupBookingTemplate === "PROFESSIONAL_SERVICES" ? "Plans and pricing" : "Services and prices"}</h2>
              <p>{setupBookingTemplate === "PROFESSIONAL_SERVICES" ? "Add each plan or product with its category, pricing label, and photo if needed. Blank slots will not be saved." : "Add each service with price and duration. Blank slots will not be saved."}</p>
                <StructuredServiceManager services={form.serviceEntries} onChange={updateSetupServices} bookingTemplate={setupBookingTemplate} photoManagement={getPackageCapabilities(form.package, form.featureFlags).photoManagement} />
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
                <article><span>{setupBookingTemplate === "PROFESSIONAL_SERVICES" ? "Plans" : "Services"}</span><strong>{getSavableStructuredServices(form.serviceEntries, setupBookingTemplate).length} {setupBookingTemplate === "PROFESSIONAL_SERVICES" ? "plans listed" : "services listed"}</strong><em>Ready for page setup</em></article>
              </div>
            </div>
          )}

          <div className="setupNav">
            <button type="button" onClick={previousStep} disabled={step === 0}>Back</button>
            {step < setupSteps.length - 1 ? (
              <button type="button" onClick={nextStep}>Next</button>
            ) : (
              <button type="submit" disabled={serviceImageUploading}>{serviceImageUploading ? "Uploading photo..." : "Submit setup details"}</button>
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
    demoStartedAt: null,
    demoExpiresAt: null,
    contact: "",
    facebookPage: "",
    address: "",
    rules: "Book online in less than a minute. Choose a service, pick a time, and get confirmation.",
    logo: "",
    cover: "",
    primaryColor: "#bd5d6d",
    accentColor: "#f6dfe3",
    pageBackgroundType: "SOLID",
    pageBackgroundColor: "",
    pageBackgroundColor2: "",
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
    demoStartedAt: business.demoStartedAt || null,
    demoExpiresAt: business.demoExpiresAt || null,
    contact: business.phone || "",
    facebookPage: business.messengerLink || "",
    address: business.address || "",
    rules: business.description || "",
    logo: business.logo || "",
    cover: business.cover || "",
    primaryColor: business.primaryColor || "#bd5d6d",
    accentColor: business.accentColor || "#f6dfe3",
    pageBackgroundType: (business.pageBackgroundType || business.page_background_type || "SOLID").toUpperCase(),
    pageBackgroundColor: normalizeHexColor(business.pageBackgroundColor || business.page_background_color, ""),
    pageBackgroundColor2: normalizeHexColor(business.pageBackgroundColor2 || business.page_background_color_2, ""),
    services: serviceText,
    serviceEntries,
    openDays: business.availability?.days || defaultAvailability.days,
    openHours: business.availability?.hours || defaultAvailability.hours,
    slotsText: (business.availability?.slots || slots).join(", "),
    featureFlags: { ...defaultFeatureFlags, ...(business.featureFlags || {}) },
  };
}

function emptyAnnouncementForm() {
  return {
    id: "",
    title: "",
    message: "",
    announcement_type: "GENERAL",
    image_url: "",
    image_clickable: true,
    cta_type: "NONE",
    cta_label: "",
    cta_url: "",
    cta_destination: "",
    placement: "BOTH",
    business_slug: "",
    target_packages: ["ALL"],
    target_statuses: ["ALL"],
    enabled: true,
    dismissible: true,
    priority: "NORMAL",
    starts_at: "",
    ends_at: "",
  };
}

function emptySmmOffersForm() {
  return {
    id: "global",
    enabled: true,
    show_on_demo: true,
    show_on_dashboard: true,
    cta_label: "Message SMM Solutions",
    offer_one_title: "Need help getting started?",
    offer_one_message: "We can guide you through setup, branding, and the right package for your business.",
    offer_one_image_url: "",
    offer_two_title: "Want to upgrade your page?",
    offer_two_message: "We can unlock more controls as your business grows without changing your booking flow.",
    offer_two_image_url: "",
    updated_at: "",
  };
}

function normalizeSmmOffers(row = {}) {
  if (!row) return null;
  return {
    ...emptySmmOffersForm(),
    ...row,
    id: row.id || "global",
    enabled: row.enabled !== false,
    show_on_demo: row.show_on_demo !== false,
    show_on_dashboard: row.show_on_dashboard !== false,
    cta_label: row.cta_label || "Message SMM Solutions",
    offer_one_title: row.offer_one_title || emptySmmOffersForm().offer_one_title,
    offer_one_message: row.offer_one_message || emptySmmOffersForm().offer_one_message,
    offer_two_title: row.offer_two_title || emptySmmOffersForm().offer_two_title,
    offer_two_message: row.offer_two_message || emptySmmOffersForm().offer_two_message,
    offer_one_image_url: row.offer_one_image_url || "",
    offer_two_image_url: row.offer_two_image_url || "",
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
  const [announcements, setAnnouncements] = useState([]);
  const [announcementForm, setAnnouncementForm] = useState(emptyAnnouncementForm());
  const [editingAnnouncementId, setEditingAnnouncementId] = useState("");
  const [announcementSaveState, setAnnouncementSaveState] = useState({
    saving: false,
    status: "",
    databaseStatus: "",
    savedCount: 0,
    error: "",
    operation: "",
  });
  const [announcementToast, setAnnouncementToast] = useState("");
  const [smmOffers, setSmmOffers] = useState(emptySmmOffersForm());
  const [serviceImageUploading, setServiceImageUploading] = useState(false);
  const [smmOffersSaveState, setSmmOffersSaveState] = useState({
    saving: false,
    status: "",
    databaseStatus: "",
    savedCount: 0,
    error: "",
    operation: "",
  });
  const [smmOffersToast, setSmmOffersToast] = useState("");
  const logoUploadRef = useRef(null);
  const coverUploadRef = useRef(null);
  const announcementUploadRef = useRef(null);
  const smmOfferOneUploadRef = useRef(null);
  const smmOfferTwoUploadRef = useRef(null);

  const loadClientAccess = async (session) => {
    if (!session?.access_token) return [];
    const rows = await supabaseRequest("business_users", {
      query: "?select=id,user_id,business_slug,role,active,created_at&order=created_at.desc",
      accessToken: session.access_token,
    });
    setClientAccess(rows || []);
    return rows || [];
  };

  const loadAnnouncements = async (session) => {
    if (!session?.access_token) return [];
    const rows = await supabaseRequest("announcements", {
      query: "?select=*&order=priority.desc,created_at.desc",
      accessToken: session.access_token,
    });
    setAnnouncements((rows || []).map(normalizeAnnouncement));
    setAnnouncementSaveState((current) => ({ ...current, savedCount: (rows || []).length }));
    return rows || [];
  };

  const loadSmmOffers = async (session) => {
    if (!session?.access_token) return null;
    const rows = await supabaseRequest("smm_offers", {
      query: "?select=*&id=eq.global",
      accessToken: session.access_token,
    }).catch(() => []);
    const nextOffers = normalizeSmmOffers((rows || [])[0] || null) || emptySmmOffersForm();
    setSmmOffers(nextOffers);
    setSmmOffersSaveState((current) => ({ ...current, savedCount: nextOffers.id ? 1 : 0 }));
    return nextOffers;
  };

  useEffect(() => {
    if (!announcementToast) return undefined;
    const timer = window.setTimeout(() => setAnnouncementToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [announcementToast]);

  useEffect(() => {
    if (!smmOffersToast) return undefined;
    const timer = window.setTimeout(() => setSmmOffersToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [smmOffersToast]);

  useEffect(() => {
    setSmmOffers((current) => normalizeSmmOffers(current || emptySmmOffersForm()) || emptySmmOffersForm());
  }, []);

  const refreshAnnouncementSaveStatus = (nextState) => {
    setAnnouncementSaveState((current) => ({ ...current, ...nextState }));
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
    await loadSmmOffers(session);
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
      const nextValue = name === "pageBackgroundColor" || name === "pageBackgroundColor2"
        ? normalizeHexColor(value, current[name] || "")
        : name === "pageBackgroundType"
          ? (checked ? "GRADIENT" : "SOLID")
          : type === "checkbox"
          ? checked
          : value;
      const next = { ...current, [name]: nextValue };
      if (name === "businessName" && !editingSlug) next.slug = makeSlug(value);
      if (name === "slug") next.slug = makeSlug(value);
      if (name === "pageBackgroundType" && nextValue !== "GRADIENT") next.pageBackgroundColor2 = "";
      if (name === "bookingTemplate") {
        const nextTemplate = normalizeBookingTemplate(value);
        next.serviceEntries = normalizeStructuredServices(current.serviceEntries).map((service) => nextTemplate === "TOURS_TRAVEL" ? service : nextTemplate === "STAYCATION_ACCOMMODATION" ? {
          ...service,
          pricingType: "PER_NIGHT",
          pricingUnit: "PER_NIGHT",
          durationMinutes: "",
          pricingTiers: [],
        } : {
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

  const uploadBrandAsset = async (kind, file) => {
    validateBrandMediaFile(file);
    const slug = makeSlug(editingSlug || form.slug || form.businessName || "client-business");
    const extension = getFileExtension(file);
    const stamp = Date.now();
    const folder = kind === "cover" ? "covers" : "logos";
    const path = `${folder}/${slug}/${kind}-${stamp}.${extension}`;
    const url = await supabaseStorageUpload(path, file, adminSession?.access_token);
    setForm((current) => ({ ...current, [kind]: url }));
    setStatusMessage(`${kind === "cover" ? "Cover image" : "Logo"} uploaded.`);
    return url;
  };

  const uploadAnnouncementAsset = async (file) => {
    validateAnnouncementMediaFile(file);
    const slug = makeSlug(editingSlug || form.slug || form.businessName || "client-business");
    const extension = getFileExtension(file);
    const stamp = Date.now();
    const path = `announcements/${slug}/announcement-${stamp}.${extension}`;
    const url = await supabaseStorageUpload(path, file, adminSession?.access_token);
    setAnnouncementForm((current) => ({ ...current, image_url: url }));
    setStatusMessage("Announcement image uploaded.");
    return url;
  };

  const clearBrandAsset = (kind) => {
    setForm((current) => ({ ...current, [kind]: "" }));
    setStatusMessage(`${kind === "cover" ? "Cover image" : "Logo"} removed.`);
  };

  const clearAnnouncementAsset = () => {
    setAnnouncementForm((current) => ({ ...current, image_url: "" }));
    setStatusMessage("Announcement image removed.");
  };

  const refreshSmmOffersSaveStatus = (nextState) => {
    setSmmOffersSaveState((current) => ({ ...current, ...nextState }));
  };

  const uploadSmmOfferAsset = async (kind, file) => {
    validateBrandMediaFile(file);
    const extension = getFileExtension(file);
    const stamp = Date.now();
    const folder = kind === "offer_two_image_url" ? "offer-two" : "offer-one";
    const path = `smm-offers/global/${folder}-${stamp}.${extension}`;
    const url = await supabaseStorageUpload(path, file, adminSession?.access_token);
    setSmmOffers((current) => ({ ...current, [kind]: url }));
    setStatusMessage(`${kind === "offer_two_image_url" ? "Second offer" : "First offer"} image uploaded.`);
    return url;
  };

  const clearSmmOfferAsset = (kind) => {
    setSmmOffers((current) => ({ ...current, [kind]: "" }));
    setStatusMessage(`${kind === "offer_two_image_url" ? "Second offer" : "First offer"} image removed.`);
  };

  const updateSmmOffersForm = (event) => {
    const { name, value, type, checked } = event.target;
    setSmmOffers((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const getSafeSmmOffersSaveError = (error) => {
    const message = String(error?.message || error || "").toLowerCase();
    if (message.includes("permission") || message.includes("rls") || message.includes("not authorized")) return "Permission denied.";
    if (message.includes("network") || message.includes("fetch") || message.includes("failed to fetch")) return "Network error.";
    if (message.includes("null value") || message.includes("required") || message.includes("missing")) return "Required field missing.";
    return error?.message || "Database insert failed.";
  };

  const saveSmmOffers = async (event) => {
    event.preventDefault();
    if (!adminSession?.access_token) return;
    refreshSmmOffersSaveStatus({
      saving: true,
      status: "Saving...",
      databaseStatus: "Checking database...",
      error: "",
      operation: "UPSERT",
    });
    setSmmOffersToast("Saving...");
    try {
      const payload = {
        id: "global",
        enabled: Boolean(smmOffers.enabled),
        show_on_demo: Boolean(smmOffers.show_on_demo),
        show_on_dashboard: Boolean(smmOffers.show_on_dashboard),
        cta_label: "Message SMM Solutions",
        offer_one_title: String(smmOffers.offer_one_title || "").trim(),
        offer_one_message: String(smmOffers.offer_one_message || "").trim(),
        offer_one_image_url: String(smmOffers.offer_one_image_url || "").trim(),
        offer_two_title: String(smmOffers.offer_two_title || "").trim(),
        offer_two_message: String(smmOffers.offer_two_message || "").trim(),
        offer_two_image_url: String(smmOffers.offer_two_image_url || "").trim(),
        updated_at: new Date().toISOString(),
      };
      const existingRows = await supabaseRequest("smm_offers", {
        query: "?select=*&id=eq.global",
        accessToken: adminSession.access_token,
      }).catch(() => []);
      if (existingRows?.length) {
        const updateResult = await supabaseRequest("smm_offers", {
          method: "PATCH",
          query: "?id=eq.global",
          body: payload,
          accessToken: adminSession.access_token,
        });
        if (!Array.isArray(updateResult) || !updateResult.length) throw new Error("Offer update returned no row.");
      } else {
        const [insertedRow] = await supabaseRequest("smm_offers", {
          method: "POST",
          body: payload,
          accessToken: adminSession.access_token,
        });
        if (!insertedRow?.id) throw new Error("Offer insert returned no row.");
      }
      const [freshRow] = await supabaseRequest("smm_offers", {
        query: "?select=*&id=eq.global",
        accessToken: adminSession.access_token,
      });
      if (!freshRow) throw new Error("Offer was not returned after refresh.");
      const confirmedOffers = normalizeSmmOffers(freshRow);
      setSmmOffers(confirmedOffers);
      refreshSmmOffersSaveStatus({
        saving: false,
        status: "Offers saved successfully.",
        databaseStatus: "Database: Synced ✓",
        savedCount: 1,
        error: "",
      });
      setSmmOffersToast("✓ Offers saved");
      setStatusMessage("Offers saved successfully. Database: Synced ✓");
    } catch (error) {
      console.error("SMM offers save failed", error);
      const safeError = getSafeSmmOffersSaveError(error);
      refreshSmmOffersSaveStatus({
        saving: false,
        status: "Save failed",
        databaseStatus: "Sync failed",
        error: safeError,
      });
      setSmmOffersToast("✕ Offers save failed");
      setStatusMessage(`Offers could not be saved. ${safeError}`);
    }
  };

  const startAnnouncement = (announcement = emptyAnnouncementForm()) => {
    setEditingAnnouncementId(announcement.id || "");
    setAnnouncementForm({
      ...emptyAnnouncementForm(),
      ...announcement,
      target_packages: Array.isArray(announcement.target_packages) ? announcement.target_packages : ["ALL"],
      target_statuses: Array.isArray(announcement.target_statuses) ? announcement.target_statuses : ["ALL"],
    });
  };

  const updateAnnouncementForm = (event) => {
    const { name, value, checked, type } = event.target;
    if (name === "target_packages" || name === "target_statuses") {
      const nextValue = value.toUpperCase();
      setAnnouncementForm((current) => {
        const currentList = current[name] || [];
        const list = checked ? Array.from(new Set([...currentList, nextValue])) : currentList.filter((item) => item !== nextValue);
        return { ...current, [name]: list.length ? list : ["ALL"] };
      });
      return;
    }
    if (name === "cta_type") {
      setAnnouncementForm((current) => ({
        ...current,
        cta_type: value,
        cta_label: value === "NONE" ? "" : current.cta_label,
        cta_url: value === "EXTERNAL_LINK" ? current.cta_url : "",
        cta_destination: value === "INTERNAL_PAGE" ? current.cta_destination : value === "MESSENGER" ? "" : "",
      }));
      return;
    }
    setAnnouncementForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const chooseAnnouncementPreset = (preset) => {
    startAnnouncement({
      ...emptyAnnouncementForm(),
      ...preset,
      id: "",
      starts_at: "",
      ends_at: "",
    });
    setStatusMessage("Announcement preset loaded.");
  };

  const getSafeAnnouncementSaveError = (error) => {
    const message = String(error?.message || error || "").toLowerCase();
    if (message.includes("permission") || message.includes("rls") || message.includes("not authorized")) return "Permission denied.";
    if (message.includes("network") || message.includes("fetch") || message.includes("failed to fetch")) return "Network error.";
    if (message.includes("null value") || message.includes("required") || message.includes("missing")) return "Required field missing.";
    return error?.message || "Database insert failed.";
  };

  const saveAnnouncement = async (event) => {
    event.preventDefault();
    if (!adminSession?.access_token) return;
    refreshAnnouncementSaveStatus({
      saving: true,
      status: "Saving...",
      databaseStatus: "Checking database...",
      error: "",
      operation: editingAnnouncementId ? "UPDATE" : "INSERT",
    });
    setAnnouncementToast("Saving...");
    try {
      const payload = {
        id: editingAnnouncementId || `ann-${Date.now()}`,
        title: announcementForm.title.trim(),
        message: announcementForm.message.trim(),
        announcement_type: announcementForm.announcement_type,
        image_url: announcementForm.image_url.trim(),
        image_clickable: Boolean(announcementForm.image_clickable),
        cta_type: announcementForm.cta_type,
        cta_label: announcementForm.cta_label.trim(),
        cta_url: announcementForm.cta_type === "EXTERNAL_LINK" ? announcementForm.cta_url.trim() : "",
        cta_destination: announcementForm.cta_type === "INTERNAL_PAGE" || announcementForm.cta_type === "MESSENGER" ? announcementForm.cta_destination.trim() : "",
        placement: announcementForm.placement,
        business_slug: announcementForm.business_slug.trim() || null,
        target_packages: announcementForm.target_packages?.length ? announcementForm.target_packages : ["ALL"],
        target_statuses: announcementForm.target_statuses?.length ? announcementForm.target_statuses : ["ALL"],
        enabled: Boolean(announcementForm.enabled),
        dismissible: Boolean(announcementForm.dismissible),
        priority: announcementForm.priority,
        starts_at: announcementForm.starts_at || null,
        ends_at: announcementForm.ends_at || null,
        updated_at: new Date().toISOString(),
      };
      if (!payload.title || !payload.message) {
        refreshAnnouncementSaveStatus({
          saving: false,
          status: "Save failed",
          databaseStatus: "Sync failed",
          error: "Required field missing.",
        });
        setAnnouncementToast("✕ Announcement save failed");
        setStatusMessage("Announcement could not be saved. Required field missing.");
        return;
      }
      const targetId = payload.id;
      if (editingAnnouncementId) {
        const updateResult = await supabaseRequest("announcements", {
          method: "PATCH",
          query: `?id=eq.${encodeURIComponent(editingAnnouncementId)}`,
          body: payload,
          accessToken: adminSession.access_token,
        });
        if (!Array.isArray(updateResult) || !updateResult.length) {
          throw new Error("Announcement update returned no row.");
        }
      } else {
        const [insertedRow] = await supabaseRequest("announcements", {
          method: "POST",
          body: payload,
          accessToken: adminSession.access_token,
        });
        if (insertedRow?.id && insertedRow.id !== targetId) {
          throw new Error("Announcement insert returned the wrong record.");
        }
      }
      const [freshRow] = await supabaseRequest("announcements", {
        query: `?select=*&id=eq.${encodeURIComponent(targetId)}`,
        accessToken: adminSession.access_token,
      });
      if (!freshRow) {
        throw new Error("Announcement was not returned after refresh.");
      }
      const confirmedRows = (await loadAnnouncements(adminSession)).map(normalizeAnnouncement);
      const confirmedAnnouncement = confirmedRows.find((row) => row.id === targetId || row.title === payload.title);
      if (!confirmedAnnouncement) {
        throw new Error("Announcement was not returned after refresh.");
      }
      refreshAnnouncementSaveStatus({
        saving: false,
        status: "Announcement saved successfully.",
        databaseStatus: "Database: Synced ✓",
        savedCount: confirmedRows.length,
        error: "",
      });
      setAnnouncementToast("✓ Announcement saved");
      setStatusMessage(`Announcement saved successfully. Database: Synced ✓ (${confirmedRows.length} saved)`);
      startAnnouncement();
    } catch (error) {
      console.error("Announcement save failed", error);
      const safeError = getSafeAnnouncementSaveError(error);
      refreshAnnouncementSaveStatus({
        saving: false,
        status: "Save failed",
        databaseStatus: "Sync failed",
        error: safeError,
        lastErrorCode: error?.code || error?.status || "",
      });
      setAnnouncementToast("✕ Announcement save failed");
      setStatusMessage(`Announcement could not be saved. ${safeError}`);
    }
  };

  const removeAnnouncement = async (announcementId) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await supabaseRequest("announcements", {
        method: "DELETE",
        query: `?id=eq.${encodeURIComponent(announcementId)}`,
        accessToken: adminSession?.access_token,
      });
      await loadAnnouncements(adminSession);
      setStatusMessage("Announcement deleted.");
    } catch (error) {
      console.error("Announcement delete failed", error);
      setStatusMessage(error.message || "Unable to delete announcement.");
    }
  };

  const toggleAnnouncementEnabled = async (announcement) => {
    try {
      await supabaseRequest("announcements", {
        method: "PATCH",
        query: `?id=eq.${encodeURIComponent(announcement.id)}`,
        body: { enabled: !announcement.enabled, updated_at: new Date().toISOString() },
        accessToken: adminSession?.access_token,
      });
      await loadAnnouncements(adminSession);
      setStatusMessage(announcement.enabled ? "Announcement disabled." : "Announcement enabled.");
    } catch (error) {
      console.error("Announcement status update failed", error);
      setStatusMessage(error.message || "Unable to update announcement.");
    }
  };

  const resetPageBackgroundColor = () => {
    const defaults = getToneThemeDefaults(getBookingTemplateTone(form.bookingTemplate));
    setForm((current) => ({
      ...current,
      pageBackgroundType: "SOLID",
      pageBackgroundColor: defaults.pageBackgroundColor,
      pageBackgroundColor2: "",
    }));
    setStatusMessage("Page background reset to the template default.");
  };

  const announcementRows = sortAnnouncements(announcements);

  const handleBrandFilePick = async (kind, event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      await uploadBrandAsset(kind, file);
    } catch (error) {
      console.error("Brand asset upload failed", error);
      setStatusMessage(error.message || "Upload failed.");
    }
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

  const restartDemo = async () => {
    const targetSlug = editingSlug || form.slug;
    if (!targetSlug || form.status !== "DEMO") return;
    if (!window.confirm("Restart this client's 24-hour demo period?")) return;
    const demoWindow = createDemoWindow();
    await supabaseRequest("businesses", {
      method: "PATCH",
      query: `?slug=eq.${encodeURIComponent(targetSlug)}`,
      body: demoWindow,
      accessToken: adminSession?.access_token,
    });
    setForm((current) => ({
      ...current,
      demoStartedAt: demoWindow.demo_started_at,
      demoExpiresAt: demoWindow.demo_expires_at,
    }));
    await onRefresh();
    setStatusMessage("24-hour demo restarted.");
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
  const demoExpiryState = getDemoExpiryState(form);
  const demoExpiryText = form.demoExpiresAt ? formatFriendlyDateTime(form.demoExpiresAt) : "Demo expiry not set";
  const demoHandoffMessage = demoExpiryState.state === "expired"
    ? `Demo has expired.

This client's demo expired on ${demoExpiryText}.

Use "Restart 24-Hour Demo" before sending a new demo link.`
    : `Hi! Your personalized Booking & Inquiry System preview is ready.

Business:
${form.businessName || "Your business"}

Package Preview:
${packageText}

Demo Link:
${publicLink}

Demo Duration:
24 Hours

Demo Expires:
${demoExpiryText}

You may explore and test the booking/inquiry system before deciding.

Please note:
This is a demo preview only. Test submissions are not treated as actual customer bookings or reservations.

If you decide to proceed, we can activate the same customized system for lifetime use based on your selected package.

SYSTEM MUNA BAGO BAYAD

SMM Solutions by Pabs Rivera`;
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
            <label>Primary color<input name="primaryColor" type="color" value={form.primaryColor} onChange={updateForm} /></label>
            <label>Accent color<input name="accentColor" type="color" value={form.accentColor} onChange={updateForm} /></label>
            <label>Open days<input name="openDays" value={form.openDays} onChange={updateForm} /></label>
            <label>Open hours<input name="openHours" value={form.openHours} onChange={updateForm} /></label>
            <label>Time slots<input name="slotsText" value={form.slotsText} onChange={updateForm} /></label>
          </div>
          <section className="brandingEditor">
            <div className="brandingCard">
              <div className="brandingCardHeader">
                <div>
                  <p className="eyebrow">Business logo</p>
                  <h3>Upload or paste a logo URL</h3>
                </div>
                <button type="button" onClick={() => logoUploadRef.current?.click()}>Upload Logo</button>
              </div>
              <div className="brandingPreview brandingLogoPreview">
                {form.logo ? <img src={form.logo} alt="Business logo preview" /> : <span>{(form.businessName || "B").trim().charAt(0).toUpperCase()}</span>}
              </div>
              <div className="brandingActions">
                <input ref={logoUploadRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleBrandFilePick("logo", event)} hidden />
                <input name="logo" value={form.logo} onChange={updateForm} placeholder="Logo URL" />
                <button type="button" onClick={() => logoUploadRef.current?.click()}>Replace Logo</button>
                <button type="button" onClick={() => clearBrandAsset("logo")}>Remove Logo</button>
              </div>
            </div>
            <div className="brandingCard">
              <div className="brandingCardHeader">
                <div>
                  <p className="eyebrow">Cover / hero image</p>
                  <h3>Upload a property or business image</h3>
                </div>
                <button type="button" onClick={() => coverUploadRef.current?.click()}>Upload Cover Image</button>
              </div>
              <div className="brandingPreview brandingCoverPreview" style={form.cover ? { backgroundImage: `url(${form.cover})` } : {}}>
                {!form.cover && <span>Fallback preview</span>}
              </div>
              <div className="brandingActions">
                <input ref={coverUploadRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleBrandFilePick("cover", event)} hidden />
                <input name="cover" value={form.cover} onChange={updateForm} placeholder="Cover image URL" />
                <button type="button" onClick={() => coverUploadRef.current?.click()}>Replace Cover</button>
                <button type="button" onClick={() => clearBrandAsset("cover")}>Remove Cover</button>
              </div>
            </div>
            <div className="brandingCard">
              <div className="brandingCardHeader">
                <div>
                  <p className="eyebrow">Page background</p>
                  <h3>Overall page background</h3>
                </div>
                <button type="button" onClick={resetPageBackgroundColor}>Reset to Template Default</button>
              </div>
              <div
                className="brandingPreview brandingBackgroundPreview"
                style={getBusinessPageBackgroundStyle(form, getBookingTemplateTone(form.bookingTemplate))}
              />
              <div className="brandingActions brandingColorActions">
                <label className="brandingInlineToggle">
                  <input
                    name="pageBackgroundType"
                    type="checkbox"
                    checked={(form.pageBackgroundType || "SOLID").toUpperCase() === "GRADIENT"}
                    onChange={updateForm}
                  />
                  Use Gradient
                </label>
                <input
                  name="pageBackgroundColor"
                  type="color"
                  value={normalizeHexColor(
                    form.pageBackgroundColor,
                    getToneThemeDefaults(getBookingTemplateTone(form.bookingTemplate)).pageBackgroundColor,
                  )}
                  onChange={updateForm}
                  aria-label="Page background color"
                />
                <input
                  name="pageBackgroundColor"
                  value={form.pageBackgroundColor}
                  onChange={updateForm}
                  placeholder={getToneThemeDefaults(getBookingTemplateTone(form.bookingTemplate)).pageBackgroundColor}
                />
                {(form.pageBackgroundType || "SOLID").toUpperCase() === "GRADIENT" && (
                  <>
                    <input
                      name="pageBackgroundColor2"
                      type="color"
                      value={normalizeHexColor(form.pageBackgroundColor2, getToneThemeDefaults(getBookingTemplateTone(form.bookingTemplate)).accentColor)}
                      onChange={updateForm}
                      aria-label="Page background second color"
                    />
                    <input
                      name="pageBackgroundColor2"
                      value={form.pageBackgroundColor2}
                      onChange={updateForm}
                      placeholder={getToneThemeDefaults(getBookingTemplateTone(form.bookingTemplate)).accentColor}
                    />
                  </>
                )}
                <span className="brandingColorHint">Outer page background color</span>
              </div>
            </div>
          </section>
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
          <section className="smmOffersEditor">
            <div className="smmOffersEditorHeader">
              <div>
                <p className="eyebrow">SMM offers</p>
                <h3>Global promo messages</h3>
                <span>One shared config for the demo page and client dashboard. CTA stays fixed to Message SMM Solutions.</span>
              </div>
              <div className="smmOffersEditorFlags">
                <label><input type="checkbox" name="enabled" checked={Boolean(smmOffers.enabled)} onChange={updateSmmOffersForm} /> Enabled</label>
                <label><input type="checkbox" name="show_on_demo" checked={Boolean(smmOffers.show_on_demo)} onChange={updateSmmOffersForm} /> Show on demo</label>
                <label><input type="checkbox" name="show_on_dashboard" checked={Boolean(smmOffers.show_on_dashboard)} onChange={updateSmmOffersForm} /> Show on dashboard</label>
              </div>
            </div>
            {smmOffersSaveState.status && (
              <div className={`announcementSaveBanner ${smmOffersSaveState.error ? "error" : "success"}`}>
                <div>
                  <strong>{smmOffersSaveState.status}</strong>
                  <span>{smmOffersSaveState.error || "Saved to database."}</span>
                </div>
                <div className="announcementSaveMeta">
                  <span>{smmOffersSaveState.databaseStatus || "Database: Sync pending"}</span>
                  <span>{smmOffersSaveState.savedCount} saved</span>
                </div>
              </div>
            )}
            {smmOffersToast && <div className="announcementToast">{smmOffersToast}</div>}
            <form className="smmOffersGridEditor" onSubmit={saveSmmOffers}>
              {[
                { key: "offer_one", titleField: "offer_one_title", messageField: "offer_one_message", imageField: "offer_one_image_url", label: "First promo" },
                { key: "offer_two", titleField: "offer_two_title", messageField: "offer_two_message", imageField: "offer_two_image_url", label: "Second promo" },
              ].map((item, index) => (
                <article key={item.key} className="smmOfferEditorCard">
                  <div className="announcementEditorTopRow">
                    <div>
                      <p className="eyebrow">{item.label}</p>
                      <h4>{index === 0 ? "Package teaser" : "Reseller teaser"}</h4>
                    </div>
                    <button type="button" onClick={() => clearSmmOfferAsset(item.imageField)}>Clear image</button>
                  </div>
                  <div className="announcementMediaPanel">
                    <div className="announcementMediaPreview">
                      {smmOffers[item.imageField] ? (
                        <img src={smmOffers[item.imageField]} alt={smmOffers[item.titleField] || "Offer preview"} />
                      ) : (
                        <span>No image yet</span>
                      )}
                    </div>
                    <div className="announcementMediaActions">
                      <input
                        ref={index === 0 ? smmOfferOneUploadRef : smmOfferTwoUploadRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (!file) return;
                          uploadSmmOfferAsset(item.imageField, file).catch((error) => {
                            console.error("SMM offer image upload failed", error);
                            setStatusMessage(error.message || "Upload failed.");
                          });
                        }}
                        hidden
                      />
                      <button type="button" onClick={() => (index === 0 ? smmOfferOneUploadRef.current?.click() : smmOfferTwoUploadRef.current?.click())}>Upload Image</button>
                      <button type="button" onClick={() => (index === 0 ? smmOfferOneUploadRef.current?.click() : smmOfferTwoUploadRef.current?.click())}>Replace Image</button>
                    </div>
                    <input name={item.imageField} value={smmOffers[item.imageField]} onChange={updateSmmOffersForm} placeholder="Image URL or uploaded file link" />
                  </div>
                  <label>
                    Title
                    <input name={item.titleField} value={smmOffers[item.titleField]} onChange={updateSmmOffersForm} placeholder={index === 0 ? "Need help getting started?" : "Want to upgrade your page?"} />
                  </label>
                  <label>
                    Message
                    <textarea name={item.messageField} value={smmOffers[item.messageField]} onChange={updateSmmOffersForm} rows="4" placeholder={index === 0 ? "Short promo copy for the first card." : "Short promo copy for the second card."} />
                  </label>
                </article>
              ))}
              <div className="announcementEditorActions">
                <button type="submit" disabled={smmOffersSaveState.saving}>{smmOffersSaveState.saving ? "Saving..." : "Save Offers"}</button>
              </div>
            </form>
          </section>
          {false && (
          <section className="announcementManager">
            <div className="announcementManagerHeader">
              <div>
                <p className="eyebrow">Announcements / memos</p>
                <h3>Central updates for demo and client dashboards</h3>
                <span>Use this for promos, reminders, upgrade notes, and important notices.</span>
              </div>
              <div className="announcementPresetRow">
                {announcementPresetOptions.map((preset) => (
                  <button type="button" key={preset.id} onClick={() => chooseAnnouncementPreset(preset)}>
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
            {announcementSaveState.status && (
              <div className={`announcementSaveBanner ${announcementSaveState.error ? "error" : "success"}`}>
                <div>
                  <strong>{announcementSaveState.status}</strong>
                  <span>{announcementSaveState.error || "Saved to database."}</span>
                </div>
                <div className="announcementSaveMeta">
                  <span>{announcementSaveState.databaseStatus || "Database: Sync pending"}</span>
                  <span>{announcementSaveState.savedCount} saved</span>
                </div>
              </div>
            )}
            {announcementToast && <div className="announcementToast">{announcementToast}</div>}
            <div className="announcementManagerGrid">
              <form className="announcementEditorPanel" onSubmit={saveAnnouncement}>
                <div className="announcementEditorTopRow">
                  <div>
                    <p className="eyebrow">{editingAnnouncementId ? "Edit announcement" : "New announcement"}</p>
                    <h4>{editingAnnouncementId ? "Update memo" : "Create memo"}</h4>
                  </div>
                  {editingAnnouncementId && <button type="button" onClick={() => startAnnouncement()}>New Announcement</button>}
                </div>
                <div className="announcementEditorGrid">
                  <label className="announcementFullWidth">
                    Promo Image / Banner
                    <div className="announcementMediaPanel">
                      <div className="announcementMediaPreview">
                        {announcementForm.image_url ? (
                          <img src={announcementForm.image_url} alt={announcementForm.title || "Announcement preview"} />
                        ) : (
                          <span>Image preview appears here</span>
                        )}
                      </div>
                      <div className="announcementMediaActions">
                        <input ref={announcementUploadRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => {
                          const file = event.target.files?.[0];
                          event.target.value = "";
                          if (!file) return;
                          uploadAnnouncementAsset(file).catch((error) => {
                            console.error("Announcement image upload failed", error);
                            setStatusMessage(error.message || "Upload failed.");
                          });
                        }} hidden />
                        <button type="button" onClick={() => announcementUploadRef.current?.click()}>Upload Image</button>
                        <button type="button" onClick={() => announcementUploadRef.current?.click()}>Replace Image</button>
                        <button type="button" onClick={clearAnnouncementAsset}>Remove Image</button>
                      </div>
                      <input name="image_url" value={announcementForm.image_url} onChange={updateAnnouncementForm} placeholder="Image URL or uploaded file link" />
                      <label className="announcementInlineToggle">
                        <input type="checkbox" name="image_clickable" checked={Boolean(announcementForm.image_clickable)} onChange={updateAnnouncementForm} />
                        Make Banner Clickable
                      </label>
                    </div>
                  </label>
                  <label>
                    Title
                    <input name="title" value={announcementForm.title} onChange={updateAnnouncementForm} placeholder="System update" required />
                  </label>
                  <label>
                    Type
                    <select name="announcement_type" value={announcementForm.announcement_type} onChange={updateAnnouncementForm}>
                      {announcementTypeOptions.map((item) => <option key={item} value={item}>{item.replace(/_/g, " ")}</option>)}
                    </select>
                  </label>
                  <label className="announcementFullWidth">
                    Message
                    <textarea name="message" value={announcementForm.message} onChange={updateAnnouncementForm} rows="4" placeholder="Write the memo or announcement here." required />
                  </label>
                  <label>
                    CTA
                    <select name="cta_type" value={announcementForm.cta_type} onChange={updateAnnouncementForm}>
                      {announcementCtaTypeOptions.map((item) => <option key={item} value={item}>{item.replace(/_/g, " ")}</option>)}
                    </select>
                  </label>
                  {announcementForm.cta_type !== "NONE" && (
                    <label>
                      CTA label
                      <input name="cta_label" value={announcementForm.cta_label} onChange={updateAnnouncementForm} placeholder="Message Us" />
                    </label>
                  )}
                  {announcementForm.cta_type === "INTERNAL_PAGE" && (
                    <label>
                      Destination
                      <select name="cta_destination" value={announcementForm.cta_destination} onChange={updateAnnouncementForm}>
                        <option value="">Choose a page</option>
                        {announcementInternalPageOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                      </select>
                    </label>
                  )}
                  {announcementForm.cta_type === "EXTERNAL_LINK" && (
                    <label>
                      External URL
                      <input name="cta_url" value={announcementForm.cta_url} onChange={updateAnnouncementForm} placeholder="https://..." />
                    </label>
                  )}
                  <label>
                    Placement
                    <select name="placement" value={announcementForm.placement} onChange={updateAnnouncementForm}>
                      {announcementPlacementOptions.map((item) => <option key={item} value={item}>{item.replace(/_/g, " ")}</option>)}
                    </select>
                  </label>
                  <label>
                    Priority
                    <select name="priority" value={announcementForm.priority} onChange={updateAnnouncementForm}>
                      {announcementPriorityOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  <label>
                    Specific business slug
                    <input name="business_slug" value={announcementForm.business_slug} onChange={updateAnnouncementForm} placeholder="Leave blank for all businesses" />
                  </label>
                  <label>
                    Starts at
                    <input name="starts_at" type="datetime-local" value={announcementForm.starts_at} onChange={updateAnnouncementForm} />
                  </label>
                  <label>
                    Ends at
                    <input name="ends_at" type="datetime-local" value={announcementForm.ends_at} onChange={updateAnnouncementForm} />
                  </label>
                  <div className="announcementFlags">
                    <label><input type="checkbox" name="enabled" checked={Boolean(announcementForm.enabled)} onChange={updateAnnouncementForm} /> Enabled</label>
                    <label><input type="checkbox" name="dismissible" checked={Boolean(announcementForm.dismissible)} onChange={updateAnnouncementForm} /> Dismissible</label>
                  </div>
                  <div className="announcementAudienceGroup">
                    <span>Target packages</span>
                    <div className="announcementAudienceChoices">
                      {announcementPackageAudienceOptions.map((item) => (
                        <label key={item}>
                          <input
                            type="checkbox"
                            name="target_packages"
                            value={item}
                            checked={(announcementForm.target_packages || []).includes(item)}
                            onChange={updateAnnouncementForm}
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="announcementAudienceGroup">
                    <span>Target statuses</span>
                    <div className="announcementAudienceChoices">
                      {announcementStatusAudienceOptions.map((item) => (
                        <label key={item}>
                          <input
                            type="checkbox"
                            name="target_statuses"
                            value={item}
                            checked={(announcementForm.target_statuses || []).includes(item)}
                            onChange={updateAnnouncementForm}
                          />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="announcementEditorActions">
                  <button type="submit" disabled={announcementSaveState.saving}>{announcementSaveState.saving ? "Saving..." : editingAnnouncementId ? "Update Announcement" : "Save Announcement"}</button>
                </div>
              </form>
              <div className="announcementListPanel">
                <div className="announcementManagerSubhead">
                  <div>
                    <p className="eyebrow">Active list</p>
                    <h4>Current memos</h4>
                  </div>
                  <span>{announcementRows.length} saved</span>
                </div>
                <div className="announcementAdminList">
                  {announcementRows.length ? announcementRows.map((announcement) => {
                    const audience = getAnnouncementAudienceLabel(announcement);
                    const placementLabel = getAnnouncementPlacementLabel(announcement);
                    return (
                      <article key={announcement.id} className={`announcementAdminCard ${getAnnouncementPreviewTone(announcement)}`}>
                        <div className="announcementAdminCardTop">
                          <div>
                            <strong>{announcement.title}</strong>
                            <small>{announcement.message}</small>
                          </div>
                          <span>{announcement.enabled ? "Enabled" : "Disabled"}</span>
                        </div>
                        {announcement.image_url && (
                          <div className="announcementAdminImage">
                            <img src={announcement.image_url} alt={announcement.title} />
                          </div>
                        )}
                        <div className="announcementAdminMeta">
                          <span>{announcement.announcement_type.replace(/_/g, " ")}</span>
                          <span>{announcement.cta_type || "NONE"}</span>
                          <span>{audience}</span>
                          <span>{placementLabel}</span>
                          <span>{announcement.business_slug || "All businesses"}</span>
                        </div>
                        <div className="announcementAdminMeta">
                          <span>{announcement.starts_at ? `Starts ${formatBookingDate(announcement.starts_at.slice(0, 10))}` : "No start"}</span>
                          <span>{announcement.ends_at ? `Ends ${formatBookingDate(announcement.ends_at.slice(0, 10))}` : "No end"}</span>
                          <span>{announcement.dismissible !== false ? "Dismissible" : "Locked"}</span>
                          <span>{announcement.priority}</span>
                        </div>
                        <div className="announcementAdminActions">
                          <button type="button" onClick={() => startAnnouncement(announcement)}>Edit</button>
                          <button type="button" onClick={() => toggleAnnouncementEnabled(announcement)}>{announcement.enabled ? "Disable" : "Enable"}</button>
                          <button type="button" onClick={() => removeAnnouncement(announcement.id)}>Delete</button>
                        </div>
                      </article>
                    );
                  }) : <div className="announcementEmpty">No announcements created yet.</div>}
                </div>
              </div>
            </div>
          </section>
          )}
          {form.status === "DEMO" && (
            <section className={`smmPackageControl demoExpiryControl ${demoExpiryState.state}`}>
              <div>
                <p className="eyebrow">Demo status</p>
                <h3>{demoExpiryState.label}</h3>
                <span>{demoExpiryState.dateLabel ? `${demoExpiryState.state === "expired" ? "Expired" : "Expires"}: ${demoExpiryState.dateLabel}` : "Demo expiry not set"}</span>
              </div>
              <button type="button" onClick={restartDemo}>Restart 24-Hour Demo</button>
            </section>
          )}
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
           <StructuredServiceManager services={form.serviceEntries} onChange={updateAdminServices} onDeleteService={deleteAdminService} bookingTemplate={form.bookingTemplate} photoManagement={getPackageCapabilities(form.business_package || form.package, form.feature_flags).photoManagement} />
          <div className="smmFlagGrid">
            {Object.keys(defaultFeatureFlags).map((flag) => (
              <label key={flag}>
                <input type="checkbox" name={`flag.${flag}`} checked={Boolean(form.featureFlags[flag])} onChange={updateForm} />
                {flag}
              </label>
            ))}
          </div>
          <button className="smmSaveButton" type="submit" disabled={saving || serviceImageUploading}>{serviceImageUploading ? "Uploading photo..." : saving ? "Saving..." : "Save client"}</button>
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
                  {business.status === "DEMO" && <small>{getDemoExpiryState(business).dateLabel ? `${getDemoExpiryState(business).label}: ${getDemoExpiryState(business).dateLabel}` : getDemoExpiryState(business).label}</small>}
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
  smmOffers = null,
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
  const emptyServiceForm = { id: "", name: "", serviceCategory: "", description: "", price: "", durationMinutes: 60, displayOrder: 0, status: "Active", pricingType: "FIXED", pricingUnit: "FLAT", pricingTiers: [], imageUrl: "", imageTitle: "", imageCaption: "" };
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [clientServiceEntries, setClientServiceEntries] = useState(emptyStructuredServices());
  const [availabilityForm, setAvailabilityForm] = useState({ days: defaultAvailability.days, hours: defaultAvailability.hours, slotsText: slots.join(", ") });
  const [blockedDateForm, setBlockedDateForm] = useState({ blockedDate: "", reason: "" });
  const [paymentMethodForm, setPaymentMethodForm] = useState({ method_type: "GCASH", method_name: "GCash", account_name: "", account_number: "", instructions: "", active: true });
  const [serviceImageUploading, setServiceImageUploading] = useState(false);

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
    const bookingItemRows = await supabaseRequest("booking_items", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(chosenSlug)}&order=created_at.asc`,
      accessToken: session.access_token,
    }).catch(() => []);
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
    setClientBookings(attachBookingItems(bookingRows || [], bookingItemRows || []));
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
      const bookingItemRows = await supabaseRequest("booking_items", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&order=created_at.asc`,
        accessToken: clientSession.access_token,
      }).catch(() => []);
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
      const dismissalRows = await supabaseRequest("announcement_dismissals", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&user_id=eq.${encodeURIComponent(clientSession.user.id)}&order=dismissed_at.desc`,
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
      setClientBookings(attachBookingItems(bookingRows || [], bookingItemRows || []));
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
      setAnnouncementDismissals(dismissalRows || []);
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
        serviceCategory: service.service_category || service.serviceCategory || "",
        description: service.description || "",
        price: service.price ?? "",
      durationMinutes: service.duration_minutes || 60,
      displayOrder: service.display_order ?? 0,
      pricingType: normalizePricingType(service.pricing_type, service.pricing_unit),
      pricingUnit: normalizePricingUnit(service.pricing_unit),
      pricingTiers: normalizePricingTiers(service.pricing_tiers),
      maxGuests: service.max_guests ?? "",
      includedGuests: service.included_guests ?? "",
      extraGuestFee: service.extra_guest_fee ?? "",
      imageUrl: service.image_url || "",
      imageTitle: service.image_title || "",
      imageCaption: service.image_caption || "",
      unitQuantity: service.unit_quantity ?? 1,
      status: service.status || "Active",
    } : emptyServiceForm);
  };

  const submitService = async (event) => {
    event.preventDefault();
    setStatusMessage("Saving...");
    try {
      if (serviceImageUploading) {
        setStatusMessage("Please wait for the service photo upload to finish.");
        return;
      }
      const isClientToursTravel = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "TOURS_TRAVEL";
      const isClientAccommodation = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "STAYCATION_ACCOMMODATION";
      const isClientConsultant = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "PROFESSIONAL_SERVICES";
      const tierValidation = validatePricingTiers(serviceForm.pricingTiers);
      if (isClientToursTravel && serviceForm.pricingType === "GROUP_TIER" && (!tierValidation.ok || tierValidation.tiers.length === 0)) {
        setStatusMessage(tierValidation.message || "Add at least one valid pricing tier.");
        return;
      }
      if (serviceForm.status !== "Inactive" && !isPublishableServiceForTemplate({
        name: serviceForm.name,
        pricingType: isClientAccommodation ? "PER_NIGHT" : isClientToursTravel || isClientConsultant ? serviceForm.pricingType : "FIXED",
        pricingUnit: isClientAccommodation ? "PER_NIGHT" : isClientToursTravel || isClientConsultant ? serviceForm.pricingUnit : "FLAT",
        price: serviceForm.price,
        pricingTiers: serviceForm.pricingTiers,
      }, clientBusiness?.bookingTemplate)) {
        setStatusMessage("Pricing required before this service can be published.");
        return;
      }
      const payload = {
        service_id: serviceForm.id || `svc-${Date.now()}`,
        target_slug: selectedBusinessSlug,
        service_name: serviceForm.name,
        service_description: serviceForm.description,
        service_price: serviceForm.price === "" ? null : Number(serviceForm.price),
        service_duration: isClientAccommodation ? null : Number(serviceForm.durationMinutes) || 60,
        service_status: serviceForm.status,
        service_pricing_type: isClientAccommodation ? "PER_NIGHT" : isClientToursTravel || isClientConsultant ? normalizePricingType(serviceForm.pricingType) : "FIXED",
        service_pricing_unit: isClientAccommodation ? "PER_NIGHT" : isClientToursTravel || isClientConsultant ? normalizePricingUnit(serviceForm.pricingUnit, serviceForm.pricingType) : "FLAT",
        service_pricing_tiers: isClientToursTravel || isClientConsultant ? tierValidation.tiers : [],
        service_display_order: serviceForm.displayOrder || 0,
        service_max_guests: serviceForm.maxGuests === "" ? null : Number(serviceForm.maxGuests),
        service_included_guests: serviceForm.includedGuests === "" ? null : Number(serviceForm.includedGuests),
        service_extra_guest_fee: serviceForm.extraGuestFee === "" ? null : Number(serviceForm.extraGuestFee),
        service_category: serviceForm.serviceCategory || "",
        service_image_url: serviceForm.imageUrl || "",
        service_image_title: serviceForm.imageTitle || "",
        service_image_caption: serviceForm.imageCaption || "",
        service_unit_quantity: serviceForm.unitQuantity === "" ? 1 : Number(serviceForm.unitQuantity || 1),
      };
      await onSaveService(payload, clientSession?.access_token);
      const [confirmedService] = await supabaseRequest("business_services", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(selectedBusinessSlug)}&id=eq.${encodeURIComponent(payload.service_id)}`,
        accessToken: clientSession?.access_token,
      }).catch(() => []);
      if (!confirmedService
        || confirmedService.name !== payload.service_name
        || (confirmedService.service_category || "") !== payload.service_category
        || (confirmedService.description || "") !== payload.service_description
        || Number(confirmedService.price) !== Number(payload.service_price)
        || Number(confirmedService.duration_minutes) !== Number(payload.service_duration)
        || (confirmedService.image_url || "") !== payload.service_image_url
        || (confirmedService.image_title || "") !== payload.service_image_title
        || (confirmedService.image_caption || "") !== payload.service_image_caption
        || confirmedService.status !== payload.service_status) {
        throw new Error("Service save could not be confirmed from the database.");
      }
      const nextServices = serviceForm.id
        ? clientServices.map((service) => service.id === serviceForm.id ? {
          ...service,
          name: payload.service_name,
          description: payload.service_description,
          service_category: payload.service_category,
          serviceCategory: payload.service_category,
          price: payload.service_price,
          duration_minutes: payload.service_duration,
          pricing_type: payload.service_pricing_type,
          pricing_unit: payload.service_pricing_unit,
          pricing_tiers: payload.service_pricing_tiers,
          image_url: payload.service_image_url,
          image_title: payload.service_image_title,
          image_caption: payload.service_image_caption,
          unit_quantity: payload.service_unit_quantity,
          status: payload.service_status,
        } : service)
        : [...clientServices, {
          id: payload.service_id,
          business_slug: selectedBusinessSlug,
          name: payload.service_name,
          description: payload.service_description,
          service_category: payload.service_category,
          serviceCategory: payload.service_category,
          price: payload.service_price,
          duration_minutes: payload.service_duration,
          pricing_type: payload.service_pricing_type,
          pricing_unit: payload.service_pricing_unit,
          pricing_tiers: payload.service_pricing_tiers,
          image_url: payload.service_image_url,
          image_title: payload.service_image_title,
          image_caption: payload.service_image_caption,
          unit_quantity: payload.service_unit_quantity,
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
          serviceCategory: service.service_category || service.serviceCategory || "",
          description: service.description || "",
          imageUrl: service.image_url || "",
          imageTitle: service.image_title || "",
          imageCaption: service.image_caption || "",
          unitQuantity: service.unit_quantity ?? 1,
        })),
        services: nextServices.filter((service) => service.status !== "Inactive").map((service) => service.name),
      }));
      editService();
      setStatusMessage("Saved ✓");
    } catch (error) {
      console.error("Client service save failed", error);
      setStatusMessage(error.message || "Unable to save changes. Please try again.");
    }
  };

  const submitStructuredServices = async (event) => {
    event.preventDefault();
    setStatusMessage("Saving...");
    try {
      if (serviceImageUploading) {
        setStatusMessage("Please wait for the service photo upload to finish.");
        return;
      }
      const isClientToursTravel = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "TOURS_TRAVEL";
      const isClientAccommodation = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "STAYCATION_ACCOMMODATION";
      const isClientConsultant = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "PROFESSIONAL_SERVICES";
      const savableServices = getSavableStructuredServices(clientServiceEntries, clientBusiness?.bookingTemplate);
      for (const service of savableServices) {
        if (isClientToursTravel && service.pricingType === "GROUP_TIER" && !validatePricingTiers(service.pricingTiers).ok) {
          setStatusMessage(`Fix pricing tiers for ${service.name}.`);
          return;
        }
        if (service.status !== "Inactive" && !isPublishableServiceForTemplate(service, clientBusiness?.bookingTemplate)) {
          setStatusMessage(`Pricing required before ${service.name} can be published.`);
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
          service_pricing_type: isClientAccommodation ? "PER_NIGHT" : isClientToursTravel || isClientConsultant ? normalizePricingType(service.pricingType) : "FIXED",
          service_pricing_unit: isClientAccommodation ? "PER_NIGHT" : isClientToursTravel || isClientConsultant ? normalizePricingUnit(service.pricingUnit, service.pricingType) : "FLAT",
          service_pricing_tiers: isClientToursTravel || isClientConsultant ? service.pricingTiers : [],
          service_display_order: service.displayOrder,
          service_max_guests: service.maxGuests,
          service_included_guests: service.includedGuests,
          service_extra_guest_fee: service.extraGuestFee,
          service_category: service.serviceCategory || "",
          service_image_url: service.imageUrl,
          service_image_title: service.imageTitle,
          service_image_caption: service.imageCaption,
          service_unit_quantity: service.unitQuantity,
        }, clientSession?.access_token);
      }
      const refreshedAfterSave = await supabaseRequest("business_services", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(selectedBusinessSlug)}&order=display_order.asc`,
        accessToken: clientSession?.access_token,
      });
      const unconfirmedService = savableServices.find((service) => {
        const confirmed = (refreshedAfterSave || []).find((row) => row.id === service.id || row.name === service.name);
        return !confirmed || !serviceRowMatchesStructured(confirmed, service);
      });
      if (unconfirmedService) {
        throw new Error(`Service save could not be confirmed from the database: ${unconfirmedService.name}.`);
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
          service_image_url: oldService.image_url || "",
          service_image_title: oldService.image_title || "",
          service_image_caption: oldService.image_caption || "",
          service_unit_quantity: oldService.unit_quantity ?? 1,
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
      setStatusMessage("Saved ✓");
    } catch (error) {
      console.error("Client service save failed", error);
      setStatusMessage(error.message || "Unable to save services. Please try again.");
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
  const isClientAccommodation = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "STAYCATION_ACCOMMODATION";
  const paymentsByBooking = bookingPayments.reduce((grouped, payment) => {
    grouped[payment.booking_id] = grouped[payment.booking_id] || [];
    grouped[payment.booking_id].push(payment);
    return grouped;
  }, {});
  const selectedBookingPayments = selectedBooking ? paymentsByBooking[selectedBooking.id] || [] : [];
  const latestSelectedPayment = selectedBookingPayments[0];
  const selectedBookingItems = selectedBooking ? getBookingLineItems(selectedBooking) : [];
  const selectedBookingTotal = selectedBooking?.estimated_total ?? selectedBooking?.metadata?.estimated_total ?? (
    selectedBookingItems.every((item) => item.lineTotal !== null && item.lineTotal !== undefined)
      ? selectedBookingItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0)
      : null
  );
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
          <div className="clientBrandMark">
            {clientBusiness?.logo ? <img src={clientBusiness.logo} alt="" /> : <span>{(clientBusiness?.business || "B").trim().charAt(0).toUpperCase()}</span>}
          </div>
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
              <SmmOffersFeed offers={smmOffers} placement="CLIENT_DASHBOARD" compact business={clientBusiness} />
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
                <StructuredServiceManager services={clientServiceEntries} onChange={setClientServiceEntries} onDeleteService={deleteStructuredService} bookingTemplate={clientBusiness?.bookingTemplate} compact photoManagement={capabilities.photoManagement} />
                <button className="clientPrimaryButton" type="submit" disabled={serviceImageUploading}>{serviceImageUploading ? "Uploading photo..." : "Save Services"}</button>
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
              <div className="bookingItemsPanel">
                <strong>Services</strong>
                {selectedBookingItems.map((item) => (
                  <p key={item.serviceName}>
                    <span>{item.serviceName}{item.lineLabel ? ` - ${item.lineLabel}` : ""}</span>
                    <em>{item.lineTotal === null || item.lineTotal === undefined ? "Pricing unavailable" : formatPeso(item.lineTotal)}</em>
                  </p>
                ))}
                {selectedBookingTotal !== null && <p className="bookingItemsTotal"><span>Estimated Total</span><em>{formatPeso(selectedBookingTotal)}</em></p>}
              </div>
              <p><strong>{isClientAccommodation ? "Check-in" : isClientToursTravel ? "Travel Date" : "Date"}:</strong> {isClientAccommodation ? formatBookingDate(selectedBooking.metadata?.check_in || selectedBooking.booking_date) : selectedBooking.booking_date || "Not required"}</p>
              {isClientAccommodation && <p><strong>Check-out:</strong> {formatBookingDate(selectedBooking.metadata?.check_out)}</p>}
              {isClientAccommodation && <p><strong>Nights:</strong> {selectedBooking.metadata?.number_of_nights || "Not saved"}</p>}
              <p><strong>{isClientAccommodation ? "Stay" : isClientToursTravel ? "Preferred Time" : "Time"}:</strong> {selectedBooking.slot || "Inquiry only"}</p>
              {(isClientToursTravel || isClientAccommodation) && <p><strong>Guests:</strong> {selectedBooking.metadata?.guest_count || "Not provided"}</p>}
              {isClientToursTravel && <p><strong>Pricing Type:</strong> {selectedBooking.metadata?.pricing_type || "Not saved"}</p>}
              {isClientToursTravel && selectedBooking.metadata?.unit_price !== undefined && <p><strong>Rate:</strong> {formatPeso(selectedBooking.metadata.unit_price)}</p>}
              {isClientToursTravel && selectedBooking.metadata?.selected_tier && <p><strong>Selected Group Rate:</strong> {selectedBooking.metadata.selected_tier.minGuests}-{selectedBooking.metadata.selected_tier.maxGuests} pax - {formatPeso(selectedBooking.metadata.selected_tier.price)}</p>}
              {isClientToursTravel && <p><strong>Estimated Total:</strong> {selectedBookingTotal !== null ? formatPeso(selectedBookingTotal) : "Rate only"}</p>}
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
  const isAccommodation = normalizeBookingTemplate(business?.bookingTemplate) === "STAYCATION_ACCOMMODATION";
  const monthKey = getMonthKey(monthDate);
  const monthDays = buildMonthDays(monthDate);
  const serviceOptions = [...new Set((bookings || []).flatMap((booking) => getBookingLineItems(booking).map((item) => item.serviceName)).filter(Boolean))];
  const statusOptions = ["All", "Pending", "Confirmed", "Completed", "Cancelled", ...serviceOptions];
  const visibleBookings = (bookings || []).filter((booking) => {
    if (!(booking.booking_date || "").startsWith(monthKey)) return false;
    const statusMatch = ["All", "Pending", "Confirmed", "Completed", "Cancelled"].includes(statusFilter)
      ? statusFilter === "All" || (booking.status || "").toUpperCase() === statusFilter.toUpperCase()
      : getBookingLineItems(booking).some((item) => item.serviceName === statusFilter);
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
  const reservationLabel = isToursTravel || isAccommodation ? "Reservations" : "Bookings";
  const guestText = (booking) => {
    const guests = booking.metadata?.guest_count;
    return guests ? `${guests} Guest${Number(guests) > 1 ? "s" : ""}` : "";
  };
  const stayText = (booking) => {
    if (!isAccommodation) return "";
    const nights = booking.metadata?.number_of_nights;
    return nights ? `${nights} Night${Number(nights) > 1 ? "s" : ""}` : "";
  };

  return (
    <section className="reservationCalendarPanel">
      <div className="clientDashboardHeader calendarHeader">
        <div>
          <p className="eyebrow">Reservation Calendar</p>
          <h2>{monthTitle}</h2>
          <p>{isAccommodation ? "View stays by check-in date." : isToursTravel ? "View tour reservations by travel date." : "View bookings by selected date."}</p>
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
                  <b>{getBookingServiceSummary(booking)}</b>
                  <small>{getInitialsName(booking.customer)}{stayText(booking) ? ` • ${stayText(booking)}` : guestText(booking) ? ` • ${guestText(booking)}` : ""}</small>
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
                <strong>{getBookingServiceSummary(booking)}</strong>
                <span>{booking.customer}{stayText(booking) ? ` • ${stayText(booking)}` : guestText(booking) ? ` • ${guestText(booking)}` : ""}</span>
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
            <span>{getBookingServiceSummary(booking)}</span>
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

createRoot(document.getElementById("root")).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
