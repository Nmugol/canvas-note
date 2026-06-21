import React from "react";
import { Button, Tooltip, Typography } from "@mui/material";
import { pluginRegistry } from "../../plugins";
import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "../../utils/translations";
import "../../css/TopBar.css";

interface TopBarProps {
	onAddBlock: (type: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onAddBlock }) => {
	const { settings } = useSettings();
	const { t } = useTranslation();

	const activePlugins = pluginRegistry
		.getAll()
		.filter((plugin) => !settings.disabledPlugins?.includes(plugin.id));

	if (activePlugins.length === 0) return null;

	return (
		<div className="top-bar-container">
			<div className="top-bar-buttons">
				{activePlugins.map((plugin) => (
					<Tooltip
						key={plugin.id}
						title={t(plugin.nameKey as any)}
						placement="bottom"
					>
						<Button
							variant="outlined"
							onClick={() => onAddBlock(plugin.id)}
							className="top-bar-btn"
						>
							<plugin.icon style={{ fontSize: "20px" }} />
						</Button>
					</Tooltip>
				))}
			</div>
		</div>
	);
};

export default TopBar;
