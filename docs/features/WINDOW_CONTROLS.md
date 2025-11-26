# Window Controls Feature

## Overview

The Window Controls feature provides minimize and close functionality for the frameless Electron window. Since the app
uses a custom frameless design without the standard title bar, these controls must be implemented manually.

## User Experience

### Visual Design

The window controls are subtly integrated into the interface:

- **Minimize button**: `-` icon in top-right corner
- **Close button**: `×` icon in top-right corner
- **Hover effect**: Buttons highlight on hover
- **Position**: Fixed at top-right of window

### Interactions

**Minimize**:

1. Click the minimize button (`-`)
2. Window minimizes to taskbar/dock
3. Click taskbar icon to restore

**Close**:

1. Click the close button (`×`)
2. Application closes completely
3. No background process remains

## Implementation

### Architecture

The feature bridges React UI and Electron window management:

```
React Component (UI)
        ↓
Event Handler
        ↓
useWindowControls Hook
        ↓
window.electron API
        ↓
IPC to Main Process
        ↓
Electron Window API
        ↓
Native Window Manager
```

### Component Structure

#### UI Components

**Location**: Embedded in LoginView, PlayerView, PlaylistsView

```typescript
<div className = "absolute top-2 right-2 flex gap-1 no-drag z-50" >
<button
	onClick = {windowControls.minimize}
className = "w-6 h-6 flex items-center justify-center 
hover:bg - white / 10
rounded
transition - colors
"
aria - label = "Minimize window"
>
<Minimize className = "w-4 h-4" / >
	</button>

	< button
onClick = {windowControls.close}
className = "w-6 h-6 flex items-center justify-center 
hover:bg - red - 500 / 50
rounded
transition - colors
"
aria - label = "Close window"
>
<X className = "w-4 h-4" / >
	</button>
	< /div>
```

**Key features**:

- `no-drag` class: Prevents window dragging on buttons
- `z-50`: Ensures buttons are always on top
- `absolute` positioning: Fixed in top-right
- Icons from Lucide React
- Hover states for feedback

#### Custom Hook

**Location**: `src/components/spotify-player/hooks/useWindowControls.ts`

```typescript
import {useState, useCallback} from 'react';

export function useWindowControls() {
	const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

	const minimize = useCallback(() => {
		if (window.electron?.minimize) {
			window.electron.minimize();
		}
	}, []);

	const close = useCallback(() => {
		if (window.electron?.close) {
			window.electron.close();
		}
	}, []);

	const toggleAlwaysOnTop = useCallback(() => {
		const newState = !isAlwaysOnTop;
		setIsAlwaysOnTop(newState);
		if (window.electron?.setAlwaysOnTop) {
			window.electron.setAlwaysOnTop(newState);
		}
	}, [isAlwaysOnTop]);

	return {
		minimize,
		close,
		toggleAlwaysOnTop,
		isAlwaysOnTop
	};
}
```

**Key aspects**:

- `useCallback`: Stable function references
- Null checking: Graceful degradation if electron API unavailable
- Centralized logic: Single source of truth

### Electron Integration

#### Preload Script

**Location**: `js/electron/preload.js`

```javascript
const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
    minimize: () => ipcRenderer.send('minimize-window'),
    close: () => ipcRenderer.send('close-window'),
    setAlwaysOnTop: (flag) => ipcRenderer.send('set-always-on-top', flag)
});
```

**Purpose**:

- Expose safe IPC API to renderer
- Maintain context isolation
- No direct access to Node.js or Electron

#### Main Process Handlers

**Location**: `js/electron/main.js`

```javascript
const {ipcMain, BrowserWindow} = require('electron');

ipcMain.on('minimize-window', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        window.minimize();
    }
});

ipcMain.on('close-window', () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
        window.close();
    }
});
```

**Key aspects**:

- Gets focused window (multi-window safe)
- Null checking for safety
- Uses Electron's native methods

