# Native Context Menu with Drag Regions - Solution

## ✅ Problem Solved!

The native context menu now works **even on drag regions**!

---

## The Problem

Electron's `-webkit-app-region: drag` disables all pointer events, including context menu events. This meant:

- ❌ Right-click on drag regions showed nothing
- ❌ Native `context-menu` event listeners didn't fire
- ❌ Had to choose between drag regions OR context menu

---

## The Solution: IPC Communication

Instead of relying on the DOM's `context-menu` event (which drag regions block), we use:

1. **Global listener** in React (catches right-clicks everywhere)
2. **IPC call** to the main process
3. **Main process** shows the native menu

### How It Works

```
User Right-Clicks (even on drag region)
         ↓
Global document listener catches it
         ↓
window.electronAPI.showContextMenu()
         ↓
IPC call to main process
         ↓
Main process shows native Menu
         ↓
Native context menu appears! ✅
```

---

## Implementation Details

### 1. React Hook (`useWindowControls.ts`)

```typescript
useEffect(() => {
	const handleGlobalContextMenu = (e: MouseEvent) => {
		e.preventDefault(); // Prevent browser menu

		// Call Electron via IPC
		if (window.electronAPI) {
			window.electronAPI.showContextMenu();
		}
	};

	document.addEventListener("contextmenu", handleGlobalContextMenu);

	return () => {
		document.removeEventListener("contextmenu", handleGlobalContextMenu);
	};
}, []);
```

### 2. Preload Script (`preload.ts`)

```typescript
contextBridge.exposeInMainWorld("electronAPI", {
	// ... other methods
	showContextMenu: () => ipcRenderer.invoke("show-context-menu"),
});
```

### 3. Main Process (`main.ts`)

```typescript
ipcMain.handle("show-context-menu", () => {
	const contextMenu = Menu.buildFromTemplate([
		{label: "Refresh", click: () => win.reload()},
		{label: "Open Spotify", click: () => shell.openExternal("spotify:")},
		{type: "separator"},
		{label: "Minimize", click: () => win.minimize()},
		{
			label: "Maximize/Restore", click: () => { /* ... */
			}
		},
		// ... more items
	]);
	contextMenu.popup({window: win});
});
```

---

## Benefits

✅ **Works on drag regions** - No more "dead zones"  
✅ **Fully customizable** - Add any menu items you want  
✅ **Native Windows look** - True OS-native context menu  
✅ **Simple to extend** - Just edit the menu template

---

## Adding Custom Menu Items

Edit `src/main/main.ts` in the `show-context-menu` handler:

```typescript
ipcMain.handle("show-context-menu", () => {
	const contextMenu = Menu.buildFromTemplate([
		// Add your custom items here!
		{
			label: "My Custom Action",
			click: () => {
				console.log("Custom action triggered!");
				// Your code here
			}
		},
		{
			label: "Another Action",
			accelerator: "Ctrl+Shift+A",
			click: () => {
				// Another action
			}
		},
		{type: "separator"},
		// ... existing items
	]);
	contextMenu.popup({window: win});
});
```

### Menu Item Properties

```typescript
{
	label: "Menu Text",           // What user sees
		accelerator
:
	"Ctrl+N",        // Keyboard shortcut
		click
:
	() => {
	},             // Action function
		type
:
	"separator",            // Divider line
		enabled
:
	true,                // Can be clicked
		visible
:
	true,                // Is shown
		checked
:
	false,               // For checkbox items
		submenu
:
	[...]              // Nested menu
}
```

---

## Example: Adding App-Specific Actions

```typescript
const contextMenu = Menu.buildFromTemplate([
	// Spotify controls
	{
		label: "Play/Pause",
		accelerator: "Space",
		click: () => {
			win.webContents.send("spotify-toggle-play");
		}
	},
	{
		label: "Next Track",
		accelerator: "Ctrl+Right",
		click: () => {
			win.webContents.send("spotify-next");
		}
	},
	{type: "separator"},

	// Window controls
	{label: "Minimize", click: () => win.minimize()},
	{label: "Close", click: () => win.close()},
]);
```

---

## Dynamic Menu Items

You can make menu items dynamic based on app state:

```typescript
ipcMain.handle("show-context-menu", () => {
	const contextMenu = Menu.buildFromTemplate([
		{
			label: "Refresh",
			click: () => win.reload()
		},
		{
			// Dynamic label based on window state
			label: win.isMaximized() ? "Restore" : "Maximize",
			click: () => {
				if (win.isMaximized()) {
					win.unmaximize();
				} else {
					win.maximize();
				}
			}
		},
		// ... more items
	]);
	contextMenu.popup({window: win});
});
```

---

## Testing

1. **Run the app**: `npm start` or use the built executable
2. **Right-click anywhere** in the window
3. **Even on drag regions** - it works!
4. **Try the menu items**:
    - Refresh ✅
    - Open Spotify ✅
    - Minimize ✅
    - Maximize/Restore ✅
    - Toggle DevTools ✅
    - Close ✅

---

## Current Menu Items

| Item                 | Action                 | Shortcut |
|----------------------|------------------------|----------|
| **Refresh**          | Reload the app         | -        |
| **Open Spotify**     | Launch Spotify desktop | -        |
| *(separator)*        | -                      | -        |
| **Minimize**         | Minimize window        | -        |
| **Maximize/Restore** | Toggle window size     | -        |
| *(separator)*        | -                      | -        |
| **Toggle DevTools**  | Show developer tools   | F12      |
| *(separator)*        | -                      | -        |
| **Close**            | Exit application       | -        |

---

## Files Modified

1. ✅ `src/main/main.ts` - Added IPC handler for context menu
2. ✅ `src/main/preload.ts` - Exposed `showContextMenu()` to renderer
3. ✅ `src/types/electron.d.ts` - Added TypeScript definition
4. ✅ `src/components/spotify-player/hooks/useWindowControls.ts` - Calls IPC on right-click

---

## Why This Works

### Traditional Approach (Broken)

```
Right-click on drag region
  → Drag region blocks event
  → Nothing happens ❌
```

### IPC Approach (Working)

```
Right-click anywhere
  → Global listener catches it (not blocked by drag regions)
  → IPC call to main process
  → Main process shows menu
  → Menu appears! ✅
```

The key insight: **drag regions only block events on the window content**, but our global `document.addEventListener`
captures the event **before** it reaches the drag region!

---

## Summary

🎉 **You now have both:**

- ✅ **Drag regions** - Smooth window dragging
- ✅ **Custom context menu** - Native Windows menu with custom items
- ✅ **Works everywhere** - Even on drag regions!

The solution uses IPC communication to bypass the drag region limitation, giving you the best of both worlds! 🚀

