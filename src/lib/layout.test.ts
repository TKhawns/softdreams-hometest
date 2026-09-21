import { describe, expect, it } from "vitest";

import { layoutDaySegments } from "./layout";

describe("layoutDaySegments", () => {
	it("gives non-overlapping events the full column width", () => {
		const placed = layoutDaySegments([
			{ id: "a", start: 540, end: 600 }, // 9:00–10:00
			{ id: "b", start: 660, end: 720 }, // 11:00–12:00
		]);
		expect(placed).toEqual([
			{ id: "a", start: 540, end: 600, left: 0, width: 1 },
			{ id: "b", start: 660, end: 720, left: 0, width: 1 },
		]);
	});

	it("splits two overlapping events side by side", () => {
		const placed = layoutDaySegments([
			{ id: "a", start: 540, end: 660 }, // 9:00–11:00
			{ id: "b", start: 600, end: 720 }, // 10:00–12:00
		]);
		expect(placed).toEqual([
			{ id: "a", start: 540, end: 660, left: 0, width: 0.5 },
			{ id: "b", start: 600, end: 720, left: 0.5, width: 0.5 },
		]);
	});

	it("places a chained third event back in a freed column", () => {
		const placed = layoutDaySegments([
			{ id: "a", start: 540, end: 660 }, // 9:00–11:00
			{ id: "b", start: 600, end: 720 }, // 10:00–12:00
			{ id: "c", start: 660, end: 780 }, // 11:00–13:00 (overlaps only b)
		]);
		const byId = Object.fromEntries(placed.map((p) => [p.id, p]));
		expect(byId.a).toEqual({
			id: "a",
			start: 540,
			end: 660,
			left: 0,
			width: 0.5,
		});
		expect(byId.b).toEqual({
			id: "b",
			start: 600,
			end: 720,
			left: 0.5,
			width: 0.5,
		});
		expect(byId.c).toEqual({
			id: "c",
			start: 660,
			end: 780,
			left: 0,
			width: 0.5,
		});
	});

	it("sorts by start time so layout is independent of input order", () => {
		const placed = layoutDaySegments([
			{ id: "b", start: 600, end: 720 },
			{ id: "a", start: 540, end: 660 },
		]);
		expect(placed.map((p) => p.id)).toEqual(["a", "b"]);
	});
});
