import React, { useState } from "react";
import "../../css/Resizable.css";

export type HandleType = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

interface ResizableProps {
	position: { x: number; y: number };
	size: { width: number; height: number };
	onResize: (
		position: { x: number; y: number },
		size: { width: number; height: number },
	) => void;
	onDelete?: () => void;
	isSelected?: boolean;
	isLinkingSource?: boolean;
	onSelect?: () => void;
	onContextMenu?: (e: React.MouseEvent) => void;
	children: React.ReactNode;
	minWidth?: number;
	minHeight?: number;
	zoom?: number;
}

export const Resizable: React.FC<ResizableProps> = ({
	position,
	size,
	onResize,
	onDelete,
	isSelected = false,
	isLinkingSource = false,
	onSelect,
	onContextMenu,
	children,
	minWidth = 120,
	minHeight = 80,
	zoom = 1,
}) => {
	const [isResizing, setIsResizing] = useState(false);
	const [isDragging, setIsDragging] = useState(false);

	const handleDragMouseDown = (e: React.MouseEvent) => {
		// Only drag with left mouse button
		if (e.button !== 0) return;
		e.preventDefault();
		e.stopPropagation();

		if (onSelect) onSelect();
		setIsDragging(true);

		const startX = e.clientX;
		const startY = e.clientY;
		const startXPos = position.x;
		const startYPos = position.y;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const dx = (moveEvent.clientX - startX) / zoom;
			const dy = (moveEvent.clientY - startY) / zoom;

			onResize(
				{ x: startXPos + dx, y: startYPos + dy },
				size
			);
		};

		const handleMouseUp = () => {
			setIsDragging(false);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseDown = (direction: HandleType, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();

		if (onSelect) onSelect();
		setIsResizing(true);

		const startX = e.clientX;
		const startY = e.clientY;
		const startWidth = size.width;
		const startHeight = size.height;
		const startXPos = position.x;
		const startYPos = position.y;

		const handleMouseMove = (moveEvent: MouseEvent) => {
			const dx = (moveEvent.clientX - startX) / zoom;
			const dy = (moveEvent.clientY - startY) / zoom;

			let newWidth = startWidth;
			let newHeight = startHeight;
			let newX = startXPos;
			let newY = startYPos;

			// Handle horizontal resizing
			if (direction.includes("e")) {
				newWidth = Math.max(minWidth, startWidth + dx);
			} else if (direction.includes("w")) {
				const potentialWidth = startWidth - dx;
				if (potentialWidth >= minWidth) {
					newWidth = potentialWidth;
					newX = startXPos + dx;
				}
			}

			// Handle vertical resizing
			if (direction.includes("s")) {
				newHeight = Math.max(minHeight, startHeight + dy);
			} else if (direction.includes("n")) {
				const potentialHeight = startHeight - dy;
				if (potentialHeight >= minHeight) {
					newHeight = potentialHeight;
					newY = startYPos + dy;
				}
			}

			onResize({ x: newX, y: newY }, { width: newWidth, height: newHeight });
		};

		const handleMouseUp = () => {
			setIsResizing(false);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseup", handleMouseUp);
		};

		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseup", handleMouseUp);
	};

	const handleStyles: Record<HandleType, React.CSSProperties> = {
		n: { top: -4, left: 6, right: 6, height: 8, cursor: "ns-resize" },
		s: { bottom: -4, left: 6, right: 6, height: 8, cursor: "ns-resize" },
		e: { right: -4, top: 6, bottom: 6, width: 8, cursor: "ew-resize" },
		w: { left: -4, top: 6, bottom: 6, width: 8, cursor: "ew-resize" },
		ne: { top: -5, right: -5, cursor: "nesw-resize" },
		nw: { top: -5, left: -5, cursor: "nwse-resize" },
		se: { bottom: -5, right: -5, cursor: "nwse-resize" },
		sw: { bottom: -5, left: -5, cursor: "nesw-resize" },
	};

	return (
		<div
			onMouseDown={() => {
				if (onSelect) onSelect();
			}}
			onDoubleClick={(e) => {
				const textarea = e.currentTarget.querySelector("textarea");
				if (textarea) {
					textarea.focus();
				}
			}}
			onContextMenu={(e) => {
				if (onContextMenu) {
					onContextMenu(e);
				}
			}}
			style={{
				left: `${position.x}px`,
				top: `${position.y}px`,
				width: `${size.width}px`,
				height: `${size.height}px`,
			}}
			className={`resizable-block ${isResizing ? "resizing" : ""} ${isDragging ? "dragging" : ""} ${isSelected ? "selected" : ""} ${isLinkingSource ? "linking-source" : ""}`}
		>
			{/* Grip/Drag Handle */}
			<div className="drag-handle" onMouseDown={handleDragMouseDown}>
				<div className="grip-icon">
					<div className="grip-dot" />
					<div className="grip-dot" />
					<div className="grip-dot" />
					<div className="grip-dot" />
					<div className="grip-dot" />
					<div className="grip-dot" />
				</div>
				{onDelete && (
					<button
						className="delete-block-btn"
						onClick={(e) => {
							e.stopPropagation();
							onDelete();
						}}
						onMouseDown={(e) => {
							e.stopPropagation(); // Prevent drag on button press
						}}
						title="Usuń notatkę"
					>
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18" />
							<line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				)}
			</div>

			{/* Child Content */}
			<div className="block-content-wrapper">
				{children}
			</div>

			{/* Resize Handles */}
			{(Object.keys(handleStyles) as HandleType[]).map((dir) => {
				const isCorner = dir.length === 2;
				const classNames = `resize-handle resize-handle-${dir} ${
					isCorner ? "resize-handle-corner" : ""
				}`;
				return (
					<div
						key={dir}
						onMouseDown={(e) => handleMouseDown(dir, e)}
						style={handleStyles[dir]}
						className={classNames}
					/>
				);
			})}
		</div>
	);
};

export default Resizable;
