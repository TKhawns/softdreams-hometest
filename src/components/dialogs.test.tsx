import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { createEvent } from "../lib/events";
import { ContextMenu } from "./ContextMenu";
import { EventDetailsDialog } from "./EventDetailsDialog";

const noop = () => {};

describe("EventDetailsDialog", () => {
	it("describes the event and offers edit and close", () => {
		const event = createEvent({
			title: "Team sync",
			description: "Weekly planning",
			start: new Date(2026, 8, 21, 9, 0),
			end: new Date(2026, 8, 21, 9, 45),
		});
		const html = renderToString(
			<EventDetailsDialog event={event} onClose={noop} onEdit={noop} />,
		);
		expect(html).toContain("Team sync");
		expect(html).toContain("Weekly planning");
		expect(html).toContain("09:00");
		expect(html).toContain("09:45");
		expect(html).toContain("Edit");
		expect(html).toContain("Close");
	});

	it("falls back to a placeholder when there is no description", () => {
		const event = createEvent({
			title: "No notes",
			description: "",
			start: new Date(2026, 8, 21, 9, 0),
			end: new Date(2026, 8, 21, 9, 45),
		});
		const html = renderToString(
			<EventDetailsDialog event={event} onClose={noop} onEdit={noop} />,
		);
		expect(html).toContain("No description");
	});
});

describe("ContextMenu", () => {
	it("shows the Edit and Delete actions", () => {
		const html = renderToString(
			<ContextMenu
				position={{ x: 120, y: 80 }}
				onEdit={noop}
				onDelete={noop}
				onClose={noop}
			/>,
		);
		expect(html).toContain("Edit");
		expect(html).toContain("Delete");
	});
});
