import { describe, expect, it } from "vitest";

import { createEvent, isEventRangeValid } from "./events";

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
