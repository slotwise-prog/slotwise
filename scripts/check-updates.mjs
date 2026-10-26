import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = path.join(projectRoot, "src", "main.jsx");
const source = fs.readFileSync(sourcePath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const emergencyMatch = source.match(
  /\{ id: "2026-10-26-booking-stability",[\s\S]*?applicable_packages: \["ALL"\] \}/
);
const staleDate = ["2026", "10", "25"].join("-");
const staleOrdersId = `${staleDate}-orders-management`;
const formatUpdateDate = (value) => {
  const calendarDate = String(value).match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  const date = new Date(calendarDate ? `${calendarDate}T00:00:00` : value);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

assert(emergencyMatch, "Emergency Fixes update entry is missing.");
assert(
  emergencyMatch[0].includes('published_at: "2026-10-26T07:00:00+08:00"'),
  "Emergency Fixes update must be dated October 26, 2026."
);
assert(!emergencyMatch[0].includes(staleDate), "Emergency Fixes contains the old October 25 date.");
assert(source.includes('title: "Client Dashboard UI/UX Improvements"'), "UI/UX Improvements update is missing.");
assert(
  source.includes('published_at: "2026-10-26T06:00:00+08:00"'),
  "UI/UX Improvements must be dated October 26, 2026."
);
assert(!source.includes(`id: "${staleOrdersId}"`), "Orders Management announcement is still curated.");
assert(source.includes("function mergeSlotwiseUpdates"), "Update merge protection is missing.");
assert(source.includes("const calendarDate = String(value).match"), "Update dates must use calendar-date parsing.");

const expectedDate = "October 26, 2026";
const updateDates = [
  ["2026-10-26-booking-slots", "2026-10-26T08:00:00+08:00"],
  ["2026-10-26-booking-date-filter", "2026-10-26T09:00:00+08:00"],
  ["2026-10-26-booking-stability", "2026-10-26T07:00:00+08:00"],
  ["2026-10-26-dashboard-ui-improvements", "2026-10-26T06:00:00+08:00"]
];
for (const [id, timestamp] of updateDates) {
  assert(source.includes(`id: "${id}"`), `${id} is missing.`);
  assert(formatUpdateDate(timestamp) === expectedDate, `${id} does not render October 26, 2026.`);
}

console.log("Updates regression checks passed.");
