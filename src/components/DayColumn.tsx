import type { CalendarEvent } from "../lib/events";
import type { DayEventSegment } from "../lib/geometry";
import { eventSegmentForDay, HOUR_HEIGHT_PX, timeToY } from "../lib/geometry";
import { layoutDaySegments } from "../lib/layout";
import { minutesSinceMidnight } from "../lib/time";
import { isSameDay } from "../lib/week";
import { EventBlock } from "./EventBlock";

const HOUR_STARTS = Array.from({ length: 24 }, (_, h) => h * 60);

export interface DayColumnProps {
	day: Date;
	now: Date;
	events: CalendarEvent[];
	onOpenEvent(event: CalendarEvent): void;
	onEventContextMenu(
		event: CalendarEvent,
		position: { x: number; y: number },
	): void;
}

interface DaySegment {
	id: string;
	start: number;
	end: number;
	event: CalendarEvent;
	segment: DayEventSegment;
}

/** One day column: hourly cells, events (side by side when overlapping) and a current-time line. */
export function DayColumn({
	day,
	now,
	events,
	onOpenEvent,
	onEventContextMenu,
}: DayColumnProps) {
	const isToday = isSameDay(day, now);
	const nowY = timeToY(now, HOUR_HEIGHT_PX);

	const segments: DaySegment[] = [];
	for (const event of events) {
		const segment = eventSegmentForDay(event, day);
		if (!segment) continue;
		segments.push({
			id: event.id,
			start: minutesSinceMidnight(segment.start),
			end: minutesSinceMidnight(segment.end),
			event,
			segment,
		});
	}
	const placed = layoutDaySegments(segments);

	return (
		<div
			className="relative flex-1 border-r border-neutral-200"
			style={{ height: 24 * HOUR_HEIGHT_PX }}
		>
			{HOUR_STARTS.map((minutes) => (
				<div
					key={minutes}
					className="border-t border-neutral-100"
					style={{ height: HOUR_HEIGHT_PX }}
				/>
			))}

			{placed.map((item) => (
				<EventBlock
					key={item.id}
					event={item.event}
					segment={item.segment}
					left={item.left}
					width={item.width}
					continuesBefore={
						item.segment.start.getTime() > item.event.start.getTime()
					}
					continuesAfter={item.segment.end.getTime() < item.event.end.getTime()}
					onOpen={onOpenEvent}
					onContextMenu={onEventContextMenu}
				/>
			))}

			{isToday ? (
				<div
					className="pointer-events-none absolute inset-x-0 z-10"
					style={{ top: nowY }}
				>
					<div className="relative h-px bg-red-500">
						<span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
					</div>
				</div>
			) : null}
		</div>
	);
}
