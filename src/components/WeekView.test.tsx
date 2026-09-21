import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { buildWeekDays } from "../lib/week";
import { WeekView } from "./WeekView";

describe("WeekView smoke", () => {
	const days = buildWeekDays(new Date(2026, 8, 21, 12, 0)); // Mon Sep 21 2026

	it("renders the week header, 7 day columns, hour gutter and today highlight", () => {
		const html = renderToString(
			<WeekView days={days} now={new Date(2026, 8, 21, 9, 30)} />,
		);
		expect(html).toContain("Sep 21 – 27, 2026");
		// all seven weekday labels
		for (const label of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
			expect(html).toContain(label);
		}
		// hour gutter labels
		expect(html).toContain("12 AM");
		expect(html).toContain("11 PM");
		// today pill is highlighted
		expect(html).toContain("bg-blue-600");
		// current-time indicator renders because now is Monday
		expect(html).toContain("bg-red-500");
	});

	it("does not highlight a non-today week and shows no current-time line", () => {
		const weekAfter = buildWeekDays(new Date(2026, 8, 28, 12, 0)); // Mon Sep 28
		const html = renderToString(
			<WeekView days={weekAfter} now={new Date(2026, 9, 5, 9, 30)} />,
		); // Mon Oct 5 — outside the displayed week
		expect(html).not.toContain("bg-blue-600");
		expect(html).not.toContain("bg-red-500");
	});
});
