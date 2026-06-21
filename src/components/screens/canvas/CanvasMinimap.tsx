import { useState, useEffect } from "react";
import { IBlock } from "../../../interface/IBlock";
import { EBlockType } from "../../../enums/EBlockType";
import { useTranslation } from "../../../utils/translations";
import "../../../css/CanvasMinimap.css";

interface CanvasMinimapProps {
	blocks: IBlock[];
	zoom: number;
	links: { from: string; to: string }[];
	panOffset: { x: number; y: number };
}

export function CanvasMinimap({
	blocks,
	zoom,
	links,
	panOffset,
}: CanvasMinimapProps) {
	const { t } = useTranslation();
	const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });

	useEffect(() => {
		const canvasEl = document.getElementById("canvas-area");
		if (!canvasEl) return;

		setViewportSize({
			width: canvasEl.clientWidth,
			height: canvasEl.clientHeight,
		});

		const observer = new ResizeObserver((entries) => {
			for (let entry of entries) {
				if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
					setViewportSize({
						width: entry.contentRect.width,
						height: entry.contentRect.height,
					});
				}
			}
		});
		observer.observe(canvasEl);
		return () => observer.disconnect();
	}, []);

	const mapWidth = 180;
	const mapHeight = 135;

	const logicalViewportWidth = viewportSize.width / zoom;
	const logicalViewportHeight = viewportSize.height / zoom;

	// The logical viewport top-left coordinate
	const vpMinX = -panOffset.x / zoom;
	const vpMinY = -panOffset.y / zoom;

	// We keep the scale of the minimap fixed relative to the viewport itself
	// to guarantee the viewport rectangle has a constant, non-jumping size.
	const margin = 12; // margin in pixels inside the minimap
	const scaleX = (mapWidth - 2 * margin) / logicalViewportWidth;
	const scaleY = (mapHeight - 2 * margin) / logicalViewportHeight;
	const scale = Math.min(scaleX, scaleY);

	// Calculate offsets to map logical coordinates to minimap coordinates
	const offsetX = (mapWidth - logicalViewportWidth * scale) / 2 - vpMinX * scale;
	const offsetY = (mapHeight - logicalViewportHeight * scale) / 2 - vpMinY * scale;

	const getBlockColors = (type: EBlockType) => {
		switch (type) {
			case EBlockType.Text:
				return { fill: "rgba(148, 163, 184, 0.35)", stroke: "#64748b" };
			case EBlockType.Image:
				return { fill: "rgba(52, 211, 153, 0.35)", stroke: "#10b981" };
			case EBlockType.Video:
				return { fill: "rgba(251, 113, 133, 0.35)", stroke: "#f43f5e" };
			case EBlockType.Audio:
				return { fill: "rgba(56, 189, 248, 0.35)", stroke: "#0ea5e9" };
			case EBlockType.Pdf:
				return { fill: "rgba(253, 186, 116, 0.35)", stroke: "#ea580c" };
			case EBlockType.Document:
				return { fill: "rgba(196, 181, 253, 0.35)", stroke: "#8b5cf6" };
			default:
				return { fill: "rgba(203, 213, 225, 0.35)", stroke: "#94a3b8" };
		}
	};

	return (
		<div className="canvas-minimap-container">
			<span className="canvas-minimap-label">{t("minimapLabel")}</span>
			<svg className="canvas-minimap-svg" viewBox={`0 0 ${mapWidth} ${mapHeight}`}>
				<rect width={mapWidth} height={mapHeight} className="canvas-minimap-bg-rect" rx="12" ry="12" />

				{links.map((link, idx) => {
					const fromBlock = blocks.find((b) => b.id === link.from);
					const toBlock = blocks.find((b) => b.id === link.to);
					if (!fromBlock || !toBlock) return null;

					const x1 = (fromBlock.position.x + fromBlock.size.width / 2) * scale + offsetX;
					const y1 = (fromBlock.position.y + fromBlock.size.height / 2) * scale + offsetY;
					const x2 = (toBlock.position.x + toBlock.size.width / 2) * scale + offsetX;
					const y2 = (toBlock.position.y + toBlock.size.height / 2) * scale + offsetY;

					return (
						<line
							key={`minimap-link-${idx}`}
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							stroke="var(--primary-color, rgba(99, 102, 241, 0.3))"
							strokeWidth="1"
							strokeDasharray="2 2"
						/>
					);
				})}

				{blocks.map((block) => {
					const x = block.position.x * scale + offsetX;
					const y = block.position.y * scale + offsetY;
					const w = block.size.width * scale;
					const h = block.size.height * scale;
					const colors = getBlockColors(block.type);

					return (
						<rect
							key={`minimap-block-${block.id}`}
							x={x}
							y={y}
							width={Math.max(w, 2)}
							height={Math.max(h, 2)}
							fill={colors.fill}
							stroke={colors.stroke}
							strokeWidth="1"
							rx="2"
							ry="2"
						/>
					);
				})}

				<rect
					x={(mapWidth - logicalViewportWidth * scale) / 2}
					y={(mapHeight - logicalViewportHeight * scale) / 2}
					width={logicalViewportWidth * scale}
					height={logicalViewportHeight * scale}
					fill="rgba(var(--primary-color-rgb, 99, 102, 241), 0.15)"
					stroke="var(--primary-color, #6366f1)"
					strokeWidth="1.5"
					rx="3"
					ry="3"
				/>
			</svg>
		</div>
	);
}

export default CanvasMinimap;
