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

export function formatTime(date: Date): string {
	const h = String(date.getHours()).padStart(2, "0");
	const m = String(date.getMinutes()).padStart(2, "0");
	return `${h}:${m}`;
}

export function formatHour(minutesOfDay: number): string {
	const hour = Math.floor(minutesOfDay / 60) % 24;
	const period = hour < 12 ? "AM" : "PM";
	const hour12 = hour % 12 === 0 ? 12 : hour % 12;
	return `${hour12} ${period}`;
}

export function formatDateTime(date: Date): string {
	const weekday = WEEKDAYS_SHORT[date.getDay()];
	const month = MONTHS_SHORT[date.getMonth()];
	return `${weekday}, ${month} ${date.getDate()} · ${formatTime(date)}`;
}

function pad2(n: number): string {
	return String(n).padStart(2, "0");
}

export function parseDateTimeLocal(value: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const hour = Number(match[4]);
	const minute = Number(match[5]);
	if (
		month < 1 ||
		month > 12 ||
		day < 1 ||
		day > 31 ||
		hour > 23 ||
		minute > 59
	) {
		return null;
	}
	const date = new Date(year, month - 1, day, hour, minute);
	if (
		date.getMonth() !== month - 1 ||
		date.getDate() !== day ||
		date.getHours() !== hour ||
		date.getMinutes() !== minute
	) {
		return null;
	}
	return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTimeLocal(date: Date): string {
	return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function dateAtMinutesOfDay(day: Date, minute: number): Date {
	return addMinutes(startOfDay(day), minute);
}
