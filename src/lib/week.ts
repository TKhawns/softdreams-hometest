import { MONTHS_SHORT, startOfDay, WEEKDAYS_SHORT } from "./time";

/** Seven consecutive days (local midnight each), starting from the day of `now`. */
export function buildWeekDays(now: Date): Date[] {
	const anchor = startOfDay(now);
	return Array.from({ length: 7 }, (_, i) => addDays(anchor, i));
}

function addDays(date: Date, days: number): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** True when both dates fall on the same calendar day. */
export function isSameDay(a: Date, b: Date): boolean {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

export interface DayHeaderInfo {
	weekday: string;
	day: number;
}

/** "Mon" + "21", for the day column headers. */
export function dayHeaderInfo(date: Date): DayHeaderInfo {
	return { weekday: WEEKDAYS_SHORT[date.getDay()], day: date.getDate() };
}

/**
 * "Sep 21 – 27, 2026" (same month), "Sep 28 – Oct 4, 2026" (cross-month),
 * "Dec 28, 2026 – Jan 3, 2027" (year-crossing).
 */
export function formatWeekRangeLabel(days: Date[]): string {
	const first = days[0];
	const last = days[6];
	const firstMonth = MONTHS_SHORT[first.getMonth()];
	const lastMonth = MONTHS_SHORT[last.getMonth()];
	if (first.getMonth() === last.getMonth()) {
		return `${firstMonth} ${first.getDate()} – ${last.getDate()}, ${last.getFullYear()}`;
	}
	if (first.getFullYear() === last.getFullYear()) {
		return `${firstMonth} ${first.getDate()} – ${lastMonth} ${last.getDate()}, ${last.getFullYear()}`;
	}
	return `${firstMonth} ${first.getDate()}, ${first.getFullYear()} – ${lastMonth} ${last.getDate()}, ${last.getFullYear()}`;
}
