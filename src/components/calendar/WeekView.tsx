import { useRef, useState } from "react";

import {
  defaultCreateRange,
  moveWholeEvent,
  snapDragRange,
} from "../../lib/drag";
import type { CalendarEvent } from "../../lib/events";
import {
  columnIndexAtX,
  eventSegmentForDay,
  HOUR_HEIGHT_PX,
  yToMinutes,
} from "../../lib/geometry";
import { dateAtMinutesOfDay } from "../../lib/time";
import { DayColumn } from "./DayColumn";
import { HourGutter } from "./HourGutter";
import { type ViewMode, WeekHeader } from "./WeekHeader";

const DRAG_THRESHOLD_PX = 4;

const SWIPE_THRESHOLD_PX = 48;

const SWIPE_AXIS_RATIO = 1.5;

export interface WeekViewProps {
  days: Date[];
  now: Date;
  events: CalendarEvent[];
  isMobile: boolean;
  singleDay: boolean;
  viewMode: ViewMode;
  onViewModeChange(mode: ViewMode): void;
  focusedIndex: number;
  onNavigateDays(delta: number): void;
  onGoToday(): void;
  onSelectDay(index: number): void;
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

export function WeekView({
  days,
  now,
  events,
  isMobile,
  singleDay,
  viewMode,
  onViewModeChange,
  focusedIndex,
  onNavigateDays,
  onGoToday,
  onSelectDay,
  onOpenEvent,
  onEventContextMenu,
  onDragCreate,
  onDragMove,
}: WeekViewProps) {
  const columnsRef = useRef<HTMLDivElement>(null);
  const downRef = useRef<PointerDown | null>(null);
  const swipeRef = useRef(false);
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
    // In single-day mode only one day column is visible, so every pointer is on it.
    if (singleDay) return focusedIndex;
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
    swipeRef.current = false;
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
    if (swipeRef.current) return;
    if (!drag) {
      const dx = e.clientX - down.startX;
      const dy = e.clientY - down.startY;
      // In single-day mode, a strongly horizontal drag away from an event
      // navigates days instead of creating an event. Vertical drags still
      // select a range, and the week overview keeps per-column drags.
      if (
        singleDay &&
        down.kind === "create" &&
        Math.abs(dx) > SWIPE_THRESHOLD_PX &&
        Math.abs(dx) > Math.abs(dy) * SWIPE_AXIS_RATIO
      ) {
        swipeRef.current = true;
        clickSuppressRef.current = true;
        columnsRef.current?.setPointerCapture(e.pointerId);
        return;
      }
      const moved = Math.hypot(dx, dy);
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
    if (swipeRef.current) {
      swipeRef.current = false;
      if (down && e.pointerId === down.pointerId) {
        const dx = e.clientX - down.startX;
        if (Math.abs(dx) > SWIPE_THRESHOLD_PX) {
          onNavigateDays(dx < 0 ? 1 : -1);
        }
      }
      return;
    }
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
      <WeekHeader
        days={days}
        now={now}
        isMobile={isMobile}
        singleDay={singleDay}
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        focusedIndex={focusedIndex}
        onNavigate={onNavigateDays}
        onSelectDay={onSelectDay}
        onGoToday={onGoToday}
      />
      <div className="no-scrollbar flex min-h-0 flex-1 overflow-y-auto pt-6">
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
          className="flex flex-1 select-none cursor-pointer"
          style={{ touchAction: "none" }}
        >
          {days.map((day, index) => {
            const createTarget = singleDay ? focusedIndex : index;
            let moveDraft = null;
            let createRange = null;
            if (drag?.mode === "move") {
              const range = moveWholeEvent(
                drag.event,
                days[drag.dayIndex],
                drag.current - drag.grabOffset,
              );
              moveDraft = { ...drag.event, ...range };
            } else if (
              drag?.mode === "create" &&
              drag.dayIndex === createTarget
            ) {
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
                className={
                  singleDay && index !== focusedIndex ? "hidden" : undefined
                }
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
