import { HOUR_HEIGHT_PX } from "../lib/geometry";
import { formatHour } from "../lib/time";

export function HourGutter() {
	return (
		<div className="relative w-14 shrink-0 border-r border-neutral-200">
			{Array.from({ length: 24 }, (_, h) => {
				const minutes = h * 60;
				return (
					<div
						key={minutes}
						className="relative border-t border-neutral-100"
						style={{ height: HOUR_HEIGHT_PX }}
					>
						<span className="absolute -top-2.5 right-2 text-xs text-neutral-500">
							{formatHour(minutes)}
						</span>
					</div>
				);
			})}
		</div>
	);
}
