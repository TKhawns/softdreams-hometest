import { useEffect, useState } from "react";

import { buildMonthCells, isSameMonth, monthLabel } from "../lib/month";
import { WEEKDAYS_SHORT } from "../lib/time";
import { isSameDay } from "../lib/week";

export interface MonthCalendarProps {
	/** The 7 days currently shown in the week viewport. */
	days: Date[];
	now: Date;
	onSelectDay(day: Date): void;
}

/**
 * A compact month calendar sidebar: always shows the month of the week
 * viewport's first day (it slides with the viewport), highlights the days
 * that are in the viewport, and clicking a day pans the viewport to it.
 */
export function MonthCalendar({ days, now, onSelectDay }: MonthCalendarProps) {
	const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(days[0]));

	useEffect(() => {
		setMonthAnchor(startOfMonth(days[0]));
	}, [days]);

	const cells = buildMonthCells(monthAnchor);
	const viewportKeys = new Set(days.map((day) => day.getTime()));

	return (
		<aside className="flex w-60 shrink-0 flex-col border-r border-neutral-200 bg-white p-3">
			<div className="mb-2 flex items-center justify-between">
				<h2 className="text-sm font-semibold text-neutral-800">
					{monthLabel(monthAnchor)}
				</h2>
				<div className="flex gap-1">
					<button
						type="button"
						aria-label="Previous month"
						onClick={() => setMonthAnchor(shiftMonth(monthAnchor, -1))}
						className="flex h-7 w-7 items-center justify-center rounded text-neutral-600 hover:bg-neutral-100"
					>
						‹
					</button>
					<button
						type="button"
						aria-label="Next month"
						onClick={() => setMonthAnchor(shiftMonth(monthAnchor, 1))}
						className="flex h-7 w-7 items-center justify-center rounded text-neutral-600 hover:bg-neutral-100"
					>
						›
					</button>
				</div>
			</div>

			<div className="grid grid-cols-7 text-center text-[11px] font-medium text-neutral-400">
				{WEEKDAYS_SHORT.map((weekday) => (
					<span key={weekday} className="py-1">
						{weekday}
					</span>
				))}
			</div>

			<div className="grid grid-cols-7 gap-y-0.5">
				{cells.map((cell) => {
					const isToday = isSameDay(cell, now);
					const inViewport = viewportKeys.has(cell.getTime());
					const inMonth = isSameMonth(cell, monthAnchor);
					return (
						<button
							key={cell.getTime()}
							type="button"
							onClick={() => onSelectDay(cell)}
							aria-label={cell.toDateString()}
							className={`flex aspect-square items-center justify-center rounded-full text-xs ${
								isToday
									? "bg-blue-600 font-semibold text-white"
									: inViewport
										? "bg-blue-100 font-medium text-blue-800"
										: inMonth
											? "text-neutral-700 hover:bg-neutral-100"
											: "text-neutral-300 hover:bg-neutral-100"
							}`}
						>
							{cell.getDate()}
						</button>
					);
				})}
			</div>
		</aside>
	);
}

function startOfMonth(date: Date): Date {
	return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date: Date, delta: number): Date {
	return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}
