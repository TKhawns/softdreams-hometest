import type { CalendarEvent } from "../lib/events";
import type { DayEventSegment } from "../lib/geometry";
import {
	eventSegmentForDay,
	HOUR_HEIGHT_PX,
	minutesToY,
	timeToY,
} from "../lib/geometry";
import { layoutDaySegments } from "../lib/layout";
import { MS_PER_MINUTE } from "../lib/time";
import { isSameDay } from "../lib/week";
import { EventBlock } from "./EventBlock";

const HOUR_STARTS = Array.from({ length: 24 }, (_, h) => h * 60);

export interface DayColumnProps {
	day: Date;
	now: Date;
	events: CalendarEvent[];
	/**
	 * The moved event at its draft position while a move-drag is active. When
	 * set, the original block with the same id is replaced by this draft's
	 * segment (computed for this column), hiding the old position.
	 */
	moveDraft?: CalendarEvent | null;
	/** Minutes-of-day range highlighted while drag-creating (this column only). */
	createRange?: { start: number; end: number } | null;
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
	dragging: boolean;
}

/**
 * One day column: hourly cells, events (side by side when overlapping), the
 * current-time line, and drag previews (create selection rectangle, moved
 * event ghost) that WeekView computes and feeds in.
 */
export function DayColumn({
	day,
	now,
	events,
	moveDraft = null,
	createRange = null,
	onOpenEvent,
	onEventContextMenu,
}: DayColumnProps) {
	const isToday = isSameDay(day, now);
	const nowY = timeToY(now, HOUR_HEIGHT_PX);

	const dayStartMs = day.getTime();

	const segments: DaySegment[] = [];
	for (const event of events) {
		if (event.id === moveDraft?.id) continue; // replaced by the draft below
		const segment = eventSegmentForDay(event, day);
		if (!segment) continue;
		segments.push({
			id: event.id,
			start: (segment.start.getTime() - dayStartMs) / MS_PER_MINUTE,
			end: (segment.end.getTime() - dayStartMs) / MS_PER_MINUTE,
			event,
			segment,
			dragging: false,
		});
	}
	if (moveDraft) {
		const segment = eventSegmentForDay(moveDraft, day);
		if (segment) {
			segments.push({
				id: moveDraft.id,
				start: (segment.start.getTime() - dayStartMs) / MS_PER_MINUTE,
				end: (segment.end.getTime() - dayStartMs) / MS_PER_MINUTE,
				event: moveDraft,
				segment,
				dragging: true,
			});
		}
	}
	const placed = layoutDaySegments(segments);

	return (
		<div
			className="relative flex-1 select-none border-r border-neutral-200"
			style={{ height: 24 * HOUR_HEIGHT_PX, touchAction: "none" }}
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
					key={item.dragging ? `${item.id}-drag` : item.id}
					event={item.event}
					segment={item.segment}
					left={item.left}
					width={item.width}
					continuesBefore={
						item.segment.start.getTime() > item.event.start.getTime()
					}
					continuesAfter={item.segment.end.getTime() < item.event.end.getTime()}
					dragging={item.dragging}
					onOpen={onOpenEvent}
					onContextMenu={onEventContextMenu}
				/>
			))}

			{createRange ? (
				<div
					className="pointer-events-none absolute z-20 rounded border border-blue-400 bg-blue-500/30"
					style={{
						top: minutesToY(createRange.start, HOUR_HEIGHT_PX),
						height:
							((createRange.end - createRange.start) / 60) * HOUR_HEIGHT_PX,
						insetInline: 4,
					}}
				/>
			) : null}

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
