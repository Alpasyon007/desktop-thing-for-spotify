"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld("electronAPI", {
    on: (channel, callback) => {
        electron_1.ipcRenderer.on(channel, callback);
    },
    send: (channel, args) => {
        electron_1.ipcRenderer.send(channel, args);
    },
    // Window controls
    windowMinimize: () => electron_1.ipcRenderer.invoke("window-minimize"),
    windowMaximize: () => electron_1.ipcRenderer.invoke("window-maximize"),
    windowClose: () => electron_1.ipcRenderer.invoke("window-close"),
    windowIsMaximized: () => electron_1.ipcRenderer.invoke("window-is-maximized"),
    isWindows: () => process.platform === "win32",
    isDarwin: () => process.platform === "darwin",
    // External URL opening
    openExternal: (url) => electron_1.ipcRenderer.invoke("open-external", url),
    // Spotify token management
    setSpotifyTokens: (tokens) => electron_1.ipcRenderer.invoke("set-spotify-tokens", tokens),
    getSpotifyTokens: () => electron_1.ipcRenderer.invoke("get-spotify-tokens"),
    clearSpotifyTokens: () => electron_1.ipcRenderer.invoke("clear-spotify-tokens"),
    // Code verifier management for PKCE
    setCodeVerifier: (codeVerifier) => electron_1.ipcRenderer.invoke("set-code-verifier", codeVerifier),
    getCodeVerifier: () => electron_1.ipcRenderer.invoke("get-code-verifier"),
    clearCodeVerifier: () => electron_1.ipcRenderer.invoke("clear-code-verifier"),
    // OAuth callback handler
    handleOAuthCallback: (code, state) => electron_1.ipcRenderer.invoke("handle-oauth-callback", code, state),
    // Get pending auth code
    getPendingAuth: () => electron_1.ipcRenderer.invoke("get-pending-auth"),
    // Custom window dragging
    windowDragStart: (coordinates) => electron_1.ipcRenderer.invoke("window-drag-start", coordinates),
    windowDragMove: (data) => electron_1.ipcRenderer.invoke("window-drag-move", data),
    // Note: windowDragEnd is handled via the generic 'send' method above
});
