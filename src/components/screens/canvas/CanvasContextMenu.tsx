import { Paper, MenuList, MenuItem, ListItemIcon, ListItemText, Typography, Divider } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import DeleteIcon from "@mui/icons-material/Delete";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import { pluginRegistry } from "../../../plugins";
import { useSettings } from "../../../context/SettingsContext";
import { useTranslation } from "../../../utils/translations";

interface CanvasContextMenuProps {
	contextMenu: {
		x: number;
		y: number;
		logicalX?: number;
		logicalY?: number;
		blockId: string;
	};
	clipboard: any;
	linkingSourceId: string | null;
	links: { from: string; to: string }[];
	onCopy: (blockId: string) => void;
	onCut: (blockId: string) => void;
	onPaste: (x?: number, y?: number) => void;
	onStartLink: (blockId: string) => void;
	onCancelLink: () => void;
	onConnect: (targetId: string) => void;
	onRemoveAllLinks: (blockId: string) => void;
	onDelete: (blockId: string) => void;
	onAddBlock: (type: string, x?: number, y?: number) => void;
}

export function CanvasContextMenu({
	contextMenu,
	clipboard,
	linkingSourceId,
	links,
	onCopy,
	onCut,
	onPaste,
	onStartLink,
	onCancelLink,
	onConnect,
	onRemoveAllLinks,
	onDelete,
	onAddBlock,
}: CanvasContextMenuProps) {
	const { t } = useTranslation();
	const { settings } = useSettings();
	const logicalX = contextMenu.logicalX;
	const logicalY = contextMenu.logicalY;

	return (
		<Paper
			id="context-menu"
			elevation={8}
			className="canvas-context-menu"
			style={{
				position: "fixed",
				top: `${contextMenu.y}px`,
				left: `${contextMenu.x}px`,
				zIndex: 1000,
			}}
			onContextMenu={(e) => e.preventDefault()}
		>
			<MenuList dense style={{ padding: "4px 0" }}>
				{contextMenu.blockId ? (
					<>
						<MenuItem
							onClick={() => onCopy(contextMenu.blockId)}
						>
							<ListItemIcon>
								<ContentCopyIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText>{t("ctxCopy")}</ListItemText>
							<Typography variant="body2" color="text.secondary">
								Ctrl+C
							</Typography>
						</MenuItem>

						<MenuItem
							onClick={() => onCut(contextMenu.blockId)}
						>
							<ListItemIcon>
								<ContentCutIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText>{t("ctxCut")}</ListItemText>
							<Typography variant="body2" color="text.secondary">
								Ctrl+X
							</Typography>
						</MenuItem>

						<MenuItem
							disabled={!clipboard}
							onClick={() => onPaste()}
						>
							<ListItemIcon>
								<ContentPasteIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText>{t("ctxPaste")}</ListItemText>
							<Typography variant="body2" color="text.secondary">
								Ctrl+V
							</Typography>
						</MenuItem>

						<Divider sx={{ my: 0.5 }} />

						{/* Block connections menu options */}
						{!linkingSourceId ? (
							<MenuItem
								onClick={() => onStartLink(contextMenu.blockId)}
							>
								<ListItemIcon>
									<LinkIcon fontSize="small" />
								</ListItemIcon>
								<ListItemText>{t("ctxConnect")}</ListItemText>
							</MenuItem>
						) : (
							<>
								{linkingSourceId === contextMenu.blockId ? (
									<MenuItem
										onClick={onCancelLink}
									>
										<ListItemIcon>
											<LinkOffIcon fontSize="small" />
										</ListItemIcon>
										<ListItemText>{t("ctxCancelConnect")}</ListItemText>
									</MenuItem>
								) : (
									<MenuItem
										onClick={() => onConnect(contextMenu.blockId)}
									>
										<ListItemIcon>
											<LinkIcon fontSize="small" />
										</ListItemIcon>
										<ListItemText>{t("ctxConnectHere")}</ListItemText>
									</MenuItem>
								)}
							</>
						)}

						{links.some(
							(link) =>
								link.from === contextMenu.blockId ||
								link.to === contextMenu.blockId
						) && (
							<MenuItem
								onClick={() => onRemoveAllLinks(contextMenu.blockId)}
								sx={{ color: "warning.main" }}
							>
								<ListItemIcon sx={{ color: "warning.main" }}>
									<LinkOffIcon fontSize="small" />
								</ListItemIcon>
								<ListItemText>{t("ctxRemoveLinks")}</ListItemText>
							</MenuItem>
						)}

						<Divider sx={{ my: 0.5 }} />

						<MenuItem
							onClick={() => onDelete(contextMenu.blockId)}
							sx={{ color: "error.main" }}
						>
							<ListItemIcon sx={{ color: "error.main" }}>
								<DeleteIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText>{t("ctxDelete")}</ListItemText>
							<Typography variant="body2" color="error.main" sx={{ opacity: 0.8 }}>
								Del
							</Typography>
						</MenuItem>
					</>
				) : (
					<>
						<MenuItem
							disabled={!clipboard}
							onClick={() => onPaste(logicalX, logicalY)}
						>
							<ListItemIcon>
								<ContentPasteIcon fontSize="small" />
							</ListItemIcon>
							<ListItemText>{t("ctxPasteHere")}</ListItemText>
							<Typography variant="body2" color="text.secondary">
								Ctrl+V
							</Typography>
						</MenuItem>

						<Divider sx={{ my: 0.5 }} />

						{pluginRegistry.getAll()
							.filter((plugin) => !settings.disabledPlugins?.includes(plugin.id))
							.map((plugin) => (
								<MenuItem
									key={plugin.id}
									onClick={() => onAddBlock(plugin.id, logicalX, logicalY)}
								>
									<ListItemIcon>
										<plugin.icon fontSize="small" />
									</ListItemIcon>
									<ListItemText>{t(plugin.nameKey as any)}</ListItemText>
								</MenuItem>
							))}
					</>
				)}
			</MenuList>
		</Paper>
	);
}

export default CanvasContextMenu;
