# "Go to Playlists" Feature

## ✅ Implementation Complete

The context menu now includes a **"Go to Playlists"** option that navigates back to the playlists view from the player
screen.

---

## How It Works

### User Flow

1. **While listening to music** (PlayerView is showing)
2. **Right-click anywhere** in the app
3. **Click "Go to Playlists"** (or press Alt+Left)
4. **App navigates back** to the playlists grid view
5. **Current track stops showing** (but keeps playing in background)

### What Happens

The "Go to Playlists" option:

- Clears the current track display
- Forces the app to show the PlaylistsView
- Music continues playing in Spotify (not stopped)
- Shows your playlists grid again

---

## Context Menu Items (Final)

Right-click anywhere in the app:

1. **Go to Playlists** (Alt+Left) ← Navigation!
    - Returns to playlists grid view
    - Available from player screen
2. *(separator)*
3. **Refresh** - Reload app
4. **Open Spotify** - Launch Spotify app
5. *(separator)*
6. **Toggle Drag Handle** - Show/hide drag bar
7. *(separator)*
8. **Minimize** - Minimize window
9. **Maximize/Restore** - Toggle size
10. *(separator)*
11. **Toggle DevTools** - Developer tools
12. *(separator)*
13. **Close** - Exit app

---

## Technical Implementation

### 1. Main Process (main.ts)

**Menu Item:**

```typescript
{
	label: "Go to Playlists",
		accelerator
:
	"Alt+Left",
		click
:
	() => {
		win.webContents.send("navigate-to-playlists");
	}
}
```

Sends IPC event to renderer process.

### 2. Playback Hook (useSpotifyPlayback.ts)

**New Function:**

```typescript
const clearTrack = () => {
	// Clear the track to force showing playlists view
	setPlaybackState(null);
	setLastValidPlaybackState(null);
	setNextTrack(null);
};
```

**Exported:**

```typescript
return {
	// ...existing exports
	clearTrack  // New!
};
```

### 3. Main Component (index.tsx)

**IPC Listener:**

```typescript
useEffect(() => {
	if (typeof window !== "undefined" && window.electronAPI) {
		window.electronAPI.on("navigate-to-playlists", () => {
			playback.clearTrack();
		});
	}
}, [playback]);
```

**View Logic:**

```typescript
if (!playback.track) {
	return <PlaylistsView
...
	/>;  /
	/ Shows when track is cleared
}

return <PlayerView
...
/>;  /
/ Shows when track exists
```

---

## Flow Diagram

```
User Right-Clicks
    ↓
Clicks "Go to Playlists"
    ↓
Main Process (main.ts)
    ↓
send("navigate-to-playlists")
    ↓
IPC Event
    ↓
Renderer (index.tsx)
    ↓
on("navigate-to-playlists", ...)
    ↓
playback.clearTrack()
    ↓
setPlaybackState(null)
setLastValidPlaybackState(null)
    ↓
React Re-renders
    ↓
if (!playback.track) → PlaylistsView
    ↓
Playlists Screen Appears ✅
```

---

## Use Cases

### Browse More Music

1. Currently listening to a track
2. Want to select a different playlist
3. Right-click → "Go to Playlists"
4. Browse and select new playlist

### Check Your Library

1. In player view
2. Want to see all your playlists
3. Right-click → "Go to Playlists"
4. View your full playlist collection

### Quick Navigation

1. Deep in playback
2. Want to start fresh
3. Alt+Left keyboard shortcut
4. Back to playlists instantly

---

## Keyboard Shortcut

**Alt+Left Arrow** - Quick access without context menu

Works from anywhere in the app when a track is playing.

---

## Important Notes

### Music Continues Playing

- Navigating to playlists **doesn't stop** the music
- Spotify keeps playing in the background
- You just switch the view in your app
- To stop music, use playback controls first

### State Management

- Clears the `playbackState` and `lastValidPlaybackState`
- Forces the conditional rendering to show PlaylistsView
- Doesn't affect authentication or playlists data
- Clean, simple navigation

### Re-showing Player

To get back to player view:

1. Wait for next track to start
2. Or select a different playlist
3. Player view will automatically appear

---

## Files Modified

1. ✅ **main.ts** - Changed "Go Back" to "Go to Playlists", sends IPC event
2. ✅ **useSpotifyPlayback.ts** - Added `clearTrack()` function
3. ✅ **index.tsx** - Added IPC listener for navigate-to-playlists event

---

## Build Status

✅ **TypeScript compilation successful**  
✅ **Next.js build successful**  
✅ **Electron build successful**  
✅ **No errors**

---

## Testing

1. **Start the app** and login
2. **Play a song** (PlayerView shows)
3. **Right-click** anywhere
4. **Click "Go to Playlists"**
5. **Should navigate** to playlists grid ✅
6. **Music keeps playing** in background ✅
7. **Can select** new playlist ✅

Or press **Alt+Left** for quick access!

---

## Summary

Perfect implementation! The "Go to Playlists" option:

- 🔙 **Navigates back** to playlists view
- ⌨️ **Alt+Left shortcut** for quick access
- 🎵 **Music keeps playing** (doesn't stop playback)
- 🎯 **Clean state management** via IPC
- ✨ **Seamless navigation** between views

Great for browsing your music library while listening! 🎵

