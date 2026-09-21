import { useRef, useState } from "react";
import { moveEventRange, snapDragRange } from "../lib/drag";
import type { CalendarEvent } from "../lib/events";
import type { DayEventSegment } from "../lib/geometry";
import {
	eventSegmentForDay,
	HOUR_HEIGHT_PX,
	minutesToY,
	timeToY,
	yToMinutes,
} from "../lib/geometry";
import { layoutDaySegments } from "../lib/layout";
import { dateAtMinutesOfDay, minutesSinceMidnight } from "../lib/time";
import { isSameDay } from "../lib/week";
import { EventBlock } from "./EventBlock";

const HOUR_STARTS = Array.from({ length: 24 }, (_, h) => h * 60);

/** Pointer movement (px) before a press becomes a drag. */
const DRAG_THRESHOLD_PX = 4;

export interface DayColumnProps {
	day: Date;
	now: Date;
	events: CalendarEvent[];
	onOpenEvent(event: CalendarEvent): void;
	onEventContextMenu(
		event: CalendarEvent,
		position: { x: number; y: number },
	): void;
	onDragCreate(range: { start: Date; end: Date }): void;
	onDragMove(event: CalendarEvent, range: { start: Date; end: Date }): void;
}

interface DaySegment {
	id: string;
	start: number;
	end: number;
	event: CalendarEvent;
	segment: DayEventSegment;
}

type Drag =
	| { mode: "create"; anchor: number; current: number; pointerId: number }
	| {
			mode: "move";
			event: CalendarEvent;
			segmentStart: number;
			segmentEnd: number;
			grabOffset: number;
			current: number;
			pointerId: number;
	  };

interface PointerDown {
	kind: "create" | "move";
	pointerId: number;
	startX: number;
	startY: number;
	anchor: number;
	event?: CalendarEvent;
	segmentStart?: number;
	segmentEnd?: number;
	grabOffset?: number;
}

/**
 * One day column: hourly cells, events (side by side when overlapping), a
 * current-time line, and pointer drags (create on empty space, move on an
 * event block). Drag math lives in lib/drag; this layer only feeds pointer
 * positions into it.
 */
export function DayColumn({
	day,
	now,
	events,
	onOpenEvent,
	onEventContextMenu,
	onDragCreate,
	onDragMove,
}: DayColumnProps) {
	const rootRef = useRef<HTMLDivElement>(null);
	const downRef = useRef<PointerDown | null>(null);
	const clickSuppressRef = useRef(false);
	const [drag, setDrag] = useState<Drag | null>(null);

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

	function minuteFromClientY(clientY: number): number {
		const rect = rootRef.current?.getBoundingClientRect();
		if (!rect) return 0;
		return yToMinutes(clientY - rect.top, HOUR_HEIGHT_PX);
	}

	function stopDrag() {
		downRef.current = null;
		setDrag(null);
	}

	function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
		if (e.button !== 0) return;
		clickSuppressRef.current = false;
		const minute = minuteFromClientY(e.clientY);
		const target = (e.target as Element).closest("[data-event-id]");
		if (target) {
			const id = target.getAttribute("data-event-id");
			const segment = segments.find((item) => item.event.id === id);
			if (!segment) return;
			downRef.current = {
				kind: "move",
				pointerId: e.pointerId,
				startX: e.clientX,
				startY: e.clientY,
				anchor: minute,
				event: segment.event,
				segmentStart: segment.start,
				segmentEnd: segment.end,
				grabOffset: minute - segment.start,
			};
		} else {
			downRef.current = {
				kind: "create",
				pointerId: e.pointerId,
				startX: e.clientX,
				startY: e.clientY,
				anchor: minute,
			};
		}
	}

	function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
		const down = downRef.current;
		if (!down || e.pointerId !== down.pointerId) return;
		if (!drag) {
			const moved = Math.hypot(
				e.clientX - down.startX,
				e.clientY - down.startY,
			);
			if (moved < DRAG_THRESHOLD_PX) return;
			clickSuppressRef.current = true;
			rootRef.current?.setPointerCapture(e.pointerId);
			if (down.kind === "move") {
				setDrag({
					mode: "move",
					event: down.event as CalendarEvent,
					segmentStart: down.segmentStart as number,
					segmentEnd: down.segmentEnd as number,
					grabOffset: down.grabOffset as number,
					current: minuteFromClientY(e.clientY),
					pointerId: e.pointerId,
				});
			} else {
				setDrag({
					mode: "create",
					anchor: down.anchor,
					current: minuteFromClientY(e.clientY),
					pointerId: e.pointerId,
				});
			}
			return;
		}
		setDrag((current) =>
			current && e.pointerId === current.pointerId
				? { ...current, current: minuteFromClientY(e.clientY) }
				: current,
		);
	}

	function handlePointerEnd(e: React.PointerEvent<HTMLDivElement>) {
		const active = drag;
		downRef.current = null;
		setDrag(null);
		if (!active || e.pointerId !== active.pointerId) return;
		if (active.mode === "create") {
			const range = snapDragRange(active.anchor, active.current);
			onDragCreate({
				start: dateAtMinutesOfDay(day, range.start),
				end: dateAtMinutesOfDay(day, range.end),
			});
		} else {
			const range = moveEventRange(
				active.segmentStart,
				active.segmentEnd,
				active.current - active.grabOffset,
			);
			onDragMove(active.event, {
				start: dateAtMinutesOfDay(day, range.start),
				end: dateAtMinutesOfDay(day, range.end),
			});
		}
	}

	const createRange =
		drag?.mode === "create" ? snapDragRange(drag.anchor, drag.current) : null;

	let moveOverride: DaySegment | null = null;
	if (drag?.mode === "move") {
		const range = moveEventRange(
			drag.segmentStart,
			drag.segmentEnd,
			drag.current - drag.grabOffset,
		);
		moveOverride = {
			id: drag.event.id,
			start: range.start,
			end: range.end,
			event: drag.event,
			segment: {
				start: dateAtMinutesOfDay(day, range.start),
				end: dateAtMinutesOfDay(day, range.end),
			},
		};
	}

	return (
		<div
			ref={rootRef}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerEnd}
			onPointerCancel={stopDrag}
			onClickCapture={(e) => {
				if (clickSuppressRef.current) {
					e.stopPropagation();
					clickSuppressRef.current = false;
				}
			}}
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

			{placed.map((item) =>
				moveOverride && item.id === moveOverride.id ? (
					<EventBlock
						key={`${item.id}-drag`}
						event={item.event}
						segment={moveOverride.segment}
						left={item.left}
						width={item.width}
						continuesBefore={
							moveOverride.segment.start.getTime() > item.event.start.getTime()
						}
						continuesAfter={
							moveOverride.segment.end.getTime() < item.event.end.getTime()
						}
						dragging
						onOpen={onOpenEvent}
						onContextMenu={onEventContextMenu}
					/>
				) : (
					<EventBlock
						key={item.id}
						event={item.event}
						segment={item.segment}
						left={item.left}
						width={item.width}
						continuesBefore={
							item.segment.start.getTime() > item.event.start.getTime()
						}
						continuesAfter={
							item.segment.end.getTime() < item.event.end.getTime()
						}
						onOpen={onOpenEvent}
						onContextMenu={onEventContextMenu}
					/>
				),
			)}

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
