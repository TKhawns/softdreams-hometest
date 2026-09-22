import { createRoute } from "@tanstack/react-router";

import { useCallback, useMemo, useState } from "react";
import { ContextMenu } from "../components/calendar/ContextMenu";
import { EventDetailsDialog } from "../components/calendar/EventDetailsDialog";
import { EventForm } from "../components/calendar/EventForm";
import { MonthCalendar } from "../components/calendar/MonthCalendar";
import { WeekView } from "../components/calendar/WeekView";
import { useMediaQuery } from "../hooks/useMediaQuery";
import type { CalendarEvent } from "../lib/events";
import {
	addEvent,
	createEvent,
	deleteEvent,
	isEventRangeValid,
	updateEvent,
} from "../lib/events";
import { buildWeekDays, shiftWeek } from "../lib/week";

import { rootRoute } from "./__root";

export const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: CalendarPage,
});

interface MenuState {
	event: CalendarEvent;
	position: { x: number; y: number };
}

type TimeRange = { start: Date; end: Date };

function CalendarPage() {
	const now = useMemo(() => new Date(), []);
	const [days, setDays] = useState<Date[]>(() => buildWeekDays(now));
	/** Single-day view below the `sm` breakpoint; full week grid from `sm` up. */
	const isMobile = !useMediaQuery("(min-width: 640px)");
	/** Which layout the mobile view shows (day focus or the 7-day week). */
	const [mobileViewMode, setMobileViewMode] = useState<"day" | "week">("day");
	/** Exactly one day column is shown: mobile + day mode. */
	const singleDay = isMobile && mobileViewMode === "day";
	const [focusedIndex, setFocusedIndex] = useState(0);

	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [viewing, setViewing] = useState<CalendarEvent | null>(null);
	const [menu, setMenu] = useState<MenuState | null>(null);
	const [creating, setCreating] = useState<TimeRange | null>(null);
	const [editing, setEditing] = useState<CalendarEvent | null>(null);

	const openEvent = useCallback((event: CalendarEvent) => {
		setMenu(null);
		setEditing(null);
		setCreating(null);
		setViewing(event);
	}, []);

	const openEventMenu = useCallback(
		(event: CalendarEvent, position: { x: number; y: number }) => {
			setViewing(null);
			setEditing(null);
			setCreating(null);
			setMenu({ event, position });
		},
		[],
	);

	const handleDragCreate = useCallback((range: TimeRange) => {
		setMenu(null);
		setViewing(null);
		setEditing(null);
		setCreating(range);
	}, []);

	const handleSelectDay = useCallback((day: Date) => {
		setDays(buildWeekDays(day));
		// The picked day becomes the first column of the new window.
		setFocusedIndex(0);
	}, []);

	/** -1 / +1: previous/next day in single-day mode, previous/next week otherwise. */
	const handleNavigate = useCallback(
		(delta: number) => {
			if (singleDay) {
				const next = focusedIndex + delta;
				if (next >= 0 && next < 7) {
					setFocusedIndex(next);
				} else {
					// Stepped past the edge: slide the window and wrap focus.
					setDays((current) => shiftWeek(current, delta));
					setFocusedIndex(next < 0 ? 6 : 0);
				}
			} else {
				setDays((current) => shiftWeek(current, delta));
			}
		},
		[singleDay, focusedIndex],
	);

	const handleGoToday = useCallback(() => {
		setDays(buildWeekDays(now));
		setFocusedIndex(0);
	}, [now]);

	/** Mobile week overview: tapping a day header zooms into that single day. */
	const handleSelectDayHeader = useCallback((index: number) => {
		setFocusedIndex(index);
		setMobileViewMode("day");
	}, []);

	const handleDragMove = useCallback(
		(event: CalendarEvent, range: TimeRange) => {
			if (!isEventRangeValid(range)) return;
			setEvents((current) =>
				updateEvent(current, { ...event, start: range.start, end: range.end }),
			);
		},
		[],
	);

	const handleCreateSubmit = useCallback(
		(values: {
			title: string;
			description: string;
			start: Date;
			end: Date;
		}) => {
			setEvents((current) => addEvent(current, createEvent(values)));
			setCreating(null);
		},
		[],
	);

	const handleEditSubmit = useCallback(
		(values: {
			title: string;
			description: string;
			start: Date;
			end: Date;
		}) => {
			if (!editing) return;
			setEvents((current) => updateEvent(current, { ...editing, ...values }));
			setEditing(null);
		},
		[editing],
	);

	const deleteEventById = useCallback((id: string) => {
		setEvents((current) => deleteEvent(current, id));
	}, []);

	const handleDeleteFromMenu = useCallback(() => {
		if (!menu) return;
		deleteEventById(menu.event.id);
		setMenu(null);
	}, [menu, deleteEventById]);

	const handleDeleteFromDetails = useCallback(() => {
		if (!viewing) return;
		deleteEventById(viewing.id);
		setViewing(null);
	}, [viewing, deleteEventById]);

	const openEditFromDetails = useCallback((event: CalendarEvent) => {
		setViewing(null);
		setCreating(null);
		setEditing(event);
	}, []);

	const openEditFromMenu = useCallback(() => {
		if (!menu) return;
		setMenu(null);
		setCreating(null);
		setEditing(menu.event);
	}, [menu]);

	return (
		<>
			<div className="flex h-dvh overflow-hidden">
				<MonthCalendar
					days={days}
					now={now}
					onSelectDay={handleSelectDay}
					className="hidden lg:flex"
				/>
				<main className="min-w-0 flex-1">
					<WeekView
						days={days}
						now={now}
						events={events}
						isMobile={isMobile}
						singleDay={singleDay}
						viewMode={mobileViewMode}
						onViewModeChange={setMobileViewMode}
						focusedIndex={focusedIndex}
						onNavigateDays={handleNavigate}
						onGoToday={handleGoToday}
						onSelectDay={handleSelectDayHeader}
						onOpenEvent={openEvent}
						onEventContextMenu={openEventMenu}
						onDragCreate={handleDragCreate}
						onDragMove={handleDragMove}
					/>
				</main>
			</div>

			{viewing ? (
				<EventDetailsDialog
					event={viewing}
					onClose={() => setViewing(null)}
					onEdit={() => openEditFromDetails(viewing)}
					onDelete={handleDeleteFromDetails}
				/>
			) : null}

			{creating ? (
				<EventForm
					initial={{ title: "", description: "", ...creating }}
					submitLabel="Create"
					onSubmit={handleCreateSubmit}
					onCancel={() => setCreating(null)}
				/>
			) : null}

			{editing ? (
				<EventForm
					initial={editing}
					submitLabel="Save changes"
					onSubmit={handleEditSubmit}
					onCancel={() => setEditing(null)}
				/>
			) : null}

			{menu ? (
				<ContextMenu
					position={menu.position}
					onEdit={openEditFromMenu}
					onDelete={handleDeleteFromMenu}
					onClose={() => setMenu(null)}
				/>
			) : null}
		</>
	);
}
