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
	/** Unique block type ID (e.g., "text", "image", "pdf") */
	id: string;

	/** Translation key for sidebar tooltip/menu labels */
	nameKey: string;

	/** Icon component for sidebar buttons and context menus */
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
