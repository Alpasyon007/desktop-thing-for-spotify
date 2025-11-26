import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
	on: (channel: string, callback: (...args: unknown[]) => void) => {
		ipcRenderer.on(channel, callback);
	},
	send: (channel: string, args: unknown) => {
		ipcRenderer.send(channel, args);
	},
	// Window controls
	windowMinimize: () => ipcRenderer.invoke("window-minimize"),
	windowMaximize: () => ipcRenderer.invoke("window-maximize"),
	windowClose: () => ipcRenderer.invoke("window-close"),
	windowIsMaximized: () => ipcRenderer.invoke("window-is-maximized"),
	showContextMenu: (currentView: string) => ipcRenderer.invoke("show-context-menu", currentView),
	isWindows: () => process.platform === "win32",
	isDarwin: () => process.platform === "darwin",
	// External URL opening
	openExternal: (url: string) => ipcRenderer.invoke("open-external", url),
	// Spotify token management
	setSpotifyTokens: (tokens: { accessToken: string; refreshToken: string }) => ipcRenderer.invoke("set-spotify-tokens", tokens),
	getSpotifyTokens: () => ipcRenderer.invoke("get-spotify-tokens"),
	clearSpotifyTokens: () => ipcRenderer.invoke("clear-spotify-tokens"),
	// Code verifier management for PKCE
	setCodeVerifier: (codeVerifier: string) => ipcRenderer.invoke("set-code-verifier", codeVerifier),
	getCodeVerifier: () => ipcRenderer.invoke("get-code-verifier"),
	clearCodeVerifier: () => ipcRenderer.invoke("clear-code-verifier"),
	// OAuth callback handler
	handleOAuthCallback: (code: string, state?: string) => ipcRenderer.invoke("handle-oauth-callback", code, state),
	// Get pending auth code
	getPendingAuth: () => ipcRenderer.invoke("get-pending-auth"),
	// Custom window dragging
	windowDragStart: (coordinates: { x: number; y: number }) => ipcRenderer.invoke("window-drag-start", coordinates),
	windowDragMove: (data: { mouseX: number; mouseY: number; startData: any }) => ipcRenderer.invoke("window-drag-move", data)
	// Note: windowDragEnd is handled via the generic 'send' method above
});
