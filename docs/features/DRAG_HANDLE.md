# Drag Handle Feature

## Overview

The Drag Handle provides a visual and functional way to move the frameless window around the screen. Since the
application uses a custom frameless window without a traditional title bar, users need a designated area to click and
drag.

## User Experience

### Visual Design

The drag handle appears as a small icon at the top-center of the window:

- **Icon**: `⋮⋮` (vertical dots)
- **Position**: Top-center of the window
- **Color**: Subtle gray, more visible on hover
- **Size**: Small and unobtrusive

### Interactions

**Dragging the Window**:

1. Locate the drag handle icon (⋮⋮) at the top
2. Click and hold on the icon
3. Move the mouse to drag the window
4. Release to drop the window at the new position

**Visual Feedback**:

- Cursor changes to move cursor on hover
- Icon becomes more prominent on hover
- Smooth dragging with no lag

## Implementation

### Component Structure

**Location**: `src/components/spotify-player/components/DragHandle.tsx`

```typescript
import React from 'react';
import {GripVertical} from 'lucide-react';

export function DragHandle() {
	return (
		<div
			className = "absolute top-0 left-1/2 -translate-x-1/2 cursor-move drag-region z-40"
	style = {
	{
		WebkitAppRegion: 'drag'
	}
	as
	React.CSSProperties
}
>
	<GripVertical
		className = "w-5 h-5 text-gray-400 hover:text-gray-200 transition-colors"
		/ >
		</div>
)
	;
}
```

**Key features**:

- `drag-region` class: Marks as draggable area
- `webkit-app-region: drag`: Enables Electron dragging
- Centered with `left-1/2 -translate-x-1/2`
- `z-40`: Below window controls (z-50) but above content
- Hover effect for visual feedback

### CSS Approach

The drag functionality uses Electron's custom CSS property:

```css
.drag-region {
    -webkit-app-region: drag;
}

.no-drag {
    -webkit-app-region: no-drag;
}
```

**How it works**:

- Electron recognizes `-webkit-app-region: drag`
- Clicks on this area initiate window dragging
- No JavaScript or event handlers needed
- Native OS drag behavior

### Usage in Views

The DragHandle is included in each view:

```typescript
// In PlayerView
import {DragHandle} from '../components/DragHandle';

export function PlayerView() {
	return (
		<div className = "relative" >
			<DragHandle / >
			{/* Other content */}
			< /div>
	);
}
```

**Integration**:

- Added to PlayerView
- Added to PlaylistsView
- Not in LoginView (different design)
- Consistent position across views

## Technical Details

### Electron's WebKit App Region

The `-webkit-app-region` CSS property is specific to Electron:

**Values**:

- `drag`: Area can be used to drag the window
- `no-drag`: Area cannot drag the window (for buttons, etc.)

**Inheritance**:

- Child elements inherit the property
- Must explicitly set `no-drag` on interactive elements
- Prevents buttons from accidentally dragging

### Z-Index Layering

The application uses a z-index hierarchy:

```
z-50  - Window controls (minimize, close)
z-40  - Drag handle
z-30  - Context menu
z-20  - Modal overlays
z-10  - Floating elements
z-0   - Base content
```

This ensures:

- Drag handle is accessible
- Window controls always clickable
- Proper stacking of elements

### Positioning

The drag handle uses absolute positioning:

```css
.drag-handle {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
}
```

**Benefits**:

- Centered horizontally
- Fixed at top
- Doesn't affect layout
- Overlays content

## Design Evolution

### Version 1: Full Top Bar

**Approach**: Entire top section was draggable
**Issues**:

- Large drag area
- Interfered with other elements
- Took up vertical space

### Version 2: Invisible Drag Region

**Approach**: Invisible area at top
**Issues**:

- Users didn't know where to drag
- Accidental drags
- Poor discoverability

### Version 3: Visible Handle Icon (Current)

**Approach**: Small icon showing drag area
**Benefits**:

- Clear visual indicator
- Minimal space usage
- Familiar metaphor (similar to mobile)
- Easy to find and use

## User Benefits

### Clear Interaction

- Visual indicator of where to drag
- Familiar icon (grip/handle)
- Hover feedback confirms interactivity

### Precise Control

- Small, defined area
- Won't accidentally drag
- Easy to position window accurately

### Minimal Intrusion

- Small and subtle
- Doesn't distract from content
- Professional appearance

## Platform Behavior

### Windows

- Standard drag behavior
- Snap to edges works (if enabled)
- Aero Snap supported
- Shake to minimize other windows

### macOS

- Standard drag behavior
- Snap to screen edges
- Mission Control compatible
- Green button behavior (if shown)

### Linux

- Depends on window manager
- Generally standard drag
- Tiling WM support varies
- Compiz effects may apply

## Interaction with Other Features

### Window Controls

- Drag handle below controls (z-index)
- Controls have `no-drag` class
- No conflict between features
- Both fully functional

### Context Menu

- Right-click works on drag handle
- Dragging doesn't open menu
- Both gestures distinct
- No interference

### Always on Top

- Works normally when on top
- Drag functionality unchanged
- Independent features

## Edge Cases

