# Code Style Guide

## Overview

This guide defines coding standards and best practices for Desktop Thing for Spotify. Consistent code style makes the
codebase easier to read, maintain, and collaborate on.

## General Principles

1. **Readability First** - Code is read more often than written
2. **Consistency** - Follow existing patterns in the codebase
3. **Simplicity** - Prefer simple, clear solutions over clever ones
4. **Type Safety** - Use TypeScript features to catch errors early
5. **Documentation** - Comment complex logic, document public APIs

## TypeScript

### Type Annotations

Always annotate function parameters and return types:

```typescript
// ✅ Good
function formatTime(seconds: number): string {
	return `${Math.floor(seconds / 60)}:${seconds % 60}`;
}

// ❌ Bad
function formatTime(seconds) {
	return `${Math.floor(seconds / 60)}:${seconds % 60}`;
}
```

### Interfaces vs Types

**Use interfaces for:**

- Component props
- Object shapes
- Extensible contracts

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}
```

**Use types for:**

- Unions
- Intersections
- Mapped types

```typescript
type View = 'login' | 'player' | 'playlists';
type Nullable<T> = T | null;
```

### Avoid `any`

Use specific types or `unknown` instead of `any`:

```typescript
// ✅ Good
function handleData(data: unknown) {
  if (typeof data === 'string') {
    return data.toUpperCase();
  }
}

// ❌ Bad
function handleData(data: any) {
  return data.toUpperCase();
}
```

## React Components

### Function Components

Use function components with TypeScript:

```typescript
interface PlayerProps {
  track: Track;
  onPlay: () => void;
}

export function Player({ track, onPlay }: PlayerProps) {
  return (
    <div>
      <h2>{track.name}</h2>
      <button onClick={onPlay}>Play</button>
    </div>
  );
}
```

### Component Naming

- **PascalCase** for components: `AlbumArt`, `PlaybackControls`
- **Descriptive names**: Clearly indicate what the component does
- **Avoid abbreviations**: `TrackInformation` not `TrackInfo` (unless very common)

### Props Destructuring

Destructure props in the function signature:

```typescript
// ✅ Good
export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// ❌ Bad
export function Button(props: ButtonProps) {
  return <button onClick={props.onClick}>{props.label}</button>;
}
```

### Default Props

Use default parameters:

```typescript
interface CardProps {
	title: string;
	size?: 'sm' | 'md' | 'lg';
}

export function Card({title, size = 'md'}: CardProps) {
	// ...
}
```

## Hooks

### Custom Hook Naming

Always start with `use`:

```typescript
// ✅ Good
export function useSpotifyAuth() {
}

export function useWindowControls() {
}

// ❌ Bad
export function spotifyAuth() {
}

export function getWindowControls() {
}
```

### Hook Dependencies

Always include all dependencies in dependency arrays:

```typescript
// ✅ Good
useEffect(() => {
	if (accessToken) {
		fetchPlaybackState(accessToken);
	}
}, [accessToken]); // Include accessToken

// ❌ Bad
useEffect(() => {
	if (accessToken) {
		fetchPlaybackState(accessToken);
	}
}, []); // Missing dependency
```

### UseCallback and UseMemo

Use for functions passed as props or expensive calculations:

```typescript
const handleClick = useCallback(() => {
	setCount(count + 1);
}, [count]);

const expensiveValue = useMemo(() => {
	return computeExpensiveValue(data);
}, [data]);
```

## File Organization

### File Naming

- **Components**: PascalCase - `AlbumArt.tsx`, `PlaybackControls.tsx`
- **Hooks**: camelCase with `use` prefix - `useSpotifyAuth.ts`
- **Utils**: camelCase - `helpers.ts`, `formatters.ts`
- **Types**: camelCase - `types.ts`, `interfaces.ts`

### Import Order

Organize imports in this order:

```typescript
// 1. External libraries
import {useState, useEffect} from 'react';
import {Button} from '@/components/ui/button';

// 2. Internal modules
import {useSpotifyAuth} from './hooks/useSpotifyAuth';
import {formatTime} from './utils/helpers';

// 3. Types
import type {Track, Playlist} from './types';

// 4. Styles (if separate)
import styles from './Component.module.css';
```

### Export Style

**Named exports** for components and hooks:

```typescript
// ✅ Good
export function AlbumArt() {
}

export function useSpotifyAuth() {
}

// ❌ Avoid default exports
export default function AlbumArt() {
}
```

**Exception**: Page components in Next.js (required by framework)

## Styling

### Tailwind CSS

Use Tailwind utility classes for styling:

```typescript
// ✅ Good
<div className = "flex items-center gap-2 p-4 bg-zinc-900 rounded-lg" >
<h2 className = "text-xl font-bold text-white" > Title < /h2>
	< /div>

	// ❌ Avoid inline styles
	< div
style = {
{
	display: 'flex', padding
:
	'16px'
}
}>
<h2 style = {
{
	fontSize: '20px', fontWeight
:
	'bold'
}
}>
Title < /h2>
< /div>
```

### Class Organization

Order classes logically:

1. Layout (flex, grid, position)
2. Sizing (w-, h-, p-, m-)
3. Typography (text-, font-)
4. Colors (bg-, text-, border-)
5. Effects (shadow-, rounded-, transition-)

```typescript
<button className = "
flex
items - center
justify - center
w - 10
h - 10
p - 2
text - sm
font - medium
bg - blue - 500
text - white
rounded - lg
shadow - md
hover:bg - blue - 600
transition - colors
">
```

### Conditional Classes

Use template literals or a class utility:

```typescript
// With template literals
<div className={`
  base-classes
  ${isActive ? 'active-classes' : 'inactive-classes'}
`}>

