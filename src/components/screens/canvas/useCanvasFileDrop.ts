import { useState, useEffect, useRef } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { IBlock } from "../../../interface/IBlock";
import { pluginRegistry } from "../../../plugins";
import { CanvasNotePlugin } from "../../../interface/IPlugin";

interface UseCanvasFileDropProps {
	notebookPath: string;
	activeCanvasPath: string | null;
	panOffset: { x: number; y: number };
	zoom: number;
	panOffsetRef: React.MutableRefObject<{ x: number; y: number }>;
	zoomRef: React.MutableRefObject<number>;
	setBlocks: React.Dispatch<React.SetStateAction<IBlock[]>>;
}

export function useCanvasFileDrop({
	notebookPath,
	activeCanvasPath,
	panOffset,
	zoom,
	panOffsetRef,
	zoomRef,
	setBlocks,
}: UseCanvasFileDropProps) {
	const [isDraggingFile, setIsDraggingFile] = useState(false);
	const nativeDropHandledRef = useRef(false);

	const getFileName = (pathStr: string) => {
		const lastSlash = Math.max(pathStr.lastIndexOf("/"), pathStr.lastIndexOf("\\"));
		return lastSlash !== -1 ? pathStr.substring(lastSlash + 1) : pathStr;
	};

	const formatBytes = (bytes: number, decimals = 1) => {
		if (bytes === 0) return "0 Bytes";
		const k = 1024;
		const dm = decimals < 0 ? 0 : decimals;
		const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
	};

	const getPluginForFile = (name: string, type: string): CanvasNotePlugin | undefined => {
		const ext = name.substring(name.lastIndexOf(".")).toLowerCase();
		const plugin = pluginRegistry.findByExtension(ext);
		if (plugin) return plugin;

		if (type.startsWith("image/")) return pluginRegistry.get("image");
		if (type.startsWith("video/")) return pluginRegistry.get("video");
		if (type.startsWith("audio/")) return pluginRegistry.get("audio");

		return undefined;
	};

	const getPluginForPath = (path: string): CanvasNotePlugin | undefined => {
		const ext = "." + (path.split(".").pop()?.toLowerCase() || "");
		return pluginRegistry.findByExtension(ext);
	};

	const handleNativeFileDrop = async (paths: string[], clientX: number, clientY: number) => {
		if (!activeCanvasPath) return;

		for (let index = 0; index < paths.length; index++) {
			const absolutePath = paths[index];
			const position = {
				x: clientX + index * 30,
				y: clientY + index * 30,
			};

			const fileName = getFileName(absolutePath);
			const plugin = getPluginForPath(absolutePath);

			// Copy the file to the notebook's files directory and convert it to a local asset URL.
			let assetUrl = "";
			try {
				const destPath = await invoke<string>("copy_file_to_notebook", {
					notebookPath,
					filePath: absolutePath,
				});
				assetUrl = convertFileSrc(destPath);
			} catch (err) {
				console.error("Failed to copy file to notebook on backend:", err);
				assetUrl = convertFileSrc(absolutePath);
			}

			let newBlock: IBlock;

			if (plugin) {
				if (plugin.id === "text") {
					try {
						const text = await fetch(assetUrl).then((res) => res.text());
						newBlock = plugin.createModel({
							content: text,
							position,
							size: plugin.defaultSize,
						});
					} catch (e) {
						console.error("Failed to read text file content:", e);
						newBlock = plugin.createModel({
							content: `### ${fileName}\nNie udało się odczytać zawartości pliku tekstowego.`,
							position,
							size: plugin.defaultSize,
						});
					}
				} else {
					newBlock = plugin.createModel({
						content: assetUrl,
						position,
						size: plugin.defaultSize,
						metadata: {
							caption: fileName,
							fileName,
							fileSize: "Kopia lokalna",
						}
					});
				}
			} else {
				const docPlugin = pluginRegistry.get("document")!;
				newBlock = docPlugin.createModel({
					content: assetUrl,
					position,
					size: docPlugin.defaultSize,
					metadata: {
						caption: fileName,
						fileName,
						fileSize: "Kopia lokalna",
					}
				});
			}

			setBlocks((prev) => [...prev, newBlock]);
		}
	};

	// Register native file drop listeners
	useEffect(() => {
		let active = true;
		const unlisteners: (() => void)[] = [];

		const setupDragListeners = async () => {
			try {
				const enter = await listen<any>("tauri://drag-enter", () => {
					if (activeCanvasPath) {
						setIsDraggingFile(true);
					}
				});
				if (!active) {
					enter();
				} else {
					unlisteners.push(enter);
				}

				const leave = await listen<any>("tauri://drag-over", () => {
					if (activeCanvasPath) {
						setIsDraggingFile(true);
					}
				});
				if (!active) {
					leave();
				} else {
					unlisteners.push(leave);
				}

				const drop = await listen<any>("tauri://drag-drop", async (event) => {
					setIsDraggingFile(false);
					if (!activeCanvasPath) return;

					const payload = event.payload;
					const paths = payload.paths;
					const pos = payload.position;

					if (paths && paths.length > 0) {
						// Set flag IMMEDIATELY (synchronously) before any async work
						// so the web onDrop handler sees it and bails out.
						nativeDropHandledRef.current = true;
						setTimeout(() => {
							nativeDropHandledRef.current = false;
						}, 1000);

						console.log("[tauri://drag-drop] paths:", paths);

						const devicePixelRatio = window.devicePixelRatio || 1;
						const logicalX = pos.x / devicePixelRatio;
						const logicalY = pos.y / devicePixelRatio;

						const canvasEl = document.getElementById("canvas-area");
						const rect = canvasEl?.getBoundingClientRect();
						const relativeX = rect ? logicalX - rect.left : logicalX;
						const relativeY = rect ? logicalY - rect.top : logicalY;

						await handleNativeFileDrop(
							paths,
							(relativeX - panOffsetRef.current.x) / zoomRef.current,
							(relativeY - panOffsetRef.current.y) / zoomRef.current
						);
					}
				});
				if (!active) {
					drop();
				} else {
					unlisteners.push(drop);
				}

				const cancel = await listen<any>("tauri://drag-cancelled", () => {
					setIsDraggingFile(false);
				});
				if (!active) {
					cancel();
				} else {
					unlisteners.push(cancel);
				}
			} catch (err) {
				console.error("Failed to setup drag listeners:", err);
			}
		};

		setupDragListeners();

		return () => {
			active = false;
			unlisteners.forEach((unlisten) => unlisten());
		};
	}, [activeCanvasPath, notebookPath]);

	const handleDropFile = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingFile(false);

		// If the native Tauri file drop already handled this drop, skip
		console.log("[web onDrop] fired, nativeHandled =", nativeDropHandledRef.current);
		if (nativeDropHandledRef.current) {
			nativeDropHandledRef.current = false;
			return;
		}

		const files = Array.from(e.dataTransfer.files);
		console.log(
			"[web onDrop] files:",
			files.map((f) => ({ name: f.name, type: f.type, path: (f as any).path }))
		);
		if (files.length === 0) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const dropX = (e.clientX - rect.left - panOffset.x) / zoom;
		const dropY = (e.clientY - rect.top - panOffset.y) / zoom;

		for (let index = 0; index < files.length; index++) {
			const file = files[index];
			const position = {
				x: dropX + index * 30,
				y: dropY + index * 30,
			};

			const fileName = file.name;
			const fileSize = formatBytes(file.size);
			let assetUrl = "";

			const absolutePath = (file as any).path;
			const plugin = getPluginForFile(fileName, file.type);

			if (plugin && (plugin.id === "video" || plugin.id === "audio")) {
				if (absolutePath) {
					try {
						const destPath = await invoke<string>("copy_file_to_notebook", {
							notebookPath,
							filePath: absolutePath,
						});
						assetUrl = convertFileSrc(destPath);
					} catch (err) {
						console.error("Failed to copy file to notebook on backend:", err);
						assetUrl = convertFileSrc(absolutePath);
					}
				} else {
					assetUrl = URL.createObjectURL(file);
				}
			} else if (absolutePath) {
				try {
					const destPath = await invoke<string>("copy_file_to_notebook", {
						notebookPath,
						filePath: absolutePath,
					});
					assetUrl = convertFileSrc(destPath);
				} catch (err) {
					console.error("Failed to copy file to notebook on backend:", err);
					assetUrl = convertFileSrc(absolutePath);
				}
			} else {
				assetUrl = await new Promise<string>((resolve) => {
					const reader = new FileReader();
					reader.onload = (ev) => resolve(ev.target?.result as string);
					reader.readAsDataURL(file);
				});
			}

			let newBlock: IBlock;

			if (plugin) {
				if (plugin.id === "text") {
					const reader = new FileReader();
					reader.onload = (event) => {
						const text = event.target?.result as string;
						const textBlock = plugin.createModel({
							content: text,
							position,
							size: plugin.defaultSize,
						});
						setBlocks((prev) => [...prev, textBlock]);
					};
					reader.readAsText(file);
					continue;
				} else {
					newBlock = plugin.createModel({
						content: assetUrl,
						position,
						size: plugin.defaultSize,
						metadata: {
							caption: fileName,
							fileName,
							fileSize,
						}
					});
				}
			} else {
				const docPlugin = pluginRegistry.get("document")!;
				newBlock = docPlugin.createModel({
					content: assetUrl,
					position,
					size: docPlugin.defaultSize,
					metadata: {
						caption: fileName,
						fileName,
						fileSize,
					}
				});
			}

			setBlocks((prev) => [...prev, newBlock]);
		}
	};

	return {
		isDraggingFile,
		handleDropFile,
	};
}
