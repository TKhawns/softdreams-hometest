import { createRoute } from "@tanstack/react-router";

import { rootRoute } from "./__root";

export const indexRoute = createRoute({
	getParentRoute: () => rootRoute,
	path: "/",
	component: () => (
		<main className="flex h-screen items-center justify-center bg-white">
			<h1 className="text-2xl font-semibold text-neutral-800">
				Time Blocking Calendar
			</h1>
		</main>
	),
});
