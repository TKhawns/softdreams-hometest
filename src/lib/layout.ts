export interface SegmentLike {
	id: string;
	/** Minutes since the start of the day. */
	start: number;
	/** Minutes since the start of the day (exclusive). */
	end: number;
}

export type PlacedSegment<T extends SegmentLike> = T & {
	left: number;
	width: number;
};

function overlaps(a: SegmentLike, b: SegmentLike): boolean {
	return a.start < b.end && b.start < a.end;
}

/**
 * Assigns overlapping events to side-by-side columns. Non-overlapping events
 * keep the full width; overlapping ones share it equally. Returns results in
 * chronological order (start, then longer first).
 */
export function layoutDaySegments<T extends SegmentLike>(
	segments: T[],
): PlacedSegment<T>[] {
	const sorted = [...segments].sort(
		(a, b) => a.start - b.start || b.end - a.end,
	);
	const columnOf = new Map<string, number>();

	for (const segment of sorted) {
		const taken = new Set<number>();
		for (const other of sorted) {
			if (other.id === segment.id) continue;
			if (overlaps(segment, other) && columnOf.has(other.id)) {
				taken.add(columnOf.get(other.id) as number);
			}
		}
		let column = 0;
		while (taken.has(column)) column++;
		columnOf.set(segment.id, column);
	}

	return sorted.map((segment) => {
		const column = columnOf.get(segment.id) as number;
		const cluster = sorted.filter(
			(other) => other.id === segment.id || overlaps(segment, other),
		);
		const columnCount =
			Math.max(...cluster.map((other) => columnOf.get(other.id) as number)) + 1;
		return { ...segment, left: column / columnCount, width: 1 / columnCount };
	});
}