// With cn utility (from lib/utils.ts)
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  isActive && "active-classes",
  isDisabled && "opacity-50"
)}>
```

## State Management

### Local State

Use `useState` for component-local state:

```typescript
const [count, setCount] = useState(0);
const [isOpen, setIsOpen] = useState(false);
```

### State Updates

Use functional updates for state that depends on previous state:

```typescript
// ✅ Good
setCount(prevCount => prevCount + 1);

// ❌ Avoid
setCount(count + 1);
```

### Complex State

Use `useReducer` for complex state logic:

```typescript
interface State {
	count: number;
	step: number;
}

type Action =
	| { type: 'increment' }
	| { type: 'decrement' }
	| { type: 'setStep'; payload: number };

function reducer(state: State, action: Action): State {
	switch (action.type) {
		case 'increment':
			return {...state, count: state.count + state.step};
		case 'decrement':
			return {...state, count: state.count - state.step};
		case 'setStep':
			return {...state, step: action.payload};
		default:
			return state;
	}
}
```

## Error Handling

### Try-Catch

Always handle errors in async operations:

```typescript
const fetchData = async () => {
	try {
		const response = await fetch(url);
		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Failed to fetch data:', error);
		// Handle error appropriately
	}
};
```

### Null Checking

Use optional chaining and nullish coalescing:

```typescript
// ✅ Good
const name = user?.profile?.name ?? 'Unknown';

// ❌ Avoid
const name = user && user.profile && user.profile.name || 'Unknown';
```

## Comments

### When to Comment

**Do comment:**

- Complex algorithms
- Non-obvious business logic
- Workarounds or hacks
- Public API documentation

**Don't comment:**

- Obvious code
- What the code does (code should be self-documenting)

### Comment Style

```typescript
// ✅ Good - Explains why
// Poll every 1 second to balance UX and API rate limits
const POLL_INTERVAL = 1000;

// ❌ Bad - Explains what (obvious from code)
// Set poll interval to 1000
const POLL_INTERVAL = 1000;
```

### JSDoc for Public APIs

```typescript
/**
 * Formats a duration in seconds to MM:SS format
 * @param seconds - The duration in seconds
 * @returns Formatted string in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

## Formatting

### Prettier Configuration

The project uses Prettier with this configuration:

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "useTabs": true,
  "trailingComma": "es5",
  "printWidth": 120
}
```

**Run Prettier**:

```bash
npm run format        # Format all files
npm run format:check  # Check without modifying
```

### ESLint

Follow ESLint rules. Run linting:

```bash
npm run lint
```

Common rules:

- No unused variables
- No console.log in production
- Proper hook dependencies
- TypeScript strict mode

## Best Practices

### Component Size

Keep components small and focused:

- **Target**: 50-100 lines
- **Maximum**: 200 lines
- **If larger**: Split into smaller components

### Function Complexity

Keep functions simple:

- **One responsibility** per function
- **Early returns** to reduce nesting
- **Extract complex logic** into separate functions

```typescript
// ✅ Good - Early return
function processData(data: Data | null) {
	if (!data) return null;

	return transformData(data);
}

// ❌ Bad - Nested
function processData(data: Data | null) {
	if (data) {
		return transformData(data);
	} else {
		return null;
	}
}
```

### Avoid Magic Numbers

Use named constants:

```typescript
// ✅ Good
const POLL_INTERVAL_MS = 1000;
const MAX_RETRIES = 3;

setInterval(pollPlayback, POLL_INTERVAL_MS);

// ❌ Bad
setInterval(pollPlayback, 1000);
```

### Boolean Naming

Use clear, positive names:

```typescript
// ✅ Good
const isAuthenticated = true;
const hasPlaylists = playlists.length > 0;
const shouldPoll = !isPaused;

// ❌ Avoid negatives
const notAuthenticated = false;
```

## Performance

### Avoid Unnecessary Re-renders

Use `React.memo` for expensive components:

```typescript
export const ExpensiveComponent = React.memo(({data}) => {
	// Expensive rendering logic
});
```

### Lazy Loading

Use dynamic imports for large components:

```typescript
const PlaylistsView = dynamic(() => import('./views/PlaylistsView'), {
	loading: () => <LoadingSpinner / >
});
```

### Debounce/Throttle

For frequent events:

```typescript
const debouncedSearch = useMemo(
	() => debounce((query) => performSearch(query), 300),
	[]
);
```

## Testing (Future)

### Test File Naming

- Place tests next to source: `Component.test.tsx`
- Or in `__tests__` directory

### Test Structure

```typescript
describe('Component', () => {
	it('renders with props', () => {
		// Arrange
		const props = {title: 'Test'};

		// Act
		render(<Component {...props}
		/>);

		// Assert
		expect(screen.getByText('Test')).toBeInTheDocument();
	});
});
```

## Common Patterns

### Conditional Rendering

```typescript
// Short conditions
{
	isLoading && <Spinner / >
}

// Either/or
{
	isAuthenticated ? <Player / > : <Login / >
}

// Multiple conditions
{
	!isLoading && isAuthenticated && <Player / >
}
```

### List Rendering

```typescript
{
	items.map((item) => (
		<Item key = {item.id}
	{...
		item
	}
	/>
))
}
```

Always provide a stable `key` prop!

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Questions?

If you're unsure about style decisions:

1. Look at existing code for examples
2. Ask in pull request comments
3. Refer to this guide
4. When in doubt, prioritize readability!

