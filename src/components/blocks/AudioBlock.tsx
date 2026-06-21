import React, { useState, useRef, useEffect } from "react";

interface AudioBlockProps {
	initialSrc?: string;
	initialCaption?: string;
	onChangeSrc?: (src: string) => void;
	onChangeCaption?: (caption: string) => void;
}

export const AudioBlock: React.FC<AudioBlockProps> = ({
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
				console.error("[AudioBlock] Failed to convert initialSrc to Blob URL:", err);
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
			const allowedTypes = [
				"audio/mpeg",
				"audio/wav",
				"audio/ogg",
				"audio/x-m4a",
				"audio/mp3",
				"audio/m4a",
				"audio/mp4"
			];
			if (!allowedTypes.includes(file.type) && !file.name.endsWith(".m4a") && !file.name.endsWith(".mp3")) {
				alert("Błąd: Obsługiwane są tylko pliki audio w formatach MP3, WAV, OGG oraz M4A.");
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
				accept="audio/mpeg,audio/wav,audio/ogg,audio/x-m4a,audio/mp3"
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
						<path d="M9 18V5l12-2v13" />
						<circle cx="6" cy="18" r="3" />
						<circle cx="18" cy="16" r="3" />
					</svg>
					<span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>
						Wgraj dźwięk
					</span>
					<span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
						Kliknij, aby wybrać plik audio
					</span>
				</div>
			) : (
				// Audio Render Area
				<div style={{ flex: 1, display: "flex", alignItems: "center", position: "relative", padding: "12px", gap: "12px" }}>
					<div
						style={{
							width: "36px",
							height: "36px",
							borderRadius: "50%",
							backgroundColor: "#f5f3ff",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}
					>
						<svg
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="#4f46e5"
							strokeWidth="2.5"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
							<path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
						</svg>
					</div>

					<audio
						src={src}
						controls
						style={{
							width: "100%",
							height: "32px",
						}}
					/>

					{/* Hover Overlay Controls */}
					{isHovered && (
						<div
							style={{
								position: "absolute",
								top: "6px",
								right: "6px",
								zIndex: 10,
							}}
						>
							<button
								onClick={(e) => {
									e.stopPropagation();
									triggerFileInput();
								}}
								style={controlButtonStyle}
								title="Zmień plik audio"
								onMouseOver={(e) => {
									e.currentTarget.style.backgroundColor = "#0f172a";
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.75)";
								}}
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
	width: "22px",
	height: "22px",
	borderRadius: "5px",
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

export default AudioBlock;
