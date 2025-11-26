# Dynamic Context Menu - View-Based Navigation

## ✅ Implementation Complete

The context menu now dynamically changes based on the current view:

- **In Player View**: Shows "Go to Playlists"
- **In Playlists View**: Shows "Go to Player"

---

## Changes Made

### Problem Solved

1. **Original Issue**: Pausing the song instantly switched back to playlist view
2. **Secondary Issue**: Once a track loaded, couldn't navigate back to playlists view
3. **New Feature**: Context menu now adapts to current view

### Solution

Added view state management to track user's current view independently from playback state.

---

## Technical Implementation

### 1. View State Management (`index.tsx`)

**Added View State:**

```typescript
type View = "playlists" | "player";
const [currentView, setCurrentView] = useState<View>("playlists");
```

**Auto-switch to Player:**

- When a track starts playing from playlists view, automatically switches to player view
- When user pauses, stays on player view ✅

**Manual Navigation:**

- Right-click menu allows switching between views
- Alt+Left keyboard shortcut triggers the appropriate navigation

### 2. Dynamic Menu Building (`main.ts`)

**IPC Handler Updated:**

```typescript
ipcMain.handle("show-context-menu", (_event, currentView: string) => {
	const isPlayerView = currentView === "player";
	const contextMenu = Menu.buildFromTemplate([
		{
			label: isPlayerView ? "Go to Playlists" : "Go to Player",
			accelerator: "Alt+Left",
			click: () => {
				if (isPlayerView) {
					win.webContents.send("navigate-to-playlists");
				} else {
					win.webContents.send("navigate-to-player");
				}
			}
		},
		// ... rest of menu
	]);
});
```

### 3. Context Menu Passing (`useWindowControls.ts`)

**Hook Parameter:**

```typescript
export function useWindowControls(currentView: string = "playlists") {
	// ...
	useEffect(() => {
		const handleGlobalContextMenu = (e: MouseEvent) => {
			e.preventDefault();
			if (window.electronAPI) {
				window.electronAPI.showContextMenu(currentView);
			}
		};
		// ...
	}, [currentView]); // Re-register when view changes
}
```

### 4. Event Handlers (`index.tsx`)

**Navigate to Playlists:**

```typescript
window.electronAPI.on("navigate-to-playlists", () => {
	playback.clearTrack();
	setCurrentView("playlists");
});
```

**Navigate to Player:**

```typescript
window.electronAPI.on("navigate-to-player", () => {
	setCurrentView("player");
});
```

### 5. Type Definitions Updated

**electron.d.ts:**

```typescript
showContextMenu: (currentView: string) => Promise<void>;
```

**preload.ts:**

```typescript
showContextMenu: (currentView: string) => ipcRenderer.invoke("show-context-menu", currentView),
```

---

## User Experience

### Scenario 1: Playing Music

1. User clicks a playlist → Music starts playing
2. **Auto-switches to player view**
3. Right-click → Context menu shows "Go to Playlists"

### Scenario 2: Pausing Music

1. User pauses the song
2. **Stays on player view** ✅ (Fixed!)
3. Right-click → Context menu shows "Go to Playlists"

### Scenario 3: Manual Navigation

1. While on player view, user right-clicks
2. Selects "Go to Playlists" (or presses Alt+Left)
3. **Switches to playlists view**
4. Music continues playing in background
5. Right-click → Context menu now shows "Go to Player"

### Scenario 4: Return to Player

1. While on playlists view with music playing
2. Right-click → Select "Go to Player"
3. **Returns to player view with current track**

---

## Benefits

✅ **Pause doesn't kick you out** - Stay on player when pausing  
✅ **Manual control** - Choose which view you want to see  
✅ **Contextual menu** - Menu options adapt to current view  
✅ **Music keeps playing** - Switching views doesn't stop playback  
✅ **Keyboard shortcut** - Alt+Left always does the right thing

---

## Files Modified

1. `src/components/spotify-player/index.tsx` - View state management
2. `src/components/spotify-player/hooks/useWindowControls.ts` - Pass currentView to IPC
3. `src/main/main.ts` - Dynamic menu building
4. `src/main/preload.ts` - Updated IPC signature
5. `src/types/electron.d.ts` - Updated type definitions

