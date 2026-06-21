import React, { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button, Paper, Typography, Divider } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder";
import "../../css/NotebookSelector.css";

interface NotebookSelectorProps {
	onSelectNotebook: (path: string) => void;
}

export const NotebookSelector: React.FC<NotebookSelectorProps> = ({
	onSelectNotebook,
}) => {
	const [selectedPath, setSelectedPath] = useState<string | null>(null);
	const [newFolderName, setNewFolderName] = useState<string>("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	// Load recent notebooks list from localStorage on mount
	const [recentNotebooks, setRecentNotebooks] = useState<string[]>(() => {
		const stored = localStorage.getItem("canvas_recent_notebooks");
		return stored ? JSON.parse(stored) : [];
	});

	const handleChooseFolder = async () => {
		setError(null);
		try {
			// Trigger Rust native directory chooser dialog
			const folderPath = await invoke<string | null>("select_notebook");
			if (!folderPath) {
				return;
			}
			setSelectedPath(folderPath);
		} catch (err) {
			console.error("Failed to select notebook path:", err);
			setError("Wystąpił błąd podczas otwierania dialogu katalogu.");
		}
	};

	const saveToRecents = (path: string) => {
		let recents = [...recentNotebooks];
		recents = recents.filter((r) => r !== path);
		recents.unshift(path);
		recents = recents.slice(0, 5); // Keep last 5 notebooks
		setRecentNotebooks(recents);
		localStorage.setItem("canvas_recent_notebooks", JSON.stringify(recents));
	};

	const handleConfirmNotebook = async () => {
		if (!selectedPath) return;
		setError(null);
		setLoading(true);
		try {
			// Append new folder name if specified
			let finalPath = selectedPath;
			const trimmedFolderName = newFolderName.trim();
			if (trimmedFolderName) {
				finalPath = `${selectedPath}/${trimmedFolderName}`;
			}

			// Initialize the notebook (creates the directory and its "files" subdirectory)
			await invoke<string>("initialize_notebook", { notebookPath: finalPath });

			// Save folder path to localStorage for active persistence
			localStorage.setItem("canvas_notebook_path", finalPath);

			// Add to recently opened notebooks list
			saveToRecents(finalPath);

			// Call parent selection trigger
			onSelectNotebook(finalPath);
		} catch (err) {
			console.error("Failed to select or initialize notebook:", err);
			setError(
				typeof err === "string"
					? err
					: "Wystąpił błąd podczas inicjalizacji notatnika. Spróbuj wybrać inny katalog."
			);
			setLoading(false);
		}
	};

	const handleOpenRecent = async (path: string) => {
		setError(null);
		setLoading(true);
		try {
			// Initialize directory to ensure "files" exists
			await invoke<string>("initialize_notebook", { notebookPath: path });

			// Save active directory path
			localStorage.setItem("canvas_notebook_path", path);

			// Move to the top of recent notebooks
			saveToRecents(path);

			onSelectNotebook(path);
		} catch (err) {
			console.error("Failed to open recent notebook:", err);
			setError("Nie udało się otworzyć wybranego notatnika. Wybrany katalog mógł zostać usunięty lub przeniesiony.");
			setLoading(false);
		}
	};

	const handleCancelSelection = () => {
		setSelectedPath(null);
		setNewFolderName("");
		setError(null);
	};

	const getFolderName = (path: string) => {
		const parts = path.split(/[/\\]/);
		return parts[parts.length - 1] || path;
	};

	return (
		<div className="notebook-selector-container">
			<Paper
				elevation={0}
				className="notebook-selector-card"
			>
				{/* Folder Accent Icon */}
				<div className={`icon-accent ${selectedPath ? "selected" : "default"}`}>
					{selectedPath ? (
						<CreateNewFolderIcon className="icon" />
					) : (
						<FolderOpenIcon className="icon" />
					)}
				</div>

				<Typography
					variant="h5"
					className="notebook-selector-title"
				>
					Canvas Note
				</Typography>

				{error && (
					<div className="error-message">
						{error}
					</div>
				)}

				{!selectedPath ? (
					// STEP 1: Select base directory & Show recents
					<>
						<Typography
							variant="body2"
							className="notebook-selector-description"
						>
							Wybierz lokalizację na swoim komputerze, która będzie bazą notatnika.
							Wszystkie notatki, relacje oraz załączone pliki będą w niej bezpiecznie przechowywane.
							W wybranym folderze automatycznie utworzy się katalog <code>files</code> dla podrzucanych multimediów.
						</Typography>

						<Button
							variant="contained"
							onClick={handleChooseFolder}
							disabled={loading}
							className="btn-choose-folder"
						>
							Wybierz katalog notatnika
						</Button>

						{/* Recent Notebooks List */}
						{recentNotebooks.length > 0 && (
							<>
								<Divider className="recents-divider" />

								<div className="recents-container">
									<Typography
										variant="caption"
										className="recents-title"
									>
										Ostatnio otwierane notatniki:
									</Typography>
									<div className="recents-list">
										{recentNotebooks.map((path) => (
											<Paper
												key={path}
												elevation={0}
												onClick={() => handleOpenRecent(path)}
												className="recent-item-card"
											>
												<div className="recent-item-content">
													<FolderOpenIcon className="recent-item-icon" />
													<div className="recent-item-info">
														<Typography
															variant="body2"
															className="recent-item-name"
														>
															{getFolderName(path)}
														</Typography>
														<Typography
															variant="caption"
															className="recent-item-path"
															title={path}
														>
															{path}
														</Typography>
													</div>
												</div>
												{/* Clear from recents list button */}
												<button
													onClick={(e) => {
														e.stopPropagation(); // Avoid triggering row click
														const updated = recentNotebooks.filter((p) => p !== path);
														setRecentNotebooks(updated);
														localStorage.setItem("canvas_recent_notebooks", JSON.stringify(updated));
													}}
													className="btn-remove-recent"
													title="Usuń z listy"
												>
													<svg
														width="14"
														height="14"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														strokeWidth="2.5"
														strokeLinecap="round"
														strokeLinejoin="round"
													>
														<line x1="18" y1="6" x2="6" y2="18" />
														<line x1="6" y1="6" x2="18" y2="18" />
													</svg>
												</button>
											</Paper>
										))}
									</div>
								</div>
							</>
						)}
					</>
				) : (
					// STEP 2: Custom Directory Name / Creation Form
					<>
						<Typography
							variant="body2"
							className="notebook-selector-description"
						>
							Wybrano lokalizację bazową. Możesz wpisać nazwę nowego folderu, który zostanie w niej automatycznie utworzony jako Twój notatnik.
						</Typography>

						{/* Folder Name Input */}
						<div className="input-container">
							<label className="input-label">
								Nazwa nowego folderu (opcjonalnie):
							</label>
							<input
								type="text"
								value={newFolderName}
								onChange={(e) => setNewFolderName(e.target.value)}
								placeholder="np. Mój Nowy Notatnik"
								className="folder-name-input"
							/>
						</div>

						{/* Dynamic Path Preview Box */}
						<div className="path-preview-box">
							<div className="path-preview-title">
								Ścieżka docelowa:
							</div>
							<code className="path-preview-code">
								{selectedPath}
								{newFolderName.trim() ? `/${newFolderName.trim()}` : ""}
							</code>
						</div>

						<div className="action-buttons-container">
							<Button
								variant="outlined"
								onClick={handleCancelSelection}
								disabled={loading}
								className="btn-back"
							>
								Wróć
							</Button>

							<Button
								variant="contained"
								onClick={handleConfirmNotebook}
								disabled={loading}
								className="btn-confirm"
							>
								{loading ? "Tworzenie..." : "Zatwierdź i otwórz"}
							</Button>
						</div>
					</>
				)}
			</Paper>
		</div>
	);
};

export default NotebookSelector;
