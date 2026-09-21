import { HOUR_HEIGHT_PX, timeToY } from "../lib/geometry";
import { isSameDay } from "../lib/week";

const HOUR_STARTS = Array.from({ length: 24 }, (_, h) => h * 60);

export interface DayColumnProps {
	day: Date;
	now: Date;
}

/** One day column: 24 hourly cells plus a current-time indicator on today. */
export function DayColumn({ day, now }: DayColumnProps) {
	const isToday = isSameDay(day, now);
	const nowY = timeToY(now, HOUR_HEIGHT_PX);
	return (
		<div
			className="relative flex-1 border-r border-neutral-200"
			style={{ height: 24 * HOUR_HEIGHT_PX }}
		>
			{HOUR_STARTS.map((minutes) => (
				<div
					key={minutes}
					className="border-t border-neutral-100"
					style={{ height: HOUR_HEIGHT_PX }}
				/>
			))}
			{isToday ? (
				<div
					className="pointer-events-none absolute inset-x-0 z-10"
					style={{ top: nowY }}
				>
					<div className="relative h-px bg-red-500">
						<span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
					</div>
				</div>
			) : null}
		</div>
	);
}
