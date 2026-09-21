import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createEvent } from "../lib/events";
import { buildWeekDays } from "../lib/week";
import { WeekView } from "./WeekView";

const noop = () => {};

describe("WeekView smoke", () => {
	const days = buildWeekDays(new Date(2026, 8, 21, 12, 0)); // Mon Sep 21 2026
	const events = [
		createEvent({
			title: "Kickoff",
			description: "first meeting",
			start: new Date(2026, 8, 21, 10, 0),
			end: new Date(2026, 8, 21, 11, 0),
		}),
	];

	it("renders the week header, 7 day columns, hour gutter, today highlight and events", () => {
		const html = renderToString(
			<WeekView
				days={days}
				now={new Date(2026, 8, 21, 9, 30)}
				events={events}
				onOpenEvent={noop}
				onEventContextMenu={noop}
				onDragCreate={noop}
				onDragMove={noop}
			/>,
		);
		expect(html).toContain("Sep 21 – 27, 2026");
		for (const label of ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]) {
			expect(html).toContain(label);
		}
		expect(html).toContain("12 AM");
		expect(html).toContain("11 PM");
		expect(html).toContain("bg-blue-600");
		expect(html).toContain("bg-red-500");
		expect(html).toContain("Kickoff");
	});

	it("does not highlight a non-today week and shows no current-time line", () => {
		const weekAfter = buildWeekDays(new Date(2026, 8, 28, 12, 0)); // Mon Sep 28
		const html = renderToString(
			<WeekView
				days={weekAfter}
				now={new Date(2026, 9, 5, 9, 30)}
				events={events}
				onOpenEvent={noop}
				onEventContextMenu={noop}
				onDragCreate={noop}
				onDragMove={noop}
			/>,
		); // Mon Oct 5 — outside the displayed week
		expect(html).not.toContain("bg-blue-600");
		expect(html).not.toContain("bg-red-500");
		expect(html).not.toContain("Kickoff");
	});
});
