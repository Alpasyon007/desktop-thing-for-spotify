# Architecture Overview

## System Design

Desktop Thing for Spotify is a hybrid desktop application that combines:

- **Next.js** - React framework for the UI layer
- **Electron** - Desktop application wrapper
- **Spotify Web API** - Music data and playback control
- **TypeScript** - Type-safe development

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Electron Main Process                   │
│  - Window Management                                         │
│  - Native Menu                                               │
│  - IPC Communication                                         │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ IPC
                  │
┌─────────────────▼───────────────────────────────────────────┐
│                   Electron Renderer Process                  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Next.js Application                      │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │         React Components Layer            │   │  │
│  │  │  - Spotify Player                          │   │  │
│  │  │  - Views (Login, Player, Playlists)        │   │  │
│  │  │  - UI Components                           │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │         Custom Hooks Layer                │   │  │
│  │  │  - useSpotifyAuth                          │   │  │
│  │  │  - useSpotifyPlayback                      │   │  │
│  │  │  - usePlaybackControls                     │   │  │
│  │  │  - useWindowControls                       │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │         Services Layer                     │   │  │
│  │  │  - Spotify API Client                      │   │  │
│  │  │  - Authentication Service                  │   │  │
│  │  └──────────────────────────────────────────────┘   │  │
│  │                                                        │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────┬────────────────────────────────────────────┘
                  │
                  │ HTTPS
                  │
┌─────────────────▼────────────────────────────────────────────┐
│                     Spotify Web API                          │
│  - OAuth 2.0 Authentication                                  │
│  - Playback State                                            │
│  - Playback Control                                          │
│  - User Playlists                                            │
└──────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **React 19** - UI library
- **Next.js 16** - React framework with SSR capabilities
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Radix UI** - Headless UI components

### Desktop

- **Electron 39** - Desktop application framework
- **electron-serve** - Serve Next.js app in Electron

### API Integration

- **Spotify Web API** - Music data and control
- **spotify-web-api-node** - Node.js wrapper for Spotify API

### Development

- **TypeScript** - Type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple processes

## Project Structure

```
desktop-thing-for-spotify/
├── src/                          # Source code
│   ├── app/                      # Next.js app directory
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Main page
│   │   └── globals.css          # Global styles
│   │
│   ├── components/              # React components
│   │   └── spotify-player/      # Main player component
│   │       ├── index.tsx        # Entry point
│   │       ├── components/      # UI components
│   │       ├── hooks/           # Custom hooks
│   │       ├── views/           # View components
│   │       └── utils/           # Utilities
│   │
│   ├── lib/                     # Shared libraries
│   │   ├── spotify.ts          # Spotify API client
│   │   └── utils.ts            # Utility functions
│   │
│   └── types/                   # TypeScript definitions
│       └── electron.d.ts       # Electron types
│
├── js/electron/                 # Electron process files
│   ├── main.js                 # Main process
│   └── preload.js              # Preload script
│
├── public/                      # Static assets
│   └── icon.ico                # App icon
│
├── docs/                        # Documentation
│   ├── getting-started/        # Setup guides
│   ├── architecture/           # Architecture docs
│   ├── features/               # Feature docs
│   └── development/            # Development guides
│
└── Configuration files
    ├── package.json            # Dependencies & scripts
    ├── tsconfig.json           # TypeScript config
    ├── next.config.ts          # Next.js config
    ├── tailwind.config.ts      # Tailwind config
    └── eslint.config.mjs       # ESLint config
```

## Core Concepts

### 1. Separation of Concerns

The application follows a clear separation of concerns:

- **Electron Layer**: Window management, native menus, system integration
- **Next.js Layer**: Routing, rendering, server-side logic
- **React Layer**: UI components, state management, user interactions
- **API Layer**: External service integration (Spotify)

### 2. Component-Based Architecture

The React layer is organized into:

- **Views**: Top-level page components (Login, Player, Playlists)
- **Components**: Reusable UI components (AlbumArt, TrackInfo, etc.)
- **Hooks**: Business logic and state management
- **Utils**: Pure functions and helpers

### 3. Type Safety

TypeScript is used throughout for:

- Strong typing of components and functions
- Better IDE support and autocomplete
- Compile-time error detection
- Self-documenting code

### 4. State Management

State is managed at different levels:

- **Local State**: Component-level with `useState`
- **Custom Hooks**: Shared state logic with `useEffect`, `useCallback`
- **Context**: Not currently used, but available for global state

## Data Flow

### Authentication Flow

```
User clicks Login
  ↓
Redirect to Spotify OAuth
  ↓
User authorizes app
  ↓
Callback with authorization code
  ↓
Exchange code for access token
  ↓
Store tokens in localStorage
  ↓
Redirect to player view
```

### Playback State Flow

```
useSpotifyPlayback hook
  ↓
Poll Spotify API every 1s
  ↓
Fetch current playback state
  ↓
Update local state
  ↓
React re-renders components
  ↓
Display updated UI
```

### Control Flow

```
User clicks play/pause
  ↓
usePlaybackControls handler
  ↓
Call Spotify API endpoint
  ↓
API updates playback state
  ↓
Next poll cycle detects change
  ↓
UI updates
```

## Key Design Decisions

### Why Next.js for a Desktop App?

- Modern React features and patterns
- Great developer experience
- Easy to transition to web if needed
- SSR capabilities for potential future use

### Why Polling Instead of WebSockets?

- Spotify doesn't provide WebSocket API
- Polling is simpler and more reliable
- 1-second interval is acceptable for music playback
- Lower complexity, easier to debug

### Why Not Use Electron's IPC for State?

- State is UI-specific, belongs in React
- Electron is just a container
- Simpler architecture with less coupling
- Easier to test and maintain

### Why Custom Hooks?

- Reusable business logic
- Testable in isolation
- Cleaner component code
- Better separation of concerns

## Performance Considerations

### Optimization Strategies

- **Minimal re-renders**: Components only update when necessary
- **Efficient polling**: 1-second interval balances UX and API limits
- **Image caching**: Album art is cached by browser
- **Lazy loading**: Components load only when needed

### Resource Usage

- **CPU**: Minimal, mostly idle between polls
- **Memory**: ~100-150 MB typical usage
- **Network**: ~1 request per second to Spotify API
- **Disk**: Negligible, no local data storage

## Security

### Authentication

- OAuth 2.0 flow for secure authorization
- Tokens stored in localStorage (renderer process only)
- No credentials stored permanently
- PKCE flow for enhanced security

### Best Practices

- Environment variables for sensitive data
- No client secret in production builds
- HTTPS for all API communication
- Regular dependency updates

## Further Reading

- [Component Structure](./COMPONENT_STRUCTURE.md) - Detailed component breakdown
- [Spotify Player Architecture](./SPOTIFY_PLAYER.md) - Player component details
- [Electron Integration](./ELECTRON_INTEGRATION.md) - Electron-specific features
- [State Management](./STATE_MANAGEMENT.md) - How state flows through the app

