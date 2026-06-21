import { useState, useEffect, useRef } from "react";
import { invoke, convertFileSrc } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import Resizable from "../blocks/Resizable";
import SidebarDock from "../bars/SidebarDock";
import TopBar from "../bars/TopBar";
import { IBlock } from "../../interface/IBlock";
import { pluginRegistry } from "../../plugins";

// Hooks
import { useCanvasZoomPan } from "./canvas/useCanvasZoomPan";
import { useCanvasClipboard } from "./canvas/useCanvasClipboard";
import { useCanvasFileDrop } from "./canvas/useCanvasFileDrop";
import { useSettings } from "../../context/SettingsContext";
import { useTranslation } from "../../utils/translations";

// Subcomponents
import { CanvasMinimap } from "./canvas/CanvasMinimap";
import { CanvasContextMenu } from "./canvas/CanvasContextMenu";
import { ConnectionsLayer } from "./canvas/ConnectionsLayer";
import { CanvasEmptyState } from "./canvas/CanvasEmptyState";
import { SettingsDialog } from "../dialogs/SettingsDialog";

// MUI Components & Icons
import { Button, Paper, Tooltip, IconButton, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import "../../css/CanvasEditor.css";

interface CanvasEditorProps {
	notebookPath: string;
	onSwitchNotebook: () => void;
}

interface NotebookItem {
	name: string;
	path: string;
	is_dir: boolean;
	children?: NotebookItem[] | null;
}

export function CanvasEditor({ notebookPath, onSwitchNotebook }: CanvasEditorProps) {
	const { settings } = useSettings();
	const { t } = useTranslation();
	const [isSettingsOpen, setIsSettingsOpen] = useState(false);

	// Active canvas path
	const [activeCanvasPath, setActiveCanvasPath] = useState<string | null>(() => {
		return localStorage.getItem(`active_canvas_path_${notebookPath}`);
	});

	const [notebookTree, setNotebookTree] = useState<NotebookItem[]>([]);
	const [blocks, setBlocks] = useState<IBlock[]>([]);
	const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
	const [isDockExpanded, setIsDockExpanded] = useState(true);

	const [links, setLinks] = useState<{ from: string; to: string }[]>([]);
	const [linkingSourceId, setLinkingSourceId] = useState<string | null>(null);
	const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
	const [hoveredLinkId, setHoveredLinkId] = useState<string | null>(null);
	const [isLoaded, setIsLoaded] = useState(false);

	// Context Menu State
	const [contextMenu, setContextMenu] = useState<{
		x: number;
		y: number;
		logicalX?: number;
		logicalY?: number;
		blockId: string;
	} | null>(null);

	const saveStateRef = useRef<(() => Promise<void>) | undefined>(undefined);

	useEffect(() => {
		saveStateRef.current = async () => {
			if (!activeCanvasPath || !isLoaded) return;
			const stateJson = serializeNotebookState();
			try {
				await invoke("save_notebook_state", { canvasPath: activeCanvasPath, stateJson });
				console.log("State auto-saved successfully on window close!");
			} catch (err) {
				console.error("Failed to save state on window close:", err);
			}
		};
	}, [blocks, links, activeCanvasPath, isLoaded]);

	useEffect(() => {
		let unlisten: (() => void) | undefined;

		const setupCloseListener = async () => {
			try {
				const appWindow = getCurrentWindow();
				unlisten = await appWindow.onCloseRequested(async (event) => {
					event.preventDefault();
					console.log("Close requested, auto-saving notes before exit...");
					if (saveStateRef.current) {
						await saveStateRef.current();
					}
					await appWindow.destroy();
				});
			} catch (err) {
				console.error("Failed to setup close listener:", err);
			}
		};

		setupCloseListener();

		return () => {
			if (unlisten) {
				unlisten();
			}
		};
	}, []);

	// Hook: Zoom and Pan
	const {
		zoom,
		setZoom,
		panOffset,
		zoomRef,
		panOffsetRef,
		handleZoomIn,
		handleZoomOut,
	} = useCanvasZoomPan();

	// Hook: Clipboard & Hotkeys (Copy, Cut, Paste, Delete)
	const {
		clipboard,
		handleCopy,
		handleCut,
		handlePaste,
	} = useCanvasClipboard({
		blocks,
		setBlocks,
		selectedBlockId,
		setSelectedBlockId,
		onDeleteBlock: (id) => handleDelete(id),
	});

	// Hook: Native and HTML file drops
	const {
		isDraggingFile,
		handleDropFile,
	} = useCanvasFileDrop({
		notebookPath,
		activeCanvasPath,
		panOffset,
		zoom,
		panOffsetRef,
		zoomRef,
		setBlocks,
	});

	// Normalize stored path to asset URL
	const normalizeContentUrl = (content: string): string => {
		if (!content) return content;
		if (content.startsWith("data:") || content.startsWith("blob:")) return content;
		if (content.startsWith("http://") || content.startsWith("https://")) return content;
		if (content.startsWith("asset://")) {
			try {
				const withoutScheme = content.replace(/^asset:\/\/[^/]*/, "");
				const absPath = decodeURIComponent(withoutScheme);
				if (absPath.startsWith("/")) {
					return convertFileSrc(absPath);
				}
				return content;
			} catch {
				return content;
			}
		}
		if (content.startsWith("/") || content.match(/^[A-Za-z]:\\/)) {
			return convertFileSrc(content);
		}
		return content;
	};

	// Deserialize blocks raw json representation to Models
	const deserializeBlocks = (rawBlocks: any[]): IBlock[] => {
		return rawBlocks.map((raw) => {
			const pos = raw.position || { x: 100, y: 150 };
			const sz = raw.size;
			const content = normalizeContentUrl(raw.content || "");
			const plugin = pluginRegistry.get(raw.type);
			let block: IBlock;

			if (plugin) {
				block = plugin.createModel({
					id: raw.id,
					content,
					position: pos,
					size: sz,
					metadata: {
						caption: raw.caption,
						fileName: raw.fileName,
						fileSize: raw.fileSize
					}
				});
			} else {
				const textPlugin = pluginRegistry.get("text")!;
				block = textPlugin.createModel({
					id: raw.id,
					content,
					position: pos,
					size: sz
				});
			}
			return block;
		});
	};

	// Convert asset URL to persistent file path for save
	const serializeContentForSave = (content: string): string => {
		if (!content) return content;
		if (content.startsWith("data:") || content.startsWith("blob:")) return content;
		if (content.startsWith("http://") || content.startsWith("https://")) return content;
		if (content.startsWith("asset://")) {
			try {
				const withoutScheme = content.replace(/^asset:\/\/[^/]*/, "");
				const absPath = decodeURIComponent(withoutScheme);
				if (absPath.startsWith("/")) return absPath;
				return content;
			} catch {
				return content;
			}
		}
		return content;
	};

	const serializeNotebookState = () => {
		return JSON.stringify({
			blocks: blocks.map((b) => {
				const serialized: any = {
					id: b.id,
					type: b.type,
					content: serializeContentForSave(b.content),
					position: b.position,
					size: b.size,
				};
				// Copy any other custom properties defined on the block model instance
				for (const key of Object.keys(b)) {
					if (!["id", "type", "content", "position", "size"].includes(key)) {
						serialized[key] = (b as any)[key];
					}
				}
				return serialized;
			}),
			links,
		}, null, 2);
	};

	const connectBlocks = (sourceId: string, targetId: string) => {
		const linkExists = links.some(
			(link) =>
				(link.from === sourceId && link.to === targetId) ||
				(link.from === targetId && link.to === sourceId)
		);
		if (!linkExists && sourceId !== targetId) {
			setLinks((prev) => [...prev, { from: sourceId, to: targetId }]);
		}
		setLinkingSourceId(null);
		setMousePos(null);
	};

	const handleExportNotebook = async () => {
		try {
			const stateJson = serializeNotebookState();
			const result = await invoke<string | null>("export_notebook", { stateJson });
			if (result) {
				alert(t("alertNotebookExported", { path: result }));
			}
		} catch (err) {
			console.error("Export failed:", err);
			alert(t("alertNotebookExportFailed"));
		}
	};

	// Fetch tree hierarchy
	const fetchTree = async () => {
		try {
			const tree = await invoke<NotebookItem[]>("get_notebook_tree", { notebookPath });
			setNotebookTree(tree);
			return tree;
		} catch (err) {
			console.error("Failed to load notebook tree:", err);
			return [];
		}
	};

	const findFirstCanvas = (items: NotebookItem[]): string | null => {
		for (const item of items) {
			if (!item.is_dir && item.path.endsWith(".json")) {
				return item.path;
			}
			if (item.is_dir && item.children) {
				const found = findFirstCanvas(item.children);
				if (found) return found;
			}
		}
		return null;
	};

	// Load tree on mount or notebook change
	useEffect(() => {
		const init = async () => {
			const tree = await fetchTree();
			const savedPath = localStorage.getItem(`active_canvas_path_${notebookPath}`);

			const checkExists = (items: NotebookItem[]): boolean => {
				for (const item of items) {
					if (item.path === savedPath) return true;
					if (item.is_dir && item.children && checkExists(item.children)) return true;
				}
				return false;
			};

			if (savedPath && checkExists(tree)) {
				setActiveCanvasPath(savedPath);
			} else {
				const first = findFirstCanvas(tree);
				if (first) {
					setActiveCanvasPath(first);
					localStorage.setItem(`active_canvas_path_${notebookPath}`, first);
				} else {
					try {
						await invoke("create_canvas_file", { parentPath: notebookPath, name: "plansza.json" });
						const updatedTree = await fetchTree();
						const newFirst = findFirstCanvas(updatedTree);
						if (newFirst) {
							setActiveCanvasPath(newFirst);
							localStorage.setItem(`active_canvas_path_${notebookPath}`, newFirst);
						}
					} catch (e) {
						console.error("Failed to create default canvas:", e);
						setActiveCanvasPath(null);
					}
				}
			}
		};
		init();
	}, [notebookPath]);

	// Load canvas state when active canvas changes
	useEffect(() => {
		if (!activeCanvasPath) {
			setBlocks([]);
			setLinks([]);
			setIsLoaded(true);
			return;
		}
		setIsLoaded(false);
		invoke<string | null>("load_notebook_state", { canvasPath: activeCanvasPath })
			.then((stateJson) => {
				if (stateJson) {
					try {
						const parsed = JSON.parse(stateJson);
						if (parsed.blocks) {
							setBlocks(deserializeBlocks(parsed.blocks));
						} else {
							setBlocks([]);
						}
						if (parsed.links) {
							setLinks(parsed.links);
						} else {
							setLinks([]);
						}
					} catch (e) {
						console.error("Failed to parse notebook state:", e);
						setBlocks([]);
						setLinks([]);
					}
				} else {
					setBlocks([]);
					setLinks([]);
				}
				setIsLoaded(true);
			})
			.catch((err) => {
				console.error("Failed to load notebook state from backend:", err);
				setBlocks([]);
				setLinks([]);
				setIsLoaded(true);
			});
	}, [activeCanvasPath]);

	// Auto-saving logic with dynamic debounce
	useEffect(() => {
		if (!isLoaded || !activeCanvasPath) return;

		const timer = setTimeout(() => {
			const stateJson = serializeNotebookState();
			invoke("save_notebook_state", { canvasPath: activeCanvasPath, stateJson })
				.catch((err) => {
					console.error("Autosave failed:", err);
				});
		}, settings.autosaveDelay || 800);

		return () => clearTimeout(timer);
	}, [blocks, links, activeCanvasPath, isLoaded, settings.autosaveDelay]);

	const saveCurrentState = async (canvasPathToSave: string | null) => {
		if (!canvasPathToSave || !isLoaded) return;
		const stateJson = serializeNotebookState();
		try {
			await invoke("save_notebook_state", { canvasPath: canvasPathToSave, stateJson });
			console.log("Canvas saved successfully:", canvasPathToSave);
		} catch (err) {
			console.error("Failed to save canvas state:", err);
		}
	};

	// Expose Canvas API for external plugins
	useEffect(() => {
		const canvasAPI = {
			addBlock: handleAddBlock,
			deleteBlock: handleDelete,
			updateBlockContent: handleContentChange,
			updateBlockMetadata: handleMetadataChange,
			updateBlockPosition: handleResize,
			getBlocks: () => blocks,
			getLinks: () => links,
			addLink: connectBlocks,
			removeLink: (sourceId: string, targetId: string) => {
				setLinks(prev => prev.filter(l => !(l.from === sourceId && l.to === targetId) && !(l.from === targetId && l.to === sourceId)));
			},
			setZoom,
			getZoom: () => zoom,
			panTo: (x: number, y: number) => {
				panOffsetRef.current = { x, y };
			},
			getPanOffset: () => panOffsetRef.current,
			getActiveCanvasPath: () => activeCanvasPath,
		};
		
		(window as any).CanvasNote = {
			...(window as any).CanvasNote,
			canvasAPI
		};

		return () => {
			if ((window as any).CanvasNote) {
				delete (window as any).CanvasNote.canvasAPI;
			}
		};
	}, [blocks, links, zoom, activeCanvasPath]);

	// Tree modification handlers
	const handleSelectCanvas = async (path: string) => {
		if (activeCanvasPath && activeCanvasPath !== path) {
			await saveCurrentState(activeCanvasPath);
		}
		setActiveCanvasPath(path);
		localStorage.setItem(`active_canvas_path_${notebookPath}`, path);
	};

	const handleCreateFolder = async (parentPath: string, name: string) => {
		try {
			await invoke("create_notebook_dir", { parentPath, name });
			await fetchTree();
		} catch (err) {
			console.error("Failed to create directory:", err);
			alert(`${t("errorCreateFolder")}: ${err}`);
		}
	};

	const handleCreateCanvas = async (parentPath: string, name: string) => {
		try {
			await invoke("create_canvas_file", { parentPath, name });
			const updatedTree = await fetchTree();
			if (!activeCanvasPath) {
				const first = findFirstCanvas(updatedTree);
				if (first) {
					handleSelectCanvas(first);
				}
			} else {
				const first = findFirstCanvas(updatedTree);
				if (first && !activeCanvasPath) {
					handleSelectCanvas(first);
				}
			}
		} catch (err) {
			console.error("Failed to create canvas:", err);
			alert(`${t("errorCreateCanvas")}: ${err}`);
		}
	};

	const handleRenameItem = async (oldPath: string, newPath: string) => {
		try {
			await invoke("rename_notebook_item", { oldPath, newPath });
			await fetchTree();
			if (activeCanvasPath === oldPath) {
				setActiveCanvasPath(newPath);
				localStorage.setItem(`active_canvas_path_${notebookPath}`, newPath);
			}
		} catch (err) {
			console.error("Failed to rename item:", err);
			alert(`${t("errorRename")}: ${err}`);
		}
	};

	const handleDeleteItem = async (path: string) => {
		if (!confirm(t("alertDeleteConfirm"))) {
			return;
		}
		try {
			await invoke("delete_notebook_item", { path });
			const updatedTree = await fetchTree();
			if (activeCanvasPath === path) {
				const first = findFirstCanvas(updatedTree);
				setActiveCanvasPath(first);
				if (first) {
					localStorage.setItem(`active_canvas_path_${notebookPath}`, first);
				} else {
					localStorage.removeItem(`active_canvas_path_${notebookPath}`);
				}
			}
		} catch (err) {
			console.error("Failed to delete item:", err);
			alert(`${t("errorDelete")}: ${err}`);
		}
	};

	const getFileName = (pathStr: string) => {
		const lastSlash = Math.max(pathStr.lastIndexOf("/"), pathStr.lastIndexOf("\\"));
		return lastSlash !== -1 ? pathStr.substring(lastSlash + 1) : pathStr;
	};

	const handleMoveItem = async (srcPath: string, destParentPath: string) => {
		try {
			await invoke("move_notebook_item", { srcPath, destParentPath });
			await fetchTree();

			if (activeCanvasPath) {
				if (activeCanvasPath === srcPath) {
					const name = getFileName(srcPath);
					const separator = destParentPath.includes("\\") ? "\\" : "/";
					const newPath = destParentPath.endsWith("/") || destParentPath.endsWith("\\")
						? `${destParentPath}${name}`
						: `${destParentPath}${separator}${name}`;
					setActiveCanvasPath(newPath);
					localStorage.setItem(`active_canvas_path_${notebookPath}`, newPath);
				} else if (activeCanvasPath.startsWith(srcPath + "/")) {
					const name = getFileName(srcPath);
					const separator = destParentPath.includes("\\") ? "\\" : "/";
					const newPath = activeCanvasPath.replace(srcPath,
						destParentPath.endsWith("/") || destParentPath.endsWith("\\")
							? `${destParentPath}${name}`
							: `${destParentPath}${separator}${name}`
					);
					setActiveCanvasPath(newPath);
					localStorage.setItem(`active_canvas_path_${notebookPath}`, newPath);
				}
			}
		} catch (err) {
			console.error("Failed to move item:", err);
			alert(`${t("errorMove")}: ${err}`);
		}
	};

	// Block manipulation handlers
	const handleResize = (
		id: string,
		newPosition: { x: number; y: number },
		newSize: { width: number; height: number },
	) => {
		invoke("update_block_position", {
			id,
			x: Math.round(newPosition.x),
			y: Math.round(newPosition.y),
		}).catch((err) => {
			console.error("Failed to update block position on backend:", err);
		});

		setBlocks((prev) =>
			prev.map((block) => {
				if (block.id === id) {
					block.position = newPosition;
					block.size = {
						...block.size,
						...newSize,
					};
					return Object.assign(
						Object.create(Object.getPrototypeOf(block)),
						block,
					);
				}
				return block;
			}),
		);
	};

	const handleContentChange = (id: string, newContent: string) => {
		setBlocks((prev) =>
			prev.map((block) => {
				if (block.id === id) {
					block.content = newContent;
					return Object.assign(
						Object.create(Object.getPrototypeOf(block)),
						block,
					);
				}
				return block;
			}),
		);
	};

	const handleMetadataChange = (id: string, key: string, val: any) => {
		setBlocks((prev) =>
			prev.map((block) => {
				if (block.id === id) {
					const updated = Object.assign(
						Object.create(Object.getPrototypeOf(block)),
						block,
					);
					updated[key] = val;
					return updated;
				}
				return block;
			}),
		);
	};

	const handleDelete = (id: string) => {
		invoke("delete_block", { id }).catch((err) => {
			console.error("Failed to delete block on backend:", err);
		});

		setBlocks((prev) => prev.filter((block) => block.id !== id));
		setLinks((prev) => prev.filter((link) => link.from !== id && link.to !== id));
		if (linkingSourceId === id) {
			setLinkingSourceId(null);
			setMousePos(null);
		}
	};

	// Unified block adding helper
	const handleAddBlock = (type: string, x?: number, y?: number) => {
		const pos =
			x !== undefined && y !== undefined
				? { x, y }
				: { x: 150 + Math.random() * 100, y: 150 + Math.random() * 100 };

		const plugin = pluginRegistry.get(type) || pluginRegistry.get("text")!;
		const newBlock = plugin.createModel({
			content: "",
			position: pos,
			size: plugin.defaultSize,
		});

		setBlocks((prev) => [...prev, newBlock]);
		setSelectedBlockId(newBlock.id);
		setContextMenu(null);
	};

	// Context Menu Helpers
	const handleContextMenu = (blockId: string, e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setSelectedBlockId(blockId);
		setContextMenu({
			x: e.clientX,
			y: e.clientY,
			blockId,
		});
	};

	const handleCanvasContextMenu = (e: React.MouseEvent) => {
		if (e.target !== e.currentTarget) return;
		e.preventDefault();
		setSelectedBlockId(null);
		const canvasEl = document.getElementById("canvas-area");
		const rect = canvasEl?.getBoundingClientRect();
		const relativeX = rect ? e.clientX - rect.left : e.clientX;
		const relativeY = rect ? e.clientY - rect.top : e.clientY;
		setContextMenu({
			x: e.clientX,
			y: e.clientY,
			logicalX: (relativeX - panOffset.x) / zoom,
			logicalY: (relativeY - panOffset.y) / zoom,
			blockId: "",
		});
	};

	useEffect(() => {
		const handleGlobalMouseDown = (e: MouseEvent) => {
			const menuElement = document.getElementById("context-menu");
			if (menuElement && menuElement.contains(e.target as Node)) {
				return;
			}
			setContextMenu(null);
		};
		window.addEventListener("mousedown", handleGlobalMouseDown, true);
		return () => {
			window.removeEventListener("mousedown", handleGlobalMouseDown, true);
		};
	}, []);

	const handleSwitchNotebookRequest = async () => {
		if (activeCanvasPath) {
			await saveCurrentState(activeCanvasPath);
		}
		onSwitchNotebook();
	};

	return (
		<div className="canvas-editor-container">
			{/* Sidebar Dock Component */}
			<SidebarDock
				isDockExpanded={isDockExpanded}
				onToggleDock={() => setIsDockExpanded(!isDockExpanded)}
				onSwitchNotebook={handleSwitchNotebookRequest}
				notebookPath={notebookPath}
				notebookTree={notebookTree}
				activeCanvasPath={activeCanvasPath}
				onSelectCanvas={handleSelectCanvas}
				onCreateFolder={handleCreateFolder}
				onCreateCanvas={handleCreateCanvas}
				onRenameItem={handleRenameItem}
				onDeleteItem={handleDeleteItem}
				onMoveItem={handleMoveItem}
				onExportNotebook={handleExportNotebook}
				onOpenSettings={() => setIsSettingsOpen(true)}
			/>

			{/* Canvas Area */}
			<div
				id="canvas-area"
				onMouseDown={(e) => {
					if (e.button !== 1 && e.target === e.currentTarget) {
						setSelectedBlockId(null);
						setLinkingSourceId(null);
						setMousePos(null);
					}
				}}
				onMouseMove={(e) => {
					if (linkingSourceId) {
						const rect = e.currentTarget.getBoundingClientRect();
						setMousePos({
							x: e.clientX - rect.left,
							y: e.clientY - rect.top,
						});
					}
				}}
				onDragOver={(e) => {
					if (activeCanvasPath && e.dataTransfer.types.includes("Files")) {
						e.preventDefault();
						e.stopPropagation();
					}
				}}
				onDrop={activeCanvasPath ? handleDropFile : undefined}
				onContextMenu={activeCanvasPath ? handleCanvasContextMenu : (e) => e.preventDefault()}
				className={`canvas-editor-area ${isDockExpanded ? "dock-expanded" : "dock-collapsed"} ${settings.showGrid ? "show-grid" : ""} ${settings.showGrid && settings.gridStyle === "lines" ? "grid-style-lines" : ""}`}
			>
				{!activeCanvasPath ? (
					<CanvasEmptyState
						notebookPath={notebookPath}
						onCreateCanvas={handleCreateCanvas}
					/>
				) : (
					<>
						{/* Top Bar for Plugins */}
						<TopBar onAddBlock={handleAddBlock} />

						{/* Drag & Drop File Overlay */}
						{isDraggingFile && (
							<div className="canvas-drag-overlay">
								<Paper elevation={6} className="canvas-drag-paper">
									<div className="canvas-drag-icon-wrapper">
										<svg
											width="32"
											height="32"
											viewBox="0 0 24 24"
											fill="none"
											stroke="#6366f1"
											strokeWidth="2.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
											<polyline points="17 8 12 3 7 8" />
											<line x1="12" y1="3" x2="12" y2="15" />
										</svg>
									</div>
									<Typography variant="h6" style={{ fontWeight: 600, color: "#1e293b" }}>
										{t("dragOverlayTitle")}
									</Typography>
									<Typography variant="body2" style={{ color: "#64748b" }}>
										{t("dragOverlayDesc")}
									</Typography>
								</Paper>
							</div>
						)}

						{/* Scalable Canvas Content Container */}
						<div
							style={{
								transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
								transformOrigin: "top left",
								width: `${100 / zoom}%`,
								height: `${100 / zoom}%`,
								position: "absolute",
								top: 0,
								left: 0,
								pointerEvents: "none",
							}}
						>
							<div
								style={{
									width: "100%",
									height: "100%",
									position: "relative",
									pointerEvents: "all",
								}}
								onMouseDown={(e) => {
									if (e.button !== 1 && e.target === e.currentTarget) {
										setSelectedBlockId(null);
										setLinkingSourceId(null);
										setMousePos(null);
									}
								}}
							>
								{/* Connections Layer */}
								<ConnectionsLayer
									blocks={blocks}
									links={links}
									linkingSourceId={linkingSourceId}
									mousePos={mousePos}
									hoveredLinkId={hoveredLinkId}
									setHoveredLinkId={setHoveredLinkId}
									onDeleteLink={(linkId) => {
										setLinks((prev) => prev.filter((l) => `${l.from}-${l.to}` !== linkId));
									}}
								/>

								{/* Blocks */}
								{blocks.map((block) => (
									<Resizable
										key={block.id}
										position={block.position}
										size={block.size}
										zoom={zoom}
										isSelected={selectedBlockId === block.id}
										isLinkingSource={linkingSourceId === block.id}
										onSelect={() => {
											if (linkingSourceId) {
												if (linkingSourceId !== block.id) {
													connectBlocks(linkingSourceId, block.id);
												}
											} else {
												setSelectedBlockId(block.id);
											}
										}}
										onResize={(pos, sz) => handleResize(block.id, pos, sz)}
										onDelete={() => handleDelete(block.id)}
										onContextMenu={(e) => handleContextMenu(block.id, e)}
									>
										{(() => {
											const plugin = pluginRegistry.get(block.type);
											if (plugin) {
												return plugin.renderBlock({
													block,
													isSelected: selectedBlockId === block.id,
													zoom,
													onChangeContent: (val) => handleContentChange(block.id, val),
													onChangeMetadata: (key, val) => handleMetadataChange(block.id, key, val),
												});
											}
											return <div style={{ padding: 12 }}>Unknown block type: {block.type}</div>;
										})()}
									</Resizable>
								))}
							</div>
						</div>

						{/* Floating Helper Banner for Linking Mode */}
						{linkingSourceId && (
							<Paper elevation={4} className="canvas-linking-banner">
								<Typography variant="body2" sx={{ fontWeight: 500, color: "#1e293b" }}>
									{t("linkingBanner")}
								</Typography>
								<Button
									size="small"
									variant="outlined"
									color="primary"
									onClick={(e) => {
										e.stopPropagation();
										setLinkingSourceId(null);
										setMousePos(null);
									}}
									sx={{
										borderRadius: "20px",
										textTransform: "none",
										py: 0.2,
										px: 1.5,
										borderColor: "#6366f1",
										color: "#6366f1",
										"&:hover": {
											backgroundColor: "rgba(99, 102, 241, 0.08)",
											borderColor: "#4f46e5",
										}
									}}
								>
									{t("linkingBannerCancel")}
								</Button>
							</Paper>
						)}

						{/* Zoom Controls Pill */}
						<Paper elevation={3} className="canvas-zoom-pill">
							<Tooltip title={t("zoomOut")}>
								<IconButton size="small" onClick={handleZoomOut} style={{ color: "#64748b" }}>
									<RemoveIcon fontSize="small" />
								</IconButton>
							</Tooltip>

							<Tooltip title={t("zoomReset")}>
								<Button
									size="small"
									onClick={() => setZoom(1.0)}
									style={{
										minWidth: "48px",
										fontSize: "12px",
										fontWeight: 600,
										color: "#475569",
										textTransform: "none",
										padding: "2px 6px",
									}}
								>
									{Math.round(zoom * 100)}%
								</Button>
							</Tooltip>

							<Tooltip title={t("zoomIn")}>
								<IconButton size="small" onClick={handleZoomIn} style={{ color: "#64748b" }}>
									<AddIcon fontSize="small" />
								</IconButton>
							</Tooltip>
						</Paper>

						{/* Canvas Minimap */}
						{settings.showMinimap && (
							<CanvasMinimap
								blocks={blocks}
								zoom={zoom}
								links={links}
								panOffset={panOffset}
							/>
						)}
					</>
				)}
			</div>

			{/* Custom Context Menu */}
			{contextMenu && (
				<CanvasContextMenu
					contextMenu={contextMenu}
					clipboard={clipboard}
					linkingSourceId={linkingSourceId}
					links={links}
					onCopy={handleCopy}
					onCut={handleCut}
					onPaste={handlePaste}
					onStartLink={(blockId) => setLinkingSourceId(blockId)}
					onCancelLink={() => {
						setLinkingSourceId(null);
						setMousePos(null);
					}}
					onConnect={(targetId) => {
						if (linkingSourceId) {
							connectBlocks(linkingSourceId, targetId);
						}
					}}
					onRemoveAllLinks={(blockId) => {
						setLinks((prev) => prev.filter((l) => l.from !== blockId && l.to !== blockId));
					}}
					onDelete={handleDelete}
					onAddBlock={handleAddBlock}
				/>
			)}

			{/* Settings Dialog */}
			<SettingsDialog
				open={isSettingsOpen}
				onClose={() => setIsSettingsOpen(false)}
				onClearRecents={fetchTree}
			/>
		</div>
	);
}

export default CanvasEditor;
