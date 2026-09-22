import {
	buildRange,
	clampMinutes,
	GRID_STEP_MINUTES,
	LAST_HOUR_START_MINUTES,
	MIN_EVENT_MINUTES,
	snapMinutes,
} from "./geometry";
import { addMinutes, dateAtMinutesOfDay, MS_PER_MINUTE } from "./time";

export function defaultCreateRange(
	day: Date,
	clickMinuteOfDay: number,
): { start: Date; end: Date } {
	const startMinute = clampMinutes(
		snapMinutes(clickMinuteOfDay, GRID_STEP_MINUTES),
		0,
		LAST_HOUR_START_MINUTES,
	);
	return {
		start: dateAtMinutesOfDay(day, startMinute),
		end: dateAtMinutesOfDay(day, startMinute + 60),
	};
}

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
 * grid, clamped to the visible day). The end may overflow into the next day,
 * which is what preserves the duration of multi-day events. The start cannot
 * go past the last visible hour (11 PM): the midnight marker sits at the TOP
 * of the grid, so the bottom of the grid is the 11 PM hour, not next midnight.
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
			LAST_HOUR_START_MINUTES,
		),
	);
	return { start, end: addMinutes(start, durationMinutes) };
}
