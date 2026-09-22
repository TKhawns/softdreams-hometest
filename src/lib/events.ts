export interface CalendarEvent {
	id: string;
	title: string;
	description: string;
	start: Date;
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

/** Append an event, returning a new array. */
export function addEvent(
	events: CalendarEvent[],
	event: CalendarEvent,
): CalendarEvent[] {
	return [...events, event];
}

/** Replace the event with the matching id, returning a new array. */
export function updateEvent(
	events: CalendarEvent[],
	event: CalendarEvent,
): CalendarEvent[] {
	return events.map((existing) =>
		existing.id === event.id ? event : existing,
	);
}

/** Remove the event with the matching id, returning a new array. */
export function deleteEvent(
	events: CalendarEvent[],
	eventId: string,
): CalendarEvent[] {
	return events.filter((event) => event.id !== eventId);
}

/** Look up an event by id. */
export function findEvent(
	events: CalendarEvent[],
	eventId: string,
): CalendarEvent | undefined {
	return events.find((event) => event.id === eventId);
}

/** Null when the input is acceptable; otherwise the reason it cannot be saved. */
export function validateEventInput(
	title: string,
	start: Date,
	end: Date,
): string | null {
	if (!title.trim()) return "Title is required";
	if (end.getTime() <= start.getTime()) return "End must be after start";
	return null;
}
