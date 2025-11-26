"use client";

import { Volume1 } from "lucide-react";

interface VolumeControlProps {
	volume: number;
	onVolumeChange: (volume: number) => void;
	onVolumeCommit: (volume: number) => void;
	onVolumeStart: () => void;
}

export function VolumeControl({ volume, onVolumeChange, onVolumeCommit, onVolumeStart }: VolumeControlProps) {
	const handleMouseDown = (e: React.MouseEvent) => {
		e.stopPropagation();
		onVolumeStart();
	};

	const handleTouchStart = () => {
		onVolumeStart();
	};

	return (
		<div className="flex items-center justify-center gap-2 w-52 relative">
			<Volume1 className="w-6 h-6" />
			<div className="relative flex items-center w-full">
				<input
					type="range"
					min="0"
					max="100"
					value={volume}
					onChange={(e) => onVolumeChange(Number(e.target.value))}
					onMouseDown={handleMouseDown}
					onTouchStart={handleTouchStart}
					onMouseUp={(e) => onVolumeCommit(Number((e.target as HTMLInputElement).value))}
					onTouchEnd={(e) => onVolumeCommit(Number((e.target as HTMLInputElement).value))}
					className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer relative z-20
					[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
					[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-500
					[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-none
					[&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-30
					[&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
					[&::-moz-range-thumb]:bg-green-500 [&::-moz-range-thumb]:cursor-pointer
					[&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:shadow-sm"
				/>
				{/* Green progress bar - positioned absolutely to overlay the track */}
				<div
					className="absolute left-0 h-1 bg-green-500 rounded-lg pointer-events-none z-30 transition-all duration-75"
					style={{ width: `${volume}%` }}
				/>
			</div>
			<span className="text-xs text-gray-400">{volume}%</span>
		</div>
	);
}
