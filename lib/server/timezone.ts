export const DEFAULT_TIMEZONE = "Europe/Copenhagen";

export const SUPPORTED_TIMEZONES = [
  { id: "Europe/Copenhagen", label: "Copenhagen (CET/CEST)" },
  { id: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { id: "Europe/Stockholm", label: "Stockholm (CET/CEST)" },
  { id: "Europe/Oslo", label: "Oslo (CET/CEST)" },
  { id: "Europe/London", label: "London (GMT/BST)" },
  { id: "UTC", label: "UTC" },
];

const isSupportedTimeZone = (timeZone: string) =>
  SUPPORTED_TIMEZONES.some((item) => item.id === timeZone);

export function resolveTimeZone(timeZone: unknown): string {
  const value = String(timeZone || "").trim();
  return isSupportedTimeZone(value) ? value : DEFAULT_TIMEZONE;
}

function zonedParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const map: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second),
  };
}

// IANA zone ids (e.g. "Europe/Copenhagen") carry the full DST rule set, so
// summer/winter time switches are resolved automatically — no manual offset needed.
export function todayKeyInTimeZone(timeZone: string = DEFAULT_TIMEZONE, date = new Date()) {
  const { year, month, day } = zonedParts(date, timeZone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function nowMinutesInTimeZone(timeZone: string = DEFAULT_TIMEZONE, date = new Date()) {
  const { hour, minute } = zonedParts(date, timeZone);
  return hour * 60 + minute;
}

export function nowLabelInTimeZone(timeZone: string = DEFAULT_TIMEZONE, date = new Date()) {
  return new Intl.DateTimeFormat("da-DK", {
    timeZone,
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}
