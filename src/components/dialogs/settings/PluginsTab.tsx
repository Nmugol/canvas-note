import React from "react";
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
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
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
