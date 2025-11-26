"use client";

interface TrackInfoProps {
	trackName: string;
	artists: { name: string }[];
	isPlaying: boolean;
}

export function TrackInfo({ trackName, artists, isPlaying }: TrackInfoProps) {
	return (
		<div className="flex flex-col justify-center items-start text-center">
			<div className="flex items-center gap-2">
				<h1 className="text-lg font-bold truncate flex items-center gap-2">
					<span className={"max-w-56 truncate"}>{trackName}</span>
					{!isPlaying && (
						<span className="max-w-56 truncate text-xs text-gray-400 font-normal opacity-60">(last played)</span>
					)}
				</h1>
			</div>
			<p className="text-base text-gray-300 max-w-56 truncate">{artists.map((artist) => artist.name).join(", ")}</p>
		</div>
	);
}
