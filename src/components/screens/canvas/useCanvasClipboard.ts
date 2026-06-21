import { useState, useEffect } from "react";
import { IBlock } from "../../../interface/IBlock";
import { EBlockType } from "../../../enums/EBlockType";
import { TextBlock as TextBlockModel } from "../../../models/TextBlock";
import { ImageBlock as ImageBlockModel } from "../../../models/ImageBlock";
import { VideoBlock as VideoBlockModel } from "../../../models/VideoBlock";
import { AudioBlock as AudioBlockModel } from "../../../models/AudioBlock";
import { PdfBlock as PdfBlockModel } from "../../../models/PdfBlock";
import { DocumentBlock as DocumentBlockModel } from "../../../models/DocumentBlock";

interface ClipboardData {
	type: EBlockType;
	content: string;
	size: { width: number; height: number; minWidth: number; minHeight: number };
	position: { x: number; y: number };
	caption?: string;
	fileName?: string;
	fileSize?: string;
}

interface UseCanvasClipboardProps {
	blocks: IBlock[];
	setBlocks: React.Dispatch<React.SetStateAction<IBlock[]>>;
	selectedBlockId: string | null;
	setSelectedBlockId: React.Dispatch<React.SetStateAction<string | null>>;
	onDeleteBlock: (id: string) => void;
}

export function useCanvasClipboard({
	blocks,
	setBlocks,
	selectedBlockId,
	setSelectedBlockId,
	onDeleteBlock,
}: UseCanvasClipboardProps) {
	const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

	const handleCopy = (blockId: string) => {
		const blockToCopy = blocks.find((b) => b.id === blockId);
		if (blockToCopy) {
			setClipboard({
				type: blockToCopy.type,
				content: blockToCopy.content,
				size: { ...blockToCopy.size },
				position: { ...blockToCopy.position },
				caption:
					blockToCopy.type === EBlockType.Image ||
					blockToCopy.type === EBlockType.Video ||
					blockToCopy.type === EBlockType.Audio ||
					blockToCopy.type === EBlockType.Pdf ||
					blockToCopy.type === EBlockType.Document
						? (blockToCopy as any).caption
						: undefined,
				fileName: blockToCopy.type === EBlockType.Document ? (blockToCopy as any).fileName : undefined,
				fileSize: blockToCopy.type === EBlockType.Document ? (blockToCopy as any).fileSize : undefined,
			});
		}
	};

	const handleCut = (blockId: string) => {
		handleCopy(blockId);
		onDeleteBlock(blockId);
		setSelectedBlockId(null);
	};

	const handlePaste = (x?: number, y?: number) => {
		if (!clipboard) return;

		const newPos =
			x !== undefined && y !== undefined
				? { x, y }
				: { x: clipboard.position.x + 30, y: clipboard.position.y + 30 };

		let newBlock: IBlock;
		if (clipboard.type === EBlockType.Image) {
			newBlock = new ImageBlockModel(
				clipboard.content,
				newPos,
				{
					width: clipboard.size.width,
					height: clipboard.size.height,
					minWidth: clipboard.size.minWidth,
					minHeight: clipboard.size.minHeight,
				},
				clipboard.caption ?? ""
			);
		} else if (clipboard.type === EBlockType.Video) {
			newBlock = new VideoBlockModel(
				clipboard.content,
				newPos,
				{
					width: clipboard.size.width,
					height: clipboard.size.height,
					minWidth: clipboard.size.minWidth,
					minHeight: clipboard.size.minHeight,
				},
				clipboard.caption ?? ""
			);
		} else if (clipboard.type === EBlockType.Audio) {
			newBlock = new AudioBlockModel(
				clipboard.content,
				newPos,
				{
					width: clipboard.size.width,
					height: clipboard.size.height,
					minWidth: clipboard.size.minWidth,
					minHeight: clipboard.size.minHeight,
				},
				clipboard.caption ?? ""
			);
		} else if (clipboard.type === EBlockType.Pdf) {
			newBlock = new PdfBlockModel(
				clipboard.content,
				newPos,
				{
					width: clipboard.size.width,
					height: clipboard.size.height,
					minWidth: clipboard.size.minWidth,
					minHeight: clipboard.size.minHeight,
				},
				clipboard.caption ?? ""
			);
		} else if (clipboard.type === EBlockType.Document) {
			newBlock = new DocumentBlockModel(
				clipboard.content,
				newPos,
				{
					width: clipboard.size.width,
					height: clipboard.size.height,
					minWidth: clipboard.size.minWidth,
					minHeight: clipboard.size.minHeight,
				},
				clipboard.caption ?? "",
				clipboard.fileName ?? "",
				clipboard.fileSize ?? ""
			);
		} else {
			newBlock = new TextBlockModel(
				clipboard.content,
				newPos,
				{
					width: clipboard.size.width,
					height: clipboard.size.height,
					minWidth: clipboard.size.minWidth,
					minHeight: clipboard.size.minHeight,
				}
			);
		}

		setBlocks((prev) => [...prev, newBlock]);
		setSelectedBlockId(newBlock.id);

		// Shift clipboard position slightly for sequential pasting
		setClipboard({
			...clipboard,
			position: newPos,
		});
	};

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			const isInputActive =
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable;

			if (isInputActive) {
				return;
			}

			// 1. Delete / Backspace
			if (e.key === "Delete" || e.key === "Backspace") {
				if (selectedBlockId) {
					onDeleteBlock(selectedBlockId);
					setSelectedBlockId(null);
				}
				return;
			}

			// 2. Ctrl+C or Cmd+C (Copy)
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
				if (selectedBlockId) {
					handleCopy(selectedBlockId);
					e.preventDefault();
				}
				return;
			}

			// 3. Ctrl+X or Cmd+X (Cut)
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "x") {
				if (selectedBlockId) {
					handleCut(selectedBlockId);
					e.preventDefault();
				}
				return;
			}

			// 4. Ctrl+V or Cmd+V (Paste)
			if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
				if (clipboard) {
					handlePaste();
					e.preventDefault();
				}
				return;
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [selectedBlockId, blocks, clipboard]);

	return {
		clipboard,
		handleCopy,
		handleCut,
		handlePaste,
	};
}
