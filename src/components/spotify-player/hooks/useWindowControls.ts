"use client";

import { useEffect, useState } from "react";

export function useWindowControls(currentView: string = "playlists") {
	const [isMaximized, setIsMaximized] = useState(false);
	const [isElectron, setIsElectron] = useState(false);
	const [contextMenuOpen, setContextMenuOpen] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
	const [showDragHandle, setShowDragHandle] = useState(false); // Drag handle hidden by default

	useEffect(() => {
		// Check if running in Electron
		setIsElectron(typeof window !== "undefined" && !!window.electronAPI);

		if (window.electronAPI) {
			// Check initial maximized state
			window.electronAPI.windowIsMaximized().then(setIsMaximized);

			// Listen for toggle drag handle event from main process
			window.electronAPI.on("toggle-drag-handle", () => {
				setShowDragHandle((prev) => !prev);
			});
		}
	}, []);

	// Handle global context menu events - triggers native Electron menu via IPC
	// This works with drag regions because we're not using React event handlers!
	useEffect(() => {
		const handleGlobalContextMenu = (e: MouseEvent) => {
			// Prevent default browser context menu
			e.preventDefault();

			// Show native Electron context menu via IPC
			if (window.electronAPI) {
				window.electronAPI.showContextMenu(currentView);
			}
		};

		document.addEventListener("contextmenu", handleGlobalContextMenu);

		return () => {
			document.removeEventListener("contextmenu", handleGlobalContextMenu);
		};
	}, [currentView]);

	// Handle clicks outside context menu
	useEffect(() => {
		const handleClickOutside = () => {
			if (contextMenuOpen) {
				setContextMenuOpen(false);
			}
		};

		if (contextMenuOpen) {
			document.addEventListener("click", handleClickOutside);
			document.addEventListener("contextmenu", handleClickOutside);
		}

		return () => {
			document.removeEventListener("click", handleClickOutside);
			document.removeEventListener("contextmenu", handleClickOutside);
		};
	}, [contextMenuOpen]);

	// Native drag region styles for Electron
	// Default is now NO-DRAG - only specific drag handle will be draggable
	const getDragStyle = (isDragRegion: boolean = false) => {
		return {
			WebkitAppRegion: isDragRegion ? "drag" : "no-drag"
		} as React.CSSProperties;
	};

	const getContainerStyle = (isDragRegion: boolean = false) => {
		return getDragStyle(isDragRegion);
	};

	const handleMinimize = async () => {
		if (window.electronAPI) {
			await window.electronAPI.windowMinimize();
		}
	};

	const handleMaximize = async () => {
		if (window.electronAPI) {
			await window.electronAPI.windowMaximize();
			const maximized = await window.electronAPI.windowIsMaximized();
			setIsMaximized(maximized);
		}
	};

	const handleClose = async () => {
		if (window.electronAPI) {
			await window.electronAPI.windowClose();
		}
	};

	const handleCloseContextMenu = () => {
		setContextMenuOpen(false);
	};

	const toggleDragHandle = () => {
		setShowDragHandle(!showDragHandle);
	};

	return {
		isMaximized,
		isElectron,
		contextMenuOpen,
		contextMenuPosition,
		showDragHandle,
		getDragStyle,
		getContainerStyle,
		handleMinimize,
		handleMaximize,
		handleClose,
		handleCloseContextMenu,
		toggleDragHandle
	};
}
