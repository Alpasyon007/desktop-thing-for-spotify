# Native Windows Context Menu Customization

## Overview

The Desktop Thing for Spotify now includes a **fully customized native Windows application menu** with helpful options
accessible from the menu bar and optional right-click context menu.

---

## Application Menu (Menu Bar)

When you click on the window's menu bar (Alt key shows it), you'll see these custom menus:

### 📁 File Menu

- **Refresh** (Ctrl+R) - Reload the application
- **Open Spotify** - Launch Spotify desktop app
- **Exit** - Close the application

### 👁️ View Menu

- **Toggle Dev Tools** (F12) - Open developer tools for debugging
- **Reset Zoom** - Reset zoom level to 100%
- **Zoom In** - Increase zoom level
- **Zoom Out** - Decrease zoom level
- **Toggle Fullscreen** - Enter/exit fullscreen mode

### 🪟 Window Menu

- **Minimize** - Minimize window to taskbar
- **Zoom** - Maximize window
- **Close** - Close the window

### ❓ Help Menu

- **About Desktop Thing for Spotify** - Shows app version and info
- **Documentation** - Opens GitHub documentation
- **Report Issue** - Opens GitHub issues page

---

## Right-Click Context Menu (Optional)

A **native context menu** is available but currently **disabled by default** to allow the custom React-based context
menu to work.

### To Enable Native Context Menu:

In `src/main/main.ts`, find this commented code and uncomment it:

```typescript
// Native context menu for right-click (disabled to allow custom React context menu)
// If you want to enable native context menu, uncomment this:
/*
win.webContents.on("context-menu", (event, params) => {
	const contextMenu = Menu.buildFromTemplate([
		// ... menu items
	]);
	contextMenu.popup();
});
*/
```

### Native Context Menu Items:

- **Refresh** - Reload the app
- **Open Spotify** - Launch Spotify
- **Minimize** - Minimize window
- **Maximize/Restore** - Toggle window size
- **Toggle DevTools** - Show developer tools
- **Close** - Exit the app

---

## Customizing the Menus

### Adding New Menu Items

Edit `src/main/main.ts` and modify the menu template:

```typescript
const template: Electron.MenuItemConstructorOptions[] = [
	{
		label: "Your Menu",
		submenu: [
			{
				label: "Your Action",
				accelerator: "Ctrl+Shift+A", // Optional keyboard shortcut
				click: () => {
					// Your action here
					console.log("Custom action triggered!");
				}
			}
		]
	}
];
```

### Common Menu Item Properties

```typescript
{
	label: "Menu Item",           // Display text
		accelerator
:
	"Ctrl+N",        // Keyboard shortcut
		click
:
	() => {
	},             // Action to perform
		type
:
	"separator",            // Divider line
		role
:
	"quit",                 // Built-in Electron roles
		enabled
:
	true,                // Can be clicked
		visible
:
	true,                // Is shown
		checked
:
	false                // For checkbox items
}
```

### Built-in Roles

Electron provides many built-in menu roles:

```typescript
{
	role: "undo"
}
{
	role: "redo"
}
{
	role: "cut"
}
{
	role: "copy"
}
{
	role: "paste"
}
{
	role: "selectAll"
}
{
	role: "minimize"
}
{
	role: "close"
}
{
	role: "quit"
}
{
	role: "reload"
}
{
	role: "toggleDevTools"
}
{
	role: "resetZoom"
}
{
	role: "zoomIn"
}
{
	role: "zoomOut"
}
{
	role: "togglefullscreen"
}
```

---

## About Dialog

The **About** menu item opens a custom styled window showing:

- App name: **Desktop Thing for Spotify**
- Version: **1.1.1**
- Description
- Credits

### Customizing the About Dialog

In `src/main/main.ts`, find the "About" menu item:

```typescript
{
	label: "About Desktop Thing for Spotify",
		click
:
	() => {
		const aboutWindow = new BrowserWindow({
			width: 400,
			height: 300,
			// ... configuration
		});

		aboutWindow.loadURL(`data:text/html;charset=utf-8,
			<!DOCTYPE html>
			<!-- Your custom HTML here -->
		`);
	}
}
```

You can modify:

