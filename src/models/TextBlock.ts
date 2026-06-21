import { EBlockType } from "../enums/EBlockType";
import { IBlock } from "../interface/IBlock";
import { IdGenerator } from "../Utils/IdGenerator";

export class TextBlock implements IBlock {
	id: string;
	type: EBlockType;
	content: string;
	position: { x: number; y: number };
	size: { width: number; height: number; minWidth: number; minHeight: number };

	constructor(
		content: string,
		position: { x: number; y: number },
		size?: { width: number; height: number; minWidth?: number; minHeight?: number },
	) {
		this.id = new IdGenerator().generateID();
		this.type = EBlockType.Text;
		this.content = content;
		this.position = position;
		this.size = {
			width: size?.width ?? 300,
			height: size?.height ?? 180,
			minWidth: size?.minWidth ?? size?.width ?? 300,
			minHeight: size?.minHeight ?? size?.height ?? 180,
		};
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
		});
	}
	loadFromJson(json: string): void {
		const data = JSON.parse(json);
		this.id = data.id;
		this.content = data.content;
		this.position = data.position;
		this.size = data.size;
	}
}
