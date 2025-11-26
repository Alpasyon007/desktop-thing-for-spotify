# Context Menu Fix - Drag Region Compatibility

## Problem

After removing custom window dragging and switching to native Electron drag regions (`-webkit-app-region: drag`), the
custom context menu stopped working. Right-clicking would show the Windows default context menu instead of our custom
one.

## Root Cause

When you apply `-webkit-app-region: drag` to an element in Electron, it makes the area draggable **but also disables all
pointer events** on that element, including:

- `onClick`
- `onContextMenu` ← This was our issue
- `onMouseMove`
- etc.

This is by design - drag regions are meant to be non-interactive areas that only respond to window dragging.

---

## Solution

**Use a global `contextmenu` event listener instead of React's `onContextMenu` prop.**

### Before (Broken)

```typescript
// In views - doesn't work with drag regions!
<div
	style = {windowControls.getContainerStyle(true)}
onContextMenu = {windowControls.handleContextMenu}  // ❌ Never fires!
	>
```

### After (Working)

```typescript
// In useWindowControls hook - works everywhere!
useEffect(() => {
	const handleGlobalContextMenu = (e: MouseEvent) => {
		e.preventDefault(); // Stop Windows menu
		setContextMenuPosition({x: e.clientX, y: e.clientY});
		setContextMenuOpen(true);
	};

	document.addEventListener("contextmenu", handleGlobalContextMenu);

	return () => {
		document.removeEventListener("contextmenu", handleGlobalContextMenu);
	};
}, []);
```

---

## Changes Made

### 1. `useWindowControls.ts`

**Added:**

- Global `contextmenu` event listener that captures all right-clicks
- Prevents default browser/Windows context menu
- Opens custom menu at cursor position

**Removed:**

- `handleContextMenu` from exports (now internal, handled automatically)

### 2. `types.ts`

**Removed:**

- `handleContextMenu: (e: React.MouseEvent) => void` from `WindowControls` interface

### 3. `PlayerView.tsx`

**Removed:**

- `onContextMenu={windowControls.handleContextMenu}` from container div

### 4. `PlaylistsView.tsx`

**Removed:**

- `onContextMenu={windowControls.handleContextMenu}` from container div

---

## How It Works Now

```
User Right-Clicks Anywhere
         ↓
Global document.addEventListener("contextmenu")
         ↓
e.preventDefault() - Stop Windows menu
         ↓
Set menu position (e.clientX, e.clientY)
         ↓
setContextMenuOpen(true)
         ↓
Custom Context Menu Appears ✅
```

### Event Flow

1. **Right-click anywhere** in the app
2. **Global listener captures** the event (even through drag regions)
3. **Prevents default** Windows context menu
4. **Shows custom menu** at cursor position
5. **Click outside** to close (existing behavior)

---

## Benefits

✅ **Works with drag regions** - No more Windows context menu  
✅ **Simpler code** - No need to add `onContextMenu` to every view  
✅ **Consistent behavior** - Works everywhere in the app  
✅ **Better UX** - One context menu for the entire window

---

## Testing

✅ **Build successful** - No TypeScript errors  
✅ **Drag regions work** - Window dragging still functions  
✅ **Context menu works** - Right-click shows custom menu  
✅ **Click outside works** - Menu closes properly

---

## Technical Notes

### Why Global Listener Works

- DOM events bubble up from the target element
- `document.addEventListener` catches events at the document level
- Works even when individual elements have `pointer-events: none` (which drag regions apply)
- `e.preventDefault()` stops the browser's default context menu

### Alternative Approaches Considered

1. ❌ **Don't use drag regions** - Loses native Windows features
2. ❌ **Apply drag regions selectively** - Complex and error-prone
3. ✅ **Global event listener** - Simple and robust

---

## Summary

**Fixed the custom context menu by using a global `contextmenu` event listener in the `useWindowControls` hook.** This
works seamlessly with Electron's native drag regions while providing a consistent context menu experience throughout the
app.

The context menu now opens on right-click anywhere in the application, regardless of drag regions! 🎉

