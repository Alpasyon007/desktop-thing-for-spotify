# State Management

## Overview

Desktop Thing for Spotify uses a combination of React hooks and local component state for state management. This
document explains how data flows through the application and where different types of state are managed.

## State Architecture

### State Layers

```
┌─────────────────────────────────────────┐
│     Component Local State (useState)    │  ← UI-specific state
├─────────────────────────────────────────┤
│     Custom Hooks State                  │  ← Shared business logic
├─────────────────────────────────────────┤
│     Browser Storage (localStorage)      │  ← Persistent data
├─────────────────────────────────────────┤
│     External API (Spotify)              │  ← Source of truth
└─────────────────────────────────────────┘
```

## State Categories

### 1. Authentication State

**Managed by**: `useSpotifyAuth` hook

**State**:

```typescript
{
	isAuthenticated: boolean;
	isAuthenticating: boolean;
	accessToken: string | null;
	refreshToken: string | null;
}
```

**Persistence**: `localStorage`

- `spotify_access_token`
- `spotify_refresh_token`
- `spotify_token_expiry`

**Flow**:

```
User clicks login
  ↓
Redirect to Spotify OAuth
  ↓
Callback with code
  ↓
Exchange for tokens
  ↓
Store in localStorage
  ↓
Update hook state
  ↓
Components re-render
```

### 2. Playback State

**Managed by**: `useSpotifyPlayback` hook

**State**:

```typescript
{
	playbackState: SpotifyPlaybackState | null;
	playlists: Playlist[];
	isLastPlayed: boolean;
}
```

**Source**: Spotify Web API (polled every 1 second)

**Flow**:

```
Poll interval triggers
  ↓
Fetch from Spotify API
  ↓
Update local state
  ↓
Store last played in localStorage
  ↓
Components receive new props
  ↓
UI updates
```

### 3. Window Control State

**Managed by**: `useWindowControls` hook

**State**:

```typescript
{
	isAlwaysOnTop: boolean;
}
```

**Synchronization**: React state ↔ Electron window state

**Flow**:

```
User toggles always on top
  ↓
React state updates
  ↓
IPC message to main process
  ↓
Electron window.setAlwaysOnTop()
  ↓
States synchronized
```

### 4. View State

**Managed by**: Local component state in `SpotifyPlayer`

**State**:

```typescript
{
	currentView: 'login' | 'player' | 'playlists';
}
```

**Flow**:

```
User action (e.g., "Go to Playlists")
  ↓
setState('playlists')
  ↓
Conditional rendering updates
  ↓
New view displayed
```

### 5. UI State

**Managed by**: Individual component state

**Examples**:

- Context menu open/closed
- Hover states
- Loading indicators
- Input focus

**Scope**: Local to component

## Data Flow Patterns

### Unidirectional Data Flow

```
State (Hook)
    ↓
Props
    ↓
Component
    ↓
User Action
    ↓
Event Handler
    ↓
State Update
    ↓
Re-render
```

### Polling Pattern

```typescript
useEffect(() => {
	if (!accessToken) return;

	const fetchPlayback = async () => {
		const state = await getPlaybackState(accessToken);
		setPlaybackState(state);
	};

	fetchPlayback(); // Initial fetch
	const interval = setInterval(fetchPlayback, 1000);

	return () => clearInterval(interval); // Cleanup
}, [accessToken]);
```

### Event-Driven Updates

```typescript
// User clicks button
const handlePlay = async () => {
	await playTrack(accessToken);
	// Next poll cycle will reflect the change
};
```

## State Management by Hook

### useSpotifyAuth

**Responsibilities**:

- OAuth flow management
- Token storage and retrieval
- Token refresh
- Authentication status

**State Updates**:

- Login: Sets tokens, updates `isAuthenticated`
- Logout: Clears tokens, resets state
- Token refresh: Updates access token

**Persistence**: localStorage

### useSpotifyPlayback

**Responsibilities**:

- Polling Spotify API
- Managing playback state
- Playlist data
- Last played state

**State Updates**:

- Poll interval: Updates playback state
- Playlist fetch: Updates playlists array
- Track change: Updates last played

**Persistence**: localStorage (last played only)

### usePlaybackControls

**Responsibilities**:

- Handling user actions
- API calls for controls
- No state management (stateless handlers)

**Pattern**: Action → API call → Poll detects change

### useWindowControls

**Responsibilities**:

- Window operation handlers
- Always-on-top state
- IPC communication

**State Updates**:

- Toggle always-on-top: Updates local state, syncs to Electron

**Persistence**: None (resets on restart)

## State Synchronization

### React ↔ Electron

The app synchronizes state between React and Electron:

**Example: Always on Top**

```typescript
// React state
const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(false);

// Update both
const toggleAlwaysOnTop = () => {
	const newState = !isAlwaysOnTop;
	setIsAlwaysOnTop(newState);           // React
	window.electron?.setAlwaysOnTop(newState); // Electron
};
```

**Challenge**: Keeping both in sync
**Solution**: Single source of truth (user action) updates both

### Client ↔ Server

**Polling approach** for Spotify state:

- Client polls every 1 second
- Server (Spotify) is source of truth
- Client displays server state

**Benefits**:

- Simple implementation
- No WebSocket complexity
- Reliable

**Tradeoffs**:

- 1-second delay
- Continuous network requests
- API rate limit considerations

## Performance Considerations

### Minimizing Re-renders

**Strategies used**:

1. **useCallback for stable functions**:

```typescript
const handleClick = useCallback(() => {
	// Handler logic
}, [dependencies]);
```

2. **Split state appropriately**:

```typescript
// Separate concerns
const [playbackState, setPlaybackState] = useState(null);
const [playlists, setPlaylists] = useState([]);
// Not one giant state object
```

3. **Conditional effects**:

```typescript
useEffect(() => {
	if (!shouldUpdate) return;
	// Effect logic
}, [shouldUpdate, dependencies]);
```

### Avoiding Unnecessary API Calls

**Patterns**:

1. **Debouncing**: For user input
2. **Conditional polling**: Only when authenticated
3. **Cleanup**: Clear intervals on unmount

```typescript
useEffect(() => {
	if (!accessToken) return; // Don't poll if not authenticated

	const interval = setInterval(pollAPI, 1000);
	return () => clearInterval(interval); // Cleanup
}, [accessToken]);
```

## Future State Management

### Potential Improvements

1. **State Management Library**:
    - Zustand for global state
    - Jotai for atomic state
    - Redux Toolkit if complexity grows

2. **React Query**:
    - Better API state management
    - Automatic caching
    - Background refetching

3. **Context API**:
    - For truly global state
    - Avoid prop drilling
    - Currently not needed (flat hierarchy)

### When to Migrate

Consider a state management library when:

- State becomes complex
- Many components need same state
- Performance issues from re-renders
- State updates are hard to track

## Common Patterns

### Loading States

```typescript
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
	const fetchData = async () => {
		try {
			setIsLoading(true);
			const result = await fetch();
			setData(result);
		} catch (err) {
			setError(err);
		} finally {
			setIsLoading(false);
		}
	};

	fetchData();
}, []);
```

### Derived State

```typescript
// Don't store derived state
const [items, setItems] = useState([]);
// const [itemCount, setItemCount] = useState(0); // ❌ Unnecessary

// Derive it instead
const itemCount = items.length; // ✅ Always in sync
```

### Previous State

```typescript
const [count, setCount] = useState(0);

// Use functional update for dependent state
const increment = () => {
	setCount(prev => prev + 1); // ✅ Safe
};
```

## Debugging State

### React DevTools

Use React DevTools to inspect:

- Component state
- Props
- Hook state
- Re-render causes

### Console Logging

Strategic logging:

```typescript
useEffect(() => {
	console.log('Playback state updated:', playbackState);
}, [playbackState]);
```

### State Visualization

Log state changes for debugging:

```typescript
const [state, setState] = useState(initialState);

const setStateWithLog = (newState) => {
	console.log('State change:', {from: state, to: newState});
	setState(newState);
};
```

## Best Practices

### Do's

✅ **Keep state close to where it's used**
✅ **Use the right hook for the job**
✅ **Clean up effects and intervals**
✅ **Handle loading and error states**
✅ **Use TypeScript for type safety**

### Don'ts

❌ **Don't store derived state**
❌ **Don't mutate state directly**
❌ **Don't forget dependencies**
❌ **Don't over-optimize prematurely**
❌ **Don't use global state for everything**

## Related Documentation

- [Component Structure](./COMPONENT_STRUCTURE.md)
- [Architecture Overview](./OVERVIEW.md)
- [Electron Integration](./ELECTRON_INTEGRATION.md)

