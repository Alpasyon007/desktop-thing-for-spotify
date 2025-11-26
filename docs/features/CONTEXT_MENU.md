# Context Menu Feature

## Overview

The context menu provides quick access to application features and window controls through a right-click interface. It
adapts dynamically based on the current view and application state.

## User Experience

### Opening the Menu

1. Right-click anywhere in the application window
2. Menu appears at cursor position
3. Shows relevant options for current view

### Selecting an Option

1. Click on a menu item
2. Action executes immediately
3. Menu closes automatically

### Closing the Menu

- Click anywhere outside the menu
- Click a menu item
- Press Escape key (standard behavior)

## Menu Structure

### Player View Menu

```
┌──────────────────────┐
│ Go to Playlists      │
│ ✓ Always on Top      │  ← Checkmark when enabled
│ ───────────────────  │
│ Minimize             │
│ Close                │
└──────────────────────┘
```

### Playlists View Menu

```
┌──────────────────────┐
│ Back to Player       │
│ ✓ Always on Top      │  ← Checkmark when enabled
│ ───────────────────  │
│ Minimize             │
│ Close                │
└──────────────────────┘
```

### Dynamic Elements

- **Checkmark**: Appears next to "Always on Top" when enabled
- **First item**: Changes based on current view
- **Window controls**: Always present at bottom

## Implementation

### Component Structure

The context menu is implemented using Radix UI's DropdownMenu component with custom trigger behavior.

#### Menu Component

**Location**: Embedded in view components (PlayerView, PlaylistsView)

```typescript
<div onContextMenu = {handleContextMenu} >
	{/* View content */}

	< DropdownMenu
open = {menuOpen}
onOpenChange = {setMenuOpen} >
<DropdownMenuTrigger asChild >
<div
	style = {
{
	position: 'fixed',
		left
:
	`${menuPosition.x}px`,
		top
:
	`${menuPosition.y}px`,
		width
:
	'1px',
		height
:
	'1px',
		pointerEvents
:
	'none'
}
}
/>
< /DropdownMenuTrigger>

< DropdownMenuContent >
{/* Menu items */}
< /DropdownMenuContent>
< /DropdownMenu>
< /div>
```

#### Context Menu Handler

```typescript
const [menuOpen, setMenuOpen] = useState(false);
const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});

const handleContextMenu = useCallback((e: React.MouseEvent) => {
	e.preventDefault();
	setMenuPosition({x: e.clientX, y: e.clientY});
	setMenuOpen(true);
}, []);
```

**Key aspects**:

- Prevents default browser context menu
- Captures cursor position
- Opens custom menu at that position

### Menu Items

#### Navigation Items

```typescript
<DropdownMenuItem onSelect = {()
=>
{
	setShowingPlaylists(!showingPlaylists);
	setMenuOpen(false);
}
}>
{
	showingPlaylists ? 'Back to Player' : 'Go to Playlists'
}
</DropdownMenuItem>
```

**Features**:

- Dynamic label based on current view
- Toggles between views
- Closes menu after action

#### Toggle Items (Always on Top)

```typescript
<DropdownMenuItem onSelect = {windowControls.toggleAlwaysOnTop} >
	{windowControls.isAlwaysOnTop && '✓ '}
Always
on
Top
< /DropdownMenuItem>
```

**Features**:

- Shows checkmark when enabled
- Toggles state on click
- Visual feedback immediate

#### Separator

```typescript
<DropdownMenuSeparator / >
```

**Purpose**:

- Visual grouping of related items
- Separates navigation from window controls

#### Action Items (Window Controls)

```typescript
<DropdownMenuItem onSelect = {windowControls.minimize} >
	Minimize
	< /DropdownMenuItem>

	< DropdownMenuItem
onSelect = {windowControls.close} >
	Close
	< /DropdownMenuItem>
```

**Features**:

- Direct action execution
- No state to track
- Consistent across views

## Technical Details

### Using Radix UI DropdownMenu

