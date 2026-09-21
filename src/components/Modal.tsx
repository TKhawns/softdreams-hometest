import type { ReactNode } from "react";
import { useEffect } from "react";

export interface ModalProps {
	onClose(): void;
	children: ReactNode;
}

/** Centered modal with a clickable backdrop and Escape-to-close. */
export function Modal({ onClose, children }: ModalProps) {
	useEffect(() => {
		function handleKeyDown(key: KeyboardEvent) {
			if (key.key === "Escape") onClose();
		}
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [onClose]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<button
				type="button"
				aria-label="Close dialog"
				className="absolute inset-0 cursor-default bg-black/40"
				onClick={onClose}
			/>
			<div
				role="dialog"
				aria-modal="true"
				className="relative z-10 w-full max-w-md rounded-lg bg-white p-5 shadow-xl"
			>
				{children}
			</div>
		</div>
	);
}
