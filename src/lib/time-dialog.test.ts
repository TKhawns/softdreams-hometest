import { describe, expect, it } from "vitest";

import {
	dateAtMinutesOfDay,
	formatDateTimeLocal,
	parseDateTimeLocal,
} from "./time";

describe("parseDateTimeLocal", () => {
	it("parses a datetime-local value into a local Date", () => {
		const date = parseDateTimeLocal("2026-09-21T09:30");
		expect(date).toEqual(new Date(2026, 8, 21, 9, 30));
	});

	it("returns null for an empty value", () => {
		expect(parseDateTimeLocal("")).toBeNull();
	});

	it("returns null for malformed values", () => {
		expect(parseDateTimeLocal("2026-9-21T9:30")).toBeNull();
		expect(parseDateTimeLocal("hello")).toBeNull();
		expect(parseDateTimeLocal("2026-13-45T99:99")).toBeNull();
	});
});

describe("formatDateTimeLocal", () => {
	it("formats a Date for a datetime-local input, zero-padded", () => {
		expect(formatDateTimeLocal(new Date(2026, 8, 5, 9, 5))).toBe(
			"2026-09-05T09:05",
		);
	});

	it("round-trips with parseDateTimeLocal", () => {
		const date = new Date(2026, 11, 31, 23, 45);
		expect(parseDateTimeLocal(formatDateTimeLocal(date))).toEqual(date);
	});
});

describe("dateAtMinutesOfDay", () => {
	const day = new Date(2026, 8, 21, 0, 0);

	it("builds a date at the given minute of the calendar day", () => {
		expect(dateAtMinutesOfDay(day, 615)).toEqual(new Date(2026, 8, 21, 10, 15));
	});

	it("rolls past midnight when the minute crosses into the next day", () => {
		expect(dateAtMinutesOfDay(day, 1440)).toEqual(new Date(2026, 8, 22, 0, 0));
	});
});
