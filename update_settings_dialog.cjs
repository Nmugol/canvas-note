const fs = require('fs');

const settingsDialog = `import React, { useState } from "react";
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Tabs,
	Tab,
	Box,
	Divider,
} from "@mui/material";
import { useSettings, AppSettings } from "../../context/SettingsContext";
import { useTranslation } from "../../utils/translations";

import { GeneralTab } from "./settings/GeneralTab";
import { AppearanceTab } from "./settings/AppearanceTab";
import { EditorTab } from "./settings/EditorTab";
import { HotkeysTab } from "./settings/HotkeysTab";
import { DataTab } from "./settings/DataTab";
import { PluginsTab } from "./settings/PluginsTab";

interface SettingsDialogProps {
	open: boolean;
	onClose: () => void;
	onClearRecents?: () => void;
	notebookPath?: string | null;
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={\`settings-tabpanel-\${index}\`}
			aria-labelledby={\`settings-tab-\${index}\`}
			style={{ height: "400px", overflowY: "auto", padding: "16px 8px" }}
			{...other}
		>
			{value === index && <Box>{children}</Box>}
		</div>
	);
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
	open,
	onClose,
	onClearRecents,
}) => {
	const { settings, updateSettings } = useSettings();
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState(0);

	// Temp state
	const [tempSettings, setTempSettings] = useState<AppSettings>({ ...settings });

	// Reset state on open
	React.useEffect(() => {
		if (open) {
			setTempSettings({ ...settings });
		}
	}, [open, settings]);

	const handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
		setActiveTab(newValue);
	};

	const handleSave = () => {
		updateSettings(tempSettings);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
			slotProps={{
				paper: {
					sx: {
						borderRadius: "16px",
						height: "530px",
					},
				},
			}}
		>
			<DialogTitle sx={{ fontWeight: 700, pb: 1 }}>{t("settings")}</DialogTitle>
			<Divider />
			<DialogContent sx={{ display: "flex", p: 0, height: "400px" }}>
				<Tabs
					orientation="vertical"
					value={activeTab}
					onChange={handleChangeTab}
					sx={{
						borderRight: 1,
						borderColor: "divider",
						minWidth: "150px",
						".MuiTab-root": {
							alignItems: "flex-start",
							textTransform: "none",
							fontWeight: 600,
							fontSize: "14px",
							py: 1.5,
						},
					}}
				>
					<Tab label={t("general")} />
					<Tab label={t("appearance")} />
					<Tab label={t("editor")} />
					<Tab label={t("hotkeys")} />
					<Tab label={t("data")} />
					<Tab label={t("pluginsTab")} />
				</Tabs>

				<Box sx={{ flexGrow: 1, height: "100%" }}>
					{/* TAB 0: GENERAL */}
					<TabPanel value={activeTab} index={0}>
						<GeneralTab tempSettings={tempSettings} setTempSettings={setTempSettings} />
					</TabPanel>

					{/* TAB 1: APPEARANCE */}
					<TabPanel value={activeTab} index={1}>
						<AppearanceTab tempSettings={tempSettings} setTempSettings={setTempSettings} />
					</TabPanel>

					{/* TAB 2: EDITOR */}
					<TabPanel value={activeTab} index={2}>
						<EditorTab tempSettings={tempSettings} setTempSettings={setTempSettings} />
					</TabPanel>

					{/* TAB 3: KEYBOARD SHORTCUTS */}
					<TabPanel value={activeTab} index={3}>
						<HotkeysTab />
					</TabPanel>

					{/* TAB 4: DATA */}
					<TabPanel value={activeTab} index={4}>
						<DataTab onClearRecents={onClearRecents} />
					</TabPanel>

					{/* TAB 5: PLUGINS */}
					<TabPanel value={activeTab} index={5}>
						<PluginsTab tempSettings={tempSettings} setTempSettings={setTempSettings} />
					</TabPanel>
				</Box>
			</DialogContent>
			<Divider />
			<DialogActions sx={{ p: 2 }}>
				<Button onClick={onClose} variant="outlined" color="inherit" size="small">
					{t("btnCancel")}
				</Button>
				<Button onClick={handleSave} variant="contained" color="primary" size="small">
					{t("btnSave")}
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default SettingsDialog;
`;

fs.writeFileSync('src/components/dialogs/SettingsDialog.tsx', settingsDialog);

