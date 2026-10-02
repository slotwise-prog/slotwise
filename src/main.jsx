import React, { useEffect, useMemo, useRef, useState } from "react";
import { refreshClientSessionForSave } from "./client-session.mjs";
import AirconBooking from "./AirconBooking.jsx";
import { koolmateBusiness } from "./aircon-config.mjs";
import { downloadBookingPdf } from "./booking-pdf.mjs";
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
  FileDown,
  Copy,
  Upload,
  ArrowRight,
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
  Plus,
  Trash2,
  Waves,
  Mountain,
  Utensils,
  BedDouble,
  Building2,
  Moon,
  Shirt,
  WashingMachine,
  Luggage,
  Palmtree,
  Binoculars,
  Leaf,
  FileCheck,
  BusFront,
  CircleHelp,
  Globe,
  Info,
  Mail,
  Smartphone,
  MessageCircle,
  Ruler,
  Eye,
  Music2,
} from "lucide-react";
import "./styles.css";
import "./travel.css";
import "./booking-delete.css";
import travelCoverFallback from "./assets/travel-cover-fallback.png";
import healthWellnessCover from "./assets/health-wellness-cover.png";
import facialUnlimitedLogo from "./assets/facial-unlimited-logo.png";
import facialUnlimitedCover from "./assets/facial-unlimited-cover.png";
import realEstateCover from "./assets/real-estate-cover.png";
import pestControlCover from "./assets/pest-control-cover.png";
import dmonsterLogo from "./assets/dmonster-logo.png";
import nyOpticalLogo from "./assets/ny-optical-logo.png";
import nyOpticalCover from "./assets/ny-optical-cover.png";

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

const SMM_FACEBOOK_URL = "https://www.facebook.com/smmsolutionsv2/";

const dashboardPackageCards = [
  {
    value: "STARTER",
    label: "Starter",
    price: "PHP 499",
    note: "Lifetime access",
    summary: "A clean booking or inquiry page for small businesses getting started.",
    features: ["Public booking / inquiry page", "Client dashboard", "Customer booking details", "Status management", "Mobile-friendly page"],
  },
  {
    value: "BUSINESS",
    label: "Business",
    price: "PHP 799",
    note: "Lifetime access",
    summary: "More day-to-day control for services, pricing, and business information.",
    features: ["Everything in Starter", "Service management", "Pricing management", "Schedule management", "Customer list"],
  },
  {
    value: "PRO",
    label: "Pro",
    price: "PHP 1,499",
    note: "Lifetime access",
    summary: "Advanced reservation tools for businesses that need a fuller operating dashboard.",
    features: ["Everything in Business", "Manual Create Reservation", "Reservation calendar", "Blocked dates", "Payment verification", "Customer history"],
  },
];

const bookingTemplateOptions = [
  { value: "GENERAL", label: "General" },
  { value: "BEAUTY", label: "Beauty / Salon" },
  { value: "CLINIC", label: "Clinic / Dental" },
  { value: "OPTICAL_CLINIC", label: "Optical Clinic" },
  { value: "AIRCON_SERVICES", label: "Aircon Services / HVAC" },
  { value: "HEALTH_WELLNESS", label: "Health & Wellness" },
  { value: "REAL_ESTATE", label: "Real Estate / Property Inquiry" },
  { value: "PEST_CONTROL", label: "Pest Control / Service Request" },
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
    clientRecords: false,
    basicStats: false,
    blockedDates: false,
    reservationCalendar: false,
    manualReservations: false,
    downloadBookingPdf: false,
    paymentVerification: false,
    customerHistory: false,
    enhancedStats: false,
  },
  BUSINESS: {
    services: true,
    photoManagement: true,
    schedule: true,
    customers: true,
    clientRecords: false,
    basicStats: true,
    blockedDates: false,
    reservationCalendar: false,
    manualReservations: false,
    downloadBookingPdf: false,
    paymentVerification: false,
    customerHistory: false,
    enhancedStats: false,
  },
  PRO: {
    services: true,
    photoManagement: true,
    schedule: true,
    customers: true,
    clientRecords: false,
    basicStats: true,
    blockedDates: true,
    reservationCalendar: true,
    manualReservations: true,
    downloadBookingPdf: true,
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
  const rawValue = String(dateValue);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawValue) ? new Date(`${rawValue}T00:00:00`) : new Date(rawValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatBookingWeekday(dateValue) {
  if (!dateValue) return "";
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

function formatReadableDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function formatUpdateDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function isBusinessOpen24Hours(availability = {}) {
  const text = `${availability.days || ""} ${availability.openDays || ""} ${availability.hours || ""} ${availability.openHours || ""}`.toLowerCase();
  return /\b(24\/7|24-7|24 hours|24hrs|24 hrs|anytime|any time|operate any time|open all day|open 24)\b/.test(text);
}

function timeInputToDisplay(value = "") {
  const match = String(value).match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return value;
  const hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes} ${period}`;
}

function displayTimeToInput(value = "") {
  const raw = String(value || "").trim();
  const inputMatch = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (inputMatch) return `${inputMatch[1].padStart(2, "0")}:${inputMatch[2]}`;
  const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (!match) return "";
  let hours = Number(match[1]);
  const minutes = match[2] || "00";
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function getCurrentTimeInputValue() {
  const now = new Date(Date.now() + 60000);
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function isPastPreferredSchedule(dateValue, displayTimeValue) {
  const timeValue = displayTimeToInput(displayTimeValue);
  if (!dateValue || !timeValue) return false;
  const [hours, minutes] = timeValue.split(":").map(Number);
  const selected = new Date(`${dateValue}T00:00:00`);
  selected.setHours(hours, minutes, 0, 0);
  return selected.getTime() < Date.now();
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
  const isOptical = normalizeBookingTemplate(business.bookingTemplate) === "OPTICAL_CLINIC"
    || hasKeyword(businessText, ["optical", "eyewear", "vision", "eye exam", "optometrist"]);
  const isHomeService = hasKeyword(businessText, ["aircon", "air con", "hvac", "home", "cleaning", "repair", "maintenance", "plumbing", "electrical", "appliance"]);
  const isAuto = hasKeyword(businessText, ["car", "auto", "wash", "detailing", "motorcycle", "vehicle"]);

  if (isToursTravel && hasKeyword(serviceText, ["airline", "flight", "ticketing"])) return Plane;
  if (isToursTravel && hasKeyword(serviceText, ["holiday", "vacation"])) return Palmtree;
  if (isToursTravel && hasKeyword(serviceText, ["group tour", "f.i.t", "fit tour"])) return Users;
  if (isToursTravel && hasKeyword(serviceText, ["series tour"])) return MapIcon;
  if (isToursTravel && hasKeyword(serviceText, ["sightseeing"])) return Binoculars;
  if (isToursTravel && hasKeyword(serviceText, ["eco", "agro"])) return Leaf;
  if (isToursTravel && hasKeyword(serviceText, ["educational"])) return GraduationCap;
  if (isToursTravel && hasKeyword(serviceText, ["health", "wellness"])) return HeartPulse;
  if (isToursTravel && hasKeyword(serviceText, ["cruise", "ferry"])) return Ship;
  if (isToursTravel && hasKeyword(serviceText, ["visa"])) return FileCheck;
  if (isToursTravel && hasKeyword(serviceText, ["insurance"])) return ShieldCheck;
  if (isToursTravel && hasKeyword(serviceText, ["transport", "bus", "shuttle"])) return BusFront;
  if (isToursTravel && hasKeyword(serviceText, ["other", "inquiry"])) return CircleHelp;
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
  if (hasKeyword(serviceText, ["tour", "travel", "package", "trip"])) return isToursTravel ? Luggage : MapIcon;

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
  if (isOptical && hasKeyword(serviceText, ["eye", "vision", "frame", "lens", "eyeglasses", "glasses", "optical"])) return Eye;
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
  if (template === "OPTICAL_CLINIC") return Eye;
  if (template === "CLINIC") return Stethoscope;
  if (template === "HEALTH_WELLNESS") return HeartPulse;
  if (template === "REAL_ESTATE") return Building2;
  if (template === "PEST_CONTROL") return ShieldCheck;
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
  if (template === "OPTICAL_CLINIC") return "optical-clinic";
  if (template === "CLINIC") return "clinic";
  if (template === "HEALTH_WELLNESS") return "health-wellness";
  if (template === "REAL_ESTATE") return "real-estate";
  if (template === "PEST_CONTROL") return "pest-control";
  if (template === "BEAUTY") return "beauty";
  if (hasKeyword(businessText, ["laundry", "wash and fold", "wash & fold", "dry cleaning", "pickup and delivery", "pick up and delivery"])) return "laundry";
  if (hasKeyword(businessText, ["optical", "eyewear", "vision", "eye exam", "optometrist"])) return "optical-clinic";
  if (hasKeyword(businessText, ["clinic", "dental", "dentist", "medical", "care"])) return "clinic";
  if (hasKeyword(businessText, ["travel", "stay", "hotel", "tour", "cabin"])) return "travel";
  if (hasKeyword(businessText, ["aircon", "air con", "hvac", "home", "repair", "maintenance", "plumbing", "electrical", "appliance"])) return "home-service";
  if (hasKeyword(businessText, ["car", "auto", "wash", "detailing", "motorcycle", "vehicle"])) return "auto";
  if (hasKeyword(businessText, ["salon", "beauty", "hair", "nail", "spa", "facial", "wellness"])) return "beauty";
  return "general";
}

function getToneThemeDefaults(tone) {
  if (tone === "staycation-accommodation") return { primaryColor: "#7a4f2f", accentColor: "#f8efe6", pageBackgroundColor: "#F4EFE8" };
  if (tone === "tours-travel") return { primaryColor: "#C99718", accentColor: "#FBF7EA", pageBackgroundColor: "#FCFBF7" };
  if (tone === "professional-services") return { primaryColor: "#334155", accentColor: "#e8eef7", pageBackgroundColor: "#F4F7FB" };
  if (tone === "carwash") return { primaryColor: "#1f2937", accentColor: "#eef2f7", pageBackgroundColor: "#F3F6FA" };
  if (tone === "laundry") return { primaryColor: "#2d5b87", accentColor: "#e7f1fb", pageBackgroundColor: "#F2F7FB" };
  if (tone === "home-service") return { primaryColor: "#155e75", accentColor: "#eaf7fb", pageBackgroundColor: "#F1F5F9" };
  if (tone === "auto") return { primaryColor: "#1f2937", accentColor: "#eef2f7", pageBackgroundColor: "#F2F4F7" };
  if (tone === "optical-clinic") return { primaryColor: "#173FA3", accentColor: "#E8EFFD", pageBackgroundColor: "#F5F8FC" };
  if (tone === "clinic") return { primaryColor: "#148d84", accentColor: "#dff7f3", pageBackgroundColor: "#EEF4F8" };
  if (tone === "health-wellness") return { primaryColor: "#5B3FD3", accentColor: "#F8DCEB", pageBackgroundColor: "#FCFAFD" };
  if (tone === "real-estate") return { primaryColor: "#17324D", accentColor: "#EEE7DA", pageBackgroundColor: "#F7F4EE" };
  if (tone === "pest-control") return { primaryColor: "#A51D24", accentColor: "#F4E8E8", pageBackgroundColor: "#F5F5F4" };
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
    "tours-travel": { title: "TRAVEL", subtitle: "Explore • Discover • Go", start: "#063E91", end: "#C99718" },
    "professional-services": { title: "CONSULTING", subtitle: "Plan • Guide • Deliver", start: "#0f172a", end: "#64748b" },
    carwash: { title: "CAR WASH", subtitle: "Wash • Shine • Drive", start: "#111827", end: "#60a5fa" },
    laundry: { title: "LAUNDRY", subtitle: "Wash • Dry • Fold", start: "#2d5b87", end: "#7cc4ff" },
    "home-service": { title: "HOME SERVICE", subtitle: "Repair • Clean • Fix", start: "#0f3f4f", end: "#2563eb" },
    auto: { title: "AUTO", subtitle: "Detail • Wash • Drive", start: "#111827", end: "#ea580c" },
    "optical-clinic": { title: "OPTICAL", subtitle: "Vision • Frames • Care", start: "#102653", end: "#173FA3" },
    clinic: { title: "CLINIC", subtitle: "Care • Wellness • Visit", start: "#0f766e", end: "#7dd3fc" },
    "health-wellness": { title: "WELLNESS", subtitle: "Balance • Routine • Care", start: "#5B3FD3", end: "#D982B5" },
    "real-estate": { title: "PROPERTY", subtitle: "Inquire • Connect • Move", start: "#17324D", end: "#A88A5B" },
    "pest-control": { title: "PEST CONTROL", subtitle: "Protect • Treat • Prevent", start: "#171717", end: "#A51D24" },
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
      <text x="100" y="610" fill="#ffffff" font-size="150" font-family="Lobster, cursive" font-weight="700">${asset.title}</text>
      <text x="100" y="760" fill="rgba(255,255,255,0.88)" font-size="54" font-family="Arial, sans-serif">Branded booking preview</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function isBeautyDefaultColor(value = "") {
  return ["#bd5d6d", "#f6dfe3"].includes((value || "").toLowerCase());
}

function getBusinessCoverStyle(business = {}, tone = "beauty") {
  const cover = business.cover || "";
  if (tone === "tours-travel") {
    const cleanCover = cover.split("?")[0].toLowerCase();
    const isPhotoCover = /^data:image\/(jpeg|webp|avif)/.test(cleanCover)
      || /\.(jpe?g|webp|avif)$/.test(cleanCover)
      || business.featureFlags?.travelCoverIsScenery === true;
    return {
      backgroundImage: `url(${cover && isPhotoCover ? cover : travelCoverFallback})`,
      backgroundPosition: business.coverPosition || "center",
    };
  }
  if (tone === "real-estate") {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(8, 22, 36, 0.18), rgba(8, 22, 36, 0.82)), url(${cover || realEstateCover})`,
      backgroundPosition: business.coverPosition || "center",
    };
  }
  if (tone === "pest-control") {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(20, 17, 17, 0.18), rgba(20, 12, 13, 0.86)), url(${cover || pestControlCover})`,
      backgroundPosition: business.coverPosition || "center",
    };
  }
  if (tone === "optical-clinic") {
    return {
      backgroundImage: `linear-gradient(180deg, rgba(16, 38, 83, 0.08), rgba(16, 38, 83, 0.86)), url(${cover || getTemplateFallbackCover(tone)})`,
      backgroundPosition: business.coverPosition || "center",
    };
  }
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
    OPTICAL: "OPTICAL_CLINIC",
    EYEWEAR: "OPTICAL_CLINIC",
    VISION_CENTER: "OPTICAL_CLINIC",
    AIRCON: "AIRCON_SERVICES",
    HVAC: "AIRCON_SERVICES",
  };
  const nextTemplate = templateAliases[normalizedValue] || normalizedValue;
  return bookingTemplateOptions.some((item) => item.value === nextTemplate) ? nextTemplate : "GENERAL";
}

const bookingTemplatePublicCopy = {
  PEST_CONTROL: {
    category: "Pest Control Services",
    tagline: ["Protect Your Space.", "We'll Handle the Pests."],
    trust: [["Choose a Service", "Select the pest concern you need help with"], ["Select Your Schedule", "Choose your preferred service date and time"], ["Submit Your Request", "Send your location and contact details"]],
  },
  REAL_ESTATE: {
    category: "Real Estate",
    tagline: ["Find a Property That Fits Your Next Move.", "Send us your property inquiry and let our team assist you."],
    trust: [["Tell Us What You're Looking For", "Share your preferred property and location"], ["Send Your Inquiry", "Review and submit your requirements"], ["Receive a Response", "The property team will contact you"]],
  },
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
  OPTICAL_CLINIC: {
    category: "Optical Clinic",
    tagline: ["Clearer Vision.", "Better Everyday Living."],
    trust: [["Choose a Package", "Select the optical package or service you need"], ["Pick Your Schedule", "Choose your preferred available date and time"], ["Confirm Your Booking", "Submit your details and receive your Slotwise reference"]],
  },
  HEALTH_WELLNESS: {
    category: "Health & Wellness",
    tagline: ["Everyday wellness.", "Simple booking and inquiries."],
    trust: [["Choose an option", "Browse available products and services"], ["Enter your details", "Complete the information requested"], ["Receive confirmation", "Keep your Slotwise reference"]],
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
  if (business.slug === "xtreme-dancers-studio") {
    const isDemo = String(business.status || "").toUpperCase() === "DEMO";
    return {
      category: "Dance Studio",
      tagline: ["MOVE. LEARN. PERFORM.", "Book your dance session online."],
      trust: [["Choose a class", isDemo ? "Pick one of the sample dance sessions" : "Choose a class or studio rental option"], ["Choose a schedule", isDemo ? "Select a demo date and available time" : "Select a valid class or rental schedule"], ["Send your request", "Review your booking details"],],
    };
  }
  if (business.slug === "party-xpress-rentals") {
    return {
      category: "Party Rentals",
      tagline: ["Plan your party.", "Send a booking request for rentals and party add-ons."],
      trust: [["Easy booking request", "Tell us what you need for your event"], ["Request confirmation", "Party Xpress will review availability and confirm your schedule"], ["Simple and private", "Your details stay organized"]],
    };
  }
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
  if (nextTemplate === "OPTICAL_CLINIC") return "optical-clinic";
  if (nextTemplate === "CLINIC") return "clinic";
  if (nextTemplate === "HEALTH_WELLNESS") return "health-wellness";
  if (nextTemplate === "REAL_ESTATE") return "real-estate";
  if (nextTemplate === "PEST_CONTROL") return "pest-control";
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

function normalizeServiceSchedule(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).map(([day, slots]) => [
    String(day).toUpperCase(),
    Array.isArray(slots) ? slots.map((slot) => String(slot).trim()).filter(Boolean) : [],
  ]).filter(([, slots]) => slots.length));
}

function getServiceScheduleSlots(serviceDetail = {}, dateValue = "", fallbackSlots = []) {
  const schedule = normalizeServiceSchedule(serviceDetail.schedule || serviceDetail.serviceSchedule);
  if (!Object.keys(schedule).length || !dateValue) return fallbackSlots;
  const day = new Date(`${dateValue}T00:00:00`).toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  return schedule[day] || [];
}

function formatScheduleInterval(slot, durationMinutes) {
  const raw = String(slot || "").trim();
  const duration = Number(durationMinutes);
  if (!raw || !Number.isFinite(duration) || duration <= 0 || raw.includes("-") || raw.includes("–")) return raw;
  const match = raw.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i) || raw.match(/^(\d{1,2})\s*(AM|PM)$/i);
  if (!match) return raw;
  const hour = Number(match[1]);
  const minute = Number(match[2] || 0);
  const period = match[3] || match[2];
  if (hour < 1 || hour > 12 || minute > 59) return raw;
  let startMinutes = (hour % 12) * 60 + minute + (period.toUpperCase() === "PM" ? 720 : 0);
  const endMinutes = startMinutes + duration;
  const formatTime = (total) => {
    const normalized = ((total % 1440) + 1440) % 1440;
    const h24 = Math.floor(normalized / 60);
    const m = normalized % 60;
    const h12 = h24 % 12 || 12;
    return `${h12}:${String(m).padStart(2, "0")} ${h24 >= 12 ? "PM" : "AM"}`;
  };
  return `${formatTime(startMinutes)} – ${formatTime(endMinutes)}`;
}

function normalizeDepartureDates(value) {
  return (Array.isArray(value) ? value : [])
    .filter((item) => item?.kind === "DEPARTURE" || item?.startDate || item?.start_date || item?.departureStart || item?.departure_start)
    .map((item, index) => ({
      id: item.id || `departure-${index}`,
      startDate: item.startDate || item.start_date || item.departureStart || item.departure_start || "",
      endDate: item.endDate || item.end_date || item.departureEnd || item.departure_end || "",
      price: Number(item.price ?? item.departurePrice ?? item.departure_price),
      pricingUnit: normalizePricingUnit(item.pricingUnit || item.pricing_unit || item.departurePricingUnit || item.departure_pricing_unit, "PER_PAX"),
      status: String(item.status || item.departureStatus || item.departure_status || "AVAILABLE").toUpperCase(),
      notes: item.notes || item.departureNotes || item.departure_notes || "",
      displayOrder: Number(item.displayOrder ?? item.display_order ?? item.departureOrder ?? item.departure_order ?? index),
    }))
    .filter((item) => Number.isFinite(item.price) && item.price >= 0)
    .sort((a, b) => a.startDate.localeCompare(b.startDate) || a.displayOrder - b.displayOrder);
}

function getEditableDepartureDates(value) {
  return (Array.isArray(value) ? value : []).map((item, index) => ({
    id: item.id || `departure-${index}`,
    startDate: item.startDate || item.departureStart || item.departure_start || "",
    endDate: item.endDate || item.departureEnd || item.departure_end || "",
    price: item.price === "" || item.price === null || item.price === undefined
      ? ""
      : Number(item.price ?? item.departurePrice ?? item.departure_price),
    pricingUnit: normalizePricingUnit(item.pricingUnit || item.departurePricingUnit || item.departure_pricing_unit, "PER_PAX"),
    status: String(item.status || item.departureStatus || item.departure_status || "AVAILABLE").toUpperCase(),
    notes: item.notes || item.departureNotes || item.departure_notes || "",
    displayOrder: Number(item.displayOrder ?? item.departureOrder ?? item.departure_order ?? index),
  }));
}

function getUpcomingDepartures(value) {
  const today = getTodayDateValue();
  return normalizeDepartureDates(value).filter((item) => item.startDate && item.startDate >= today);
}

function getSavableDepartureDates(value) {
  return normalizeDepartureDates(value).filter((item) => item.startDate && Number.isFinite(item.price) && item.price >= 0);
}

function departureListsMatch(left, right) {
  const comparable = (value) => getSavableDepartureDates(value).map(({ id, displayOrder, ...item }) => item);
  return JSON.stringify(comparable(left)) === JSON.stringify(comparable(right));
}

function departureDateLabel(departure = {}) {
  const format = (value) => value ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`)) : "Date pending";
  return departure.endDate ? `${format(departure.startDate)}–${format(departure.endDate)}` : format(departure.startDate);
}

function departureRecord(departure = {}, index = 0) {
  return {
    kind: "DEPARTURE",
    id: departure.id || `departure-${Date.now()}-${index}`,
    departureStart: departure.startDate || "",
    departureEnd: departure.endDate || "",
    departurePrice: Number(departure.price || 0),
    departurePricingUnit: departure.pricingUnit || "PER_PAX",
    departureStatus: departure.status || "AVAILABLE",
    departureNotes: departure.notes || "",
    departureOrder: index,
  };
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
  const hasPrice = serviceDetail.price !== "" && serviceDetail.price !== null && serviceDetail.price !== undefined && String(serviceDetail.price).trim() !== "";
  const price = hasPrice ? Number(serviceDetail.price) : null;
  if (isInquiryPricingType(pricingType)) return true;
  if (pricingType === "GROUP_TIER") {
    const tiers = validatePricingTiers(serviceDetail.pricingTiers);
    return tiers.ok && tiers.tiers.length > 0;
  }
  return price !== null && !Number.isNaN(price);
}

function isPublishableServiceForTemplate(serviceDetail = {}, bookingTemplate = "GENERAL") {
  return Boolean(String(serviceDetail.name || "").trim());
}

