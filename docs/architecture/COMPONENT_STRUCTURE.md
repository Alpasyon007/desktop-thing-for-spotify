# Spotify Player Component Structure

## Overview

The Spotify Player is the core component of the application. It has been refactored from a monolithic 1100+ line
component into a modular, maintainable architecture following React best practices.

## Directory Structure

```
src/components/spotify-player/
├── index.tsx                      # Main entry point & orchestration
├── exports.ts                     # Public API exports
│
├── hooks/                         # Custom React hooks (business logic)
│   ├── useSpotifyAuth.ts         # OAuth authentication flow
│   ├── useSpotifyPlayback.ts     # Playback state polling & management
│   ├── useWindowControls.ts      # Electron window operations
│   └── usePlaybackControls.ts    # Playback action handlers
│
├── views/                         # Top-level view components
│   ├── LoginView.tsx             # Authentication screen
│   ├── PlayerView.tsx            # Main player interface
│   ├── PlaylistsView.tsx         # Playlists grid view
│   └── types.ts                  # Shared TypeScript types
│
├── components/                    # Reusable UI components
│   ├── AlbumArt.tsx              # Album artwork display
│   ├── TrackInfo.tsx             # Track title & artist information
│   ├── PlaybackControls.tsx      # Play/pause/skip buttons
│   ├── VolumeControl.tsx         # Volume slider
│   ├── ProgressBar.tsx           # Playback progress bar
│   └── DragHandle.tsx            # Window drag handle
│
└── utils/                         # Utility functions
    └── helpers.ts                 # Time formatting, calculations
```

## Component Hierarchy

```
SpotifyPlayer (index.tsx)
│
├── Hooks (State & Logic)
│   ├── useSpotifyAuth()           # Authentication state
│   ├── useSpotifyPlayback()       # Playback state
│   ├── usePlaybackControls()      # Control handlers
│   └── useWindowControls()        # Window operations
│
└── Conditional View Rendering
    │
    ├── LoginView                   # When not authenticated
    │   └── Window controls
    │
    ├── PlaylistsView               # When viewing playlists
    │   ├── Window controls
    │   ├── Playlist grid
    │   └── Context menu
    │
    └── PlayerView                  # Main player (default)
        ├── Context menu
        ├── DragHandle
        ├── AlbumArt
        ├── TrackInfo
        ├── PlaybackControls
        ├── ProgressBar
        └── VolumeControl
```

## Architecture Principles

### 1. Single Responsibility Principle

Each file has one clear, focused purpose:

| File                     | Responsibility                                     |
|--------------------------|----------------------------------------------------|
| `useSpotifyAuth.ts`      | OAuth flow, token management, login/logout         |
| `useSpotifyPlayback.ts`  | Polling Spotify API, managing playback state       |
| `usePlaybackControls.ts` | Handling user interactions for playback            |
| `useWindowControls.ts`   | Electron window operations (minimize, close, etc.) |
| `AlbumArt.tsx`           | Display album artwork with fallback                |
| `TrackInfo.tsx`          | Display track title, artist, album                 |
| `PlaybackControls.tsx`   | Render play/pause/skip buttons                     |
| `ProgressBar.tsx`        | Display and control playback progress              |
| `VolumeControl.tsx`      | Display and control volume                         |

### 2. Separation of Concerns

Clear boundaries between different aspects:

- **Hooks**: Business logic, API calls, state management
- **Views**: Page-level composition, layout, view-specific logic
- **Components**: Presentational UI, props-based rendering
- **Utils**: Pure functions, no side effects

### 3. Component Composition

Instead of one massive component:

- Small, focused components (20-100 lines each)
- Clear props interfaces
- Easy to understand, test, and modify
- Reusable across different views

### 4. Type Safety

- All props have TypeScript interfaces
- Shared types in `views/types.ts`
- Better IDE autocomplete and error checking
- Self-documenting code

## Key Components

### Main Entry Point (`index.tsx`)

The orchestrator that:

- Initializes all hooks
- Determines which view to render
- Passes state and handlers to views
- Manages high-level application state

```typescript
export default function SpotifyPlayer() {
	// Initialize hooks
	const auth = useSpotifyAuth();
	const playback = useSpotifyPlayback(auth.accessToken);
	const controls = usePlaybackControls(auth.accessToken);
	const window = useWindowControls();

	// Conditional rendering based on state
	if (!auth.isAuthenticated) return <LoginView / >;
	if (playback.showingPlaylists) return <PlaylistsView / >;
	return <PlayerView / >;
}
```

### Custom Hooks

#### `useSpotifyAuth`

Manages authentication state and OAuth flow:

- Login/logout functionality
- Token storage and retrieval
- Authentication state
- Redirects to Spotify OAuth

**Returns:**

```typescript
{
	isAuthenticated: boolean;
	accessToken: string | null;
	login: () => void;
	logout: () => void;
}
```

#### `useSpotifyPlayback`

Polls Spotify API for playback state:

- Fetches current playback every 1 second
- Manages playback state
- Handles playlists view toggle
- Implements persistent last-played state

**Returns:**

```typescript
{
	currentTrack: Track | null;
	isPlaying: boolean;
	progress: number;
	duration: number;
	volume: number;
	showingPlaylists: boolean;
	isLastPlayed: boolean;
	setShowingPlaylists: (show: boolean) => void;
}
```

#### `usePlaybackControls`

Provides handlers for playback actions:

