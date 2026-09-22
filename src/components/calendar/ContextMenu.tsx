import { useEffect, useRef } from "react";

export interface ContextMenuProps {
	position: { x: number; y: number };
	onEdit(): void;
	onDelete(): void;
	onClose(): void;
}

/** Right-click menu for an event: Edit and Delete. */
export function ContextMenu({
	position,
	onEdit,
	onDelete,
	onClose,
}: ContextMenuProps) {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handlePointerDown(pointer: MouseEvent) {
			if (ref.current && !ref.current.contains(pointer.target as Node)) {
				onClose();
			}
		}
		function handleKeyDown(key: KeyboardEvent) {
			if (key.key === "Escape") onClose();
		}
		document.addEventListener("mousedown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [onClose]);

	return (
		<div
			ref={ref}
			role="menu"
			className="fixed z-50 min-w-36 rounded-md border border-neutral-200 bg-white py-1 shadow-lg"
			style={{ left: position.x, top: position.y }}
		>
			<button
				type="button"
				role="menuitem"
				onClick={onEdit}
				className="block w-full px-3 py-1.5 text-left text-sm text-neutral-800 hover:bg-neutral-100"
			>
				Edit
			</button>
			<button
				type="button"
				role="menuitem"
				onClick={onDelete}
				className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-neutral-100"
			>
				Delete
			</button>
		</div>
	);
}
