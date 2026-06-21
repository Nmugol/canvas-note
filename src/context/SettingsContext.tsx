import React, { createContext, useContext, useState } from "react";

export interface AppSettings {
	language: "pl" | "en" | "de" | "es" | "fr";
	theme: "light" | "dark" | "system";
	primaryColor: string;
	fontFamily: string;
	showGrid: boolean;
	gridStyle: "dots" | "lines";
	showMinimap: boolean;
	autosaveDelay: number;
	defaultCanvasName: string;
	disabledPlugins?: string[];
	externalPlugins?: string[];
}

const DEFAULT_SETTINGS: AppSettings = {
	language: "pl",
	theme: "light",
	primaryColor: "#4f46e5",
	fontFamily: "system-ui, -apple-system, sans-serif",
	showGrid: true,
	gridStyle: "dots",
	showMinimap: true,
	autosaveDelay: 800,
	defaultCanvasName: "plansza.json",
	disabledPlugins: [],
	externalPlugins: [],
};

interface SettingsContextType {
	settings: AppSettings;
	updateSettings: (newSettings: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [settings, setSettings] = useState<AppSettings>(() => {
		const stored = localStorage.getItem("canvas_note_settings");
		if (stored) {
			try {
				return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
			} catch (e) {
				console.error("Failed to parse settings:", e);
			}
		}
		return DEFAULT_SETTINGS;
	});

	React.useEffect(() => {
		const root = document.documentElement;
		const color = settings.primaryColor || "#4f46e5";
		root.style.setProperty("--primary-color", color);
		root.style.setProperty("--font-family", settings.fontFamily || "system-ui, -apple-system, sans-serif");
		
		// Parse hex to rgb for alpha usage
		let r = 79, g = 70, b = 229; // default #4f46e5
		if (color.startsWith("#") && color.length === 7) {
			r = parseInt(color.slice(1, 3), 16);
			g = parseInt(color.slice(3, 5), 16);
			b = parseInt(color.slice(5, 7), 16);
		}
		root.style.setProperty("--primary-color-rgb", `${r}, ${g}, ${b}`);
	}, [settings.primaryColor, settings.fontFamily]);

	const updateSettings = (newSettings: Partial<AppSettings>) => {
		setSettings((prev) => {
			const updated = { ...prev, ...newSettings };
			localStorage.setItem("canvas_note_settings", JSON.stringify(updated));
			return updated;
		});
	};

	return (
		<SettingsContext.Provider value={{ settings, updateSettings }}>
			{children}
		</SettingsContext.Provider>
	);
};

export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (context === undefined) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
};
