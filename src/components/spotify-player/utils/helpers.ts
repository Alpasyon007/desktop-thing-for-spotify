export function formatTime(ms: number) {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function getProgressPercentage(
	playbackState: { progress_ms: number; item: { duration_ms: number } } | null,
	lastValidPlaybackState: { progress_ms: number; item: { duration_ms: number } } | null
) {
	const currentState = playbackState || lastValidPlaybackState;
	if (!currentState?.item || !currentState.progress_ms) return 0;
	return (currentState.progress_ms / currentState.item.duration_ms) * 100;
}
