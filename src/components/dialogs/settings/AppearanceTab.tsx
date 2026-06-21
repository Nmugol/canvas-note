import React from "react";
import { Box, Typography, FormControl, Select, MenuItem, RadioGroup, FormControlLabel, Radio, Switch, Divider } from "@mui/material";
import { AppSettings } from "../../../context/SettingsContext";
import { useTranslation } from "../../../utils/translations";

export const AppearanceTab: React.FC<{
	tempSettings: AppSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}> = ({ tempSettings, setTempSettings }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
					{t("appTheme")}
				</Typography>
				<RadioGroup
					row
					value={tempSettings.theme}
					onChange={(e) =>
						setTempSettings((prev) => ({
							...prev,
							theme: e.target.value as any,
						}))
					}
				>
					<FormControlLabel value="light" control={<Radio size="small" />} label={t("themeLight")} />
					<FormControlLabel value="dark" control={<Radio size="small" />} label={t("themeDark")} />
					<FormControlLabel value="system" control={<Radio size="small" />} label={t("themeSystem")} />
				</RadioGroup>
			</Box>

			<Divider />

			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
					Kolor wiodący
				</Typography>
				<Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
					{["#4f46e5", "#10b981", "#f43f5e", "#f59e0b", "#0ea5e9"].map(color => (
						<Box
							key={color}
							onClick={() => setTempSettings(prev => ({ ...prev, primaryColor: color }))}
							sx={{
								width: 32,
								height: 32,
								borderRadius: "50%",
								backgroundColor: color,
								cursor: "pointer",
								border: "2px solid #ffffff",
								boxShadow: tempSettings.primaryColor === color ? `0 0 0 2px ${color}` : "0 2px 4px rgba(0,0,0,0.1)",
							}}
						/>
					))}
					<Box sx={{ display: "flex", alignItems: "center", gap: 1, ml: 2 }}>
						<Typography variant="body2">Własny:</Typography>
						<input
							type="color"
							value={tempSettings.primaryColor || "#4f46e5"}
							onChange={(e) => setTempSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
							style={{
								width: 32,
								height: 32,
								padding: 0,
								border: "none",
								borderRadius: "4px",
								cursor: "pointer",
								backgroundColor: "transparent"
							}}
						/>
					</Box>
				</Box>
			</Box>

			<Divider />

			<Box>
				<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
					Czcionka w aplikacji
				</Typography>
				<FormControl size="small" fullWidth sx={{ maxWidth: "240px" }}>
					<Select
						value={tempSettings.fontFamily || "system-ui, -apple-system, sans-serif"}
						onChange={(e) => setTempSettings(prev => ({ ...prev, fontFamily: e.target.value as string }))}
					>
						<MenuItem value="system-ui, -apple-system, sans-serif">Domyślna systemowa</MenuItem>
						<MenuItem value="Arial, sans-serif">Arial</MenuItem>
						<MenuItem value="Verdana, sans-serif">Verdana</MenuItem>
						<MenuItem value="'Times New Roman', serif">Times New Roman</MenuItem>
						<MenuItem value="monospace">Monospace</MenuItem>
					</Select>
				</FormControl>
			</Box>

			<Divider />

			<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
				<FormControlLabel
					control={
						<Switch
							checked={tempSettings.showGrid}
							onChange={(e) =>
								setTempSettings((prev) => ({
									...prev,
									showGrid: e.target.checked,
								}))
							}
							size="small"
						/>
					}
					label={
						<Typography variant="body2" sx={{ fontWeight: 500 }}>
							{t("showGrid")}
						</Typography>
					}
				/>

				{tempSettings.showGrid && (
					<Box sx={{ pl: 4, mt: 1, display: "flex", alignItems: "center", gap: 2 }}>
						<Typography variant="body2">{t("gridStyle")}:</Typography>
						<FormControl size="small" sx={{ minWidth: "120px" }}>
							<Select
								value={tempSettings.gridStyle}
								onChange={(e) =>
									setTempSettings((prev) => ({
										...prev,
										gridStyle: e.target.value as any,
									}))
								}
							>
								<MenuItem value="dots">{t("gridDots")}</MenuItem>
								<MenuItem value="lines">{t("gridLines")}</MenuItem>
							</Select>
						</FormControl>
					</Box>
				)}
			</Box>

			<Divider />

			<Box>
				<FormControlLabel
					control={
						<Switch
							checked={tempSettings.showMinimap}
							onChange={(e) =>
								setTempSettings((prev) => ({
									...prev,
									showMinimap: e.target.checked,
								}))
							}
							size="small"
						/>
					}
					label={
						<Typography variant="body2" sx={{ fontWeight: 500 }}>
							{t("showMinimap")}
						</Typography>
					}
				/>
			</Box>
		</Box>
	);
};
