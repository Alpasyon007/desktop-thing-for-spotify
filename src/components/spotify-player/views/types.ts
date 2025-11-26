export interface WindowControls {
	isMaximized: boolean;
	isElectron: boolean;
	contextMenuOpen: boolean;
	contextMenuPosition: { x: number; y: number };
	showDragHandle: boolean;
	getDragStyle: (isDragRegion?: boolean) => React.CSSProperties;
	getContainerStyle: (isDragRegion?: boolean) => React.CSSProperties;
	handleMinimize: () => void;
	handleMaximize: () => void;
	handleClose: () => void;
	handleCloseContextMenu: () => void;
	toggleDragHandle: () => void;
}
