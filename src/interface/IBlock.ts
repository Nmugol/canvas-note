import { EBlockType } from "../enums/EBlockType";

export interface IBlock {
	id: string;
	type: EBlockType;
	content: string;
	position: {
		x: number;
		y: number;
	};
	size: {
		width: number;
		height: number;
		minWidth: number;
		minHeight: number;
	};

	updatePosition(x: number, y: number): void;
	updateSize(width: number, height: number): void;
	updateContent(content: string): void;
	toJson(): string;
	loadFromJson(json: string): void;
}
