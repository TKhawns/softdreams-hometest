import { createRoute } from "@tanstack/react-router";

import { useCallback, useMemo, useState } from "react";
import { ContextMenu } from "../components/ContextMenu";
import { EventDetailsDialog } from "../components/EventDetailsDialog";
import { EventForm } from "../components/EventForm";
import { WeekView } from "../components/WeekView";
import type { CalendarEvent } from "../lib/events";
import { addEvent, createEvent, deleteEvent, updateEvent } from "../lib/events";
import { buildWeekDays } from "../lib/week";

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
	const days = useMemo(() => buildWeekDays(now), [now]);

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

	const handleDragMove = useCallback(
		(event: CalendarEvent, range: TimeRange) => {
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

	const handleDelete = useCallback(() => {
		if (!menu) return;
		setEvents((current) => deleteEvent(current, menu.event.id));
		setMenu(null);
	}, [menu]);

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
			<WeekView
				days={days}
				now={now}
				events={events}
				onOpenEvent={openEvent}
				onEventContextMenu={openEventMenu}
				onDragCreate={handleDragCreate}
				onDragMove={handleDragMove}
			/>

			{viewing ? (
				<EventDetailsDialog
					event={viewing}
					onClose={() => setViewing(null)}
					onEdit={() => openEditFromDetails(viewing)}
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
					onDelete={handleDelete}
					onClose={() => setMenu(null)}
				/>
			) : null}
		</>
	);
}
