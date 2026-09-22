import { MONTHS_SHORT, startOfDay, WEEKDAYS_SHORT } from "./time";

/** Seven consecutive days (local midnight each), starting from the day of `now`. */
export function buildWeekDays(now: Date): Date[] {
	const anchor = startOfDay(now);
	return Array.from({ length: 7 }, (_, i) => addDays(anchor, i));
}

/** A new Date offset by whole days (local calendar arithmetic). */
export function addDays(date: Date, days: number): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

/** Shift the week window forward/back by `weeks` (positive = forward). */
export function shiftWeek(days: Date[], weeks: number): Date[] {
	return buildWeekDays(addDays(days[0], weeks * 7));
}

export function formatDayHeading(date: Date): string {
	return `${WEEKDAYS_SHORT[date.getDay()]}, ${MONTHS_SHORT[date.getMonth()]} ${date.getDate()}`;
}

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

export function dayHeaderInfo(date: Date): DayHeaderInfo {
	return { weekday: WEEKDAYS_SHORT[date.getDay()], day: date.getDate() };
}

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
