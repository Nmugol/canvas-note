import React, { useState, useRef, useEffect } from "react";

interface VideoBlockProps {
	initialSrc?: string;
	initialCaption?: string;
	onChangeSrc?: (src: string) => void;
	onChangeCaption?: (caption: string) => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
	initialSrc = "",
	initialCaption = "",
	onChangeSrc,
	onChangeCaption,
}) => {
	const [src, setSrc] = useState(initialSrc);
	const [caption, setCaption] = useState(initialCaption);
	const [isHovered, setIsHovered] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		let active = true;
		let createdBlobUrl = "";

		const loadMedia = async () => {
			if (!initialSrc) {
				setSrc("");
				return;
			}

			if (initialSrc.startsWith("data:") || initialSrc.startsWith("blob:")) {
				setSrc(initialSrc);
				return;
			}

			try {
				const response = await fetch(initialSrc);
				const blob = await response.blob();
				if (active) {
					createdBlobUrl = URL.createObjectURL(blob);
					setSrc(createdBlobUrl);
				}
			} catch (err) {
				console.error("[VideoBlock] Failed to convert initialSrc to Blob URL:", err);
				if (active) {
					setSrc(initialSrc); // Fallback
				}
			}
		};

		loadMedia();

		return () => {
			active = false;
			if (createdBlobUrl) {
				URL.revokeObjectURL(createdBlobUrl);
			}
		};
	}, [initialSrc]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const allowedTypes = ["video/mp4", "video/webm", "video/ogg"];
			if (!allowedTypes.includes(file.type)) {
				alert("Błąd: Obsługiwane są tylko pliki wideo w formatach MP4, WebM oraz OGG.");
				return;
			}

			// Create a blob URL for standard media player streaming
			const blobUrl = URL.createObjectURL(file);
			setSrc(blobUrl);
			if (onChangeSrc) {
				onChangeSrc(blobUrl);
			}
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
				accept="video/mp4,video/webm,video/ogg"
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
						<path d="M23 7l-7 5 7 5V7z" />
						<rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
					</svg>
					<span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>
						Wgraj wideo
					</span>
					<span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
						Kliknij, aby wybrać plik wideo
					</span>
				</div>
			) : (
				// Video Render Area
				<div style={{ flex: 1, position: "relative", overflow: "hidden", backgroundColor: "#000000" }}>
					<video
						src={src}
						controls
						style={{
							width: "100%",
							height: "100%",
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
								zIndex: 10,
							}}
						>
							<button
								onClick={(e) => {
									e.stopPropagation();
									triggerFileInput();
								}}
								style={controlButtonStyle}
								title="Zmień wideo"
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

export default VideoBlock;
