import { describe, expect, it } from "vitest";

import {
	addEvent,
	createEvent,
	deleteEvent,
	findEvent,
	isEventRangeValid,
	updateEvent,
} from "./events";

const start = new Date(2026, 8, 21, 10, 0);
const end = new Date(2026, 8, 21, 11, 0);

describe("event model", () => {
	it("createEvent builds a complete event with id, start and end", () => {
		const event = createEvent({
			title: "Standup",
			description: "daily",
			start,
			end,
		});
		expect(event.id.length).toBeGreaterThan(0);
		expect(event.title).toBe("Standup");
		expect(event.description).toBe("daily");
		expect(event.start).toBe(start);
		expect(event.end).toBe(end);
		expect(isEventRangeValid(event)).toBe(true);
	});

	it("createEvent ignores caller-provided ids (ids are generated)", () => {
		const a = createEvent({ title: "A", description: "", start, end });
		const b = createEvent({ title: "B", description: "", start, end });
		expect(a.id).not.toBe(b.id);
	});

	it("isEventRangeValid rejects equal and reversed ranges", () => {
		const equal = { id: "1", title: "x", description: "", start, end: start };
		expect(isEventRangeValid(equal)).toBe(false);

		const reversed = {
			id: "1",
			title: "x",
			description: "",
			start: end,
			end: start,
		};
		expect(isEventRangeValid(reversed)).toBe(false);
	});
});

describe("event collection operations", () => {
	const a = createEvent({ title: "A", description: "", start, end });
	const b = createEvent({
		title: "B",
		description: "",
		start: new Date(2026, 8, 21, 13, 0),
		end: new Date(2026, 8, 21, 14, 0),
	});

	it("addEvent appends without mutating the input array", () => {
		const base = [a];
		const next = addEvent(base, b);
		expect(next).toEqual([a, b]);
		expect(base).toEqual([a]);
	});

	it("updateEvent replaces the event with the matching id", () => {
		const moved = {
			...a,
			title: "A moved",
			start: new Date(2026, 8, 21, 15, 0),
		};
		const next = updateEvent([a, b], moved);
		expect(next).toEqual([moved, b]);
		expect(next[0].title).toBe("A moved");
	});

	it("updateEvent leaves the collection unchanged for an unknown id", () => {
		const unknown = { ...a, id: "nope" };
		expect(updateEvent([a, b], unknown)).toEqual([a, b]);
	});

	it("deleteEvent removes the event with the matching id", () => {
		expect(deleteEvent([a, b], a.id)).toEqual([b]);
		expect(deleteEvent([a, b], "nope")).toEqual([a, b]);
	});

	it("findEvent returns the event by id or undefined", () => {
		expect(findEvent([a, b], b.id)).toBe(b);
		expect(findEvent([a, b], "nope")).toBeUndefined();
	});
});
