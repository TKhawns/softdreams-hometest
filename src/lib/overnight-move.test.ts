import { describe, expect, it } from "vitest";

import { moveWholeEvent } from "./drag";
import { createEvent, isEventRangeValid } from "./events";
import { eventSegmentForDay } from "./geometry";
import { MS_PER_MINUTE } from "./time";

// Regression for a found Critical bug: dragging the day-1 (midnight-clipped)
// segment of an overnight event used to commit end < start because the
// segment's minute-of-day was derived with minutesSinceMidnight (0 for
// next-day midnight) instead of day-relative minutes.
describe("overnight event move regression", () => {
	it("day segments use day-relative minutes, so the clipped end is 1440, not 0", () => {
		const day = new Date(2026, 8, 21, 0, 0); // Mon
		const event = createEvent({
			title: "Overnight",
			description: "",
			start: new Date(2026, 8, 21, 22, 0), // Mon 22:00
			end: new Date(2026, 8, 22, 2, 0), // Tue 02:00
		});
		const segment = eventSegmentForDay(event, day);
		expect(segment).not.toBeNull();
		if (!segment) return;
		// The segment on its start day ends at next-day midnight.
		const endMinute = (segment.end.getTime() - day.getTime()) / MS_PER_MINUTE;
		expect(endMinute).toBe(1440);
	});

	it("moves the whole event (start re-anchored, total duration kept) and stays valid", () => {
		const day = new Date(2026, 8, 21, 0, 0); // Mon
		const event = createEvent({
			title: "Overnight",
			description: "",
			start: new Date(2026, 8, 21, 22, 0),
			end: new Date(2026, 8, 22, 2, 0),
		});
		const moved = moveWholeEvent(event, day, 795); // drop 13:15
		expect(isEventRangeValid(moved)).toBe(true);
		expect(moved.start).toEqual(new Date(2026, 8, 21, 13, 15));
		expect(moved.end).toEqual(new Date(2026, 8, 21, 17, 15));
	});
});
