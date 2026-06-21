import { IBlock } from "../../../interface/IBlock";

interface ConnectionsLayerProps {
	blocks: IBlock[];
	links: { from: string; to: string }[];
	linkingSourceId: string | null;
	mousePos: { x: number; y: number } | null;
	hoveredLinkId: string | null;
	setHoveredLinkId: (id: string | null) => void;
	onDeleteLink: (linkId: string) => void;
}

export function ConnectionsLayer({
	blocks,
	links,
	linkingSourceId,
	mousePos,
	hoveredLinkId,
	setHoveredLinkId,
	onDeleteLink,
}: ConnectionsLayerProps) {
	return (
		<svg
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				width: "100%",
				height: "100%",
				pointerEvents: "none",
				zIndex: 0,
			}}
		>
			{/* Connection Lines */}
			{links.map((link) => {
				const fromBlock = blocks.find((b) => b.id === link.from);
				const toBlock = blocks.find((b) => b.id === link.to);
				if (!fromBlock || !toBlock) return null;

				const x1 = fromBlock.position.x + fromBlock.size.width / 2;
				const y1 = fromBlock.position.y + fromBlock.size.height / 2;
				const x2 = toBlock.position.x + toBlock.size.width / 2;
				const y2 = toBlock.position.y + toBlock.size.height / 2;

				const midX = (x1 + x2) / 2;
				const midY = (y1 + y2) / 2;

				const linkId = `${link.from}-${link.to}`;
				const isHovered = hoveredLinkId === linkId;

				return (
					<g key={linkId}>
						{/* Thick invisible interactive hover line */}
						<line
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							stroke="transparent"
							strokeWidth={20}
							style={{ cursor: "pointer", pointerEvents: "stroke" }}
							onMouseEnter={() => setHoveredLinkId(linkId)}
							onMouseLeave={() => setHoveredLinkId(null)}
						/>

						{/* Faint ambient glow under the connection line */}
						<line
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							stroke={isHovered ? "#fca5a5" : "#a5b4fc"}
							strokeWidth={isHovered ? 8 : 6}
							opacity={0.4}
							strokeLinecap="round"
							style={{
								transition: "stroke 0.2s, stroke-width 0.2s",
								pointerEvents: "none",
							}}
						/>

						{/* Core connection line */}
						<line
							x1={x1}
							y1={y1}
							x2={x2}
							y2={y2}
							stroke={isHovered ? "#ef4444" : "#6366f1"}
							strokeWidth={isHovered ? 4.5 : 3.5}
							strokeLinecap="round"
							style={{
								transition: "stroke 0.2s, stroke-width 0.2s",
								pointerEvents: "none",
							}}
						/>

						{/* Interactive delete handle in the middle */}
						{isHovered && (
							<g
								transform={`translate(${midX}, ${midY})`}
								style={{ cursor: "pointer", pointerEvents: "all" }}
								onMouseEnter={() => setHoveredLinkId(linkId)}
								onMouseLeave={() => setHoveredLinkId(null)}
								onClick={(e) => {
									e.stopPropagation();
									onDeleteLink(linkId);
								}}
							>
								<circle
									r={11}
									fill="#ef4444"
									filter="drop-shadow(0px 2px 4px rgba(239, 68, 68, 0.4))"
								/>
								<path
									d="M -4 -4 L 4 4 M -4 4 L 4 -4"
									stroke="white"
									strokeWidth={2.5}
									strokeLinecap="round"
								/>
							</g>
						)}
					</g>
				);
			})}

			{/* Temporary Link Line under construction */}
			{linkingSourceId && mousePos && (() => {
				const sourceBlock = blocks.find((b) => b.id === linkingSourceId);
				if (!sourceBlock) return null;

				const x1 = sourceBlock.position.x + sourceBlock.size.width / 2;
				const y1 = sourceBlock.position.y + sourceBlock.size.height / 2;

				return (
					<line
						x1={x1}
						y1={y1}
						x2={mousePos.x}
						y2={mousePos.y}
						stroke="#6366f1"
						strokeWidth={3}
						strokeDasharray="6 4"
						opacity={0.8}
						style={{ pointerEvents: "none" }}
					/>
				);
			})()}
		</svg>
	);
}

export default ConnectionsLayer;
