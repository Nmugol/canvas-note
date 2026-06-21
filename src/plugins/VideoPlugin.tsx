import MovieIcon from "@mui/icons-material/Movie";
import { VideoBlock } from "../components/blocks/VideoBlock";
import { VideoBlock as VideoBlockModel } from "../models/VideoBlock";
import { CanvasNotePlugin } from "../interface/IPlugin";

export const VideoPlugin: CanvasNotePlugin = {
	id: "video",
	nameKey: "sidebarAddVideoTooltip",
	icon: MovieIcon,
	supportedExtensions: [".mp4", ".webm", ".ogg"],
	defaultSize: { width: 320, height: 240 },
	createModel: ({ id, content, position, size, metadata }) => {
		const model = new VideoBlockModel(content, position, size, metadata?.caption || "");
		if (id) {
			model.id = id;
		}
		return model;
	},
	renderBlock: ({ block, onChangeContent, onChangeMetadata }) => (
		<VideoBlock
			initialSrc={block.content}
			initialCaption={(block as any).caption || ""}
			onChangeSrc={onChangeContent}
			onChangeCaption={(caption) => onChangeMetadata("caption", caption)}
		/>
	)
};

export default VideoPlugin;
