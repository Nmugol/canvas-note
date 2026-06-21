import React from "react";
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
