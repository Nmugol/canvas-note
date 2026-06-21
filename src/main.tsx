import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import useMediaQuery from "@mui/material/useMediaQuery";
import { IntlProvider } from "react-intl";
import * as Mui from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { convertFileSrc } from "@tauri-apps/api/core";
import getAppTheme from "./theme";
import App from "./App";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { translations } from "./utils/translations";
import { pluginRegistry } from "./utils/PluginRegistry";
import { getExternalPluginPaths } from "./utils/ExternalPluginLoader";
import { BaseBlock } from "./models/BaseBlock";
import "./plugins";

// Expose React, MUI, and registration API to external scripts
(window as any).CanvasNote = {
	React,
	Mui,
	MuiIcons,
	BaseBlock,
	registerPlugin: (plugin: any) => pluginRegistry.register(plugin)
};

function loadExternalPlugin(path: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		try {
			script.src = convertFileSrc(path);
		} catch (e) {
			console.error("convertFileSrc failed, falling back to path", e);
			script.src = path;
		}
		script.onload = () => resolve();
		script.onerror = (e) => reject(e);
		document.head.appendChild(script);
	});
}

function AppWrapper() {
	const { settings } = useSettings();
	const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
	const [pluginsLoaded, setPluginsLoaded] = React.useState(false);

	const activeMode = useMemo(() => {
		if (settings.theme === "system") {
			return prefersDarkMode ? "dark" : "light";
		}
		return settings.theme || "light";
	}, [settings.theme, prefersDarkMode]);

	const theme = useMemo(() => getAppTheme(activeMode, settings.primaryColor, settings.fontFamily), [activeMode, settings.primaryColor, settings.fontFamily]);

	React.useEffect(() => {
		if (activeMode === "dark") {
			document.documentElement.classList.add("dark");
		} else {
			document.documentElement.classList.remove("dark");
		}
	}, [activeMode]);

	React.useEffect(() => {
		async function loadPlugins() {
			try {
				const paths = await getExternalPluginPaths();
				for (const path of paths) {
					try {
						await loadExternalPlugin(path);
					} catch (err) {
						console.error(`Failed to load plugin at ${path}:`, err);
					}
				}
			} catch (e) {
				console.error("Błąd getExternalPluginPaths: ", e);
			}
			setPluginsLoaded(true);
		}
		loadPlugins();
	}, []);

	const currentLanguage = settings.language || "pl";
	const messages = translations[currentLanguage as "pl" | "en"] || translations.pl;

	if (!pluginsLoaded) {
		return null;
	}

	return (
		<IntlProvider locale={currentLanguage} messages={messages} defaultLocale="pl">
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<App />
			</ThemeProvider>
		</IntlProvider>
	);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<SettingsProvider>
			<AppWrapper />
		</SettingsProvider>
	</React.StrictMode>
);
