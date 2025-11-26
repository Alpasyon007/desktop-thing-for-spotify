# Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Spotify account (Premium recommended for full playback control)

## 1. Spotify App Registration

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/applications)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app details:
    - **App Name**: Desktop Thing for Spotify (or your preferred name)
    - **App Description**: A desktop player for Spotify
5. Accept the Terms of Service
6. Click "Create"
7. Note your **Client ID** and **Client Secret** (click "Show Client Secret")
8. Click "Edit Settings"
9. Add `http://127.0.0.1:3004/callback` to the **Redirect URIs** section
10. Click "Save"

## 2. Environment Configuration

1. In the project root directory, create a `.env.local` file
2. Add your Spotify credentials:

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://127.0.0.1:3004/callback
```

⚠️ **Important**: Never commit `.env.local` to version control. It's already in `.gitignore`.

## 3. Installation

```bash
# Install dependencies
npm install
```

## 4. Running the Application

### Development Mode

```bash
# Start the development server with Electron
npm run dev
```

This command will:

- Build the Electron files
- Start the Next.js development server on port 3003
- Launch the Electron window

### Production Build

```bash
# Build the app for production
npm run build
```

This creates a distributable Electron app in the `dist/` directory.

## 5. First-Time Usage

1. **Launch the app**: The Electron window will open automatically
2. **Login to Spotify**: Click "Login with Spotify" button
3. **Authorize the app**: You'll be redirected to Spotify's authorization page
4. **Grant permissions**: Accept the requested permissions
5. **Start playing**: Play any song on Spotify (web, mobile, or desktop client)
6. **Control playback**: Use the app's controls to manage your music

## Troubleshooting

### Authentication Issues

- **Redirect URI mismatch**: Ensure the redirect URI in your Spotify app settings exactly matches the one in
  `.env.local`
- **Invalid credentials**: Double-check your Client ID and Client Secret
- **CORS errors**: Make sure you're using `127.0.0.1` instead of `localhost`

### Playback Issues

- **No playback detected**: Ensure you have an active Spotify session on any device
- **Controls not working**: Verify you have a Spotify Premium account (required for playback control)
- **Delayed updates**: The app polls every 1 second; slight delays are normal

### Build Issues

- **TypeScript errors**: Run `npm run build:electron` to check for compilation errors
- **Missing dependencies**: Delete `node_modules` and `package-lock.json`, then run `npm install` again
- **Port already in use**: Change the port in `package.json` dev script if 3003 is occupied

## Next Steps

- Read the [Usage Guide](./USAGE.md) to learn about all features
- Check out the [Architecture Documentation](../architecture/OVERVIEW.md) to understand the codebase
- See [Development Guide](../development/CONTRIBUTING.md) to start contributing

