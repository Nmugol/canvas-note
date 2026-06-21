import { appDataDir, join } from "@tauri-apps/api/path";
import { readDir, exists, mkdir } from "@tauri-apps/plugin-fs";
import { convertFileSrc } from "@tauri-apps/api/core";
import { openPath } from "@tauri-apps/plugin-opener";

/**
 * Ensures the global plugins directory exists and returns its path.
 */
export async function getPluginsDir(): Promise<string> {
	try {
		const appData = await appDataDir();
		const pluginsDir = await join(appData, "plugins");
		
		const dirExists = await exists(pluginsDir);
		if (!dirExists) {
			await mkdir(pluginsDir, { recursive: true });
		}
		
		return pluginsDir;
	} catch (err) {
		console.error("Error in getPluginsDir:", err);
		throw err;
	}
}

/**
 * Opens the plugins directory in the system file explorer.
 */
export async function openPluginsDir(): Promise<void> {
	try {
		const pluginsDir = await getPluginsDir();
		await openPath(pluginsDir);
	} catch (err) {
		console.error("Failed to open plugins dir:", err);
		alert("Błąd podczas otwierania folderu wtyczek: " + String(err));
	}
}

/**
 * Returns a list of all .js and .mjs files in the plugins directory.
 */
export async function getExternalPluginPaths(): Promise<string[]> {
	try {
		const pluginsDir = await getPluginsDir();
		const entries = await readDir(pluginsDir);
		const pluginPaths: string[] = [];
		
		for (const entry of entries) {
			if (entry.isFile && (entry.name.endsWith(".js") || entry.name.endsWith(".mjs"))) {
				pluginPaths.push(await join(pluginsDir, entry.name));
			}
		}
		
		return pluginPaths;
	} catch (e) {
		console.error("Failed to get external plugin paths:", e);
		return [];
	}
}
