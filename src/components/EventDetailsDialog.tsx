import type { CalendarEvent } from "../lib/events";
import { formatDateTime, formatTime } from "../lib/time";
import { Modal } from "./Modal";

export interface EventDetailsDialogProps {
	event: CalendarEvent;
	onClose(): void;
	onEdit(): void;
}

/** Read-only view of an event, opened by left-clicking the event. */
export function EventDetailsDialog({
	event,
	onClose,
	onEdit,
}: EventDetailsDialogProps) {
	return (
		<Modal onClose={onClose}>
			<h2 className="text-lg font-semibold text-neutral-900">{event.title}</h2>
			<p className="mt-1 text-sm text-neutral-600">
				{formatDateTime(event.start)} – {formatTime(event.end)}
			</p>
			<p className="mt-3 whitespace-pre-wrap text-sm text-neutral-800">
				{event.description.trim() ? event.description : "No description"}
			</p>
			<div className="mt-5 flex justify-end gap-2">
				<button
					type="button"
					onClick={onClose}
					className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
				>
					Close
				</button>
				<button
					type="button"
					onClick={onEdit}
					className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
				>
					Edit
				</button>
			</div>
		</Modal>
	);
}
