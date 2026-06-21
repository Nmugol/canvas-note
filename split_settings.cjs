const fs = require('fs');

const generalTab = `import React from "react";
import { Box, Typography, FormControl, Select, MenuItem } from "@mui/material";
import { AppSettings } from "../../../context/SettingsContext";
import { useTranslation } from "../../../utils/translations";

export const GeneralTab: React.FC<{
	tempSettings: AppSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}> = ({ tempSettings, setTempSettings }) => {
	const { t } = useTranslation();
	return (
		<Box>
			<Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
				{t("appLanguage")}
			</Typography>
			<Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
				{t("languageDesc")}
			</Typography>
			<FormControl size="small" fullWidth sx={{ maxWidth: "240px" }}>
				<Select
					value={tempSettings.language}
					onChange={(e) =>
						setTempSettings((prev) => ({
							...prev,
							language: e.target.value as any,
						}))
					}
				>
					<MenuItem value="pl">{t("polish")}</MenuItem>
					<MenuItem value="en">{t("english")}</MenuItem>
					<MenuItem value="de">{t("german")}</MenuItem>
					<MenuItem value="es">{t("spanish")}</MenuItem>
					<MenuItem value="fr">{t("french")}</MenuItem>
				</Select>
			</FormControl>
		</Box>
	);
};
`;

const appearanceTab = `import React from "react";
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
								boxShadow: tempSettings.primaryColor === color ? \`0 0 0 2px \${color}\` : "0 2px 4px rgba(0,0,0,0.1)",
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
`;

const editorTab = `import React from "react";
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
`;

const hotkeysTab = `import React from "react";
import { List, ListItem, ListItemText, Typography, Divider } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useTranslation } from "../../../utils/translations";

export const HotkeysTab: React.FC = () => {
	const { t } = useTranslation();
	return (
		<List dense sx={{ py: 0 }}>
			{[
				{ title: t("hkPanTitle"), desc: t("hkPanDesc") },
				{ title: t("hkZoomTitle"), desc: t("hkZoomDesc") },
				{ title: t("hkZoomResetTitle"), desc: t("hkZoomResetDesc") },
				{ title: t("hkCopyTitle"), desc: t("hkCopyDesc") },
				{ title: t("hkCutTitle"), desc: t("hkCutDesc") },
				{ title: t("hkPasteTitle"), desc: t("hkPasteDesc") },
				{ title: t("hkDeleteTitle"), desc: t("hkDeleteDesc") },
			].map((item, idx) => (
				<React.Fragment key={idx}>
					<ListItem sx={{ py: 1, px: 0.5 }}>
						<KeyboardArrowRightIcon sx={{ color: "primary.main", mr: 1, fontSize: "18px" }} />
						<ListItemText
							primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.title}</Typography>}
							secondary={<Typography variant="caption" color="text.secondary">{item.desc}</Typography>}
						/>
					</ListItem>
					{idx < 6 && <Divider />}
				</React.Fragment>
			))}
		</List>
	);
};
`;

const dataTab = `import React from "react";
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
`;

const pluginsTab = `import React from "react";
import { Box, Typography, Button, List, ListItem, Switch } from "@mui/material";
import ExtensionIcon from "@mui/icons-material/Extension";
import { AppSettings } from "../../../context/SettingsContext";
import { useTranslation } from "../../../utils/translations";
import { pluginRegistry } from "../../../plugins";
import { openPluginsDir } from "../../../utils/ExternalPluginLoader";

export const PluginsTab: React.FC<{
	tempSettings: AppSettings;
	setTempSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}> = ({ tempSettings, setTempSettings }) => {
	const { t } = useTranslation();
	return (
		<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
				<Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
					{t("pluginsDesc")} Zewnętrzne wtyczki ładują się z globalnego folderu przy starcie.
				</Typography>
				<Button 
					variant="outlined" 
					size="small" 
					startIcon={<ExtensionIcon />}
					onClick={() => openPluginsDir().catch(console.error)}
				>
					Otwórz folder wtyczek
				</Button>
			</Box>
			<List dense sx={{ width: "100%", bgcolor: "background.paper", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.06)", p: 0 }}>
				{pluginRegistry.getAll().map((plugin) => {
					const isEnabled = !tempSettings.disabledPlugins?.includes(plugin.id);
					const PluginIcon = plugin.icon;
					return (
						<ListItem
							key={plugin.id}
							sx={{
								py: 1.5,
								px: 2,
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								"&:not(:last-child)": {
									borderBottom: "1px solid rgba(0,0,0,0.06)"
								}
							}}
						>
							<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
								<Box sx={{
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									width: "36px",
									height: "36px",
									borderRadius: "8px",
									bgcolor: "rgba(99, 102, 241, 0.08)",
									color: "#6366f1"
								}}>
									<PluginIcon style={{ fontSize: "20px" }} />
								</Box>
								<Box sx={{ display: "flex", flexDirection: "column" }}>
									<Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
										{t(plugin.nameKey as any)}
									</Typography>
									<Typography variant="caption" color="text.secondary" sx={{ fontSize: "11px" }}>
										ID: {plugin.id}
									</Typography>
								</Box>
							</Box>
							<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
								<Typography variant="caption" color={isEnabled ? "success.main" : "text.disabled"} sx={{ fontWeight: 600 }}>
									{isEnabled ? t("pluginStatusEnabled") : t("pluginStatusDisabled")}
								</Typography>
								<Switch
									checked={isEnabled}
									disabled={plugin.id === "text"} // Text plugin is required/core
									onChange={(e) => {
										const checked = e.target.checked;
										setTempSettings((prev) => {
											const disabledList = prev.disabledPlugins || [];
											const updatedList = checked
												? disabledList.filter((id) => id !== plugin.id)
												: [...disabledList, plugin.id];
											return {
												...prev,
												disabledPlugins: updatedList,
											};
										});
									}}
									size="small"
								/>
							</Box>
						</ListItem>
					);
				})}
			</List>
		</Box>
	);
};
`;

fs.writeFileSync('src/components/dialogs/settings/GeneralTab.tsx', generalTab);
fs.writeFileSync('src/components/dialogs/settings/AppearanceTab.tsx', appearanceTab);
fs.writeFileSync('src/components/dialogs/settings/EditorTab.tsx', editorTab);
fs.writeFileSync('src/components/dialogs/settings/HotkeysTab.tsx', hotkeysTab);
fs.writeFileSync('src/components/dialogs/settings/DataTab.tsx', dataTab);
fs.writeFileSync('src/components/dialogs/settings/PluginsTab.tsx', pluginsTab);

