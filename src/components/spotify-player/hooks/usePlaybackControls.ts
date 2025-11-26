"use client";

import { spotifyService } from "@/lib/spotify";

export function usePlaybackControls(playback: any, updatePlaybackState: () => Promise<void>) {
	const { isLoading, setIsLoading, playbackState, lastValidPlaybackState } = playback;

	const handlePlayPause = async () => {
		if (isLoading) return;
		setIsLoading(true);

		try {
			let success;
			if (!playbackState && lastValidPlaybackState?.item) {
				// No active playback but we have a last track - restart it
				const trackUri = `spotify:track:${lastValidPlaybackState.item.id}`;
				success = await spotifyService.playTrack(trackUri);
			} else {
				// Normal toggle playback
				success = await spotifyService.togglePlayback();
			}

			if (!success) {
				console.error("Failed to control playback - make sure Spotify is open on a device");
			}

			// Update state immediately for better UX
			setTimeout(updatePlaybackState, 500);
		} catch (error) {
			console.error("Error toggling playback:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleNext = async () => {
		if (isLoading) return;
		setIsLoading(true);

		try {
			let success;
			if (!playbackState && lastValidPlaybackState?.item) {
				// No active playback - start with the last track and then skip
				const trackUri = `spotify:track:${lastValidPlaybackState.item.id}`;
				success = await spotifyService.playTrack(trackUri);
				if (success) {
					// Wait a moment for playback to start, then skip
					setTimeout(async () => {
						await spotifyService.skipToNext();
						setTimeout(updatePlaybackState, 300);
					}, 1000);
				}
			} else {
				success = await spotifyService.skipToNext();
				if (success) {
					setTimeout(updatePlaybackState, 500);
				}
			}

			if (!success) {
				console.error("Failed to skip to next - make sure Spotify is open on a device");
			}
		} catch (error) {
			console.error("Error skipping to next:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePrevious = async () => {
		if (isLoading) return;
		setIsLoading(true);

		try {
			let success;
			if (!playbackState && lastValidPlaybackState?.item) {
				// No active playback - start with the last track and then go to previous
				const trackUri = `spotify:track:${lastValidPlaybackState.item.id}`;
				success = await spotifyService.playTrack(trackUri);
				if (success) {
					// Wait a moment for playback to start, then skip to previous
					setTimeout(async () => {
						await spotifyService.skipToPrevious();
						setTimeout(updatePlaybackState, 300);
					}, 1000);
				}
			} else {
				success = await spotifyService.skipToPrevious();
				if (success) {
					setTimeout(updatePlaybackState, 500);
				}
			}

			if (!success) {
				console.error("Failed to skip to previous - make sure Spotify is open on a device");
			}
		} catch (error) {
			console.error("Error skipping to previous:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRewind = async () => {
		const currentState = playbackState || lastValidPlaybackState;
		if (!currentState?.item) return;
		const newPos = Math.max(0, currentState.progress_ms - 15000);
		try {
			await spotifyService.seekToPosition(newPos);
			setTimeout(updatePlaybackState, 500);
		} catch (error) {
			console.error("Error rewinding:", error);
		}
	};

	const handleFastForward = async () => {
		const currentState = playbackState || lastValidPlaybackState;
		if (!currentState?.item) return;
		const newPos = Math.min(currentState.item.duration_ms, currentState.progress_ms + 15000);
		try {
			await spotifyService.seekToPosition(newPos);
			setTimeout(updatePlaybackState, 500);
		} catch (error) {
			console.error("Error fast forwarding:", error);
		}
	};

	const handleVolumeChange = (newVolume: number) => {
		const { setVolume } = playback;

		// Update the UI immediately for responsive feel
		setVolume(newVolume);
	};

	const handleVolumeStart = () => {
		const { setIsAdjustingVolume } = playback;

		// Mark that we're adjusting volume to prevent polling from overwriting
		setIsAdjustingVolume(true);
	};

	const handleVolumeCommit = async (finalVolume: number) => {
		const { setIsAdjustingVolume } = playback;

		try {
			await spotifyService.setVolume(finalVolume);
		} catch (error) {
			console.error("Error setting volume:", error);
		} finally {
			// Allow polling to update volume again after API call completes
			setIsAdjustingVolume(false);
		}
	};

	const handleProgressClick = async (e: React.MouseEvent<HTMLDivElement>) => {
		const currentState = playbackState || lastValidPlaybackState;
		if (!currentState?.item) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const percentage = clickX / rect.width;
		const newPosition = Math.floor(percentage * currentState.item.duration_ms);

		try {
			if (!playbackState && lastValidPlaybackState?.item) {
				// No active playback - start the track first, then seek
				const trackUri = `spotify:track:${lastValidPlaybackState.item.id}`;
				await spotifyService.playTrack(trackUri);
				// Wait for playback to start, then seek
				setTimeout(async () => {
					await spotifyService.seekToPosition(newPosition);
					setTimeout(updatePlaybackState, 300);
				}, 1000);
			} else {
				// Normal seek operation
				await spotifyService.seekToPosition(newPosition);
				setTimeout(updatePlaybackState, 200);
			}
		} catch (error) {
			console.error("Error seeking:", error);
		}
	};

	const handlePlayPlaylist = async (uri: string) => {
		try {
			await spotifyService.playPlaylist(uri);
			// Wait a bit for playback to start then update state
			setTimeout(updatePlaybackState, 1000);
		} catch (error) {
			console.error("Error playing playlist:", error);
		}
	};

	return {
		handlePlayPause,
		handleNext,
		handlePrevious,
		handleRewind,
		handleFastForward,
		handleVolumeChange,
		handleVolumeStart,
		handleVolumeCommit,
		handleProgressClick,
		handlePlayPlaylist
	};
}
