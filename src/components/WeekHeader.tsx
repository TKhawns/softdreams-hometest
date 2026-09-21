import { dayHeaderInfo, formatWeekRangeLabel, isSameDay } from "../lib/week";

export interface WeekHeaderProps {
	days: Date[];
	now: Date;
}

export function WeekHeader({ days, now }: WeekHeaderProps) {
	return (
		<header className="border-b border-neutral-200 bg-white">
			<div className="flex items-center justify-between px-4 py-2">
				<h1 className="text-lg font-semibold text-neutral-800">
					{formatWeekRangeLabel(days)}
				</h1>
			</div>
			<div className="flex border-t border-neutral-200">
				<div
					className="w-14 shrink-0 border-r border-neutral-200"
					aria-hidden="true"
				/>
				{days.map((day) => {
					const { weekday, day: dayNumber } = dayHeaderInfo(day);
					const isToday = isSameDay(day, now);
					return (
						<div
							key={day.getTime()}
							className="flex flex-1 items-center justify-center border-r border-neutral-200 py-1"
						>
							<div
								className={
									isToday
										? "flex flex-col items-center rounded-full bg-blue-600 px-3 py-1 text-white"
										: "flex flex-col items-center rounded-full px-3 py-1 text-neutral-700"
								}
							>
								<span className="text-xs font-medium uppercase">{weekday}</span>
								<span className="text-sm font-semibold">{dayNumber}</span>
							</div>
						</div>
					);
				})}
			</div>
		</header>
	);
}
