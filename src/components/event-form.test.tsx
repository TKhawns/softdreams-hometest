import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { EventForm } from "./EventForm";

const noop = () => {};

describe("EventForm", () => {
	it("prefills title, description and the datetime-local fields from initial", () => {
		const html = renderToString(
			<EventForm
				initial={{
					title: "Focus block",
					description: "deep work",
					start: new Date(2026, 8, 21, 9, 0),
					end: new Date(2026, 8, 21, 10, 0),
				}}
				submitLabel="Save"
				onSubmit={noop}
				onCancel={noop}
			/>,
		);
		expect(html).toContain("Focus block");
		expect(html).toContain("deep work");
		expect(html).toContain('value="2026-09-21T09:00"');
		expect(html).toContain('value="2026-09-21T10:00"');
		expect(html).toContain("Save");
		expect(html).toContain("Cancel");
	});

	it("labels the save button for create and edit", () => {
		const html = renderToString(
			<EventForm
				initial={{
					title: "",
					description: "",
					start: new Date(2026, 8, 21, 9, 0),
					end: new Date(2026, 8, 21, 9, 30),
				}}
				submitLabel="Save changes"
				onSubmit={noop}
				onCancel={noop}
			/>,
		);
		expect(html).toContain("Save changes");
	});
});
