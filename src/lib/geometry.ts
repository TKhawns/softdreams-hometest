import { MS_PER_MINUTE, minutesSinceMidnight } from "./time";

export const HOUR_HEIGHT_PX = 48;

export const VIEW_START_MINUTES = 0;

export const VIEW_END_MINUTES = 24 * 60;

/** First minute of the last visible hour (23:00). A moved event's start may
 *  not go past this: the "12 AM" marker sits at the top of the grid, so the
 *  bottom limit is the 11 PM hour, not next midnight. */
export const LAST_HOUR_START_MINUTES = 23 * 60;

export const GRID_STEP_MINUTES = 15;

export const MIN_EVENT_MINUTES = 15;

/** Pixels from the top of a day column for a given minute of the day. */
export function minutesToY(minutesOfDay: number, hourHeight: number): number {
	return (minutesOfDay / 60) * hourHeight;
}

/** Minute of day for a pixel offset, clamped to the visible grid. */
export function yToMinutes(y: number, hourHeight: number): number {
	return clampMinutes(
		Math.round((y / hourHeight) * 60),
		VIEW_START_MINUTES,
		VIEW_END_MINUTES,
	);
}

/** Pixels from the top of a day column for a date (within its day). */
export function timeToY(date: Date, hourHeight: number): number {
	return minutesToY(minutesSinceMidnight(date), hourHeight);
}

/** Pixel height for a time span. */
export function durationToHeight(
	start: Date,
	end: Date,
	hourHeight: number,
): number {
	return (durationMinutes(start, end) / 60) * hourHeight;
}

/** Whole minutes between two dates (seconds ignored). */
export function durationMinutes(start: Date, end: Date): number {
	return Math.round((end.getTime() - start.getTime()) / MS_PER_MINUTE);
}

/** Round a minute-of-day to the nearest multiple of `step`. */
export function snapMinutes(minutes: number, step: number): number {
	return Math.round(minutes / step) * step;
}

/** Order a possibly-reversed range into { start <= end }. */
export function normalizeRange(
	a: number,
	b: number,
): { start: number; end: number } {
	return a <= b ? { start: a, end: b } : { start: b, end: a };
}

/** Bound a minute-of-day into [min, max]. */
export function clampMinutes(
	minutes: number,
	min: number,
	max: number,
): number {
	return Math.min(max, Math.max(min, minutes));
}

/**
 * Which day column (0-based) contains a client x coordinate. `left`/`width`
 * describe the container that holds the equally-sized columns; out-of-range
 * coordinates clamp to the nearest column.
 */
export function columnIndexAtX(
	x: number,
	left: number,
	width: number,
	columnCount: number,
): number {
	if (width <= 0 || columnCount <= 0) return 0;
	const columnWidth = width / columnCount;
	return clampMinutes(Math.floor((x - left) / columnWidth), 0, columnCount - 1);
}

/**
 * Build a final event range from a drag: normalize direction, enforce the
 * minimum duration by extending the end, then clamp both edges to the grid.
 */
export function buildRange(
	a: number,
	b: number,
	minDurationMinutes: number,
): { start: number; end: number } {
	const normalized = normalizeRange(a, b);
	const end = Math.max(normalized.end, normalized.start + minDurationMinutes);
	return {
		start: clampMinutes(normalized.start, VIEW_START_MINUTES, VIEW_END_MINUTES),
		end: clampMinutes(end, VIEW_START_MINUTES, VIEW_END_MINUTES),
	};
}

export interface DayEventSegment {
	start: Date;
	end: Date;
}

/**
 * The portion of an event that falls within the given calendar day
 * (dayStart at local midnight), or null when the event does not touch it.
 * Multi-day events yield one segment per day.
 */
export function eventSegmentForDay(
	event: { start: Date; end: Date },
	dayStart: Date,
): DayEventSegment | null {
	const dayEnd = new Date(
		dayStart.getFullYear(),
		dayStart.getMonth(),
		dayStart.getDate() + 1,
	);
	const start =
		event.start.getTime() > dayStart.getTime() ? event.start : dayStart;
	const end = event.end.getTime() < dayEnd.getTime() ? event.end : dayEnd;
	if (start.getTime() >= end.getTime()) {
		return null;
	}
	return { start, end };
}
