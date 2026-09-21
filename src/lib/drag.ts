import {
	buildRange,
	clampMinutes,
	GRID_STEP_MINUTES,
	MIN_EVENT_MINUTES,
	snapMinutes,
} from "./geometry";
import { MINUTES_PER_DAY } from "./time";

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
 * The new event range (minutes-of-day) after a move-drag: the original
 * duration is preserved, the new start snaps to the grid, and the whole
 * range stays within [0, 1440].
 */
export function moveEventRange(
	startMinute: number,
	endMinute: number,
	newStartMinute: number,
): { start: number; end: number } {
	const duration = endMinute - startMinute;
	const start = clampMinutes(
		snapMinutes(newStartMinute, GRID_STEP_MINUTES),
		0,
		MINUTES_PER_DAY - duration,
	);
	return { start, end: start + duration };
}
