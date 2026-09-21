import { createRoute } from "@tanstack/react-router";

import { useMemo } from "react";
import { WeekView } from "../components/WeekView";
import { buildWeekDays } from "../lib/week";

import { rootRoute } from "./__root";

export const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: CalendarPage,
});

function CalendarPage() {
	const now = useMemo(() => new Date(), []);
	const days = useMemo(() => buildWeekDays(now), [now]);

	return <WeekView days={days} now={now} />;
}
