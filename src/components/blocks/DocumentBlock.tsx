import React, { useState, useRef } from "react";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import { Typography, IconButton, Box } from "@mui/material";

interface DocumentBlockProps {
	initialSrc?: string;
	initialCaption?: string;
	initialFileName?: string;
	initialFileSize?: string;
	onChangeSrc?: (src: string) => void;
	onChangeCaption?: (caption: string) => void;
	onChangeMetadata?: (fileName: string, fileSize: string) => void;
}

export const DocumentBlock: React.FC<DocumentBlockProps> = ({
	initialSrc = "",
	initialCaption = "",
	initialFileName = "",
	initialFileSize = "",
	onChangeSrc,
	onChangeCaption,
	onChangeMetadata,
}) => {
	const [src, setSrc] = useState(initialSrc);
	const [caption, setCaption] = useState(initialCaption);
	const [fileName, setFileName] = useState(initialFileName);
	const [fileSize, setFileSize] = useState(initialFileSize);
	const [isHovered, setIsHovered] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const sizes = ["Bytes", "KB", "MB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const allowedExtensions = [".doc", ".docx"];
			const isWordFile = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
			const allowedTypes = [
				"application/msword",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
			];

			if (!isWordFile && !allowedTypes.includes(file.type)) {
				alert("Błąd: Obsługiwane są tylko pliki dokumentów tekstowych Word (.doc, .docx).");
				return;
			}

			const objectUrl = URL.createObjectURL(file);
			const formattedSize = formatFileSize(file.size);

			setSrc(objectUrl);
			setFileName(file.name);
			setFileSize(formattedSize);

			if (onChangeSrc) {
				onChangeSrc(objectUrl);
			}
			if (onChangeMetadata) {
				onChangeMetadata(file.name, formattedSize);
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
				accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
				style={{ display: "none" }}
			/>

			{!src ? (
				// Premium Upload Placeholder
				<div
					onClick={triggerFileInput}
					style={{
						flex: 1,
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						justifyContent: "center",
						border: "2px dashed #cbd5e1",
						borderRadius: "8px",
						margin: "12px",
						cursor: "pointer",
						transition: "all 0.2s ease",
						backgroundColor: "#ffffff",
					}}
					onMouseOver={(e) => {
						e.currentTarget.style.borderColor = "#185abd"; // Word Blue
						e.currentTarget.style.backgroundColor = "#eff6ff";
					}}
					onMouseOut={(e) => {
						e.currentTarget.style.borderColor = "#cbd5e1";
						e.currentTarget.style.backgroundColor = "#ffffff";
					}}
				>
					<DescriptionIcon
						style={{
							fontSize: "36px",
							color: "#94a3b8",
							marginBottom: "8px"
						}}
					/>
					<span style={{ fontSize: "13px", fontWeight: "500", color: "#64748b" }}>
						Wgraj dokument Word
					</span>
					<span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
						Kliknij, aby wybrać plik .doc lub .docx
					</span>
				</div>
			) : (
				// Word File Attachment Card View
				<div
					style={{
						flex: 1,
						display: "flex",
						alignItems: "center",
						padding: "16px 12px",
						position: "relative",
						backgroundColor: "#ffffff",
						borderRadius: "8px",
						margin: "12px 12px 6px 12px",
						border: "1px solid #e2e8f0",
						boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
					}}
				>
					{/* Word Icon */}
					<Box
						style={{
							width: "42px",
							height: "42px",
							borderRadius: "8px",
							backgroundColor: "#eff6ff",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							marginRight: "12px",
							flexShrink: 0,
						}}
					>
						<DescriptionIcon style={{ color: "#185abd", fontSize: "24px" }} />
					</Box>

					{/* File Info */}
					<div style={{ flex: 1, minWidth: 0 }}>
						<Typography
							variant="body2"
							style={{
								fontWeight: 600,
								color: "#1e293b",
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
								fontSize: "13px",
							}}
							title={fileName}
						>
							{fileName}
						</Typography>
						<Typography
							variant="caption"
							style={{ color: "#64748b", display: "block", marginTop: "2px" }}
						>
							{fileSize} • Dokument Word
						</Typography>
					</div>

					{/* Actions */}
					<Box style={{ display: "flex", gap: "4px", flexShrink: 0, marginLeft: "8px" }}>
						<IconButton
							component="a"
							href={src}
							download={fileName}
							size="small"
							style={{ color: "#475569" }}
							title="Pobierz dokument"
						>
							<DownloadIcon fontSize="small" />
						</IconButton>
					</Box>

					{/* Hover Overlay Edit Control */}
					{isHovered && (
						<div
							style={{
								position: "absolute",
								top: "-6px",
								right: "-6px",
								zIndex: 10,
							}}
						>
							<IconButton
								onClick={(e) => {
									e.stopPropagation();
									triggerFileInput();
								}}
								size="small"
								style={{
									backgroundColor: "#185abd",
									color: "#ffffff",
									boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
								}}
								onMouseOver={(e) => {
									e.currentTarget.style.backgroundColor = "#114f9a";
								}}
								onMouseOut={(e) => {
									e.currentTarget.style.backgroundColor = "#185abd";
								}}
								title="Zmień dokument"
							>
								<EditIcon style={{ fontSize: "14px" }} />
							</IconButton>
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
						marginTop: "auto",
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

export default DocumentBlock;
