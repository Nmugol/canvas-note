import React, { useState } from "react";
import { Button, Typography, Tooltip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import DescriptionIcon from "@mui/icons-material/Description";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTranslation } from "../../utils/translations";
import { pluginRegistry } from "../../plugins";
import { useSettings } from "../../context/SettingsContext";
import "../../css/SidebarDock.css";

export interface NotebookItem {
	name: string;
	path: string;
	is_dir: boolean;
	children?: NotebookItem[] | null;
}

interface SidebarDockProps {
	isDockExpanded: boolean;
	onToggleDock: () => void;

	onSwitchNotebook?: () => void;
	onExportNotebook?: () => void;
	onOpenSettings: () => void;

	// Tree props
	notebookPath: string;
	notebookTree: NotebookItem[];
	activeCanvasPath: string | null;
	onSelectCanvas: (path: string) => void;
	onCreateFolder: (parentPath: string, name: string) => Promise<void>;
	onCreateCanvas: (parentPath: string, name: string) => Promise<void>;
	onRenameItem: (oldPath: string, newPath: string) => Promise<void>;
	onDeleteItem: (path: string) => Promise<void>;
	onMoveItem: (srcPath: string, destParentPath: string) => Promise<void>;
}

export const SidebarDock: React.FC<SidebarDockProps> = ({
	isDockExpanded,
	onToggleDock,

	onSwitchNotebook,
	notebookPath,
	notebookTree,
	activeCanvasPath,
	onSelectCanvas,
	onCreateFolder,
	onCreateCanvas,
	onRenameItem,
	onDeleteItem,
	onMoveItem,
	onOpenSettings,
}) => {
	const { t } = useTranslation();
	const { settings } = useSettings();
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";
	const primaryColor = theme.palette.primary.main;
	const primaryLight = alpha(primaryColor, 0.15);
	const hoverBg = isDark ? "#334155" : "#f1f5f9";
	const textColor = isDark ? "#cbd5e1" : "#334155";
	
	const [isLogoHovered, setIsLogoHovered] = useState(false);
	const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>(
		{},
	);
	const [cutPath, setCutPath] = useState<string | null>(null);
	const [hoveredPath, setHoveredPath] = useState<string | null>(null);

	const toggleFolder = (path: string) => {
		setExpandedPaths((prev) => ({
			...prev,
			[path]: !prev[path],
		}));
	};

	const canPasteInto = (targetFolder: string) => {
		if (!cutPath) return false;
		if (cutPath === targetFolder) return false;

		// Ensure target folder is not inside cut folder path to avoid loops
		const separator = cutPath.includes("\\") ? "\\" : "/";
		const prefix = cutPath.endsWith(separator) ? cutPath : cutPath + separator;
		if (targetFolder.startsWith(prefix)) return false;

		return true;
	};

	// Recursive tree rendering logic
	const renderTreeNodes = (nodes: NotebookItem[], depth = 0) => {
		return nodes.map((item) => {
			const isDir = item.is_dir;
			const isExpanded = expandedPaths[item.path] || false;
			const isSelected = activeCanvasPath === item.path;
			const isCut = cutPath === item.path;
			const isHovered = hoveredPath === item.path;

			const displayName = isDir ? item.name : item.name.replace(/\.json$/i, "");

			return (
				<div
					key={item.path}
					style={{ display: "flex", flexDirection: "column" }}
				>
					<div
						onMouseEnter={() => setHoveredPath(item.path)}
						onMouseLeave={() => setHoveredPath(null)}
						style={{
							display: "flex",
							alignItems: "center",
							padding: "4px 6px",
							paddingLeft: `${depth * 12 + 6}px`,
							borderRadius: "6px",
							cursor: "pointer",
							backgroundColor: isSelected
								? primaryLight
								: isHovered
									? hoverBg
									: "transparent",
							opacity: isCut ? 0.4 : 1,
							transition: "all 0.15s ease",
							color: isSelected ? primaryColor : textColor,
							height: "32px",
							minHeight: "32px",
							boxSizing: "border-box",
							userSelect: "none",
						}}
						onClick={() => {
							if (isDir) {
								toggleFolder(item.path);
							} else {
								onSelectCanvas(item.path);
							}
						}}
					>
						{/* Toggle Icon for Folder, Spacer for Canvas */}
						{isDir ? (
							<div
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: "16px",
									height: "16px",
									marginRight: "4px",
								}}
							>
								{isExpanded ? (
									<ExpandMoreIcon
										style={{ fontSize: "14px", color: "#64748b" }}
									/>
								) : (
									<KeyboardArrowRightIcon
										style={{ fontSize: "14px", color: "#64748b" }}
									/>
								)}
							</div>
						) : (
							<div style={{ width: "20px" }} />
						)}

						{/* Type Icon */}
						{isDir ? (
							isExpanded ? (
								<FolderOpenIcon
									style={{
										fontSize: "18px",
										color: primaryColor,
										marginRight: "6px",
									}}
								/>
							) : (
								<FolderIcon
									style={{
										fontSize: "18px",
										color: primaryColor,
										marginRight: "6px",
									}}
								/>
							)
						) : (
							<DescriptionIcon
								style={{
									fontSize: "18px",
									color: isSelected ? primaryColor : "#64748b",
									marginRight: "6px",
								}}
							/>
						)}

						{/* Display label */}
						<Typography
							variant="body2"
							style={{
								fontSize: "13px",
								fontWeight: isSelected ? 600 : 500,
								whiteSpace: "nowrap",
								overflow: "hidden",
								textOverflow: "ellipsis",
								flex: 1,
							}}
						>
							{displayName}
						</Typography>

						{/* Hover actions panel */}
						{isHovered && (
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "1px",
									backgroundColor: isSelected
										? primaryLight
										: isHovered
											? hoverBg
											: "transparent",
									paddingLeft: "4px",
									borderRadius: "4px",
								}}
								onClick={(e) => e.stopPropagation()}
							>
								{isDir && (
									<>
										<Tooltip title={t("sidebarNewCanvas")}>
											<Button
												size="small"
												onClick={() => {
													const name = prompt(t("promptNewCanvasName"));
													if (name && name.trim()) {
														onCreateCanvas(item.path, name.trim());
													}
												}}
												style={{
													minWidth: "auto",
													padding: "1px",
													color: "#64748b",
												}}
											>
												<NoteAddIcon style={{ fontSize: "14px" }} />
											</Button>
										</Tooltip>
										<Tooltip title={t("sidebarNewFolder")}>
											<Button
												size="small"
												onClick={() => {
													const name = prompt(t("promptNewFolderName"));
													if (name && name.trim()) {
														onCreateFolder(item.path, name.trim());
													}
												}}
												style={{
													minWidth: "auto",
													padding: "1px",
													color: "#64748b",
												}}
											>
												<CreateNewFolderIcon style={{ fontSize: "14px" }} />
											</Button>
										</Tooltip>
										{canPasteInto(item.path) && (
											<Tooltip title={t("ctxPasteHere")}>
												<Button
													size="small"
													onClick={() => {
														if (cutPath) {
															onMoveItem(cutPath, item.path);
															setCutPath(null);
														}
													}}
													style={{
														minWidth: "auto",
														padding: "1px",
														color: primaryColor,
													}}
												>
													<ContentPasteIcon style={{ fontSize: "14px" }} />
												</Button>
											</Tooltip>
										)}
									</>
								)}

								<Tooltip title={t("sidebarRename")}>
									<Button
										size="small"
										onClick={() => {
											const name = prompt(t("promptRename"), displayName);
											if (name && name.trim()) {
												const nameTrimmed = name.trim();
												const lastIndex = Math.max(
													item.path.lastIndexOf("/"),
													item.path.lastIndexOf("\\"),
												);
												const parentPath =
													lastIndex !== -1
														? item.path.substring(0, lastIndex + 1)
														: "";
												let newName = nameTrimmed;
												if (
													!isDir &&
													!newName.toLowerCase().endsWith(".json")
												) {
													newName += ".json";
												}
												onRenameItem(item.path, parentPath + newName);
											}
										}}
										style={{
											minWidth: "auto",
											padding: "1px",
											color: "#64748b",
										}}
									>
										<EditIcon style={{ fontSize: "14px" }} />
									</Button>
								</Tooltip>

								<Tooltip title={t("sidebarCut")}>
									<Button
										size="small"
										onClick={() => setCutPath(item.path)}
										style={{
											minWidth: "auto",
											padding: "1px",
											color: "#64748b",
										}}
									>
										<ContentCutIcon style={{ fontSize: "14px" }} />
									</Button>
								</Tooltip>

								<Tooltip title={t("sidebarDelete")}>
									<Button
										size="small"
										onClick={() => onDeleteItem(item.path)}
										style={{
											minWidth: "auto",
											padding: "1px",
											color: "#ef4444",
										}}
									>
										<DeleteIcon style={{ fontSize: "14px" }} />
									</Button>
								</Tooltip>
							</div>
						)}
					</div>

					{/* Nested folders/canvases */}
					{isDir && isExpanded && item.children && item.children.length > 0 && (
						<div style={{ display: "flex", flexDirection: "column" }}>
							{renderTreeNodes(item.children, depth + 1)}
						</div>
					)}
				</div>
			);
		});
	};

	return (
		<div className={`sidebar-dock ${isDockExpanded ? "expanded" : "collapsed"}`}>
			{/* Top and Middle Sections wrapper */}
			<div className="sidebar-top-wrapper">
				<div
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "center",
						justifyContent: "space-between",
						width: "100%",
						gap: "8px",
						flexShrink: 0,
					}}
				>
					<Tooltip title={t("tooltipSwitchNotebook")}>
						<div
							onClick={onSwitchNotebook}
							onMouseEnter={() => setIsLogoHovered(true)}
							onMouseLeave={() => setIsLogoHovered(false)}
							className={`sidebar-logo-header ${isLogoHovered ? "logo-hovered" : ""} expanded`}
							style={{ flex: 1 }}
						>
							<div className="sidebar-logo-header-inner">
								<div className="sidebar-logo-icon-box">
									{isLogoHovered ? (
										<FolderIcon style={{ fontSize: "18px" }} />
									) : (
										"C"
									)}
								</div>
								<div className="sidebar-logo-text-box">
									<Typography variant="subtitle2" className="sidebar-logo-title">
										Canvas Note
									</Typography>
									<Typography variant="caption" className="sidebar-logo-subtitle">
										{isLogoHovered ? t("tooltipLogoChangeDir") : t("tooltipLogoSubtitle")}
									</Typography>
								</div>
							</div>
						</div>
					</Tooltip>


				</div>
			</div>

			<div className="sidebar-tree-section">
				<div className="sidebar-tree-header">
					<Typography variant="caption" className="sidebar-tree-header-title">
						{t("sidebarCanvasesSection")}
					</Typography>
					<div className="sidebar-tree-header-actions">
						<Tooltip title={t("tooltipNewCanvasRoot")}>
							<Button
								onClick={() => {
									const name = prompt(t("promptNewCanvasName"));
									if (name && name.trim()) {
										onCreateCanvas(notebookPath, name.trim());
									}
								}}
								className="sidebar-tree-header-btn"
							>
								<NoteAddIcon style={{ fontSize: "16px" }} />
							</Button>
						</Tooltip>
						<Tooltip title={t("tooltipNewFolderRoot")}>
							<Button
								onClick={() => {
									const name = prompt(t("promptNewFolderName"));
									if (name && name.trim()) {
										onCreateFolder(notebookPath, name.trim());
									}
								}}
								className="sidebar-tree-header-btn"
							>
								<CreateNewFolderIcon style={{ fontSize: "16px" }} />
							</Button>
						</Tooltip>
						{cutPath && (
							<>
								<Tooltip title={t("tooltipPasteRoot")}>
									<Button
										onClick={() => {
											onMoveItem(cutPath, notebookPath);
											setCutPath(null);
										}}
										className="sidebar-tree-header-btn paste-btn"
									>
										<ContentPasteIcon style={{ fontSize: "16px" }} />
									</Button>
								</Tooltip>
								<Tooltip title={t("tooltipCancelMove")}>
									<Button
										onClick={() => setCutPath(null)}
										className="sidebar-tree-header-btn cancel-btn"
									>
										<span style={{ fontSize: "12px", fontWeight: "bold" }}>
											X
										</span>
									</Button>
								</Tooltip>
							</>
						)}
					</div>
				</div>

				<div className="sidebar-tree-scroll-container">
					{notebookTree.length === 0 ? (
						<Typography variant="caption" className="sidebar-tree-empty-text">
							{t("sidebarEmptyText")}
						</Typography>
					) : (
						renderTreeNodes(notebookTree)
					)}
				</div>
			</div>

			<div style={{ marginTop: "auto", borderTop: "1px solid rgba(0,0,0,0.06)", padding: "10px 0", display: "flex", justifyContent: "center", width: "100%", flexShrink: 0 }}>
				<Tooltip title={t("settings")} placement="right">
					<Button
						variant="text"
						onClick={onOpenSettings}
						sx={{
							minWidth: "calc(100% - 16px)",
							width: "calc(100% - 16px)",
							height: "40px",
							display: "flex",
							justifyContent: "flex-start",
							alignItems: "center",
							gap: "12px",
							px: 2,
							color: "#64748b",
							textTransform: "none",
							"&:hover": {
								backgroundColor: "#f1f5f9",
							},
						}}
					>
						<SettingsIcon style={{ fontSize: "20px" }} />
						<Typography variant="body2" sx={{ fontWeight: 600, fontSize: "14px" }}>
							{t("settings")}
						</Typography>
					</Button>
				</Tooltip>
			</div>

			<Tooltip title={isDockExpanded ? t("tooltipCollapseSidebar") : t("tooltipExpandSidebar")} placement="right">
				<div className="sidebar-toggle-tab" onClick={onToggleDock}>
					{isDockExpanded ? (
						<ChevronLeftIcon style={{ fontSize: "24px", color: "#64748b" }} />
					) : (
						<ChevronRightIcon style={{ fontSize: "24px", color: "#64748b" }} />
					)}
				</div>
			</Tooltip>
		</div>
	);
};

export default SidebarDock;
