import { useState } from "react";
import CanvasEditor from "./components/screens/CanvasEditor";
import NotebookSelector from "./components/screens/NotebookSelector";

export function App() {
	// Try loading previously selected notebook path from localStorage on startup
	const [notebookPath, setNotebookPath] = useState<string | null>(
		localStorage.getItem("canvas_notebook_path")
	);

	const handleSelectNotebook = (path: string) => {
		setNotebookPath(path);
	};

	const handleSwitchNotebook = () => {
		// Clear local storage and state to prompt for new selector screen
		localStorage.removeItem("canvas_notebook_path");
		setNotebookPath(null);
	};

	if (!notebookPath) {
		return <NotebookSelector onSelectNotebook={handleSelectNotebook} />;
	}

	return (
		<CanvasEditor
			notebookPath={notebookPath}
			onSwitchNotebook={handleSwitchNotebook}
		/>
	);
}

export default App;
