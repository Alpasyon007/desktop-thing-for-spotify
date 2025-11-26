# Toggleable Top Drag Handle Implementation

## ✅ Implementation Complete

The drag handle is now:

- **At the top** of the window (horizontal bar)
- **Toggleable** via context menu
- **Hidden by default** (appears when toggled)
- **No longer on the left side**

---

## How It Works

### User Experience

1. **Right-click anywhere** in the app
2. **Select "Toggle Drag Handle"** from context menu
3. **Drag handle appears/disappears** at the top
4. **Drag the handle** to move the window
5. **Toggle again** to hide it

### Default State

- Drag handle is **hidden** by default
- Window is **fully interactive**
- No accidental drags

### With Drag Handle Enabled

- **24px horizontal bar** appears at top
- Horizontal grip icon (≡)
- Hover effect for visual feedback
- Drag to move window

---

## Visual Layout

### Without Drag Handle (Default)

```
┌──────────────────────────────────────────┐
│  🎵  Desktop Thing for Spotify           │
│  ▶️  Play/Pause    🔊 Volume    ⏭️  Next │
│  ═══════════════════ Progress            │
└──────────────────────────────────────────┘
```

### With Drag Handle (Toggled On)

```
┌──────────────────────────────────────────┐
│         ≡ Drag Handle ≡                  │ ← 24px bar
├──────────────────────────────────────────┤
│  🎵  Desktop Thing for Spotify           │
│  ▶️  Play/Pause    🔊 Volume    ⏭️  Next │
│  ═══════════════════ Progress            │
└──────────────────────────────────────────┘
```

---

## Implementation Details

### 1. DragHandle Component

**Location:** `src/components/spotify-player/components/DragHandle.tsx`

**Changes:**

- Now **horizontal** instead of vertical
- Takes `isVisible` prop to show/hide
- Returns `null` when hidden
- Uses `GripHorizontal` icon instead of `GripVertical`
- Full width, 24px height
- Border on bottom instead of right

```typescript
export function DragHandle({getDragStyle, isVisible}: DragHandleProps) {
	if (!isVisible) return null;

	return (
		<div className = "w-full h-6 ..." >
			<GripHorizontal / >
			</div>
	);
}
```

### 2. Window Controls Hook

**Location:** `src/components/spotify-player/hooks/useWindowControls.ts`

**New State:**

```typescript
const [showDragHandle, setShowDragHandle] = useState(false); // Hidden by default
```

**New Function:**

```typescript
const toggleDragHandle = () => {
	setShowDragHandle(!showDragHandle);
};
```

**IPC Listener:**

```typescript
// Listen for toggle event from main process
window.electronAPI.on("toggle-drag-handle", () => {
	setShowDragHandle((prev) => !prev);
});
```

**Exported:**

- `showDragHandle` - Current visibility state
- `toggleDragHandle` - Toggle function

### 3. Main Process

**Location:** `src/main/main.ts`

**Context Menu Addition:**

```typescript
{
	label: "Toggle Drag Handle",
		click
:
	() => {
		win.webContents.send("toggle-drag-handle");
	}
}
```

When user clicks this menu item:

1. Main process sends `toggle-drag-handle` event
2. Renderer process receives it via IPC
3. React state updates
4. Drag handle appears/disappears

### 4. All Views Updated

**LoginView, PlaylistsView, PlayerView:**

**Structure:**

```tsx
<div className="flex flex-col h-full">
	{/* Drag Handle at top */}
	<DragHandle
		getDragStyle={windowControls.getDragStyle}
		isVisible={windowControls.showDragHandle}
	/>

	{/* Content */}
	<div className="flex-1 ...">
		{/* Your content */}
	</div>
</div>
```

Changed from:

- `flex` → `flex flex-col` (vertical layout)
- Drag handle removed from left
- Drag handle added at top with `isVisible` prop

---

## Context Menu Items

Right-click context menu now includes:

1. **Refresh** - Reload app
2. **Open Spotify** - Launch Spotify
3. *(separator)*
4. **Toggle Drag Handle** ← NEW!
5. *(separator)*
6. **Minimize** - Minimize window
7. **Maximize/Restore** - Toggle size
8. *(separator)*
9. **Toggle DevTools** - Developer tools
10. *(separator)*
11. **Close** - Exit app

---

## Benefits

### Cleaner Default UI

