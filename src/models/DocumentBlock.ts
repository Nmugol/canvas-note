import { EBlockType } from "../enums/EBlockType";
import { IBlock } from "../interface/IBlock";
import { IdGenerator } from "../Utils/IdGenerator";

export class DocumentBlock implements IBlock {
	id: string;
	type: EBlockType;
	content: string; // Blob URL of the Word file
	position: { x: number; y: number };
	size: { width: number; height: number; minWidth: number; minHeight: number };
	caption: string;
	fileName: string;
	fileSize: string;

	constructor(
		content: string,
		position: { x: number; y: number },
		size?: { width: number; height: number; minWidth?: number; minHeight?: number },
		caption: string = "",
		fileName: string = "",
		fileSize: string = "",
	) {
		this.id = new IdGenerator().generateID();
		this.type = EBlockType.Document;
		this.content = content;
		this.position = position;
		this.size = {
			width: size?.width ?? 300,
			height: size?.height ?? 140,
			minWidth: size?.minWidth ?? 220,
			minHeight: size?.minHeight ?? 100,
		};
		this.caption = caption;
		this.fileName = fileName;
		this.fileSize = fileSize;
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
	updateMetadata(fileName: string, fileSize: string): void {
		this.fileName = fileName;
		this.fileSize = fileSize;
	}
	toJson(): string {
		return JSON.stringify({
			id: this.id,
			type: this.type,
			content: this.content,
			position: this.position,
			size: this.size,
			caption: this.caption,
			fileName: this.fileName,
			fileSize: this.fileSize,
		});
	}
	loadFromJson(json: string): void {
		const data = JSON.parse(json);
		this.id = data.id;
		this.content = data.content;
		this.position = data.position;
		this.size = data.size;
		this.caption = data.caption ?? "";
		this.fileName = data.fileName ?? "";
		this.fileSize = data.fileSize ?? "";
	}
}
