import { describe, expect, it } from "vitest";

import { moveEventRange, snapDragRange } from "./drag";

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

describe("moveEventRange", () => {
	it("moves the range preserving its duration, snapping the new start", () => {
		expect(moveEventRange(555, 645, 845)).toEqual({ start: 840, end: 930 }); // 9:15–10:45, drop 14:05 ⇒ 14:00–15:30
	});

	it("preserves a non-grid duration", () => {
		expect(moveEventRange(600, 660, 540)).toEqual({ start: 540, end: 600 }); // 10:00–11:00 ⇒ 9:00–10:00
	});

	it("clamps a drop before midnight so the range stays in the day", () => {
		expect(moveEventRange(1380, 1410, 1450)).toEqual({
			start: 1410,
			end: 1440,
		}); // 23:00–23:30, drop below 24:00 ⇒ 23:30–24:00
	});

	it("clamps a drop above midnight to the top of the day", () => {
		expect(moveEventRange(540, 600, -20)).toEqual({ start: 0, end: 60 }); // 9:00–10:00 ⇒ 0:00–1:00
	});

	it("rounds the drop to the nearest grid slot", () => {
		expect(moveEventRange(600, 660, 832)).toEqual({ start: 825, end: 885 }); // drop 13:52 rounds to 13:45
		expect(moveEventRange(600, 660, 833)).toEqual({ start: 840, end: 900 }); // drop 13:53 rounds to 14:00
	});
});
