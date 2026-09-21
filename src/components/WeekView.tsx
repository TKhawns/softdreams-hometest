import { useRef, useState } from "react";

import { defaultCreateRange, moveWholeEvent, snapDragRange } from "../lib/drag";
import type { CalendarEvent } from "../lib/events";
import {
	columnIndexAtX,
	eventSegmentForDay,
	HOUR_HEIGHT_PX,
	yToMinutes,
} from "../lib/geometry";
import { dateAtMinutesOfDay } from "../lib/time";
import { DayColumn } from "./DayColumn";
import { HourGutter } from "./HourGutter";
import { WeekHeader } from "./WeekHeader";

const DRAG_THRESHOLD_PX = 4;

export interface WeekViewProps {
	days: Date[];
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

type Drag =
	| {
			mode: "create";
			dayIndex: number;
			anchor: number;
			current: number;
			pointerId: number;
	  }
	| {
			mode: "move";
			dayIndex: number;
			event: CalendarEvent;
			grabOffset: number;
			current: number;
			pointerId: number;
	  };

interface PointerDown {
	kind: "create" | "move";
	pointerId: number;
	startX: number;
	startY: number;
	dayIndex: number;
	anchor: number;
	event?: CalendarEvent;
	grabOffset?: number;
}

/**
 * The week grid: header, hour gutter and 7 day columns. Pointer gestures live
 * here (over the shared columns row) so a drag can move across day columns:
 * the day index comes from x and the minute from y. Drag math lives in
 * lib/drag; this layer only feeds pointer positions into it.
 */
export function WeekView({
	days,
	now,
	events,
	onOpenEvent,
	onEventContextMenu,
	onDragCreate,
	onDragMove,
}: WeekViewProps) {
	const columnsRef = useRef<HTMLDivElement>(null);
	const downRef = useRef<PointerDown | null>(null);
	const clickSuppressRef = useRef(false);
	const [drag, setDrag] = useState<Drag | null>(null);

	function rect() {
		return columnsRef.current?.getBoundingClientRect();
	}

	function minuteFromClientY(clientY: number): number {
		const box = rect();
		if (!box) return 0;
		return yToMinutes(clientY - box.top, HOUR_HEIGHT_PX);
	}

	function dayIndexFromClientX(clientX: number): number {
		const box = rect();
		if (!box) return 0;
		return columnIndexAtX(clientX, box.left, box.width, days.length);
	}

	function stopDrag() {
		downRef.current = null;
		setDrag(null);
	}

	function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
		if (e.button !== 0) return;
		clickSuppressRef.current = false;
		const minute = minuteFromClientY(e.clientY);
		const dayIndex = dayIndexFromClientX(e.clientX);
		const day = days[dayIndex];
		if (!day) return;
		const target = (e.target as Element).closest("[data-event-id]");
		if (target) {
			const id = target.getAttribute("data-event-id");
			const event = events.find((item) => item.id === id);
			if (!event) return;
			const segment = eventSegmentForDay(event, day);
			if (!segment) return;
			const segStart = (segment.start.getTime() - day.getTime()) / 60_000;
			downRef.current = {
				kind: "move",
				pointerId: e.pointerId,
				startX: e.clientX,
				startY: e.clientY,
				dayIndex,
				anchor: minute,
				event,
				grabOffset: minute - segStart,
			};
		} else {
			downRef.current = {
				kind: "create",
				pointerId: e.pointerId,
				startX: e.clientX,
				startY: e.clientY,
				dayIndex,
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
			columnsRef.current?.setPointerCapture(e.pointerId);
			if (down.kind === "move") {
				setDrag({
					mode: "move",
					dayIndex: down.dayIndex,
					event: down.event as CalendarEvent,
					grabOffset: down.grabOffset as number,
					current: minuteFromClientY(e.clientY),
					pointerId: e.pointerId,
				});
			} else {
				setDrag({
					mode: "create",
					dayIndex: down.dayIndex,
					anchor: down.anchor,
					current: minuteFromClientY(e.clientY),
					pointerId: e.pointerId,
				});
			}
			return;
		}
		setDrag((current) =>
			current && e.pointerId === current.pointerId
				? {
						...current,
						current: minuteFromClientY(e.clientY),
						dayIndex:
							current.mode === "move"
								? dayIndexFromClientX(e.clientX)
								: current.dayIndex,
					}
				: current,
		);
	}

	function handlePointerEnd(e: React.PointerEvent<HTMLDivElement>) {
		const active = drag;
		const down = downRef.current;
		downRef.current = null;
		setDrag(null);
		if (active && e.pointerId === active.pointerId) {
			const day = days[active.dayIndex];
			if (!day) return;
			if (active.mode === "create") {
				const range = snapDragRange(active.anchor, active.current);
				onDragCreate({
					start: dateAtMinutesOfDay(day, range.start),
					end: dateAtMinutesOfDay(day, range.end),
				});
			} else {
				const range = moveWholeEvent(
					active.event,
					day,
					active.current - active.grabOffset,
				);
				onDragMove(active.event, range);
			}
			return;
		}
		// A pointerup with no drag is a plain click on empty space: open the
		// create dialog with a 1-hour default at the clicked slot. Guarded by
		// `!active` so a second finger that taps mid-drag can't open it.
		if (
			!active &&
			down &&
			e.pointerId === down.pointerId &&
			down.kind === "create"
		) {
			const day = days[down.dayIndex];
			if (!day) return;
			onDragCreate(defaultCreateRange(day, down.anchor));
		}
	}

	return (
		<div className="flex h-full flex-col bg-white font-sans text-neutral-800">
			<WeekHeader days={days} now={now} />
			<div className="flex min-h-0 flex-1 overflow-y-auto">
				<HourGutter />
				<div
					ref={columnsRef}
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
					className="flex flex-1 select-none"
					style={{ touchAction: "none" }}
				>
					{days.map((day, index) => {
						let moveDraft = null;
						let createRange = null;
						if (drag?.mode === "move") {
							const range = moveWholeEvent(
								drag.event,
								days[drag.dayIndex],
								drag.current - drag.grabOffset,
							);
							moveDraft = { ...drag.event, ...range };
						} else if (drag?.mode === "create" && drag.dayIndex === index) {
							createRange = snapDragRange(drag.anchor, drag.current);
						}
						return (
							<DayColumn
								key={day.getTime()}
								day={day}
								now={now}
								events={events}
								moveDraft={moveDraft}
								createRange={createRange}
								onOpenEvent={onOpenEvent}
								onEventContextMenu={onEventContextMenu}
							/>
						);
					})}
				</div>
			</div>
		</div>
	);
}
