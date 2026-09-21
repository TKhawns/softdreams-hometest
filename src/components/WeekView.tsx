import type { CalendarEvent } from "../lib/events";
import { DayColumn } from "./DayColumn";
import { HourGutter } from "./HourGutter";
import { WeekHeader } from "./WeekHeader";

export interface WeekViewProps {
	days: Date[];
	now: Date;
	events: CalendarEvent[];
	onOpenEvent(event: CalendarEvent): void;
	onEventContextMenu(
		event: CalendarEvent,
		position: { x: number; y: number },
	): void;
}

export function WeekView({
	days,
	now,
	events,
	onOpenEvent,
	onEventContextMenu,
}: WeekViewProps) {
	return (
		<div className="flex h-screen flex-col bg-white font-sans text-neutral-800">
			<WeekHeader days={days} now={now} />
			<div className="flex flex-1 overflow-y-auto">
				<HourGutter />
				<div className="flex flex-1">
					{days.map((day) => (
						<DayColumn
							key={day.getTime()}
							day={day}
							now={now}
							events={events}
							onOpenEvent={onOpenEvent}
							onEventContextMenu={onEventContextMenu}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
