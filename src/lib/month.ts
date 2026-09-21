import { startOfDay } from "./time";

const MONTHS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;

/** True when both dates fall in the same calendar month. */
export function isSameMonth(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/** "September 2026" — full month name and year. */
export function monthLabel(date: Date): string {
	return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/**
 * The 42 cells (6 weeks × 7 days) of the month containing `anchor`, starting
 * on the Sunday on or before the first of the month (matching the week grid's
 * Sunday-first columns). Cells before/after the month bleed into neighbours.
 */
export function buildMonthCells(anchor: Date): Date[] {
	const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
	const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
	return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

function addDays(date: Date, days: number): Date {
	const dayStart = startOfDay(date);
	return new Date(
		dayStart.getFullYear(),
		dayStart.getMonth(),
		dayStart.getDate() + days,
	);
}
