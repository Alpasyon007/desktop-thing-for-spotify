# Electron Integration

## Overview

Desktop Thing for Spotify uses Electron to provide a native desktop experience. This document explains how Electron is
integrated with the Next.js application and what native features it enables.

## Architecture

### Process Model

Electron uses a multi-process architecture:

```
┌─────────────────────────────────────┐
│      Main Process (Node.js)         │
│  - Window management                │
│  - Native menus                     │
│  - IPC handlers                     │
│  - System integration               │
└──────────────┬──────────────────────┘
               │
               │ IPC Communication
               │
┌──────────────▼──────────────────────┐
│   Renderer Process (Chromium)       │
│  - Next.js application              │
│  - React components                 │
│  - User interface                   │
│  - Web APIs                         │
└─────────────────────────────────────┘
```

### Main Process

**File**: `js/electron/main.js`

Responsibilities:

- Create and manage browser windows
- Handle native menus
- Provide IPC handlers for renderer
- Manage application lifecycle

### Preload Script

**File**: `js/electron/preload.js`

Responsibilities:

- Bridge between main and renderer processes
- Expose safe APIs to renderer
- Context isolation for security

### Renderer Process

**File**: Next.js application in `src/`

Responsibilities:

- Run the React/Next.js application
- Handle user interface
- Communicate with main process via IPC

## Key Features

### Window Management

#### Frameless Window

The app uses a frameless window for a custom look:

```javascript
const mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,           // No default title bar
    transparent: false,
    resizable: false,
    webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true
    }
});
```

**Benefits**:

- Custom UI design
- Consistent across platforms
- Full control over appearance

**Challenges**:

- Must implement own window controls
- Need custom drag regions
- Platform-specific considerations

#### Window Controls

Custom implementation of minimize and close:

```typescript
// In renderer (React)
const minimize = () => {
	window.electron?.minimize();
};

const close = () => {
	window.electron?.close();
};

// In preload
contextBridge.exposeInMainWorld('electron', {
	minimize: () => ipcRenderer.send('minimize-window'),
	close: () => ipcRenderer.send('close-window')
});

// In main
ipcMain.on('minimize-window', () => {
	BrowserWindow.getFocusedWindow()?.minimize();
});

ipcMain.on('close-window', () => {
	BrowserWindow.getFocusedWindow()?.close();
});
```

### Drag Regions

Allow window dragging without a traditional title bar:

#### CSS Approach (Current)

```css
.drag-region {
    -webkit-app-region: drag;
}

.no-drag {
    -webkit-app-region: no-drag;
}
```

**Usage**:

```tsx
<div className="drag-region">
	{/* This area can drag the window */}
	<button className="no-drag">
		{/* This button won't drag */}
	</button>
</div>
```

#### Component Approach

DragHandle component provides visual feedback:

```tsx
<DragHandle/>  // Shows drag icon, enables dragging
```

### Context Menu

Native-like context menus using web technologies:

```tsx
const handleContextMenu = (e: React.MouseEvent) => {
	e.preventDefault();
	// Show custom menu
};

<div onContextMenu={handleContextMenu}>
	{/* Content */}
</div>
```

### Always on Top

Keep window above other windows:

```typescript
// Renderer
window.electron?.setAlwaysOnTop(true);

// Preload
setAlwaysOnTop: (flag: boolean) =>
	ipcRenderer.send('set-always-on-top', flag)

// Main
ipcMain.on('set-always-on-top', (event, flag) => {
	const window = BrowserWindow.getFocusedWindow();
	window?.setAlwaysOnTop(flag);
});
```

## IPC Communication

### Communication Pattern

```
Renderer Process          Main Process
     │                        │
     ├──── send('event') ────>│
     │                        │
     │                    (handler)
     │                        │
     │<─── reply with data ───┤
     │                        │
```

### Exposed API

The preload script exposes a safe API:

```typescript
declare global {
	interface Window {
		electron: {
			minimize: () => void;
			close: () => void;
			setAlwaysOnTop: (flag: boolean) => void;
			getAlwaysOnTop: () => Promise<boolean>;
		};
	}
}
```

### Security Considerations

1. **Context Isolation**: Enabled to prevent renderer access to Node.js
2. **Node Integration**: Disabled in renderer for security
3. **Preload Script**: Only exposes specific, safe APIs
4. **IPC Validation**: Validate all IPC messages in main process

## Native Features

### Application Menu

Custom menu for different platforms:

```javascript
const template = [
  {
    label: 'File',
    submenu: [
      { role: 'quit' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'toggleDevTools' }
    ]
  }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
```

### Notifications

Native system notifications (potential future feature):

