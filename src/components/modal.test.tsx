import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Modal } from "./Modal";

const noop = () => {};

describe("Modal", () => {
	it("renders the backdrop with a close label and children", () => {
		const html = renderToString(
			<Modal onClose={noop}>
				<p>content</p>
			</Modal>,
		);
		expect(html).toContain("Close dialog");
		expect(html).toContain("content");
	});

	it("marks the panel as a modal dialog for screen readers", () => {
		const html = renderToString(
			<Modal onClose={noop}>
				<p>content</p>
			</Modal>,
		);
		expect(html).toContain('role="dialog"');
		expect(html).toContain('aria-modal="true"');
	});
});
