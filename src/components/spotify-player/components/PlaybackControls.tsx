"use client";

import { Button } from "@/components/ui/button";

import { FastForward, Pause, Play, Rewind, SkipBack, SkipForward } from "lucide-react";

interface PlaybackControlsProps {
	isPlaying: boolean;
	isLoading: boolean;
	hasTrack: boolean;
	onPlayPause: () => void;
	onPrevious: () => void;
	onNext: () => void;
	onRewind: () => void;
	onFastForward: () => void;
	getDragStyle: (isDragRegion?: boolean) => React.CSSProperties;
}

export function PlaybackControls({
	isPlaying,
	isLoading,
	hasTrack,
	onPlayPause,
	onPrevious,
	onNext,
	onRewind,
	onFastForward,
	getDragStyle
}: PlaybackControlsProps) {
	return (
		<div className="flex items-center gap-1">
			<Button
				variant="ghost"
				size="icon"
				onClick={onPrevious}
				disabled={isLoading || !hasTrack}
				className="w-8 h-8 rounded-full hover:bg-white/10"
				onMouseDown={(e) => e.stopPropagation()}
			>
				<SkipBack className="w-5 h-5" fill="currentColor" />
			</Button>

			<Button
				variant="ghost"
				size="icon"
				onClick={onRewind}
				disabled={isLoading || !hasTrack}
				className="w-8 h-8 rounded-full hover:bg-white/10"
				onMouseDown={(e) => e.stopPropagation()}
			>
				<Rewind className="w-5 h-5" fill="currentColor" />
			</Button>

			<Button
				size="icon"
				onClick={onPlayPause}
				disabled={isLoading || !hasTrack}
				className="w-10 h-10 rounded-full bg-white text-black hover:bg-white/90 hover:scale-105 transition-transform"
				onMouseDown={(e) => e.stopPropagation()}
			>
				{isPlaying ? (
					<Pause className="w-5 h-5" fill="currentColor" />
				) : (
					<Play className="w-5 h-5 ml-0.5" fill="currentColor" />
				)}
			</Button>

			<Button
				variant="ghost"
				size="icon"
				onClick={onFastForward}
				disabled={isLoading || !hasTrack}
				className="w-8 h-8 rounded-full hover:bg-white/10"
				onMouseDown={(e) => e.stopPropagation()}
			>
				<FastForward className="w-5 h-5" fill="currentColor" />
			</Button>

			<Button
				variant="ghost"
				size="icon"
				onClick={onNext}
				disabled={isLoading || !hasTrack}
				className="w-8 h-8 rounded-full hover:bg-white/10"
				onMouseDown={(e) => e.stopPropagation()}
			>
				<SkipForward className="w-5 h-5" fill="currentColor" />
			</Button>
		</div>
	);
}
