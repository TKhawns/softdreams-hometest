import { describe, expect, it } from "vitest";

import { startOfDay } from "./time";
import {
	buildWeekDays,
	dayHeaderInfo,
	formatWeekRangeLabel,
	isSameDay,
} from "./week";

describe("week helpers", () => {
	it("buildWeekDays returns 7 consecutive days from local midnight of the day of now", () => {
		const now = new Date(2026, 8, 21, 14, 30); // Mon Sep 21 2026
		const days = buildWeekDays(now);
		expect(days).toHaveLength(7);
		expect(days[0].getDay()).toBe(1); // Monday
		expect(days[0].getHours()).toBe(0);
		expect(days[0].getDate()).toBe(21);
		for (let i = 1; i < 7; i++) {
			const prev = days[i - 1];
			const cur = days[i];
			expect(cur.getTime() - prev.getTime()).toBe(24 * 60 * 60 * 1000);
		}
		expect(days[6].getDate()).toBe(27);
	});

	it("isSameDay compares calendar days ignoring time", () => {
		expect(
			isSameDay(new Date(2026, 8, 21, 0, 0), new Date(2026, 8, 21, 23, 59)),
		).toBe(true);
		expect(
			isSameDay(new Date(2026, 8, 21, 12, 0), new Date(2026, 8, 22, 1, 0)),
		).toBe(false);
	});

	it('dayHeaderInfo renders "Mon" and "21" for a weekday', () => {
		const info = dayHeaderInfo(new Date(2026, 8, 21, 10, 0));
		expect(info.weekday).toBe("Mon");
		expect(info.day).toBe(21);
		expect(dayHeaderInfo(new Date(2026, 8, 27, 10, 0)).weekday).toBe("Sun");
	});

	it("formatWeekRangeLabel renders same-month weeks", () => {
		const days = buildWeekDays(new Date(2026, 8, 21, 12, 0));
		expect(formatWeekRangeLabel(days)).toBe("Sep 21 – 27, 2026");
	});

	it("formatWeekRangeLabel renders cross-month weeks", () => {
		const days = buildWeekDays(new Date(2026, 8, 28, 12, 0)); // Mon Sep 28 2026
		expect(formatWeekRangeLabel(days)).toBe("Sep 28 – Oct 4, 2026");
	});

	it("formatWeekRangeLabel renders year-crossing weeks", () => {
		const days = buildWeekDays(new Date(2026, 11, 28, 12, 0)); // Mon Dec 28 2026
		expect(formatWeekRangeLabel(days)).toBe("Dec 28, 2026 – Jan 3, 2027");
	});

	it("startOfDay dependency is consistent with the week grid anchor", () => {
		const now = new Date(2026, 8, 21, 8, 15);
		expect(startOfDay(now).getTime()).toBe(buildWeekDays(now)[0].getTime());
	});
});