- ✅ **No drag handle by default** - Clean, minimal interface
- ✅ **More screen space** - Full height for content
- ✅ **Less visual clutter** - Focus on music controls

### On-Demand Dragging

- ✅ **Toggle when needed** - Show handle only when you want to move window
- ✅ **Quick access** - Right-click → Toggle
- ✅ **Persistent** - Stays shown until toggled off

### Better Ergonomics

- ✅ **Top position** - Natural grab point
- ✅ **Full width** - Easy to grab anywhere
- ✅ **Horizontal grip** - Matches drag direction

### No Compromise

- ✅ **All features work** - Controls, sliders, buttons
- ✅ **Context menu works** - Right-click anywhere
- ✅ **Windows features** - Snap, FancyZones when handle shown

---

## Usage Guide

### To Move the Window

**Option 1: With Drag Handle**

1. Right-click → "Toggle Drag Handle"
2. Drag handle appears at top
3. Grab the handle and drag
4. Toggle off when done (optional)

**Option 2: Without Drag Handle**

- Can't drag directly
- Use window controls (minimize, maximize)
- Or enable drag handle temporarily

### To Keep Window in Place

- Leave drag handle **hidden** (default)
- Window won't move accidentally
- All controls remain fully interactive

---

## Keyboard Shortcut (Future)

Could add a keyboard shortcut in main.ts:

```typescript
{
	label: "Toggle Drag Handle",
		accelerator
:
	"Ctrl+D",  // Add this
		click
:
	() => {
		win.webContents.send("toggle-drag-handle");
	}
}
```

---

## Files Modified

1. ✅ **DragHandle.tsx** - Horizontal layout, visibility prop
2. ✅ **useWindowControls.ts** - State, toggle function, IPC listener
3. ✅ **types.ts** - Updated WindowControls interface
4. ✅ **main.ts** - Added "Toggle Drag Handle" menu item
5. ✅ **LoginView.tsx** - Top placement, isVisible prop
6. ✅ **PlaylistsView.tsx** - Top placement, isVisible prop
7. ✅ **PlayerView.tsx** - Top placement, isVisible prop

---

## Technical Flow

```
User Right-Clicks
    ↓
Context Menu Appears
    ↓
User Clicks "Toggle Drag Handle"
    ↓
Main Process (main.ts)
    ↓
win.webContents.send("toggle-drag-handle")
    ↓
IPC Event
    ↓
Renderer Process (useWindowControls.ts)
    ↓
window.electronAPI.on("toggle-drag-handle", ...)
    ↓
setShowDragHandle(!showDragHandle)
    ↓
React Re-renders
    ↓
DragHandle Component
    ↓
if (!isVisible) return null; ← Shows/Hides
    ↓
Drag Handle Appears/Disappears at Top ✅
```

---

## Customization

### Change Default Visibility

In `useWindowControls.ts`:

```typescript
const [showDragHandle, setShowDragHandle] = useState(true); // Show by default
```

### Change Position

Move to bottom instead of top:

```tsx
<div className="flex flex-col h-full">
	{/* Content first */}
	<div className="flex-1">...</div>

	{/* Drag Handle at bottom */}
	<DragHandle isVisible={...} getDragStyle={...}/>
</div>
```

### Change Height

In `DragHandle.tsx`:

```typescript
className = "... h-8 ..."  // Taller (32px instead of 24px)
className = "... h-4 ..."  // Shorter (16px)
```

### Different Icon

```typescript
import {Menu} from "lucide-react";

<Menu className = "w-4 h-4" / >  // Different icon
```

### Add Animation

```typescript
<motion.div
	initial = {
{
	height: 0, opacity
:
	0
}
}
animate = {
{
	height: 24, opacity
:
	1
}
}
exit = {
{
	height: 0, opacity
:
	0
}
}
className = "..."
	>
	<GripHorizontal / >
	</motion.div>
```

---

## Build Status

✅ **TypeScript compilation successful**  
✅ **Next.js build successful**  
✅ **Electron build successful**  
✅ **No errors**

---

## Summary

The drag handle is now:

- 📍 **At the top** (horizontal 24px bar)
- 👻 **Hidden by default** (minimal UI)
- 🎛️ **Toggleable** (right-click → "Toggle Drag Handle")
- 📡 **IPC-controlled** (main process ↔ renderer)
- ✨ **Clean & intuitive** (show when needed, hide when not)

Perfect for a compact player that stays out of your way until you need to move it! 🎵