- Play/pause toggle
- Next/previous track
- Seek to position
- Volume control

**Returns:**

```typescript
{
	togglePlayback: () => Promise<void>;
	nextTrack: () => Promise<void>;
	previousTrack: () => Promise<void>;
	seekToPosition: (positionMs: number) => Promise<void>;
	setVolume: (volumePercent: number) => Promise<void>;
}
```

#### `useWindowControls`

Handles Electron window operations:

- Minimize window
- Close window
- Toggle always on top
- Context menu state

**Returns:**

```typescript
{
	minimize: () => void;
	close: () => void;
	toggleAlwaysOnTop: () => void;
	isAlwaysOnTop: boolean;
}
```

### View Components

#### `LoginView`

- Displays login button
- Handles authentication initiation
- Shows window controls

#### `PlayerView`

- Main player interface
- Composes all player components
- Handles context menu
- Displays drag handle

#### `PlaylistsView`

- Displays user's playlists in a grid
- Handles playlist selection
- Provides back navigation
- Shows context menu

### UI Components

All UI components follow a consistent pattern:

- Accept props for data and handlers
- Minimal internal state
- Focused on presentation
- Reusable and composable

Example component signature:

```typescript
interface AlbumArtProps {
	imageUrl: string | null;
	alt: string;
	size?: 'sm' | 'md' | 'lg';
}

export function AlbumArt({imageUrl, alt, size = 'md'}: AlbumArtProps) {
	// Render album art with fallback
}
```

## Data Flow

### Authentication Flow

```
User Action (LoginView)
  ↓
useSpotifyAuth.login()
  ↓
Redirect to Spotify OAuth
  ↓
Callback with code
  ↓
Token exchange
  ↓
Store in localStorage
  ↓
isAuthenticated = true
  ↓
Render PlayerView
```

### Playback Update Flow

```
useSpotifyPlayback (every 1s)
  ↓
Fetch from Spotify API
  ↓
Update local state
  ↓
React re-renders
  ↓
Components receive new props
  ↓
UI updates
```

### Control Action Flow

```
User clicks button
  ↓
Component calls handler
  ↓
usePlaybackControls handler
  ↓
Spotify API call
  ↓
API updates server state
  ↓
Next poll detects change
  ↓
UI updates
```

## Benefits of This Architecture

### Maintainability

- **Easy bug fixes**: Locate issues in specific files
- **Clear boundaries**: Know where to make changes
- **Simpler reviews**: Smaller, focused changes
- **Less coupling**: Changes don't ripple everywhere

### Testability

- **Unit tests**: Test hooks in isolation
- **Component tests**: Test UI without business logic
- **Mock dependencies**: Easy to mock API calls
- **Integration tests**: Test view composition

### Reusability

- **Portable hooks**: Use in other components
- **Composable UI**: Mix and match components
- **Shared utilities**: Reuse helpers anywhere
- **Flexible architecture**: Easy to extend

### Performance

- **Selective optimization**: Optimize specific components
- **Memoization**: Easy to apply `useMemo`/`useCallback`
- **Code splitting**: Split by view or component
- **Lazy loading**: Load views on demand

### Developer Experience

- **Fast navigation**: Jump to specific files quickly
- **Better IDE performance**: Smaller files load faster
- **Clear structure**: New developers onboard easily
- **Type safety**: Catch errors before runtime

## Making Changes

### Adding a New Feature

1. **Determine the category**:
    - Business logic → Create a hook
    - UI element → Create a component
    - New screen → Create a view

2. **Create the file** in the appropriate directory

3. **Import and use** in the parent component

4. **Add types** if needed in `views/types.ts`

### Modifying Existing Features

1. **Locate the file**:
    - Logic changes → Check hooks
    - UI changes → Check components/views
    - Utilities → Check utils

2. **Make focused changes** within that file

3. **Test** the isolated component/hook

4. **Verify** integration with parent components

### Common Patterns

| Task                   | Location                    |
|------------------------|-----------------------------|
| New playback action    | `usePlaybackControls.ts`    |
| New UI element         | `components/`               |
| New view/screen        | `views/`                    |
| New calculation        | `utils/helpers.ts`          |
| New API integration    | Create new hook in `hooks/` |
| Shared type definition | `views/types.ts`            |

## Best Practices

### Component Design

- Keep components under 100 lines
- Use TypeScript interfaces for all props
- Destructure props in function signature
- Use meaningful prop names
- Provide sensible defaults

### Hook Design

- One hook, one concern
- Return objects with named properties
- Use `useCallback` for stable function references
- Use `useEffect` dependencies correctly
- Clean up side effects (intervals, listeners)

### State Management

- Keep state close to where it's used
- Lift state only when necessary
- Use custom hooks for shared state logic
- Prefer props over context for small apps

### File Organization

- Group related files together
- Use index files for clean imports
- Keep directory depth shallow (max 3 levels)
- Name files descriptively

## Future Enhancements

Potential improvements to the architecture:

1. **State Management Library**: Consider Zustand or Jotai for complex state
2. **React Query**: For API state management and caching
3. **Component Library**: Extract components to separate package
4. **Testing Suite**: Add comprehensive test coverage
5. **Storybook**: Document and develop components in isolation

## Related Documentation

- [Architecture Overview](./OVERVIEW.md)
- [State Management](./STATE_MANAGEMENT.md)
- [Electron Integration](./ELECTRON_INTEGRATION.md)

