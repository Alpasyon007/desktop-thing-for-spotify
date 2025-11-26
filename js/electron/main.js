"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const electron_serve_1 = __importDefault(require("electron-serve"));
const fs_1 = __importDefault(require("fs"));
const http_1 = require("http");
const path_1 = __importDefault(require("path"));
const appServe = electron_1.app.isPackaged
    ? (0, electron_serve_1.default)({
        directory: path_1.default.join(__dirname, "../../out")
    })
    : null;
console.log("App packaged:", electron_1.app.isPackaged);
console.log("__dirname:", __dirname);
if (electron_1.app.isPackaged) {
    const outPath = path_1.default.join(__dirname, "../../out");
    console.log("Out directory path:", outPath);
    console.log("appServe created:", !!appServe);
}
// Store Spotify tokens in memory (shared between browser and Electron app)
let spotifyTokens = null;
let spotifyCodeVerifier = null;
let pendingAuthData = null;
// Simple HTTP server to receive tokens from browser
let tokenServer = null;
const startTokenServer = () => {
    tokenServer = (0, http_1.createServer)((req, res) => {
        // Enable CORS
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        if (req.method === "OPTIONS") {
            res.writeHead(200);
            res.end();
            return;
        }
        if (req.method === "POST" && req.url === "/spotify-tokens") {
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString();
            });
            req.on("end", () => {
                try {
                    const tokens = JSON.parse(body);
                    spotifyTokens = tokens;
                    console.log("Tokens received from browser:", tokens);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ success: true }));
                }
                catch (error) {
                    console.error("Error parsing tokens:", error);
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Invalid JSON" }));
                }
            });
        }
        else if (req.method === "POST" && req.url === "/handle-auth") {
            // Handle OAuth code processing
            let body = "";
            req.on("data", (chunk) => {
                body += chunk.toString();
            });
            req.on("end", async () => {
                try {
                    const { code, state } = JSON.parse(body);
                    console.log("Processing OAuth code:", { code: !!code, state: !!state });
                    // Store the code and state temporarily so the Electron app can pick them up
                    pendingAuthData = { authCode: code, authState: state };
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ success: true }));
                }
                catch (error) {
                    console.error("Error processing auth code:", error);
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Invalid request" }));
                }
            });
        }
        else if (req.method === "GET" && req.url?.startsWith("/callback")) {
            // Handle Spotify OAuth callback
            const url = new URL(req.url, `http://127.0.0.1:3004`);
            const code = url.searchParams.get("code");
            const state = url.searchParams.get("state");
            const error = url.searchParams.get("error");
            console.log("OAuth callback received:", { code: !!code, state: !!state, error });
            // Return a beautifully styled HTML page that matches the app's login screen
            const callbackHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Spotify Desktop Authentication</title>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
              background: linear-gradient(135deg, #065f46 0%, #047857 50%, #065f46 100%);
              color: white;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }

            .container {
              text-align: center;
              space-y: 24px;
              max-width: 400px;
              padding: 32px;
            }

            .spotify-icon {
              width: 96px;
              height: 96px;
              margin: 0 auto 24px;
              fill: #10b981;
              animation: pulse 2s infinite;
            }

            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.7; }
            }

            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }

            .spinning {
              animation: spin 1s linear infinite;
            }

            h1 {
              font-size: 48px;
              font-weight: bold;
              margin-bottom: 16px;
              background: linear-gradient(45deg, #ffffff, #d1fae5);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
            }

            .status {
              font-size: 18px;
              color: #d1fae5;
              max-width: 384px;
              margin: 0 auto 32px;
              line-height: 1.6;
            }

            .success {
              color: #34d399;
              font-weight: 600;
            }

            .error {
              color: #f87171;
              font-weight: 600;
            }

            .processing {
              color: #fbbf24;
              font-weight: 600;
            }

            .fade-in {
              animation: fadeIn 0.5s ease-in;
            }

            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="spotify-icon" id="icon">
              <svg viewBox="0 0 496 512">
                <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/>
              </svg>
            </div>
            <h1>Spotify Authentication</h1>
            <p class="status" id="status">Processing authentication...</p>
          </div>
          <script>
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            const error = urlParams.get('error');

            const statusEl = document.getElementById('status');
            const iconEl = document.getElementById('icon');

            function updateStatus(message, className = '') {
              statusEl.innerHTML = message;
              statusEl.className = 'status fade-in ' + className;
            }

            if (error) {
              iconEl.style.fill = '#f87171';
              updateStatus('Authentication failed: ' + error, 'error');
            } else if (code) {
              iconEl.classList.add('spinning');
              updateStatus('Authentication successful! Processing tokens...', 'processing');

              // Send tokens to the Electron app
              fetch('http://127.0.0.1:3004/handle-auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, state })
              }).then(response => response.json()).then(result => {
                iconEl.classList.remove('spinning');
                if (result.success) {
                  iconEl.style.fill = '#34d399';
                  updateStatus('Success! Tokens processed. You can close this window.', 'success');
                  setTimeout(() => window.close(), 3000);
                } else {
                  iconEl.style.fill = '#f87171';
                  updateStatus('Error: ' + result.error, 'error');
                }
              }).catch(err => {
                iconEl.classList.remove('spinning');
                iconEl.style.fill = '#f87171';
                updateStatus('Error processing authentication: ' + err.message, 'error');
              });
            } else {
              iconEl.style.fill = '#f87171';
              updateStatus('No authorization code received.', 'error');
            }
          </script>
        </body>
        </html>
      `;
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(callbackHtml);
        }
        else {
            res.writeHead(404);
            res.end();
        }
    });
    tokenServer.listen(3004, "127.0.0.1", () => {
        console.log("Token server listening on http://127.0.0.1:3004");
        console.log("OAuth callback URL: http://127.0.0.1:3004/callback");
    });
};
const createWindow = () => {
    const iconPath = electron_1.app.isPackaged
        ? path_1.default.join(process.resourcesPath, "app", "public", "icon.ico")
        : path_1.default.join(__dirname, "../../public/icon.ico");
    console.log("Icon path:", iconPath);
    console.log("Icon exists:", fs_1.default.existsSync(iconPath));
    const win = new electron_1.BrowserWindow({
        width: 1024,
        height: 128,
        minHeight: 128,
        minWidth: 1024,
        frame: false,
        titleBarStyle: "hidden",
        icon: iconPath,
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            nodeIntegration: false,
            contextIsolation: true
        }
    });
    // Add debugging for page load events
    win.webContents.on("did-start-loading", () => {
        console.log("Page started loading");
    });
    win.webContents.on("did-finish-load", () => {
        console.log("Page finished loading");
    });
    win.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
        console.error("Page failed to load:", errorCode, errorDescription);
    });
    // Add keyboard shortcut for dev tools (Ctrl+Shift+I or F12)
    win.webContents.on("before-input-event", (event, input) => {
        if ((input.control && input.shift && input.key.toLowerCase() === "i") || input.key === "F12") {
            win.webContents.toggleDevTools();
        }
    });
    // IPC handler to show native context menu (works with drag regions!)
    electron_1.ipcMain.handle("show-context-menu", (_event, currentView) => {
        const isPlayerView = currentView === "player";
        const contextMenu = electron_1.Menu.buildFromTemplate([
            {
                label: isPlayerView ? "Go to Playlists" : "Go to Player",
                accelerator: "Alt+Left",
                click: () => {
                    if (isPlayerView) {
                        win.webContents.send("navigate-to-playlists");
                    }
                    else {
                        win.webContents.send("navigate-to-player");
                    }
                }
            },
            { type: "separator" },
            {
                label: "Refresh",
                click: () => win.reload()
            },
            {
                label: "Open Spotify",
                click: () => electron_1.shell.openExternal("spotify:")
            },
            { type: "separator" },
            {
                label: "Toggle Drag Handle",
                click: () => {
                    win.webContents.send("toggle-drag-handle");
                }
            },
            { type: "separator" },
            {
                label: "Minimize",
                click: () => win.minimize()
            },
            {
                label: win.isMaximized() ? "Restore" : "Maximize",
                click: () => {
                    if (win.isMaximized()) {
                        win.unmaximize();
                    }
                    else {
                        win.maximize();
                    }
                }
            },
            { type: "separator" },
            {
                label: win.isAlwaysOnTop() ? "Disable Always on Top" : "Enable Always on Top",
                click: () => {
                    const currentState = win.isAlwaysOnTop();
                    win.setAlwaysOnTop(!currentState);
                }
            },
            { type: "separator" },
            {
                label: "Toggle DevTools",
                accelerator: "F12",
                click: () => win.webContents.toggleDevTools()
            },
            { type: "separator" },
            {
                label: "Close",
                click: () => win.close()
            }
        ]);
        contextMenu.popup({ window: win });
    });
    // IPC handlers for window controls
    electron_1.ipcMain.handle("window-minimize", () => {
        win.minimize();
    });
    electron_1.ipcMain.handle("window-maximize", () => {
        if (win.isMaximized()) {
            win.unmaximize();
        }
        else {
            win.maximize();
        }
    });
    electron_1.ipcMain.handle("window-close", () => {
        win.close();
    });
    electron_1.ipcMain.handle("window-is-maximized", () => {
        return win.isMaximized();
    });
    // Handler for opening URLs in default browser
    electron_1.ipcMain.handle("open-external", async (event, url) => {
        await electron_1.shell.openExternal(url);
    });
    // Spotify token handlers
    electron_1.ipcMain.handle("set-spotify-tokens", (event, tokens) => {
        spotifyTokens = tokens;
        console.log("Spotify tokens stored in main process");
        return true;
    });
    electron_1.ipcMain.handle("get-spotify-tokens", () => {
        console.log("Retrieving Spotify tokens from main process:", spotifyTokens ? "available" : "none");
        return spotifyTokens;
    });
    electron_1.ipcMain.handle("clear-spotify-tokens", () => {
        spotifyTokens = null;
        console.log("Spotify tokens cleared from main process");
        return true;
    });
    // Code verifier handlers for PKCE
    electron_1.ipcMain.handle("set-code-verifier", (event, codeVerifier) => {
        spotifyCodeVerifier = codeVerifier;
        console.log("Code verifier stored in main process");
        return true;
    });
    electron_1.ipcMain.handle("get-code-verifier", () => {
        console.log("Retrieving code verifier from main process:", spotifyCodeVerifier ? "available" : "none");
        return spotifyCodeVerifier;
    });
    electron_1.ipcMain.handle("clear-code-verifier", () => {
        spotifyCodeVerifier = null;
        console.log("Code verifier cleared from main process");
        return true;
    });
    // Handle OAuth callback from browser
    electron_1.ipcMain.handle("handle-oauth-callback", async (event, code, state) => {
        console.log("OAuth callback received via IPC:", { code: !!code, state: !!state });
        // Here we could process the OAuth callback directly, but it's easier to let the renderer handle it
        // Just return success - the renderer will handle the token exchange
        return { success: true };
    });
    // Get pending auth code
    electron_1.ipcMain.handle("get-pending-auth", () => {
        const auth = pendingAuthData;
        pendingAuthData = null; // Clear after reading
        return auth;
    });
    // Custom window dragging handlers with optimization
    electron_1.ipcMain.handle("window-drag-start", (event, { x, y }) => {
        const [currentX, currentY] = win.getPosition();
        const [mouseX, mouseY] = [x, y];
        return {
            windowX: currentX,
            windowY: currentY,
            startMouseX: mouseX,
            startMouseY: mouseY
        };
    });
    // Use non-blocking setPosition for smoother dragging with Windows features
    let lastPosition = { x: 0, y: 0 };
    let isDragging = false;
    let dragStartTime = 0;
    electron_1.ipcMain.on("window-drag-move", (event, { mouseX, mouseY, startData, shiftKey, ctrlKey }) => {
        if (!isDragging) {
            isDragging = true;
            dragStartTime = Date.now();
        }
        const deltaX = mouseX - startData.startMouseX;
        const deltaY = mouseY - startData.startMouseY;
        const newX = startData.windowX + deltaX;
        const newY = startData.windowY + deltaY;
        // Only update if position actually changed by more than 1 pixel
        if (Math.abs(newX - lastPosition.x) > 1 || Math.abs(newY - lastPosition.y) > 1) {
            lastPosition = { x: newX, y: newY };
            // For Windows FancyZones compatibility with Shift key
            if (process.platform === "win32" && shiftKey) {
                // When shift is held, move more deliberately to help FancyZones detect intent
                const dragDuration = Date.now() - dragStartTime;
                if (dragDuration > 100) {
                    // Only start moving after 100ms to let Windows detect shift+drag
                    win.setPosition(newX, newY, false);
                }
            }
            else {
                // Normal smooth dragging
                win.setPosition(newX, newY, false);
            }
        }
    });
    // Handle drag end for Windows features like FancyZones snapping
    electron_1.ipcMain.on("window-drag-end", (event, { mouseX, mouseY, startData, shiftKey, ctrlKey }) => {
        if (!isDragging)
            return;
        isDragging = false;
        const deltaX = mouseX - startData.startMouseX;
        const deltaY = mouseY - startData.startMouseY;
        const newX = startData.windowX + deltaX;
        const newY = startData.windowY + deltaY;
        if (process.platform === "win32" && shiftKey) {
            // For FancyZones with shift key, try to be more Windows-native
            // Set final position and let Windows handle any zone snapping
            win.setPosition(newX, newY, false);
            // Windows FancyZones might need a moment to process the shift+drag gesture
            setTimeout(() => {
                // Check if Windows moved our window (indicating zone snap occurred)
                const [currentX, currentY] = win.getPosition();
                console.log(`Drag ended at: ${newX}, ${newY}, Windows positioned at: ${currentX}, ${currentY}`);
                // If Windows significantly changed our position, respect it (zone snap occurred)
                if (Math.abs(currentX - newX) > 20 || Math.abs(currentY - newY) > 20) {
                    console.log("Windows zone snap detected, keeping Windows position");
                }
            }, 150);
        }
        else {
            // Normal drag end without Windows features
            win.setPosition(newX, newY, false);
        }
    }); // Always open dev tools for debugging
    if (!electron_1.app.isPackaged) {
        win.webContents.openDevTools();
    }
    if (electron_1.app.isPackaged) {
        console.log("App is packaged, loading from app://-");
        if (appServe) {
            appServe(win)
                .then(() => {
                console.log("appServe completed, loading URL");
                win.loadURL("app://-");
            })
                .catch((error) => {
                console.error("Error with appServe:", error);
                // Fallback: try loading the index.html directly
                const indexPath = path_1.default.join(__dirname, "../../out/index.html");
                console.log("Trying fallback path:", indexPath);
                win.loadFile(indexPath).catch((fallbackError) => {
                    console.error("Fallback also failed:", fallbackError);
                });
            });
        }
        else {
            console.log("appServe is null, trying direct file load");
            const indexPath = path_1.default.join(__dirname, "../../out/index.html");
            console.log("Loading from path:", indexPath);
            win.loadFile(indexPath).catch((error) => {
                console.error("Direct file load failed:", error);
            });
        }
    }
    else {
        console.log("App is in development, loading from 127.0.0.1:3003");
        win.loadURL("http://127.0.0.1:3003");
        win.webContents.on("did-fail-load", () => {
            win.webContents.reloadIgnoringCache();
        });
    }
};
electron_1.app.on("ready", () => {
    // Create application menu with custom options
    const template = [
        {
            label: "File",
            submenu: [
                {
                    label: "Refresh",
                    accelerator: "Ctrl+R",
                    click: (_menuItem, window) => {
                        if (window && "reload" in window) {
                            window.reload();
                        }
                    }
                },
                {
                    label: "Open Spotify",
                    click: () => {
                        electron_1.shell.openExternal("spotify:");
                    }
                },
                { type: "separator" },
                { role: "quit", label: "Exit" }
            ]
        },
        {
            label: "View",
            submenu: [
                {
                    label: "Toggle Dev Tools",
                    accelerator: "F12",
                    click: (_menuItem, window) => {
                        if (window && "webContents" in window) {
                            window.webContents.toggleDevTools();
                        }
                    }
                },
                { type: "separator" },
                { role: "resetZoom" },
                { role: "zoomIn" },
                { role: "zoomOut" },
                { type: "separator" },
                { role: "togglefullscreen" }
            ]
        },
        {
            label: "Window",
            submenu: [{ role: "minimize" }, { role: "zoom" }, { type: "separator" }, { role: "close" }]
        },
        {
            label: "Help",
            submenu: [
                {
                    label: "About Desktop Thing for Spotify",
                    click: () => {
                        const aboutWindow = new electron_1.BrowserWindow({
                            width: 400,
                            height: 300,
                            title: "About",
                            resizable: false,
                            minimizable: false,
                            maximizable: false,
                            webPreferences: {
                                nodeIntegration: false,
                                contextIsolation: true
                            }
                        });
                        aboutWindow.loadURL(`data:text/html;charset=utf-8,
							<!DOCTYPE html>
							<html>
							<head>
								<style>
									body {
										font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
										background: linear-gradient(135deg, #1e3a8a 0%, #1e293b 100%);
										color: white;
										display: flex;
										flex-direction: column;
										align-items: center;
										justify-content: center;
										height: 100vh;
										margin: 0;
										padding: 20px;
										box-sizing: border-box;
									}
									h1 { margin: 10px 0; font-size: 24px; }
									p { margin: 5px 0; opacity: 0.9; }
									.version { 
										background: rgba(255, 255, 255, 0.1);
										padding: 8px 16px;
										border-radius: 20px;
										margin: 15px 0;
									}
									a {
										color: #60a5fa;
										text-decoration: none;
									}
									a:hover {
										text-decoration: underline;
									}
								</style>
							</head>
							<body>
								<h1>🎵 Desktop Thing for Spotify</h1>
								<div class="version">Version 1.1.1</div>
								<p>A compact Spotify player for your desktop</p>
								<p style="margin-top: 20px; font-size: 12px;">
									Built with Electron & Next.js
								</p>
							</body>
							</html>
						`);
                        aboutWindow.setMenu(null);
                    }
                },
                {
                    label: "Documentation",
                    click: () => {
                        electron_1.shell.openExternal("https://github.com/your-repo/desktop-thing-for-spotify");
                    }
                },
                { type: "separator" },
                {
                    label: "Report Issue",
                    click: () => {
                        electron_1.shell.openExternal("https://github.com/your-repo/desktop-thing-for-spotify/issues");
                    }
                }
            ]
        }
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
    startTokenServer();
    createWindow();
});
electron_1.app.on("window-all-closed", () => {
    if (tokenServer) {
        tokenServer.close();
    }
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
