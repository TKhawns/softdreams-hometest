import { createRoute } from "@tanstack/react-router";

import { useCallback, useMemo, useState } from "react";
import { ContextMenu } from "../components/ContextMenu";
import { EventDetailsDialog } from "../components/EventDetailsDialog";
import { WeekView } from "../components/WeekView";
import type { CalendarEvent } from "../lib/events";
import { deleteEvent } from "../lib/events";
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

function CalendarPage() {
	const now = useMemo(() => new Date(), []);
	const days = useMemo(() => buildWeekDays(now), [now]);

	const [events, setEvents] = useState<CalendarEvent[]>([]);
	const [viewing, setViewing] = useState<CalendarEvent | null>(null);
	const [menu, setMenu] = useState<MenuState | null>(null);

	const openEvent = useCallback((event: CalendarEvent) => {
		setMenu(null);
		setViewing(event);
	}, []);

	const openEventMenu = useCallback(
		(event: CalendarEvent, position: { x: number; y: number }) => {
			setViewing(null);
			setMenu({ event, position });
		},
		[],
	);

	const handleDelete = useCallback(() => {
		if (!menu) return;
		setEvents((current) => deleteEvent(current, menu.event.id));
		setMenu(null);
	}, [menu]);

	return (
		<>
			<WeekView
				days={days}
				now={now}
				events={events}
				onOpenEvent={openEvent}
				onEventContextMenu={openEventMenu}
			/>

			{viewing ? (
				<EventDetailsDialog
					event={viewing}
					onClose={() => setViewing(null)}
					onEdit={() => {
						setViewing(null);
					}}
				/>
			) : null}

			{menu ? (
				<ContextMenu
					position={menu.position}
					onEdit={() => setMenu(null)}
					onDelete={handleDelete}
					onClose={() => setMenu(null)}
				/>
			) : null}
		</>
	);
}
