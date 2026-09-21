import { useState } from "react";
import { validateEventInput } from "../lib/events";
import { formatDateTimeLocal, parseDateTimeLocal } from "../lib/time";
import { Modal } from "./Modal";

export interface EventFormValues {
	title: string;
	description: string;
	start: Date;
	end: Date;
}

export interface EventFormProps {
	initial: EventFormValues;
	submitLabel: string;
	onSubmit(values: EventFormValues): void;
	onCancel(): void;
}

/** Shared create/edit form: title, description, start and end datetime-locals. */
export function EventForm({
	initial,
	submitLabel,
	onSubmit,
	onCancel,
}: EventFormProps) {
	const [title, setTitle] = useState(initial.title);
	const [description, setDescription] = useState(initial.description);
	const [startValue, setStartValue] = useState(
		formatDateTimeLocal(initial.start),
	);
	const [endValue, setEndValue] = useState(formatDateTimeLocal(initial.end));
	const [error, setError] = useState<string | null>(null);

	function handleSubmit() {
		const start = parseDateTimeLocal(startValue);
		const end = parseDateTimeLocal(endValue);
		if (!start) {
			setError("Invalid start time");
			return;
		}
		if (!end) {
			setError("Invalid end time");
			return;
		}
		const message = validateEventInput(title, start, end);
		if (message) {
			setError(message);
			return;
		}
		onSubmit({ title: title.trim(), description, start, end });
	}

	return (
		<Modal onClose={onCancel}>
			<h2 className="text-lg font-semibold text-neutral-900">Event</h2>
			<form
				className="mt-4 space-y-4"
				onSubmit={(event) => {
					event.preventDefault();
					handleSubmit();
				}}
			>
				<label className="block">
					<span className="text-sm font-medium text-neutral-700">Title</span>
					<input
						name="title"
						type="text"
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
					/>
				</label>

				<label className="block">
					<span className="text-sm font-medium text-neutral-700">
						Description
					</span>
					<textarea
						name="description"
						value={description}
						onChange={(event) => setDescription(event.target.value)}
						rows={3}
						className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
					/>
				</label>

				<div className="grid grid-cols-2 gap-3">
					<label className="block">
						<span className="text-sm font-medium text-neutral-700">Start</span>
						<input
							name="start"
							type="datetime-local"
							value={startValue}
							onChange={(event) => setStartValue(event.target.value)}
							className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
						/>
					</label>
					<label className="block">
						<span className="text-sm font-medium text-neutral-700">End</span>
						<input
							name="end"
							type="datetime-local"
							value={endValue}
							onChange={(event) => setEndValue(event.target.value)}
							className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
						/>
					</label>
				</div>

				{error ? (
					<p role="alert" className="text-sm text-red-600">
						{error}
					</p>
				) : null}

				<div className="flex justify-end gap-2">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
					>
						Cancel
					</button>
					<button
						type="submit"
						className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
					>
						{submitLabel}
					</button>
				</div>
			</form>
		</Modal>
	);
}
