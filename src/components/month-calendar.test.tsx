import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { buildWeekDays } from "../lib/week";
import { MonthCalendar } from "./MonthCalendar";

const noop = () => {};

describe("MonthCalendar smoke", () => {
	const days = buildWeekDays(new Date(2026, 8, 21, 12, 0)); // Mon Sep 21 2026

	it("renders the month label, weekday headers, day cells and viewport highlights", () => {
		const html = renderToString(
			<MonthCalendar
				days={days}
				now={new Date(2026, 8, 21, 9, 30)}
				onSelectDay={noop}
			/>,
		);
		expect(html).toContain("September 2026");
		for (const label of ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) {
			expect(html).toContain(label);
		}
		// The 7 viewport days — Sep 21 is "today" (bg-blue-600); the other 6
		// are highlighted with bg-blue-100.
		expect(html.match(/bg-blue-100/g)).toHaveLength(6);
		expect(html).toContain("bg-blue-600");
		expect(html).toContain("21");
	});

	it("highlights the in-month days of a cross-month viewport", () => {
		// A late-September viewport (Sep 28 – Oct 4) shows only its 3
		// September days highlighted inside the September grid.
		const week = buildWeekDays(new Date(2026, 8, 28, 12, 0)); // Mon Sep 28
		const html = renderToString(
			<MonthCalendar
				days={week}
				now={new Date(2026, 8, 30, 9, 30)}
				onSelectDay={noop}
			/>,
		);
		expect(html).toContain("September 2026");
		// Of the 7 viewport days (Sep 28 – Oct 4), Sep 30 is "today"
		// (bg-blue-600); the other 6 — including Oct 1–4 that bleed into the
		// next month — are highlighted in the grid.
		expect(html.match(/bg-blue-100/g)).toHaveLength(6);
	});

	it("provides previous/next month navigation", () => {
		const html = renderToString(
			<MonthCalendar
				days={days}
				now={new Date(2026, 8, 21, 9, 30)}
				onSelectDay={noop}
			/>,
		);
		expect(html).toContain('aria-label="Previous month"');
		expect(html).toContain('aria-label="Next month"');
	});
});
