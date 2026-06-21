import { CanvasNotePlugin } from "../interface/IPlugin";

class PluginRegistry {
	private plugins = new Map<string, CanvasNotePlugin>();

	/** Register a plugin */
	public register(plugin: CanvasNotePlugin): void {
		if (this.plugins.has(plugin.id)) {
			console.warn(`Plugin with ID "${plugin.id}" is already registered. Overwriting.`);
		}
		this.plugins.set(plugin.id, plugin);
	}

	/** Retrieve a plugin by ID */
	public get(id: string): CanvasNotePlugin | undefined {
		return this.plugins.get(id);
	}

	/** Retrieve all registered plugins */
	public getAll(): CanvasNotePlugin[] {
		return Array.from(this.plugins.values());
	}

	/** Find a plugin that supports a specific file extension */
	public findByExtension(ext: string): CanvasNotePlugin | undefined {
		const cleanExt = ext.toLowerCase();
		return this.getAll().find((p) =>
			p.supportedExtensions?.map(e => e.toLowerCase()).includes(cleanExt)
		);
	}
}

export const pluginRegistry = new PluginRegistry();
export default pluginRegistry;
