import { EBlockType } from "../enums/EBlockType";
import { IBlock } from "../interface/IBlock";
import { IdGenerator } from "../Utils/IdGenerator";

export class AudioBlock implements IBlock {
	id: string;
	type: EBlockType;
	content: string; // Blob URL or online audio URL
	position: { x: number; y: number };
	size: { width: number; height: number; minWidth: number; minHeight: number };
	caption: string;

	constructor(
		content: string,
		position: { x: number; y: number },
		size?: { width: number; height: number; minWidth?: number; minHeight?: number },
		caption: string = "",
	) {
		this.id = new IdGenerator().generateID();
		this.type = EBlockType.Audio;
		this.content = content;
		this.position = position;
		this.size = {
			width: size?.width ?? 320,
			height: size?.height ?? 140,
			minWidth: size?.minWidth ?? 200,
			minHeight: size?.minHeight ?? 100,
		};
		this.caption = caption;
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
	updateCaption(caption: string): void {
		this.caption = caption;
	}
	toJson(): string {
		return JSON.stringify({
			id: this.id,
			type: this.type,
			content: this.content,
			position: this.position,
			size: this.size,
			caption: this.caption,
		});
	}
	loadFromJson(json: string): void {
		const data = JSON.parse(json);
		this.id = data.id;
		this.content = data.content;
		this.position = data.position;
		this.size = data.size;
		this.caption = data.caption ?? "";
	}
}
