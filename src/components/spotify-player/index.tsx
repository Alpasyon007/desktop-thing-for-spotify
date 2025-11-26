"use client";

import { useSpotifyAuth } from "./hooks/useSpotifyAuth";
import { useSpotifyPlayback } from "./hooks/useSpotifyPlayback";
import { useWindowControls } from "./hooks/useWindowControls";
import { LoginView } from "./views/LoginView";
import { PlayerView } from "./views/PlayerView";
import { PlaylistsView } from "./views/PlaylistsView";

import { useEffect, useState } from "react";

type View = "playlists" | "player";

export function SpotifyPlayer() {
	const auth = useSpotifyAuth();
	const [currentView, setCurrentView] = useState<View>("playlists");
	const windowControls = useWindowControls(currentView);
	const playback = useSpotifyPlayback(auth.isAuthenticated);

	// Listen for navigate events from main process
	useEffect(() => {
		if (typeof window !== "undefined" && window.electronAPI) {
			window.electronAPI.on("navigate-to-playlists", () => {
				playback.clearTrack();
				setCurrentView("playlists");
			});

			window.electronAPI.on("navigate-to-player", () => {
				setCurrentView("player");
			});

			window.electronAPI.on("logout", () => {
				auth.handleLogout();
			});
		}
	}, [playback, auth]);

	// Auto-switch to player view when a track starts playing (only if in playlists view)
	useEffect(() => {
		if (playback.playbackState?.item && playback.playbackState?.is_playing && currentView === "playlists") {
			setCurrentView("player");
		}
	}, [playback.playbackState?.item, currentView]);

	if (!auth.isAuthenticated) {
		return <LoginView isAuthenticating={auth.isAuthenticating} onLogin={auth.handleLogin} windowControls={windowControls} />;
	}

	// Show player view if user selected it and there's valid playback state
	const shouldShowPlayer = currentView === "player";

	if (!shouldShowPlayer) {
		return (
			<PlaylistsView
				playlists={playback.playlists}
				onPlayPlaylist={playback.handlePlayPlaylist}
				onLogout={auth.handleLogout}
				windowControls={windowControls}
			/>
		);
	}

	return <PlayerView playback={playback} onLogout={auth.handleLogout} windowControls={windowControls} />;
}
