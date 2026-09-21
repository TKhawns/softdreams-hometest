export const MS_PER_MINUTE = 60 * 1000;
export const MINUTES_PER_DAY = 24 * 60;

export const MONTHS_SHORT = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
] as const;

export const WEEKDAYS_SHORT = [
	"Sun",
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
] as const;

/** Local midnight of the same calendar day. */
export function startOfDay(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Whole minutes elapsed since local midnight (seconds are ignored). */
export function minutesSinceMidnight(date: Date): number {
	return date.getHours() * 60 + date.getMinutes();
}

/** A new Date offset by whole minutes (handles day/month/year rollovers). */
export function addMinutes(date: Date, minutes: number): Date {
	return new Date(date.getTime() + minutes * MS_PER_MINUTE);
}

/** "09:05" — 24h, zero-padded. */
export function formatTime(date: Date): string {
	const h = String(date.getHours()).padStart(2, "0");
	const m = String(date.getMinutes()).padStart(2, "0");
	return `${h}:${m}`;
}

/** "12 AM", "1 PM" — 12h label for the hour gutter, from minutes since midnight. */
export function formatHour(minutesOfDay: number): string {
	const hour = Math.floor(minutesOfDay / 60) % 24;
	const period = hour < 12 ? "AM" : "PM";
	const hour12 = hour % 12 === 0 ? 12 : hour % 12;
	return `${hour12} ${period}`;
}

/** "Mon, Sep 21 · 09:30" — readable full datetime for dialogs. */
export function formatDateTime(date: Date): string {
	const weekday = WEEKDAYS_SHORT[date.getDay()];
	const month = MONTHS_SHORT[date.getMonth()];
	return `${weekday}, ${month} ${date.getDate()} · ${formatTime(date)}`;
}
