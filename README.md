# Spotify Desktop Player

A beautiful Spotify desktop player built with Next.js, Electron, and TypeScript that connects to your Spotify account to display currently playing tracks and provide playback controls.

## Features

- **Real-time playback display** - See what's currently playing on Spotify
- **Album artwork** - Beautiful display of album covers
- **Playback controls** - Play, pause, skip forward/backward
- **Progress tracking** - Visual progress bar with seek functionality
- **Spotify OAuth integration** - Secure login with your Spotify account
- **Desktop app** - Runs as a native desktop application with Electron
- **Modern UI** - Clean, responsive interface with dark theme

## Setup Instructions

### 1. Spotify App Registration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
2. Create a new app
3. Note your **Client ID** and **Client Secret**
4. Add `http://127.0.0.1:3004/callback` to your app's redirect URIs

### 2. Environment Configuration

1. Copy `.env.local.example` to `.env.local`
2. Fill in your Spotify credentials:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3004/callback
```

### 3. Installation & Running

```bash
# Install dependencies
npm install

# Run the development server (Next.js + Electron)
npm run dev
```

The app will open in Electron

## How to Use

1. **Launch the app** - Run `npm run dev` to start the desktop application
2. **Login to Spotify** - Click "Login with Spotify" and authorize the app
3. **Start playing music** - Play any song on Spotify (web, mobile, or desktop)
4. **Control playback** - Use the controls in the app to play/pause, skip tracks, or seek

## Required Spotify Permissions

The app requests the following Spotify scopes:
- `user-read-playback-state` - See what's currently playing
- `user-modify-playback-state` - Control playback (play/pause/skip)
- `user-read-currently-playing` - Get current track info
- `user-library-read` - Access your saved music
- `user-library-modify` - Save/unsave tracks
- `playlist-read-private` - Access private playlists
- `playlist-read-collaborative` - Access collaborative playlists

## Tech Stack

- **Next.js 15** - React framework
- **Electron** - Desktop app framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Spotify Web API** - Music data and controls

## Project Structure

```
src/
├── app/
│   ├── callback/           # Spotify OAuth callback
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main page
├── components/
│   ├── spotify-player.tsx # Main player component
│   ├── title-bar.tsx      # Electron title bar
│   └── ui/                # UI components
└── lib/
    └── spotify.ts         # Spotify API service
```

## Development

### Building for Production

```bash
# Build the app
npm run build

# This creates a distributable Electron app
```

### Scripts

- `npm run dev` - Start development server with Electron
- `npm run build` - Build for production

## Troubleshooting

### Common Issues

1. **"No access token available"** - Make sure you've completed the Spotify OAuth flow
2. **"No Music Playing"** - Start playing music on any Spotify client first
3. **Images not loading** - Check that Spotify image domains are allowed in next.config.ts
4. **OAuth redirect fails** - Verify the redirect URI matches exactly in your Spotify app settings

### Need Help?

- Check the browser console for error messages
- Ensure your Spotify app has the correct redirect URI
- Make sure you have an active Spotify Premium account (required for playback control)

## License

MIT License - feel free to use this project as a starting point for your own Spotify integrations!
