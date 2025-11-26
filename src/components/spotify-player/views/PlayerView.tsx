"use client";

import { NextTrackInfo } from "@/components/spotify-player/components/NextTrackInfo";

import { AlbumArt } from "../components/AlbumArt";
import { DragHandle } from "../components/DragHandle";
import { PlaybackControls } from "../components/PlaybackControls";
import { ProgressBar } from "../components/ProgressBar";
import { TrackInfo } from "../components/TrackInfo";
import { VolumeControl } from "../components/VolumeControl";
import { usePlaybackControls } from "../hooks/usePlaybackControls";
import { getProgressPercentage } from "../utils/helpers";
import { WindowControls } from "./types";

interface PlayerViewProps {
	playback: any;
	onLogout: () => void;
	windowControls: WindowControls;
}

export function PlayerView({ playback, onLogout, windowControls }: PlayerViewProps) {
	const controls = usePlaybackControls(playback, playback.updatePlaybackState);

	const { track, playbackState, nextTrack, displayState, volume } = playback;
	const albumArt = track?.album.images[0]?.url || "";
	const progress = getProgressPercentage(playbackState, playback.lastValidPlaybackState);

	return (
		<div className="flex flex-col h-full" style={windowControls.getContainerStyle(false)}>
			{/* Drag Handle at top */}
			<DragHandle getDragStyle={windowControls.getDragStyle} isVisible={windowControls.showDragHandle} />

			{/* Content */}
			<div className="flex flex-1 gap-4 p-3" style={windowControls.getDragStyle(false)}>
				<AlbumArt albumArt={albumArt} albumName={track.album.name} />

				<div className="flex flex-col w-full h-full gap-2">
					{/* Main Content Area */}
					<div className="flex-1 h-full flex items-center justify-between">
						<div className="flex w-full h-full justify-between gap-4">
							{/* Track Info */}
							<div className="flex justify-center items-center h-full gap-4">
								<TrackInfo trackName={track.name} artists={track.artists} isPlaying={!!playbackState} />
								<NextTrackInfo nextTrack={nextTrack} onNextSong={controls.handleNext} />
							</div>

							{/* Controls */}
							<div
								className="flex flex-col items-center justify-center gap-2 mt-2 cursor-default"
								style={windowControls.getDragStyle(false)}
								onMouseDown={(e) => e.stopPropagation()}
							>
								{/* Playback Controls */}
								<PlaybackControls
									isPlaying={playbackState?.is_playing || false}
									isLoading={playback.isLoading}
									hasTrack={!!displayState?.item}
									onPlayPause={controls.handlePlayPause}
									onPrevious={controls.handlePrevious}
									onNext={controls.handleNext}
									onRewind={controls.handleRewind}
									onFastForward={controls.handleFastForward}
									getDragStyle={windowControls.getDragStyle}
								/>

								{/* Volume Slider */}
								<VolumeControl
									volume={volume}
									onVolumeChange={controls.handleVolumeChange}
									onVolumeStart={controls.handleVolumeStart}
									onVolumeCommit={controls.handleVolumeCommit}
								/>
							</div>
						</div>
					</div>

					{/* Progress Bar */}
					<ProgressBar
						currentTime={playbackState?.progress_ms || 0}
						duration={track.duration_ms}
						progress={progress}
						isPlaying={!!playbackState}
						onProgressClick={controls.handleProgressClick}
						getDragStyle={windowControls.getDragStyle}
					/>
				</div>
			</div>
		</div>
	);
}