```javascript
new Notification('Now Playing', {
  body: 'Artist - Track Name',
  icon: '/icon.png'
});
```

### Tray Icon

System tray integration (potential future feature):

```javascript
const tray = new Tray('/icon.png');
tray.setContextMenu(contextMenu);
```

## Development Setup

### Building Electron Files

TypeScript files must be compiled before running:

```bash
npm run build:electron
```

This compiles:

- `src/main/main.ts` → `js/electron/main.js`
- `src/main/preload.ts` → `js/electron/preload.js`

### Running in Development

```bash
npm run dev
```

This:

1. Builds Electron files
2. Starts Next.js dev server (port 3003)
3. Launches Electron window
4. Loads `http://127.0.0.1:3003` in Electron

### Hot Reload

- **Next.js**: Hot reload works normally
- **Electron Main**: Requires restart for changes
- **Preload**: Requires window reload for changes

## Production Build

### Build Process

```bash
npm run build
```

Steps:

1. Build Electron TypeScript files
2. Build Next.js for production
3. Package with electron-builder
4. Create platform-specific installers

### Output Structure

```
dist/
├── win-unpacked/          # Windows unpacked
│   ├── Desktop Thing for Spotify.exe
│   └── resources/
├── Desktop Thing for Spotify Setup.exe  # Windows installer
└── (mac/linux builds...)
```

### Build Configuration

**File**: `package.json` → `build` section

```json
{
  "build": {
    "appId": "com.spotify.desktop-thing",
    "productName": "Desktop Thing for Spotify",
    "directories": {
      "output": "dist"
    },
    "files": [
      "js/**/*",
      "out/**/*",
      "public/**/*",
      "node_modules/**/*"
    ],
    "win": {
      "icon": "public/icon.ico",
      "target": "nsis"
    }
  }
}
```

## Platform-Specific Considerations

### Windows

- Uses `.ico` format for icon
- NSIS installer by default
- Window controls on right side
- Snap/Aero features available

### macOS

- Uses `.icns` format for icon
- DMG installer by default
- Traffic lights on left side
- Must sign for distribution

### Linux

- Uses `.png` format for icon
- AppImage by default
- Various desktop environments
- Different window manager behaviors

## Best Practices

### IPC Communication

1. **Minimize IPC calls**: Keep communication lightweight
2. **Validate inputs**: Always validate data from renderer
3. **Error handling**: Handle IPC errors gracefully
4. **Use typed interfaces**: Define clear TypeScript types

### Window Management

1. **Save window state**: Remember position and size
2. **Restore gracefully**: Handle multiple monitors
3. **Respect user preferences**: Remember always-on-top state
4. **Handle edge cases**: Screen resolution changes, etc.

### Performance

1. **Lazy load**: Don't load everything at startup
2. **Optimize main process**: Keep it responsive
3. **Debounce IPC**: Avoid flooding with messages
4. **Memory management**: Clean up listeners and timers

### Security

1. **Never disable security features**: Keep context isolation
2. **Validate all inputs**: From renderer to main
3. **Use CSP**: Content Security Policy for web content
4. **Update regularly**: Keep Electron version current

## Troubleshooting

### Common Issues

#### Window not draggable

- Check `-webkit-app-region: drag` CSS
- Ensure no overlapping `no-drag` elements
- Verify drag handle is visible and clickable

#### IPC not working

- Check preload script is loaded
- Verify IPC event names match
- Check context bridge is properly exposed
- Look for console errors in renderer

#### Build fails

- Run `npm run build:electron` first
- Check TypeScript compilation errors
- Verify all dependencies are installed
- Check electron-builder configuration

#### App won't start

- Check main.js exists in `js/electron/`
- Verify Next.js build completed
- Check for port conflicts
- Look at Electron console logs

## Future Improvements

### Potential Enhancements

1. **Native notifications**: Show now-playing notifications
2. **System tray**: Minimize to tray functionality
3. **Global shortcuts**: Keyboard controls from anywhere
4. **Auto-update**: Automatic updates with electron-updater
5. **Multiple windows**: Separate windows for different views
6. **Native modules**: Use Node.js native addons if needed

### Migration Opportunities

1. **Electron Forge**: Consider migrating to Electron Forge
2. **Modern IPC**: Use `ipcRenderer.invoke` for request/response
3. **Better TypeScript**: Improve type safety in IPC
4. **Window state management**: Use electron-window-state

## Related Documentation

- [Architecture Overview](./OVERVIEW.md)
- [Component Structure](./COMPONENT_STRUCTURE.md)
- [Window Controls Implementation](../features/WINDOW_CONTROLS.md)
- [Context Menu Implementation](../features/CONTEXT_MENU.md)

