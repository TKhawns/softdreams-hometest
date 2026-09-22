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

export function isSameMonth(a: Date, b: Date): boolean {
	return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function monthLabel(date: Date): string {
	return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

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