function getPricingForGuests(serviceDetail, guestCount, selectedDeparture = null) {
  if (selectedDeparture) {
    const pricingType = selectedDeparture.pricingUnit === "PER_PAX" ? "PER_PAX" : "FIXED";
    const unitPrice = Number(selectedDeparture.price);
    return { pricingType, unitPrice, selectedTier: null, estimatedTotal: pricingType === "PER_PAX" ? unitPrice * guestCount : unitPrice, totalAvailable: Number.isFinite(unitPrice) };
  }
  const pricingType = normalizePricingType(serviceDetail.pricingType, serviceDetail.pricingUnit);
  const hasPrice = serviceDetail.price !== "" && serviceDetail.price !== null && serviceDetail.price !== undefined && String(serviceDetail.price).trim() !== "";
  const price = hasPrice ? Number(serviceDetail.price) : null;
  if (price === null && pricingType !== "GROUP_TIER") {
    return { pricingType: "CUSTOM_INQUIRY", unitPrice: null, selectedTier: null, estimatedTotal: null, totalAvailable: true };
  }
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
  const hasDirectPrice = serviceDetail.price !== "" && serviceDetail.price !== null && serviceDetail.price !== undefined && String(serviceDetail.price).trim() !== "" && Number.isFinite(Number(serviceDetail.price)) && Number(serviceDetail.price) > 0;
  const hasPricingTiers = normalizePricingTiers(serviceDetail.pricingTiers).length > 0;
  if (!context.selectedDeparture && (!hasDirectPrice || (context.allowQuoteWithoutPrice && !hasDirectPrice)) && (!hasPricingTiers || context.allowQuoteWithoutPrice)) {
    return { serviceId: serviceDetail.id || null, serviceName: serviceDetail.name || serviceDetail.service || "Selected service", pricingType: "CUSTOM_INQUIRY", unitPrice: null, quantity: 1, selectedTier: null, lineTotal: null, totalAvailable: true, lineLabel: "Contact for Rate" };
  }
  const pricing = getPricingForGuests(serviceDetail, quantity, context.selectedDeparture);
  const pricingType = pricing.pricingType;
  const serviceName = serviceDetail.name || serviceDetail.service || "Selected service";
  const serviceId = serviceDetail.id || null;
  const hasBasePrice = serviceDetail.price !== "" && serviceDetail.price !== null && serviceDetail.price !== undefined && String(serviceDetail.price).trim() !== "";
  const basePrice = context.selectedDeparture ? Number(context.selectedDeparture.price) : hasBasePrice ? Number(serviceDetail.price) : null;
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

  if (context.perUnit === true && pricingType === "FIXED") {
    snapshotQuantity = Math.max(1, Number(context.units) || 1);
    lineTotal = pricing.unitPrice === null ? null : pricing.unitPrice * snapshotQuantity;
    lineLabel = `${formatPeso(pricing.unitPrice)} x ${snapshotQuantity} units`;
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

function attachInquiryItems(inquiries = [], inquiryItems = []) {
  const itemsByInquiry = (inquiryItems || []).reduce((grouped, item) => {
    grouped[item.inquiry_id] = grouped[item.inquiry_id] || [];
    grouped[item.inquiry_id].push(item);
    return grouped;
  }, {});
  return (inquiries || []).map((inquiry) => ({
    ...inquiry,
    inquiry_items: itemsByInquiry[inquiry.id] || inquiry.inquiry_items || [],
  }));
}

function getInquiryServiceSummary(inquiry = {}) {
  const items = Array.isArray(inquiry.inquiry_items) ? inquiry.inquiry_items : [];
  if (items.length > 1) return `${items[0].item_name || "Service"} +${items.length - 1} more`;
  return items[0]?.item_name || inquiry.service_interest || "Inquiry";
}

function normalizePaymentRequirement(value) {
  const next = (value || "NO_PAYMENT_REQUIRED").toUpperCase();
  return ["NO_PAYMENT_REQUIRED", "DEPOSIT_REQUIRED", "FULL_PAYMENT_REQUIRED"].includes(next) ? next : "NO_PAYMENT_REQUIRED";
}

function getRequiredPaymentAmount(settings = {}, estimatedTotal = null) {
  const requirement = normalizePaymentRequirement(settings.requirement_type);
  if (!isEnabledValue(settings.enabled) || requirement === "NO_PAYMENT_REQUIRED") return null;
  if (requirement === "FULL_PAYMENT_REQUIRED") return estimatedTotal;
  if ((settings.deposit_type || "FIXED_AMOUNT") === "PERCENTAGE" && estimatedTotal !== null) {
    return Math.round(estimatedTotal * (Number(settings.deposit_value || 0) / 100));
  }
  return Number(settings.deposit_value || 0);
}

function isEnabledValue(value) {
  return value === true || value === 1 || String(value || "").trim().toLowerCase() === "true" || String(value || "").trim() === "1";
}

function resolvePublicPaymentCapability({ packageCapabilities, settings = {}, methods = [], status = "" } = {}) {
  const packageAllowsManualPayment = Boolean(packageCapabilities?.paymentVerification);
  const manualPaymentsEnabled = isEnabledValue(settings.enabled ?? settings.manual_payments_enabled ?? settings.accept_manual_payments);
  const validPaymentMethods = (Array.isArray(methods) ? methods : []).filter((method) => isEnabledValue(method.active ?? true) && String(method.method_type || method.method_name || "").trim());
  const canUseManualPayments = String(status).toUpperCase() === "ACTIVE" && packageAllowsManualPayment && manualPaymentsEnabled && validPaymentMethods.length > 0;
  return { packageAllowsManualPayment, manualPaymentsEnabled, validPaymentMethods, canUseManualPayments };
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

function formatDashboardPeso(value) {
  if (value === null || value === undefined || value === "" || Number.isNaN(Number(value))) return "For Assessment";
  return `₱${Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

function formatServicePriceLabel(detail = {}, fallbackPricingType = "FIXED") {
  const pricingType = normalizePricingType(detail.pricingType ?? detail.pricing_type, detail.pricingUnit ?? detail.pricing_unit ?? fallbackPricingType);
  const price = detail.price;
  if (price === "" || price === null || price === undefined || String(price).trim() === "") return "Contact for Rate";
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

function getTravelServiceKind(serviceName = "") {
  const value = serviceName.toLowerCase();
  if (hasKeyword(value, ["airline", "flight", "ticketing"])) return "AIRLINE";
  if (hasKeyword(value, ["visa"])) return "VISA";
  if (hasKeyword(value, ["insurance"])) return "INSURANCE";
  if (hasKeyword(value, ["transport", "transfer", "shuttle", "van", "car rental"])) return "TRANSPORT";
  if (hasKeyword(value, ["cruise", "ferry"])) return "ROUTE";
  return "TOUR";
}

function getTravelPriceLabel(detail = {}) {
  const departures = getUpcomingDepartures(detail.departureDates || detail.pricingTiers);
  if (departures.length) {
    const lowestDeparture = departures.reduce((lowest, item) => item.price < lowest.price ? item : lowest, departures[0]);
    return `From ${formatPeso(lowestDeparture.price)} / ${lowestDeparture.pricingUnit === "PER_PAX" ? "pax" : lowestDeparture.pricingUnit.replace("PER_", "").toLowerCase()}`;
  }
  const hasPrice = detail.price !== null && detail.price !== "" && detail.price !== undefined && Number(detail.price) > 0;
  const hasTiers = normalizePricingTiers(detail.pricingTiers).length > 0;
  if (!hasPrice && !hasTiers) return "Contact for Rate";
  return formatServicePriceLabel(detail, detail.pricingType || "FIXED");
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
    clientRecords: featureFlags.clientRecords === true || featureFlags.client_records === true || featureFlags.client_records_enabled === true,
  };
}

function normalizeUpdatePackages(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").toUpperCase()).filter(Boolean);
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item || "").toUpperCase()).filter(Boolean);
    } catch {
      return value.split(",").map((item) => item.trim().toUpperCase()).filter(Boolean);
    }
  }
  return ["ALL"];
}

function updateAppliesToPackage(update, packageKey) {
  const packages = normalizeUpdatePackages(update?.applicable_packages || update?.target_packages);
  return !packages.length || packages.includes("ALL") || packages.includes(packageKey);
}

function getUpdatePackageBadgeLabel(packageValue, currentPackageKey) {
  const packageKey = String(packageValue || "").toUpperCase();
  if (packageKey === "ALL") return "All packages";
  if (packageKey === currentPackageKey) return "Available on your plan";
  return `${packageKey} feature`;
}

function getUpdateTypeLabel(value) {
  return String(value || "UPDATE").replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getPackageOrder(value) {
  return { STARTER: 1, BUSINESS: 2, PRO: 3 }[normalizePackage(value)] || 1;
}

function getStatusClass(value) {
  return (value || "PENDING").toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const bookingStatusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "QUOTATION_SENT", label: "Quotation Sent" },
  { value: "WAITING_FOR_APPROVAL", label: "Waiting for Approval" },
  { value: "FOR_AMENDMENT", label: "For Amendment" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const inquiryStatusOptions = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "DECLINED", label: "Declined" },
  { value: "CANCELLED", label: "Cancelled" },
];

const inquirySourceOptions = ["Website", "Manual", "Facebook", "Messenger", "Phone", "Other"];

function getBookingStatusLabel(value) {
  return bookingStatusOptions.find((item) => item.value === String(value || "PENDING").toUpperCase())?.label || String(value || "Pending").replaceAll("_", " ");
}

function normalizeBookingStatusValue(value) {
  return String(value || "PENDING").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_");
}

function getInquiryStatusLabel(value) {
  return inquiryStatusOptions.find((item) => item.value === String(value || "NEW").toUpperCase())?.label || String(value || "New").replaceAll("_", " ");
}

function normalizeInquiryStatusValue(value) {
  return String(value || "NEW").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_");
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
    let parsedError = null;
    try {
      parsedError = errorText ? JSON.parse(errorText) : null;
    } catch {
      parsedError = null;
    }
    const error = new Error(parsedError?.message || parsedError?.error_description || errorText || `Database request failed for ${table}`);
    error.details = parsedError?.details;
    error.hint = parsedError?.hint;
    error.code = parsedError?.code;
    throw error;
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
  if (!response.ok) {
    const error = new Error(data.error_description || data.msg || data.error || "Authentication failed.");
    Object.assign(error, { code: data.error_code || data.code, details: data.details, hint: data.hint, status: response.status });
    throw error;
  }
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
  if (!response.ok) {
    const error = new Error(data.message || data.error_description || "Request failed.");
    error.details = data.details;
    error.hint = data.hint;
    error.code = data.code;
    throw error;
  }
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

async function supabasePaymentProofUpload({ bookingId, businessSlug, possessionToken, file }) {
  if (!supabaseUrl || !supabaseAnonKey) throw new Error("Supabase is not connected.");
  const response = await fetch(`${supabaseUrl}/functions/v1/upload-payment-proof`, {
    method: "POST",
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` },
    body: (() => { const form = new FormData(); form.append("booking_id", bookingId); form.append("business_slug", businessSlug); form.append("possession_token", possessionToken); form.append("file", file, file.name); return form; })(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Payment proof upload failed.");
  return data.path || "";
}

async function supabasePrivateStorageDelete(path) {
  if (!supabaseUrl || !supabaseAnonKey || !path) return;
  const safePath = path.split("/").map(encodeURIComponent).join("/");
  await fetch(`${supabaseUrl}/storage/v1/object/payment-proofs/${safePath}`, { method: "DELETE", headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${supabaseAnonKey}` } });
}

async function supabasePrivateStorageSignedUrl(path, accessToken) {
  if (!supabaseUrl || !supabaseAnonKey || !path) throw new Error("Payment proof is unavailable.");
  const safePath = path.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(`${supabaseUrl}/storage/v1/object/sign/payment-proofs/${safePath}`, {
    method: "POST",
    headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: 300 }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || data.error || "Payment proof could not be opened.");
  const signed = data.signedURL || data.signedUrl || data.url;
  if (!signed) throw new Error("Payment proof URL was not returned.");
  return /^https?:\/\//i.test(signed) ? signed : `${supabaseUrl}/storage/v1${signed}`;
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

function normalizePhoneLink(value = "") {
  const phone = String(value || "").trim();
  if (!phone) return "";
  return `tel:${phone.replace(/[^+\d]/g, "")}`;
}

function splitContactValues(value = "") {
  return String(value || "").split(/\r?\n|[,;]+/).map((item) => item.trim()).filter(Boolean);
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

function openNativeDatePicker(event) {
  if (event.target?.tagName === "INPUT") return;
  const input = event.currentTarget?.querySelector?.('input[type="date"]');
  if (!input) return;
  input.focus({ preventScroll: true });
  if (typeof input.showPicker === "function") {
    try { input.showPicker(); } catch { /* Browser may require a direct gesture. */ }
  }
}

function normalizeDatabaseBusiness(row, serviceRows = [], availabilityRow = null, paymentSettingsRow = null, paymentMethodRows = []) {
  const bookingTemplate = row.booking_template ? normalizeBookingTemplate(row.booking_template) : "";
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
      schedule: normalizeServiceSchedule(service.schedule),
      departureDates: normalizeDepartureDates(service.departures || service.pricing_tiers),
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
    primaryColor: row.primary_color || "",
    accentColor: row.accent_color || "",
    pageBackgroundType: row.page_background_type || row.pageBackgroundType || "",
    phone: row.phone || "",
    messengerLink: row.messenger_link || (row.slug === "the-facial-unlimited-ph" ? "https://www.facebook.com/profile.php?id=61592702334620" : ""),
    mobileNumbers: row.feature_flags?.mobileNumbers || "",
    primaryEmail: row.feature_flags?.primaryEmail || "",
    additionalEmails: row.feature_flags?.additionalEmails || "",
    website: row.feature_flags?.website || "",
    address: row.address || "",
    description: row.description || "",
    businessType: row.business_type || row.industry || "Service business",
    bookingMode: row.booking_mode || "",
    bookingTemplate,
    demoStartedAt: row.demo_started_at || null,
    demoExpiresAt: row.demo_expires_at || null,
    status: row.status ? row.status.toUpperCase() : "",
    package: row.business_package || "",
    featureFlags: row.feature_flags || {},
    availability: {
      days: availabilityRow?.open_days || "",
      hours: availabilityRow?.open_hours || "",
      slots: Array.isArray(availabilityRow?.slots) ? availabilityRow.slots : [],
      blockedDates: availabilityRow?.blocked_dates || [],
    },
    cover: row.cover_url || "",
    pageBackgroundColor: normalizeHexColor(row.page_background_color || row.pageBackgroundColor, ""),
    pageBackgroundColor2: normalizeHexColor(row.page_background_color_2 || row.pageBackgroundColor2, ""),
    serviceDetails: normalizedServices.serviceDetails,
    services: normalizedServices.services,
    forms: [],
    paymentSettings: paymentSettingsRow || { enabled: false, requirement_type: "NO_PAYMENT_REQUIRED", deposit_type: "FIXED_AMOUNT", deposit_value: 0, require_proof: false },
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
    mobileNumbers: business.mobileNumbers || business.featureFlags?.mobileNumbers || "",
    primaryEmail: business.primaryEmail || business.featureFlags?.primaryEmail || "",
    additionalEmails: business.additionalEmails || business.featureFlags?.additionalEmails || "",
    website: business.website || business.featureFlags?.website || "",
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

function pickConfiguredValue(nextValue, previousValue, fallback = "") {
  if (Array.isArray(nextValue)) return nextValue.length ? nextValue : (Array.isArray(previousValue) ? previousValue : fallback);
  if (nextValue === null || nextValue === undefined) return previousValue ?? fallback;
  if (typeof nextValue === "string" && !nextValue.trim()) return previousValue ?? fallback;
  return nextValue;
}

function pickBookingTemplateValue(nextValue, previousValue, fallback = "GENERAL") {
  const previousTemplate = normalizeBookingTemplate(previousValue);
  const nextTemplate = nextValue ? normalizeBookingTemplate(nextValue) : "";
  if (!nextTemplate) return previousTemplate || fallback;
  if (nextTemplate === "GENERAL" && previousTemplate && previousTemplate !== "GENERAL") return previousTemplate;
  return nextTemplate;
}

function mergeBusinessCatalogEntry(previous = {}, business = {}) {
  const isAircon = pickBookingTemplateValue(business.bookingTemplate, previous.bookingTemplate) === "AIRCON_SERVICES";
  const previousAvailability = previous.availability || {};
  const nextAvailability = business.availability || {};
  const mergedAvailability = {
    ...previousAvailability,
    ...nextAvailability,
    days: pickConfiguredValue(nextAvailability.days, previousAvailability.days, isAircon ? "" : defaultAvailability.days),
    hours: pickConfiguredValue(nextAvailability.hours, previousAvailability.hours, isAircon ? "" : defaultAvailability.hours),
    slots: Array.isArray(nextAvailability.slots) && nextAvailability.slots.length
      ? nextAvailability.slots
      : Array.isArray(previousAvailability.slots) && previousAvailability.slots.length
        ? previousAvailability.slots
        : isAircon ? [] : defaultAvailability.slots,
  };

  return normalizeBusinessConfig({
    ...previous,
    ...business,
    name: pickConfiguredValue(business.name, previous.name, "Service business"),
    business: pickConfiguredValue(business.business, previous.business, "Client Business"),
    link: pickConfiguredValue(business.link, previous.link, ""),
    industry: pickConfiguredValue(business.industry, previous.industry, "General"),
    bookingMode: pickConfiguredValue(business.bookingMode, previous.bookingMode, "booking"),
    bookingTemplate: pickBookingTemplateValue(business.bookingTemplate, previous.bookingTemplate, "GENERAL"),
    package: pickConfiguredValue(business.package, previous.package, "STARTER"),
    status: pickConfiguredValue(business.status, previous.status, "ACTIVE"),
    primaryColor: pickConfiguredValue(business.primaryColor, previous.primaryColor, ""),
    accentColor: pickConfiguredValue(business.accentColor, previous.accentColor, ""),
    pageBackgroundType: pickConfiguredValue(business.pageBackgroundType, previous.pageBackgroundType, "SOLID"),
    pageBackgroundColor: pickConfiguredValue(business.pageBackgroundColor, previous.pageBackgroundColor, ""),
    pageBackgroundColor2: pickConfiguredValue(business.pageBackgroundColor2, previous.pageBackgroundColor2, ""),
    logo: pickConfiguredValue(business.logo, previous.logo, ""),
    cover: pickConfiguredValue(business.cover, previous.cover, ""),
    coverPosition: pickConfiguredValue(business.coverPosition, previous.coverPosition, "center"),
    phone: pickConfiguredValue(business.phone, previous.phone, ""),
    messengerLink: pickConfiguredValue(business.messengerLink, previous.messengerLink, ""),
    mobileNumbers: pickConfiguredValue(business.mobileNumbers, previous.mobileNumbers, ""),
    primaryEmail: pickConfiguredValue(business.primaryEmail, previous.primaryEmail, ""),
    additionalEmails: pickConfiguredValue(business.additionalEmails, previous.additionalEmails, ""),
    website: pickConfiguredValue(business.website, previous.website, ""),
    address: pickConfiguredValue(business.address, previous.address, ""),
    description: pickConfiguredValue(business.description, previous.description, ""),
    businessType: pickConfiguredValue(business.businessType, previous.businessType, ""),
    forms: pickConfiguredValue(business.forms, previous.forms, []),
    services: pickConfiguredValue(business.services, previous.services, []),
    serviceDetails: pickConfiguredValue(business.serviceDetails, previous.serviceDetails, []),
    availability: mergedAvailability,
    featureFlags: isAircon ? Object.fromEntries([...new Set([...Object.keys(previous.featureFlags || {}), ...Object.keys(business.featureFlags || {})])].map(key => [key, pickConfiguredValue(business.featureFlags?.[key], previous.featureFlags?.[key])])) : { ...(previous.featureFlags || {}), ...(business.featureFlags || {}) },
  });
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
  const ctaLabel = String(announcement.cta_label || announcement.ctaLabel || "").trim().toLowerCase();
  if (ctaType === "NONE") return "";
  if (ctaType === "MESSENGER") {
    return SMM_FACEBOOK_URL;
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
    if (ctaLabel === "message smm to upgrade" || ctaLabel === "message smm solutions") return SMM_FACEBOOK_URL;
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
    departureDates: [],
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
    schedule: normalizeServiceSchedule(service.schedule),
    departureDates: normalizeDepartureDates(service.departures || service.departureDates || service.pricing_tiers || service.pricingTiers),
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
        departureDates: isTravel ? getSavableDepartureDates(service.departureDates) : [],
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
    && departureListsMatch(row.departures, service.departureDates)
    && Number(row.display_order || 0) === Number(service.displayOrder || 0)
    && String(row.status || "Active").toUpperCase() === String(service.status || "Active").toUpperCase();
}

function serviceRowConfirmsPersistence(row = {}, service = {}) {
  const sameText = (left, right) => String(left ?? "").trim() === String(right ?? "").trim();
  const savedStatus = String(row.status || "Active").toUpperCase();
  const expectedStatus = String(service.status || "Active").toUpperCase();
  return sameText(row.name, service.name)
    && savedStatus === expectedStatus
    && (service.departureDates === undefined || departureListsMatch(row.departures, service.departureDates));
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
  if (template === "PEST_CONTROL") return { title: "Pest Control Services", single: "Pest control service", add: "Add Pest Control Service" };
  if (template === "REAL_ESTATE") return { title: "Property Categories / Inquiry Options", single: "Property category", add: "Add Property Category" };
  if (template === "HEALTH_WELLNESS") return { title: "Products / Services", single: "Product / service", add: "Add Another Product / Service" };
  if (template === "TOURS_TRAVEL") return { title: "Travel Services & Packages", single: "Travel service / package", add: "Add Another Service / Package" };
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
  if (/(aircon|air.condition|hvac)/i.test(lower)) return "AIRCON_SERVICES";
  if (/(optical|optometrist|optometry|eyewear|eye exam|vision center|vision care|eyeglasses|glasses|frames|lenses)/i.test(lower)) return "OPTICAL_CLINIC";
  if (/(pest control|termite|fumigation|exterminat|disinfection)/i.test(lower)) return "PEST_CONTROL";
  if (/(real estate|realty|property broker|property consultant|property developer|condominium seller|house\s*&?\s*lot)/i.test(lower)) return "REAL_ESTATE";
  if (/(health\s*&?\s*wellness|wellness|nutrition|supplement)/i.test(lower)) return "HEALTH_WELLNESS";
  if (/(staycation|accommodation|resort|villa|transient|apartment|condotel|hotel|guest house|cabin|beach house|room|rental)/i.test(lower)) return "STAYCATION_ACCOMMODATION";
  if (/(travel|tour)/i.test(lower)) return "TOURS_TRAVEL";
  if (/(consultant|consulting|professional services|professional service|agency|advisory|advisor|accounting|legal|lawyer|broker|marketing|design|freelance|profession)/i.test(lower)) return "PROFESSIONAL_SERVICES";
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
    feature_flags: {
      ...defaultFeatureFlags,
      ...(setup.featureFlags || {}),
      mobileNumbers: setup.mobileNumbers || "",
      primaryEmail: setup.primaryEmail || "",
      additionalEmails: setup.additionalEmails || "",
      website: setup.website || "",
    },
    status: (setup.status || "DEMO").toUpperCase(),
    demo_started_at: setup.demoStartedAt || null,
    demo_expires_at: setup.demoExpiresAt || null,
  };
}

function setupToServiceRows(setup, slug, requestId) {
  const bookingTemplate = normalizeBookingTemplate(setup.bookingTemplate || inferBookingTemplateFromIndustry(setup.industry));
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
    pricing_tiers: bookingTemplate === "TOURS_TRAVEL"
      ? normalizePricingTiers(service.pricingTiers)
      : normalizePricingTiers(service.pricingTiers),
    departures: bookingTemplate === "TOURS_TRAVEL" ? getSavableDepartureDates(service.departureDates) : [],
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
  { ...koolmateBusiness, icon: <Wrench /> },
  {
    icon: <ShieldCheck />,
    slug: "dmonster-pest-control-services",
    name: "Pest Control / Service Request",
    business: "D’Monster Pest Control Services",
    link: "dmonster-pest-control-services.slotwise.app",
    logo: dmonsterLogo,
    primaryColor: "#A51D24",
    accentColor: "#F4E8E8",
    pageBackgroundColor: "#F5F5F4",
    phone: "09057024649",
    primaryEmail: "dmonsterpestcontrolservices@gmail.com",
    messengerLink: "https://www.facebook.com/share/19gzkn37Jn/",
    address: "",
    description: "Request pest control service for your home or business in just a few simple steps.",
    businessType: "Pest Control",
    bookingMode: "booking",
    bookingTemplate: "PEST_CONTROL",
    package: "STARTER",
    featureFlags: { ...defaultFeatureFlags, showPrices: false, requireDate: true, requireTime: true },
    availability: { ...defaultAvailability, days: "Operate Any Time", hours: "Open 24/7", slots },
    cover: pestControlCover,
    accent: "pest-control",
    tagline: "Request pest control service for your home or business in just a few simple steps.",
    highlight: "Package-aware pest control requests using the shared Slotwise workflow",
    stat: "Open 24/7",
    services: [
      "General Pest Control",
      "Termite Treatment",
      "Soil Poisoning",
      "Reticulation System",
    ],
    serviceDetails: [
      { name: "General Pest Control", description: "Including common pests such as rats, cockroaches, flies, and mosquitoes.", price: null, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 0, status: "Active" },
      { name: "Termite Treatment", description: "Termite treatment estimate based on property type, floors, and area.", price: null, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 1, status: "Active" },
      { name: "Soil Poisoning", description: "Soil poisoning service priced by covered area.", price: null, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 2, status: "Active" },
      { name: "Reticulation System", description: "Reticulation system installation priced by area.", price: null, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 3, status: "Active" },
    ],
    forms: ["Additional notes"],
  },
  {
    icon: <Building2 />,
    slug: "inner-sparc-realty-corporation",
    name: "Real Estate / Property Inquiry",
    business: "Inner SPARC Realty Corporation",
    link: "inner-sparc-realty-corporation.slotwise.app",
    logo: "",
    primaryColor: "#17324D",
    accentColor: "#EEE7DA",
    pageBackgroundColor: "#F7F4EE",
    phone: "0999-994-3304",
    primaryEmail: "libacaoga@gmail.com",
    messengerLink: "",
    address: "",
    description: "Send us your property inquiry and let our team assist you.",
    businessType: "Real Estate",
    bookingMode: "inquiry",
    bookingTemplate: "REAL_ESTATE",
    package: "STARTER",
    featureFlags: { ...defaultFeatureFlags, requireDate: false, requireTime: false, showPrices: false },
    availability: { ...defaultAvailability, days: "", hours: "", slots: [] },
    cover: realEstateCover,
    accent: "real-estate",
    tagline: "Send us your property inquiry and let our team assist you.",
    highlight: "Package-aware property inquiries using the shared Slotwise workflow",
    stat: "Starter inquiry template",
    services: [],
    serviceDetails: [],
    forms: ["Additional requirements"],
  },
  {
    icon: <Eye />,
    slug: "ny-optical-clinic",
    name: "Optical Clinic",
    business: "NY Optical Clinic",
    link: "ny-optical-clinic.slotwise.app",
    logo: nyOpticalLogo,
    cover: nyOpticalCover,
    coverPosition: "center",
    primaryColor: "#173FA3",
    accentColor: "#E8EFFD",
    pageBackgroundColor: "#F5F8FC",
    phone: "09610928597",
    primaryEmail: "nyopticalclinic@gmail.com",
    messengerLink: "https://www.facebook.com/profile.php?id=61593258592352",
    address: "",
    description: "Book your optical consultation or choose the package that fits your vision care needs.",
    businessType: "Optical Clinic",
    bookingMode: "booking",
    bookingTemplate: "OPTICAL_CLINIC",
    package: "STARTER",
    status: "DEMO",
    featureFlags: { ...defaultFeatureFlags, localDemoOnly: true, opticalHeroEyebrow: "OPTICAL CLINIC", sampleServiceNotice: "Sample packages and prices shown for demo purposes only. Actual services and pricing will be finalized upon activation." },
    availability: {
      ...defaultAvailability,
      days: "Monday to Sunday",
      hours: "9:00 AM to 5:00 PM",
      slots: ["9:00 AM", "10:00 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM"],
    },
    cover: "",
    accent: "optical-clinic",
    tagline: "Clearer Vision. Better Everyday Living.",
    highlight: "Starter optical booking demo with package selection and schedule request",
    stat: "Starter demo",
    services: ["Basic Eye Check", "Eye Exam + Frame Consultation", "Standard Eyeglasses Package", "Premium Eyeglasses Package"],
    serviceDetails: [
      { name: "Basic Eye Check", description: "Basic vision screening and consultation.", price: 500, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 0, status: "Active", isSampleDemo: true },
      { name: "Eye Exam + Frame Consultation", description: "Vision assessment plus eyewear consultation.", price: 999, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 1, status: "Active", isSampleDemo: true },
      { name: "Standard Eyeglasses Package", description: "Sample optical package with frame and lens options.", price: 1499, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 2, status: "Active", isSampleDemo: true },
      { name: "Premium Eyeglasses Package", description: "Sample enhanced eyewear package option.", price: 2499, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 3, status: "Active", isSampleDemo: true },
    ],
    forms: ["Preferred notes or message"],
  },
  {
    icon: <HeartPulse />,
    slug: "the-vitality-collective",
    name: "Health & Wellness",
    business: "The Vitality Collective",
    link: "the-vitality-collective.slotwise.app",
    logo: "",
    primaryColor: "#5B3FD3",
    accentColor: "#F8DCEB",
    pageBackgroundColor: "#FCFAFD",
    phone: "09926377497",
    primaryEmail: "chin.nnej02@gmail.com",
    messengerLink: "",
    address: "",
    description: "Explore thoughtfully selected wellness options designed to fit into your everyday routine.",
    businessType: "Health & Wellness",
    bookingMode: "inquiry",
    bookingTemplate: "HEALTH_WELLNESS",
    package: "BUSINESS",
    featureFlags: { ...defaultFeatureFlags, requireDate: false, requireTime: false, clientAdminEnabled: true, customerListEnabled: true, wellnessHeroEyebrow: "EVERYDAY WELLNESS", wellnessHeroTitle: "Find Your Everyday Balance", wellnessFooterTagline: "Wellness made simpler for everyday life." },
    availability: { ...defaultAvailability, days: "Monday to Sunday", hours: "8:00 AM to 5:00 PM" },
    cover: healthWellnessCover,
    accent: "health-wellness",
    tagline: "Explore thoughtfully selected wellness options for your everyday routine.",
    highlight: "Flexible for product inquiries and scheduled wellness services",
    stat: "Five wellness options",
    services: ["Daily Balance 15", "Daily Balance 30", "Daily Balance 60", "Metabolic Support Plus", "Appetite Balance"],
    serviceDetails: [
      { name: "Daily Balance 15", description: "", price: 1949, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 0, status: "Active" },
      { name: "Daily Balance 30", description: "", price: 3249, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 1, status: "Active" },
      { name: "Daily Balance 60", description: "", price: 4250, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 2, status: "Active" },
      { name: "Metabolic Support Plus", description: "", price: 4099, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 3, status: "Active" },
      { name: "Appetite Balance", description: "", price: 2250, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 4, status: "Active" },
    ],
    forms: ["Questions or notes"],
  },
  {
    icon: <Sparkles />,
    slug: "the-facial-unlimited-ph",
    name: "Aesthetic Beauty Clinic",
    business: "The Facial Unlimited PH",
    link: "the-facial-unlimited-ph.slotwise.app",
    logo: facialUnlimitedLogo,
    primaryColor: "#3B3B91",
    accentColor: "#F0EFFF",
    pageBackgroundColor: "#FAFAFF",
    phone: "(0960) 822 5004",
    primaryEmail: "tfucareer.philippines@gmail.com",
    messengerLink: "https://www.facebook.com/profile.php?id=61592702334620",
    address: "",
    description: "Choose your preferred treatment and schedule your visit at a time that works for you.",
    businessType: "Aesthetic Beauty Clinic",
    bookingMode: "booking",
    bookingTemplate: "BEAUTY",
    package: "PRO",
    featureFlags: { ...defaultFeatureFlags, clientAdminEnabled: true, customerListEnabled: true, analyticsEnabled: true },
    availability: {
      ...defaultAvailability,
      days: "Monday to Sunday",
      hours: "9:00 AM to 6:00 PM",
      slots: ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"],
    },
    cover: facialUnlimitedCover,
    accent: "beauty",
    tagline: "Aesthetic beauty care with convenient online scheduling.",
    highlight: "Editable services, pricing, and availability",
    stat: "Open daily",
    services: ["Treatment Slot 1", "Treatment Slot 2", "Treatment Slot 3"],
    serviceDetails: [
      { name: "Treatment Slot 1", description: "", price: null, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 0, status: "Active" },
      { name: "Treatment Slot 2", description: "", price: null, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 1, status: "Active" },
      { name: "Treatment Slot 3", description: "", price: null, pricingUnit: "FLAT", pricingType: "FIXED", pricingTiers: [], durationMinutes: null, displayOrder: 2, status: "Active" },
    ],
    forms: ["Treatment concerns or notes"],
  },
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

const dmonsterOfficialServices = [
  "General Pest Control",
  "Termite Treatment",
  "Soil Poisoning",
  "Reticulation System",
];

const dmonsterServiceContent = {
  "General Pest Control": {
    description: "Including common pests such as rats, cockroaches, flies, and mosquitoes.",
    cardPrice: "Starts at ₱3,500",
  },
  "Termite Treatment": {
    description: "Termite treatment estimate based on property type, floors, and area.",
    cardPrice: "Starts at ₱7,500",
  },
  "Soil Poisoning": {
    description: "Soil poisoning service priced by covered area.",
    cardPrice: "Starts at ₱200/sqm",
  },
  "Reticulation System": {
    description: "Reticulation system installation priced by area.",
    cardPrice: "₱200/sqm",
  },
};

const dmonsterPropertyTypes = [
  "Condominium",
  "House",
  "Commercial Establishment",
  "Office",
  "Warehouse",
  "Other",
];

const dmonsterFloorOptions = [
  { value: "1", label: "1 Floor" },
  { value: "2", label: "2 Floors" },
  { value: "3", label: "3 Floors" },
  { value: "4", label: "More than 3 Floors" },
];

const dmonsterServiceAreas = ["Metro Manila / NCR", "Outside Metro Manila / NCR"];

const facialUnlimitedBranches = ["Pateros", "Parañaque", "Taguig / Lakeshore", "Antipolo"];

function getDmonsterServiceContent(name = "") {
  return dmonsterServiceContent[name] || {};
}

function calculateDmonsterPestPrice(serviceName, details = {}) {
  const area = Number(details.areaSize);
  if (!Number.isFinite(area) || area <= 0) {
    return { status: "assessment_required", total: null, formula: "", note: "Enter a valid area size to estimate pricing." };
  }
  const propertyType = details.propertyType || "";
  const serviceArea = details.serviceArea || "";
  const floors = Number(details.floors || 0);
  if (serviceName === "General Pest Control") {
    return { status: "assessment_required", total: null, formula: [propertyType, `${area} sqm`, serviceArea].filter(Boolean).join(" • "), note: "We'll review your property and service details to confirm the applicable price." };
  }
  if (serviceName === "Termite Treatment") {
    const isCondo = propertyType === "Condominium";
    const isHouse = propertyType === "House";
    const isMetroManila = serviceArea === "Metro Manila / NCR";
    if (isCondo && area >= 20 && area <= 70) return { status: "calculated", total: 7500, formula: `${propertyType} • ${area} sqm${serviceArea ? ` • ${serviceArea}` : ""}`, note: "Estimated price based on the information provided. Final price is subject to business assessment and confirmation." };
    if ((isCondo || isHouse) && floors <= 2 && area >= 80 && area <= 100) return { status: "calculated", total: 10000, formula: `${propertyType} • up to 2 floors • ${area} sqm${serviceArea ? ` • ${serviceArea}` : ""}`, note: "Estimated price based on the information provided. Final price is subject to business assessment and confirmation." };
    if (isHouse && floors === 3 && area >= 100 && area <= 150) return { status: "calculated", total: 15000, formula: `${propertyType} • 3 floors • ${area} sqm${serviceArea ? ` • ${serviceArea}` : ""}`, note: "Estimated price based on the information provided. Final price is subject to business assessment and confirmation." };
    if ((isCondo || isHouse || propertyType === "Commercial Establishment" || propertyType === "Office" || propertyType === "Warehouse") && isMetroManila && area > 150) return { status: "calculated", total: area * 100, formula: `${propertyType} • ${area} sqm × ₱100/sqm • ${serviceArea}`, note: "Estimated price based on the information provided. Final price is subject to business assessment and confirmation." };
    return { status: "assessment_required", total: null, formula: [propertyType, floors ? `${floors >= 4 ? "More than 3" : floors} floor${floors === 1 ? "" : "s"}` : "", `${area} sqm`, serviceArea].filter(Boolean).join(" • "), note: "We'll review your property and service details to confirm the applicable price." };
  }
  if (serviceName === "Soil Poisoning") {
    if (area >= 50 && area <= 100) return { status: "calculated", total: area * 200, formula: `${area} sqm × ₱200/sqm${serviceArea ? ` • ${serviceArea}` : ""}`, note: "Estimated price based on the information provided. Final price is subject to business assessment and confirmation." };
    if (area > 200) return { status: "calculated", total: area * 100, formula: `${area} sqm × ₱100/sqm${serviceArea ? ` • ${serviceArea}` : ""}`, note: "Estimated price based on the information provided. Final price is subject to business assessment and confirmation." };
    return { status: "assessment_required", total: null, formula: [propertyType, `${area} sqm`, serviceArea].filter(Boolean).join(" • "), note: "We'll review your property and service details to confirm the applicable price." };
  }
  if (serviceName === "Reticulation System") {
    return { status: "calculated", total: area * 200, formula: `${area} sqm × ₱200/sqm${serviceArea ? ` • ${serviceArea}` : ""}`, note: "Estimated price based on the information provided. Final price is subject to business assessment and confirmation." };
  }
  return { status: "assessment_required", total: null, formula: [propertyType, `${area} sqm`, serviceArea].filter(Boolean).join(" • "), note: "We'll review your property and service details to confirm the applicable price." };
}

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
      const next = mergeBusinessCatalogEntry(previous, business);
      bySlug.set(business.slug, next);
    });
    return Array.from(bySlug.values());
  }, [setupRequests, databaseBusinesses]);
  const smmAdminBusinesses = useMemo(() => {
    const databaseSlugs = new Set(databaseBusinesses.map((business) => business.slug));
    const localDemoTemplates = templates
      .filter((business) => business.featureFlags?.localDemoOnly && !databaseSlugs.has(business.slug))
      .map((business) => normalizeBusinessConfig(business));
    return [...databaseBusinesses, ...localDemoTemplates];
  }, [databaseBusinesses]);
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
    let paymentMethodsLoad = { state: "success", count: 0, error: null };
    const loadPaymentMethods = async () => {
      try {
        const rows = scopeSlug && !accessToken
          ? await supabaseRequest("rpc/get_public_payment_methods", { method: "POST", body: { target_slug: scopeSlug } })
          : await supabaseRequest("business_payment_methods", { query: paymentMethodsQuery, accessToken });
        paymentMethodsLoad.count = (rows || []).length;
        return rows || [];
      } catch (error) {
        // The request contains only a slug; redact tokens and URLs before logging.
        const redact = (value) => String(value || "").replace(/https?:\/\/\S+/g, "[URL]").replace(/eyJ[A-Za-z0-9_.-]+/g, "[token]").slice(0, 400);
        paymentMethodsLoad = { state: "error", count: null, error: { code: redact(error.code), message: redact(error.message), details: redact(error.details), hint: redact(error.hint) } };
        console.warn("Public payment methods query failed", paymentMethodsLoad.error);
        return [];
      }
    };
    const [onlineBusinesses, onlineServices, onlineAvailability, onlineBlockedDates, onlinePaymentSettings, onlinePaymentMethods] = await Promise.all([
      supabaseRequest("businesses", { query: businessQuery, accessToken }),
      supabaseRequest("business_services", { query: serviceQuery, accessToken }),
      supabaseRequest("business_availability", { query: availabilityQuery, accessToken }),
      supabaseRequest("business_blocked_dates", { query: blockedDatesQuery, accessToken }).catch(() => []),
      supabaseRequest("business_payment_settings", { query: paymentSettingsQuery, accessToken }).catch(() => []),
      loadPaymentMethods(),
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
    const normalized = (onlineBusinesses || []).map((business) => ({
      ...normalizeDatabaseBusiness(
        business,
        servicesByBusiness[business.slug] || [],
        {
          ...(availabilityByBusiness[business.slug] || {}),
          blocked_dates: blockedDatesByBusiness[business.slug] || [],
        },
        paymentSettingsByBusiness[business.slug] || null,
        paymentMethodsByBusiness[business.slug] || [],
      ),
      paymentMethodsLoad,
    }));

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
      return !confirmed || !serviceRowConfirmsPersistence(confirmed, serviceRowToStructured(service));
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

  const deleteBooking = async (bookingId, accessToken = "") => {
    await supabaseRpcRequest("delete_client_booking", { booking_id_value: bookingId }, accessToken);
  };

  const createManualReservation = async (reservationData, accessToken = "") => {
    const result = await supabaseRpcRequest("create_manual_reservation", reservationData, accessToken);
    return Array.isArray(result) ? result[0] : result;
  };

  const upsertClientRecord = async (clientData, accessToken = "") => {
    try {
      const result = await supabaseRpcRequest("upsert_client_record", clientData, accessToken);
      return Array.isArray(result) ? result[0] : result;
    } catch (rpcError) {
      console.warn("Client record RPC failed; trying RLS table upsert fallback", {
        message: rpcError.message,
        code: rpcError.code,
        details: rpcError.details,
      });
      const result = await supabaseRequest("client_records", {
        method: "POST",
        accessToken,
        prefer: "resolution=merge-duplicates,return=representation",
        body: {
          id: clientData.client_record_id,
          business_slug: clientData.business_slug_value,
          full_name: clientData.full_name_value,
          contact_number: clientData.contact_number_value,
          email: clientData.email_value || null,
          assigned_branch: clientData.assigned_branch_value,
          notes: clientData.notes_value || null,
        },
      });
      return Array.isArray(result) ? result[0] : result;
    }
  };

  const deleteClientRecord = async (clientRecordId, accessToken = "") => {
    return supabaseRpcRequest("delete_client_record", { client_record_id_value: clientRecordId }, accessToken);
  };

  const upsertClientServiceRecord = async (serviceRecordData, accessToken = "") => {
    const result = await supabaseRpcRequest("upsert_client_service_record", serviceRecordData, accessToken);
    const saved = Array.isArray(result) ? result[0] : result;
    if (!saved || saved.id !== serviceRecordData.service_record_id || saved.business_slug !== serviceRecordData.business_slug_value || saved.client_record_id !== serviceRecordData.client_record_id_value) {
      const error = new Error("The database did not confirm this service record. Please reload the client before retrying.");
      error.code = "SERVICE_RECORD_NOT_CONFIRMED";
      throw error;
    }
    return saved;
  };

  const upsertClientInquiry = async (inquiryData, accessToken = "") => {
    const result = await supabaseRpcRequest("upsert_client_inquiry", inquiryData, accessToken);
    return Array.isArray(result) ? result[0] : result;
  };

  const convertInquiryToBooking = async (conversionData, accessToken = "") => {
    const result = await supabaseRpcRequest("convert_inquiry_to_booking", conversionData, accessToken);
    return Array.isArray(result) ? result[0] : result;
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

  const saveClientBusinessProfile = async (profileData, accessToken = "") => {
    await supabaseRpcRequest("update_client_business_profile", profileData, accessToken);
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
    if (booking.metadata?.booking_template === "AIRCON_SERVICES" && (!supabaseUrl || !supabaseAnonKey)) {
      throw new Error("Online requests are unavailable. Please contact the business.");
    }
    let nextBooking = { ...booking, id: `SW-${Date.now().toString().slice(-5)}`, status: booking.status || "Confirmed" };
    try {
      if (supabaseUrl && supabaseAnonKey) {
        const { businessSlug, bookingItems, ...databaseBooking } = nextBooking;
        const rpcResult = await supabaseRpcRequest("submit_public_booking", { booking_payload: databaseBooking });
        const onlineBooking = Array.isArray(rpcResult) ? rpcResult[0] : rpcResult;
        if (bookingItems?.length) {
          await supabaseRpcRequest("submit_public_booking_items", {
            booking_id_value: nextBooking.id,
            business_slug_value: nextBooking.business_slug,
            items_payload: bookingItems.map((item, index) => ({
              id: `${nextBooking.id}-item-${index + 1}`,
              service_id: item.serviceId || null,
              service_name_snapshot: item.serviceName,
              pricing_type_snapshot: item.pricingType,
              unit_price_snapshot: item.unitPrice ?? null,
              quantity: item.quantity,
              selected_tier_snapshot: item.selectedTier || null,
              line_total: item.lineTotal ?? null,
            })),
          });
        }
        nextBooking = { ...(onlineBooking || nextBooking), booking_items: bookingItems || [] };
      }
    } catch (error) {
      console.error("Slotwise booking insert failed", {
        operation: "public booking save",
        message: error.message,
        business_slug: nextBooking.business_slug,
        service: nextBooking.service,
        slot: nextBooking.slot,
      });
      throw new Error(`Booking could not be saved online: ${error.message}`);
    }
    const possessionToken = nextBooking.public_possession_token || "";
    const persistedBooking = { ...nextBooking };
    delete persistedBooking.public_possession_token;
    const nextBookings = [persistedBooking, ...bookings];
    setBookings(nextBookings);
    localStorage.setItem("slotwiseBookings", JSON.stringify(nextBookings));
    return { ...persistedBooking, public_possession_token: possessionToken };
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
        businesses={smmAdminBusinesses}
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
        onDeleteBooking={deleteBooking}
        onCreateManualReservation={createManualReservation}
        onUpsertClientRecord={upsertClientRecord}
        onDeleteClientRecord={deleteClientRecord}
        onUpsertClientServiceRecord={upsertClientServiceRecord}
        onUpsertInquiry={upsertClientInquiry}
        onConvertInquiryToBooking={convertInquiryToBooking}
        onSaveService={saveClientService}
        onDeleteService={deleteClientService}
        onSaveAvailability={saveClientAvailability}
        onSaveBusinessProfile={saveClientBusinessProfile}
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
          <Feature icon={<MessageSquare />} title="Notifications" text="Start with email confirmations, then expand with optional SMS reminders when available." />
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
  const contactHref = SMM_FACEBOOK_URL;
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

function TravelBusinessInfo({ business }) {
  const additionalEmails = splitContactValues(business.additionalEmails)
    .filter((email) => email && email.toLowerCase() !== business.primaryEmail?.toLowerCase());
  const isPhisavong = business.slug === "phisavong-world-travel-and-tours";
  const content = (
    <div className="travelBusinessInfoList">
      <h2>Contact &amp; Information</h2>
      <div><Clock size={17} /><span><strong>Business Hours</strong><small>{business.availability?.days || "Schedule available on request"}{business.availability?.hours ? ` · ${business.availability.hours}` : ""}</small></span></div>
      {business.phone && <a href={normalizePhoneLink(business.phone)}><Phone size={17} /><span><strong>Office</strong><small>{business.phone}</small></span></a>}
      {business.mobileNumbers && <div><Smartphone size={17} /><span><strong>Mobile</strong>{splitContactValues(business.mobileNumbers).map((number) => <small key={number}><a href={normalizePhoneLink(number)}>{number}</a></small>)}</span></div>}
      {business.primaryEmail && <a href={`mailto:${business.primaryEmail}`}><Mail size={17} /><span><strong>Email</strong><small>{business.primaryEmail}</small></span></a>}
      {additionalEmails.length > 0 && <div><Mail size={17} /><span><strong>Other Emails</strong>{additionalEmails.map((email) => <small key={email}><a href={`mailto:${email}`}>{email}</a></small>)}</span></div>}
      {business.messengerLink && <a href={normalizeServiceLink(business.messengerLink)} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /><span><strong>Messenger</strong><small>{isPhisavong ? "Message us on Facebook" : "Open Messenger"} <ExternalLink size={12} /></small></span></a>}
      {business.website && <a href={normalizeServiceLink(business.website)} target="_blank" rel="noopener noreferrer"><Globe size={17} /><span><strong>Website</strong><small>{business.website.replace(/^https?:\/\//i, "").replace(/\/$/, "")} <ExternalLink size={12} /></small></span></a>}
    </div>
  );

  return (
    <>
      <div className="travelBusinessInfo travelBusinessInfoDesktop">{content}</div>
      <details className="travelBusinessInfo travelBusinessInfoMobile">
        <summary>Contact &amp; Information <ChevronRight size={16} /></summary>
        {content}
      </details>
    </>
  );
}

function BookingPrototype({ business: incomingBusiness, onBack, onSaveBooking, onSubmitPayment, smmOffers = null }) {
  if (normalizeBookingTemplate(incomingBusiness?.bookingTemplate) === "AIRCON_SERVICES") {
    return <AirconBooking business={normalizeBusinessConfig(incomingBusiness)} onBack={onBack} onSaveBooking={onSaveBooking} helpers={{ calculateBookingTotal, formatPeso, formatDashboardPeso, getTodayDateValue, formatBookingDate, timeInputToDisplay, displayTimeToInput, isPastPreferredSchedule, isBusinessOpen24Hours, getPackageCapabilities, isDemoExpired }} />;
  }
  return <StandardBookingPrototype business={incomingBusiness} onBack={onBack} onSaveBooking={onSaveBooking} onSubmitPayment={onSubmitPayment} smmOffers={smmOffers} />;
}

function StandardBookingPrototype({ business: incomingBusiness, onBack, onSaveBooking, onSubmitPayment, smmOffers = null }) {
  const business = useMemo(() => {
    const normalized = normalizeBusinessConfig({
    ...(incomingBusiness || {}),
    services: Array.isArray(incomingBusiness?.services) ? incomingBusiness.services : [],
    serviceDetails: Array.isArray(incomingBusiness?.serviceDetails) ? incomingBusiness.serviceDetails : [],
    forms: Array.isArray(incomingBusiness?.forms) && incomingBusiness.forms.length ? incomingBusiness.forms : undefined,
    availability: incomingBusiness?.availability && typeof incomingBusiness.availability === "object" ? incomingBusiness.availability : {},
    featureFlags: incomingBusiness?.featureFlags && typeof incomingBusiness.featureFlags === "object" ? incomingBusiness.featureFlags : {},
    });
    const normalizedTemplate = normalizeBookingTemplate(normalized.bookingTemplate);
    if (normalized.slug === "dmonster-pest-control-services") {
      const existingDetailsByName = new Map(
        (normalized.serviceDetails || []).map((detail) => [String(detail.name || detail.service || "").trim().toLowerCase(), detail])
      );
      const serviceDetails = dmonsterOfficialServices.map((name, index) => ({
        id: `dmonster-pest-service-${index + 1}`,
        name,
        description: "",
        price: null,
        pricingUnit: "FLAT",
        pricingType: "FIXED",
        pricingTiers: [],
        durationMinutes: null,
        displayOrder: index,
        status: "Active",
        ...(existingDetailsByName.get(name.toLowerCase()) || {}),
        name,
        displayOrder: index,
        status: existingDetailsByName.get(name.toLowerCase())?.status || "Active",
      }));
      return {
        ...normalized,
        bookingTemplate: "PEST_CONTROL",
        bookingMode: "booking",
        businessType: "Pest Control",
        accent: "pest-control",
        featureFlags: { ...normalized.featureFlags, showPrices: false, requireDate: true, requireTime: true },
        availability: {
          ...normalized.availability,
          days: normalized.availability?.days || normalized.availability?.openDays || "Operate Any Time",
          hours: normalized.availability?.hours || normalized.availability?.openHours || "Open 24/7",
        },
        services: dmonsterOfficialServices,
        serviceDetails,
      };
    }
    if (!["REAL_ESTATE", "PEST_CONTROL"].includes(normalizedTemplate) || normalized.services.length) return normalized;
    const inquiryCategories = normalizedTemplate === "REAL_ESTATE"
      ? ["House & Lot", "Condominium", "Lot Only", "Commercial Property", "Rental", "Others"]
      : ["General Pest Control", "Termite Control", "Cockroach Control", "Rodent Control", "Mosquito Control", "Other Pest Concern"];
    return {
      ...normalized,
      services: inquiryCategories,
      serviceDetails: inquiryCategories.map((name, index) => ({
        id: `${normalizedTemplate.toLowerCase()}-inquiry-${index + 1}`,
        name,
        description: "",
        price: null,
        pricingType: "CUSTOM_INQUIRY",
        pricingUnit: "FLAT",
        displayOrder: index,
        status: "Active",
        isGenericInquiryCategory: true,
      })),
    };
  }, [incomingBusiness]);
  const [pickedService, setPickedService] = useState(business.services[0]);
  const [pickedServices, setPickedServices] = useState([business.services[0]].filter(Boolean));
  const [selectedPlanImage, setSelectedPlanImage] = useState(null);
  const [selectedDeparture, setSelectedDeparture] = useState(null);
  const [departurePanelService, setDeparturePanelService] = useState(null);
  const fallbackAvailableSlots = business.availability?.slots?.length ? business.availability.slots : slots;
  const [pickedSlot, setPickedSlot] = useState(fallbackAvailableSlots[1] || fallbackAvailableSlots[0] || "10:15 AM");
  const [selectedBookingDate, setSelectedBookingDate] = useState(getTodayDateValue());
  const [selectedCheckoutDate, setSelectedCheckoutDate] = useState(() => {
    const next = new Date();
    next.setDate(next.getDate() + 1);
    return next.toISOString().slice(0, 10);
  });
  const [guestCount, setGuestCount] = useState(2);
  const [adultCount, setAdultCount] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [travelDetails, setTravelDetails] = useState({ tripType: "ROUND_TRIP", origin: "", destination: "", returnDate: "", applicants: 1, pickupLocation: "", requestedInclusions: "", preferredHotelCategory: "No Preference", roomType: "", customerEmail: "", customerAddress: "" });
  const [confirmed, setConfirmed] = useState(null);
  const [confirmedPayment, setConfirmedPayment] = useState(null);
  const [bookingError, setBookingError] = useState("");
  const [customerPdfMessage, setCustomerPdfMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentChoice, setPaymentChoice] = useState("");
  const [paymentForm, setPaymentForm] = useState({ method: "", amount: "", reference: "", note: "" });
  const [paymentProofFile, setPaymentProofFile] = useState(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState("");
  const [copiedPaymentMethod, setCopiedPaymentMethod] = useState("");
  const [bookingPossessionToken, setBookingPossessionToken] = useState("");
  const [travelActiveStep, setTravelActiveStep] = useState(1);
  const [beautyActiveStep, setBeautyActiveStep] = useState(1);
  const [realEstateActiveStep, setRealEstateActiveStep] = useState(1);
  const [realEstateDetails, setRealEstateDetails] = useState({ location: "", budgetRange: "", purpose: "Personal Use", requirements: "" });
  const [pestControlActiveStep, setPestControlActiveStep] = useState(1);
  const [pestControlDetails, setPestControlDetails] = useState({ propertyType: "House", serviceArea: "Metro Manila / NCR", serviceLocation: "", areaSize: "", floors: "1" });
  const [partyEventDetails, setPartyEventDetails] = useState({ eventType: "Birthday", eventLocation: "", guestCount: "", specialRequests: "" });
  const [xtremePrimary, setXtremePrimary] = useState("XTREME STEPPER");
  const [rentalHours, setRentalHours] = useState(1);
  const flags = { ...defaultFeatureFlags, ...(business.featureFlags || {}) };
  const clientStatus = (business.status || "ACTIVE").toUpperCase();
  const isProductionActive = clientStatus === "ACTIVE";
  const isDemoPreview = clientStatus === "DEMO";
  const isDemoActive = isDemoPreview && !isDemoExpired(business);
  const canPersistPublicBooking = (isProductionActive || isDemoActive) && !business.featureFlags?.localDemoOnly;
  const isAwaitingActivation = clientStatus === "UNPAID";
  const demoExpiryState = getDemoExpiryState(business);
  const blockedDates = business.availability?.blockedDates || [];
  const isBlockedDate = blockedDates.some((blockedDate) => blockedDate.blocked_date === selectedBookingDate && blockedDate.active !== false);
  const selectedDateLabel = formatBookingDate(selectedBookingDate);
  const selectedWeekdayLabel = formatBookingWeekday(selectedBookingDate);
  const bookingTone = resolveBusinessTone(business);
  const currentPackage = normalizePackage(business.package);
  const capabilities = getPackageCapabilities(currentPackage, business.featureFlags);
  const isClinic = bookingTone === "clinic";
  const isOpticalClinic = bookingTone === "optical-clinic";
  const isHealthWellness = bookingTone === "health-wellness";
  const isBeauty = bookingTone === "beauty";
  const isStarterBeauty = isBeauty && currentPackage === "STARTER";
  const isBusinessBeauty = isBeauty && currentPackage === "BUSINESS";
  const isProBeauty = isBeauty && currentPackage === "PRO";
  const hasEnhancedBeautyPage = isBusinessBeauty || isProBeauty;
  const isProHealthWellness = isHealthWellness && normalizePackage(business.package) === "PRO";
  const hasExpandedWellnessPage = isHealthWellness && ["BUSINESS", "PRO"].includes(normalizePackage(business.package));
  const isToursTravel = bookingTone === "tours-travel";
  const isRealEstate = bookingTone === "real-estate";
  const isPestControl = bookingTone === "pest-control";
  const isDmonster = business.slug === "dmonster-pest-control-services";
  const isPartyXpress = business.slug === "party-xpress-rentals";
  const isXtremeDancers = business.slug === "xtreme-dancers-studio";
  const xtremeFacebookUrl = isXtremeDancers
    ? business.featureFlags?.facebookPage || "https://www.facebook.com/CraveYardStudio"
    : "";
  const isXtremeDancersDemo = isXtremeDancers && clientStatus === "DEMO";
  const usesPreferredSchedule = isBusinessOpen24Hours(business.availability);
  const xtremeGroups = useMemo(() => {
    if (!isXtremeDancers) return {};
    const groups = { "XTREME STEPPER": [], "WEEKEND DANCE CLASS": [], "PRIVATE CLASS": [], "STUDIO RENTAL": [] };
    (business.serviceDetails || []).forEach((service) => {
      const name = String(service.name || "").toUpperCase();
      const group = name.startsWith("XTREME STEPPER") ? "XTREME STEPPER"
        : name.startsWith("WEEKEND DANCE CLASS") ? "WEEKEND DANCE CLASS"
          : name.startsWith("PRIVATE CLASS") ? "PRIVATE CLASS"
            : name.startsWith("STUDIO RENTAL") ? "STUDIO RENTAL" : null;
      if (group) groups[group].push(service);
    });
    return groups;
  }, [business.serviceDetails, isXtremeDancers]);
  const xtremePrimaryOptions = ["XTREME STEPPER", "WEEKEND DANCE CLASS", "PRIVATE CLASS", "STUDIO RENTAL"];
  const isPhisavong = business.slug === "phisavong-world-travel-and-tours";
  const travelSeasonalNoticeTitle = String(
    business.featureFlags?.seasonalRatesNoticeTitle || "Seasonal Rates & Packages",
  ).trim();
  const travelSeasonalNotice = String(
    business.featureFlags?.seasonalRatesNotice
      || "Rates, package inclusions, and availability may vary depending on season and travel dates. Final rates will be confirmed upon inquiry or reservation.",
  ).trim();
  const isAccommodation = normalizeBookingTemplate(business.bookingTemplate) === "STAYCATION_ACCOMMODATION";
  const isLaundry = normalizeBookingTemplate(business.bookingTemplate) === "LAUNDRY";
  const isTravel = bookingTone === "travel" || isToursTravel;
  const isHomeService = bookingTone === "home-service";
  const isConsultant = bookingTone === "professional-services";
  const brandInitial = (business.business || "S").trim().charAt(0).toUpperCase();
  const brandInitials = (business.business || "S")
    .trim()
    .split(/\s+/)
    .slice(0, 3)
    .map((word) => word.charAt(0).toUpperCase())
    .join("") || brandInitial;
  const templateCopy = getBookingTemplateCopy(business.bookingTemplate, business);
  const brandCategory = templateCopy.category;
  const brandLine = templateCopy.tagline;
  const headingText = isXtremeDancers ? "Book Your Session" : isPartyXpress ? "Request a Booking" : isPestControl ? "Request Pest Control Service" : isRealEstate ? "Property Inquiry" : isAccommodation ? "Reserve Your Stay" : isToursTravel ? "Plan Your Trip" : isOpticalClinic ? "Book Your Optical Visit" : isHealthWellness ? "Our Wellness Collection" : isLaundry ? "Book Laundry Pickup" : isConsultant ? "Plans & Services" : isHomeService ? "Book a Service" : flags.bookingEnabled ? "Book an appointment" : "Send an inquiry";
  const beautyBookingIntro = business.description === "Professional aesthetic beauty care in a clean and welcoming clinic setting."
    ? "Choose your preferred treatment and schedule your visit at a time that works for you."
    : business.description;
  const headerSubtext = isXtremeDancers ? (isXtremeDancersDemo ? "Choose a sample class and request a date and time." : "Find your class. Pick your schedule. Own the floor.") : isPartyXpress ? "Tell us what you need for your event and we will review availability." : isPestControl ? "Tell us what you need and choose your preferred schedule." : isRealEstate ? "Tell us what you're looking for and we'll help you with your property inquiry." : isAccommodation ? (business.description || "Choose your room or unit, check-in date, check-out date, and guest count.") : isToursTravel ? "Choose a travel service to get started." : isOpticalClinic ? "Choose a package or service and select your preferred schedule." : isHealthWellness ? "Choose the product or service that fits your everyday routine." : isProBeauty ? beautyBookingIntro : isLaundry ? (business.description || "Choose your laundry service, pickup date, and pickup time.") : isConsultant ? (business.description || "Choose a plan, view the full details, and send your inquiry.") : isHomeService ? "Choose the service you need and your preferred date and time." : business.description;
  const serviceStepLabel = isPartyXpress ? "What Do You Need?" : isPestControl ? "Choose a Service" : isRealEstate ? "Property Type" : isAccommodation ? "Choose Room / Unit" : isToursTravel ? "Choose a Travel Service" : isOpticalClinic ? "Package / Service" : isHealthWellness ? "Choose Product / Service" : isLaundry ? "Choose a Laundry Service" : isConsultant ? "Plans & Services" : isHomeService ? "Choose a Service" : "Choose a service";
  const ServiceStepIcon = isXtremeDancers ? Music2 : resolveTemplateSectionIcon(business.bookingTemplate);
  const timeStepLabel = isXtremeDancers ? (isXtremeDancersDemo ? "Choose Demo Date & Time" : "Choose Class Date & Time") : isPartyXpress ? "Event Details" : usesPreferredSchedule ? "Select Your Preferred Schedule" : isPestControl ? "Select Your Schedule" : isAccommodation ? "Check-in & Check-out" : isToursTravel ? "Select Travel Dates" : isOpticalClinic ? "Schedule" : isHealthWellness ? "Preferred Schedule" : isLaundry ? "Pickup Date & Time" : isHomeService ? "Choose date and time" : "Pick a time";
  const slotLabel = isToursTravel ? "Preferred Time / Pickup Time" : isLaundry ? "Pickup Time" : "";
  const detailsStepLabel = isPestControl ? "Your Details" : isRealEstate ? "Your Details" : isAccommodation ? "Guest Information" : isToursTravel ? "Traveler Information" : isOpticalClinic ? "Your Details" : isHealthWellness ? "Your Information" : isLaundry ? "Pickup Details" : isHomeService ? "Your contact details" : "Your details";
  const detailsStepNumber = isDmonster ? 5 : isPestControl ? 4 : isRealEstate ? 3 : isToursTravel ? 4 : (flags.requireTime || isAccommodation ? 3 : 2);
  const noteLabel = isPartyXpress ? "Additional Details / Special Requests" : isPestControl ? "Additional Notes" : isRealEstate ? "Additional Requirements" : isAccommodation ? "Special Requests" : isToursTravel ? "Special Requests / Notes" : isOpticalClinic ? "Preferred Notes / Message" : isLaundry ? "Laundry notes" : isConsultant ? "Inquiry / Notes" : isHomeService ? "Service concern / notes" : `${business.forms[0]} / notes`;
  const notePlaceholder = isPartyXpress ? "Theme, setup needs, delivery notes, preferred package, or other event details" : isAccommodation ? "Arrival notes, requests, or questions for the host" : isToursTravel ? "Preferred pickup details, guest needs, or questions for the tour operator" : isOpticalClinic ? "Preferred package notes, frame/lens questions, or appointment message" : isLaundry ? "Fabric care, folding instructions, delivery notes, or special requests" : isConsultant ? "Tell us which plan you need, coverage questions, or who should contact you." : isHomeService ? "Describe the issue, unit type, or anything the technician should know" : business.forms.join(", ");
  const submitLabel = isPartyXpress ? "Submit Booking Request" : isPestControl ? "Submit Service Request" : isRealEstate ? "Submit Property Inquiry" : isAccommodation ? "Submit Reservation" : isToursTravel ? "Submit Travel Inquiry" : isOpticalClinic ? "Submit Optical Booking Request" : isHealthWellness ? (flags.requireDate || flags.requireTime ? "Submit Booking Request" : "Submit Request") : isLaundry ? "Submit Pickup Request" : isConsultant ? "Send Inquiry" : isHomeService ? "Submit Service Request" : flags.bookingEnabled ? "Submit booking request" : "Send inquiry";
  const paymentSettings = business.paymentSettings || {};
  const paymentCapability = resolvePublicPaymentCapability({
    packageCapabilities: capabilities,
    settings: { ...paymentSettings, enabled: paymentSettings.enabled ?? business.featureFlags?.paymentEnabled },
    methods: business.paymentMethods || [],
    status: clientStatus,
  });
  const paymentMethods = paymentCapability.validPaymentMethods;
  const allowMultipleServices = Boolean(flags.allowMultipleServices);
  const getServiceDetail = (serviceName) => {
    const detail = business.serviceDetails?.find((item) => item.name === serviceName);
    const hasTravelRate = detail?.price !== null && detail?.price !== "" && detail?.price !== undefined;
    const storedPricingType = normalizePricingType(detail?.pricingType, isAccommodation ? "PER_NIGHT" : isToursTravel ? detail?.pricingUnit || "FIXED" : "FIXED");
    return {
      id: detail?.id || null,
      name: serviceName,
      durationMinutes: detail?.durationMinutes ?? null,
      price: detail?.price ?? null,
      pricingUnit: normalizePricingUnit(detail?.pricingUnit, isAccommodation ? "PER_NIGHT" : isToursTravel ? "PER_PAX" : "FLAT"),
      pricingType: isToursTravel && !hasTravelRate && storedPricingType !== "GROUP_TIER" ? "CUSTOM_INQUIRY" : storedPricingType,
      pricingTiers: [
        ...normalizePricingTiers(detail?.pricingTiers),
      ],
      schedule: normalizeServiceSchedule(detail?.schedule),
      departureDates: normalizeDepartureDates(detail?.departureDates || detail?.departures),
      maxGuests: detail?.maxGuests ?? null,
      includedGuests: detail?.includedGuests ?? null,
      extraGuestFee: detail?.extraGuestFee ?? null,
      imageUrl: detail?.imageUrl || "",
      serviceCategory: detail?.serviceCategory || detail?.category || "",
      unitQuantity: detail?.unitQuantity ?? 1,
      description: detail?.description || "",
    };
  };
  const getXtremeCardDetail = (category) => ({
    id: `xtreme-category-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: category,
    description: category === "XTREME STEPPER" ? "Regular dance sessions with per-session or monthly options."
      : category === "WEEKEND DANCE CLASS" ? "Saturday dance classes for kids, teens, steppers, and adult beginners."
        : category === "PRIVATE CLASS" ? "Private 1-on-1 dance class."
          : "Hourly studio rental with air-conditioned and non-air-conditioned options.",
    price: null,
    durationMinutes: null,
    pricingType: "CUSTOM_INQUIRY",
    pricingUnit: "FLAT",
  });
  const displayServices = isXtremeDancers ? xtremePrimaryOptions : business.services;
  const isXtremeWeekendClass = isXtremeDancers && xtremePrimary === "WEEKEND DANCE CLASS";
  const isXtremeRental = isXtremeDancers && xtremePrimary === "STUDIO RENTAL";
  const isXtremePrivateClass = isXtremeDancers && xtremePrimary === "PRIVATE CLASS";
  const isXtremeFixedSchedule = isXtremeDancers && !isXtremeRental && !isXtremePrivateClass;
  const selectedServiceNames = allowMultipleServices ? pickedServices : [pickedService].filter(Boolean);
  const selectedServiceDetails = selectedServiceNames.map(getServiceDetail);
  const pickedServiceDetail = getServiceDetail(pickedService);
  const availableSlots = getServiceScheduleSlots(pickedServiceDetail, selectedBookingDate, fallbackAvailableSlots);
  const normalizedAvailableSlots = availableSlots.map((slot) => formatScheduleInterval(slot, pickedServiceDetail.durationMinutes));
  const effectivePickedSlot = isXtremeFixedSchedule ? (normalizedAvailableSlots[0] || formatScheduleInterval(pickedSlot, pickedServiceDetail.durationMinutes)) : pickedSlot;
  const savedDepartures = isToursTravel ? getUpcomingDepartures(pickedServiceDetail.departureDates) : [];
  const hasSavedDepartures = savedDepartures.length > 0;
  const travelServiceKind = isToursTravel ? getTravelServiceKind(pickedService) : "";
  const stayNights = getNightCount(selectedBookingDate, selectedCheckoutDate);
  const accommodationGuests = adultCount + childCount;
  const needsGuestCount = isAccommodation || selectedServiceDetails.some((detail) => ["PER_PAX", "GROUP_TIER"].includes(normalizePricingType(detail.pricingType, detail.pricingUnit)));
  const activeDeparture = selectedDeparture?.serviceId === pickedServiceDetail.id ? selectedDeparture : null;
  const hasSelectedDeparture = Boolean(activeDeparture);
  const bookingCalculation = calculateBookingTotal(selectedServiceDetails, { pax: isAccommodation ? accommodationGuests : guestCount, totalGuests: accommodationGuests, nights: stayNights || 1, units: isXtremeRental ? rentalHours : 1, perUnit: isXtremeRental, selectedDeparture: activeDeparture, allowQuoteWithoutPrice: isPartyXpress || isToursTravel || isRealEstate || isPestControl });
  const pickedPricing = bookingCalculation.lineItems[0] || calculateLineItem(pickedServiceDetail, { pax: guestCount, nights: stayNights || 1, units: isXtremeRental ? rentalHours : 1, perUnit: isXtremeRental, totalGuests: accommodationGuests, selectedDeparture: activeDeparture });
  const pickedPricingUnit = normalizePricingUnit(pickedServiceDetail.pricingUnit, isAccommodation ? "PER_NIGHT" : isToursTravel ? "PER_PAX" : "FLAT");
  const estimatedTotal = bookingCalculation.estimatedTotal;
  const dmonsterPricing = isDmonster ? calculateDmonsterPestPrice(pickedService, pestControlDetails) : null;
  const isQuoteOnlySelection = bookingCalculation.lineItems.length > 0 && bookingCalculation.lineItems.every((item) => isInquiryPricingType(item.pricingType));
  const primaryServiceLabel = selectedServiceNames.length > 1 ? `${selectedServiceNames.length} Services` : selectedServiceNames[0] || pickedService;
  const servicePriceLabel = (detail) => {
    return formatServicePriceLabel(detail, isAccommodation ? "PER_NIGHT" : isToursTravel ? "PER_PAX" : "FIXED");
  };
  const serviceMetaLabel = (detail) => [
    isConsultant && detail.serviceCategory ? detail.serviceCategory : "",
    isAccommodation && detail.maxGuests ? `Up to ${detail.maxGuests} guests` : detail.durationMinutes ? `${detail.durationMinutes} min` : "",
    detail.price !== null || detail.pricingTiers?.length ? servicePriceLabel(detail) : "",
  ].filter(Boolean).join(" • ");
  const publicServiceMetaLabel = (detail) => {
    const label = serviceMetaLabel(detail);
    if (isXtremeDancers) return label.replace(/\bPHP\s*/g, "₱");
    return isHealthWellness ? label.replace(/\bPHP\s*/g, "₱") : label;
  };
  const publicPriceLabel = (value) => {
    const label = formatPeso(value);
    const pesoLabel = isXtremeDancers || isHealthWellness ? label.replace(/\bPHP\s*/g, "₱") : label;
    return isXtremeDancers ? pesoLabel : pesoLabel;
  };
  const publicLineLabel = (value) => isXtremeDancers || isHealthWellness ? String(value || "").replace(/\bPHP\s*/g, "₱") : value;
  const requiredPaymentAmount = getRequiredPaymentAmount(paymentSettings, estimatedTotal);
  const manualPaymentEnabled = paymentCapability.manualPaymentsEnabled;
  const paymentAvailable = paymentCapability.canUseManualPayments;
  const paymentRequired = paymentAvailable && requiredPaymentAmount !== null;

  useEffect(() => {
    setPickedService(business.services[0]);
    setPickedServices([business.services[0]].filter(Boolean));
    setPickedSlot(usesPreferredSchedule ? timeInputToDisplay(getCurrentTimeInputValue()) : availableSlots[1] || availableSlots[0] || "10:15 AM");
    setSelectedBookingDate(getTodayDateValue());
    setSelectedCheckoutDate(() => {
      const next = new Date();
      next.setDate(next.getDate() + 1);
      return next.toISOString().slice(0, 10);
    });
    setGuestCount(2);
    setAdultCount(2);
    setChildCount(0);
    setInfantCount(0);
    setTravelDetails({ tripType: "ROUND_TRIP", origin: "", destination: "", returnDate: "", applicants: 1, pickupLocation: "", requestedInclusions: "", preferredHotelCategory: "No Preference", roomType: "", customerEmail: "", customerAddress: "" });
    setConfirmed(null);
    setConfirmedPayment(null);
    setBookingError("");
    setPaymentOpen(false);
    setPaymentStatus("");
    setPaymentChoice("PAY_LATER");
    setPaymentForm({ method: "", amount: "", reference: "", note: "" });
    setPaymentProofFile(null);
    setPaymentProofPreview("");
    setTravelActiveStep(1);
    setBeautyActiveStep(1);
    setRealEstateActiveStep(1);
    setRealEstateDetails({ location: "", budgetRange: "", purpose: "Personal Use", requirements: "" });
    setPestControlActiveStep(1);
    setPestControlDetails({ propertyType: "House", serviceArea: "Metro Manila / NCR", serviceLocation: "", areaSize: "", floors: "1" });
    setPartyEventDetails({ eventType: "Birthday", eventLocation: "", guestCount: "", specialRequests: "" });
    setSelectedDeparture(null);
    setDeparturePanelService(null);
  }, [business.slug, usesPreferredSchedule]);

  useEffect(() => {
    if (!usesPreferredSchedule || !isPastPreferredSchedule(selectedBookingDate, pickedSlot)) return;
    setPickedSlot(timeInputToDisplay(getCurrentTimeInputValue()));
  }, [usesPreferredSchedule, selectedBookingDate, pickedSlot]);

  const openServiceLink = (detail) => {
    const href = normalizeServiceLink(detail?.imageUrl);
    if (!href) return;
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const toggleService = (serviceName) => {
    if (!allowMultipleServices) {
      setPickedService(serviceName);
      setPickedServices([serviceName]);
      if (isDmonster) {
        setPestControlDetails((current) => ({
          ...current,
          propertyType: dmonsterPropertyTypes.includes(current.propertyType) ? current.propertyType : "House",
          serviceArea: dmonsterServiceAreas.includes(current.serviceArea) ? current.serviceArea : "Metro Manila / NCR",
        }));
      }
      setSelectedDeparture(null);
      setDeparturePanelService(null);
      return;
    }
    setPickedService(serviceName);
    setSelectedDeparture(null);
    setDeparturePanelService(null);
    setPickedServices((current) => {
      if (current.includes(serviceName)) {
        const next = current.filter((item) => item !== serviceName);
        return next.length ? next : [serviceName];
      }
      return [...current, serviceName];
    });
  };

  const selectTravelDeparture = (serviceName, detail, departure) => {
    setPickedService(serviceName);
    setPickedServices((current) => current.includes(serviceName) ? current : [...current, serviceName]);
    setSelectedDeparture({ ...departure, serviceId: detail.id, serviceName });
    setSelectedBookingDate(departure.startDate);
    setSelectedCheckoutDate(departure.endDate || "");
    setDeparturePanelService(detail.id);
    setTravelActiveStep(2);
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
    if (isToursTravel && selectedCheckoutDate && selectedBookingDate && selectedCheckoutDate < selectedBookingDate) {
      setBookingError("Return / End of Desired Tour cannot be earlier than the Start Date.");
      setSubmitting(false);
      return;
    }
    const submittedCalculation = calculateBookingTotal(selectedServiceDetails, {
      pax: isAccommodation ? currentTotalGuests : currentGuestCount,
      totalGuests: currentTotalGuests,
      nights: currentNights || 1,
      units: isXtremeRental ? rentalHours : 1,
      perUnit: isXtremeRental,
      selectedDeparture: activeDeparture,
      allowQuoteWithoutPrice: isPartyXpress || isToursTravel || isRealEstate || isPestControl,
    });
    const canSubmitQuoteInquiry = (isPartyXpress || isToursTravel || isProBeauty || isRealEstate || isPestControl) && !activeDeparture && selectedServiceDetails.length > 0 && selectedServiceDetails.every((detail) => {
      const price = detail.price;
      return price === "" || price === null || price === undefined || String(price).trim() === "" || !Number.isFinite(Number(price)) || Number(price) <= 0;
    });
    const pickupLocation = String(data.get("address") || "").trim();
    const customerEmail = String(data.get("email") || "").trim();
    const customerAddress = String(data.get("customerAddress") || "").trim();
    if ((!isXtremeDancers || customerEmail) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      setBookingError("Please enter a valid email address.");
      setSubmitting(false);
      return;
    }
    if (!isXtremeDancers && customerAddress.length < 5) {
      setBookingError("Please enter your complete address.");
      setSubmitting(false);
      return;
    }
    if (usesPreferredSchedule && isPastPreferredSchedule(selectedBookingDate, pickedSlot)) {
      setBookingError("Please choose a future preferred date and time.");
      setSubmitting(false);
      return;
    }
    if (isRealEstate && (!String(data.get("preferredLocation") || "").trim() || !String(data.get("budgetRange") || "").trim() || !String(data.get("propertyPurpose") || "").trim())) {
      setBookingError("Please complete your property preferences before submitting.");
      setSubmitting(false);
      return;
    }
    const pestAreaSize = Number(data.get("areaSize") || 0);
    const pestFloors = Number(data.get("numberOfFloors") || pestControlDetails.floors || 0);
    const pestPropertyType = String(data.get("propertyType") || pestControlDetails.propertyType || "").trim();
    const pestServiceArea = String(data.get("serviceArea") || pestControlDetails.serviceArea || "").trim();
    const submittedDmonsterPricing = isDmonster ? calculateDmonsterPestPrice(primaryServiceLabel, { ...pestControlDetails, areaSize: pestAreaSize, floors: pestFloors, propertyType: pestPropertyType, serviceArea: pestServiceArea }) : null;
    if (isDmonster && (!Number.isFinite(pestAreaSize) || pestAreaSize <= 0)) {
      setBookingError("Please enter a valid area size in sqm.");
      setSubmitting(false);
      return;
    }
    if (isDmonster && (!pestPropertyType || !pestServiceArea)) {
      setBookingError("Please select the property type and service area.");
      setSubmitting(false);
      return;
    }
    if (isDmonster && primaryServiceLabel === "Termite Treatment" && (!Number.isFinite(pestFloors) || pestFloors <= 0)) {
      setBookingError("Please complete the termite treatment property type and number of floors.");
      setSubmitting(false);
      return;
    }
    if (isPartyXpress && String(data.get("eventLocation") || "").trim().length < 5) {
      setBookingError("Please enter the event location or venue.");
      setSubmitting(false);
      return;
    }
    if (isPestControl && ((!isDmonster && !String(data.get("propertyType") || "").trim()) || String(data.get("serviceLocation") || "").trim().length < 5)) {
      setBookingError("Please select the property type and enter the complete service location.");
      setSubmitting(false);
      return;
    }
    const booking = {
      customer: data.get("customer"),
      contact: data.get("contact"),
      business: business.business,
      businessSlug: business.slug,
      business_slug: business.slug,
      service: primaryServiceLabel,
      booking_date: flags.requireDate ? selectedBookingDate : "",
      slot: isAccommodation ? `${formatBookingDate(selectedBookingDate)} to ${formatBookingDate(selectedCheckoutDate)}` : flags.requireTime ? effectivePickedSlot : "Inquiry only",
      note: data.get("note"),
      status: canPersistPublicBooking ? (isPartyXpress || isToursTravel || isHealthWellness || isRealEstate || isPestControl || isDemoActive ? "PENDING" : "Confirmed") : `${clientStatus} preview`,
      estimated_total: isDmonster ? submittedDmonsterPricing.total : submittedCalculation.estimatedTotal,
      metadata: {
        booking_template: business.bookingTemplate,
        source: "online",
        request_type: isPartyXpress ? "booking_request" : undefined,
        booking_status: isPartyXpress ? "Pending Review" : undefined,
        demo_booking: isDemoActive || undefined,
        test_booking: isDemoActive || undefined,
        guest_count: currentTotalGuests,
        adult_count: isAccommodation ? currentAdults : undefined,
        child_count: isAccommodation ? currentChildren : undefined,
        check_in: isAccommodation ? selectedBookingDate : undefined,
        check_out: isAccommodation ? selectedCheckoutDate : undefined,
        number_of_nights: isAccommodation ? currentNights : undefined,
        pricing_unit: pickedPricingUnit,
        pricing_type: pickedPricing.pricingType,
        rental_hours: isXtremeRental ? rentalHours : undefined,
        rental_type: isXtremeRental ? (pickedServiceDetail.name.includes("AIRCON") ? "WITH AIRCON" : "NON-AIRCON") : undefined,
        unit_price: pickedPricing.unitPrice,
        selected_tier: pickedPricing.selectedTier,
        selected_departure: activeDeparture,
        estimated_total: isDmonster ? submittedDmonsterPricing.total : submittedCalculation.estimatedTotal,
        line_items: submittedCalculation.lineItems,
        allow_multiple_services: allowMultipleServices,
        pickup_location: pickupLocation,
        customer_email: customerEmail,
        traveler_email: isToursTravel ? customerEmail : undefined,
        travel_service_kind: isToursTravel ? travelServiceKind : undefined,
        trip_type: isToursTravel && travelServiceKind === "AIRLINE" ? travelDetails.tripType : undefined,
        origin: isToursTravel && travelServiceKind === "AIRLINE" ? String(data.get("origin") || "").trim() : undefined,
        destination: isToursTravel ? String(data.get("destination") || "").trim() : undefined,
        return_date: isToursTravel ? String(data.get("returnDate") || "").trim() : undefined,
        travel_start_date: isToursTravel ? selectedBookingDate : undefined,
        travel_end_date: isToursTravel ? selectedCheckoutDate : undefined,
        child_count: isToursTravel && travelServiceKind === "AIRLINE" ? childCount : undefined,
        infant_count: isToursTravel && travelServiceKind === "AIRLINE" ? infantCount : undefined,
        applicant_count: isToursTravel && travelServiceKind === "VISA" ? Math.max(1, Number(data.get("applicantCount") || 1)) : undefined,
        requested_inclusions: isToursTravel ? String(data.get("requestedInclusions") || "").trim() : undefined,
        preferred_hotel_category: isToursTravel ? String(data.get("preferredHotelCategory") || "No Preference").trim() : undefined,
        room_type: isToursTravel ? String(data.get("roomType") || "").trim() : undefined,
        customer_address: customerAddress,
        event_date: isPartyXpress ? selectedBookingDate : undefined,
        preferred_event_time: isPartyXpress ? effectivePickedSlot : undefined,
        event_type: isPartyXpress ? String(data.get("eventType") || partyEventDetails.eventType || "").trim() : undefined,
        event_location: isPartyXpress ? String(data.get("eventLocation") || "").trim() : undefined,
        estimated_guest_count: isPartyXpress && data.get("estimatedGuestCount") ? Number(data.get("estimatedGuestCount")) : undefined,
        special_requests: isPartyXpress ? String(data.get("note") || "").trim() : undefined,
        preferred_location: isRealEstate ? String(data.get("preferredLocation") || "").trim() : undefined,
        budget_range: isRealEstate ? String(data.get("budgetRange") || "").trim() : undefined,
        property_purpose: isRealEstate ? String(data.get("propertyPurpose") || "").trim() : undefined,
        additional_requirements: isRealEstate ? String(data.get("note") || "").trim() : undefined,
        property_type: isPestControl ? (isDmonster ? pestPropertyType : String(data.get("propertyType") || "").trim()) : (isRealEstate ? primaryServiceLabel : undefined),
        service_location: isPestControl ? String(data.get("serviceLocation") || "").trim() : undefined,
        service_area: isDmonster ? pestServiceArea : undefined,
        pest_concern: isPestControl ? primaryServiceLabel : undefined,
        pest_area_sqm: isDmonster ? pestAreaSize : undefined,
        area_sqm: isDmonster ? pestAreaSize : undefined,
        floor_count: isDmonster && primaryServiceLabel === "Termite Treatment" ? pestFloors : undefined,
        pest_number_of_floors: isDmonster && primaryServiceLabel === "Termite Treatment" ? pestFloors : undefined,
        calculated_price: isDmonster ? submittedDmonsterPricing.total : undefined,
        pricing_status: isDmonster ? submittedDmonsterPricing.status : undefined,
        pest_pricing_status: isDmonster ? submittedDmonsterPricing.status : undefined,
        pest_estimated_price: isDmonster ? submittedDmonsterPricing.total : undefined,
        pest_pricing_formula: isDmonster ? submittedDmonsterPricing.formula : undefined,
        pest_pricing_note: isDmonster ? submittedDmonsterPricing.note : undefined,
      },
      bookingItems: submittedCalculation.lineItems,
    };
    const missingBookingFields = [];
    if (!booking.customer) missingBookingFields.push({ label: "Full Name", selector: '[name="customer"]' });
    if (!booking.contact) missingBookingFields.push({ label: "Mobile Number", selector: '[name="contact"]' });
    if (!booking.business_slug) missingBookingFields.push({ label: "Business", selector: null });
    if (!selectedServiceNames.length) missingBookingFields.push({ label: "Travel Service", selector: null });
    if (!booking.slot) missingBookingFields.push({ label: "Preferred Time", selector: '[name="preferredTime"]' });
    if (flags.requireDate && !booking.booking_date) missingBookingFields.push({ label: "Travel Date", selector: '[name="preferredDate"]' });
    if (hasSavedDepartures && !hasSelectedDeparture) missingBookingFields.push({ label: "Available Departure", selector: null });
    if (needsGuestCount && currentTotalGuests < 1) missingBookingFields.push({ label: "Number of Travelers", selector: '[name="guestCount"]' });
    if (missingBookingFields.length) {
      const firstMissing = missingBookingFields[0];
      setBookingError(`Please complete: ${firstMissing.label}.`);
      if (firstMissing.selector) document.querySelector(firstMissing.selector)?.focus();
      setSubmitting(false);
      return;
    }
    if (!bookingCalculation.totalAvailable && !canSubmitQuoteInquiry) {
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
      if (!submittedCalculation.totalAvailable && !canSubmitQuoteInquiry) {
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
      const savedBooking = canPersistPublicBooking ? await onSaveBooking(booking) : { ...booking, id: `DEMO-${Date.now().toString().slice(-5)}` };
      setConfirmed(savedBooking);
      setBookingPossessionToken(savedBooking.public_possession_token || "");
      setPaymentChoice("");
      setPaymentOpen(false);
      setPaymentStatus("");
      setConfirmedPayment(null);
      bookingForm.reset();
      setGuestCount(2);
    } catch (error) {
      console.error("Booking submission failed", error);
      setBookingError(error.message || "Booking could not be saved. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitPaymentDetails = async (event) => {
    event.preventDefault();
    if (!confirmed?.id) return;
    const data = new FormData(event.currentTarget);
    const amountSubmitted = Number(data.get("amountSubmitted"));
    if (!Number.isFinite(amountSubmitted) || amountSubmitted <= 0) {
      setPaymentStatus("Enter a valid payment amount greater than zero.");
      return;
    }
    const proofFile = paymentProofFile;
    const allowedProofTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (proofFile && (!allowedProofTypes.has(proofFile.type) || proofFile.size > 5 * 1024 * 1024)) {
      setPaymentStatus("Payment proof must be JPG, PNG, or WEBP and 5 MB or less.");
      return;
    }
    if (paymentSettings.require_proof && !proofFile) {
      setPaymentStatus("Please upload your payment proof before submitting.");
      return;
    }
    setPaymentStatus("");
    let proofStoragePath = "";
    try {
      if (proofFile) {
        proofStoragePath = await supabasePaymentProofUpload({ bookingId: confirmed.id, businessSlug: business.slug, possessionToken: bookingPossessionToken, file: proofFile });
      }
      const paymentResult = await onSubmitPayment({
        booking_id_value: confirmed.id,
        business_slug_value: business.slug,
        payment_method_value: data.get("paymentMethod"),
        amount_submitted_value: amountSubmitted,
        reference_number_value: data.get("referenceNumber"),
        customer_note_value: data.get("paymentNote") || "",
        proof_storage_path_value: proofStoragePath || null,
        booking_possession_token_value: bookingPossessionToken,
      });
      setConfirmedPayment({
        payment_status: paymentResult?.payment_status || "PENDING_VERIFICATION",
        payment_method: data.get("paymentMethod"),
        amount_submitted: amountSubmitted,
        reference_number: data.get("referenceNumber"),
        submitted_at: new Date().toISOString(),
        proof_storage_path: proofStoragePath || null,
        proof_submitted: Boolean(proofStoragePath),
        payment_option: "PAY_NOW",
      });
      setPaymentStatus("Payment details submitted. Payment is pending business verification.");
      setPaymentOpen(false);
    setPaymentProofFile(null);
    setPaymentProofPreview("");
    setBookingPossessionToken("");
    } catch (error) {
      if (proofStoragePath) await supabasePrivateStorageDelete(proofStoragePath).catch(() => {});
      console.error("Payment detail submission failed", error);
      setPaymentStatus("Payment details could not be submitted. Please contact the business.");
    }
  };

  const handleCustomerBookingPdf = async () => {
    if (!capabilities.downloadBookingPdf || !confirmed?.id) return;
    setCustomerPdfMessage("Preparing your PDF...");
    try {
      const items = confirmed.bookingItems || confirmed.booking_items || confirmed.metadata?.line_items || [];
      await downloadBookingPdf({
        business,
        booking: confirmed,
        template: confirmed.metadata?.booking_template || business.bookingTemplate || "GENERAL",
        bookingItems: items,
        total: confirmed.metadata?.estimated_total ?? confirmed.estimated_total ?? null,
        pricingStatus: confirmed.metadata?.pricing_status || "",
        statusLabel: confirmed.status || confirmed.metadata?.booking_status || "Pending",
        documentType: "booking",
        context: "customer",
        payment: confirmedPayment || { payment_status: "NOT_SUBMITTED", payment_option: paymentChoice === "PAY_LATER" ? "PAY_LATER" : "" },
      });
      setCustomerPdfMessage("Your booking PDF is ready.");
    } catch (error) {
      console.error("Customer booking PDF failed", error);
      setCustomerPdfMessage("The PDF could not be downloaded. Please try again.");
    }
  };

  return (
    <main
      className={`bookingPage premiumBookingPage ${bookingTone} package-${currentPackage.toLowerCase()}${isXtremeDancers ? " xtreme-dancers" : ""}`}
      style={{
        "--booking-primary": business.primaryColor,
        "--booking-accent": business.accentColor,
        ...getBusinessPageBackgroundStyle(business, bookingTone),
      }}
    >
      {isHealthWellness && (
        <header className={isProHealthWellness ? "wellnessPublicNav pro" : hasExpandedWellnessPage ? "wellnessPublicNav business" : "wellnessPublicNav simple"}>
          <a href="#wellness-home" className="wellnessNavBrand">
            <span>{business.logo ? <img src={business.logo} alt={`${business.business} logo`} /> : brandInitials}</span>
            <strong>{business.business}</strong>
          </a>
          {hasExpandedWellnessPage && (
            <nav aria-label="Health and wellness page navigation">
              <a href="#wellness-contact">Contact</a>
            </nav>
          )}
          <a className="wellnessNavCta" href="#wellness-options">Get Started</a>
        </header>
      )}
      {isProBeauty && (
        <header className="proBeautyPublicNav">
          <a href="#beauty-home" className="proBeautyNavBrand">
            <img src={business.logo} alt={`${business.business} logo`} />
            <strong>{business.business}</strong>
          </a>
          <nav aria-label="Aesthetic beauty page navigation">
            <a href="#beauty-contact">Contact</a>
          </nav>
          <a className="proBeautyNavCta" href="#beauty-services">Book Now</a>
        </header>
      )}
      {isBusinessBeauty && (
        <header className="businessBeautyPublicNav">
          <a href="#beauty-home" className="proBeautyNavBrand">
            {business.logo ? <img src={business.logo} alt={`${business.business} logo`} /> : <span>{brandInitials}</span>}
            <strong>{business.business}</strong>
          </a>
          <a className="proBeautyNavCta" href="#beauty-services">Book Appointment</a>
        </header>
      )}
      <button className="backButton premiumBackButton" onClick={onBack}><ArrowLeft size={18} /> Back to Slotwise</button>
      <section className="publicBooking premiumPublicBooking" id={isHealthWellness ? "wellness-home" : isOpticalClinic ? "optical-home" : isBeauty ? "beauty-home" : isRealEstate ? "property-home" : isPestControl ? "pest-home" : undefined}>
        <aside className="premiumBrandPanel" style={getBusinessCoverStyle(business, bookingTone)}>
          {isOpticalClinic && <img className="opticalHeroBackground" src={business.cover || nyOpticalCover} alt="" aria-hidden="true" />}
          <div className={isPestControl ? "brandLogoLockup pestLogoLockup" : "brandLogoLockup"}>
            <div className="brandMark">
              {business.logo ? <img src={business.logo} alt={`${business.business} logo`} /> : <span>{isXtremeDancers ? "XD" : isHealthWellness || isRealEstate || isPestControl ? brandInitials : brandInitial}</span>}
            </div>
          </div>
          <div className="brandStory">
            <span>{isHealthWellness ? (business.featureFlags?.wellnessHeroEyebrow || "EVERYDAY WELLNESS") : isOpticalClinic ? (business.featureFlags?.opticalHeroEyebrow || "OPTICAL CLINIC") : brandCategory}</span>
            {isHealthWellness && <strong className="wellnessHeroBusinessName">{business.business}</strong>}
            {isOpticalClinic && <strong className="opticalBusinessName">{business.business}</strong>}
            {isXtremeDancers && <strong className="xtremeBusinessName">{business.business}</strong>}
            {isRealEstate && <strong className="realEstateBusinessName">{business.business}</strong>}
            {isPestControl && <strong className="pestControlBusinessName">{business.business}</strong>}
            <h1>{isXtremeDancers ? "MOVE. LEARN. PERFORM." : isHealthWellness ? (business.featureFlags?.wellnessHeroTitle || "Find Your Everyday Balance") : isOpticalClinic ? "Clearer Vision. Better Everyday Living." : isRealEstate ? "Find a Property That Fits Your Next Move." : isPestControl ? "Protect Your Space. We'll Handle the Pests." : business.business}</h1>
            <i />
            <p>{isXtremeDancers ? "Book your dance session online." : brandLine[0]}{brandLine[1] && !isXtremeDancers && <><br />{brandLine[1]}</>}</p>
            {isXtremeDancers && <>
              <div className="xtremeDays"><Clock size={15} /> MONDAY – SUNDAY <span>CLASSES &amp; STUDIO BOOKINGS</span></div>
              <a className="xtremeHeroCta" href="#xtreme-booking">BOOK A CLASS <ChevronRight size={18} /></a>
            </>}
            {isOpticalClinic && (
              <div className="opticalHeroActions">
                <a href="#optical-packages">View Packages</a>
                <a href={business.messengerLink ? normalizeServiceLink(business.messengerLink) : business.primaryEmail ? `mailto:${business.primaryEmail}` : normalizePhoneLink(business.phone)} target={business.messengerLink ? "_blank" : undefined} rel={business.messengerLink ? "noopener noreferrer" : undefined}>Contact Clinic</a>
              </div>
            )}
            {isHealthWellness && (
              <div className="wellnessHeroActions">
                <a href="#wellness-options">Explore Options</a>
                <a href={hasExpandedWellnessPage ? "#wellness-contact" : business.primaryEmail ? `mailto:${business.primaryEmail}` : normalizePhoneLink(business.phone)}>Contact Us</a>
              </div>
            )}
            {isRealEstate && <a className="realEstateHeroCta" href="#property-inquiry">Send Property Inquiry <ChevronRight size={18} /></a>}
            {isPestControl && <div className="pestHeroActions"><a className="pestControlHeroCta" href="#pest-service-request">Request Service <ChevronRight size={18} /></a><span className="pestOpenBadge"><Clock size={14} /> {business.availability?.hours || business.availability?.days}</span></div>}
          </div>
          {hasExpandedWellnessPage ? (
            <div className={isProHealthWellness ? "wellnessBusinessCard pro" : "wellnessBusinessCard"} id="wellness-contact">
              <strong>Business Information</strong>
              <div><Clock size={17} /><span><small>Business Hours</small><b>{business.availability?.days}<br />{business.availability?.hours}</b></span></div>
              {business.phone && <a href={normalizePhoneLink(business.phone)}><Phone size={17} /><span><small>Phone</small><b>{business.phone}</b></span></a>}
              {business.primaryEmail && <a href={`mailto:${business.primaryEmail}`}><Mail size={17} /><span><small>Email</small><b>{business.primaryEmail}</b></span></a>}
              {business.messengerLink && <a href={normalizeServiceLink(business.messengerLink)} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /><span><small>Messenger</small><b>Send a message</b></span></a>}
            </div>
          ) : hasEnhancedBeautyPage ? (
            <div className={isProBeauty ? "proBeautyContactCard" : "proBeautyContactCard business"} id="beauty-contact">
              <strong>Business Information</strong>
              <div><Clock size={17} /><span><small>Business Hours</small><b>{business.availability?.days}<br />{business.availability?.hours}</b></span></div>
              {business.phone && <a href={normalizePhoneLink(business.phone)}><Phone size={17} /><span><small>Phone</small><b>{business.phone}</b></span></a>}
              {business.primaryEmail && <a href={`mailto:${business.primaryEmail}`}><Mail size={17} /><span><small>Email</small><b>{business.primaryEmail}</b></span></a>}
              {business.messengerLink && <a href={normalizeServiceLink(business.messengerLink)} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} /><span><small>Messenger</small><b>Message the clinic</b></span></a>}
            </div>
          ) : (!isHealthWellness || !hasExpandedWellnessPage) && (
          <div className="bookingTrustCard">
              <div><CalendarDays size={22} /><span><strong>{templateCopy.trust[0][0]}</strong><small>{templateCopy.trust[0][1]}</small></span></div>
              <div><Check size={22} /><span><strong>{templateCopy.trust[1][0]}</strong><small>{templateCopy.trust[1][1]}</small></span></div>
              <div><Sparkles size={22} /><span><strong>{templateCopy.trust[2][0]}</strong><small>{templateCopy.trust[2][1]}</small></span></div>
            </div>
          )}
          {isXtremeDancers && (
            <div className="xtremeSocialCta">
              <span className="xtremeSocialEyebrow">STAY CONNECTED</span>
              <strong>FOLLOW THE MOVEMENT</strong>
              <p>See our latest classes, performances &amp; studio updates.</p>
              <a href={xtremeFacebookUrl} target="_blank" rel="noopener noreferrer">
                Follow Xtreme on Facebook <ExternalLink size={15} />
              </a>
              <small>DANCE • COMMUNITY • GROWTH</small>
            </div>
          )}
          {isToursTravel && <TravelBusinessInfo business={business} />}
        </aside>

        <form className="publicForm premiumPublicForm" id={isRealEstate ? "property-inquiry" : isPestControl ? "pest-service-request" : undefined} onSubmit={submitBooking}>
          {(isDemoPreview || isAwaitingActivation) && (
            <div className={isDemoPreview ? "clientStatusNotice demo" : "clientStatusNotice unpaid"}>
              <strong>{isDemoPreview ? "Demo preview" : "Awaiting activation"}</strong>
              <span>
                {isDemoPreview
                  ? `Test the booking flow. Submissions on this preview are saved as test bookings in the demo dashboard, not live customer bookings.${demoExpiryState.dateLabel ? ` Available until: ${demoExpiryState.dateLabel}.` : " Demo expiry not set."}`
                  : "System setup is complete and awaiting activation. Submissions are preview only until the client is activated."}
              </span>
            </div>
          )}
          <div className="bookingFormHeader">
            <div>
              {isXtremeDancers && <span className="xtremeFormEyebrow">XTREME DANCERS STUDIO</span>}
              {isProBeauty && <span className="proBeautyFormEyebrow">Private aesthetic appointment</span>}
              <h2>{headingText}</h2>
              <p>{headerSubtext}</p>
              {isToursTravel && travelSeasonalNotice && (
                <aside className="travelSeasonalNotice" aria-label={travelSeasonalNoticeTitle}>
                  <Info size={17} aria-hidden="true" />
                  <span>
                    <strong>{travelSeasonalNoticeTitle}</strong>
                    <small>{travelSeasonalNotice}</small>
                  </span>
                </aside>
              )}
              {!isToursTravel && (business.phone || business.mobileNumbers || business.primaryEmail || business.website || business.address) && (
                <div className="bookingContactLine">
                  {business.phone && <span><Phone size={13} /><strong>Phone</strong>{business.phone}</span>}
                  {isProBeauty && business.availability?.openDays && <span><Clock size={13} /><strong>Open</strong>{business.availability.openDays}</span>}
                  {business.mobileNumbers && <span><Smartphone size={13} /><strong>Mobile</strong>{business.mobileNumbers}</span>}
                  {business.primaryEmail && <span><Mail size={13} /><strong>Email</strong>{business.primaryEmail}</span>}
                  {business.website && <a href={normalizeServiceLink(business.website)} target="_blank" rel="noopener noreferrer"><Globe size={13} /><strong>Visit Website</strong></a>}
                  {business.messengerLink && <a href={normalizeServiceLink(business.messengerLink)} target="_blank" rel="noopener noreferrer"><MessageCircle size={13} /><strong>Messenger</strong></a>}
                  {business.address && <span><MapPinned size={13} /><strong>Address</strong>{business.address}</span>}
                </div>
              )}
            </div>
            <div className="bookingHeaderMarks">
              {isToursTravel && isPhisavong && (
                <div className="dotAccreditation" aria-label="DOT Accredited, DOT-R03-TTA-01952-2024">
                  <img src="/dot-accreditation.png" alt="Department of Tourism Quality Seal" />
                  <span><strong>DOT Accredited</strong><small>DOT-R03-TTA-01952-2024</small></span>
                </div>
              )}
              <span className="bookingHeaderIcon"><ServiceStepIcon size={22} /></span>
            </div>
          </div>

          {isToursTravel && (
            <nav className="travelBookingProgress" aria-label="Booking progress" style={{ "--travel-progress": `${travelActiveStep * 20}%` }}>
              <em className="travelProgressCount">Step {travelActiveStep} of 5</em>
              {["Travel Services", "Travel Details", "Preferred Schedule", "Your Information", "Review & Submit"].map((label, index) => (
                <React.Fragment key={label}>
                  <span className={index + 1 === travelActiveStep ? "active" : index + 1 < travelActiveStep ? "completed" : "upcoming"} aria-current={index + 1 === travelActiveStep ? "step" : undefined}>
                    <i>{index + 1 < travelActiveStep ? <Check size={15} /> : index + 1}</i><small>{label}</small>
                  </span>
                  {index < 4 && <b className={index + 1 < travelActiveStep ? "completed" : "upcoming"} aria-hidden="true" />}
                </React.Fragment>
              ))}
            </nav>
          )}

          {isRealEstate && (
            <nav className="realEstateProgress" aria-label="Property inquiry progress">
              {["Property", "Preferences", "Your Details", "Review"].map((label, index) => (
                <span key={label} className={index + 1 === realEstateActiveStep ? "active" : index + 1 < realEstateActiveStep ? "completed" : "upcoming"}>
                  <i>{index + 1 < realEstateActiveStep ? <Check size={13} /> : index + 1}</i><small>{label}</small>
                </span>
              ))}
            </nav>
          )}

          {isPestControl && (
            <nav className="pestControlProgress" aria-label="Pest control service request progress">
              {(isDmonster ? ["Service", "Details", "Schedule", "Location", "Your Details"] : ["Service", "Schedule", "Location", "Your Details"]).map((label, index) => (
                <span key={label} className={index + 1 === pestControlActiveStep ? "active" : index + 1 < pestControlActiveStep ? "completed" : "upcoming"}>
                  <i>{index + 1 < pestControlActiveStep ? <Check size={13} /> : index + 1}</i><small>{label}</small>
                </span>
              ))}
            </nav>
          )}

          {isProBeauty && (
            <nav className="proBeautyBookingProgress" aria-label="Booking progress" style={{ "--beauty-progress": `${beautyActiveStep * 25}%` }}>
              <em>Step {beautyActiveStep} of 4</em>
              {["Treatment", "Schedule", "Your Information", "Review & Submit"].map((label, index) => (
                <React.Fragment key={label}>
                  <span className={index + 1 === beautyActiveStep ? "active" : index + 1 < beautyActiveStep ? "completed" : "upcoming"}>
                    <i>{index + 1 < beautyActiveStep ? <Check size={14} /> : index + 1}</i><small>{label}</small>
                  </span>
                  {index < 3 && <b className={index + 1 < beautyActiveStep ? "completed" : "upcoming"} />}
                </React.Fragment>
              ))}
            </nav>
          )}

          {flags.bookingEnabled && (
          <div className="bookingStep" id={isXtremeDancers ? "xtreme-booking" : isHealthWellness ? "wellness-options" : isOpticalClinic ? "optical-packages" : isBeauty ? "beauty-services" : undefined} onFocusCapture={() => { if (isToursTravel) setTravelActiveStep(1); if (isProBeauty) setBeautyActiveStep(1); if (isRealEstate) setRealEstateActiveStep(1); if (isPestControl) setPestControlActiveStep(1); }}>
            <div className="bookingStepTitle"><span>1</span><strong><ServiceStepIcon size={16} />{serviceStepLabel}</strong></div>
            {business.status === "DEMO" && business.featureFlags?.sampleServiceNotice && <p className="sampleServiceNotice">{business.featureFlags.sampleServiceNotice}</p>}
            <div className={isConsultant ? "premiumServiceGrid consultantServiceGrid" : isRealEstate ? "premiumServiceGrid realEstatePropertyGrid" : isPestControl ? "premiumServiceGrid pestControlServiceGrid" : isOpticalClinic ? "premiumServiceGrid opticalPackageGrid" : "premiumServiceGrid"}>
              {displayServices.map((item) => {
                const detail = isXtremeDancers ? getXtremeCardDetail(item) : getServiceDetail(item);
                const ServiceIcon = isXtremeDancers
                  ? item === "XTREME STEPPER" ? Zap : item === "WEEKEND DANCE CLASS" ? Users : item === "PRIVATE CLASS" ? User : Building2
                  : resolveServiceIcon(item, business);
                const ConsultantIcon = resolveConsultantServiceIcon(detail, business);
                const isSelected = isXtremeDancers ? xtremePrimary === item : selectedServiceNames.includes(item);
                const serviceLink = normalizeServiceLink(detail.imageUrl);
                const mediaUrl = isConsultant || isToursTravel || !isDirectImageLink(detail.imageUrl) ? "" : normalizeServiceLink(detail.imageUrl);
                const departures = isToursTravel ? getUpcomingDepartures(detail.departureDates) : [];
                const consultantInquiryPrice = isConsultant && (detail.price === null || detail.price === "" || Number(detail.price) <= 0);
                const planLabel = consultantInquiryPrice
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
                      <div className="consultantPlanActions">
                        {serviceLink && (
                          <a className="planActionButton" href={serviceLink} target="_blank" rel="noopener noreferrer" onClick={(event) => event.stopPropagation()}>
                            Open Plan / Service Link
                          </a>
                        )}
                      </div>
                    </article>
                  ) : isToursTravel ? (
                    <article key={detail.id || item} className={isSelected ? "premiumService active travelServiceCard" : "premiumService travelServiceCard"}>
                      <button type="button" className="travelServiceSelect" onClick={() => toggleService(item)} aria-pressed={isSelected}>
                        <span className="serviceIcon">{mediaUrl ? <img src={mediaUrl} alt="" /> : <ServiceIcon size={22} />}</span>
                        <span className="travelServiceCopy">
                          {getTravelPriceLabel(detail) !== "Contact for Rate" && <small className="travelPackageLabel">Package</small>}
                          <strong>{detail.imageTitle || item}</strong>
                          {detail.description && <p className="serviceDescription">{detail.description}</p>}
                        </span>
                        <span className="travelCardState">{isSelected ? <Check size={15} /> : <ChevronRight size={17} />}</span>
                      </button>
                      <div className="travelCardMeta">
                        <strong>{getTravelPriceLabel(detail)}</strong>
                        {serviceLink && <a className="travelDetailsLink" href={serviceLink} target="_blank" rel="noopener noreferrer">View Details <ExternalLink size={13} /></a>}
                      </div>
                      {departures.length > 0 && (
                        <>
                          <button type="button" className="travelDepartureToggle" onClick={() => setDeparturePanelService((current) => current === detail.id ? null : detail.id)}>
                            View Dates &amp; Rates <span>{departures.length} available</span> <ChevronRight size={14} />
                          </button>
                          {departurePanelService === detail.id && (
                            <div className="travelDeparturePanel">
                              <strong>Available Departures</strong>
                              {departures.map((departure) => (
                                <div className="travelDepartureRow" key={departure.id}>
                                  <span><b>{departureDateLabel(departure)}</b><small>{formatPeso(departure.price)} / {departure.pricingUnit === "PER_PAX" ? "pax" : departure.pricingUnit.replace("PER_", "").toLowerCase()}</small></span>
                                  {departure.status === "AVAILABLE" ? <button type="button" className={activeDeparture?.id === departure.id ? "selected" : ""} onClick={() => selectTravelDeparture(item, detail, departure)}>{activeDeparture?.id === departure.id ? "Selected ✓" : "Select"}</button> : <em>{departure.status === "SOLD_OUT" ? "Sold out" : "Unavailable"}</em>}
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </article>
                  ) : (
                    <button type="button" key={detail.id || item} className={isSelected ? "premiumService active" : "premiumService"} onClick={() => {
                      if (isXtremeDancers) {
                        setXtremePrimary(item);
                        const first = xtremeGroups[item]?.[0];
                        if (item === "WEEKEND DANCE CLASS") {
                          const nextSaturday = new Date(`${selectedBookingDate}T00:00:00`);
                          nextSaturday.setDate(nextSaturday.getDate() + ((6 - nextSaturday.getDay() + 7) % 7));
                          setSelectedBookingDate(nextSaturday.toISOString().slice(0, 10));
                        }
                        if (first) {
                          setPickedService(first.name);
                          setPickedServices([first.name]);
                          setPickedSlot(getServiceScheduleSlots(first, selectedBookingDate, fallbackAvailableSlots)[0] || fallbackAvailableSlots[0]);
                        }
                      } else toggleService(item);
                    }} aria-pressed={isSelected}>
                      <span className={isConsultant ? "serviceIcon consultantPlanIcon" : "serviceIcon"}>{mediaUrl ? <img src={mediaUrl} alt="" /> : <ServiceIcon size={22} />}</span>
                      <strong>{detail.imageTitle || item}</strong>
                      {detail.imageCaption && <p className="serviceImageCaption">{detail.imageCaption}</p>}
                      {detail.description && <p className="serviceDescription">{detail.description}</p>}
                      {isDmonster && getDmonsterServiceContent(item).cardPrice && <small>{getDmonsterServiceContent(item).cardPrice}</small>}
                      {!isDmonster && flags.showPrices && (publicServiceMetaLabel(detail) || isProBeauty && "Contact for Price") && <small>{publicServiceMetaLabel(detail) || "Contact for Price"}</small>}
                      {isSelected && <em><Check size={16} /></em>}
                    </button>
                  )
                );
              })}
            </div>
            {isXtremeDancers && (
              <div className="xtremeOptionPanel">
                <strong>{xtremePrimary === "WEEKEND DANCE CLASS" ? "CHOOSE CLASS" : xtremePrimary === "STUDIO RENTAL" ? "CHOOSE RENTAL TYPE" : xtremePrimary === "XTREME STEPPER" ? "CHOOSE BOOKING OPTION" : "SELECT YOUR DATE AND TIME"}</strong>
                <div className="xtremeOptionGrid">
                  {(xtremeGroups[xtremePrimary] || []).map((option) => {
                    const selected = option.name === pickedService;
                    const optionLabel = option.name
                      .replace(/^WEEKEND DANCE CLASS - /, "")
                      .replace(/^XTREME STEPPER - /, "")
                      .replace(/^STUDIO RENTAL - /, "")
                      .replace("WITH AIRCON", "With Aircon")
                      .replace("NON-AIRCON", "Non-Aircon");
                    return <button type="button" key={option.id || option.name} className={selected ? "xtremeOption active" : "xtremeOption"} onClick={() => {
                      setPickedService(option.name);
                      setPickedServices([option.name]);
                      const nextSlots = getServiceScheduleSlots(option, selectedBookingDate, fallbackAvailableSlots);
                      setPickedSlot(nextSlots[0] || "");
                    }}>
                      <span><b>{optionLabel}</b><small>{option.description}</small></span>
                      <em>{formatServicePriceLabel(option, option.pricingType)}{xtremePrimary === "STUDIO RENTAL" ? " / hour" : option.durationMinutes ? ` · ${option.durationMinutes} min` : ""}</em>
                    </button>;
                  })}
                </div>
                {xtremePrimary === "WEEKEND DANCE CLASS" && <small className="xtremeOptionHint">Choose a Saturday date below. The selected class already determines the time.</small>}
                {xtremePrimary === "XTREME STEPPER" && pickedService.includes("MONTHLY") && <small className="xtremeOptionHint">8 sessions, twice per week. The schedule will be coordinated after this initial booking request.</small>}
                {isXtremeRental && <label className="premiumInput xtremeRentalDuration"><Clock size={18} /><span>SELECT DURATION<select value={rentalHours} onChange={(event) => setRentalHours(Math.max(1, Number(event.target.value) || 1))}>{[1, 2, 3, 4, 5, 6].map((hours) => <option value={hours} key={hours}>{hours} hour{hours > 1 ? "s" : ""}</option>)}</select></span></label>}
              </div>
            )}
            {!business.services.length && (
              <div className="publicServiceEmptyState">
                <Sparkles size={20} />
                <span><strong>Services are being updated</strong><small>Please check back soon or contact the business for current treatments and rates.</small></span>
              </div>
            )}
            {allowMultipleServices && <p className="multiServiceCount">{selectedServiceNames.length} service{selectedServiceNames.length > 1 ? "s" : ""} selected</p>}
          </div>
          )}

          {isDmonster && (
            <div className="bookingStep pestServiceDetailsStep" onFocusCapture={() => setPestControlActiveStep(2)}>
              <div className="bookingStepTitle"><span>2</span><strong><Ruler size={16} />Property / Service Details</strong></div>
              <fieldset className="pestPropertyType">
                <legend>Property / Establishment Type</legend>
                {dmonsterPropertyTypes.map((propertyType) => <label key={propertyType}><input type="radio" name="propertyType" value={propertyType} checked={pestControlDetails.propertyType === propertyType} onChange={(event) => setPestControlDetails((current) => ({ ...current, propertyType: event.target.value }))} required /><span>{propertyType}</span></label>)}
              </fieldset>
              {pickedService === "Termite Treatment" && (
                <fieldset className="pestPropertyType pestFloorType">
                  <legend>Number of Floors</legend>
                  {dmonsterFloorOptions.map((floor) => <label key={floor.value}><input type="radio" name="numberOfFloors" value={floor.value} checked={pestControlDetails.floors === floor.value} onChange={(event) => setPestControlDetails((current) => ({ ...current, floors: event.target.value }))} required /><span>{floor.label}</span></label>)}
                </fieldset>
              )}
              <label className="premiumInput"><Ruler size={20} /><span>Area Size<input name="areaSize" type="number" min="1" step="1" value={pestControlDetails.areaSize} onChange={(event) => setPestControlDetails((current) => ({ ...current, areaSize: event.target.value }))} required placeholder="Area in sqm" /></span></label>
              <fieldset className="pestPropertyType pestServiceArea">
                <legend>Service Area</legend>
                {dmonsterServiceAreas.map((serviceArea) => <label key={serviceArea}><input type="radio" name="serviceArea" value={serviceArea} checked={pestControlDetails.serviceArea === serviceArea} onChange={(event) => setPestControlDetails((current) => ({ ...current, serviceArea: event.target.value }))} required /><span>{serviceArea}</span></label>)}
              </fieldset>
              <div className="pestPriceSummary">
                <span>{dmonsterPricing?.status === "calculated" ? "Estimated Service Price" : "Price"}</span>
                <strong>{dmonsterPricing?.status === "calculated" ? formatPeso(dmonsterPricing.total) : "For assessment"}</strong>
                {dmonsterPricing?.formula && <p>{pickedService} • {dmonsterPricing.formula}</p>}
                <small>{dmonsterPricing?.note || "Estimated price based on the information provided. Final service price is subject to business confirmation."}</small>
              </div>
            </div>
          )}

          {isRealEstate && (
            <div className="bookingStep realEstatePreferences" onFocusCapture={() => setRealEstateActiveStep(2)}>
              <div className="bookingStepTitle"><span>2</span><strong><MapPinned size={16} />Property Preferences</strong></div>
              <div className="realEstatePreferenceGrid">
                <label className="premiumInput"><MapPin size={20} /><span>Preferred Location<input name="preferredLocation" value={realEstateDetails.location} onChange={(event) => setRealEstateDetails((current) => ({ ...current, location: event.target.value }))} required placeholder="City, municipality, or preferred area" /></span></label>
                <label className="premiumInput"><BadgeDollarSign size={20} /><span>Budget Range<select name="budgetRange" value={realEstateDetails.budgetRange} onChange={(event) => setRealEstateDetails((current) => ({ ...current, budgetRange: event.target.value }))} required><option value="">Select budget range</option><option>Below PHP 2M</option><option>PHP 2M - 5M</option><option>PHP 5M - 10M</option><option>PHP 10M - 20M</option><option>Above PHP 20M</option><option>To be discussed</option></select></span></label>
              </div>
              <fieldset className="realEstatePurpose">
                <legend>Purpose</legend>
                {["Personal Use", "Investment", "Business", "Others"].map((purpose) => <label key={purpose}><input type="radio" name="propertyPurpose" value={purpose} checked={realEstateDetails.purpose === purpose} onChange={(event) => setRealEstateDetails((current) => ({ ...current, purpose: event.target.value }))} /><span>{purpose}</span></label>)}
              </fieldset>
            </div>
          )}

          {business.services.length > 0 && isToursTravel && (
            <div className="bookingStep travelDetailsStep" onFocusCapture={() => setTravelActiveStep(2)}>
              <div className="bookingStepTitle"><span>2</span><strong><MapPinned size={16} />Travel Details</strong></div>
              {travelServiceKind === "AIRLINE" && (
                <>
                  <label className="premiumInput"><Plane size={20} /><span>Trip Type<select name="tripType" value={travelDetails.tripType} onChange={(event) => setTravelDetails((current) => ({ ...current, tripType: event.target.value }))}><option value="ONE_WAY">One Way</option><option value="ROUND_TRIP">Round Trip</option></select></span></label>
                  <label className="premiumInput"><PlaneLanding size={20} /><span>Origin / From<input name="origin" value={travelDetails.origin} onChange={(event) => setTravelDetails((current) => ({ ...current, origin: event.target.value }))} required placeholder="Departure city or airport" /></span></label>
                </>
              )}
              <label className="premiumInput"><MapPin size={20} /><span>{travelServiceKind === "VISA" ? "Destination Country" : travelServiceKind === "TRANSPORT" ? "Destination" : travelServiceKind === "ROUTE" ? "Destination / Route" : "Destination"}<input name="destination" value={travelDetails.destination} onChange={(event) => setTravelDetails((current) => ({ ...current, destination: event.target.value }))} required placeholder="Where do you want to go?" /></span></label>
              {(travelServiceKind === "AIRLINE" && travelDetails.tripType === "ROUND_TRIP" || travelServiceKind === "INSURANCE") && <label className="premiumInput datePickerSurface" onClick={openNativeDatePicker}><CalendarDays size={20} /><span>Return Date<input name="returnDate" type="date" min={selectedBookingDate || getTodayDateValue()} value={travelDetails.returnDate} onChange={(event) => setTravelDetails((current) => ({ ...current, returnDate: event.target.value }))} required /></span></label>}
              {travelServiceKind === "AIRLINE" && (
                <div className="travelPassengerGrid">
                  <label>Adults<input name="guestCount" type="number" min="1" value={guestCount} onChange={(event) => setGuestCount(Math.max(1, Number(event.target.value) || 1))} /></label>
                  <label>Children<input name="childCount" type="number" min="0" value={childCount} onChange={(event) => setChildCount(Math.max(0, Number(event.target.value) || 0))} /></label>
                  <label>Infants<input name="infantCount" type="number" min="0" value={infantCount} onChange={(event) => setInfantCount(Math.max(0, Number(event.target.value) || 0))} /></label>
                </div>
              )}
              {travelServiceKind === "VISA" && <label className="premiumInput"><Users size={20} /><span>Number of Applicants<input name="applicantCount" type="number" min="1" value={travelDetails.applicants} onChange={(event) => setTravelDetails((current) => ({ ...current, applicants: Math.max(1, Number(event.target.value) || 1) }))} required /></span></label>}
              {travelServiceKind === "TRANSPORT" && <label className="premiumInput"><MapPinned size={20} /><span>Pickup Location<input name="address" value={travelDetails.pickupLocation} onChange={(event) => setTravelDetails((current) => ({ ...current, pickupLocation: event.target.value }))} required placeholder="Pickup address or landmark" /></span></label>}
              {!['AIRLINE', 'VISA'].includes(travelServiceKind) && <label className="premiumInput"><Users size={20} /><span>Number of Travelers<input name="guestCount" type="number" min="1" value={guestCount} onChange={(event) => setGuestCount(Math.max(1, Number(event.target.value) || 1))} required /></span></label>}
              <label className="premiumInput"><Building2 size={20} /><span>Preferred Hotel Category<select name="preferredHotelCategory" value={travelDetails.preferredHotelCategory} onChange={(event) => setTravelDetails((current) => ({ ...current, preferredHotelCategory: event.target.value }))}><option>No Preference</option><option>3-Star</option><option>4-Star</option><option>5-Star</option><option>Other</option></select></span></label>
              <label className="premiumInput"><BedDouble size={20} /><span>Type of Room<select name="roomType" value={travelDetails.roomType} onChange={(event) => setTravelDetails((current) => ({ ...current, roomType: event.target.value }))}><option value="">Select room type</option><option>Single</option><option>Twin</option><option>Double</option><option>Triple</option><option>Family Room</option><option>Other</option></select></span></label>
              <label className="premiumInput"><FileText size={20} /><span>Inclusions<textarea name="requestedInclusions" value={travelDetails.requestedInclusions} onChange={(event) => setTravelDetails((current) => ({ ...current, requestedInclusions: event.target.value }))} rows="3" placeholder="e.g. Hotel accommodation, transfers, tours, meals, baggage, travel insurance" /></span></label>
            </div>
          )}

          {business.services.length > 0 && (flags.requireTime || isAccommodation) && (
          <div className="bookingStep" onFocusCapture={() => { if (isToursTravel) setTravelActiveStep(3); if (isProBeauty) setBeautyActiveStep(2); if (isPestControl) setPestControlActiveStep(isDmonster ? 3 : 2); }}>
            <div className="bookingStepTitle"><span>{isToursTravel ? 3 : isDmonster ? 3 : 2}</span><strong>{timeStepLabel}</strong></div>
            {isBlockedDate && (
              <div className="clientStatusNotice unpaid">
                <strong>Date unavailable</strong>
                <span>This business marked {selectedDateLabel} as unavailable.</span>
              </div>
            )}
            {usesPreferredSchedule ? (
              <div className="preferredSchedulePanel">
                <span className="alwaysOpenBadge"><Clock size={14} /> {isPartyXpress ? "Open 24/7 for inquiries and booking requests" : "24/7 Service Available"}</span>
                <div className="preferredScheduleGrid">
                  <label className="premiumInput datePickerSurface" onClick={openNativeDatePicker}><CalendarDays size={20} /><span>{isPartyXpress ? "Event Date" : "Preferred Date"}<input
                    name="preferredDate"
                    type="date"
                    value={selectedBookingDate}
                    min={getTodayDateValue()}
                    onChange={(event) => setSelectedBookingDate(event.target.value)}
                    required={flags.requireDate}
                  /></span></label>
                  <label className="premiumInput"><Clock size={20} /><span>{isPartyXpress ? "Preferred Event Time" : "Preferred Time"}<input
                    name="preferredTime"
                    type="time"
                    value={displayTimeToInput(pickedSlot) || "10:15"}
                    min={selectedBookingDate === getTodayDateValue() ? getCurrentTimeInputValue() : undefined}
                    onChange={(event) => setPickedSlot(timeInputToDisplay(event.target.value))}
                    required={flags.requireTime}
                  /></span></label>
                </div>
                {isPartyXpress ? (
                  <div className="partyEventFields">
                    <label className="premiumInput"><Sparkles size={20} /><span>Event Type<select name="eventType" value={partyEventDetails.eventType} onChange={(event) => setPartyEventDetails((current) => ({ ...current, eventType: event.target.value }))}><option>Birthday</option><option>School Event</option><option>Corporate Event</option><option>Family Gathering</option><option>Community Event</option><option>Other</option></select></span></label>
                    <label className="premiumInput"><MapPin size={20} /><span>Event Location / Venue<input name="eventLocation" value={partyEventDetails.eventLocation} onChange={(event) => setPartyEventDetails((current) => ({ ...current, eventLocation: event.target.value }))} placeholder="Venue, barangay, city, or full event address" required /></span></label>
                    <label className="premiumInput"><Users size={20} /><span>Estimated Number of Guests<input name="estimatedGuestCount" type="number" min="1" value={partyEventDetails.guestCount} onChange={(event) => setPartyEventDetails((current) => ({ ...current, guestCount: event.target.value }))} placeholder="Optional" /></span></label>
                  </div>
                ) : null}
                <p className="preferredScheduleNote">{isPartyXpress ? "Your requested date and time are subject to availability and confirmation by Party Xpress Rentals." : "Open 24/7 — Select your preferred service date and time."}<br />Requested schedules are subject to business confirmation.</p>
                {selectedBookingDate && pickedSlot && <p className="preferredScheduleSummary"><strong>{isPartyXpress ? "Event Schedule" : "Preferred Schedule"}</strong> {selectedDateLabel} • {pickedSlot}</p>}
              </div>
            ) : (
            <div className="timeAndDate">
              {isXtremeFixedSchedule && selectedBookingDate && normalizedAvailableSlots[0] && (
                <div className="xtremeFixedScheduleCard">
                  <span className="xtremeScheduleEyebrow">{isXtremeWeekendClass ? "SELECTED CLASS SCHEDULE" : "SELECTED SCHEDULE"}</span>
                  <strong>{normalizedAvailableSlots[0]}</strong>
                  <small>{xtremePrimary === "XTREME STEPPER" && String(pickedService || "").includes("MONTHLY") ? "8 sessions • Twice per week • Schedule coordinated after this request" : `${pickedServiceDetail.durationMinutes || 90} minutes${pickedPricing.price !== null && pickedPricing.price !== undefined ? ` • ${publicPriceLabel(pickedPricing.price)}` : ""}`}</small>
                </div>
              )}
              {!isAccommodation && !isXtremeWeekendClass && !isXtremeFixedSchedule && (
                <div className="premiumSlotGrid">
                  {slotLabel && <span className="slotGroupLabel">{slotLabel}</span>}
                  {availableSlots.map((item) => (
                    <button type="button" key={item} disabled={isBlockedDate} className={pickedSlot === item ? "premiumSlot active" : "premiumSlot"} onClick={() => setPickedSlot(item)}>{item}</button>
                  ))}
                </div>
              )}
              <div className="selectedDateCard datePickerSurface" onClick={openNativeDatePicker} role="group" aria-label="Select booking date">
                <CalendarDays size={26} />
                <span>{isAccommodation ? "Stay dates" : isToursTravel ? "Travel dates" : "Selected"}</span>
                <strong>{isAccommodation ? `${stayNights || 0} Night${stayNights === 1 ? "" : "s"}` : hasSavedDepartures && !hasSelectedDeparture ? "Choose a departure" : selectedDateLabel}</strong>
                <small>{isAccommodation ? `${formatBookingDate(selectedBookingDate)} to ${formatBookingDate(selectedCheckoutDate)}` : hasSavedDepartures && hasSelectedDeparture ? `${formatPeso(activeDeparture.price)} / ${activeDeparture.pricingUnit === "PER_PAX" ? "pax" : activeDeparture.pricingUnit.replace("PER_", "").toLowerCase()}` : hasSavedDepartures ? "Select a saved date above" : selectedWeekdayLabel}</small>
                {!hasSavedDepartures && <input
                  aria-label={isAccommodation ? "Select check-in date" : isToursTravel ? "Desired tour start date" : "Select booking date"}
                  type="date"
                  value={selectedBookingDate}
                  min={getTodayDateValue()}
                  onChange={(event) => {
                    const next = event.target.value;
                    if (isXtremeWeekendClass && new Date(`${next}T00:00:00`).getDay() !== 6) {
                      setBookingError("Weekend Dance Class is available on Saturdays only.");
                      return;
                    }
                    setBookingError("");
                    setSelectedBookingDate(next);
                    const nextSlots = getServiceScheduleSlots(pickedServiceDetail, next, fallbackAvailableSlots);
                    if (nextSlots.length && !nextSlots.includes(pickedSlot)) setPickedSlot(nextSlots[0]);
                    if (isToursTravel && selectedCheckoutDate && selectedCheckoutDate < next) setSelectedCheckoutDate("");
                  }}
                  required={flags.requireDate}
                />}
                {isToursTravel && (
                  <label className="travelEndDateField datePickerSurface" onClick={openNativeDatePicker}><span>Return / End of Desired Tour</span><input aria-label="Return or end of desired tour" type="date" value={selectedCheckoutDate} min={selectedBookingDate || getTodayDateValue()} onChange={(event) => setSelectedCheckoutDate(event.target.value)} required={flags.requireDate} readOnly={hasSelectedDeparture} /></label>
                )}
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
            )}
          </div>
          )}

          {isPestControl && (
            <div className="bookingStep pestControlLocationStep" onFocusCapture={() => setPestControlActiveStep(isDmonster ? 4 : 3)}>
              <div className="bookingStepTitle"><span>{isDmonster ? 4 : 3}</span><strong><MapPinned size={16} />Service Location</strong></div>
              {!isDmonster && <fieldset className="pestPropertyType">
                <legend>Property Type</legend>
                {["Residential", "Commercial", "Office", "Store / Business Establishment", "Warehouse", "Other"].map((propertyType) => <label key={propertyType}><input type="radio" name="propertyType" value={propertyType} checked={pestControlDetails.propertyType === propertyType} onChange={(event) => setPestControlDetails((current) => ({ ...current, propertyType: event.target.value }))} /><span>{propertyType}</span></label>)}
              </fieldset>}
              <label className="premiumInput"><MapPin size={20} /><span>Service Location / Address<textarea name="serviceLocation" value={pestControlDetails.serviceLocation} onChange={(event) => setPestControlDetails((current) => ({ ...current, serviceLocation: event.target.value }))} required minLength="5" rows="2" placeholder="House/Unit No., Street, Barangay, City/Municipality, Province" /></span></label>
            </div>
          )}

          {business.services.length > 0 && <div className="bookingStep" onFocusCapture={() => { if (isToursTravel) setTravelActiveStep(4); if (isProBeauty) setBeautyActiveStep(3); if (isRealEstate) setRealEstateActiveStep(3); if (isPestControl) setPestControlActiveStep(4); }}>
            <div className="bookingStepTitle"><span>{detailsStepNumber}</span><strong>{detailsStepLabel}</strong></div>
            <label className="premiumInput"><User size={20} /><span>{isAccommodation ? "Full Name" : "Your name"}<input name="customer" required placeholder="Maria Santos" /></span></label>
            <label className="premiumInput"><Phone size={20} /><span>{isAccommodation ? "Mobile Number" : "Phone or contact number"}<input name="contact" required placeholder="0912 345 6789" /></span></label>
            <label className="premiumInput"><Mail size={20} /><span>Email Address {isXtremeDancers && <small>(Optional)</small>}<input name="email" type="email" value={travelDetails.customerEmail} onChange={(event) => setTravelDetails((current) => ({ ...current, customerEmail: event.target.value }))} required={!isXtremeDancers} autoComplete="email" placeholder="name@example.com" /><small>Add your email to receive booking and payment status notifications when enabled.</small></span></label>
            {!isXtremeDancers && <label className="premiumInput"><House size={20} /><span>Address<textarea name="customerAddress" value={travelDetails.customerAddress} onChange={(event) => setTravelDetails((current) => ({ ...current, customerAddress: event.target.value }))} required minLength="5" autoComplete="street-address" rows="2" placeholder="House/Unit No., Street, Barangay, City/Municipality, Province" /></span></label>}
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
            ) : needsGuestCount && !isToursTravel && (
              <label className="guestStepper">
                <span>{isToursTravel ? "Total guests" : "Quantity / pax"}</span>
                <div>
                  <button type="button" onClick={() => setGuestCount((current) => Math.max(1, current - 1))}>-</button>
                  <input name="guestCount" type="number" min="1" value={guestCount} onChange={(event) => setGuestCount(Math.max(1, Number(event.target.value) || 1))} required />
                  <button type="button" onClick={() => setGuestCount((current) => current + 1)}>+</button>
                </div>
              </label>
            )}
            <label className="premiumInput"><FileText size={20} /><span>{noteLabel}<textarea name="note" value={isPartyXpress ? partyEventDetails.specialRequests : isRealEstate ? realEstateDetails.requirements : undefined} onChange={isPartyXpress ? (event) => setPartyEventDetails((current) => ({ ...current, specialRequests: event.target.value })) : isRealEstate ? (event) => setRealEstateDetails((current) => ({ ...current, requirements: event.target.value })) : undefined} placeholder={isRealEstate ? "Property features, bedrooms, move-in timeline, or other preferences" : notePlaceholder} rows="3" /></span></label>
          </div>}

          {business.services.length > 0 && (isPestControl || isRealEstate || isToursTravel || allowMultipleServices || flags.showPrices) && (
            <div className="reservationSummary" tabIndex={isToursTravel || isProBeauty || isRealEstate ? 0 : undefined} onFocus={() => { if (isToursTravel) setTravelActiveStep(5); if (isProBeauty) setBeautyActiveStep(4); if (isRealEstate) setRealEstateActiveStep(4); }} onMouseEnter={() => { if (isToursTravel) setTravelActiveStep(5); if (isProBeauty) setBeautyActiveStep(4); if (isRealEstate) setRealEstateActiveStep(4); }}>
              <span>{isXtremeDancers ? "YOUR BOOKING" : isPartyXpress ? "Booking Request Summary" : isPestControl ? "Service Request Summary" : isRealEstate ? "Property Inquiry Summary" : isToursTravel ? "Travel Inquiry Summary" : isHealthWellness && !flags.requireDate && !flags.requireTime ? "Request Summary" : "Booking Summary"}</span>
              <strong>{primaryServiceLabel}</strong>
              {(flags.requireDate || flags.requireTime || needsGuestCount) && <p>{flags.requireDate ? selectedDateLabel : ""} {flags.requireTime ? `at ${pickedSlot}` : ""}{needsGuestCount ? `${flags.requireDate || flags.requireTime ? " • " : ""}${guestCount} ${isToursTravel ? "guest" : "pax"}${guestCount > 1 ? "s" : ""}` : ""}</p>}
              {isToursTravel && <div className="travelInquiryPreferences">
                {travelDetails.preferredHotelCategory && <p><strong>Preferred Hotel Category:</strong> {travelDetails.preferredHotelCategory}</p>}
                {travelDetails.roomType && <p><strong>Type of Room:</strong> {travelDetails.roomType}</p>}
                {travelDetails.requestedInclusions.trim() && <p><strong>Requested Inclusions:</strong> {travelDetails.requestedInclusions}</p>}
                {travelDetails.customerAddress.trim() && <p><strong>Address:</strong> {travelDetails.customerAddress}</p>}
              </div>}
              {!isToursTravel && <div className="customerInquirySummary">
                {isPartyXpress && partyEventDetails.eventType && <p><strong>Event Type:</strong> {partyEventDetails.eventType}</p>}
                {isPartyXpress && partyEventDetails.eventLocation.trim() && <p><strong>Event Location / Venue:</strong> {partyEventDetails.eventLocation}</p>}
                {isPartyXpress && partyEventDetails.guestCount && <p><strong>Estimated Guests:</strong> {partyEventDetails.guestCount}</p>}
                {isPartyXpress && partyEventDetails.specialRequests.trim() && <p><strong>Special Requests:</strong> {partyEventDetails.specialRequests}</p>}
                {isRealEstate && realEstateDetails.location.trim() && <p><strong>Preferred Location:</strong> {realEstateDetails.location}</p>}
                {isRealEstate && realEstateDetails.budgetRange && <p><strong>Budget Range:</strong> {realEstateDetails.budgetRange}</p>}
                {isRealEstate && realEstateDetails.purpose && <p><strong>Purpose:</strong> {realEstateDetails.purpose}</p>}
                {isRealEstate && realEstateDetails.requirements.trim() && <p><strong>Additional Requirements:</strong> {realEstateDetails.requirements}</p>}
                {isPestControl && pestControlDetails.propertyType && <p><strong>Property Type:</strong> {pestControlDetails.propertyType}</p>}
                {isDmonster && pestControlDetails.areaSize && <p><strong>Area:</strong> {pestControlDetails.areaSize} sqm</p>}
                {isDmonster && pickedService === "Termite Treatment" && pestControlDetails.floors && <p><strong>Floors:</strong> {dmonsterFloorOptions.find((floor) => floor.value === pestControlDetails.floors)?.label || pestControlDetails.floors}</p>}
                {isDmonster && pestControlDetails.serviceArea && <p><strong>Service Area:</strong> {pestControlDetails.serviceArea}</p>}
                {isPestControl && pestControlDetails.serviceLocation.trim() && <p><strong>Service Location:</strong> {pestControlDetails.serviceLocation}</p>}
                {travelDetails.customerEmail.trim() && <p><strong>Email:</strong> {travelDetails.customerEmail}</p>}
                {travelDetails.customerAddress.trim() && <p><strong>Address:</strong> {travelDetails.customerAddress}</p>}
              </div>}
              {isDmonster && (
                <div className="pestPriceSummary inline">
                  <span>{dmonsterPricing?.status === "calculated" ? "Estimated Service Price" : "Price"}</span>
                  <strong>{dmonsterPricing?.status === "calculated" ? formatPeso(dmonsterPricing.total) : "For assessment"}</strong>
                  {dmonsterPricing?.formula && <p>{dmonsterPricing.formula}</p>}
                  <small>{dmonsterPricing?.note || "Estimated price based on the information provided. Final service price is subject to business confirmation."}</small>
                </div>
              )}
              {!isRealEstate && !isPestControl && <div className="bookingLineItems">
                {bookingCalculation.lineItems.map((item) => (
                  <div key={item.serviceName}>
                    <span>{item.serviceName}<small>{publicLineLabel(item.lineLabel)}</small></span>
                    <strong>{item.lineTotal === null ? (isPartyXpress ? "For confirmation" : isToursTravel ? "Request Quote" : isProBeauty ? "Contact for Price" : "Pricing unavailable") : publicPriceLabel(item.lineTotal)}</strong>
                  </div>
                ))}
              </div>}
              {!isRealEstate && !isPestControl && !bookingCalculation.totalAvailable && (
                <em>{isPartyXpress ? "Party Xpress Rentals will confirm availability and rates after reviewing your request." : isProBeauty ? "Final treatment price will be confirmed by the clinic." : "This booking option needs pricing configured before it can be submitted."}</em>
              )}
              {flags.showPrices && bookingCalculation.totalAvailable && !isQuoteOnlySelection && <em>Estimated total: {publicPriceLabel(estimatedTotal)}</em>}
            </div>
          )}

          {business.services.length > 0 && <button className="premiumConfirmButton" type="submit" disabled={submitting || isBlockedDate} onFocus={() => { if (isToursTravel) setTravelActiveStep(5); if (isRealEstate) setRealEstateActiveStep(4); if (isPestControl) setPestControlActiveStep(4); }}>
            {submitting ? "Submitting request..." : submitLabel} <ChevronRight size={22} />
          </button>}
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
              <strong>{isXtremeDancersDemo ? "Test Booking Received" : isProductionActive ? (isPestControl ? "Service Request Received" : isRealEstate ? "Property Inquiry Received" : isToursTravel ? "Reservation Request Received" : "Booking Request Received") : "Demo booking completed"}</strong>
              <span>
                {isProductionActive && isPestControl
                  ? "Your service request has been received. The pest control team may contact you to confirm the schedule and assessment details."
                  : isProductionActive && isRealEstate
                  ? "Your property inquiry has been received. The property team may contact you to discuss your requirements."
                  : isProductionActive && (isToursTravel || isAccommodation)
                  ? `Your reservation request has been received. The ${isAccommodation ? "host" : "tour operator"} may contact you to confirm availability and final details.`
                  : isProductionActive
                  ? "Your booking request has been received. The business may contact you to confirm your appointment."
                  : isXtremeDancersDemo ? "Your test booking was saved to the Slotwise demo. The class schedule is not confirmed." : "No live booking was created."}
              </span>
              <dl>
                <div><dt>Business</dt><dd>{business.business}</dd></div>
                <div><dt>{isPestControl ? "Pest Concern / Service" : isRealEstate ? "Property Type" : selectedServiceNames.length > 1 ? "Services" : isAccommodation ? "Room / Unit" : isToursTravel ? "Tour Package" : "Service"}</dt><dd>{confirmed.service}</dd></div>
                {isPestControl && confirmed.metadata?.property_type && <div><dt>Property Type</dt><dd>{confirmed.metadata.property_type}</dd></div>}
                {isPestControl && confirmed.metadata?.service_location && <div><dt>Service Location</dt><dd>{confirmed.metadata.service_location}</dd></div>}
                {isRealEstate && confirmed.metadata?.preferred_location && <div><dt>Preferred Location</dt><dd>{confirmed.metadata.preferred_location}</dd></div>}
                {isRealEstate && confirmed.metadata?.budget_range && <div><dt>Budget Range</dt><dd>{confirmed.metadata.budget_range}</dd></div>}
                {isRealEstate && confirmed.metadata?.property_purpose && <div><dt>Purpose</dt><dd>{confirmed.metadata.property_purpose}</dd></div>}
                <div><dt>{isAccommodation ? "Check-in" : isToursTravel ? "Desired Tour Start" : "Date"}</dt><dd>{confirmed.booking_date ? formatBookingDate(confirmed.booking_date) : "Not required"}</dd></div>
                {isToursTravel && confirmed.metadata?.travel_end_date && <div><dt>Return / End of Tour</dt><dd>{formatBookingDate(confirmed.metadata.travel_end_date)}</dd></div>}
                {isAccommodation && <div><dt>Check-out</dt><dd>{formatBookingDate(confirmed.metadata?.check_out)}</dd></div>}
                {isAccommodation && <div><dt>Nights</dt><dd>{confirmed.metadata?.number_of_nights || stayNights}</dd></div>}
                <div><dt>{isAccommodation ? "Stay" : isToursTravel ? "Preferred Time" : "Time"}</dt><dd>{confirmed.slot}</dd></div>
                {(isToursTravel || isAccommodation) && <div><dt>Guests</dt><dd>{confirmed.metadata?.guest_count || guestCount}</dd></div>}
                {isToursTravel && <div><dt>Pricing Type</dt><dd>{confirmed.metadata?.pricing_type || "FIXED"}</dd></div>}
                {isToursTravel && confirmed.metadata?.selected_tier && <div><dt>Selected Group Rate</dt><dd>{confirmed.metadata.selected_tier.minGuests}-{confirmed.metadata.selected_tier.maxGuests} pax - {formatPeso(confirmed.metadata.selected_tier.price)}</dd></div>}
                {flags.showPrices && <div><dt>Estimated Total</dt><dd>{confirmed.metadata?.estimated_total || confirmed.estimated_total ? publicPriceLabel(confirmed.metadata?.estimated_total || confirmed.estimated_total) : servicePriceLabel(pickedServiceDetail)}</dd></div>}
                <div><dt>Name</dt><dd>{confirmed.customer}</dd></div>
                <div><dt>Reference</dt><dd>{confirmed.id || "Request received"}</dd></div>
              </dl>
              <div className="bookingSuccessActions">
                <button type="button" onClick={() => setConfirmed(null)}>Book Another</button>
                {capabilities.downloadBookingPdf && confirmed.id && (
                  <button type="button" onClick={handleCustomerBookingPdf} className="customerBookingPdfButton">
                    <FileDown size={17} /> Download Booking PDF
                  </button>
                )}
                {business.messengerLink && <a href={business.messengerLink} target="_blank" rel="noreferrer">Contact Business</a>}
              </div>
              {customerPdfMessage && <small className="customerPdfMessage" role="status">{customerPdfMessage}</small>}
              {paymentAvailable && (
                <div className="paymentInstructions paymentShell">
                  <div className="paymentHeader"><span className="paymentEyebrow">PAYMENT</span><strong>HOW WOULD YOU LIKE TO PROCEED?</strong><p>Your booking is already submitted. Choose how you’d like to handle the payment.</p></div>
                  {paymentRequired && <p><strong>Required {normalizePaymentRequirement(paymentSettings.requirement_type) === "DEPOSIT_REQUIRED" ? "Deposit" : "Payment"}:</strong> {formatPeso(requiredPaymentAmount)}</p>}
                  {!paymentChoice && <div className="publicPaymentChoices">
                    <button type="button" className="paymentNowChoice paymentChoiceCard" onClick={() => setPaymentChoice("PAY_NOW")}><CreditCard size={20} /><span><strong>PAY NOW</strong><small>Submit your payment details now for manual verification.</small><em>GCash available</em></span><ArrowRight size={19} /></button>
                    {!paymentRequired && <button type="button" className="paymentLaterChoice" onClick={() => {
                      setPaymentChoice("PAY_LATER");
                      setConfirmedPayment({ payment_status: "NOT_SUBMITTED", payment_option: "PAY_LATER" });
                    }}><Clock size={20} /><span><strong>PAY LATER</strong><small>Wait for the business to contact you regarding payment.</small><em>Booking remains submitted</em></span><ArrowRight size={19} /></button>}
                  </div>}
                  {paymentChoice === "PAY_LATER" && <div className="paymentFollowUpNotice paymentStateCard"><span className="paymentEyebrow">PAYMENT</span><strong>PAY LATER SELECTED</strong><p>Your booking request is already saved. The business may contact you to confirm your booking and payment instructions.</p><dl><div><dt>Booking Reference</dt><dd>{confirmed.id || "Request received"}</dd></div><div><dt>Payment Status</dt><dd>NOT SUBMITTED</dd></div></dl><div className="paymentStateActions"><button type="button" onClick={handleCustomerBookingPdf}><FileDown size={17} /> Download Booking PDF</button><button type="button" onClick={() => setConfirmed(null)}>Book Another</button></div></div>}
                  {paymentChoice === "PAY_NOW" && <>
                    <div className="paymentScreenHeading"><button type="button" className="paymentBackButton" onClick={() => { setPaymentChoice(""); setPaymentOpen(false); setPaymentStatus(""); }}>← PAYMENT OPTIONS</button><span className="paymentEyebrow">PAYMENT</span><strong className="paymentScreenTitle">COMPLETE YOUR PAYMENT</strong></div>
                    <p className="paymentBookingReference">Booking Reference: {confirmed.id || "Request received"}</p>
                    <div className="paymentAmountDue"><span>BOOKING AMOUNT</span><strong>{publicPriceLabel(confirmed.metadata?.estimated_total ?? confirmed.estimated_total ?? estimatedTotal)}</strong></div>
                    <p className="paymentVerificationNotice"><ShieldCheck size={21} /><span><strong>PAYMENT VERIFICATION</strong><small>Your payment is not confirmed automatically. {business.business} will check the payment in its actual GCash account before marking it as verified.</small></span></p>
                  <div className="paymentMethodList">
                    {paymentMethods.map((method) => (
                      <article className="paymentMethodCard" key={method.id || `${method.method_type}-${method.method_name}`}>
                        <div><strong>{method.method_name || method.method_type}</strong><em>ACTIVE</em></div>
                        <small><b>Account Name</b> {method.account_name}</small>
                        <small><b>GCash Number</b> {method.account_number}</small>
                        <button type="button" className="copyPaymentNumber" onClick={() => { navigator.clipboard?.writeText(method.account_number || ""); setCopiedPaymentMethod(method.id || method.method_type); setTimeout(() => setCopiedPaymentMethod(""), 1800); }}><Copy size={15} /> {copiedPaymentMethod === (method.id || method.method_type) ? "Copied" : "Copy Number"}</button>
                        {method.instructions && <p>{method.instructions}</p>}
                      </article>
                    ))}
                  </div>
                  <section className="paymentHowToPay" aria-label="How to pay">
                    <div className="paymentHowToHeader"><span className="paymentEyebrow">HOW TO PAY</span><small>Follow these steps to submit your payment for verification.</small></div>
                    <div className="paymentHowToGrid">
                      <article><span><Smartphone size={17} />01</span><strong>SEND YOUR PAYMENT</strong><p>Open GCash and send your payment to the account shown above.</p>{(confirmed.metadata?.estimated_total ?? confirmed.estimated_total ?? estimatedTotal) !== null && <em>Amount to send: {publicPriceLabel(confirmed.metadata?.estimated_total ?? confirmed.estimated_total ?? estimatedTotal)}</em>}</article>
                      <article><span><FileText size={17} />02</span><strong>SAVE YOUR RECEIPT</strong><p>After sending your payment, take a screenshot of your GCash receipt and keep the transaction/reference number.</p></article>
                      <article><span><Upload size={17} />03</span><strong>ENTER YOUR PAYMENT DETAILS</strong><p>Enter the amount you sent and your GCash reference number below, then upload your payment receipt.</p></article>
                      <article><span><ShieldCheck size={17} />04</span><strong>SUBMIT FOR VERIFICATION</strong><p>Tap “Submit Payment for Verification” after completing the details.</p></article>
                    </div>
                    <small className="paymentHowToNote">Your payment will remain Pending Verification until {business.business} checks and confirms the payment.</small>
                  </section>
                  {!paymentOpen && <button type="button" className="paymentOpenButton" onClick={() => setPaymentOpen(true)}>Enter Payment Details <ArrowRight size={17} /></button>}
                  {paymentOpen && (
                    <form className="paymentDetailForm" onSubmit={submitPaymentDetails}>
                      {paymentMethods.length > 1 && <label>PAYMENT METHOD<select name="paymentMethod" required>
                        {paymentMethods.map((method) => <option value={method.method_type} key={method.id || `${method.method_type}-${method.method_name}`}>{method.method_name || method.method_type}</option>)}
                      </select></label>}
                      {paymentMethods.length === 1 && <input type="hidden" name="paymentMethod" value={paymentMethods[0].method_type} />}
                      <label>AMOUNT YOU SENT<input name="amountSubmitted" type="number" min="0" step="0.01" placeholder="₱ 350.00" required /></label>
                      <label>REFERENCE / TRANSACTION NUMBER<input name="referenceNumber" placeholder="Enter transaction/reference number" required /><small>You can find this on your GCash payment receipt.</small></label>
                      <textarea name="paymentNote" placeholder="Optional note" rows="2" />
                      <label className="paymentProofUpload">
                        <span><Upload size={18} /> PAYMENT RECEIPT <em>{paymentSettings.require_proof ? "REQUIRED" : "OPTIONAL"}</em></span>
                        <small>Upload a screenshot of your successful payment. JPG, PNG or WEBP • Maximum 5 MB</small>
                        <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                          const next = event.target.files?.[0] || null;
                          setPaymentProofFile(next);
                          setPaymentProofPreview(next ? URL.createObjectURL(next) : "");
                        }} />
                        {paymentProofFile && <div className="paymentProofPreview"><strong>{paymentProofFile.name}</strong><span>{(paymentProofFile.size / 1024 / 1024).toFixed(2)} MB</span>{paymentProofPreview && <img src={paymentProofPreview} alt="Payment proof preview" />}<button type="button" onClick={() => { setPaymentProofFile(null); setPaymentProofPreview(""); }}>Remove</button></div>}
                      </label>
                      <p>Submitting payment details does not automatically confirm your reservation. Payment will be verified by the business.</p>
                      <button type="submit" className="paymentSubmitButton">SUBMIT PAYMENT FOR VERIFICATION <ArrowRight size={17} /></button>
                      <small className="paymentPendingHint"><ShieldCheck size={16} /> Your payment will remain Pending Verification until the business confirms it.</small>
                    </form>
                  )}
                  </>}
                </div>
              )}
              {!travelDetails.customerEmail.trim() && isProductionActive && <p className="customerEmailNotice">No email provided. Booking and payment updates cannot be sent by email. Please keep your booking reference and wait for the business to contact you through your mobile number.</p>}
              {paymentStatus && <div className="paymentSubmittedNotice"><strong>PAYMENT SUBMITTED</strong><b>Pending Verification</b><span>We've received your payment details. The business will verify your payment before confirming it as paid.</span></div>}
              {(isDemoPreview || isAwaitingActivation) && smmOffers?.enabled && smmOffers?.show_on_demo !== false && (
                <SmmOffersFeed offers={smmOffers} placement="DEMO_PREVIEW" compact />
              )}
            </div>
          )}
        </form>
      </section>
      {isHealthWellness && <footer className="wellnessFooter"><strong>{business.business}</strong><span>{business.featureFlags?.wellnessFooterTagline || business.businessType}</span></footer>}
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
  const updateDeparture = (serviceIndex, departureIndex, updates) => {
    const departures = getEditableDepartureDates(services[serviceIndex].departureDates);
    updateService(serviceIndex, {
      departureDates: departures.map((departure, itemIndex) => itemIndex === departureIndex ? { ...departure, ...updates } : departure),
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
                <span>{hasValidPricingConfiguration(service) ? formatPeso(normalizePricingType(service.pricingType, service.pricingUnit) === "GROUP_TIER" ? normalizePricingTiers(service.pricingTiers)[0]?.price : service.price) : "No price"}</span>
                <em>{isConsultant ? ((service.status || "Active") === "Inactive" ? "Disabled" : "Enabled") : (service.status || "Active")}</em>
              </button>
              {expanded && (
                <div className="structuredServiceFields">
                  <input value={service.name} onChange={(event) => updateService(index, { name: event.target.value })} placeholder={`${copy.single} name`} />
                  {(isConsultant || isTravel) && <input value={service.serviceCategory || ""} onChange={(event) => updateService(index, { serviceCategory: event.target.value })} placeholder="Category / label" />}
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
                      <div className="departureDateEditor">
                        <strong>Available Dates &amp; Rates</strong>
                        {!getEditableDepartureDates(service.departureDates).length && <span className="departureDateEmpty">No departure schedules added yet.</span>}
                        {getEditableDepartureDates(service.departureDates).map((departure, departureIndex) => (
                          <div className="departureDateRow" key={departure.id}>
                            <strong className="departureEditorTitle">Departure {departureIndex + 1}</strong>
                            <input type="date" value={departure.startDate} onChange={(event) => updateDeparture(index, departureIndex, { startDate: event.target.value })} aria-label="Departure start date" />
                            <input type="date" value={departure.endDate} onChange={(event) => updateDeparture(index, departureIndex, { endDate: event.target.value })} aria-label="Departure end date" />
                            <input type="number" min="0" value={departure.price} onChange={(event) => updateDeparture(index, departureIndex, { price: Number(event.target.value) })} placeholder="Price" aria-label="Departure price" />
                            <select value={departure.pricingUnit} onChange={(event) => updateDeparture(index, departureIndex, { pricingUnit: event.target.value })} aria-label="Departure pricing unit"><option value="PER_PAX">Per pax</option><option value="PER_GROUP">Per group</option><option value="PER_TRIP">Per trip</option></select>
                            <select value={departure.status} onChange={(event) => updateDeparture(index, departureIndex, { status: event.target.value })} aria-label="Departure availability"><option value="AVAILABLE">Available</option><option value="SOLD_OUT">Sold out</option><option value="UNAVAILABLE">Unavailable</option></select>
                            <input value={departure.notes} onChange={(event) => updateDeparture(index, departureIndex, { notes: event.target.value })} placeholder="Optional notes" aria-label="Departure notes" />
                            <button type="button" className="departureDeleteButton" onClick={() => updateService(index, { departureDates: getEditableDepartureDates(service.departureDates).filter((_, itemIndex) => itemIndex !== departureIndex) })}><Trash2 size={16} /> Delete Departure</button>
                          </div>
                        ))}
                        <button type="button" onClick={() => {
                          const departures = getEditableDepartureDates(service.departureDates);
                          updateService(index, { departureDates: [...departures, { id: `departure-${Date.now()}-${departures.length}`, startDate: "", endDate: "", price: "", pricingUnit: "PER_PAX", status: "AVAILABLE", notes: "", displayOrder: departures.length }] });
                        }} className="departureAddButton"><Plus size={17} /> Add Departure</button>
                      </div>
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
                  <option>Optical Clinic</option>
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
    mobileNumbers: "",
    primaryEmail: "",
    additionalEmails: "",
    website: "",
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
    mobileNumbers: business.mobileNumbers || "",
    primaryEmail: business.primaryEmail || "",
    additionalEmails: business.additionalEmails || "",
    website: business.website || "",
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
      if (name === "industry" && (!current.bookingTemplate || current.bookingTemplate === "GENERAL")) {
        next.bookingTemplate = inferBookingTemplateFromIndustry(value);
      }
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

  const getFreshAdminSession = async () => {
    const currentSession = getStoredAdminSession() || adminSession;
    if (!currentSession?.refresh_token) {
      throw new Error("Your admin session expired. Please sign in again before uploading.");
    }
    try {
      const refreshed = await supabaseAuthRequest("token?grant_type=refresh_token", {
        refresh_token: currentSession.refresh_token,
      });
      const nextSession = {
        ...currentSession,
        ...refreshed,
        refresh_token: refreshed.refresh_token || currentSession.refresh_token,
      };
      storeAdminSession(nextSession);
      setAdminSession(nextSession);
      return nextSession;
    } catch {
      clearAdminSession();
      setAdminSession(null);
      setAuthState("login");
      throw new Error("Your admin session expired. Please sign in again, then upload the image.");
    }
  };

  const uploadBrandAsset = async (kind, file) => {
    validateBrandMediaFile(file);
    const freshSession = await getFreshAdminSession();
    const slug = makeSlug(editingSlug || form.slug || form.businessName || "client-business");
    const extension = getFileExtension(file);
    const stamp = Date.now();
    const folder = kind === "cover" ? "covers" : "logos";
    const path = `${folder}/${slug}/${kind}-${stamp}.${extension}`;
    const url = await supabaseStorageUpload(path, file, freshSession.access_token);
    setForm((current) => ({ ...current, [kind]: url }));
    setStatusMessage(`${kind === "cover" ? "Cover image" : "Logo"} uploaded.`);
    return url;
  };

  const uploadAnnouncementAsset = async (file) => {
    validateAnnouncementMediaFile(file);
    const freshSession = await getFreshAdminSession();
    const slug = makeSlug(editingSlug || form.slug || form.businessName || "client-business");
    const extension = getFileExtension(file);
    const stamp = Date.now();
    const path = `announcements/${slug}/announcement-${stamp}.${extension}`;
    const url = await supabaseStorageUpload(path, file, freshSession.access_token);
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
    const freshSession = await getFreshAdminSession();
    const extension = getFileExtension(file);
    const stamp = Date.now();
    const folder = kind === "offer_two_image_url" ? "offer-two" : "offer-one";
    const path = `smm-offers/global/${folder}-${stamp}.${extension}`;
    const url = await supabaseStorageUpload(path, file, freshSession.access_token);
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
      const [businessRow] = await supabaseRequest("businesses", {
        query: `?select=slug&slug=eq.${encodeURIComponent(targetSlug)}&limit=1`,
        accessToken: adminSession?.access_token,
      });
      if (!businessRow?.slug) {
        setStatusMessage("Business must be created before assigning a user.");
        return;
      }
      const existing = clientAccess.find((item) => (
        item.business_slug === targetSlug && item.user_id === accessForm.userId.trim()
      ));
      if (existing) {
        await supabaseRequest("business_users", {
          method: "PATCH",
          query: `?id=eq.${encodeURIComponent(existing.id)}`,
          body: { role: accessForm.role, active: true, authorized_branches: ["ALL"] },
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
            authorized_branches: ["ALL"],
          },
          accessToken: adminSession?.access_token,
        });
      }
      await loadClientAccess(adminSession);
      setAccessForm({ userId: "", role: "OWNER" });
      setStatusMessage("Client access assigned.");
    } catch (error) {
      console.error("Client status update failed", error);
      const message = String(error?.message || "");
      setStatusMessage(message.includes("business_users_business_slug_fkey") ? "Business must be created before assigning a user." : "Unable to save changes. Please try again.");
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
            <label>Mobile numbers<input name="mobileNumbers" value={form.mobileNumbers} onChange={updateForm} placeholder="One or more mobile numbers" /></label>
            <label>Primary email<input name="primaryEmail" type="email" value={form.primaryEmail} onChange={updateForm} /></label>
            <label>Additional emails<input name="additionalEmails" value={form.additionalEmails} onChange={updateForm} placeholder="Comma-separated" /></label>
            <label>Official website<input name="website" type="url" value={form.website} onChange={updateForm} placeholder="https://example.com" /></label>
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

function getClientHelpTopics(business = {}, capabilities = {}) {
  const template = normalizeBookingTemplate(business.bookingTemplate);
  const travel = template === "TOURS_TRAVEL";
  const accommodation = template === "STAYCATION_ACCOMMODATION";
  const consultant = template === "PROFESSIONAL_SERVICES";
  const realEstate = template === "REAL_ESTATE";
  const pestControl = template === "PEST_CONTROL";
  const serviceLabel = pestControl ? "Pest Control Services" : realEstate ? "Property Categories / Inquiry Options" : travel ? "Tour Packages" : accommodation ? "Units / Accommodation" : consultant ? "Plans & Services" : "Services";
  const bookingLabel = pestControl ? "Service Requests" : realEstate ? "Property Inquiries" : travel ? "Reservations / Travel Inquiries" : accommodation ? "Reservations" : consultant ? "Consultations / Inquiries" : "Bookings / Requests";
  const topics = [
    { id: "dashboard", title: "Dashboard", intro: "A quick overview of your booking system and recent customer activity.", steps: ["Review total, pending, and confirmed records.", `Open ${bookingLabel} to view complete details.`, "Use Refresh when you expect a newly submitted record."], tips: ["Statistics use actual saved records.", "Use this page for quick monitoring."] },
    { id: "bookings", title: bookingLabel, intro: "View and manage customer submissions.", steps: ["Open a booking or inquiry to review customer and service details.", "Check the requested date, time, or travel schedule.", "Update the status as work progresses: Pending, Quotation Sent, Waiting for Approval, For Amendment, Confirmed, Completed, or Cancelled.", "Use Delete only when the record should be permanently removed."], tips: ["Changing status does not automatically contact the customer.", "Confirm important changes directly with the customer."] },
    { id: "inquiries", title: "Inquiries", intro: "Track new customer inquiries before they become confirmed bookings.", steps: ["Open Inquiries to review customer, event, source, and interested services.", "Use New Inquiry to encode messages from Facebook, Messenger, phone, or walk-ins.", "Update the inquiry status while reviewing availability.", "Use Convert to Booking only after the business is ready to create the booking."], tips: ["Converted inquiries link back to their booking.", "Duplicate conversion is blocked once a booking is linked."] },
    capabilities.customers && { id: "customers", title: travel ? "Guests / Customers" : "Customers", intro: "Customers are created from saved bookings and inquiries.", steps: ["Open this section to review customer contact information.", "Use booking history when it is available in your package."], tips: ["Customer records are connected to their submissions.", "Keep customer information private."] },
    capabilities.clientRecords && { id: "clients", title: "Clients", intro: "Client Records helps businesses keep reusable client profiles connected to Slotwise bookings.", steps: ["Add a client with name, contact number, branch, email, and notes.", "Search or filter by branch.", "Open a client profile to review information and reservation history.", "Create a reservation from a client profile when needed."], tips: ["Reservation history is read from existing Slotwise bookings.", "Branch assignment helps organize clients without creating a separate CRM."] },
    capabilities.services && { id: "services", title: serviceLabel, intro: `Manage the ${serviceLabel.toLowerCase()} shown on your public booking page.`, steps: ["Add or edit the name, category, and description.", "Enter a price or leave it blank for Contact for Rate.", "Add an external details link when needed.", "Set the item Active or Inactive, then save."], tips: ["Active items may appear publicly.", "Inactive items should not appear on the public page.", "Save after every important change."], customer: `Customers see your active ${serviceLabel.toLowerCase()}, descriptions, pricing labels, and available links.` },
    travel && capabilities.services && { id: "departures", title: "Available Dates & Rates", intro: "Use this for tour packages with fixed departure schedules.", steps: ["Open Tour Packages and edit the package.", "Find Available Dates & Rates and click Add Departure.", "Enter the start date, end date, rate, and pricing unit.", "Save the package."], tips: ["Customers can select saved departures publicly.", "Without departures, the regular preferred-date inquiry flow remains available."], customer: "Saved departure dates and rates appear on the public travel page." },
    capabilities.schedule && { id: "schedule", title: travel ? "Availability" : "Schedule", intro: "Controls your working days, hours, and available booking times.", steps: ["Enter your open days and operating hours.", "Review the available time slots.", "Save the schedule."], tips: ["Schedule changes affect customer choices.", "Avoid overlapping or invalid operating periods."], customer: "Customers see only the available dates and times configured here." },
    capabilities.reservationCalendar && { id: "reservationCalendar", title: "Reservation Calendar", intro: "Shows saved reservations by date.", steps: ["Use Previous, Today, and Next to change month.", "Select a date to see its reservations.", "Open a reservation to review details."], tips: ["Calendar dates use the booking or travel start date.", "The calendar does not support drag-and-drop editing."] },
    capabilities.blockedDates && { id: "blockedDates", title: "Blocked Dates", intro: "Use blocked dates when you cannot accept bookings.", steps: ["Choose the unavailable date.", "Add a short reason if needed.", "Click Block date."], tips: ["Use this for holidays, maintenance, leave, or fully booked days.", "Remove the block when the date becomes available."], customer: "Blocked dates cannot be selected on the public booking page." },
    capabilities.paymentVerification && { id: "paymentSettings", title: "Payment Settings", intro: "Configure payment instructions and manually verify submitted references.", steps: ["Choose whether payment or a deposit is required.", "Add your GCash, Maya, bank, or other payment details.", "Review each submitted payment reference.", "Verify only after checking your actual payment account."], tips: ["Payments are not verified automatically.", "Never rely only on a reference number."] },
    { id: "updates", title: "Updates", intro: "Read published Slotwise feature updates and improvements available for your package.", steps: ["Open Updates from the sidebar.", "Review newest announcements first.", "Use package badges to see who the update applies to."], tips: ["Unpublished updates do not appear here.", "The new indicator clears after opening Updates."] },
    { id: "packages", title: "Packages", intro: "Compare Starter, Business, and Pro from inside your dashboard.", steps: ["Open Packages from the sidebar.", "Check your current package badge.", "Use Message SMM to Upgrade when you want a higher package."], tips: ["Paid add-ons are separate from normal package features.", "Your active dashboard permissions do not change until your package or add-ons are updated by an authorized admin."] },
    { id: "account", title: "Account", intro: "Manage editable business and contact information.", steps: ["Review the business name and description.", "Update contact details, website, logo, or colors when available.", "Save business details."], tips: ["Never share dashboard credentials publicly.", "Share only the public booking-page link with customers."], customer: "Saved business details and branding may update the public booking page." },
    { id: "publicPage", title: "Public Booking Page", intro: "This is the customer-facing link you can share publicly.", steps: ["Open your public URL and test the complete flow.", "Share it through Facebook, Messenger, your website, social media, or an external QR code."], tips: ["Do not share the Client Dashboard URL.", "Active services and availability changes affect what customers see."] },
    { id: "troubleshooting", title: "Troubleshooting", intro: "Quick checks for common issues.", steps: ["Missing service: confirm it is Active and saved.", "Unavailable date: check availability and blocked dates.", "Missing booking: refresh and check the full bookings section.", "Customer access issue: customers must use the public page, never this dashboard."], tips: ["Test changes on the public page.", "Contact your administrator when a saved change still does not appear."] },
  ];
  return topics.filter(Boolean);
}

function ClientHelpContent({ topic }) {
  if (!topic) return null;
  return <><h2>{topic.title}</h2><p>{topic.intro}</p><h3>How to use</h3><ol>{topic.steps.map((step) => <li key={step}>{step}</li>)}</ol><h3>Quick tips</h3><ul>{topic.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>{topic.customer && <div className="clientHelpCustomer"><strong>What customers will see</strong><p>{topic.customer}</p></div>}</>;
}

const clientRecordsManualSections = [
  {
    id: "overview",
    title: "1. What is Client Records ✦?",
    body: [
      "Client Records ✦ is a custom Slotwise add-on for The Facial Unlimited PH. It helps authorized staff manage client profiles, service visits, payments, balances, notes, and reservation history in one place.",
      "Client Records is separate from the normal Slotwise booking system. A customer does not need to create an online booking before they can exist in Client Records.",
    ],
    bullets: ["Create and manage client profiles", "Assign clients to a branch", "Record every completed service or visit", "Track service charges, payments, and balances", "Add notes for each client visit", "View a client's reservation history", "Create reservations for existing clients", "Search clients by name, phone, or email", "Filter records by branch"],
  },
  {
    id: "add-client",
    title: "2. How to Add a New Client",
    steps: ["Open the Client Dashboard.", "Click Clients ✦ from the left-side navigation.", "Click Add Client.", "Enter the client's full name, contact number, email if available, assigned branch, and general notes if needed.", "Review the information.", "Click Add Client or Save Client, depending on the current button label.", "Wait for the success confirmation."],
    callout: "Search by name, phone number, or email first. Do not create another client record if the same customer already exists.",
    fields: [["Full Name", "Enter the client's complete name."], ["Contact Number", "Enter the client's active mobile/contact number."], ["Email", "Enter the client's email address if available."], ["Assigned Branch", "Select Pateros, Parañaque, Taguig / Lakeshore, or Antipolo as the client's default/home branch."], ["Notes", "Use this for general non-medical client notes if necessary."]],
  },
  {
    id: "find-client",
    title: "3. How to Find an Existing Client",
    body: ["Use the search bar at the top of Clients ✦. You may search by client name, contact number, or email address. You may also use All Branches to filter clients by branch."],
    examples: ["Maria Santos", "09054220203"],
  },
  {
    id: "view-profile",
    title: "4. How to Open a Client Record",
    steps: ["Search or locate the client.", "Click the client card.", "Review the Client Profile."],
    bullets: ["Client Name", "Assigned Branch", "Contact Number", "Email", "Client Since", "Notes", "Service Record", "Reservation History"],
    callout: "The Client Profile is the digital version of the client's physical record folder/card.",
  },
  {
    id: "edit-client",
    title: "5. How to Edit Client Information",
    steps: ["Open the client's profile.", "Click Edit.", "Update the necessary information such as contact number, email, assigned branch, or general notes.", "Click Save Changes."],
    callout: "Editing the client's default branch does not automatically rewrite the branch of their previous service records or reservations.",
  },
  {
    id: "add-service-record",
    title: "6. How to Record a Client Visit / Service",
    body: ["Use Service Record when the client has already received an actual service/treatment. A reservation is not required."],
    bullets: ["Walk-in client", "Returning client", "Client who contacted the branch directly", "Client with an existing reservation", "Client receiving another service on a later date"],
    steps: ["Open the client's profile.", "Click Add Service Record.", "Complete the service record fields.", "Review the service record.", "Click Save Service Record."],
    fields: [["Service Date", "The actual date the client received the service."], ["Session Number", "The session or visit number for this service record, such as #1, #2, or #3."], ["Service / Treatment", "Select or enter the actual service performed."], ["Branch", "Select the branch where the service was actually performed. This can be different from the client's default branch."], ["Service Charge", "Enter the full amount charged for the service, such as ₱2,000."], ["Amount Paid", "Enter the amount already paid, such as ₱1,500."], ["Balance", "Slotwise calculates/displays the remaining balance, such as ₱500."], ["Notes", "Add useful visit notes when needed."]],
  },
  {
    id: "understand-service-records",
    title: "7. What is a Service Record?",
    body: ["A Service Record represents an actual completed client visit/service. Each visit creates a separate entry."],
    examples: ["September 10, 2026 • Session #1 • Facial Treatment", "September 17, 2026 • Session #2 • Pro White", "September 24, 2026 • Session #3 • Hydra"],
    callout: "Do not overwrite the previous service record when the client returns. Always add a new Service Record for a new visit.",
  },
  {
    id: "edit-service-record",
    title: "8. How to Edit a Service Record",
    steps: ["Open the client's profile.", "Go to Service Record.", "Locate the visit that needs correction.", "Click Edit.", "Update the necessary fields such as service date, session number, service, branch, service charge, amount paid, or notes.", "Save changes."],
    callout: "Only edit a past record when correcting actual information. Do not reuse an existing record for a new visit.",
  },
  {
    id: "create-reservation",
    title: "9. How to Create a Reservation for an Existing Client",
    body: ["The Facial Unlimited PH is using Slotwise Pro, so authorized users can manually create a reservation from the dashboard."],
    steps: ["Open Clients ✦.", "Open the client's profile.", "Click Create Reservation.", "Confirm that the selected client is already pre-filled.", "Select branch, service, date, time, and other supported reservation details.", "Review the reservation.", "Save/Create Reservation."],
    callout: "The reservation will appear in the normal Slotwise reservation/booking system and Reservation History.",
  },
  {
    id: "difference",
    title: "10. Service Record vs Reservation",
    comparison: [["Service Record", "Use when the service has actually been performed. It records actual client service history, such as a completed facial treatment, walk-in service, or returning client visit."], ["Reservation", "Use when the client has an upcoming or scheduled appointment. It helps manage the client's schedule."]],
    callout: "A client may have Service Records without a reservation, Reservations without a completed Service Record yet, or both. Do not treat them as the same thing.",
  },
  {
    id: "branches",
    title: "11. How Branch Assignment Works",
    comparison: [["Client Default Branch", "The main/default branch assigned to the client."], ["Service Record Branch", "The branch where the actual service was performed."], ["Reservation Branch", "The branch where the appointment is scheduled."]],
    examples: ["Maria Santos • Default Branch: Pateros • Service Visit: Antipolo"],
    callout: "These values may be different if the authorized user's branch permissions allow it.",
  },
  {
    id: "delete-client",
    title: "12. Removing a Client Record",
    steps: ["Open the Client Profile.", "Open the appropriate actions menu or Delete option.", "Review the confirmation.", "Confirm only if the client record should genuinely be removed."],
    callout: "Do not delete a client just because they have no upcoming reservation. Client Records are intended to preserve client/service history.",
  },
  {
    id: "examples",
    title: "13. Common Examples",
    workflows: [["New Walk-in Client", ["Open Clients ✦.", "Click Add Client.", "Enter client information.", "Save.", "Open Client Profile.", "Click Add Service Record.", "Record the service performed.", "Save."]], ["Returning Client", ["Search existing client.", "Open profile.", "Click Add Service Record.", "Enter the new visit/service.", "Save. Do not create a new client profile."]], ["Client Calls for Future Appointment", ["Search existing client.", "Open profile.", "Click Create Reservation.", "Choose service/date/time.", "Save reservation.", "After the client completes the treatment, open the Client Profile and add the actual visit as a Service Record."]], ["Online Booking Customer", ["Customer submits through the Slotwise booking page.", "Reservation appears in dashboard.", "Staff manages reservation normally.", "After treatment is completed, staff may add the actual visit to Client Service Records if appropriate."]]],
  },
  {
    id: "notes",
    title: "14. Important Reminders",
    bullets: ["Always search before creating a new client to avoid duplicates.", "Add a new Service Record for every new visit.", "Do not overwrite an old service record to represent a new visit.", "Reservation means scheduled appointment.", "Service Record means actual completed service.", "Select the correct branch for every visit.", "Review service charges and payment amounts before saving.", "Keep login credentials private.", "Client Records ✦ is a custom business feature for authorized users.", "Records are stored in Slotwise/Supabase and should not be treated as temporary browser data."],
  },
];

function ClientRecordsManual() {
  const quickLinks = [
    ["Overview", "overview"],
    ["Add Client", "add-client"],
    ["Service Records", "add-service-record"],
    ["Reservations", "create-reservation"],
    ["Branches", "branches"],
    ["Common Workflows", "examples"],
  ];
  return (
    <div className="clientRecordsManual">
      <header className="clientRecordsManualHeader">
        <p className="eyebrow">Client Records <span className="customAddonMark" title="Custom Add-on" aria-label="Custom Add-on">✦</span></p>
        <h2>Step-by-Step Guide</h2>
        <p>Use this guide to manage client profiles, service visits, and reservations inside your Slotwise Client Records add-on.</p>
      </header>
      <nav className="clientRecordsManualNav" aria-label="Client Records guide quick navigation">
        {quickLinks.map(([label, id]) => <a href={`#client-records-guide-${id}`} key={id}>{label}</a>)}
      </nav>
      <div className="clientRecordsManualSections">
        {clientRecordsManualSections.map((section) => (
          <section className="clientRecordsManualSection" id={`client-records-guide-${section.id}`} key={section.id}>
            <h3>{section.title}</h3>
            {section.body?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.steps && <ol className="clientRecordsSteps">{section.steps.map((step) => <li key={step}>{step}</li>)}</ol>}
            {section.fields && <div className="clientRecordsFieldGrid">{section.fields.map(([label, description]) => <div key={label}><strong>{label}</strong><span>{description}</span></div>)}</div>}
            {section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}
            {section.examples && <div className="clientRecordsExamples">{section.examples.map((example) => <span key={example}>{example}</span>)}</div>}
            {section.comparison && <div className="clientRecordsComparison">{section.comparison.map(([label, description]) => <article key={label}><strong>{label}</strong><p>{description}</p></article>)}</div>}
            {section.workflows && <div className="clientRecordsWorkflows">{section.workflows.map(([label, steps]) => <article key={label}><strong>{label}</strong><ol>{steps.map((step) => <li key={step}>{step}</li>)}</ol></article>)}</div>}
            {section.callout && <div className="clientRecordsManualCallout"><Info size={16} /><p>{section.callout}</p></div>}
          </section>
        ))}
      </div>
    </div>
  );
}

function ClientDashboard({
  initialView,
  onBack,
  onUpdateBookingStatus,
  onDeleteBooking,
  onCreateManualReservation,
  onUpsertClientRecord,
  onDeleteClientRecord,
  onUpsertClientServiceRecord,
  onUpsertInquiry,
  onConvertInquiryToBooking,
  onSaveService,
  onDeleteService,
  onSaveAvailability,
  onSaveBusinessProfile,
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
  const [clientInquiries, setClientInquiries] = useState([]);
  const [clientRecords, setClientRecords] = useState([]);
  const [clientServiceRecords, setClientServiceRecords] = useState([]);
  const [clientServices, setClientServices] = useState([]);
  const [clientAvailability, setClientAvailability] = useState({ ...defaultAvailability });
  const [blockedDates, setBlockedDates] = useState([]);
  const [paymentSettings, setPaymentSettings] = useState({ enabled: false, requirement_type: "NO_PAYMENT_REQUIRED", deposit_type: "FIXED_AMOUNT", deposit_value: 0 });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bookingPayments, setBookingPayments] = useState([]);
  const [activeTab, setActiveTab] = useState(initialView === "login" ? "dashboard" : "dashboard");
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpSearch, setHelpSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("All");
  const [inquirySourceFilter, setInquirySourceFilter] = useState("All");
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [clientRecordSearch, setClientRecordSearch] = useState("");
  const [clientRecordBranchFilter, setClientRecordBranchFilter] = useState("All Branches");
  const [selectedClientRecord, setSelectedClientRecord] = useState(null);
  const [calendarFilter, setCalendarFilter] = useState("All");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getTodayDateValue());
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [pdfMessage, setPdfMessage] = useState("");
  const [slotwiseUpdates, setSlotwiseUpdates] = useState([]);
  const [slotwiseUpdateRead, setSlotwiseUpdateRead] = useState(null);
  const emptyServiceForm = { id: "", name: "", serviceCategory: "", description: "", price: "", durationMinutes: 60, displayOrder: 0, status: "Active", pricingType: "FIXED", pricingUnit: "FLAT", pricingTiers: [], departureDates: [], imageUrl: "", imageTitle: "", imageCaption: "" };
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [clientServiceEntries, setClientServiceEntries] = useState(emptyStructuredServices());
  const [availabilityForm, setAvailabilityForm] = useState({ days: defaultAvailability.days, hours: defaultAvailability.hours, slotsText: slots.join(", ") });
  const [profileForm, setProfileForm] = useState({ businessName: "", description: "", phone: "", mobileNumbers: "", primaryEmail: "", additionalEmails: "", website: "", messengerLink: "", logo: "", primaryColor: "#b68a2c", accentColor: "#f6e8ba" });
  const [blockedDateForm, setBlockedDateForm] = useState({ blockedDate: "", reason: "" });
  const [paymentMethodForm, setPaymentMethodForm] = useState({ method_type: "GCASH", method_name: "GCash", account_name: "", account_number: "", instructions: "", active: true });
  const [serviceImageUploading, setServiceImageUploading] = useState(false);
  const emptyManualReservationForm = {
    customerMode: "new",
    existingCustomerKey: "",
    customer: "",
    contact: "",
    email: "",
    address: "",
    serviceId: "",
    serviceName: "",
    branch: "",
    date: getTodayDateValue(),
    time: "",
    propertyType: "House",
    areaSize: "",
    serviceArea: "Metro Manila / NCR",
    serviceLocation: "",
    notes: "",
    internalNotes: "",
  };
  const [manualReservationOpen, setManualReservationOpen] = useState(false);
  const [manualReservationForm, setManualReservationForm] = useState(emptyManualReservationForm);
  const emptyInquiryForm = {
    id: "",
    customerName: "",
    phone: "",
    email: "",
    eventDate: getTodayDateValue(),
    eventTime: "",
    eventLocation: "",
    eventType: "",
    message: "",
    internalNotes: "",
    status: "NEW",
    source: "Manual",
    serviceIds: [],
  };
  const [inquiryFormOpen, setInquiryFormOpen] = useState(false);
  const [inquiryForm, setInquiryForm] = useState(emptyInquiryForm);
  const emptyClientRecordForm = { id: "", fullName: "", contactNumber: "", email: "", assignedBranch: "", notes: "" };
  const [clientRecordForm, setClientRecordForm] = useState(emptyClientRecordForm);
  const [clientRecordModalOpen, setClientRecordModalOpen] = useState(false);
  const emptyClientServiceRecordForm = { id: "", clientRecordId: "", serviceDate: getTodayDateValue(), sessionNumber: 1, branch: "", reservationId: "", serviceId: "", serviceName: "", serviceCharge: "", amountPaid: "", notes: "", signatureReference: "" };
  const [clientServiceRecordForm, setClientServiceRecordForm] = useState(emptyClientServiceRecordForm);
  const [clientServiceRecordModalOpen, setClientServiceRecordModalOpen] = useState(false);
  const clientServiceSavePending = useRef(false);

  const loadSlotwiseUpdateState = async (session, businessSlug) => {
    const [updates, readRows] = await Promise.all([
      supabaseRequest("slotwise_updates", {
        query: "?select=*&is_published=eq.true&order=published_at.desc",
        accessToken: session.access_token,
      }).catch(() => []),
      supabaseRequest("slotwise_update_reads", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(businessSlug)}&user_id=eq.${encodeURIComponent(session.user.id)}`,
        accessToken: session.access_token,
      }).catch(() => []),
    ]);
    setSlotwiseUpdates(updates || []);
    setSlotwiseUpdateRead(readRows?.[0] || null);
  };

  const loadClientData = async (session) => {
    const mappings = await supabaseRequest("business_users", {
      query: "?select=*&active=eq.true",
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
    const hasClientRecordsAddon = getPackageCapabilities(businessRow?.business_package, businessRow?.feature_flags || {}).clientRecords;
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
    const inquiryRows = await supabaseRequest("inquiries", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(chosenSlug)}&order=created_at.desc`,
      accessToken: session.access_token,
    }).catch(() => []);
    const inquiryItemRows = await supabaseRequest("inquiry_items", {
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
    const clientRecordRows = hasClientRecordsAddon ? await supabaseRequest("client_records", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(chosenSlug)}&order=created_at.desc`,
      accessToken: session.access_token,
    }).catch(() => []) : [];
    const clientServiceRecordRows = hasClientRecordsAddon ? await supabaseRequest("client_service_records", {
      query: `?select=*&business_slug=eq.${encodeURIComponent(chosenSlug)}&order=service_date.desc,session_number.desc,created_at.desc`,
      accessToken: session.access_token,
    }).catch(() => []) : [];
    const normalizedAvailability = {
      days: availabilityRow?.open_days || (businessRow?.booking_template === "AIRCON_SERVICES" ? "" : defaultAvailability.days),
      hours: availabilityRow?.open_hours || (businessRow?.booking_template === "AIRCON_SERVICES" ? "" : defaultAvailability.hours),
      slots: Array.isArray(availabilityRow?.slots) ? availabilityRow.slots : businessRow?.booking_template === "AIRCON_SERVICES" ? [] : slots,
      blockedDates: blockedDateRows || [],
    };

    setBusinessUsers(mappings);
    setSelectedBusinessSlug(chosenSlug);
    const normalizedClientBusiness = normalizeBusinessConfig(normalizeDatabaseBusiness(businessRow, serviceRows, {
      ...(availabilityRow || {}),
      blocked_dates: blockedDateRows || [],
    }, paymentSettingsRow || null, paymentMethodRows || []));
    setClientBusiness(normalizedClientBusiness);
    setProfileForm({
      businessName: normalizedClientBusiness.business || "",
      description: normalizedClientBusiness.description || "",
      phone: normalizedClientBusiness.phone || "",
      mobileNumbers: normalizedClientBusiness.mobileNumbers || "",
      primaryEmail: normalizedClientBusiness.primaryEmail || "",
      additionalEmails: normalizedClientBusiness.additionalEmails || "",
      website: normalizedClientBusiness.website || "",
      messengerLink: normalizedClientBusiness.messengerLink || "",
      logo: normalizedClientBusiness.logo || "",
      primaryColor: normalizedClientBusiness.primaryColor || "#b68a2c",
      accentColor: normalizedClientBusiness.accentColor || "#f6e8ba",
    });
    const visibleServiceRows = filterLegacyToursSeedRows(serviceRows || [], businessRow?.booking_template);
    setClientBookings(attachBookingItems(bookingRows || [], bookingItemRows || []));
    setClientInquiries(attachInquiryItems(inquiryRows || [], inquiryItemRows || []));
    setClientRecords(clientRecordRows || []);
    setClientServiceRecords(clientServiceRecordRows || []);
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
    if (!hasClientRecordsAddon) {
      setSelectedClientRecord(null);
      setClientServiceRecordModalOpen(false);
    }
    setSelectedInquiry(null);
    await loadSlotwiseUpdateState(session, chosenSlug);
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
    setClientInquiries([]);
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
      const hasClientRecordsAddon = getPackageCapabilities(businessRow?.business_package, businessRow?.feature_flags || {}).clientRecords;
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
      const inquiryRows = await supabaseRequest("inquiries", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&order=created_at.desc`,
        accessToken: clientSession.access_token,
      }).catch(() => []);
      const inquiryItemRows = await supabaseRequest("inquiry_items", {
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
      const clientRecordRows = hasClientRecordsAddon ? await supabaseRequest("client_records", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&order=created_at.desc`,
        accessToken: clientSession.access_token,
      }).catch(() => []) : [];
      const clientServiceRecordRows = hasClientRecordsAddon ? await supabaseRequest("client_service_records", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&order=service_date.desc,session_number.desc,created_at.desc`,
        accessToken: clientSession.access_token,
      }).catch(() => []) : [];
      const dismissalRows = await supabaseRequest("announcement_dismissals", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(nextSlug)}&user_id=eq.${encodeURIComponent(clientSession.user.id)}&order=dismissed_at.desc`,
        accessToken: clientSession.access_token,
      }).catch(() => []);
      const normalizedAvailability = {
        days: availabilityRow?.open_days || (businessRow?.booking_template === "AIRCON_SERVICES" ? "" : defaultAvailability.days),
        hours: availabilityRow?.open_hours || (businessRow?.booking_template === "AIRCON_SERVICES" ? "" : defaultAvailability.hours),
        slots: Array.isArray(availabilityRow?.slots) ? availabilityRow.slots : businessRow?.booking_template === "AIRCON_SERVICES" ? [] : slots,
        blockedDates: blockedDateRows || [],
      };
      setClientBusiness(normalizeBusinessConfig(normalizeDatabaseBusiness(businessRow, serviceRows, {
        ...(availabilityRow || {}),
        blocked_dates: blockedDateRows || [],
      }, paymentSettingsRow || null, paymentMethodRows || [])));
      const visibleServiceRows = filterLegacyToursSeedRows(serviceRows || [], businessRow?.booking_template);
      setClientBookings(attachBookingItems(bookingRows || [], bookingItemRows || []));
      setClientInquiries(attachInquiryItems(inquiryRows || [], inquiryItemRows || []));
      setClientRecords(clientRecordRows || []);
      setClientServiceRecords(clientServiceRecordRows || []);
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
      await loadSlotwiseUpdateState(clientSession, nextSlug);
      setSelectedBooking(null);
      setSelectedInquiry(null);
      setSelectedClientRecord(null);
      setClientServiceRecordModalOpen(false);
    }
  };

  const updateStatus = async (booking, nextStatus) => {
    setStatusMessage("");
    try {
      await onUpdateBookingStatus(booking.id, nextStatus, clientSession?.access_token);
      await loadClientData(clientSession);
      setStatusMessage("Booking status updated.");
    } catch (error) {
      console.error("Client booking status update failed", error);
      setStatusMessage("Unable to save changes. Please try again.");
    }
  };

  const deleteBooking = async (booking) => {
    if (!booking?.id || !window.confirm("Delete this booking/request?\n\nThis action cannot be undone.")) return;
    setStatusMessage("Deleting booking...");
    try {
      await onDeleteBooking(booking.id, clientSession?.access_token);
      setSelectedBooking(null);
      await loadClientData(clientSession);
      setStatusMessage("Booking deleted.");
    } catch (error) {
      console.error("Client booking delete failed", { operation: "delete booking", table: "bookings", code: error.code, message: error.message });
      setStatusMessage("Unable to delete booking. Please try again.");
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
      departureDates: normalizeDepartureDates(service.departures || service.pricing_tiers),
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
        setStatusMessage("Service name required before this can be published.");
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
        service_departures: isClientToursTravel ? getSavableDepartureDates(serviceForm.departureDates) : [],
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
      if (!confirmedService || !serviceRowConfirmsPersistence(confirmedService, {
        name: payload.service_name,
        status: payload.service_status,
        departureDates: payload.service_departures,
      })) {
        throw new Error(isClientToursTravel ? "Service details saved, but departure dates/rates did not persist." : "Service save could not be confirmed from the database.");
      }
      const refreshedServiceRows = await supabaseRequest("business_services", {
        query: `?select=*&business_slug=eq.${encodeURIComponent(selectedBusinessSlug)}&order=display_order.asc`,
        accessToken: clientSession?.access_token,
      });
      const nextServices = filterLegacyToursSeedRows(refreshedServiceRows || [], clientBusiness?.bookingTemplate);
      setClientServices(nextServices);
      setClientServiceEntries(normalizeStructuredServices(nextServices.map(serviceRowToStructured)));
      setClientBusiness((current) => normalizeBusinessConfig({
        ...current,
        serviceDetails: nextServices.map((service) => ({
          name: service.name,
          durationMinutes: service.duration_minutes,
          price: service.price,
          pricingType: service.pricing_type,
          pricingUnit: service.pricing_unit,
          pricingTiers: service.pricing_tiers,
          departureDates: service.departures,
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
          setStatusMessage(`Service name required before this can be published.`);
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
          service_pricing_tiers: isClientToursTravel
            ? service.pricingTiers
            : isClientConsultant ? service.pricingTiers : [],
          service_departures: isClientToursTravel ? service.departureDates : [],
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
        return !confirmed || !serviceRowConfirmsPersistence(confirmed, service);
      });
      if (unconfirmedService) {
        throw new Error(isClientToursTravel
          ? `Service details saved, but departure dates/rates did not persist: ${unconfirmedService.name}.`
          : `Service save could not be confirmed from the database: ${unconfirmedService.name}.`);
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
          service_departures: oldService.departures || [],
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

  const submitBusinessProfile = async (event) => {
    event.preventDefault();
    setStatusMessage("Saving business details...");
    try {
      await onSaveBusinessProfile({
        target_slug: selectedBusinessSlug,
        business_name_value: profileForm.businessName,
        description_value: profileForm.description,
        phone_value: profileForm.phone,
        mobile_numbers_value: profileForm.mobileNumbers,
        primary_email_value: profileForm.primaryEmail,
        additional_emails_value: profileForm.additionalEmails,
        website_value: profileForm.website,
        messenger_link_value: profileForm.messengerLink,
        logo_url_value: profileForm.logo,
        primary_color_value: profileForm.primaryColor,
        accent_color_value: profileForm.accentColor,
      }, clientSession?.access_token);
      await loadClientData(clientSession);
      setStatusMessage("Business details saved.");
    } catch (error) {
      setStatusMessage(error.message || "Business details could not be saved.");
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
        require_proof_value: Boolean(paymentSettings.require_proof),
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

  const openPaymentProof = async (payment) => {
    try {
      const url = await supabasePrivateStorageSignedUrl(payment.proof_storage_path, clientSession?.access_token);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      setStatusMessage(error.message || "Payment proof could not be opened.");
    }
  };

  const openInquiryForm = (inquiry = null) => {
    if (inquiry) {
      setInquiryForm({
        id: inquiry.id || "",
        customerName: inquiry.customer_name || "",
        phone: inquiry.phone || "",
        email: inquiry.email || "",
        eventDate: inquiry.event_date || getTodayDateValue(),
        eventTime: inquiry.event_time || "",
        eventLocation: inquiry.event_location || "",
        eventType: inquiry.event_type || "",
        message: inquiry.message || "",
        internalNotes: inquiry.internal_notes || "",
        status: normalizeInquiryStatusValue(inquiry.status),
        source: inquiry.source || "Manual",
        serviceIds: (inquiry.inquiry_items || []).map((item) => item.service_id).filter(Boolean),
      });
    } else {
      setInquiryForm(emptyInquiryForm);
    }
    setInquiryFormOpen(true);
  };

  const submitInquiry = async (event) => {
    event.preventDefault();
    if (!inquiryForm.customerName.trim() || !inquiryForm.phone.trim()) {
      setStatusMessage("Please enter the customer name and phone number.");
      return;
    }
    const selectedServices = inquiryForm.serviceIds
      .map((serviceId) => availableManualServices.find((service) => service.id === serviceId))
      .filter(Boolean);
    const itemPayload = selectedServices.map((service, index) => ({
      id: `${inquiryForm.id || `INQ-${Date.now().toString().slice(-8)}`}-item-${index + 1}`,
      service_id: service.id,
      item_name: service.name,
      quantity: 1,
    }));
    setStatusMessage("Saving inquiry...");
    try {
      await onUpsertInquiry({
        inquiry_payload: {
          id: inquiryForm.id || `INQ-${Date.now().toString().slice(-8)}`,
          business_slug: selectedBusinessSlug,
          customer_name: inquiryForm.customerName.trim(),
          phone: inquiryForm.phone.trim(),
          email: inquiryForm.email.trim(),
          event_date: inquiryForm.eventDate,
          event_time: inquiryForm.eventTime.trim(),
          event_location: inquiryForm.eventLocation.trim(),
          event_type: inquiryForm.eventType.trim(),
          service_interest: selectedServices.map((service) => service.name).join(", "),
          message: inquiryForm.message.trim(),
          internal_notes: inquiryForm.internalNotes.trim(),
          status: normalizeInquiryStatusValue(inquiryForm.status),
          source: inquiryForm.source,
        },
        items_payload: itemPayload,
      }, clientSession?.access_token);
      setInquiryFormOpen(false);
      setInquiryForm(emptyInquiryForm);
      await loadClientData(clientSession);
      setStatusMessage("Inquiry saved.");
    } catch (error) {
      console.error("Inquiry save failed", error);
      setStatusMessage(error.message || "Unable to save inquiry.");
    }
  };

  const updateInquiryStatus = async (inquiry, nextStatus) => {
    setStatusMessage("Saving inquiry status...");
    try {
      await onUpsertInquiry({
        inquiry_payload: {
          ...inquiry,
          status: normalizeInquiryStatusValue(nextStatus),
        },
        items_payload: (inquiry.inquiry_items || []).map((item) => ({
          id: item.id,
          service_id: item.service_id,
          item_name: item.item_name,
          quantity: item.quantity || 1,
        })),
      }, clientSession?.access_token);
      await loadClientData(clientSession);
      setSelectedInquiry((current) => current?.id === inquiry.id ? { ...current, status: normalizeInquiryStatusValue(nextStatus) } : current);
      setStatusMessage("Inquiry status updated.");
    } catch (error) {
      console.error("Inquiry status update failed", error);
      setStatusMessage(error.message || "Unable to update inquiry.");
    }
  };

  const convertInquiry = async (inquiry) => {
    if (!inquiry?.id || inquiry.booking_id) return;
    const items = inquiry.inquiry_items || [];
    const firstItem = items[0];
    const matchedServices = items.map((item) => availableManualServices.find((service) => service.id === item.service_id || service.name === item.item_name)).filter(Boolean);
    const primaryService = matchedServices[0] || availableManualServices.find((service) => service.name === inquiry.service_interest) || null;
    const bookingId = `SW-INQ-${Date.now().toString().slice(-7)}`;
    const serviceName = getInquiryServiceSummary(inquiry);
    const lineItems = (matchedServices.length ? matchedServices : firstItem ? [{ id: firstItem.service_id, name: firstItem.item_name, price: null }] : []).map((service, index) => {
      const lineTotal = service.price === null || service.price === undefined || service.price === "" ? null : Number(service.price);
      return {
        id: `${bookingId}-item-${index + 1}`,
        service_id: service.id || null,
        service_name_snapshot: service.name || service.item_name || "Service",
        pricing_type_snapshot: normalizePricingType(service.pricing_type || service.pricingType),
        unit_price_snapshot: lineTotal,
        quantity: 1,
        selected_tier_snapshot: null,
        line_total: lineTotal,
      };
    });
    const estimatedTotal = lineItems.length && lineItems.every((item) => item.line_total !== null && item.line_total !== undefined)
      ? lineItems.reduce((sum, item) => sum + Number(item.line_total || 0), 0)
      : null;
    setStatusMessage("Converting inquiry to booking...");
    try {
      await onConvertInquiryToBooking({
        inquiry_id_value: inquiry.id,
        booking_payload: {
          id: bookingId,
          customer: inquiry.customer_name,
          contact: inquiry.phone,
          business: clientBusiness?.business || "",
          business_slug: selectedBusinessSlug,
          service: serviceName,
          booking_date: inquiry.event_date || "",
          slot: inquiry.event_time || "Inquiry only",
          note: inquiry.message || "",
          status: "CONFIRMED",
          estimated_total: estimatedTotal,
          metadata: {
            source: "inquiry",
            source_inquiry_id: inquiry.id,
            customer_email: inquiry.email || "",
            customer_address: inquiry.event_location || "",
            event_location: inquiry.event_location || "",
            event_type: inquiry.event_type || "",
            internal_notes: inquiry.internal_notes || "",
            booking_template: clientBusiness?.bookingTemplate,
          },
        },
        items_payload: lineItems,
      }, clientSession?.access_token);
      await loadClientData(clientSession);
      setSelectedInquiry(null);
      setStatusMessage("Inquiry converted to booking.");
    } catch (error) {
      console.error("Inquiry conversion failed", error);
      setStatusMessage(error.message || "Unable to convert inquiry.");
    }
  };

  const filteredBookings = clientBookings.filter((booking) => {
    const statusMatch = filter === "All" || normalizeBookingStatusValue(booking.status) === normalizeBookingStatusValue(filter);
    const source = String(booking.metadata?.source || "online").toLowerCase();
    const sourceMatch = sourceFilter === "All" || source === sourceFilter.toLowerCase();
    return statusMatch && sourceMatch;
  });
  const filteredInquiries = clientInquiries.filter((inquiry) => {
    const haystack = `${inquiry.customer_name || ""} ${inquiry.phone || ""} ${inquiry.email || ""} ${getInquiryServiceSummary(inquiry)} ${inquiry.event_location || ""}`.toLowerCase();
    const searchMatch = haystack.includes(inquirySearch.trim().toLowerCase());
    const statusMatch = inquiryStatusFilter === "All" || normalizeInquiryStatusValue(inquiry.status) === normalizeInquiryStatusValue(inquiryStatusFilter);
    const sourceMatch = inquirySourceFilter === "All" || String(inquiry.source || "").toLowerCase() === inquirySourceFilter.toLowerCase();
    return searchMatch && statusMatch && sourceMatch;
  });
  const pendingCount = clientBookings.filter((booking) => ["PENDING", "NEW"].includes((booking.status || "").toUpperCase())).length;
  const confirmedCount = clientBookings.filter((booking) => (booking.status || "").toUpperCase() === "CONFIRMED").length;
  const completedCount = clientBookings.filter((booking) => (booking.status || "").toUpperCase() === "COMPLETED").length;
  const cancelledCount = clientBookings.filter((booking) => (booking.status || "").toUpperCase() === "CANCELLED").length;
  const todayCount = clientBookings.filter((booking) => (booking.booking_date || "").startsWith("2026-05-21")).length;
  const newInquiryCount = clientInquiries.filter((inquiry) => normalizeInquiryStatusValue(inquiry.status) === "NEW").length;
  const pendingInquiryCount = clientInquiries.filter((inquiry) => normalizeInquiryStatusValue(inquiry.status) === "PENDING").length;
  const currentRole = businessUsers.find((item) => item.business_slug === selectedBusinessSlug)?.role || "OWNER";
  const capabilities = getPackageCapabilities(clientBusiness?.package, clientBusiness?.featureFlags);
  const visibleSlotwiseUpdates = slotwiseUpdates
    .sort((a, b) => new Date(b.published_at || b.created_at || 0) - new Date(a.published_at || a.created_at || 0));
  const lastUpdatesViewedAt = slotwiseUpdateRead?.last_viewed_at ? new Date(slotwiseUpdateRead.last_viewed_at).getTime() : 0;
  const unreadUpdatesCount = visibleSlotwiseUpdates.filter((update) => new Date(update.published_at || update.created_at || 0).getTime() > lastUpdatesViewedAt).length;
  const smmUpgradeHref = SMM_FACEBOOK_URL;
  const helpTopics = getClientHelpTopics(clientBusiness || {}, capabilities);
  const activeHelpTopic = helpTopics.find((topic) => topic.id === activeTab) || helpTopics[0];
  const filteredHelpTopics = helpTopics.filter((topic) => `${topic.title} ${topic.intro} ${topic.steps.join(" ")} ${topic.tips.join(" ")}`.toLowerCase().includes(helpSearch.trim().toLowerCase()));
  const isClientToursTravel = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "TOURS_TRAVEL";
  const isClientAccommodation = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "STAYCATION_ACCOMMODATION";
  const isClientRealEstate = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "REAL_ESTATE";
  const isClientPestControl = normalizeBookingTemplate(clientBusiness?.bookingTemplate) === "PEST_CONTROL";
  const paymentsByBooking = bookingPayments.reduce((grouped, payment) => {
    grouped[payment.booking_id] = grouped[payment.booking_id] || [];
    grouped[payment.booking_id].push(payment);
    return grouped;
  }, {});
  const selectedBookingPayments = selectedBooking ? paymentsByBooking[selectedBooking.id] || [] : [];
  const latestSelectedPayment = selectedBookingPayments[0];
  const selectedBookingItems = selectedBooking ? getBookingLineItems(selectedBooking) : [];
  const selectedBookingPersistedTotal = selectedBooking?.metadata?.calculated_price
    ?? selectedBooking?.metadata?.pest_estimated_price
    ?? selectedBooking?.metadata?.estimated_price
    ?? selectedBooking?.metadata?.total_price
    ?? selectedBooking?.metadata?.estimated_total
    ?? selectedBooking?.estimated_total
    ?? null;
  const selectedBookingTotal = selectedBookingPersistedTotal ?? (
    selectedBookingItems.length && selectedBookingItems.every((item) => item.lineTotal !== null && item.lineTotal !== undefined)
      ? selectedBookingItems.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0)
      : null
  );
  const selectedPricingStatusValue = String(
    selectedBooking?.metadata?.pest_pricing_status
    || selectedBooking?.metadata?.pricing_status
    || (selectedBookingTotal !== null ? "calculated" : "assessment_required")
  ).toLowerCase();
  const selectedPricingIsCalculated = selectedPricingStatusValue === "calculated" || selectedPricingStatusValue === "fixed" || selectedPricingStatusValue === "confirmed";
  const selectedPricingBasis = selectedBooking?.metadata?.pricing_basis
    || selectedBooking?.metadata?.pest_pricing_formula
    || selectedBooking?.metadata?.pest_pricing_note
    || selectedBooking?.metadata?.pricing_note
    || "";
  const handleDownloadPdf = async ({ record, items = [], total = null, statusLabel, documentType = "booking", payment = null }) => {
    if (!capabilities.downloadBookingPdf || !record) return;
    setPdfMessage("Preparing PDF...");
    try {
      const result = await downloadBookingPdf({
        business: clientBusiness || {},
        booking: record,
        template: record.metadata?.booking_template || clientBusiness?.bookingTemplate || "GENERAL",
        bookingItems: items,
        total,
        pricingStatus: record.metadata?.pricing_status || record.metadata?.pest_pricing_status || "",
        statusLabel,
        payment,
        documentType,
      });
      setPdfMessage(`${result.filename} downloaded.`);
    } catch (error) {
      console.error("Booking PDF generation failed", error);
      setPdfMessage("Could not generate the PDF. Please try again.");
    }
  };
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
  const clientRecordBranches = [
    ...new Set([
      ...(Array.isArray(clientBusiness?.featureFlags?.branches) ? clientBusiness.featureFlags.branches : []),
      ...facialUnlimitedBranches,
      ...clientRecords.map((record) => record.assigned_branch).filter(Boolean),
    ]),
  ];
  const filteredClientRecords = clientRecords.filter((record) => {
    const haystack = `${record.full_name || ""} ${record.contact_number || ""} ${record.email || ""} ${record.assigned_branch || ""}`.toLowerCase();
    const searchMatch = haystack.includes(clientRecordSearch.trim().toLowerCase());
    const branchMatch = clientRecordBranchFilter === "All Branches" || record.assigned_branch === clientRecordBranchFilter;
    return searchMatch && branchMatch;
  });
  const getClientRecordHistory = (record) => clientBookings.filter((booking) => {
    const bookingEmail = String(booking.metadata?.customer_email || booking.metadata?.traveler_email || "").toLowerCase();
    return (
      (record.contact_number && booking.contact === record.contact_number)
      || (record.email && bookingEmail && bookingEmail === record.email.toLowerCase())
      || (record.full_name && booking.customer === record.full_name)
    );
  });
  const getClientServiceRecords = (record) => clientServiceRecords
    .filter((item) => item.client_record_id === record?.id)
    .sort((a, b) => {
      const dateDiff = new Date(b.service_date || b.created_at || 0) - new Date(a.service_date || a.created_at || 0);
      if (dateDiff !== 0) return dateDiff;
      return Number(b.session_number || 0) - Number(a.session_number || 0);
    });
  const getNextClientSessionNumber = (record) => {
    const maxSession = getClientServiceRecords(record).reduce((highest, item) => Math.max(highest, Number(item.session_number || 0)), 0);
    return maxSession + 1;
  };
  const getClientLinkedReservationOptions = (record) => getClientRecordHistory(record).filter((booking) => booking?.id);
  const selectedServiceRecordService = clientServices.find((service) => service.id === clientServiceRecordForm.serviceId) || null;
  const serviceRecordCharge = Number(clientServiceRecordForm.serviceCharge || 0);
  const serviceRecordPaid = Number(clientServiceRecordForm.amountPaid || 0);
  const serviceRecordBalance = serviceRecordCharge - serviceRecordPaid;
  const availableManualServices = clientServices.filter((service) => service.status !== "Inactive");
  const manualSelectedService = availableManualServices.find((service) => service.id === manualReservationForm.serviceId)
    || availableManualServices.find((service) => service.name === manualReservationForm.serviceName)
    || null;
  const manualUsesPreferredSchedule = isBusinessOpen24Hours(clientAvailability);

  useEffect(() => {
    if (activeTab !== "updates" || !clientSession?.access_token || !selectedBusinessSlug || !visibleSlotwiseUpdates.length) return;
    supabaseRpcRequest("mark_slotwise_updates_viewed", { business_slug_value: selectedBusinessSlug }, clientSession.access_token)
      .then(() => setSlotwiseUpdateRead({
        user_id: clientSession.user.id,
        business_slug: selectedBusinessSlug,
        last_viewed_at: new Date().toISOString(),
      }))
      .catch(() => {});
  }, [activeTab, clientSession?.access_token, clientSession?.user?.id, selectedBusinessSlug, visibleSlotwiseUpdates.length]);

  const openManualReservation = () => {
    if (!capabilities.manualReservations) {
      setStatusMessage("Create Reservation is available on the PRO package only.");
      return;
    }
    const firstService = availableManualServices[0];
    setManualReservationForm({
      ...emptyManualReservationForm,
      serviceId: firstService?.id || "",
      serviceName: firstService?.name || "",
      time: manualUsesPreferredSchedule ? "10:00 AM" : (clientAvailability.slots?.[0] || "10:00 AM"),
    });
    setManualReservationOpen(true);
  };

  const openManualReservationForClient = (record) => {
    openManualReservation();
    setManualReservationForm((current) => ({
      ...current,
      customerMode: "existing",
      customer: record.full_name || "",
      contact: record.contact_number || "",
      email: record.email || "",
      address: "",
      branch: record.assigned_branch || "",
    }));
  };

  const editClientRecord = (record = null) => {
    setClientRecordForm(record ? {
      id: record.id || "",
      fullName: record.full_name || "",
      contactNumber: record.contact_number || "",
      email: record.email || "",
      assignedBranch: record.assigned_branch || "",
      notes: record.notes || "",
    } : emptyClientRecordForm);
    setClientRecordModalOpen(true);
  };

  const openClientServiceRecordForm = (record, serviceRecord = null, linkedReservation = null) => {
    const reservationServiceName = linkedReservation ? getBookingServiceSummary(linkedReservation) : "";
    const matchedService = serviceRecord?.service_id
      ? clientServices.find((service) => service.id === serviceRecord.service_id)
      : clientServices.find((service) => service.name === reservationServiceName);
    const sourcePrice = serviceRecord?.service_charge ?? matchedService?.price ?? "";
    setSelectedClientRecord(record);
    setClientServiceRecordForm({
      id: serviceRecord?.id || "",
      clientRecordId: record?.id || "",
      serviceDate: serviceRecord?.service_date || linkedReservation?.booking_date || getTodayDateValue(),
      sessionNumber: serviceRecord?.session_number || getNextClientSessionNumber(record),
      branch: serviceRecord?.branch || linkedReservation?.metadata?.branch || record?.assigned_branch || clientRecordBranches[0] || "",
      reservationId: serviceRecord?.reservation_id || linkedReservation?.id || "",
      serviceId: matchedService?.id || serviceRecord?.service_id || "",
      serviceName: serviceRecord?.service_name_snapshot || matchedService?.name || reservationServiceName || "",
      serviceCharge: sourcePrice === null || sourcePrice === undefined ? "" : sourcePrice,
      amountPaid: serviceRecord?.amount_paid ?? "",
      notes: serviceRecord?.notes || "",
      signatureReference: serviceRecord?.signature_reference || "",
    });
    setClientServiceRecordModalOpen(true);
  };

  const changeClientServiceRecordService = (serviceId) => {
    const service = clientServices.find((item) => item.id === serviceId);
    setClientServiceRecordForm((current) => ({
      ...current,
      serviceId,
      serviceName: service?.name || current.serviceName,
      serviceCharge: service?.price === null || service?.price === undefined ? current.serviceCharge : service.price,
    }));
  };

  const submitClientServiceRecord = async (event) => {
    event.preventDefault();
    if (clientServiceSavePending.current) return;
    if (!capabilities.clientRecords) {
      setStatusMessage("Client Records is not enabled for this business.");
      return;
    }
    if (!selectedClientRecord?.id || !clientServiceRecordForm.serviceDate || !String(clientServiceRecordForm.serviceName).trim() || !String(clientServiceRecordForm.serviceCharge).trim()) {
      setStatusMessage("Please complete the required service record fields.");
      return;
    }
    if (!clientServiceRecordForm.branch) {
      setStatusMessage("Please select the branch for this service record.");
      return;
    }
    const charge = Number(clientServiceRecordForm.serviceCharge);
    const paid = Number(clientServiceRecordForm.amountPaid || 0);
    const session = String(clientServiceRecordForm.sessionNumber ?? "").trim();
    if (!Number.isFinite(charge) || charge < 0 || !Number.isFinite(paid) || paid < 0 || (session && (!Number.isSafeInteger(Number(session)) || Number(session) < 1))) {
      setStatusMessage("Enter valid non-negative amounts and a whole session number greater than zero.");
      return;
    }
    if (clientServiceRecordForm.clientRecordId !== selectedClientRecord.id) {
      setStatusMessage("Please reopen the service record from the correct client profile.");
      return;
    }
    clientServiceSavePending.current = true;
    setStatusMessage("Saving service record...");
    try {
      const storedSession = getStoredClientSession();
      if (storedSession?.user?.id !== clientSession?.user?.id) {
        throw Object.assign(new Error("The signed-in account changed. Please sign in again."), { code: "CLIENT_SESSION_MISMATCH" });
      }
      const saveSession = await refreshClientSessionForSave(storedSession, (refreshToken) =>
        supabaseAuthRequest("token?grant_type=refresh_token", { refresh_token: refreshToken }));
      storeClientSession(saveSession);
      setClientSession(saveSession);
      await onUpsertClientServiceRecord({
        service_record_id: clientServiceRecordForm.id || `CSR-${crypto.randomUUID()}`,
        business_slug_value: selectedBusinessSlug,
        client_record_id_value: selectedClientRecord.id,
        branch_value: clientServiceRecordForm.branch,
        reservation_id_value: clientServiceRecordForm.reservationId || null,
        service_date_value: clientServiceRecordForm.serviceDate,
        session_number_value: session ? Number(session) : null,
        service_id_value: clientServiceRecordForm.serviceId || null,
        service_name_snapshot_value: clientServiceRecordForm.serviceName.trim(),
        service_charge_value: charge,
        amount_paid_value: paid,
        notes_value: clientServiceRecordForm.notes.trim(),
        signature_reference_value: clientServiceRecordForm.signatureReference.trim(),
      }, saveSession.access_token);
      setClientServiceRecordModalOpen(false);
      setClientServiceRecordForm(emptyClientServiceRecordForm);
      await loadClientData(saveSession);
      setStatusMessage("Service record saved.");
    } catch (error) {
      console.error("Client service record save failed", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        auth_user_id: clientSession?.user?.id || null,
        operation: clientServiceRecordForm.id ? "UPDATE" : "INSERT",
        membership: businessUsers.filter((item) => item.business_slug === selectedBusinessSlug && item.user_id === clientSession?.user?.id).map((item) => ({ role: item.role, active: item.active, authorized_branches: item.authorized_branches })),
        client_records_entitlement: capabilities.clientRecords,
        service_record_id: clientServiceRecordForm.id || null,
        client_record_id: selectedClientRecord.id,
        business_slug: selectedBusinessSlug,
        branch: clientServiceRecordForm.branch,
      });
      setStatusMessage("Unable to save service record. Please try again.");
    } finally {
      clientServiceSavePending.current = false;
    }
  };

  const submitClientRecord = async (event) => {
    event.preventDefault();
    if (!capabilities.clientRecords) {
      setStatusMessage("Client Records is not enabled for this business.");
      return;
    }
    if (!clientRecordForm.fullName.trim() || !clientRecordForm.contactNumber.trim() || !clientRecordForm.assignedBranch.trim()) {
      setStatusMessage("Please enter the client name, contact number, and branch.");
      return;
    }
    setStatusMessage("Saving client...");
    try {
      await onUpsertClientRecord({
        client_record_id: clientRecordForm.id || `CR-${Date.now().toString().slice(-8)}`,
        business_slug_value: selectedBusinessSlug,
        full_name_value: clientRecordForm.fullName.trim(),
        contact_number_value: clientRecordForm.contactNumber.trim(),
        email_value: clientRecordForm.email.trim(),
        assigned_branch_value: clientRecordForm.assignedBranch.trim(),
        notes_value: clientRecordForm.notes.trim(),
      }, clientSession?.access_token);
      setClientRecordForm(emptyClientRecordForm);
      setClientRecordModalOpen(false);
      await loadClientData(clientSession);
      setStatusMessage(clientRecordForm.id ? "Client updated successfully." : "Client added successfully.");
    } catch (error) {
      console.error("Client record save failed", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        business_slug: selectedBusinessSlug,
        assigned_branch: clientRecordForm.assignedBranch,
      });
      setStatusMessage(`Unable to save client record: ${error.message}`);
    }
  };

  const deleteClientRecord = async (record) => {
    if (!record?.id || !window.confirm("Delete this client record?\n\nReservation history will not be deleted.")) return;
    setStatusMessage("Deleting client...");
    try {
      await onDeleteClientRecord(record.id, clientSession?.access_token);
      setSelectedClientRecord(null);
      await loadClientData(clientSession);
      setStatusMessage("Client record deleted.");
    } catch (error) {
      console.error("Client record delete failed", error);
      setStatusMessage("Unable to delete client record. Please try again.");
    }
  };

  const selectManualCustomer = (customerKey) => {
    if (capabilities.clientRecords) {
      const record = clientRecords.find((client) => client.id === customerKey);
      setManualReservationForm((current) => ({
        ...current,
        existingCustomerKey: customerKey,
        customer: record?.full_name || current.customer,
        contact: record?.contact_number || current.contact,
        email: record?.email || current.email,
        branch: record?.assigned_branch || current.branch,
      }));
      return;
    }
    const existing = customers.find((customer) => `${customer.customer || "Customer"}-${customer.contact || ""}` === customerKey);
    setManualReservationForm((current) => ({
      ...current,
      existingCustomerKey: customerKey,
      customer: existing?.customer || current.customer,
      contact: existing?.contact || current.contact,
      email: existing?.history?.find((booking) => booking.metadata?.customer_email)?.metadata?.customer_email || current.email,
      address: existing?.history?.find((booking) => booking.metadata?.customer_address)?.metadata?.customer_address || current.address,
    }));
  };

  const submitManualReservation = async (event) => {
    event.preventDefault();
    setStatusMessage("");
    if (!capabilities.manualReservations) {
      setStatusMessage("Create Reservation is available on the PRO package only.");
      return;
    }
    const serviceName = manualSelectedService?.name || manualReservationForm.serviceName.trim();
    const selectedDate = manualReservationForm.date;
    const selectedTime = manualReservationForm.time.trim();
    if (!manualReservationForm.customer.trim() || !manualReservationForm.contact.trim() || !serviceName || !selectedDate || !selectedTime) {
      setStatusMessage("Please complete the required reservation details.");
      return;
    }
    if (capabilities.clientRecords && !manualReservationForm.branch) {
      setStatusMessage("Please select the reservation branch.");
      return;
    }
    if (isPastPreferredSchedule(selectedDate, selectedTime)) {
      setStatusMessage("Please choose a future reservation date and time.");
      return;
    }
    if (blockedDates.some((blockedDate) => blockedDate.blocked_date === selectedDate)) {
      setStatusMessage("That date is blocked. Please choose another schedule.");
      return;
    }
    const servicePrice = manualSelectedService?.price;
    const lineTotal = servicePrice === null || servicePrice === undefined || servicePrice === "" ? null : Number(servicePrice);
    const bookingId = `SW-MANUAL-${Date.now().toString().slice(-7)}`;
    const metadata = {
      booking_template: clientBusiness?.bookingTemplate,
      source: "manual",
      created_from: "client_dashboard",
      internal_notes: manualReservationForm.internalNotes.trim(),
      customer_email: manualReservationForm.email.trim(),
      customer_address: manualReservationForm.address.trim(),
      branch: manualReservationForm.branch || "",
      assigned_branch: manualReservationForm.branch || "",
      property_type: isClientPestControl ? manualReservationForm.propertyType : undefined,
      service_area: isClientPestControl ? manualReservationForm.serviceArea : undefined,
      service_location: isClientPestControl ? manualReservationForm.serviceLocation.trim() : undefined,
      pest_concern: isClientPestControl ? serviceName : undefined,
      area_sqm: isClientPestControl && manualReservationForm.areaSize ? Number(manualReservationForm.areaSize) : undefined,
      manual_reservation: true,
    };
    const bookingPayload = {
      id: bookingId,
      customer: manualReservationForm.customer.trim(),
      contact: manualReservationForm.contact.trim(),
      business: clientBusiness?.business || "",
      business_slug: clientBusiness?.slug || selectedBusinessSlug,
      service: serviceName,
      booking_date: selectedDate,
      slot: selectedTime,
      note: manualReservationForm.notes.trim(),
      status: "CONFIRMED",
      estimated_total: lineTotal,
      metadata,
    };
    const itemPayload = [{
      id: `${bookingId}-item-1`,
      service_id: manualSelectedService?.id || null,
      service_name_snapshot: serviceName,
      pricing_type_snapshot: normalizePricingType(manualSelectedService?.pricing_type || manualSelectedService?.pricingType, manualSelectedService?.pricing_unit || manualSelectedService?.pricingUnit),
      unit_price_snapshot: lineTotal,
      quantity: 1,
      selected_tier_snapshot: null,
      line_total: lineTotal,
    }];
    setStatusMessage("Creating reservation...");
    try {
      await onCreateManualReservation({
        booking_payload: bookingPayload,
        items_payload: itemPayload,
      }, clientSession?.access_token);
      setManualReservationOpen(false);
      setManualReservationForm(emptyManualReservationForm);
      await loadClientData(clientSession);
      setStatusMessage("Reservation created successfully.");
    } catch (error) {
      console.error("Manual reservation create failed", error);
      setStatusMessage("Unable to create reservation. Please try again.");
    }
  };

  useEffect(() => {
    const tabAllowed = {
      dashboard: true,
      bookings: true,
      inquiries: true,
      customers: capabilities.customers,
      clients: capabilities.clientRecords,
      services: capabilities.services,
      schedule: capabilities.schedule,
      reservationCalendar: capabilities.reservationCalendar,
      blockedDates: capabilities.blockedDates,
      paymentSettings: capabilities.paymentVerification,
      updates: true,
      packages: true,
      account: true,
      guide: true,
    };
    if (!tabAllowed[activeTab]) setActiveTab("dashboard");
  }, [activeTab, capabilities.customers, capabilities.clientRecords, capabilities.services, capabilities.schedule, capabilities.reservationCalendar, capabilities.blockedDates, capabilities.paymentVerification]);

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

  if (clientBusiness && isDemoExpired(clientBusiness)) {
    return <DemoExpiredPage business={clientBusiness} onBack={onBack} />;
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
          <button className={activeTab === "inquiries" ? "active" : ""} onClick={() => setActiveTab("inquiries")}><MessageSquare size={16} /> Inquiries</button>
          {capabilities.customers && <button className={activeTab === "customers" ? "active" : ""} onClick={() => setActiveTab("customers")}>{isClientToursTravel ? "Guests / Customers" : "Customers"}</button>}
          {capabilities.clientRecords && <button className={activeTab === "clients" ? "active" : ""} onClick={() => setActiveTab("clients")}><Users size={16} /> Clients <span className="customAddonMark" title="Custom Add-on" aria-label="Custom Add-on">✦</span></button>}
          {capabilities.services && <button className={activeTab === "services" ? "active" : ""} onClick={() => setActiveTab("services")}>{isClientToursTravel ? "Tour Packages" : "Services"}</button>}
          {capabilities.schedule && <button className={activeTab === "schedule" ? "active" : ""} onClick={() => setActiveTab("schedule")}>{isClientToursTravel ? "Availability" : "Schedule"}</button>}
          {capabilities.reservationCalendar && <button className={activeTab === "reservationCalendar" ? "active" : ""} onClick={() => setActiveTab("reservationCalendar")}><CalendarDays size={16} /> Reservation Calendar</button>}
          {capabilities.blockedDates && <button className={activeTab === "blockedDates" ? "active" : ""} onClick={() => setActiveTab("blockedDates")}>Blocked Dates</button>}
          {capabilities.paymentVerification && <button className={activeTab === "paymentSettings" ? "active" : ""} onClick={() => setActiveTab("paymentSettings")}>Payment Settings</button>}
          <button className={activeTab === "updates" ? "active" : ""} onClick={() => setActiveTab("updates")}>
            <Info size={16} /> Updates {unreadUpdatesCount > 0 && <span className="updatesNavBadge">{unreadUpdatesCount}</span>}
          </button>
          <button className={activeTab === "packages" ? "active" : ""} onClick={() => setActiveTab("packages")}><BadgeDollarSign size={16} /> Packages</button>
          <button className={activeTab === "account" ? "active" : ""} onClick={() => setActiveTab("account")}>Account</button>
          <button className={activeTab === "guide" ? "active" : ""} onClick={() => setActiveTab("guide")}><CircleHelp size={16} /> Help &amp; Guide</button>
          <button onClick={logoutClient}>Logout</button>
        </aside>

        <section className="clientDashboardContent">
          {statusMessage && <div className="setupSaveStatus online setupInlineStatus">{statusMessage}</div>}
          {activeTab !== "guide" && <button type="button" className="clientHowToButton" onClick={() => setHelpOpen(true)}><CircleHelp size={17} /> How to Use</button>}

          {activeTab === "dashboard" && (
            <>
              <div className="clientDashboardHeader">
                <div>
                  <p className="eyebrow">Welcome back</p>
                  <h2>{clientBusiness?.business}</h2>
                  <p>{clientBusiness?.bookingMode === "inquiry" ? "Review new inquiries and customer messages." : "Review bookings and keep appointment statuses updated."}</p>
                  <span className="clientPackageBadge">{packageOptions.find((item) => item.value === capabilities.packageKey)?.label || "Starter"} package</span>
                </div>
                {capabilities.manualReservations && <button type="button" className="clientPrimaryButton clientCreateReservationButton" onClick={openManualReservation}><Plus size={16} /> Create Reservation <span>PRO</span></button>}
              </div>
              <SmmOffersFeed offers={smmOffers} placement="CLIENT_DASHBOARD" compact business={clientBusiness} />
              <div className="clientMetricGrid">
                <article><span>Today</span><strong>{todayCount}</strong></article>
                <article><span>New Inquiries</span><strong>{newInquiryCount}</strong></article>
                <article><span>Pending Inquiries</span><strong>{pendingInquiryCount}</strong></article>
                <article><span>Pending</span><strong>{pendingCount}</strong></article>
                <article><span>Confirmed</span><strong>{confirmedCount}</strong></article>
                <article><span>Total</span><strong>{clientBookings.length}</strong></article>
                {capabilities.enhancedStats && <article><span>Completed</span><strong>{completedCount}</strong></article>}
                {capabilities.enhancedStats && <article><span>Cancelled</span><strong>{cancelledCount}</strong></article>}
                {capabilities.paymentVerification && <article><span>Pending Payment Verification</span><strong>{pendingPaymentCount}</strong></article>}
                {capabilities.paymentVerification && <article><span>Verified Payments</span><strong>{verifiedPaymentCount}</strong></article>}
              </div>
              <BookingList bookings={clientBookings.slice(0, 6)} onSelect={setSelectedBooking} onStatusChange={updateStatus} onDelete={deleteBooking} />
            </>
          )}

          {activeTab === "bookings" && (
            <>
              <div className="clientDashboardHeader">
                <div>
                  <p className="eyebrow">Bookings / Requests</p>
                  <h2>Customer activity</h2>
                </div>
                {capabilities.manualReservations && <button type="button" className="clientPrimaryButton clientCreateReservationButton" onClick={openManualReservation}><Plus size={16} /> Create Reservation <span>PRO</span></button>}
              </div>
              <div className="clientFilterRow">
                {["All", ...bookingStatusOptions.map((item) => item.label)].map((item) => (
                  <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item}>{item}</button>
                ))}
              </div>
              {capabilities.manualReservations && (
                <div className="clientFilterRow sourceFilterRow" aria-label="Reservation source filters">
                  {["All", "Online", "Manual"].map((item) => (
                    <button className={sourceFilter === item ? "active" : ""} onClick={() => setSourceFilter(item)} key={item}>{item}</button>
                  ))}
                </div>
              )}
              <BookingList bookings={filteredBookings} onSelect={setSelectedBooking} onStatusChange={updateStatus} onDelete={deleteBooking} />
            </>
          )}

          {activeTab === "inquiries" && (
            <section className="clientInquiriesPanel">
              <div className="clientDashboardHeader">
                <div>
                  <p className="eyebrow">Inquiries</p>
                  <h2>Inquiry + Booking Management</h2>
                  <p>Review inquiries first, confirm availability, then convert approved requests into bookings.</p>
                </div>
                <button type="button" className="clientPrimaryButton clientCreateReservationButton" onClick={() => openInquiryForm()}><Plus size={16} /> New Inquiry</button>
              </div>
              <div className="clientFilterRow inquiryFilterRow">
                <input value={inquirySearch} onChange={(event) => setInquirySearch(event.target.value)} placeholder="Search inquiries..." />
                <select value={inquiryStatusFilter} onChange={(event) => setInquiryStatusFilter(event.target.value)}>
                  <option>All</option>
                  {inquiryStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <select value={inquirySourceFilter} onChange={(event) => setInquirySourceFilter(event.target.value)}>
                  <option>All</option>
                  {inquirySourceOptions.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <InquiryList inquiries={filteredInquiries} bookings={clientBookings} onSelect={setSelectedInquiry} onStatusChange={updateInquiryStatus} onConvert={convertInquiry} />
            </section>
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
                          <small key={item.id}>{item.service} / {item.booking_date || "No date"} / {getBookingStatusLabel(item.status)}</small>
                        ))}
                      </div>
                    )}
                  </article>
                )) : <div className="clientEmptyState">No customers yet.</div>}
              </div>
            </section>
          )}

          {activeTab === "clients" && capabilities.clientRecords && (
            <section className="clientRecordsPanel">
              <div className="clientDashboardHeader">
                <div>
                  <p className="eyebrow">Client Records <span className="customAddonMark" title="Custom Add-on" aria-label="Custom Add-on">✦</span></p>
                  <h2>Clients</h2>
                  <p>Manage client records and service history across your branches.</p>
                </div>
                <div className="clientRecordsHeaderActions">
                  <button type="button" className="clientPrimaryButton" onClick={() => editClientRecord(null)}><Plus size={16} /> Add Client</button>
                  <button type="button" className="clientCreateReservationButton" onClick={() => selectedClientRecord ? openManualReservationForClient(selectedClientRecord) : openManualReservation()}><Plus size={16} /> Create Reservation</button>
                </div>
              </div>
              {!selectedClientRecord ? (
                <div className="clientDirectoryPanel">
                  <div className="clientRecordToolbar">
                    <input value={clientRecordSearch} onChange={(event) => setClientRecordSearch(event.target.value)} placeholder="Search by name, phone or email..." />
                    <select value={clientRecordBranchFilter} onChange={(event) => setClientRecordBranchFilter(event.target.value)}>
                      <option>All Branches</option>
                      {clientRecordBranches.map((branch) => <option key={branch}>{branch}</option>)}
                    </select>
                  </div>
                  <div className="clientDirectoryCount">{filteredClientRecords.length} client{filteredClientRecords.length === 1 ? "" : "s"}</div>
                  <div className="clientDirectoryList">
                    {filteredClientRecords.length ? filteredClientRecords.map((record) => {
                      const serviceRecordCount = getClientServiceRecords(record).length;
                      return (
                        <button type="button" className="clientRecordCard clientRecordWideCard" key={record.id} onClick={() => setSelectedClientRecord(record)}>
                          <div className="clientRecordCardMain">
                            <div className="clientRecordCardTop">
                              <strong>{record.full_name}</strong>
                              <span>{record.assigned_branch || "No branch"}</span>
                            </div>
                            <small>{record.contact_number || "No contact number"}{record.email ? ` • ${record.email}` : ""}</small>
                          </div>
                          <div className="clientRecordCardFooter">
                            <em>{serviceRecordCount} Service Record{serviceRecordCount === 1 ? "" : "s"}</em>
                            <span>Open Client →</span>
                          </div>
                        </button>
                      );
                    }) : <div className="clientEmptyState"><strong>No clients found.</strong><span>Try changing your search or branch filter.</span></div>}
                  </div>
                </div>
              ) : (
                <div className="clientRecordDetailView">
                  <button type="button" className="clientBackButton" onClick={() => setSelectedClientRecord(null)}>← Back to Clients</button>
                  <section className="clientRecordProfile clientRecordProfileFull">
                    <div className="clientRecordProfileTop">
                      <div>
                        <p className="eyebrow">Client Profile</p>
                        <div className="clientProfileTitleRow">
                          <h3>{selectedClientRecord.full_name}</h3>
                          <span>{selectedClientRecord.assigned_branch || "No branch"}</span>
                        </div>
                        <p className="clientProfileContactLine">{selectedClientRecord.contact_number}{selectedClientRecord.email ? ` • ${selectedClientRecord.email}` : ""}</p>
                      </div>
                      <div className="clientProfileTopActions">
                        <button type="button" onClick={() => editClientRecord(selectedClientRecord)}>Edit</button>
                        <button type="button" className="clientOverflowButton" title="Delete Client" onClick={() => deleteClientRecord(selectedClientRecord)}>⋯</button>
                      </div>
                    </div>
                    <div className="clientProfileSection">
                      <strong>Client Information</strong>
                      <p><span>Branch</span>{selectedClientRecord.assigned_branch || "Not assigned"}</p>
                      <p><span>Contact</span>{selectedClientRecord.contact_number}</p>
                      {selectedClientRecord.email && <p><span>Email</span>{selectedClientRecord.email}</p>}
                      {selectedClientRecord.notes && <p><span>Notes</span>{selectedClientRecord.notes}</p>}
                      <p><span>Client Since</span>{selectedClientRecord.created_at ? formatBookingDate(selectedClientRecord.created_at) : "—"}</p>
                    </div>
                    <div className="clientRecordProfileActions">
                      <button type="button" className="clientPrimaryButton" onClick={() => openClientServiceRecordForm(selectedClientRecord)}><Plus size={16} /> Add Service Record</button>
                      <button type="button" onClick={() => openManualReservationForClient(selectedClientRecord)}>Create Reservation</button>
                    </div>
                    <div className="clientServiceRecordSection">
                      <div className="clientServiceRecordHeader">
                        <div>
                          <strong>Service Record</strong>
                          <span>{getClientServiceRecords(selectedClientRecord).length} saved visit{getClientServiceRecords(selectedClientRecord).length === 1 ? "" : "s"}</span>
                        </div>
                      </div>
                      {getClientServiceRecords(selectedClientRecord).length ? (
                        <div className="clientServiceRecordTableWrap">
                          <table className="clientServiceRecordTable">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Session</th>
                                <th>Service</th>
                                <th>Branch</th>
                                <th>Charge</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Notes</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {getClientServiceRecords(selectedClientRecord).map((record) => (
                                <tr key={record.id}>
                                  <td data-label="Date">{formatBookingDate(record.service_date)}</td>
                                  <td data-label="Session">{record.session_number ? `#${record.session_number}` : "—"}</td>
                                  <td data-label="Service">{record.service_name_snapshot}</td>
                                  <td data-label="Branch">{record.branch || selectedClientRecord.assigned_branch || "—"}</td>
                                  <td data-label="Charge">{formatDashboardPeso(record.service_charge || 0)}</td>
                                  <td data-label="Paid">{formatDashboardPeso(record.amount_paid || 0)}</td>
                                  <td data-label="Balance" className={Number(record.balance || 0) > 0 ? "clientRecordBalanceDue" : "clientRecordBalancePaid"}>{Number(record.balance || 0) > 0 ? formatDashboardPeso(record.balance) : "Paid"}</td>
                                  <td data-label="Notes">{record.notes || "—"}</td>
                                  <td data-label="Actions"><button type="button" onClick={() => openClientServiceRecordForm(selectedClientRecord, record)}>Edit</button></td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : <div className="clientEmptyState"><strong>No service records yet.</strong><span>This client does not have any recorded visits/services yet. Use the button above to add the first one.</span></div>}
                    </div>
                    <div className="clientHistoryList clientRecordHistory">
                      <strong>Reservation History</strong>
                      <span>Slotwise scheduled bookings</span>
                      {getClientRecordHistory(selectedClientRecord).length ? getClientRecordHistory(selectedClientRecord).slice(0, 8).map((booking) => (
                        <small key={booking.id}>{formatBookingDate(booking.booking_date || booking.created_at)} / {getBookingServiceSummary(booking)} / {getBookingStatusLabel(booking.status)} <button type="button" onClick={() => openClientServiceRecordForm(selectedClientRecord, null, booking)}>Add to Service Record</button></small>
                      )) : <small>No reservations yet. This client does not have any Slotwise reservations yet.</small>}
                    </div>
                  </section>
                </div>
              )}
            </section>
          )}

          {clientRecordModalOpen && (
            <div className="clientBookingDetailsBackdrop" role="dialog" aria-modal="true">
              <form className="manualReservationModal clientRecordModal" onSubmit={submitClientRecord}>
                <div className="manualReservationHeader">
                  <div>
                    <p className="eyebrow">Client Records <span className="customAddonMark" title="Custom Add-on" aria-label="Custom Add-on">✦</span></p>
                    <h2>{clientRecordForm.id ? "Edit Client" : "Add Client"}</h2>
                    <p>Save client information for service records and reservations.</p>
                  </div>
                  <button type="button" onClick={() => { setClientRecordModalOpen(false); setClientRecordForm(emptyClientRecordForm); }}>Close</button>
                </div>
                <div className="manualFormGrid">
                  <label>
                    Full Name *
                    <input value={clientRecordForm.fullName} onChange={(event) => setClientRecordForm((current) => ({ ...current, fullName: event.target.value }))} required />
                  </label>
                  <label>
                    Contact Number *
                    <input value={clientRecordForm.contactNumber} onChange={(event) => setClientRecordForm((current) => ({ ...current, contactNumber: event.target.value }))} required />
                  </label>
                  <label>
                    Email
                    <input type="email" value={clientRecordForm.email} onChange={(event) => setClientRecordForm((current) => ({ ...current, email: event.target.value }))} />
                  </label>
                  <label>
                    Assigned Branch *
                    <select value={clientRecordForm.assignedBranch} onChange={(event) => setClientRecordForm((current) => ({ ...current, assignedBranch: event.target.value }))} required>
                      <option value="">Select branch</option>
                      {clientRecordBranches.map((branch) => <option key={branch}>{branch}</option>)}
                    </select>
                  </label>
                  <label className="manualFull">
                    Notes
                    <textarea value={clientRecordForm.notes} onChange={(event) => setClientRecordForm((current) => ({ ...current, notes: event.target.value }))} rows="3" />
                  </label>
                </div>
                <div className="manualReservationActions">
                  <button type="button" onClick={() => { setClientRecordModalOpen(false); setClientRecordForm(emptyClientRecordForm); }}>Cancel</button>
                  <button type="submit" className="clientPrimaryButton">{clientRecordForm.id ? "Save Client" : "Add Client"}</button>
                </div>
              </form>
            </div>
          )}

          {clientServiceRecordModalOpen && selectedClientRecord && (
            <div className="clientBookingDetailsBackdrop" role="dialog" aria-modal="true">
              <form className="manualReservationModal clientServiceRecordModal" onSubmit={submitClientServiceRecord}>
                <div className="manualReservationHeader">
                  <div>
                    <p className="eyebrow">Service Record <span className="customAddonMark" title="Custom Add-on" aria-label="Custom Add-on">✦</span></p>
                    <h2>{clientServiceRecordForm.id ? "Edit Service Record" : "Add Service Record"}</h2>
                    <p>{selectedClientRecord.full_name}</p>
                  </div>
                  <button type="button" onClick={() => setClientServiceRecordModalOpen(false)}>Close</button>
                </div>
                <div className="manualFormGrid">
                  <label>
                    Service Date *
                    <input type="date" value={clientServiceRecordForm.serviceDate} onChange={(event) => setClientServiceRecordForm((current) => ({ ...current, serviceDate: event.target.value }))} required />
                  </label>
                  <label>
                    Session Number
                    <input type="number" min="1" value={clientServiceRecordForm.sessionNumber} onChange={(event) => setClientServiceRecordForm((current) => ({ ...current, sessionNumber: event.target.value }))} />
                  </label>
                  <label>
                    Branch *
                    <select value={clientServiceRecordForm.branch} onChange={(event) => setClientServiceRecordForm((current) => ({ ...current, branch: event.target.value }))} required>
                      <option value="">Select branch</option>
                      {clientRecordBranches.map((branch) => <option key={branch}>{branch}</option>)}
                    </select>
                  </label>
                  <label>
                    Linked Reservation
                    <select value={clientServiceRecordForm.reservationId} onChange={(event) => setClientServiceRecordForm((current) => ({ ...current, reservationId: event.target.value }))}>
                      <option value="">No linked reservation</option>
                      {getClientLinkedReservationOptions(selectedClientRecord).map((booking) => (
                        <option key={booking.id} value={booking.id}>{formatBookingDate(booking.booking_date || booking.created_at)} - {getBookingServiceSummary(booking)}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Existing Service/Treatment
                    <select value={clientServiceRecordForm.serviceId} onChange={(event) => changeClientServiceRecordService(event.target.value)}>
                      <option value="">Manual entry</option>
                      {clientServices.filter((service) => service.status !== "Inactive").map((service) => (
                        <option key={service.id} value={service.id}>{service.name}{service.price !== null && service.price !== undefined ? ` - ${formatDashboardPeso(service.price)}` : ""}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Service/Treatment *
                    <input value={clientServiceRecordForm.serviceName} onChange={(event) => setClientServiceRecordForm((current) => ({ ...current, serviceName: event.target.value, serviceId: selectedServiceRecordService?.name === event.target.value ? current.serviceId : "" }))} placeholder="Treatment or service name" required />
                  </label>
                  <label>
                    Service Charge *
                    <input type="number" min="0" step="0.01" value={clientServiceRecordForm.serviceCharge} onChange={(event) => setClientServiceRecordForm((current) => ({ ...current, serviceCharge: event.target.value }))} required />
                  </label>
                  <label>
                    Amount Paid
                    <input type="number" min="0" step="0.01" value={clientServiceRecordForm.amountPaid} onChange={(event) => setClientServiceRecordForm((current) => ({ ...current, amountPaid: event.target.value }))} />
                  </label>
                  <label>
                    Balance
                    <input value={formatDashboardPeso(serviceRecordBalance)} readOnly />
                  </label>
                  <label>
                    Signature
                    <input value={clientServiceRecordForm.signatureReference} onChange={(event) => setClientServiceRecordForm((current) => ({ ...current, signatureReference: event.target.value }))} placeholder="Optional reference" />
                  </label>
                  <label className="manualFull">
                    Notes
                    <textarea value={clientServiceRecordForm.notes} onChange={(event) => setClientServiceRecordForm((current) => ({ ...current, notes: event.target.value }))} rows="3" placeholder="Treatment notes, payment remarks, or follow-up reminders" />
                  </label>
                </div>
                <div className="clientServiceRecordBalance">
                  <span>Calculated Balance</span>
                  <strong>{formatDashboardPeso(serviceRecordBalance)}</strong>
                </div>
                <div className="manualReservationActions">
                  <button type="button" onClick={() => setClientServiceRecordModalOpen(false)}>Cancel</button>
                  <button type="submit" className="clientPrimaryButton">Save Service Record</button>
                </div>
              </form>
            </div>
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
                <p>When enabled, customers can view your configured payment methods and submit payment information during booking. You still verify money manually in your actual payment account.</p>
              </div>
              <form className="clientManagementForm paymentSettingsForm" onSubmit={submitPaymentSettings}>
                <label><input type="checkbox" checked={Boolean(paymentSettings.enabled)} onChange={(event) => setPaymentSettings((current) => ({ ...current, enabled: event.target.checked }))} /> Accept Manual Payments</label>
                <label><input type="checkbox" checked={Boolean(paymentSettings.require_proof)} onChange={(event) => setPaymentSettings((current) => ({ ...current, require_proof: event.target.checked }))} /> Require Proof of Payment</label>
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
              {paymentSettings.enabled && paymentMethods.filter((method) => method.active !== false).length === 0 && <p className="paymentConfigurationWarning">Manual Payments is enabled, but no payment method is currently available. Add and enable at least one payment method before customers can submit payments.</p>}
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

          {activeTab === "updates" && (
            <section className="slotwiseUpdatesPanel">
              <div className="clientDashboardHeader">
                <div>
                  <p className="eyebrow">What's New</p>
                  <h2>Slotwise updates</h2>
                  <p>New features, fixes, and improvements available for your current package.</p>
                  <p className="slotwiseUpdateScheduleNote"><Clock size={14} /> Regular Slotwise updates are typically released every Thursday at 3:00 AM.</p>
                </div>
                {unreadUpdatesCount > 0 && <span className="slotwiseUpdateNewPill">{unreadUpdatesCount} new</span>}
              </div>
              <div className="slotwiseUpdateList">
                {visibleSlotwiseUpdates.length ? visibleSlotwiseUpdates.map((update) => {
                  const updateDate = update.published_at || update.created_at;
                  const updatePackages = normalizeUpdatePackages(update.applicable_packages || update.target_packages);
                  const isUnread = new Date(updateDate || 0).getTime() > lastUpdatesViewedAt;
                  return (
                    <article className={`slotwiseUpdateCard ${isUnread ? "unread" : ""}`} key={update.id}>
                      <div className="slotwiseUpdateMeta">
                        <span className={`slotwiseUpdateType type-${getStatusClass(update.update_type)}`}>{String(update.feature_badge || "").toUpperCase() === "PRO FEATURE" ? "NEW" : getUpdateTypeLabel(update.update_type)}</span>
                        {update.feature_badge && <span className="slotwiseUpdateFeatureBadge"><FileDown size={12} /> {String(update.feature_badge).toUpperCase() === "PRO" ? "PRO FEATURE" : update.feature_badge}</span>}
                        {updateDate && <small>{formatUpdateDate(updateDate)}</small>}
                        {isUnread && <span className="slotwiseUpdateDot">New</span>}
                      </div>
                      <h3>{update.title}</h3>
                      <p>{update.summary}</p>
                      {update.content && <small className="slotwiseUpdateContent">{update.content}</small>}
                      <div className="slotwiseUpdatePackages">
                        {updatePackages.map((item) => <span key={item}>{getUpdatePackageBadgeLabel(item, capabilities.packageKey)}</span>)}
                      </div>
                    </article>
                  );
                }) : (
                  <div className="clientEmptyState">
                    <strong>No published updates yet.</strong>
                    <span>Slotwise announcements will appear here when they are available for your package.</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === "packages" && (
            <section className="slotwisePackagesPanel">
              <div className="clientDashboardHeader">
                <div>
                  <p className="eyebrow">Packages</p>
                  <h2>Slotwise package guide</h2>
                  <p>Compare Starter, Business, and Pro without changing your current dashboard permissions.</p>
                </div>
                <span className="clientPackageBadge">Current: {packageOptions.find((item) => item.value === capabilities.packageKey)?.label || "Starter"}</span>
              </div>
              <div className="slotwisePackagesGrid">
                {dashboardPackageCards.map((packageCard) => {
                  const isCurrent = packageCard.value === capabilities.packageKey;
                  const canUpgrade = getPackageOrder(packageCard.value) > getPackageOrder(capabilities.packageKey);
                  return (
                    <article className={`slotwisePackageCard ${isCurrent ? "current" : ""}`} key={packageCard.value}>
                      <div>
                        <div className="slotwisePackageTopline">
                          <span>{packageCard.label}</span>
                          {isCurrent && <strong>Current package</strong>}
                        </div>
                        <h3>{packageCard.price}</h3>
                        <small>{packageCard.note}</small>
                        <p>{packageCard.summary}</p>
                      </div>
                      <ul>
                        {packageCard.features.map((feature) => <li key={feature}><Check size={15} /> {feature}</li>)}
                      </ul>
                      {canUpgrade ? (
                        <a className="slotwisePackageUpgrade" href={smmUpgradeHref} target={smmUpgradeHref.startsWith("http") ? "_blank" : undefined} rel={smmUpgradeHref.startsWith("http") ? "noopener noreferrer" : undefined}>
                          Message SMM to Upgrade
                        </a>
                      ) : (
                        <span className="slotwisePackageIncluded">{isCurrent ? "Active on your account" : "Included below your current package"}</span>
                      )}
                    </article>
                  );
                })}
              </div>
              <p className="slotwisePackageNote">Paid add-ons are separate from standard packages and only appear when enabled for a specific business.</p>
            </section>
          )}

          {activeTab === "account" && (
            <section className="clientAccountPanel">
              <p className="eyebrow">Account</p>
              <h2>{clientBusiness?.business}</h2>
              <form className="clientManagementForm" onSubmit={submitBusinessProfile}>
                <input value={profileForm.businessName} onChange={(event) => setProfileForm((current) => ({ ...current, businessName: event.target.value }))} placeholder="Business name" required />
                <textarea value={profileForm.description} onChange={(event) => setProfileForm((current) => ({ ...current, description: event.target.value }))} placeholder="Business description or tagline" rows="3" />
                <input value={profileForm.phone} onChange={(event) => setProfileForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Office phone" />
                <input value={profileForm.mobileNumbers} onChange={(event) => setProfileForm((current) => ({ ...current, mobileNumbers: event.target.value }))} placeholder="Mobile numbers" />
                <input type="email" value={profileForm.primaryEmail} onChange={(event) => setProfileForm((current) => ({ ...current, primaryEmail: event.target.value }))} placeholder="Primary business email" />
                <input value={profileForm.additionalEmails} onChange={(event) => setProfileForm((current) => ({ ...current, additionalEmails: event.target.value }))} placeholder="Additional emails" />
                <input type="url" value={profileForm.website} onChange={(event) => setProfileForm((current) => ({ ...current, website: event.target.value }))} placeholder="Official website" />
                <input value={profileForm.messengerLink} onChange={(event) => setProfileForm((current) => ({ ...current, messengerLink: event.target.value }))} placeholder="Messenger link" />
                <input type="url" value={profileForm.logo} onChange={(event) => setProfileForm((current) => ({ ...current, logo: event.target.value }))} placeholder="Logo URL" />
                <label>Primary color<input type="color" value={profileForm.primaryColor} onChange={(event) => setProfileForm((current) => ({ ...current, primaryColor: event.target.value }))} /></label>
                <label>Accent color<input type="color" value={profileForm.accentColor} onChange={(event) => setProfileForm((current) => ({ ...current, accentColor: event.target.value }))} /></label>
                <button type="submit">Save business details</button>
              </form>
              <p><strong>Email:</strong> {clientSession?.user?.email}</p>
              <p><strong>Role:</strong> {currentRole}</p>
              <p><strong>Package:</strong> {packageOptions.find((item) => item.value === capabilities.packageKey)?.label || "Starter"}</p>
              <p><strong>Public URL:</strong> {window.location.origin}/{clientBusiness?.slug}</p>
              <button className="clientPrimaryButton" onClick={logoutClient}>Logout</button>
            </section>
          )}

          {activeTab === "guide" && (
            <section className="clientGuidePage">
              <div className="clientDashboardHeader"><p className="eyebrow">User manual</p><h2>Help &amp; Guide</h2><p>Simple instructions for the features available in your dashboard.</p></div>
              <div className="clientGettingStarted"><strong>Getting Started</strong><ol><li>Review your business information.</li>{capabilities.services && <li>Add or review your services or packages.</li>}{capabilities.schedule && <li>Set your availability.</li>}{capabilities.blockedDates && <li>Add blocked dates when necessary.</li>}{capabilities.paymentVerification && <li>Configure payment information.</li>}<li>Test your public booking page.</li><li>Share only the public booking page with customers.</li></ol><p><strong>Important:</strong> Never share your Client Dashboard URL or login credentials publicly.</p></div>
              <input className="clientHelpSearch" value={helpSearch} onChange={(event) => setHelpSearch(event.target.value)} placeholder="Search help topics..." />
              <div className="clientGuideTopics">{filteredHelpTopics.map((topic) => <details key={topic.id}><summary>{topic.title}</summary><div><ClientHelpContent topic={topic} /></div></details>)}</div>
            </section>
          )}

          {inquiryFormOpen && (
            <InquiryFormModal
              form={inquiryForm}
              setForm={setInquiryForm}
              services={availableManualServices}
              onSubmit={submitInquiry}
              onClose={() => setInquiryFormOpen(false)}
            />
          )}

          {helpOpen && (
            <div className="clientHelpBackdrop" onMouseDown={(event) => event.target === event.currentTarget && setHelpOpen(false)}>
              <aside className={`clientHelpDrawer ${activeTab === "clients" && capabilities.clientRecords ? "clientRecordsHelpDrawer" : ""}`} role="dialog" aria-modal="true" aria-label={activeTab === "clients" && capabilities.clientRecords ? "Client Records step-by-step guide" : `${activeHelpTopic?.title || "Dashboard"} help`}>
                <button type="button" className="clientHelpClose" onClick={() => setHelpOpen(false)}>Close</button>
                {activeTab === "clients" && capabilities.clientRecords ? <ClientRecordsManual /> : <ClientHelpContent topic={activeHelpTopic} />}
              </aside>
            </div>
          )}

          {manualReservationOpen && capabilities.manualReservations && (
            <ManualReservationModal
              form={manualReservationForm}
              setForm={setManualReservationForm}
              services={availableManualServices}
              selectedService={manualSelectedService}
              customers={customers}
              clientRecords={clientRecords}
              branches={clientRecordBranches}
              hasClientRecords={capabilities.clientRecords}
              availability={clientAvailability}
              usesPreferredSchedule={manualUsesPreferredSchedule}
              allowCoordinatedSchedule={clientBusiness?.bookingTemplate === "AIRCON_SERVICES" && !clientAvailability.slots?.length}
              isPestControl={isClientPestControl}
              onSelectCustomer={selectManualCustomer}
              onSubmit={submitManualReservation}
              onClose={() => setManualReservationOpen(false)}
            />
          )}

          {selectedInquiry && (
            <InquiryDetailsModal
              inquiry={selectedInquiry}
              bookings={clientBookings}
              canDownloadPdf={capabilities.downloadBookingPdf}
              pdfMessage={pdfMessage}
              onDownloadPdf={(inquiry, convertedBooking) => {
                const record = convertedBooking || {
                  id: inquiry.id,
                  customer: inquiry.customer_name,
                  contact: inquiry.phone,
                  service: getInquiryServiceSummary(inquiry),
                  booking_date: inquiry.event_date || "",
                  slot: inquiry.event_time || "",
                  note: inquiry.message || "",
                  status: inquiry.status,
                  created_at: inquiry.created_at,
                  metadata: {
                    booking_template: clientBusiness?.bookingTemplate,
                    request_type: "inquiry",
                    customer_email: inquiry.email || "",
                    event_date: inquiry.event_date || "",
                    preferred_event_time: inquiry.event_time || "",
                    event_location: inquiry.event_location || "",
                    event_type: inquiry.event_type || "",
                    special_requests: inquiry.message || "",
                  },
                };
                const items = convertedBooking
                  ? getBookingLineItems(convertedBooking)
                  : (inquiry.inquiry_items || []).map((item) => ({ serviceName: item.item_name, quantity: item.quantity || 1, lineTotal: null, pricingType: "CUSTOM_INQUIRY" }));
                const inquiryTotal = convertedBooking?.metadata?.calculated_price
                  ?? convertedBooking?.metadata?.estimated_total
                  ?? convertedBooking?.estimated_total
                  ?? null;
                handleDownloadPdf({
                  record,
                  items,
                  total: inquiryTotal,
                  statusLabel: convertedBooking ? getBookingStatusLabel(convertedBooking.status) : getInquiryStatusLabel(inquiry.status),
                  documentType: convertedBooking ? "booking" : "inquiry",
                  payment: convertedBooking ? (paymentsByBooking[convertedBooking.id] || [])[0] || null : null,
                });
              }}
              onEdit={openInquiryForm}
              onClose={() => setSelectedInquiry(null)}
              onStatusChange={updateInquiryStatus}
              onConvert={convertInquiry}
            />
          )}

          {selectedBooking && (
            <div className="clientBookingDetailsBackdrop" onMouseDown={(event) => event.target === event.currentTarget && setSelectedBooking(null)}>
            <section className="clientBookingDetails" role="dialog" aria-modal="true" aria-label="Booking or inquiry details">
              <div>
                <p className="eyebrow">{isClientPestControl ? "Service Request Details" : isClientRealEstate ? "Property Inquiry Details" : "Booking / Inquiry Details"}</p>
                <h2>{selectedBooking.customer}</h2>
              </div>
              <p><strong>Reference Number:</strong> {selectedBooking.id || "Not provided"}</p>
              <p><strong>Status:</strong> {getBookingStatusLabel(selectedBooking.status)}</p>
              <p><strong>Source:</strong> {String(selectedBooking.metadata?.source || "online").toLowerCase() === "manual" ? "Manual" : "Online"}</p>
              {selectedBooking.metadata?.test_booking && <p><strong>Record Type:</strong> Test Booking</p>}
              <p><strong>Date Submitted:</strong> {selectedBooking.created_at ? formatFriendlyDateTime(selectedBooking.created_at) : "Not provided"}</p>
              <p><strong>Phone:</strong> {selectedBooking.contact}</p>
              {(selectedBooking.metadata?.customer_email || selectedBooking.metadata?.traveler_email) && <p><strong>Email:</strong> {selectedBooking.metadata.customer_email || selectedBooking.metadata.traveler_email}</p>}
              {selectedBooking.metadata?.customer_address && <p><strong>Address:</strong> {selectedBooking.metadata.customer_address}</p>}
              {selectedBooking.metadata?.request_type === "booking_request" && (
                <div className="bookingDetailSubsection">
                  <h3>Event Request Details</h3>
                  {selectedBooking.metadata?.booking_status && <p><strong>Booking Status:</strong> {selectedBooking.metadata.booking_status}</p>}
                  {selectedBooking.metadata?.event_type && <p><strong>Event Type:</strong> {selectedBooking.metadata.event_type}</p>}
                  {selectedBooking.metadata?.event_date && <p><strong>Event Date:</strong> {formatBookingDate(selectedBooking.metadata.event_date)}</p>}
                  {selectedBooking.metadata?.preferred_event_time && <p><strong>Preferred Event Time:</strong> {selectedBooking.metadata.preferred_event_time}</p>}
                  {selectedBooking.metadata?.event_location && <p><strong>Event Location / Venue:</strong> {selectedBooking.metadata.event_location}</p>}
                  {selectedBooking.metadata?.estimated_guest_count && <p><strong>Estimated Guests:</strong> {selectedBooking.metadata.estimated_guest_count}</p>}
                  {selectedBooking.metadata?.special_requests && <p><strong>Additional Details / Special Requests:</strong> {selectedBooking.metadata.special_requests}</p>}
                </div>
              )}
              <div className="bookingPricingSummary">
                <p className="eyebrow">Pricing Summary</p>
                <div className="bookingPricingTotal">
                  <span>Estimated Total</span>
                  <strong>{selectedPricingIsCalculated && selectedBookingTotal !== null ? formatDashboardPeso(selectedBookingTotal) : "For Assessment"}</strong>
                </div>
                <dl>
                  <div>
                    <dt>Pricing Status</dt>
                    <dd>{selectedPricingIsCalculated && selectedBookingTotal !== null ? "Calculated" : "Assessment Required"}</dd>
                  </div>
                  {selectedPricingBasis && (
                    <div>
                      <dt>Pricing Basis</dt>
                      <dd>{selectedPricingBasis}</dd>
                    </div>
                  )}
                </dl>
              </div>
              {isClientRealEstate && selectedBooking.metadata?.property_type && <p><strong>Property Type:</strong> {selectedBooking.metadata.property_type}</p>}
              {isClientRealEstate && selectedBooking.metadata?.preferred_location && <p><strong>Preferred Location:</strong> {selectedBooking.metadata.preferred_location}</p>}
              {isClientRealEstate && selectedBooking.metadata?.budget_range && <p><strong>Budget Range:</strong> {selectedBooking.metadata.budget_range}</p>}
              {isClientRealEstate && selectedBooking.metadata?.property_purpose && <p><strong>Purpose:</strong> {selectedBooking.metadata.property_purpose}</p>}
              {isClientRealEstate && selectedBooking.metadata?.additional_requirements && <p><strong>Additional Requirements:</strong> {selectedBooking.metadata.additional_requirements}</p>}
              {isClientPestControl && selectedBooking.metadata?.pest_concern && <p><strong>Pest Concern / Service:</strong> {selectedBooking.metadata.pest_concern}</p>}
              {isClientPestControl && selectedBooking.metadata?.property_type && <p><strong>Property Type:</strong> {selectedBooking.metadata.property_type}</p>}
              {isClientPestControl && selectedBooking.metadata?.service_area && <p><strong>Service Area:</strong> {selectedBooking.metadata.service_area}</p>}
              {isClientPestControl && (selectedBooking.metadata?.pest_area_sqm || selectedBooking.metadata?.area_sqm) && <p><strong>Area:</strong> {selectedBooking.metadata.pest_area_sqm || selectedBooking.metadata.area_sqm} sqm</p>}
              {isClientPestControl && (selectedBooking.metadata?.pest_number_of_floors || selectedBooking.metadata?.floor_count) && <p><strong>Floors:</strong> {selectedBooking.metadata.pest_number_of_floors || selectedBooking.metadata.floor_count}</p>}
              {isClientPestControl && selectedBooking.metadata?.service_location && <p><strong>Service Location:</strong> {selectedBooking.metadata.service_location}</p>}
              {selectedBooking.metadata?.internal_notes && <p><strong>Internal Notes:</strong> {selectedBooking.metadata.internal_notes}</p>}
              {selectedBooking.metadata?.booking_template === "AIRCON_SERVICES" && selectedBooking.metadata?.aircon_details && <section aria-label="Aircon service details"><h3>Aircon Service Details</h3>{Object.entries({ service_category: "Category", installation_option: "Installation", unit_type: "Unit Type", capacity: "HP / Capacity", number_of_units: "Number of Units", brand_model: "Brand / Model", unit_condition: "Unit", issue_concern: "Problem / Concern", current_location: "Current Location", property_type: "Property Type", room_area: "Room Area (sqm)", budget_range: "Budget Range", service_area: "Service Area", service_location: "Service Address", landmark: "Landmark" }).map(([key, label]) => selectedBooking.metadata.aircon_details[key] ? <p key={key}><strong>{label}:</strong> {selectedBooking.metadata.aircon_details[key]}</p> : null)}</section>}
              <div className="bookingItemsPanel">
                <strong>Services</strong>
                {selectedBookingItems.map((item) => (
                  <p key={item.serviceName}>
                    <span>{item.serviceName}{item.lineLabel ? ` - ${item.lineLabel}` : ""}</span>
                    <em>{item.lineTotal === null || item.lineTotal === undefined ? "Contact for Rate" : formatPeso(item.lineTotal)}</em>
                  </p>
                ))}
                {selectedBookingTotal !== null && <p className="bookingItemsTotal"><span>Estimated Total</span><em>{formatPeso(selectedBookingTotal)}</em></p>}
              </div>
              <p><strong>{isClientAccommodation ? "Check-in" : isClientToursTravel ? "Travel Date" : "Date"}:</strong> {isClientAccommodation ? formatBookingDate(selectedBooking.metadata?.check_in || selectedBooking.booking_date) : selectedBooking.booking_date || "Not required"}</p>
              {isClientAccommodation && <p><strong>Check-out:</strong> {formatBookingDate(selectedBooking.metadata?.check_out)}</p>}
              {isClientToursTravel && selectedBooking.metadata?.travel_end_date && <p><strong>Return / End of Desired Tour:</strong> {formatBookingDate(selectedBooking.metadata.travel_end_date)}</p>}
              {isClientToursTravel && selectedBooking.metadata?.selected_departure && <p><strong>Selected Departure:</strong> {departureDateLabel(selectedBooking.metadata.selected_departure)}</p>}
              {isClientAccommodation && <p><strong>Nights:</strong> {selectedBooking.metadata?.number_of_nights || "Not saved"}</p>}
              <p><strong>{isClientAccommodation ? "Stay" : isClientToursTravel ? "Preferred Time" : "Time"}:</strong> {selectedBooking.slot || "Inquiry only"}</p>
              {(isClientToursTravel || isClientAccommodation) && <p><strong>Guests:</strong> {selectedBooking.metadata?.guest_count || "Not provided"}</p>}
              {isClientToursTravel && selectedBooking.metadata?.preferred_hotel_category && <p><strong>Preferred Hotel Category:</strong> {selectedBooking.metadata.preferred_hotel_category}</p>}
              {isClientToursTravel && selectedBooking.metadata?.room_type && <p><strong>Type of Room:</strong> {selectedBooking.metadata.room_type}</p>}
              {isClientToursTravel && selectedBooking.metadata?.requested_inclusions && <p><strong>Requested Inclusions:</strong> {selectedBooking.metadata.requested_inclusions}</p>}
              {isClientToursTravel && <p><strong>Pricing Type:</strong> {selectedBooking.metadata?.pricing_type || "Not saved"}</p>}
              {isClientToursTravel && selectedBooking.metadata?.unit_price !== undefined && <p><strong>Rate:</strong> {formatPeso(selectedBooking.metadata.unit_price)}</p>}
              {isClientToursTravel && selectedBooking.metadata?.selected_tier && <p><strong>Selected Group Rate:</strong> {selectedBooking.metadata.selected_tier.minGuests}-{selectedBooking.metadata.selected_tier.maxGuests} pax - {formatPeso(selectedBooking.metadata.selected_tier.price)}</p>}
              {isClientToursTravel && <p><strong>Estimated Total:</strong> {selectedBookingTotal !== null ? formatPeso(selectedBookingTotal) : "Rate only"}</p>}
              {isClientToursTravel && selectedBooking.metadata?.pickup_location && <p><strong>Pickup Location:</strong> {selectedBooking.metadata.pickup_location}</p>}
              <p><strong>{isClientPestControl ? "Additional Notes" : isClientRealEstate ? "Additional Requirements" : isClientToursTravel ? "Special Requests" : "Notes"}:</strong> {selectedBooking.note || "No notes"}</p>
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
                      {latestSelectedPayment.submitted_at && <p><strong>Submitted At:</strong> {formatFriendlyDateTime(latestSelectedPayment.submitted_at)}</p>}
                      {latestSelectedPayment.verified_at && <p><strong>Verified At:</strong> {formatFriendlyDateTime(latestSelectedPayment.verified_at)}</p>}
                      {latestSelectedPayment.proof_storage_path && <button type="button" className="clientSecondaryButton" onClick={() => openPaymentProof(latestSelectedPayment)}>View Payment Proof</button>}
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
                  {bookingStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </label>
              {pdfMessage && <p className="bookingPdfFeedback" role="status">{pdfMessage}</p>}
              {capabilities.downloadBookingPdf && (
                <button type="button" className="bookingPdfButton" onClick={() => handleDownloadPdf({
                  record: selectedBooking,
                  items: selectedBookingItems,
                  total: selectedBookingTotal,
                  statusLabel: getBookingStatusLabel(selectedBooking.status),
                  payment: latestSelectedPayment,
                })}>
                  <FileDown size={17} /> Download PDF
                </button>
              )}
              <button onClick={() => setSelectedBooking(null)}>Close</button>
            </section>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function InquiryList({ inquiries, bookings = [], onSelect, onStatusChange, onConvert }) {
  if (!inquiries.length) return <div className="clientEmptyState"><strong>No inquiries yet.</strong><span>New inquiries will appear here when encoded or submitted from connected websites.</span></div>;
  return (
    <div className="clientBookingList inquiryList">
      {inquiries.map((inquiry) => {
        const convertedBooking = bookings.find((booking) => booking.id === inquiry.booking_id);
        return (
          <article className="clientBookingCard" key={inquiry.id}>
            <div>
              <strong>{inquiry.customer_name}</strong>
              <span>{getInquiryServiceSummary(inquiry)}</span>
              <small>{inquiry.event_date || "No event date"} / {inquiry.event_time || "No time"} / {inquiry.source || "Manual"}</small>
              <em>{inquiry.phone}{inquiry.email ? ` • ${inquiry.email}` : ""}</em>
            </div>
            <p>{inquiry.message || "No message provided"}</p>
            <div className="clientBookingActions">
              <span className={`clientStatusPill ${getStatusClass(inquiry.status)}`}>{getInquiryStatusLabel(inquiry.status)}</span>
              <span className={`clientSourcePill ${inquiry.booking_id ? "manual" : "online"}`}>{inquiry.booking_id ? `Converted ${convertedBooking ? `to ${convertedBooking.id}` : ""}` : "Not booked"}</span>
              <select value={normalizeInquiryStatusValue(inquiry.status)} onChange={(event) => onStatusChange(inquiry, event.target.value)}>
                {inquiryStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
              <button onClick={() => onSelect(inquiry)}>View Details</button>
              <button type="button" disabled={Boolean(inquiry.booking_id)} onClick={() => onConvert(inquiry)}>{inquiry.booking_id ? "Converted" : "Convert to Booking"}</button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function InquiryFormModal({ form, setForm, services = [], onSubmit, onClose }) {
  const toggleService = (serviceId) => {
    setForm((current) => ({
      ...current,
      serviceIds: current.serviceIds.includes(serviceId)
        ? current.serviceIds.filter((id) => id !== serviceId)
        : [...current.serviceIds, serviceId],
    }));
  };
  return (
    <div className="clientBookingDetailsBackdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="manualReservationModal inquiryModal" role="dialog" aria-modal="true" aria-label="New inquiry">
        <div className="manualReservationHeader">
          <div>
            <p className="eyebrow">{form.id ? "Edit Inquiry" : "New Inquiry"}</p>
            <h2>{form.id ? "Update inquiry details" : "Encode customer inquiry"}</h2>
            <p>Add inquiries received through website, Messenger, Facebook, phone, walk-ins, or other channels.</p>
          </div>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
        <form className="manualReservationForm" onSubmit={onSubmit}>
          <section>
            <h3><span>1</span> Customer Information</h3>
            <div className="manualFormGrid">
              <input value={form.customerName} onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))} placeholder="Full name *" required />
              <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone *" required />
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
              <select value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}>
                {inquirySourceOptions.map((source) => <option key={source}>{source}</option>)}
              </select>
            </div>
          </section>
          <section>
            <h3><span>2</span> Event Details</h3>
            <div className="manualFormGrid">
              <input type="date" value={form.eventDate} onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))} />
              <input value={form.eventTime} onChange={(event) => setForm((current) => ({ ...current, eventTime: event.target.value }))} placeholder="Event time" />
              <input value={form.eventLocation} onChange={(event) => setForm((current) => ({ ...current, eventLocation: event.target.value }))} placeholder="Event location" />
              <input value={form.eventType} onChange={(event) => setForm((current) => ({ ...current, eventType: event.target.value }))} placeholder="Event type" />
            </div>
          </section>
          <section>
            <h3><span>3</span> Interested Products / Services</h3>
            <div className="inquiryServicePicker">
              {services.length ? services.map((service) => (
                <label key={service.id || service.name}>
                  <input type="checkbox" checked={form.serviceIds.includes(service.id)} onChange={() => toggleService(service.id)} />
                  <span>{service.name}</span>
                </label>
              )) : <p>No services available yet. You can still save the inquiry and add services later.</p>}
            </div>
          </section>
          <section>
            <h3><span>4</span> Notes</h3>
            <textarea value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} placeholder="Message / special requests" rows="3" />
            <textarea value={form.internalNotes} onChange={(event) => setForm((current) => ({ ...current, internalNotes: event.target.value }))} placeholder="Internal notes" rows="3" />
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
              {inquiryStatusOptions.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </section>
          <div className="manualReservationActions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="clientPrimaryButton"><Plus size={16} /> Save Inquiry</button>
          </div>
        </form>
      </section>
    </div>
  );
}

function InquiryDetailsModal({ inquiry, bookings = [], onEdit, onClose, onStatusChange, onConvert, canDownloadPdf = false, onDownloadPdf, pdfMessage = "" }) {
  const convertedBooking = bookings.find((booking) => booking.id === inquiry.booking_id);
  return (
    <div className="clientBookingDetailsBackdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="clientBookingDetails inquiryDetailsModal" role="dialog" aria-modal="true" aria-label="Inquiry details">
        <div>
          <p className="eyebrow">Inquiry Details</p>
          <h2>{inquiry.customer_name}</h2>
        </div>
        <div className="clientDetailsGroup">
          <p className="eyebrow">Customer Information</p>
          <p><strong>Full Name:</strong> {inquiry.customer_name}</p>
          <p><strong>Phone:</strong> {inquiry.phone}</p>
          {inquiry.email && <p><strong>Email:</strong> {inquiry.email}</p>}
        </div>
        <div className="clientDetailsGroup">
          <p className="eyebrow">Event Details</p>
          <p><strong>Event Date:</strong> {inquiry.event_date || "Not provided"}</p>
          <p><strong>Event Time:</strong> {inquiry.event_time || "Not provided"}</p>
          <p><strong>Event Location:</strong> {inquiry.event_location || "Not provided"}</p>
          <p><strong>Event Type:</strong> {inquiry.event_type || "Not provided"}</p>
        </div>
        <div className="bookingItemsPanel">
          <strong>Interested Products / Services</strong>
          {(inquiry.inquiry_items || []).length ? inquiry.inquiry_items.map((item) => (
            <p key={item.id || item.item_name}><span>{item.item_name}</span><em>Qty {item.quantity || 1}</em></p>
          )) : <p><span>{inquiry.service_interest || "No selected services"}</span></p>}
        </div>
        <p><strong>Message / Special Requests:</strong> {inquiry.message || "No message"}</p>
        <p><strong>Internal Notes:</strong> {inquiry.internal_notes || "No internal notes"}</p>
        <p><strong>Source:</strong> {inquiry.source || "Manual"}</p>
        <p><strong>Created:</strong> {inquiry.created_at ? formatFriendlyDateTime(inquiry.created_at) : "Not provided"}</p>
        <p><strong>Updated:</strong> {inquiry.updated_at ? formatFriendlyDateTime(inquiry.updated_at) : "Not provided"}</p>
        <label>Inquiry Status
          <select value={normalizeInquiryStatusValue(inquiry.status)} onChange={(event) => onStatusChange(inquiry, event.target.value)}>
            {inquiryStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <div className="inquiryConversionPanel">
          <p className="eyebrow">Booking Status</p>
          {inquiry.booking_id ? (
            <p><strong>Converted to Booking:</strong> {convertedBooking?.id || inquiry.booking_id}</p>
          ) : (
            <p><strong>Not yet converted.</strong> Confirm availability before creating the booking.</p>
          )}
        </div>
        <div className="clientBookingActions">
          {canDownloadPdf && <button type="button" onClick={() => onDownloadPdf?.(inquiry, convertedBooking)}><FileDown size={16} /> Download PDF</button>}
          <button type="button" onClick={() => onEdit(inquiry)}>Edit Inquiry</button>
          <button type="button" disabled={Boolean(inquiry.booking_id)} onClick={() => onConvert(inquiry)}>{inquiry.booking_id ? "Already Converted" : "Convert to Booking"}</button>
          {convertedBooking && <button type="button" onClick={() => onClose()}>View in Bookings</button>}
          <button type="button" onClick={onClose}>Close</button>
        </div>
        {pdfMessage && <p className="bookingPdfFeedback" role="status">{pdfMessage}</p>}
      </section>
    </div>
  );
}

function ManualReservationModal({
  form,
  setForm,
  services,
  selectedService,
  customers,
  clientRecords = [],
  branches = [],
  hasClientRecords = false,
  availability,
  usesPreferredSchedule,
  allowCoordinatedSchedule = false,
  isPestControl,
  onSelectCustomer,
  onSubmit,
  onClose,
}) {
  const customerOptions = customers.map((customer) => ({
    key: `${customer.customer || "Customer"}-${customer.contact || ""}`,
    label: `${customer.customer || "Customer"}${customer.contact ? ` • ${customer.contact}` : ""}`,
  }));
  const clientRecordOptions = clientRecords.map((record) => ({
    key: record.id,
    label: `${record.full_name || "Client"}${record.assigned_branch ? ` • ${record.assigned_branch}` : ""}${record.contact_number ? ` • ${record.contact_number}` : ""}`,
  }));
  const scheduleOptions = usesPreferredSchedule ? [] : (availability.slots || slots);
  const selectedPrice = selectedService?.price;
  const priceLabel = selectedPrice === null || selectedPrice === undefined || selectedPrice === "" ? "Contact for Rate" : formatPeso(selectedPrice);
  return (
    <div className="clientBookingDetailsBackdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="manualReservationModal" role="dialog" aria-modal="true" aria-label="Create reservation">
        <div className="manualReservationHeader">
          <div>
            <p className="eyebrow">Create Reservation</p>
            <h2>Add an offline reservation</h2>
            <p>Add a reservation received through phone, Messenger, walk-in, or other offline channels.</p>
          </div>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
        <form className="manualReservationForm" onSubmit={onSubmit}>
          <section>
            <h3><span>1</span> Customer</h3>
            <div className="manualToggleRow">
              {["new", "existing"].map((mode) => (
                <label key={mode}><input type="radio" name="manualCustomerMode" checked={form.customerMode === mode} onChange={() => setForm((current) => ({ ...current, customerMode: mode }))} /><span>{mode === "new" ? "New Customer" : "Existing Customer"}</span></label>
              ))}
            </div>
            {form.customerMode === "existing" && (
              <select value={form.existingCustomerKey} onChange={(event) => onSelectCustomer(event.target.value)}>
                <option value="">{hasClientRecords ? "Search client records" : "Search saved customers"}</option>
                {(hasClientRecords ? clientRecordOptions : customerOptions).map((customer) => <option key={customer.key} value={customer.key}>{customer.label}</option>)}
              </select>
            )}
            <div className="manualFormGrid">
              <input value={form.customer} onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))} placeholder="Full name *" required />
              <input value={form.contact} onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))} placeholder="Contact number *" required />
              <input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
              <input value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} placeholder="Address" />
            </div>
          </section>

          <section>
            <h3><span>2</span> Reservation</h3>
            <select value={form.serviceId} onChange={(event) => {
              const nextService = services.find((service) => service.id === event.target.value);
              setForm((current) => ({ ...current, serviceId: event.target.value, serviceName: nextService?.name || "" }));
            }} required>
              <option value="">Select service</option>
              {services.map((service) => <option key={service.id || service.name} value={service.id}>{service.name} - {service.price === null || service.price === undefined || service.price === "" ? "Contact for Rate" : formatPeso(service.price)}</option>)}
            </select>
            {selectedService && <div className="manualSelectedService"><strong>{selectedService.name}</strong><span>{priceLabel}</span></div>}
            {isPestControl && (
              <div className="manualFormGrid">
                <select value={form.propertyType} onChange={(event) => setForm((current) => ({ ...current, propertyType: event.target.value }))}>
                  {dmonsterPropertyTypes.map((propertyType) => <option key={propertyType}>{propertyType}</option>)}
                </select>
                <input type="number" min="1" step="1" value={form.areaSize} onChange={(event) => setForm((current) => ({ ...current, areaSize: event.target.value }))} placeholder="Area in sqm" />
                <select value={form.serviceArea} onChange={(event) => setForm((current) => ({ ...current, serviceArea: event.target.value }))}>
                  {dmonsterServiceAreas.map((serviceArea) => <option key={serviceArea}>{serviceArea}</option>)}
                </select>
                <input value={form.serviceLocation} onChange={(event) => setForm((current) => ({ ...current, serviceLocation: event.target.value }))} placeholder="Service location" />
              </div>
            )}
          </section>

          <section>
            <h3><span>3</span> Schedule</h3>
            {usesPreferredSchedule && <span className="manualScheduleBadge">24/7 service available</span>}
            <div className="manualFormGrid">
              {hasClientRecords && (
                <select value={form.branch} onChange={(event) => setForm((current) => ({ ...current, branch: event.target.value }))} required>
                  <option value="">Reservation branch *</option>
                  {branches.map((branch) => <option key={branch}>{branch}</option>)}
                </select>
              )}
              <input type="date" min={getTodayDateValue()} value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} required />
              {usesPreferredSchedule || allowCoordinatedSchedule ? (
                <input type="time" value={displayTimeToInput(form.time)} min={form.date === getTodayDateValue() ? getCurrentTimeInputValue() : undefined} onChange={(event) => setForm((current) => ({ ...current, time: timeInputToDisplay(event.target.value) }))} required />
              ) : (
                <select value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} required>
                  <option value="">Select time</option>
                  {scheduleOptions.map((slotValue) => <option key={slotValue}>{slotValue}</option>)}
                </select>
              )}
            </div>
            <p className="manualHint">{allowCoordinatedSchedule ? "Enter the date and time agreed with the customer." : usesPreferredSchedule ? "Open 24/7. Requested schedules are subject to business confirmation." : "Uses your configured Slotwise availability."}</p>
          </section>

          <section>
            <h3><span>4</span> Review</h3>
            <div className="manualReviewBox">
              <strong>{form.customer || "Customer name"}</strong>
              <span>{selectedService?.name || "Selected service"} • {form.date || "Date"} {form.time ? `at ${form.time}` : ""}</span>
              <small>{priceLabel} • Source: Manual</small>
            </div>
            <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Customer notes" rows="2" />
            <textarea value={form.internalNotes} onChange={(event) => setForm((current) => ({ ...current, internalNotes: event.target.value }))} placeholder="Internal notes, not shown publicly" rows="2" />
          </section>

          <div className="manualReservationActions">
            <button type="button" onClick={onClose}>Cancel</button>
            <button type="submit" className="clientPrimaryButton"><Plus size={16} /> Create Reservation</button>
          </div>
        </form>
      </section>
    </div>
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
  const statusOptions = ["All", ...bookingStatusOptions.map((item) => item.label), ...serviceOptions];
  const visibleBookings = (bookings || []).filter((booking) => {
    if (!(booking.booking_date || "").startsWith(monthKey)) return false;
    const statusMatch = ["All", ...bookingStatusOptions.map((item) => item.label)].includes(statusFilter)
      ? statusFilter === "All" || normalizeBookingStatusValue(booking.status) === normalizeBookingStatusValue(statusFilter)
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
                  <small>{getBookingStatusLabel(booking.status)}</small>
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
                <small>{booking.slot || "No preferred time"} / {getBookingStatusLabel(booking.status)}</small>
              </div>
              <p>{booking.note || "No notes provided"}</p>
              <div className="clientBookingActions">
                <select value={(booking.status || "PENDING").toUpperCase()} onChange={(event) => onStatusChange(booking, event.target.value)}>
                  {bookingStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
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

function BookingList({ bookings, onSelect, onStatusChange, onDelete }) {
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
            <span className={`clientSourcePill ${String(booking.metadata?.source || "online").toLowerCase()}`}>{String(booking.metadata?.source || "online").toLowerCase() === "manual" ? "Manual" : "Online"}</span>
            {booking.metadata?.test_booking && <span className="clientSourcePill demo">Test Booking</span>}
            <span className={`clientStatusPill ${getStatusClass(booking.status)}`}>{getBookingStatusLabel(booking.status)}</span>
            <select value={(booking.status || "PENDING").toUpperCase()} onChange={(event) => onStatusChange(booking, event.target.value)}>
              {bookingStatusOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            <button onClick={() => onSelect(booking)}>View Details</button>
            <button type="button" className="clientDeleteBookingButton" onClick={() => onDelete(booking)}><Trash2 size={15} /> Delete</button>
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
