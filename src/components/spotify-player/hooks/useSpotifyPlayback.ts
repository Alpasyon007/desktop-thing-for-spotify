"use client";

import { type SpotifyPlaybackState, type SpotifyPlaylist, spotifyService, type SpotifyTrack } from "@/lib/spotify";

import { useCallback, useEffect, useState } from "react";

export function useSpotifyPlayback(isAuthenticated: boolean) {
	const [playbackState, setPlaybackState] = useState<SpotifyPlaybackState | null>(null);
	const [lastValidPlaybackState, setLastValidPlaybackState] = useState<SpotifyPlaybackState | null>(null);
	const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
	const [nextTrack, setNextTrack] = useState<SpotifyTrack | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [volume, setVolume] = useState(50);
	const [isAdjustingVolume, setIsAdjustingVolume] = useState(false);

	// Poll for playback state
	const updatePlaybackState = useCallback(async () => {
		if (!isAuthenticated) return;

		try {
			const [state, queue] = await Promise.all([spotifyService.getCurrentPlayback(), spotifyService.getQueue()]);

			if (state) {
				// We have valid playback data, update both states
				setPlaybackState(state);
				setLastValidPlaybackState(state);
				// Update volume from device if available, but only if user is not actively adjusting it
				if (state.device?.volume_percent !== undefined && !isAdjustingVolume) {
					setVolume(state.device.volume_percent);
				}
			} else {
				// No active playback, but keep the last valid state for display
				setPlaybackState(null);
				// Don't update lastValidPlaybackState - keep the last track info
			}

			if (queue && queue.length > 0) {
				setNextTrack(queue[0]);
			} else {
				setNextTrack(null);
			}
		} catch (error) {
			console.error("Error updating playback state:", error);

			// If we get an authentication error, check if we need to re-authenticate
			if (error instanceof Error && error.message.includes("Token refresh failed")) {
				console.log("Token refresh failed, user needs to re-authenticate");
				setPlaybackState(null);
				// Clear last valid state on auth failure
				setLastValidPlaybackState(null);
			}
		}
	}, [isAuthenticated, isAdjustingVolume]);

	// Poll every 1 second for playback updates
	useEffect(() => {
		if (!isAuthenticated) return;

		updatePlaybackState();
		const interval = setInterval(updatePlaybackState, 1000);

		return () => clearInterval(interval);
	}, [isAuthenticated, updatePlaybackState]);

	// Fetch playlists when authenticated
	useEffect(() => {
		if (isAuthenticated) {
			spotifyService.getUserPlaylists().then(setPlaylists);
		}
	}, [isAuthenticated]);

	const displayState = playbackState || lastValidPlaybackState;
	const track = displayState?.item;

	const handlePlayPlaylist = async (uri: string) => {
		try {
			await spotifyService.playPlaylist(uri);
			// Wait a bit for playback to start then update state
			setTimeout(updatePlaybackState, 1000);
		} catch (error) {
			console.error("Error playing playlist:", error);
		}
	};

	const clearTrack = () => {
		// Clear the track to force showing playlists view
		setPlaybackState(null);
		setLastValidPlaybackState(null);
		setNextTrack(null);
	};

	return {
		playbackState,
		lastValidPlaybackState,
		displayState,
		track,
		playlists,
		nextTrack,
		isLoading,
		volume,
		isAdjustingVolume,
		setIsLoading,
		setVolume,
		setIsAdjustingVolume,
		updatePlaybackState,
		handlePlayPlaylist,
		clearTrack
	};
}
