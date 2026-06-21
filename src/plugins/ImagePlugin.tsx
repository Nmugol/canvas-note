import ImageIcon from "@mui/icons-material/Image";
import { ImageBlock } from "../components/blocks/ImageBlock";
import { ImageBlock as ImageBlockModel } from "../models/ImageBlock";
import { CanvasNotePlugin } from "../interface/IPlugin";

export const ImagePlugin: CanvasNotePlugin = {
	id: "image",
	nameKey: "sidebarAddImageTooltip",
	icon: ImageIcon,
	supportedExtensions: [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
	defaultSize: { width: 320, height: 240 },
	createModel: ({ id, content, position, size, metadata }) => {
		const model = new ImageBlockModel(content, position, size, metadata?.caption || "");
		if (id) {
			model.id = id;
		}
		return model;
	},
	renderBlock: ({ block, onChangeContent, onChangeMetadata }) => (
		<ImageBlock
			initialSrc={block.content}
			initialCaption={(block as any).caption || ""}
			onChangeSrc={onChangeContent}
			onChangeCaption={(caption) => onChangeMetadata("caption", caption)}
		/>
	)
};

export default ImagePlugin;
