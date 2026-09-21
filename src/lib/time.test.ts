import { describe, expect, it } from "vitest";

import {
	addMinutes,
	formatDateTime,
	formatHour,
	formatTime,
	minutesSinceMidnight,
	startOfDay,
} from "./time";

describe("time helpers", () => {
	it("startOfDay returns local midnight of the same calendar day", () => {
		const d = new Date(2026, 8, 21, 14, 37, 12);
		const sod = startOfDay(d);
		expect(sod.getFullYear()).toBe(2026);
		expect(sod.getMonth()).toBe(8);
		expect(sod.getDate()).toBe(21);
		expect(sod.getHours()).toBe(0);
		expect(sod.getMinutes()).toBe(0);
		expect(sod.getSeconds()).toBe(0);
	});

	it("minutesSinceMidnight counts whole minutes from local midnight", () => {
		expect(minutesSinceMidnight(new Date(2026, 8, 21, 0, 0))).toBe(0);
		expect(minutesSinceMidnight(new Date(2026, 8, 21, 9, 30, 45))).toBe(570);
		expect(minutesSinceMidnight(new Date(2026, 8, 21, 23, 59))).toBe(1439);
	});

	it("addMinutes shifts a date across hour and day boundaries", () => {
		const base = new Date(2026, 8, 21, 22, 50);
		const next = addMinutes(base, 30);
		expect(next.getHours()).toBe(23);
		expect(next.getMinutes()).toBe(20);

		const over = addMinutes(base, 90);
		expect(over.getDate()).toBe(22);
		expect(over.getHours()).toBe(0);
		expect(over.getMinutes()).toBe(20);
	});

	it("formatTime renders 24h HH:mm zero-padded", () => {
		expect(formatTime(new Date(2026, 8, 21, 9, 5))).toBe("09:05");
		expect(formatTime(new Date(2026, 8, 21, 0, 0))).toBe("00:00");
		expect(formatTime(new Date(2026, 8, 21, 23, 59))).toBe("23:59");
	});

	it("formatHour renders 12h labels for the hour gutter", () => {
		expect(formatHour(0)).toBe("12 AM");
		expect(formatHour(60)).toBe("1 AM");
		expect(formatHour(11 * 60)).toBe("11 AM");
		expect(formatHour(12 * 60)).toBe("12 PM");
		expect(formatHour(13 * 60)).toBe("1 PM");
		expect(formatHour(23 * 60)).toBe("11 PM");
	});

	it('formatDateTime renders "Mon, Sep 21 · 09:30" style labels', () => {
		expect(formatDateTime(new Date(2026, 8, 21, 9, 30))).toBe(
			"Mon, Sep 21 · 09:30",
		);
		expect(formatDateTime(new Date(2026, 8, 21, 0, 0))).toBe(
			"Mon, Sep 21 · 00:00",
		);
	});
});
