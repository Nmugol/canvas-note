import React from "react";
import { Box, Typography, Slider, Divider, TextField } from "@mui/material";
import { AppSettings } from "../../../context/SettingsContext";
import { useTranslation } from "../../../utils/translations";

export const EditorTab: React.FC<{
	tempSettings: AppSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}> = ({ tempSettings, setTempSettings }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
					{t("autosaveDelay")}
				</Typography>
				<Box sx={{ display: "flex", alignItems: "center", gap: 3, px: 1 }}>
					<Slider
						value={tempSettings.autosaveDelay}
						min={200}
						max={3000}
						step={100}
						onChange={(_e, val) =>
							setTempSettings((prev) => ({
								...prev,
								autosaveDelay: val as number,
							}))
						}
						valueLabelDisplay="auto"
						sx={{ flexGrow: 1 }}
					/>
					<Typography variant="body2" sx={{ fontWeight: 600, minWidth: "50px", textAlign: "right" }}>
						{tempSettings.autosaveDelay} ms
					</Typography>
				</Box>
			</Box>

			<Divider />

			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
					{t("defaultCanvasName")}
				</Typography>
				<TextField
					size="small"
					fullWidth
					sx={{ maxWidth: "320px" }}
					value={tempSettings.defaultCanvasName}
					onChange={(e) =>
						setTempSettings((prev) => ({
							...prev,
							defaultCanvasName: e.target.value,
						}))
					}
					placeholder="np. plansza.json"
				/>
			</Box>
		</Box>
	);
};
