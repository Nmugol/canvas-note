# Canvas Note Plugin API

Canvas Note supports an extensible plugin architecture, allowing developers to create custom block types that seamlessly integrate into the infinite canvas. This document describes how to build and register a new plugin.

## 📦 What is a Plugin?

In Canvas Note, a **Plugin** is fundamentally an object that implements the `CanvasNotePlugin` interface. It defines:
1. **Identifier & Metadata**: The plugin's unique ID, translation keys, and icon.
2. **Behavior**: Supported file extensions for drag-and-drop operations.
3. **Data Model**: A factory method to instantiate the underlying data model (`IBlock`).
4. **Rendering**: A React component/function (`renderBlock`) that defines how the block looks and interacts on the canvas.

## 🛠 `CanvasNotePlugin` Interface

Every plugin must conform to the following TypeScript interface (located in `src/interface/IPlugin.ts`):

```typescript
import { ReactNode } from "react";
import { IBlock } from "./IBlock";

export interface PluginBlockProps {
	block: IBlock;
	isSelected: boolean;
	zoom: number;
	onChangeContent: (content: string) => void;
	onChangeMetadata: (key: string, value: any) => void;
}

export interface CanvasNotePlugin {
	/** Unique block type ID (e.g., "text", "image", "my-custom-plugin") */
	id: string;

	/** Translation key for sidebar tooltip/menu labels */
	nameKey: string;

	/** Icon component for sidebar buttons and context menus (e.g., MUI Icon) */
	icon: React.ComponentType<any>;

	/** File extensions supported by this plugin for drag-and-drop */
	supportedExtensions?: string[];

	/** Default dimensions upon creation */
	defaultSize: {
		width: number;
		height: number;
	};

	/** Factory method to instantiate the concrete block model class */
	createModel: (params: {
		id?: string;
		content: string;
		position: { x: number; y: number };
		size?: { width: number; height: number };
		metadata?: Record<string, any>;
	}) => IBlock;

	/** React rendering function for the block's interactive content */
	renderBlock: (props: PluginBlockProps) => ReactNode;
}
```

## 📝 Example: Creating a Custom Plugin

Here is an example of creating a simple custom plugin (e.g., a "Clock" plugin).

### 1. Define the Plugin Object

```typescript
import React, { useState, useEffect } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CanvasNotePlugin, PluginBlockProps } from "../interface/IPlugin";
import { BaseBlock } from "../models/BaseBlock";

// 1. The Rendering Component
const ClockRenderer: React.FC<PluginBlockProps> = ({ block, isSelected }) => {
    const [time, setTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            height: "100%", 
            fontSize: "24px",
            fontFamily: "monospace"
        }}>
            {time}
        </div>
    );
};

// 2. The Plugin Definition
export const ClockPlugin: CanvasNotePlugin = {
    id: "clock",
    nameKey: "clockPlugin",
    icon: AccessTimeIcon,
    defaultSize: { width: 250, height: 100 },
    
    // Model factory
    createModel: (params) => {
        return new BaseBlock(
            params.id,
            "clock",
            params.position.x,
            params.position.y,
            params.size?.width ?? 250,
            params.size?.height ?? 100,
            params.content,
            params.metadata
        );
    },
    
    // React Render Function
    renderBlock: (props) => <ClockRenderer {...props} />
};
```

### 2. Auto-Registration

Because Canvas Note uses Vite, the plugin registry uses `import.meta.glob` to automatically discover and register any plugin exported in the `src/plugins/` directory.

You **do not** need to manually modify `src/plugins/index.ts`. Simply save your `ClockPlugin.tsx` or `ClockPlugin.ts` file inside `src/plugins/`, and ensure you export the plugin object. The system will detect the `CanvasNotePlugin` interface structure and register it automatically upon startup!

## 🔌 External Plugins

The application includes an **External Plugin Loader** (`src/utils/ExternalPluginLoader.ts`). 
External plugins are `.js` files dropped into the global OS plugins directory (accessible via the `Settings -> Plugins` menu). 

When compiled, external plugins must attach themselves to the global scope so the application can dynamically load them at runtime without recompiling the app.

**Important**: Because the browser executes external plugins at runtime, **they cannot contain raw JSX or TypeScript**. They must either be written in plain JavaScript using `React.createElement`, or be bundled (e.g. via Webpack/Vite) into a single `.js` file.

To help with this, the application exposes `React`, Material-UI components, and internal classes globally under `window.CanvasNote`:

```javascript
(function() {
    const React = window.CanvasNote.React;
    const BaseBlock = window.CanvasNote.BaseBlock;
    const MuiIcons = window.CanvasNote.MuiIcons;

    const DemoRenderer = (props) => {
        return React.createElement('div', {
            style: { padding: '20px', background: '#e0e0e0', height: '100%' }
        }, "Hello from External Plugin!");
    };

    const DemoPlugin = {
        id: "external-demo",
        nameKey: "externalDemoPlugin",
        icon: MuiIcons.Extension,
        defaultSize: { width: 200, height: 100 },
        
        createModel: (params) => {
            return new BaseBlock(
                params.id,
                "external-demo",
                params.position.x,
                params.position.y,
                params.size?.width ?? 200,
                params.size?.height ?? 100,
                params.content,
                params.metadata
            );
        },
        
        renderBlock: (props) => React.createElement(DemoRenderer, props)
    };

    // Register plugin with the app
    window.CanvasNote.registerPlugin(DemoPlugin);
})();
```
