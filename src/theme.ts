import { createTheme } from "@mui/material/styles";

export const getAppTheme = (mode: "light" | "dark", customPrimaryColor?: string, customFontFamily?: string) => {
	const isDark = mode === "dark";
	const primaryMain = customPrimaryColor || (isDark ? "#818cf8" : "#4f46e5");
	
	return createTheme({
		palette: {
			mode,
			primary: {
				main: primaryMain,
				contrastText: "#ffffff",
			},
			secondary: {
				main: "#06b6d4",
				light: "#67e8f9",
				dark: "#0891b2",
				contrastText: "#ffffff",
			},
			background: {
				default: isDark ? "#0f172a" : "#f8fafc", // slate 900 vs slate 50
				paper: isDark ? "#1e293b" : "#ffffff",    // slate 800 vs white
			},
			text: {
				primary: isDark ? "#f8fafc" : "#0f172a",   // slate 50 vs slate 900
				secondary: isDark ? "#94a3b8" : "#475569", // slate 400 vs slate 600
				disabled: isDark ? "#64748b" : "#94a3b8",
			},
			divider: isDark ? "#334155" : "#e2e8f0",      // slate 700 vs slate 200
		},
		typography: {
			fontFamily: customFontFamily || '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
			h1: {
				fontSize: "2.25rem",
				fontWeight: 700,
				color: isDark ? "#f8fafc" : "#0f172a",
			},
			h2: {
				fontSize: "1.875rem",
				fontWeight: 700,
				color: isDark ? "#f8fafc" : "#0f172a",
			},
			h3: {
				fontSize: "1.5rem",
				fontWeight: 600,
				color: isDark ? "#f8fafc" : "#0f172a",
			},
			h4: {
				fontSize: "1.25rem",
				fontWeight: 600,
				color: isDark ? "#f8fafc" : "#0f172a",
			},
			h5: {
				fontSize: "1rem",
				fontWeight: 600,
				color: isDark ? "#f8fafc" : "#0f172a",
			},
			h6: {
				fontSize: "0.875rem",
				fontWeight: 600,
				color: isDark ? "#f8fafc" : "#0f172a",
			},
			body1: {
				fontSize: "1rem",
				color: isDark ? "#cbd5e1" : "#334155",
			},
			body2: {
				fontSize: "0.875rem",
				color: isDark ? "#94a3b8" : "#475569",
			},
			button: {
				textTransform: "none",
				fontWeight: 500,
			},
		},
		shape: {
			borderRadius: 8,
		},
		components: {
			MuiButton: {
				defaultProps: {
					disableElevation: true,
				},
				styleOverrides: {
					root: {
						borderRadius: "8px",
						padding: "6px 16px",
						transition: "all 0.2s ease-in-out",
						fontWeight: 500,
					},
				},
				variants: [
					{
						props: { variant: "contained", color: "primary" },
						style: {
							backgroundColor: primaryMain,
							"&:hover": {
								filter: "brightness(0.9)",
							},
						},
					},
					{
						props: { variant: "outlined", color: "primary" },
						style: {
							borderColor: primaryMain,
							color: primaryMain,
							"&:hover": {
								backgroundColor: "var(--primary-color-alpha, rgba(99, 102, 241, 0.08))",
								borderColor: primaryMain,
							},
						},
					},
				],
			},
			MuiCard: {
				styleOverrides: {
					root: {
						borderRadius: "12px",
						boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
						border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
					},
				},
			},
		},
	});
};

export default getAppTheme;
