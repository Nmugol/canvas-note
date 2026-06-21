import DescriptionIcon from "@mui/icons-material/Description";
import { DocumentBlock } from "../components/blocks/DocumentBlock";
import { DocumentBlock as DocumentBlockModel } from "../models/DocumentBlock";
import { CanvasNotePlugin } from "../interface/IPlugin";

export const DocumentPlugin: CanvasNotePlugin = {
	id: "document",
	nameKey: "sidebarAddWordTooltip",
	icon: DescriptionIcon,
	supportedExtensions: [".doc", ".docx"],
	defaultSize: { width: 300, height: 140 },
	createModel: ({ id, content, position, size, metadata }) => {
		const model = new DocumentBlockModel(
			content,
			position,
			size,
			metadata?.caption || "",
			metadata?.fileName || "",
			metadata?.fileSize || ""
		);
		if (id) {
			model.id = id;
		}
		return model;
	},
	renderBlock: ({ block, onChangeContent, onChangeMetadata }) => (
		<DocumentBlock
			initialSrc={block.content}
			initialCaption={(block as any).caption || ""}
			initialFileName={(block as any).fileName || ""}
			initialFileSize={(block as any).fileSize || ""}
			onChangeSrc={onChangeContent}
			onChangeCaption={(caption) => onChangeMetadata("caption", caption)}
			onChangeMetadata={(fileName, fileSize) => {
				onChangeMetadata("fileName", fileName);
				onChangeMetadata("fileSize", fileSize);
			}}
		/>
	)
};

export default DocumentPlugin;
