# Always on Top Feature

## Overview

The "Always on Top" feature allows the application window to remain visible above all other windows on the system. This
is particularly useful for a music player where you want to keep the controls visible while working in other
applications.

## User Experience

### Enabling Always on Top

1. Right-click anywhere in the application
2. Select "Always on Top" from the context menu
3. The window will stay on top of all other windows
4. A checkmark (✓) appears next to the menu item

### Disabling Always on Top

1. Right-click anywhere in the application
2. Click "Always on Top" again (with checkmark)
3. The window returns to normal behavior
4. The checkmark disappears

### Visual Feedback

- **Enabled**: Checkmark (✓) next to "Always on Top" in menu
- **Disabled**: No checkmark
- **Persistent**: State is maintained across menu opens

## Implementation

### Architecture

The feature uses Electron's `setAlwaysOnTop` API with state management in React:

```
User clicks menu item
        ↓
React state updates
        ↓
IPC message to main process
        ↓
Electron setAlwaysOnTop()
        ↓
Window behavior changes
```

### Code Structure

#### React Hook: `useWindowControls`

**Location**: `src/components/spotify-player/hooks/useWindowControls.ts`

```typescript
export function useWindowControls() {
	const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

	const toggleAlwaysOnTop = useCallback(() => {
		const newState = !isAlwaysOnTop;
		setIsAlwaysOnTop(newState);
		window.electron?.setAlwaysOnTop(newState);
	}, [isAlwaysOnTop]);

	return {
		isAlwaysOnTop,
		toggleAlwaysOnTop,
		minimize: () => window.electron?.minimize(),
		close: () => window.electron?.close()
	};
}
```

**Key aspects**:

- Maintains local state for UI (checkmark)
- Uses `useCallback` for stable function reference
- Calls Electron IPC for actual functionality

#### Context Menu Integration

**Location**: Views that include context menu (PlayerView, PlaylistsView)

```typescript
const windowControls = useWindowControls();

const menuItems = [
	{
		label: 'Always on Top',
		checked: windowControls.isAlwaysOnTop,
		onClick: windowControls.toggleAlwaysOnTop
	},
	// ... other items
];
```

**Features**:

- Dynamic checkmark based on state
- Consistent across all views
- Easy to extend with more options

#### Preload Script

**Location**: `js/electron/preload.js`

```javascript
contextBridge.exposeInMainWorld('electron', {
    setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag),
    // ... other APIs
});
```

**Purpose**:

- Exposes safe API to renderer
- Bridges React and Electron
- Maintains security (context isolation)

#### Main Process Handler

**Location**: `js/electron/main.js`

```javascript
ipcMain.on('set-always-on-top', (event, flag) => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        window.setAlwaysOnTop(flag);
    }
});
```

**Functionality**:

- Gets the focused window
- Calls Electron's native API
- Handles null safety

### Type Definitions

**Location**: `src/types/electron.d.ts`

```typescript
interface Window {
	electron: {
		setAlwaysOnTop: (flag: boolean) => void;
		minimize: () => void;
		close: () => void;
	};
}
```

**Benefits**:

- TypeScript autocomplete
- Type safety
- Documentation in code

## State Management

### Local State (React)

- **Purpose**: Track UI state (checkmark)
- **Scope**: Component level
- **Updates**: Immediately on user action

### Window State (Electron)

- **Purpose**: Actual window behavior
- **Scope**: Native OS level
- **Updates**: Via IPC call

### Synchronization

The two states are kept in sync:

1. User clicks menu item
2. React state updates → UI updates immediately
3. IPC call triggers → Window behavior changes
4. Both states now match

### Persistence

Currently, the state is **not persisted** across app restarts:

- Always starts as `false` (disabled)
- User must re-enable after each launch
- Potential future enhancement: Save preference

## Platform Behavior

### Windows

- Window stays on top of all windows
- Works with taskbar and full-screen apps
- Respects system focus behavior

### macOS

- Window stays on top in current Space
- May behave differently with full-screen apps
- Respects Mission Control

### Linux

- Behavior depends on window manager
- Generally consistent with Windows
- Some WMs may have quirks

## Edge Cases

### Multiple Windows

Currently, the app only has one window:

- No multi-window considerations needed
- If adding more windows, each needs its own state

### Focus Loss

When window loses focus:

