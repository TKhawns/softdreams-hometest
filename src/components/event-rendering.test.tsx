import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createEvent } from "../lib/events";
import { DayColumn } from "./DayColumn";
import { EventBlock } from "./EventBlock";

const day = new Date(2026, 8, 21, 0, 0);
const now = new Date(2026, 8, 21, 9, 0);
const noop = () => {};

function eventOn(
	title: string,
	sh: number,
	sm: number,
	eh: number,
	em: number,
) {
	return createEvent({
		title,
		description: "",
		start: new Date(2026, 8, 21, sh, sm),
		end: new Date(2026, 8, 21, eh, em),
	});
}

describe("EventBlock", () => {
	it("positions the block by time and shows title and start", () => {
		const event = eventOn("Design review", 10, 0, 11, 30);
		const html = renderToString(
			<EventBlock
				event={event}
				segment={{ start: event.start, end: event.end }}
				left={0}
				width={1}
				continuesBefore={false}
				continuesAfter={false}
				onOpen={noop}
				onContextMenu={noop}
			/>,
		);
		expect(html).toContain("Design review");
		expect(html).toContain("10:00");
		expect(html).toContain("top:480px");
		expect(html).toContain("height:72px");
		expect(html).toContain("left:0%");
		expect(html).toContain("width:100%");
		expect(html).not.toContain("›");
	});

	it("shows a continuation chevron on the segment that continues to the next day", () => {
		const event = createEvent({
			title: "Overnight",
			description: "",
			start: new Date(2026, 8, 21, 22, 0),
			end: new Date(2026, 8, 22, 2, 0),
		});
		const html = renderToString(
			<EventBlock
				event={event}
				segment={{ start: event.start, end: new Date(2026, 8, 22, 0, 0) }}
				left={0}
				width={1}
				continuesBefore={false}
				continuesAfter={true}
				onOpen={noop}
				onContextMenu={noop}
			/>,
		);
		expect(html).toContain("›");
	});

	it("applies half-width placement for overlapping events", () => {
		const event = eventOn("Overlap", 10, 0, 11, 0);
		const html = renderToString(
			<EventBlock
				event={event}
				segment={{ start: event.start, end: event.end }}
				left={0.5}
				width={0.5}
				continuesBefore={false}
				continuesAfter={false}
				onOpen={noop}
				onContextMenu={noop}
			/>,
		);
		expect(html).toContain("left:50%");
		expect(html).toContain("width:50%");
	});
});

describe("DayColumn with events", () => {
	it("renders every event that touches the day, side by side when overlapping", () => {
		const events = [
			eventOn("Morning", 9, 0, 10, 0),
			eventOn("Overlapping", 9, 30, 10, 30),
		];
		const html = renderToString(
			<DayColumn
				day={day}
				now={now}
				events={events}
				onOpenEvent={noop}
				onEventContextMenu={noop}
			/>,
		);
		expect(html).toContain("Morning");
		expect(html).toContain("Overlapping");
		expect(html).toContain("width:50%");
	});

	it("renders a multi-day event in every day it touches", () => {
		const spanning = createEvent({
			title: "Conference",
			description: "",
			start: new Date(2026, 8, 21, 22, 0),
			end: new Date(2026, 8, 22, 2, 0),
		});
		const first = renderToString(
			<DayColumn
				day={day}
				now={now}
				events={[spanning]}
				onOpenEvent={noop}
				onEventContextMenu={noop}
			/>,
		);
		const second = renderToString(
			<DayColumn
				day={new Date(2026, 8, 22, 0, 0)}
				now={now}
				events={[spanning]}
				onOpenEvent={noop}
				onEventContextMenu={noop}
			/>,
		);
		expect(first).toContain("Conference");
		expect(second).toContain("Conference");
	});

	it("does not render events outside the day", () => {
		const events = [eventOn("Later", 10, 0, 11, 0)];
		const html = renderToString(
			<DayColumn
				day={new Date(2026, 8, 22, 0, 0)}
				now={now}
				events={events}
				onOpenEvent={noop}
				onEventContextMenu={noop}
			/>,
		);
		expect(html).not.toContain("Later");
	});
});
