import { Button, Paper, Typography } from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { useTranslation } from "../../../utils/translations";

interface CanvasEmptyStateProps {
	notebookPath: string;
	onCreateCanvas: (parentPath: string, name: string) => Promise<void>;
}

export function CanvasEmptyState({
	notebookPath,
	onCreateCanvas,
}: CanvasEmptyStateProps) {
	const { t } = useTranslation();

	return (
		<div className="canvas-empty-state">
			<Paper elevation={0} className="canvas-empty-paper">
				<div className="canvas-empty-icon-wrapper">
					<DescriptionIcon />
				</div>
				<Typography variant="h6" style={{ fontWeight: 700, color: "#0f172a" }}>
					{t("noActiveCanvas")}
				</Typography>
				<Typography variant="body2" style={{ color: "#64748b", lineHeight: "1.5" }}>
					{t("noActiveCanvasDesc")}
				</Typography>
				<Button
					variant="contained"
					onClick={() => {
						const name = prompt(t("promptNewCanvasName"));
						if (name && name.trim()) {
							onCreateCanvas(notebookPath, name.trim());
						}
					}}
					sx={{
						backgroundColor: "#4f46e5",
						color: "#ffffff",
						textTransform: "none",
						fontWeight: 600,
						borderRadius: "8px",
						padding: "8px 16px",
						boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)",
						"&:hover": {
							backgroundColor: "#4338ca",
						},
					}}
				>
					{t("createNewCanvasBtn")}
				</Button>
			</Paper>
		</div>
	);
}

export default CanvasEmptyState;
