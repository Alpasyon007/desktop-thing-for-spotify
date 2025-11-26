"use client";

import { formatTime } from "../utils/helpers";

interface ProgressBarProps {
	currentTime: number;
	duration: number;
	progress: number;
	isPlaying: boolean;
	onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
	getDragStyle: (isDragRegion?: boolean) => React.CSSProperties;
}

export function ProgressBar({ currentTime, duration, progress, isPlaying, onProgressClick, getDragStyle }: ProgressBarProps) {
	return (
		<div
			className="flex justify-between items-center gap-2 cursor-default"
			style={getDragStyle(false)}
			onMouseDown={(e) => e.stopPropagation()}
		>
			<span className="text-xs">{formatTime(currentTime)}</span>
			<div
				className={`w-full h-2 bg-gray-700 overflow-hidden rounded-xl cursor-pointer ${!isPlaying ? "opacity-70" : ""}`}
				onClick={onProgressClick}
				onMouseDown={(e) => e.stopPropagation()}
			>
				<div
					className={`h-full rounded-xl transition-all duration-1000 ease-linear ${
						isPlaying ? "bg-green-500" : "bg-green-400"
					}`}
					style={{ width: `${progress}%` }}
				/>
			</div>
			<span className="text-xs">{formatTime(duration)}</span>
		</div>
	);
}
