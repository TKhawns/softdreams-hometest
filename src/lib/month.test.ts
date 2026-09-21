import { describe, expect, it } from "vitest";

import { buildMonthCells, isSameMonth, monthLabel } from "./month";

describe("month helpers", () => {
	it("buildMonthCells returns 42 cells starting on the Sunday on/before the month's first day", () => {
		const cells = buildMonthCells(new Date(2026, 8, 21)); // September 2026
		expect(cells).toHaveLength(42);
		expect(cells[0]).toEqual(new Date(2026, 7, 30)); // Sun Aug 30 (Sep 1 2026 is a Tue)
		expect(cells[1]).toEqual(new Date(2026, 7, 31));
		expect(cells[2]).toEqual(new Date(2026, 8, 1));
		expect(cells[41]).toEqual(new Date(2026, 9, 10));
	});

	it("buildMonthCells includes every day of the month exactly once", () => {
		const cells = buildMonthCells(new Date(2026, 8, 21));
		const days = cells
			.filter((cell) => cell.getMonth() === 8)
			.map((cell) => cell.getDate());
		expect(days).toHaveLength(30); // September has 30 days
		for (let d = 1; d <= 30; d++) {
			expect(days).toContain(d);
		}
	});

	it("buildMonthCells cells are consecutive days within the 6-week grid", () => {
		const cells = buildMonthCells(new Date(2026, 8, 21));
		for (let i = 1; i < cells.length; i++) {
			expect(cells[i].getTime() - cells[i - 1].getTime()).toBe(
				24 * 60 * 60 * 1000,
			);
		}
	});

	it("isSameMonth compares year and month only", () => {
		expect(isSameMonth(new Date(2026, 8, 1), new Date(2026, 8, 30))).toBe(true);
		expect(isSameMonth(new Date(2026, 8, 30), new Date(2026, 9, 1))).toBe(
			false,
		);
		expect(isSameMonth(new Date(2026, 8, 1), new Date(2027, 8, 1))).toBe(false);
	});

	it("monthLabel renders a full month name and year", () => {
		expect(monthLabel(new Date(2026, 8, 21))).toBe("September 2026");
		expect(monthLabel(new Date(2026, 0, 5))).toBe("January 2026");
	});
});
