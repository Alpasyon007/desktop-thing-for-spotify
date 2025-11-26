# Always on Top Feature

## ✅ Implementation Complete

The context menu now includes an **"Always on Top"** toggle option that keeps the Spotify player window above all other
windows.

---

## How It Works

### Toggle On

1. **Right-click** anywhere in the app
2. **Click "Enable Always on Top"**
3. **Window stays on top** of all other windows
4. **Menu item changes** to "Disable Always on Top"

### Toggle Off

1. **Right-click** anywhere in the app
2. **Click "Disable Always on Top"**
3. **Window behaves normally** (can be covered by other windows)
4. **Menu item changes** to "Enable Always on Top"

---

## Context Menu Items (Final)

Right-click anywhere in the app:

1. **Go to Playlists** (Alt+Left) - Navigate to playlists
2. *(separator)*
3. **Refresh** - Reload app
4. **Open Spotify** - Launch Spotify app
5. *(separator)*
6. **Toggle Drag Handle** - Show/hide drag bar
7. *(separator)*
8. **Minimize** - Minimize window
9. **Maximize/Restore** - Toggle size
10. *(separator)*
11. **Enable/Disable Always on Top** ← **NEW!**
12. *(separator)*
13. **Toggle DevTools** - Developer tools
14. *(separator)*
15. **Close** - Exit app

---

## Use Cases

### Keep Music Visible

- Working on multiple windows
- Want to always see what's playing
- Enable Always on Top
- Player stays visible even when clicking other apps

### Presentations/Streaming

- Showing your screen
- Want music controls always visible
- Enable Always on Top
- Controls stay accessible while presenting

### Quick Access

- Frequently changing songs
- Don't want to keep switching windows
- Enable Always on Top
- Player always ready to use

### Disable for Normal Use

- Want normal window behavior
- Other windows can cover the player
- Disable Always on Top
- Standard window layering

---

## Technical Implementation

### Main Process (main.ts)

**Menu Item:**

```typescript
{
	label: win.isAlwaysOnTop() ? "Disable Always on Top" : "Enable Always on Top",
		click
:
	() => {
		const currentState = win.isAlwaysOnTop();
		win.setAlwaysOnTop(!currentState);
	}
}
```

**How It Works:**

1. **Check current state** - `win.isAlwaysOnTop()`
2. **Dynamic label** - Shows "Enable" or "Disable" based on state
3. **Toggle on click** - `win.setAlwaysOnTop(!currentState)`
4. **Immediate effect** - Window behavior changes instantly

---

## Features

### Smart Label

The menu item label changes based on current state:

- When **OFF**: Shows "Enable Always on Top"
- When **ON**: Shows "Disable Always on Top"

This makes it clear what will happen when you click it.

### Instant Toggle

- No restart required
- Changes take effect immediately
- Toggle on/off as many times as needed

### Persistent During Session

- Stays enabled until you disable it
- Survives minimize/maximize
- Resets when app restarts (default: off)

---

## Window Behavior

### Always on Top Enabled

✅ Stays above all windows (even maximized ones)  
✅ Visible when clicking other applications  
✅ Can still minimize/maximize/drag  
✅ Taskbar and full-screen apps still cover it

### Always on Top Disabled

✅ Normal window layering  
✅ Can be covered by other windows  
✅ Standard Windows behavior  
✅ Clicking another window brings it to front

---

## File Modified

✅ **src/main/main.ts** - Added "Always on Top" toggle to context menu

**Changes:**

- Added dynamic menu item with state-aware label
- Uses `win.isAlwaysOnTop()` to check state
- Uses `win.setAlwaysOnTop()` to toggle state

---

## Build Status

✅ **Electron build successful**  
✅ **No errors**  
✅ **Ready to use**

---

## Testing

### Enable Always on Top

1. **Right-click** anywhere in the app
2. **Click "Enable Always on Top"**
3. **Open another window** (browser, file explorer, etc.)
4. **Spotify player stays visible** on top ✅

### Disable Always on Top

1. **Right-click** again
2. **Click "Disable Always on Top"**
3. **Click another window**
4. **Spotify player goes behind** other windows ✅

### Toggle Multiple Times

1. Enable → Player stays on top ✅
2. Disable → Player behaves normally ✅
3. Enable again → Player on top again ✅

---

## Tips

### For Music Control

- Enable when working and want quick access to controls
- Disable when not actively managing playback

### For Screen Real Estate

- Small compact player benefits from always on top
- Larger windows might be better with normal layering

### For Focus

- Enable to keep music visible and accessible
- Disable when you want to focus on other apps

---

## Keyboard Shortcut (Future Enhancement)

Could add a keyboard shortcut in the future:

```typescript
{
	label: win.isAlwaysOnTop() ? "Disable Always on Top" : "Enable Always on Top",
		accelerator
:
	"Ctrl+T",  // Add this
		click
:
	() => {
		const currentState = win.isAlwaysOnTop();
		win.setAlwaysOnTop(!currentState);
	}
}
```

---

## Summary

Perfect implementation! The "Always on Top" toggle:

- 📌 **Keeps window on top** of all other windows
- 🔄 **Easy toggle** via context menu
- 🏷️ **Smart label** shows current state
- ⚡ **Instant effect** - no restart needed
- 🎯 **Practical** for music control while working

Great for keeping your music controls accessible while multitasking! 🎵

