import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTranslation } from "../../../utils/translations";

export const DataTab: React.FC<{
	onClearRecents?: () => void;
}> = ({ onClearRecents }) => {
	const { t } = useTranslation();

	const handleClearRecentsClick = () => {
		if (confirm(t("clearRecents") + "?")) {
			localStorage.removeItem("canvas_recent_notebooks");
			if (onClearRecents) {
				onClearRecents();
			}
			alert(t("clearBtn") + "!");
		}
	};

	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
					{t("projectHistory")}
				</Typography>
				<Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
					{t("clearRecents")}
				</Typography>
				<Button
					variant="outlined"
					color="error"
					size="small"
					onClick={handleClearRecentsClick}
				>
					{t("clearBtn")}
				</Button>
			</Box>
		</Box>
	);
};