- Still stays on top visually
- Can be obscured by other always-on-top windows
- System modals can appear above it

### Screen Changes

When switching monitors or resolutions:

- State is maintained
- Window may move but stays on top
- No special handling needed

## User Benefits

### Primary Use Case

**Music control while working**:

1. Enable always on top
2. Position player in a corner
3. Work in other applications
4. Player stays visible
5. Quick access to controls

### Additional Benefits

- No need to switch windows
- Visual reminder of what's playing
- Quick pause/skip without Alt+Tab
- Compact overlay on desktop

## Limitations

### Known Issues

1. **No persistence**: State resets on restart
2. **Global behavior**: Can't specify which windows to top
3. **System limitations**: Some OS modals still appear above

### Future Improvements

1. **Save preference**: Remember state in localStorage
2. **Keyboard shortcut**: Toggle with hotkey (e.g., Ctrl+T)
3. **Auto-enable**: Option to always start on top
4. **Smart positioning**: Remember window position per state

## Testing

### Manual Testing

1. **Enable/Disable**:
    - Right-click → Always on Top
    - Open another window
    - Verify player stays on top
    - Toggle off, verify normal behavior

2. **Visual Feedback**:
    - Check checkmark appears when enabled
    - Check checkmark disappears when disabled
    - Verify consistent across views

3. **Cross-platform**:
    - Test on Windows, macOS, Linux
    - Verify consistent behavior
    - Note any platform-specific quirks

### Automated Testing

Potential test cases:

```typescript
describe('useWindowControls', () => {
	it('toggles always on top state', () => {
		const {result} = renderHook(() => useWindowControls());

		expect(result.current.isAlwaysOnTop).toBe(false);

		act(() => {
			result.current.toggleAlwaysOnTop();
		});

		expect(result.current.isAlwaysOnTop).toBe(true);
	});

	it('calls electron API when toggling', () => {
		const mockSetAlwaysOnTop = jest.fn();
		window.electron = {setAlwaysOnTop: mockSetAlwaysOnTop};

		const {result} = renderHook(() => useWindowControls());

		act(() => {
			result.current.toggleAlwaysOnTop();
		});

		expect(mockSetAlwaysOnTop).toHaveBeenCalledWith(true);
	});
});
```

## Accessibility

### Keyboard Access

- Context menu can be opened with right-click
- Future: Add keyboard shortcut (Shift+F10 for context menu)
- Future: Dedicated hotkey for toggle

### Screen Readers

- Menu item is properly labeled
- Checked state is announced
- Clear action description

## Related Features

### Window Controls

- Part of the window controls suite
- Works alongside minimize/close
- Same hook, consistent pattern

### Context Menu

- Primary interface for feature
- Consistent menu across views
- Dynamic state reflection

### Drag Handle

- Independent of always-on-top
- Works normally when enabled
- No interaction between features

## Development Guide

### Adding Similar Features

To add a new window control feature:

1. **Add to useWindowControls hook**:
   ```typescript
   const [newState, setNewState] = useState(false);
   const toggleNewFeature = useCallback(() => {
     setNewState(!newState);
     window.electron?.newFeature(!newState);
   }, [newState]);
   ```

2. **Expose in preload**:
   ```javascript
   newFeature: (flag) => ipcRenderer.send('new-feature', flag)
   ```

3. **Handle in main**:
   ```javascript
   ipcMain.on('new-feature', (event, flag) => {
     const window = BrowserWindow.getFocusedWindow();
     window?.someElectronMethod(flag);
   });
   ```

4. **Add to context menu**:
   ```typescript
   {
     label: 'New Feature',
     checked: windowControls.newState,
     onClick: windowControls.toggleNewFeature
   }
   ```

### Best Practices

1. **State management**: Keep UI state in React, behavior in Electron
2. **IPC calls**: Make them idempotent and safe
3. **Error handling**: Handle missing window gracefully
4. **User feedback**: Provide visual confirmation
5. **Consistency**: Follow existing patterns

## Related Documentation

- [Window Controls Feature](./WINDOW_CONTROLS.md)
- [Context Menu Feature](./CONTEXT_MENU.md)
- [Electron Integration](../architecture/ELECTRON_INTEGRATION.md)
- [Component Structure](../architecture/COMPONENT_STRUCTURE.md)

