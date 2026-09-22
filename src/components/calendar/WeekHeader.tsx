import {
  dayHeaderInfo,
  formatDayHeading,
  formatWeekRangeLabel,
  isSameDay,
} from "../../lib/week";

export type ViewMode = "day" | "week";

export interface WeekHeaderProps {
  days: Date[];
  now: Date;
  isMobile: boolean;
  singleDay: boolean;
  viewMode: ViewMode;
  onViewModeChange(mode: ViewMode): void;
  focusedIndex: number;
  onNavigate(delta: number): void;
  onSelectDay(index: number): void;
  onGoToday(): void;
}

export function WeekHeader({
  days,
  now,
  isMobile,
  singleDay,
  viewMode,
  onViewModeChange,
  focusedIndex,
  onNavigate,
  onSelectDay,
  onGoToday,
}: WeekHeaderProps) {
  const heading = singleDay
    ? formatDayHeading(days[focusedIndex])
    : formatWeekRangeLabel(days);
  const shownDays = singleDay ? [days[focusedIndex]] : days;

  const isTodayActive = singleDay
    ? isSameDay(days[focusedIndex], now)
    : days.some((day) => isSameDay(day, now));

  const tapDayToZoom = isMobile && !singleDay;

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="flex items-center gap-2 px-3 py-2 sm:px-4">
        <div className="flex min-w-0 items-center gap-1">
          <button
            type="button"
            aria-label="Previous"
            onClick={() => onNavigate(-1)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded text-xl leading-none text-neutral-600 hover:bg-neutral-100"
          >
            ‹
          </button>
          <h1 className="truncate text-base font-semibold text-neutral-800 sm:text-lg">
            {heading}
          </h1>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1.5">
          {isMobile ? (
            <div className="flex overflow-hidden rounded-md border border-neutral-300">
              {(["day", "week"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={viewMode === mode}
                  onClick={() => onViewModeChange(mode)}
                  className={`px-2.5 py-1 text-sm font-medium capitalize ${
                    viewMode === mode
                      ? "bg-blue-600 text-white"
                      : "bg-white text-neutral-600 hover:bg-neutral-100"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={onGoToday}
            className={`rounded-md px-2.5 py-1 text-sm font-medium ${
              isTodayActive
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next"
            onClick={() => onNavigate(1)}
            className="flex h-8 w-8 items-center justify-center rounded text-xl leading-none text-neutral-600 hover:bg-neutral-100"
          >
            ›
          </button>
        </div>
      </div>
      <div className="flex border-t border-neutral-200">
        <div
          className="w-14 shrink-0 border-r border-neutral-200"
          aria-hidden="true"
        />
        {shownDays.map((day, index) => {
          const { weekday, day: dayNumber } = dayHeaderInfo(day);
          const isToday = isSameDay(day, now);
          const cell = (
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
          );
          return (
            <div
              key={day.getTime()}
              className="flex flex-1 items-center justify-center border-r border-neutral-200 py-1"
            >
              {tapDayToZoom ? (
                <button
                  type="button"
                  onClick={() => onSelectDay(index)}
                  aria-label={String(day.toDateString())}
                  className="transition-transform hover:bg-neutral-200"
                >
                  {cell}
                </button>
              ) : (
                cell
              )}
            </div>
          );
        })}
      </div>
    </header>
  );
}