### Dragging Off-Screen

**Electron behavior**:

- Window can partially go off-screen
- Title bar area must remain accessible
- OS usually prevents total off-screen

**User recovery**:

- Windows: Win+Arrow keys to move
- macOS: Mission Control to access
- Linux: Alt+drag or WM shortcuts

### Multi-Monitor Setup

**Behavior**:

- Can drag across monitors
- Electron handles detection
- No special code needed
- Works seamlessly

### High DPI Displays

**Behavior**:

- Icon scales with DPI
- Drag accuracy maintained
- No blurriness
- Electron handles scaling

## Accessibility

### Current State

- Visual indicator present
- Hover feedback provided
- Clear cursor change

### Limitations

- No keyboard equivalent
- Screen readers may not announce
- No alternative drag method

### Future Improvements

1. **Keyboard shortcut**: Arrow keys to move window
2. **ARIA labels**: Describe drag functionality
3. **Focus indicator**: Show when focused
4. **Alternative controls**: Menu item for positioning

## Known Limitations

### Cannot Drag from Anywhere

- Unlike traditional windows
- Must use the handle specifically
- Trade-off for custom UI

### Small Touch Target

- May be hard on touch screens
- Not optimized for tablets
- Primarily mouse/trackpad interface

### No Visual Feedback While Dragging

- Icon doesn't change during drag
- Could add dragging state
- Not critical for desktop use

## Future Enhancements

### Potential Features

1. **Larger hit area**: Invisible padding around icon
2. **Drag animation**: Visual feedback while dragging
3. **Smart positioning**: Remember preferred position
4. **Multi-drag areas**: Additional drag regions
5. **Double-click action**: Maximize or center window

### Code Improvements

1. **React state**: Track dragging state for visual feedback
2. **Position persistence**: Save window position
3. **Keyboard navigation**: Alt+drag equivalent
4. **Touch support**: Better touch handling

## Development Guide

### Modifying the Handle

**Change icon**:

```typescript
import {AnotherIcon} from 'lucide-react';

<AnotherIcon className = "w-5 h-5 text-gray-400 hover:text-gray-200" / >
```

**Change position**:

```typescript
// Top-left
<div className = "absolute top-0 left-2 drag-region" >

// Top-right  
<div className = "absolute top-0 right-2 drag-region" >
```

**Change size**:

```typescript
<GripVertical className = "w-6 h-6" / > // Larger
<GripVertical className = "w-4 h-4" / > // Smaller
```

### Adding Drag Areas

To make other areas draggable:

```typescript
<div
	className = "drag-region"
style = {
{
	WebkitAppRegion: 'drag'
}
as
React.CSSProperties
}
>
{/* This area can drag the window */
}

<button className = "no-drag" >
	{/* This button won't drag */}
	< /button>
	< /div>
```

**Important**: Always add `no-drag` to interactive elements!

### Preventing Drag on Elements

```typescript
<div
	className = "no-drag"
style = {
{
	WebkitAppRegion: 'no-drag'
}
as
React.CSSProperties
}
>
{/* Cannot drag from here */
}
</div>
```

## Testing

### Manual Testing

1. **Basic Drag**:
    - Click and hold on handle
    - Move mouse around
    - Verify window follows smoothly
    - Release and verify position

2. **Visual Feedback**:
    - Hover over handle
    - Verify color change
    - Verify cursor change
    - Check icon visibility

3. **Integration**:
    - Try dragging from window controls (should not work)
    - Try context menu while dragging
    - Verify all views have handle
    - Test on different backgrounds

4. **Cross-Platform**:
    - Test on Windows
    - Test on macOS
    - Test on Linux
    - Note any differences

### Automated Testing

```typescript
describe('DragHandle', () => {
	it('renders with correct styles', () => {
		const {container} = render(<DragHandle / >);
		const dragRegion = container.querySelector('.drag-region');

		expect(dragRegion).toBeInTheDocument();
		expect(dragRegion).toHaveStyle({
			WebkitAppRegion: 'drag'
		});
	});

	it('includes grip icon', () => {
		const {container} = render(<DragHandle / >);
		const icon = container.querySelector('svg');

		expect(icon).toBeInTheDocument();
	});

	it('is positioned at top center', () => {
		const {container} = render(<DragHandle / >);
		const handle = container.firstChild;

		expect(handle).toHaveClass('top-0', 'left-1/2', '-translate-x-1/2');
	});
});
```

## Performance

### Resource Usage

- **Render**: Single small component
- **Memory**: Negligible
- **CPU**: None (CSS-based)
- **Drag performance**: Native OS handling

### Optimization

- Pure component (no state)
- CSS-only drag functionality
- No event listeners
- No re-renders during drag

## Security Considerations

### No Security Concerns

- CSS-only feature
- No user input handling
- No data transmission
- No state management
- Pure visual/interactive element

## Related Documentation

- [Window Controls Feature](./WINDOW_CONTROLS.md)
- [Context Menu Feature](./CONTEXT_MENU.md)
- [Electron Integration](../architecture/ELECTRON_INTEGRATION.md)
- [Component Structure](../architecture/COMPONENT_STRUCTURE.md)