The implementation uses Radix UI's DropdownMenu component in a non-standard way:

**Why DropdownMenu instead of ContextMenu?**

1. **Positioning control**: Better control over menu position
2. **State management**: Easier to manage open/close state
3. **Flexibility**: Can customize trigger behavior
4. **Compatibility**: Works well with React patterns

**The Invisible Trigger Pattern**:

```typescript
<DropdownMenuTrigger asChild >
<div
	style = {
{
	position: 'fixed',
		left
:
	`${menuPosition.x}px`,
		top
:
	`${menuPosition.y}px`,
		width
:
	'1px',
		height
:
	'1px',
		pointerEvents
:
	'none'
}
}
/>
< /DropdownMenuTrigger>
```

**How it works**:

1. Create a 1px invisible div at cursor position
2. Use it as the dropdown trigger
3. Radix positions menu relative to trigger
4. Result: Menu appears at cursor like native context menu

### State Management

#### Local State

```typescript
const [menuOpen, setMenuOpen] = useState(false);
const [menuPosition, setMenuPosition] = useState({x: 0, y: 0});
```

**Purpose**:

- `menuOpen`: Control menu visibility
- `menuPosition`: Track cursor position for placement

#### External State

The menu consumes state from hooks:

- `windowControls.isAlwaysOnTop`: For checkmark
- `showingPlaylists`: For navigation label

### Event Handling

#### Right-Click Event

```typescript
const handleContextMenu = useCallback((e: React.MouseEvent) => {
	e.preventDefault();  // Prevent native menu
	setMenuPosition({x: e.clientX, y: e.clientY});
	setMenuOpen(true);
}, []);
```

**Responsibilities**:

1. Prevent default browser context menu
2. Capture click position
3. Open custom menu

#### Menu Item Selection

```typescript
<DropdownMenuItem onSelect = {()
=>
{
	// Perform action
	setMenuOpen(false);  // Close menu
}
}>
```

**Pattern**:

- Execute action first
- Close menu after
- Clean state management

### Styling

The menu uses Tailwind CSS classes with Radix UI components:

```typescript
<DropdownMenuContent
	className = "min-w-[160px] bg-zinc-900 border border-zinc-700 rounded-md p-1"
>
<DropdownMenuItem
	className = "px-3 py-2 cursor-pointer hover:bg-zinc-800 rounded"
	>
```

**Features**:

- Dark theme consistent with app
- Hover states for items
- Proper spacing and borders

## Platform Behavior

### Windows

- Standard right-click behavior
- Menu appears at cursor
- Consistent with Windows conventions

### macOS

- Works with Control+Click or right-click
- May feel different from native menus
- Function over form approach

### Linux

- Behavior depends on desktop environment
- Generally consistent with Windows
- May vary slightly by WM

## Edge Cases

### Menu Position at Screen Edge

Currently, Radix UI handles this automatically:

- Menu stays within viewport
- Adjusts position if needed
- No custom logic required

### Rapid Opening/Closing

Prevented by state management:

- `menuOpen` state prevents double-open
- `onOpenChange` handles close properly
- Clean state transitions

### Menu Open + View Change

Handled by controlled state:

- View change can close menu
- State is view-specific
- No lingering menus

## Evolution History

The context menu implementation has evolved through several iterations:

### Version 1: Native Menu Attempt

**Approach**: Try to use Electron's native Menu
**Issues**:

- Complex IPC for each item
- State sync problems
- Platform inconsistencies

### Version 2: Radix ContextMenu

**Approach**: Use Radix UI's ContextMenu component
**Issues**:

- Less positioning control
- Harder to customize
- Not quite right feel

### Version 3: DropdownMenu with Custom Trigger (Current)

**Approach**: Use DropdownMenu with invisible positioned trigger
**Benefits**:

- Full control over position
- Easy state management
- Consistent behavior
- Simple implementation

## User Benefits

### Quick Access

