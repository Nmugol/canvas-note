import TextFieldsIcon from "@mui/icons-material/TextFields";
import { TextBlock } from "../components/blocks/TextBlock";
import { TextBlock as TextBlockModel } from "../models/TextBlock";
import { CanvasNotePlugin } from "../interface/IPlugin";

export const TextPlugin: CanvasNotePlugin = {
	id: "text",
	nameKey: "sidebarAddTextTooltip",
	icon: TextFieldsIcon,
	defaultSize: { width: 260, height: 160 },
	createModel: ({ id, content, position, size }) => {
		const model = new TextBlockModel(content, position, size);
		if (id) {
			model.id = id;
		}
		return model;
	},
	renderBlock: ({ block, onChangeContent }) => (
		<TextBlock
			initialContent={block.content}
			onChangeContent={onChangeContent}
		/>
	)
};

export default TextPlugin;
