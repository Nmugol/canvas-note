import React, { useState, useRef } from "react";

interface ImageBlockProps {
	initialSrc?: string;
	initialCaption?: string;
	onChangeSrc?: (src: string) => void;
	onChangeCaption?: (caption: string) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
	initialSrc = "",
	initialCaption = "",
	onChangeSrc,
	onChangeCaption,
}) => {
	const [src, setSrc] = useState(initialSrc);
	const [caption, setCaption] = useState(initialCaption);
	const [fitType, setFitType] = useState<"cover" | "contain">("cover");
	const [isHovered, setIsHovered] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = (event) => {
				const result = event.target?.result as string;
				setSrc(result);
				if (onChangeSrc) {
					onChangeSrc(result);
				}
			};
			reader.readAsDataURL(file);
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setCaption(val);
		if (onChangeCaption) {
			onChangeCaption(val);
		}
	};

	const toggleFitType = (e: React.MouseEvent) => {
		e.stopPropagation();
		setFitType((prev) => (prev === "cover" ? "contain" : "cover"));
	};

	return (
		<div
			style={{
				width: "100%",
				height: "100%",
				position: "relative",
				display: "flex",
				flexDirection: "column",
				fontFamily: "var(--font-family, system-ui, sans-serif)",
				backgroundColor: "transparent",
				overflow: "hidden",
			}}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			<input
				type="file"
				ref={fileInputRef}
				onChange={handleFileChange}
				accept="image/*"
				style={{ display: "none" }}
			/>

			{!src ? (
				// Premium Upload Placeholder
				<div
					onClick={triggerFileInput}
					className="media-placeholder"
				>
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#94a3b8"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						style={{ marginBottom: "8px" }}
					>
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
						<circle cx="8.5" cy="8.5" r="1.5" />
						<polyline points="21 15 16 10 5 21" />
					</svg>
					<span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>
						Wgraj zdjęcie
					</span>
					<span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
						Kliknij, aby wybrać plik
					</span>
				</div>
			) : (
				// Image Render Area
				<div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
					<img
						src={src}
						alt={caption || "Obraz"}
						style={{
							width: "100%",
							height: "100%",
							objectFit: fitType,
							display: "block",
						}}
					/>

					{/* Hover Overlay Controls */}
					{isHovered && (
						<div
							style={{
								position: "absolute",
								top: "8px",
								right: "8px",
								display: "flex",
								gap: "6px",
								zIndex: 10,
							}}
						>
							<button
								onClick={toggleFitType}
								style={controlButtonStyle}
								title={fitType === "cover" ? "Dopasuj obraz" : "Rozciągnij obraz"}
								onMouseOver={(e) => {
									e.currentTarget.style.backgroundColor = "#0f172a";
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.75)";
								}}
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M15 3h6v6" />
									<path d="M9 21H3v-6" />
									<path d="M21 3l-7 7" />
									<path d="M3 21l7-7" />
								</svg>
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									triggerFileInput();
								}}
								style={controlButtonStyle}
								title="Zmień zdjęcie"
								onMouseOver={(e) => {
									e.currentTarget.style.backgroundColor = "#0f172a";
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.75)";
								}}
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
								</svg>
							</button>
						</div>
					)}
				</div>
			)}

			{/* Caption Input */}
			{(src || caption) && (
				<div
					style={{
						padding: "6px 12px",
						borderTop: "1px solid var(--divider-color, #f1f5f9)",
						backgroundColor: "transparent",
						display: "flex",
						alignItems: "center",
					}}
				>
					<input
						type="text"
						value={caption}
						onChange={handleCaptionChange}
						placeholder="Dodaj podpis..."
						style={{
							width: "100%",
							border: "none",
							outline: "none",
							fontSize: "12px",
							color: "#475569",
							fontStyle: caption ? "normal" : "italic",
							backgroundColor: "transparent",
							textAlign: "center",
						}}
					/>
				</div>
			)}
		</div>
	);
};

const controlButtonStyle: React.CSSProperties = {
	width: "26px",
	height: "26px",
	borderRadius: "6px",
	backgroundColor: "rgba(15, 23, 42, 0.75)",
	color: "#ffffff",
	border: "none",
	cursor: "pointer",
	display: "flex",
	alignItems: "center",
	justifyContent: "center",
	boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
	transition: "background-color 0.2s ease",
};

export default ImageBlock;
