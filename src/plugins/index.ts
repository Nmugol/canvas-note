import { pluginRegistry } from "../utils/PluginRegistry";

// Automatically import all .tsx and .ts files in this directory
const modules = import.meta.glob('./*.{tsx,ts}', { eager: true });

for (const path in modules) {
	if (path === './index.ts') continue;
	
	const mod = modules[path] as any;
	
	// Iterate over all exports in the module
	for (const key in mod) {
		const plugin = mod[key];
		// Detect if an export is a CanvasNotePlugin
		if (
			plugin &&
			typeof plugin === 'object' &&
			'id' in plugin &&
			'createModel' in plugin &&
			'renderBlock' in plugin
		) {
			pluginRegistry.register(plugin);
		}
	}
}

export { pluginRegistry };
export default pluginRegistry;
