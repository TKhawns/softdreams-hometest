import { describe, expect, it } from "vitest";

import {
	buildRange,
	clampMinutes,
	durationMinutes,
	durationToHeight,
	eventSegmentForDay,
	minutesToY,
	normalizeRange,
	snapMinutes,
	timeToY,
	yToMinutes,
} from "./geometry";

const HOUR = 48;

describe("grid geometry", () => {
	it("minutesToY maps minutes of day to pixels below the top", () => {
		expect(minutesToY(0, HOUR)).toBe(0);
		expect(minutesToY(60, HOUR)).toBe(48);
		expect(minutesToY(90, HOUR)).toBe(72);
		expect(minutesToY(720, HOUR)).toBe(576);
	});

	it("yToMinutes is the inverse and clamps into the day", () => {
		expect(yToMinutes(0, HOUR)).toBe(0);
		expect(yToMinutes(48, HOUR)).toBe(60);
		expect(yToMinutes(100, HOUR)).toBe(125);
		expect(yToMinutes(-10, HOUR)).toBe(0);
		expect(yToMinutes(1_000_000, HOUR)).toBe(1440);
	});

	it("timeToY positions a date within its day", () => {
		expect(timeToY(new Date(2026, 8, 21, 9, 30), HOUR)).toBe(456);
		expect(timeToY(new Date(2026, 8, 21, 0, 0), HOUR)).toBe(0);
	});

	it("durationToHeight converts a time span to pixels", () => {
		const start = new Date(2026, 8, 21, 10, 0);
		expect(durationToHeight(start, new Date(2026, 8, 21, 11, 0), HOUR)).toBe(
			48,
		);
		expect(durationToHeight(start, new Date(2026, 8, 21, 10, 30), HOUR)).toBe(
			24,
		);
	});

	it("durationMinutes is the span in whole minutes", () => {
		expect(
			durationMinutes(
				new Date(2026, 8, 21, 10, 0),
				new Date(2026, 8, 21, 11, 30),
			),
		).toBe(90);
	});

	it("snapMinutes rounds to the nearest grid step", () => {
		expect(snapMinutes(0, 15)).toBe(0);
		expect(snapMinutes(7, 15)).toBe(0);
		expect(snapMinutes(8, 15)).toBe(15);
		expect(snapMinutes(22, 15)).toBe(15);
		expect(snapMinutes(23, 15)).toBe(30);
		expect(snapMinutes(38, 15)).toBe(45);
	});

	it("normalizeRange orders a dragged range regardless of direction", () => {
		expect(normalizeRange(30, 15)).toEqual({ start: 15, end: 30 });
		expect(normalizeRange(10, 10)).toEqual({ start: 10, end: 10 });
	});

	it("clampMinutes bounds into the grid", () => {
		expect(clampMinutes(-40, 0, 1440)).toBe(0);
		expect(clampMinutes(1500, 0, 1440)).toBe(1440);
		expect(clampMinutes(300, 0, 1440)).toBe(300);
	});

	it("buildRange normalizes, enforces a minimum duration and clamps", () => {
		// reversed drag, too short → extends the end
		expect(buildRange(50, 40, 15)).toEqual({ start: 40, end: 55 });
		// start clipped to the grid top
		expect(buildRange(-30, 30, 15)).toEqual({ start: 0, end: 30 });
		// zero-length at the end of the day clamps to the grid bottom
		expect(buildRange(1430, 1430, 15)).toEqual({ start: 1430, end: 1440 });
	});

	it("eventSegmentForDay clips a multi-day event to one day", () => {
		const day = new Date(2026, 8, 21, 0, 0);
		const inside = {
			start: new Date(2026, 8, 21, 10, 0),
			end: new Date(2026, 8, 21, 11, 0),
		};
		expect(eventSegmentForDay(inside, day)).toEqual(inside);

		// Sep 21 22:00 → Sep 22 02:00: Sep 21 segment ends at midnight
		const spanning = {
			start: new Date(2026, 8, 21, 22, 0),
			end: new Date(2026, 8, 22, 2, 0),
		};
		expect(eventSegmentForDay(spanning, day)).toEqual({
			start: new Date(2026, 8, 21, 22, 0),
			end: new Date(2026, 8, 22, 0, 0),
		});

		// same event on the next day: segment starts at midnight
		const nextDay = new Date(2026, 8, 22, 0, 0);
		expect(eventSegmentForDay(spanning, nextDay)).toEqual({
			start: new Date(2026, 8, 22, 0, 0),
			end: new Date(2026, 8, 22, 2, 0),
		});
	});

	it("eventSegmentForDay returns null for events outside the day", () => {
		const day = new Date(2026, 8, 21, 0, 0);
		const before = {
			start: new Date(2026, 8, 20, 20, 0),
			end: new Date(2026, 8, 20, 21, 0),
		};
		const after = {
			start: new Date(2026, 8, 22, 20, 0),
			end: new Date(2026, 8, 22, 21, 0),
		};
		expect(eventSegmentForDay(before, day)).toBeNull();
		expect(eventSegmentForDay(after, day)).toBeNull();
	});
});
