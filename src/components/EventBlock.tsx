import type { CalendarEvent } from "../lib/events";
import type { DayEventSegment } from "../lib/geometry";
import { durationToHeight, HOUR_HEIGHT_PX, timeToY } from "../lib/geometry";
import { formatTime } from "../lib/time";

export interface EventBlockProps {
	event: CalendarEvent;
	segment: DayEventSegment;
	left: number;
	width: number;
	continuesBefore: boolean;
	continuesAfter: boolean;
	dragging?: boolean;
	onOpen(event: CalendarEvent): void;
	onContextMenu(event: CalendarEvent, position: { x: number; y: number }): void;
}

/** A single event block positioned by its time within one day column. */
export function EventBlock({
	event,
	segment,
	left,
	width,
	continuesBefore,
	continuesAfter,
	dragging = false,
	onOpen,
	onContextMenu,
}: EventBlockProps) {
	const top = timeToY(segment.start, HOUR_HEIGHT_PX);
	const height = durationToHeight(segment.start, segment.end, HOUR_HEIGHT_PX);
	return (
		<button
			type="button"
			data-event-id={event.id}
			onClick={() => onOpen(event)}
			onContextMenu={(pointer) => {
				pointer.preventDefault();
				onContextMenu(event, { x: pointer.clientX, y: pointer.clientY });
			}}
			className={`absolute z-20 cursor-pointer overflow-hidden rounded border border-blue-700 bg-blue-600 px-2 py-1 text-left text-xs text-white shadow-sm hover:bg-blue-700 ${dragging ? "z-30 opacity-80 ring-2 ring-blue-400" : ""}`}
			style={{
				top,
				height,
				left: `${left * 100}%`,
				width: `${width * 100}%`,
			}}
		>
			<span className="flex items-center gap-1 font-medium">
				{continuesBefore ? <span aria-hidden="true">‹</span> : null}
				<span className="truncate">{event.title}</span>
				{continuesAfter ? <span aria-hidden="true">›</span> : null}
			</span>
			<span className="block truncate opacity-90">
				{formatTime(segment.start)}
			</span>
		</button>
	);
}
