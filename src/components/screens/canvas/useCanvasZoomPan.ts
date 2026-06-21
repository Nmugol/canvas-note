import { useState, useEffect, useRef, useCallback } from "react";

export function useCanvasZoomPan() {
	const [zoom, setZoom] = useState(1);
	const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

	const zoomRef = useRef(1);
	const panOffsetRef = useRef({ x: 0, y: 0 });

	useEffect(() => {
		zoomRef.current = zoom;
		panOffsetRef.current = panOffset;
	}, [zoom, panOffset]);

	const isPanningRef = useRef(false);
	const startPanMousePosRef = useRef({ x: 0, y: 0 });
	const startPanOffsetRef = useRef({ x: 0, y: 0 });

	const zoomAtCenter = useCallback((factor: number) => {
		const canvasEl = document.getElementById("canvas-area");
		if (!canvasEl) return;
		const rect = canvasEl.getBoundingClientRect();
		const mx = rect.width / 2;
		const my = rect.height / 2;

		setZoom((prevZoom) => {
			const newZoom = Math.max(0.5, Math.min(2.0, prevZoom + factor));
			if (newZoom === prevZoom) return prevZoom;

			setPanOffset((prevPan) => {
				const cx = (mx - prevPan.x) / prevZoom;
				const cy = (my - prevPan.y) / prevZoom;
				return {
					x: mx - cx * newZoom,
					y: my - cy * newZoom,
				};
			});
			return newZoom;
		});
	}, []);

	const handleZoomIn = useCallback(() => {
		zoomAtCenter(0.1);
	}, [zoomAtCenter]);

	const handleZoomOut = useCallback(() => {
		zoomAtCenter(-0.1);
	}, [zoomAtCenter]);

	// Global keyboard, wheel listeners for canvas zooming, and middle mouse dragging
	useEffect(() => {
		const handleWheelGlobal = (e: WheelEvent) => {
			const canvasEl = document.getElementById("canvas-area");
			if (!canvasEl || !canvasEl.contains(e.target as Node)) return;

			e.preventDefault();

			const zoomFactor = 0.05;
			const delta = e.deltaY < 0 ? zoomFactor : -zoomFactor;

			setZoom((prevZoom) => {
				const newZoom = Math.max(0.5, Math.min(2.0, prevZoom + delta));
				if (newZoom === prevZoom) return prevZoom;

				// Adjust panOffset to zoom into cursor
				const rect = canvasEl.getBoundingClientRect();
				const mx = e.clientX - rect.left;
				const my = e.clientY - rect.top;

				setPanOffset((prevPan) => {
					const cx = (mx - prevPan.x) / prevZoom;
					const cy = (my - prevPan.y) / prevZoom;
					return {
						x: mx - cx * newZoom,
						y: my - cy * newZoom,
					};
				});

				return newZoom;
			});
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.ctrlKey) {
				if (e.key === "=" || e.key === "+") {
					e.preventDefault();
					zoomAtCenter(0.1);
				} else if (e.key === "-") {
					e.preventDefault();
					zoomAtCenter(-0.1);
				} else if (e.key === "0") {
					e.preventDefault();
					setZoom(1.0);
					setPanOffset({ x: 0, y: 0 });
				}
			}
		};

		const handleMouseDownGlobal = (e: MouseEvent) => {
			const canvasEl = document.getElementById("canvas-area");
			if (!canvasEl || !canvasEl.contains(e.target as Node)) return;

			if (e.button === 1) { // Middle click / scroll click
				e.preventDefault();
				isPanningRef.current = true;
				startPanMousePosRef.current = { x: e.clientX, y: e.clientY };
				startPanOffsetRef.current = { ...panOffsetRef.current };
				document.body.style.cursor = "grabbing";
			}
		};

		const handleMouseMoveGlobal = (e: MouseEvent) => {
			if (isPanningRef.current) {
				const dx = e.clientX - startPanMousePosRef.current.x;
				const dy = e.clientY - startPanMousePosRef.current.y;
				setPanOffset({
					x: startPanOffsetRef.current.x + dx,
					y: startPanOffsetRef.current.y + dy,
				});
			}
		};

		const handleMouseUpGlobal = (e: MouseEvent) => {
			if (e.button === 1 && isPanningRef.current) {
				isPanningRef.current = false;
				document.body.style.cursor = "";
			}
		};

		window.addEventListener("wheel", handleWheelGlobal, { passive: false });
		window.addEventListener("keydown", handleKeyDown);
		window.addEventListener("mousedown", handleMouseDownGlobal, { passive: false });
		window.addEventListener("mousemove", handleMouseMoveGlobal);
		window.addEventListener("mouseup", handleMouseUpGlobal);

		return () => {
			window.removeEventListener("wheel", handleWheelGlobal);
			window.removeEventListener("keydown", handleKeyDown);
			window.removeEventListener("mousedown", handleMouseDownGlobal);
			window.removeEventListener("mousemove", handleMouseMoveGlobal);
			window.removeEventListener("mouseup", handleMouseUpGlobal);
			document.body.style.cursor = "";
		};
	}, [zoomAtCenter]);

	return {
		zoom,
		setZoom,
		panOffset,
		setPanOffset,
		zoomRef,
		panOffsetRef,
		handleZoomIn,
		handleZoomOut,
	};
}