- Right-click anywhere for menu
- No need to find specific buttons
- Familiar interaction pattern

### Contextual Options

- Menu adapts to current view
- Relevant actions always available
- Less UI clutter

### Keyboard Alternative

For users who prefer keyboard:

- Future: Shift+F10 standard shortcut
- Future: Custom hotkeys for actions

## Accessibility

### Current State

- Menu items have clear labels
- Keyboard navigation works (Tab, Arrow keys)
- Enter/Space to select
- Escape to close

### Future Improvements

1. **ARIA labels**: Better screen reader support
2. **Keyboard shortcut**: Open menu with keyboard
3. **Focus management**: Better focus handling
4. **High contrast**: Support high contrast themes

## Known Limitations

### Mobile/Touch

- No touch equivalent (long press)
- Not applicable for desktop app
- Could add if supporting tablets

### Nested Menus

- Currently single-level menu
- No submenus implemented
- Could add if needed

### Custom Positioning

- Relies on Radix positioning
- Limited manual control
- Generally works well

## Future Enhancements

### Potential Features

1. **Menu Sections**: Group related items with headers
2. **Icons**: Add icons to menu items for clarity
3. **Keyboard Shortcuts**: Show shortcuts in menu
4. **Recent Actions**: Quick access to recent features
5. **Customization**: User-configurable menu items

### Code Improvements

1. **Extract Menu Component**: Make reusable component
2. **Menu Config**: Centralize menu structure
3. **Type Safety**: Stronger TypeScript types
4. **Testing**: Add comprehensive tests

## Development Guide

### Adding a New Menu Item

1. **Add to menu structure**:
   ```typescript
   <DropdownMenuItem onSelect={handleNewAction}>
     New Action
   </DropdownMenuItem>
   ```

2. **Implement handler**:
   ```typescript
   const handleNewAction = useCallback(() => {
     // Perform action
     setMenuOpen(false);
   }, []);
   ```

3. **Add to both views** if applicable

### Making a Conditional Item

```typescript
{
	condition && (
		<DropdownMenuItem onSelect = {handleAction} >
			Conditional
	Item
	< /DropdownMenuItem>
)
}
```

### Adding a Submenu

```typescript
<DropdownMenuSub>
	<DropdownMenuSubTrigger>
		More
Options
< /DropdownMenuSubTrigger>
< DropdownMenuSubContent >
<DropdownMenuItem>Submenu
Item
1 < /DropdownMenuItem>
< DropdownMenuItem > Submenu
Item
2 < /DropdownMenuItem>
< /DropdownMenuSubContent>
< /DropdownMenuSub>
```

## Testing

### Manual Testing

1. **Basic Function**:
    - Right-click → Menu appears
    - Click outside → Menu closes
    - Click item → Action executes + menu closes

2. **Position**:
    - Right-click corners
    - Right-click edges
    - Verify menu stays in viewport

3. **State**:
    - Toggle "Always on Top"
    - Check checkmark appears/disappears
    - Switch views, verify menu changes

4. **Actions**:
    - Test each menu item
    - Verify intended behavior
    - Check for errors

### Automated Testing

```typescript
describe('Context Menu', () => {
	it('opens menu on right-click', () => {
		const {getByText} = render(<PlayerView / >);

		fireEvent.contextMenu(document.body);

		expect(getByText('Go to Playlists')).toBeInTheDocument();
	});

	it('shows checkmark when always on top', () => {
		// Mock windowControls with isAlwaysOnTop = true
		// Verify checkmark appears
	});

	it('executes action and closes menu', () => {
		const mockAction = jest.fn();
		// Render menu with mock action
		// Click item
		// Verify action called and menu closed
	});
});
```

## Related Documentation

- [Always on Top Feature](./ALWAYS_ON_TOP.md)
- [Window Controls](./WINDOW_CONTROLS.md)
- [Playlists Feature](./PLAYLISTS.md)
- [Component Structure](../architecture/COMPONENT_STRUCTURE.md)

