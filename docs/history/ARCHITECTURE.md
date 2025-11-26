# Spotify Player Component Architecture

## Component Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                      SpotifyPlayer (index.tsx)                   │
│                                                                  │
│  Uses:                                                           │
│  ├── useSpotifyAuth()        → Authentication state & handlers  │
│  ├── useSpotifyPlayback()    → Playback state & data           │
│  └── useWindowControls()     → Window/Electron controls         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─ Conditional Rendering
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐   ┌─────────────────┐
│  LoginView   │    │  PlaylistsView   │   │   PlayerView    │
│              │    │                  │   │                 │
│ When:        │    │ When:            │   │ When:           │
│ Not authed   │    │ Authed but no    │   │ Authed with     │
│              │    │ active track     │   │ active track    │
└──────────────┘    └──────────────────┘   └─────────────────┘
                              │                     │
                              │                     │
                    ┌─────────┴──────────┐         │
                    │                    │         │
                    ▼                    ▼         │
            ┌──────────────┐    ┌──────────────┐  │
            │   Playlist   │    │ ContextMenu  │  │
            │    Items     │    │              │  │
            └──────────────┘    └──────────────┘  │
                                                   │
                    ┌──────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────────┬─────────┬──────────────┐
│  AlbumArt   │TrackInfo│ ContextMenu  │
└─────────────┴─────────┴──────────────┘
        │
        └─────────────────┐
                          │
        ┌─────────────────┼──────────────────┐
        │                 │                  │
        ▼                 ▼                  ▼
┌──────────────┬──────────────────┬────────────────┐
│VolumeControl │PlaybackControls  │  ProgressBar   │
└──────────────┴──────────────────┴────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      Hooks (State Layer)                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  useSpotifyAuth                                              │
│  ├── isAuthenticated                                         │
│  ├── isAuthenticating                                        │
│  ├── handleLogin()                                           │
│  └── handleLogout()                                          │
│                                                              │
│  useSpotifyPlayback                                          │
│  ├── playbackState                                           │
│  ├── track                                                   │
│  ├── playlists                                               │
│  ├── volume                                                  │
│  └── updatePlaybackState()                                   │
│                                                              │
│  useWindowControls                                           │
│  ├── isMaximized                                             │
│  ├── contextMenuOpen                                         │
│  ├── handleMouseDown()                                       │
│  ├── handleMinimize()                                        │
│  └── handleMaximize()                                        │
│                                                              │
│  usePlaybackControls                                         │
│  ├── handlePlayPause()                                       │
│  ├── handleNext()                                            │
│  ├── handlePrevious()                                        │
│  └── handleVolumeChange()                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                     Views (Layout Layer)                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  LoginView          → Receives: auth, windowControls         │
│  PlaylistsView      → Receives: playlists, windowControls    │
│  PlayerView         → Receives: playback, windowControls     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                  Components (UI Layer)                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  AlbumArt           → albumArt, albumName                    │
│  TrackInfo          → trackName, artists, nextTrack          │
│  PlaybackControls   → isPlaying, onPlay, onNext, etc.       │
│  VolumeControl      → volume, onVolumeChange                 │
│  ProgressBar        → progress, duration, onSeek             │
│  ContextMenu        → isOpen, position, actions              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   Utils (Helper Layer)                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  formatTime()           → Convert ms to MM:SS                │
│  getProgressPercentage() → Calculate playback progress       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Interaction Flow

### User Plays a Song

```
User clicks Play
    │
    ▼
PlaybackControls.onPlayPause()
    │
    ▼
usePlaybackControls.handlePlayPause()
    │
    ▼
spotifyService.togglePlayback()
    │
    ▼
useSpotifyPlayback.updatePlaybackState()
    │
    ▼
UI Updates (PlayerView re-renders)
```

### Authentication Flow

```
User clicks Login
    │
    ▼
LoginView.onLogin()
    │
    ▼
useSpotifyAuth.handleLogin()
    │
    ▼
spotifyService.getAuthUrl()
    │
    ▼
Open browser for OAuth
    │
    ▼
Poll for tokens
    │
    ▼
setIsAuthenticated(true)
    │
    ▼
Switch to PlaylistsView or PlayerView
```

## File Responsibilities

| Layer          | Files        | Purpose                               |
|----------------|--------------|---------------------------------------|
| **Entry**      | `index.tsx`  | Routes to correct view based on state |
| **Hooks**      | `use*.ts`    | Manage state, side effects, API calls |
| **Views**      | `*View.tsx`  | Compose components, handle layout     |
| **Components** | `*.tsx`      | Render UI, receive props, emit events |
| **Utils**      | `helpers.ts` | Pure functions, calculations          |
| **Types**      | `types.ts`   | Shared TypeScript interfaces          |

## Key Design Patterns

1. **Container/Presenter**: Hooks (containers) + Components (presenters)
2. **Composition**: Views compose multiple components
3. **Single Responsibility**: Each file has one clear job
4. **Separation of Concerns**: UI, logic, state are separate
5. **Props Down, Events Up**: Data flows down, events bubble up