- Window size (`width`, `height`)
- HTML content
- Styling (CSS)
- Information displayed

---

## Keyboard Shortcuts

Custom keyboard shortcuts are defined in the menu:

| Shortcut         | Action                               |
|------------------|--------------------------------------|
| **Ctrl+R**       | Refresh application                  |
| **F12**          | Toggle Developer Tools               |
| **Ctrl+Shift+I** | Toggle Developer Tools (alternative) |
| **Ctrl+0**       | Reset Zoom                           |
| **Ctrl++**       | Zoom In                              |
| **Ctrl+-**       | Zoom Out                             |
| **F11**          | Toggle Fullscreen                    |

### Adding Custom Shortcuts

```typescript
{
	label: "My Action",
		accelerator
:
	"Ctrl+Shift+M",  // Your shortcut
		click
:
	() => {
		// Your code
	}
}
```

**Modifier Keys:**

- `Ctrl` or `Control`
- `Shift`
- `Alt`
- `Super` (Windows key)
- `Command` or `Cmd` (macOS)

**Examples:**

- `"Ctrl+N"` - Control + N
- `"Ctrl+Shift+T"` - Control + Shift + T
- `"Alt+F4"` - Alt + F4
- `"F5"` - Just F5

---

## Opening External Links

To open URLs in the user's default browser:

```typescript
{
	label: "Visit Website",
		click
:
	() => {
		shell.openExternal("https://your-website.com");
	}
}
```

---

## Menu Location

The native menu code is in:

```
src/main/main.ts
└── app.on("ready", () => { ... })
    └── const template = [ ... ]
```

The context menu code is in:

```
src/main/main.ts
└── createWindow()
    └── win.webContents.on("context-menu", ...)
```

---

## Tips

### 1. Platform-Specific Menus

```typescript
const isMac = process.platform === 'darwin';

const template = [
	...(isMac ? [{
		label: app.name,
		submenu: [
			{role: 'about'},
			{type: 'separator'},
			{role: 'quit'}
		]
	}] : []),
	// Rest of menu...
];
```

### 2. Dynamic Menu Items

```typescript
{
	label: win.isMaximized() ? "Restore" : "Maximize",
		click
:
	() => {
		if (win.isMaximized()) {
			win.unmaximize();
		} else {
			win.maximize();
		}
	}
}
```

### 3. Submenus

```typescript
{
	label: "Parent Menu",
		submenu
:
	[
		{label: "Child 1"},
		{label: "Child 2"},
		{
			label: "Nested",
			submenu: [
				{label: "Deep item"}
			]
		}
	]
}
```

---

## Current vs Custom Context Menu

### Custom React Context Menu (Default)

- ✅ Styled to match app design
- ✅ Can include app-specific actions
- ✅ Works within the window
- ❌ Only appears inside the app window

### Native Windows Context Menu (Optional)

- ✅ True native Windows appearance
- ✅ Works everywhere (including title bar)
- ✅ Familiar to Windows users
- ❌ Limited styling options

**Current Setup:** Custom React context menu is enabled. Native menu is commented out but available.

---

## Examples

### Add a "Settings" Menu

```typescript
{
	label: "Settings",
		submenu
:
	[
		{
			label: "Preferences",
			accelerator: "Ctrl+,",
			click: () => {
				// Open settings window
			}
		},
		{
			label: "Clear Cache",
			click: () => {
				// Clear application cache
			}
		}
	]
}
```

### Add a "Playback" Menu

```typescript
{
	label: "Playback",
		submenu
:
	[
		{
			label: "Play/Pause",
			accelerator: "Space",
			click: () => {
				win.webContents.send('playback-toggle');
			}
		},
		{
			label: "Next Track",
			accelerator: "Ctrl+Right",
			click: () => {
				win.webContents.send('playback-next');
			}
		}
	]
}
```

---

## Summary

Your Electron app now has a **fully customizable native Windows menu** with:

- ✅ File, View, Window, and Help menus
- ✅ Custom keyboard shortcuts
- ✅ About dialog
- ✅ External link support
- ✅ Optional native context menu
- ✅ Easy to extend and customize

The menu provides quick access to common actions and makes your app feel more professional and native to Windows! 🎉

