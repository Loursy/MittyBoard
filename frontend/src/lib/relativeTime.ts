const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 1000 * 60 * 60 * 24 * 365],
  ["month", 1000 * 60 * 60 * 24 * 30],
  ["week", 1000 * 60 * 60 * 24 * 7],
  ["day", 1000 * 60 * 60 * 24],
  ["hour", 1000 * 60 * 60],
  ["minute", 1000 * 60],
];

const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

/** Short relative label like "3d ago" / "just now" for a past ISO timestamp. */
export function relativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  for (const [unit, ms] of UNITS) {
    const value = Math.round(diffMs / ms);
    if (Math.abs(value) >= 1) return formatter.format(value, unit);
  }
  return "just now";
}
