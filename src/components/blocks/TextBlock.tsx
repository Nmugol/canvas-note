import React, { useState, useRef, useEffect } from "react";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

interface TextBlockProps {
	id?: string;
	initialContent?: string;
	onChangeContent?: (content: string) => void;
}

export function renderMarkdown(markdown: string): string {
	if (!markdown.trim()) {
		return "<p style='color: #94a3b8; font-style: italic; margin: 0;'>Dwuklik lub ikona ołówka, aby pisać w formacie Markdown...</p>";
	}

	// Escape HTML to prevent injection issues on canvas
	let html = markdown
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");

	// Code blocks (```code```)
	html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
		return `<pre style="background-color: #f8fafc; padding: 8px 12px; border-radius: 6px; font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; font-size: 13px; overflow-x: auto; border: 1px solid #e2e8f0; margin: 6px 0; white-space: pre-wrap; word-break: break-all;"><code>${code.trim()}</code></pre>`;
	});

	// Inline code (`code`)
	html = html.replace(/`([^`\n]+)`/g, "<code style='background-color: #f1f5f9; padding: 2px 4px; border-radius: 4px; font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; font-size: 13px; border: 1px solid #e2e8f0; color: #4f46e5; word-break: break-all;'>$1</code>");

	// Headers (#, ##, ###)
	html = html.replace(/^### (.*$)/gim, "<h3 style='font-size: 14px; font-weight: 600; margin: 8px 0 4px 0; color: #334155;'>$1</h3>");
	html = html.replace(/^## (.*$)/gim, "<h2 style='font-size: 16px; font-weight: 600; margin: 12px 0 6px 0; color: #1e293b; border-bottom: 1px solid #f1f5f9; padding-bottom: 2px;'>$1</h2>");
	html = html.replace(/^# (.*$)/gim, "<h1 style='font-size: 18px; font-weight: 700; margin: 14px 0 8px 0; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;'>$1</h1>");

	// Checkboxes (- [ ] and - [x])
	html = html.replace(/^\s*-\s*\[\s*\]\s+(.*$)/gim, "<div style='display: flex; align-items: center; gap: 8px; margin: 3px 0;'><input type='checkbox' disabled style='accent-color: #6366f1; width: 14px; height: 14px; margin: 0; cursor: default;' /> <span style='font-size: 14px; color: #334155;'>$1</span></div>");
	html = html.replace(/^\s*-\s*\[x\]\s+(.*$)/gim, "<div style='display: flex; align-items: center; gap: 8px; margin: 3px 0;'><input type='checkbox' checked disabled style='accent-color: #6366f1; width: 14px; height: 14px; margin: 0; cursor: default;' /> <span style='font-size: 14px; text-decoration: line-through; color: #94a3b8;'>$1</span></div>");

	// Bullet lists (- item or * item)
	html = html.replace(/^\s*[-*]\s+(.*$)/gim, "<div style='display: flex; align-items: flex-start; gap: 6px; margin: 3px 0;'><span style='color: #6366f1; font-weight: bold; line-height: 1.4; user-select: none;'>•</span><span style='font-size: 14px; color: #334155;'>$1</span></div>");

	// Bold (**text**)
	html = html.replace(/\*\*([^*]+)\*\*/g, "<strong style='font-weight: 700; color: #0f172a;'>$1</strong>");

	// Italic (*text*)
	html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");

	// Links ([text](url))
	html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer' style='color: #4f46e5; text-decoration: underline; font-weight: 500;'>$1</a>");

	// Standard lines mapping
	const lines = html.split("\n");
	const processedLines = lines.map(line => {
		if (line.trim() === "") return "<div style='height: 0.4em;'></div>";
		if (/^<(h1|h2|h3|ul|li|pre|code|div)/.test(line.trim())) {
			return line;
		}
		return `<p style='margin: 3px 0; color: #334155; font-size: 14px; line-height: 1.5; min-height: 1em;'>${line}</p>`;
	});

	return processedLines.join("\n");
}

export const TextBlock: React.FC<TextBlockProps> = ({
	initialContent = "",
	onChangeContent,
}) => {
	const [content, setContent] = useState(initialContent);
	const [isEditing, setIsEditing] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	useEffect(() => {
		if (isEditing && textareaRef.current) {
			textareaRef.current.focus();
			// Move cursor to the end
			const len = textareaRef.current.value.length;
			textareaRef.current.setSelectionRange(len, len);
		}
	}, [isEditing]);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const val = e.target.value;
		setContent(val);
		if (onChangeContent) {
			onChangeContent(val);
		}
	};

	const handleBlur = () => {
		setIsEditing(false);
	};

	return (
		<div
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onDoubleClick={() => setIsEditing(true)}
			style={{
				width: "100%",
				height: "100%",
				padding: "12px",
				boxSizing: "border-box",
				display: "flex",
				flexDirection: "column",
				fontFamily: "Inter, system-ui, sans-serif",
				position: "relative",
			}}
		>
			{/* Edit/Preview Action Button Overlay */}
			{isHovered && (
				<div style={{ position: "absolute", top: "8px", right: "8px", zIndex: 10 }}>
					{isEditing ? (
						<Tooltip title="Pokaż podgląd (Zapisz)">
							<IconButton
								size="small"
								onClick={() => setIsEditing(false)}
								onMouseDown={(e) => e.preventDefault()} // Avoid blur click race
								sx={{
									backgroundColor: "rgba(255, 255, 255, 0.9)",
									boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
									border: "1px solid #e2e8f0",
									color: "#10b981",
									"&:hover": {
										backgroundColor: "#f0fdf4",
										borderColor: "#86efac",
									}
								}}
							>
								<CheckIcon fontSize="inherit" style={{ fontSize: "14px" }} />
							</IconButton>
						</Tooltip>
					) : (
						<Tooltip title="Edytuj Markdown">
							<IconButton
								size="small"
								onClick={() => setIsEditing(true)}
								sx={{
									backgroundColor: "rgba(255, 255, 255, 0.9)",
									boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
									border: "1px solid #e2e8f0",
									color: "#4f46e5",
									"&:hover": {
										backgroundColor: "#f5f3ff",
										borderColor: "#c084fc",
									}
								}}
							>
								<EditIcon fontSize="inherit" style={{ fontSize: "14px" }} />
							</IconButton>
						</Tooltip>
					)}
				</div>
			)}

			{isEditing ? (
				<textarea
					ref={textareaRef}
					value={content}
					onChange={handleChange}
					onBlur={handleBlur}
					style={{
						width: "100%",
						height: "100%",
						resize: "none",
						border: "none",
						outline: "none",
						fontFamily: "inherit",
						fontSize: "14px",
						lineHeight: "1.5",
						color: "#1f2937",
						backgroundColor: "transparent",
					}}
					placeholder="Wpisz markdown (np. # Tytuł, **pogrubienie**, - zadanie)..."
				/>
			) : (
				<div
					style={{
						width: "100%",
						height: "100%",
						overflowY: "auto",
						paddingRight: "6px",
					}}
					dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
				/>
			)}
		</div>
	);
};

export default TextBlock;