#### Type Definitions

**Location**: `src/types/electron.d.ts`

```typescript
export {};

declare global {
	interface Window {
		electron: {
			minimize: () => void;
			close: () => void;
			setAlwaysOnTop: (flag: boolean) => void;
		};
	}
}
```

**Benefits**:

- TypeScript autocomplete
- Compile-time type checking
- Self-documenting API

## Design Considerations

### Why Frameless Window?

**Benefits**:

- Custom UI design
- Modern aesthetic
- Consistent cross-platform look
- Full creative control

**Tradeoffs**:

- Must implement all window controls
- Handle drag regions manually
- Platform-specific behaviors to manage

### Why These Specific Controls?

**Minimize and Close only** (no maximize):

- App has fixed size
- Designed for small, persistent display
- Maximizing wouldn't make sense
- Keeps UI simple

### Button Positioning

**Top-right corner**:

- Standard Windows convention
- Familiar to most users
- Easily accessible
- Out of the way of content

## Evolution History

### Version 1: Title Bar Approach

**Implementation**: Custom title bar with controls
**Issues**:

- Took up vertical space
- Felt cluttered
- Drag region limitations

### Version 2: Floating Controls

**Implementation**: Overlay buttons on content
**Issues**:

- Could obscure album art
- Z-index conflicts
- Inconsistent positioning

### Version 3: Fixed Corner Buttons (Current)

**Implementation**: Absolute positioned, always visible
**Benefits**:

- Always accessible
- Minimal space usage
- Clear visual hierarchy
- Simple implementation

## Platform Behavior

### Windows

- Standard minimize to taskbar
- Close terminates application
- Right-click taskbar icon for menu
- Restore from taskbar

### macOS

- Minimize to Dock
- Close button behavior (configurable)
- May keep app running in background (standard Mac behavior)
- Restore from Dock

### Linux

- Behavior depends on desktop environment
- Generally similar to Windows
- Some WMs may have special behaviors

## Interaction with Other Features

### Drag Handle

- Buttons use `no-drag` class
- Prevents conflict with window dragging
- Buttons remain clickable
- Drag handle works around buttons

### Always on Top

- Controls remain functional when on top
- No special considerations needed
- Independent features

### Context Menu

- Alternative way to minimize/close
- Redundant but useful
- Provides keyboard accessibility path

## Edge Cases

### Multi-Monitor Setup

**Minimize**:

- Window minimizes regardless of monitor
- Restores to same monitor
- Electron handles this automatically

**Position Preservation**:

- Window position maintained
- No special handling needed

### Rapid Clicking

**Prevention**:

- Event handlers debounced by Electron
- Multiple clicks don't cause issues
- Window state changes are atomic

### Focus Loss

**getFocusedWindow()** approach:

- Only affects focused window
- Safe for multi-window apps
- Returns null if no focus (handled)

## Accessibility

### Keyboard Access

**Current**:

- No keyboard shortcuts for minimize/close
- Can use context menu (right-click)

**Future**:

- Alt+F4 for close (Windows standard)
- Windows+Down for minimize (Windows standard)
- Custom hotkeys configurable

### Screen Readers

**Current implementation**:

- `aria-label` on buttons
- Clear semantic meaning
- Announced as "Minimize window" / "Close window"

**Improvements needed**:

- Better focus indicators
- Keyboard navigation
- Focus management on restore

### Visual Accessibility

- Large enough click targets (24x24px)
- High contrast on hover
- Clear visual feedback
- Icons recognizable

## Known Limitations

### No Maximize/Restore

- App has fixed size
- Not resizable by design
- Could add if requirements change

### No Drag-to-Edge Features

- No Windows Snap
- No macOS window management
- Could implement if desired

### Platform Inconsistencies

- macOS close behavior different
- Some Linux WMs may vary
- Generally acceptable tradeoffs

## Future Enhancements

### Potential Features

