# Usage Guide

## Interface Overview

The Desktop Thing for Spotify has three main views:

1. **Login View** - Initial authentication screen
2. **Player View** - Main playback interface
3. **Playlists View** - Browse and select your playlists

## Basic Controls

### Window Controls

- **Minimize** - Click the minimize button (top-right)
- **Close** - Click the close button (top-right)
- **Always on Top** - Right-click anywhere and select "Always on Top" to keep the window above other applications
- **Drag Window** - Click and drag the drag handle icon (⋮⋮) at the top to move the window

### Playback Controls

- **Play/Pause** - Click the play/pause button
- **Next Track** - Click the forward button
- **Previous Track** - Click the backward button
- **Volume Control** - Use the volume slider at the bottom
- **Seek** - Click anywhere on the progress bar to jump to that position

## Features

### Persistent Last Played State

The app remembers your last played track even when playback stops:

- Last track information remains visible with a "(last played)" indicator
- All controls stay active and functional
- Click any control to restart playback where you left off
- Seamlessly resume your music session

### Playlists View

Access your Spotify playlists:

1. Right-click anywhere in the Player View
2. Select "Go to Playlists"
3. Browse your playlists in a grid layout
4. Click a playlist to start playing it
5. Click "Back to Player" to return to the main view

### Context Menu

Right-click anywhere in the app to access additional options:

**In Player View:**

- Go to Playlists
- Always on Top (toggle)
- Minimize
- Close

**In Playlists View:**

- Back to Player
- Always on Top (toggle)
- Minimize
- Close

### Always on Top

Keep the player window visible while using other applications:

1. Right-click anywhere in the app
2. Click "Always on Top"
3. The window will stay on top of other windows
4. Click again to disable

### Drag Handle

Move the window without traditional title bar:

1. Look for the drag handle icon (⋮⋮) at the top center
2. Click and hold the handle
3. Drag to move the window
4. Release to drop

## Keyboard Shortcuts

Currently, all controls are mouse-based. Keyboard shortcuts may be added in future versions.

## Tips and Tricks

### Multi-Device Playback

- The app shows what's currently playing across **all your Spotify devices**
- Start playing on your phone, control from the desktop app
- Switch between devices seamlessly

### Visual Feedback

- **Green controls** - Active playback
- **Gray controls** - No active playback
- **"(last played)" label** - Showing historical state
- **Progress bar** - Real-time playback position

### Performance

- The app polls Spotify every 1 second for updates
- Album artwork is cached for better performance
- Minimal resource usage (runs in the background)

## Known Limitations

- Requires Spotify Premium for playback control
- Spotify Free users can see what's playing but cannot control playback
- 1-second polling interval may cause slight delays
- Some Spotify features (lyrics, queue management) are not available

## Getting Help

If you encounter issues:

1. Check the [Setup Guide](./SETUP.md) for configuration issues
2. Review the [Troubleshooting](#troubleshooting) section
3. Check the [GitHub Issues](https://github.com/yourusername/desktop-thing-for-spotify/issues)
4. Create a new issue with detailed information

## Troubleshooting

### App doesn't show current playback

- Ensure Spotify is playing on any device
- Check your internet connection
- Try logging out and back in

### Controls don't work

- Verify you have Spotify Premium
- Ensure you're connected to the internet
- Check if Spotify's API is operational

### Window won't stay on top

- Toggle "Always on Top" off and on again
- Restart the application
- Check if other apps are interfering

### Can't move the window

- Look for the drag handle icon (⋮⋮)
- Click and hold on the handle specifically
- If stuck, close and reopen the app

