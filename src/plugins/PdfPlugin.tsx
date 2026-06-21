import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { PdfBlock } from "../components/blocks/PdfBlock";
import { PdfBlock as PdfBlockModel } from "../models/PdfBlock";
import { CanvasNotePlugin } from "../interface/IPlugin";

export const PdfPlugin: CanvasNotePlugin = {
	id: "pdf",
	nameKey: "sidebarAddPdfTooltip",
	icon: PictureAsPdfIcon,
	supportedExtensions: [".pdf"],
	defaultSize: { width: 400, height: 500 },
	createModel: ({ id, content, position, size, metadata }) => {
		const model = new PdfBlockModel(content, position, size, metadata?.caption || "");
		if (id) {
			model.id = id;
		}
		return model;
	},
	renderBlock: ({ block, onChangeContent, onChangeMetadata }) => (
		<PdfBlock
			initialSrc={block.content}
			initialCaption={(block as any).caption || ""}
			onChangeSrc={onChangeContent}
			onChangeCaption={(caption) => onChangeMetadata("caption", caption)}
		/>
	)
};

export default PdfPlugin;