1. **Keyboard shortcuts**: Standard hotkeys for all controls
2. **Window state memory**: Remember minimized state
3. **Minimize to tray**: Hide to system tray instead of taskbar
4. **Restore on play**: Auto-restore when music starts
5. **Custom animations**: Smooth minimize/restore animations

### Code Improvements

1. **Extracted component**: Reusable WindowControls component
2. **Theme awareness**: Light/dark mode button styling
3. **Better error handling**: Handle IPC failures gracefully
4. **Platform detection**: Different behavior per platform

## Development Guide

### Adding a New Control

1. **Add UI button**:
   ```typescript
   <button onClick={windowControls.newAction}>
     <Icon />
   </button>
   ```

2. **Add to hook**:
   ```typescript
   const newAction = useCallback(() => {
     window.electron?.newAction();
   }, []);
   ```

3. **Expose in preload**:
   ```javascript
   newAction: () => ipcRenderer.send('new-action')
   ```

4. **Handle in main**:
   ```javascript
   ipcMain.on('new-action', () => {
     const window = BrowserWindow.getFocusedWindow();
     window?.someElectronMethod();
   });
   ```

### Styling Custom Controls

```typescript
<button
	className = "
w - 6
h - 6                    // Size
flex
items - center
justify - center  // Center icon
hover:bg - white / 10          // Hover effect
rounded                    // Rounded corners
transition - colors          // Smooth transition
no - drag                    // Prevent window drag
"
>
<Icon className = "w-4 h-4" / >
	</button>
```

## Testing

### Manual Testing

1. **Minimize**:
    - Click minimize button
    - Verify window minimizes
    - Click taskbar/dock icon
    - Verify window restores
    - Check state preserved

2. **Close**:
    - Click close button
    - Verify app closes completely
    - Check no background process
    - Relaunch and verify clean start

3. **Visual**:
    - Hover over buttons
    - Check hover effects
    - Verify z-index (buttons on top)
    - Test on different backgrounds

4. **Integration**:
    - Use with drag handle
    - Use with always on top
    - Use from context menu
    - Verify all work together

### Automated Testing

```typescript
describe('useWindowControls', () => {
	it('calls electron minimize API', () => {
		const mockMinimize = jest.fn();
		window.electron = {minimize: mockMinimize};

		const {result} = renderHook(() => useWindowControls());
		result.current.minimize();

		expect(mockMinimize).toHaveBeenCalled();
	});

	it('calls electron close API', () => {
		const mockClose = jest.fn();
		window.electron = {close: mockClose};

		const {result} = renderHook(() => useWindowControls());
		result.current.close();

		expect(mockClose).toHaveBeenCalled();
	});

	it('handles missing electron API gracefully', () => {
		window.electron = undefined;

		const {result} = renderHook(() => useWindowControls());

		expect(() => result.current.minimize()).not.toThrow();
		expect(() => result.current.close()).not.toThrow();
	});
});
```

## Security Considerations

### IPC Security

- **Context isolation**: Renderer can't access main directly
- **Preload whitelist**: Only specific APIs exposed
- **No eval**: No dynamic code execution
- **Validated inputs**: All IPC messages validated

### Attack Surface

**Minimal exposure**:

- Only window management functions
- No file system access
- No shell execution
- Limited to window control only

## Performance

### Resource Usage

- **CPU**: Negligible
- **Memory**: A few KB for state
- **IPC overhead**: ~1ms per call
- **Event listeners**: Minimal

### Optimization

- `useCallback`: Prevents unnecessary re-renders
- No polling or intervals
- Event-driven only
- Efficient state updates

## Related Documentation

- [Always on Top Feature](./ALWAYS_ON_TOP.md)
- [Drag Handle Feature](./DRAG_HANDLE.md)
- [Context Menu Feature](./CONTEXT_MENU.md)
- [Electron Integration](../architecture/ELECTRON_INTEGRATION.md)

