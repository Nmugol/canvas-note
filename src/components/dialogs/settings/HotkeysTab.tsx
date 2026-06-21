import React from "react";
import { List, ListItem, ListItemText, Typography, Divider } from "@mui/material";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useTranslation } from "../../../utils/translations";

export const HotkeysTab: React.FC = () => {
	const { t } = useTranslation();
	return (
		<List dense sx={{ py: 0 }}>
			{[
				{ title: t("hkPanTitle"), desc: t("hkPanDesc") },
				{ title: t("hkZoomTitle"), desc: t("hkZoomDesc") },
				{ title: t("hkZoomResetTitle"), desc: t("hkZoomResetDesc") },
				{ title: t("hkCopyTitle"), desc: t("hkCopyDesc") },
				{ title: t("hkCutTitle"), desc: t("hkCutDesc") },
				{ title: t("hkPasteTitle"), desc: t("hkPasteDesc") },
				{ title: t("hkDeleteTitle"), desc: t("hkDeleteDesc") },
			].map((item, idx) => (
				<React.Fragment key={idx}>
					<ListItem sx={{ py: 1, px: 0.5 }}>
						<KeyboardArrowRightIcon sx={{ color: "primary.main", mr: 1, fontSize: "18px" }} />
						<ListItemText
							primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{item.title}</Typography>}
							secondary={<Typography variant="caption" color="text.secondary">{item.desc}</Typography>}
						/>
					</ListItem>
					{idx < 6 && <Divider />}
				</React.Fragment>
			))}
		</List>
	);
};
