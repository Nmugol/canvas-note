import { IBlock } from "../interface/IBlock";
import { IdGenerator } from "../Utils/IdGenerator";
import { EBlockType } from "../enums/EBlockType";

export class BaseBlock implements IBlock {
	id: string;
	type: EBlockType | string;
	content: string;
	position: { x: number; y: number };
	size: { width: number; height: number; minWidth: number; minHeight: number };
	metadata?: Record<string, any>;

	constructor(
		id: string | undefined | null,
		type: string,
		x: number,
		y: number,
		width: number,
		height: number,
		content: string,
		metadata?: Record<string, any>
	) {
		this.id = id || new IdGenerator().generateID();
		this.type = type;
		this.position = { x, y };
		this.size = { width, height, minWidth: width, minHeight: height };
		this.content = content;
		this.metadata = metadata;
	}

	updatePosition(x: number, y: number): void {
		this.position = { x, y };
	}
	updateSize(width: number, height: number): void {
		this.size = {
			width,
			height,
			minWidth: this.size.minWidth,
			minHeight: this.size.minHeight,
		};
	}
	updateContent(content: string): void {
		this.content = content;
	}
	toJson(): string {
		return JSON.stringify({
			id: this.id,
			type: this.type,
			content: this.content,
			position: this.position,
			size: this.size,
			metadata: this.metadata
		});
	}
	loadFromJson(json: string): void {
		const data = JSON.parse(json);
		this.id = data.id;
		this.type = data.type;
		this.content = data.content;
		this.position = data.position;
		this.size = data.size;
		this.metadata = data.metadata;
	}
}
