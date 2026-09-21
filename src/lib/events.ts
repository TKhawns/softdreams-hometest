export interface CalendarEvent {
	id: string;
	title: string;
	description: string;
	/** Inclusive full datetime (date + time — there are no all-day events). */
	start: Date;
	/** Exclusive end datetime. */
	end: Date;
}

export type NewEvent = Omit<CalendarEvent, "id">;

/** Builds a complete event, generating a fresh id. */
export function createEvent(input: NewEvent): CalendarEvent {
	return { ...input, id: crypto.randomUUID() };
}

/** True when end is strictly after start. */
export function isEventRangeValid(
	event: Pick<CalendarEvent, "start" | "end">,
): boolean {
	return event.end.getTime() > event.start.getTime();
}
