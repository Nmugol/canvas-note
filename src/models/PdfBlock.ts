import { EBlockType } from "../enums/EBlockType";
import { IBlock } from "../interface/IBlock";
import { IdGenerator } from "../Utils/IdGenerator";

export class PdfBlock implements IBlock {
	id: string;
	type: EBlockType;
	content: string; // Blob URL or online PDF URL
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
		this.type = EBlockType.Pdf;
		this.content = content;
		this.position = position;
		this.size = {
			width: size?.width ?? 400,
			height: size?.height ?? 500,
			minWidth: size?.minWidth ?? 250,
			minHeight: size?.minHeight ?? 200,
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
			content: content_without_local_blobs(this.content), // Avoid saving huge/invalid blob URLs long term if backend is used, but for now we follow the other blocks
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

// Helper to keep serialization clean (same as other blocks if any, else direct)
function content_without_local_blobs(content: string): string {
	return content;
}
