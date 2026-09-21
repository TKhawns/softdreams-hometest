import {
	buildRange,
	clampMinutes,
	GRID_STEP_MINUTES,
	MIN_EVENT_MINUTES,
	snapMinutes,
} from "./geometry";
import { addMinutes, MINUTES_PER_DAY, MS_PER_MINUTE } from "./time";

/**
 * The final event range (minutes-of-day) for a drag-create gesture:
 * endpoints snapped to the grid, minimum duration enforced, clamped to the
 * visible day. Order-independent.
 */
export function snapDragRange(
	rawStart: number,
	rawEnd: number,
): { start: number; end: number } {
	return buildRange(
		snapMinutes(rawStart, GRID_STEP_MINUTES),
		snapMinutes(rawEnd, GRID_STEP_MINUTES),
		MIN_EVENT_MINUTES,
	);
}

/**
 * The new full event range after a move-drag. The WHOLE event keeps its total
 * duration; only its start is re-anchored on the drag day (snapped to the
 * grid, clamped to not start before midnight). The end may overflow into the
 * next day, which is what preserves the duration of multi-day events.
 *
 * `rawNewStartMinute` is minutes-of-day relative to `dayStart`. Never derive
 * it from a day-1 segment's minute-of-day: `eventSegmentForDay` clips such a
 * segment's end to next-day midnight, and minutesSinceMidnight of that instant
 * is 0, not 1440, which corrupts the dragged span.
 */
export function moveWholeEvent(
	event: { start: Date; end: Date },
	dayStart: Date,
	rawNewStartMinute: number,
): { start: Date; end: Date } {
	const durationMinutes =
		(event.end.getTime() - event.start.getTime()) / MS_PER_MINUTE;
	const start = addMinutes(
		dayStart,
		clampMinutes(
			snapMinutes(rawNewStartMinute, GRID_STEP_MINUTES),
			0,
			MINUTES_PER_DAY - 1,
		),
	);
	return { start, end: addMinutes(start, durationMinutes) };
}
