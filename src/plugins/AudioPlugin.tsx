import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { AudioBlock } from "../components/blocks/AudioBlock";
import { AudioBlock as AudioBlockModel } from "../models/AudioBlock";
import { CanvasNotePlugin } from "../interface/IPlugin";

export const AudioPlugin: CanvasNotePlugin = {
	id: "audio",
	nameKey: "sidebarAddAudioTooltip",
	icon: MusicNoteIcon,
	supportedExtensions: [".mp3", ".wav", ".ogg", ".m4a", ".aac"],
	defaultSize: { width: 320, height: 140 },
	createModel: ({ id, content, position, size, metadata }) => {
		const model = new AudioBlockModel(content, position, size, metadata?.caption || "");
		if (id) {
			model.id = id;
		}
		return model;
	},
	renderBlock: ({ block, onChangeContent, onChangeMetadata }) => (
		<AudioBlock
			initialSrc={block.content}
			initialCaption={(block as any).caption || ""}
			onChangeSrc={onChangeContent}
			onChangeCaption={(caption) => onChangeMetadata("caption", caption)}
		/>
	)
};

export default AudioPlugin;
