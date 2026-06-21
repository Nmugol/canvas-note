import React, { useState, useRef } from "react";

interface PdfBlockProps {
	initialSrc?: string;
	initialCaption?: string;
	onChangeSrc?: (src: string) => void;
	onChangeCaption?: (caption: string) => void;
}

export const PdfBlock: React.FC<PdfBlockProps> = ({
	initialSrc = "",
	initialCaption = "",
	onChangeSrc,
	onChangeCaption,
}) => {
	const [src, setSrc] = useState(initialSrc);
	const [caption, setCaption] = useState(initialCaption);
	const [isHovered, setIsHovered] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
				alert("Błąd: Obsługiwane są tylko pliki dokumentów w formacie PDF.");
				return;
			}

			// Using createObjectURL to reference local file dynamically
			const objectUrl = URL.createObjectURL(file);
			setSrc(objectUrl);
			if (onChangeSrc) {
				onChangeSrc(objectUrl);
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
				accept="application/pdf"
				style={{ display: "none" }}
			/>

			{!src ? (
				// Premium Upload Placeholder
				<div
					onClick={triggerFileInput}
					className="media-placeholder"
				>
					<svg
						width="36"
						height="36"
						viewBox="0 0 24 24"
						fill="none"
						stroke="#94a3b8"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
						style={{ marginBottom: "8px" }}
					>
						<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
						<polyline points="14 2 14 8 20 8" />
						<line x1="16" y1="13" x2="8" y2="13" />
						<line x1="16" y1="17" x2="8" y2="17" />
						<polyline points="10 9 9 9 8 9" />
					</svg>
					<span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>
						Wgraj dokument PDF
					</span>
					<span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
						Kliknij, aby wybrać plik PDF
					</span>
				</div>
			) : (
				// PDF Reader Rendering Area
				<div style={{ flex: 1, position: "relative", overflow: "hidden", backgroundColor: "#f1f5f9" }}>
					<iframe
						src={src}
						title="Podgląd PDF"
						style={{
							width: "100%",
							height: "100%",
							border: "none",
							backgroundColor: "#ffffff",
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
								display: "flex",
								gap: "6px",
							}}
						>
							<button
								onClick={(e) => {
									e.stopPropagation();
									triggerFileInput();
								}}
								style={controlButtonStyle}
								title="Zmień plik PDF"
								onMouseOver={(e) => {
									e.currentTarget.style.backgroundColor = "#0f172a";
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.backgroundColor = "rgba(15, 23, 42, 0.75)";
								}}
							>
								<svg
									width="13"
									height="13"
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

export default PdfBlock;
