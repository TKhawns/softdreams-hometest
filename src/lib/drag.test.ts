import { describe, expect, it } from "vitest";

import { moveWholeEvent, snapDragRange } from "./drag";

describe("snapDragRange", () => {
	it("snaps both endpoints to the 15-minute grid", () => {
		expect(snapDragRange(547, 653)).toEqual({ start: 540, end: 660 }); // 9:07→10:53 ⇒ 9:00→11:00
	});

	it("enforces the minimum drag duration when both ends snap to the same slot", () => {
		expect(snapDragRange(600, 607)).toEqual({ start: 600, end: 615 }); // 10:00–10:07 ⇒ 10:00–10:15
	});

	it("normalizes a drag that went upwards", () => {
		expect(snapDragRange(630, 600)).toEqual({ start: 600, end: 630 }); // start 10:30, end 10:00 ⇒ 10:00–10:30
	});

	it("clamps a drag past midnight into the visible day", () => {
		expect(snapDragRange(-60, 1500)).toEqual({ start: 0, end: 1440 });
	});
});

describe("moveWholeEvent", () => {
	const day = new Date(2026, 8, 21, 0, 0); // Mon Sep 21

	it("moves a same-day event, preserving duration, snapping the new start", () => {
		const moved = moveWholeEvent(
			{
				start: new Date(2026, 8, 21, 9, 15),
				end: new Date(2026, 8, 21, 10, 45),
			},
			day,
			845,
		); // drop 14:05
		expect(moved).toEqual({
			start: new Date(2026, 8, 21, 14, 0),
			end: new Date(2026, 8, 21, 15, 30),
		});
	});

	it("moves a multi-day event wholesale, anchoring its start on the drag day", () => {
		const overnight = {
			start: new Date(2026, 8, 21, 22, 0), // Mon 22:00
			end: new Date(2026, 8, 22, 2, 0), // Tue 02:00 (4h)
		};
		const moved = moveWholeEvent(overnight, day, 480); // dragged to Mon 08:00
		expect(moved).toEqual({
			start: new Date(2026, 8, 21, 8, 0),
			end: new Date(2026, 8, 21, 12, 0),
		});
	});

	it("keeps the total duration even when the end overflows into the next day", () => {
		const long = {
			start: new Date(2026, 8, 21, 10, 0),
			end: new Date(2026, 8, 21, 20, 0), // 10h
		};
		const moved = moveWholeEvent(long, day, 23 * 60); // dropped at 23:00
		expect(moved).toEqual({
			start: new Date(2026, 8, 21, 23, 0),
			end: new Date(2026, 8, 22, 9, 0),
		});
	});

	it("clamps a drop before midnight to the top of the day", () => {
		const moved = moveWholeEvent(
			{
				start: new Date(2026, 8, 21, 9, 0),
				end: new Date(2026, 8, 21, 10, 0),
			},
			day,
			-20,
		);
		expect(moved).toEqual({
			start: new Date(2026, 8, 21, 0, 0),
			end: new Date(2026, 8, 21, 1, 0),
		});
	});

	it("rounds the drop to the nearest grid slot", () => {
		const moved = moveWholeEvent(
			{
				start: new Date(2026, 8, 21, 9, 0),
				end: new Date(2026, 8, 21, 10, 0),
			},
			day,
			833, // 13:53
		);
		expect(moved).toEqual({
			start: new Date(2026, 8, 21, 14, 0),
			end: new Date(2026, 8, 21, 15, 0),
		});
	});
});
