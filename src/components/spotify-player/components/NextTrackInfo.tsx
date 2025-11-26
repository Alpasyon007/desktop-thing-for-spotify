"use client";

import { SpotifyTrack } from "@/lib/spotify";

import { ChevronRight } from "lucide-react";

import Image from "next/image";

interface NextTrackInfoProps {
	nextTrack: SpotifyTrack;
	onNextSong: () => void;
}

export function NextTrackInfo({ nextTrack, onNextSong }: NextTrackInfoProps) {
	return (
		<div
			className="flex justify-center gap-2 items-center text-center opacity-60 hover:opacity-100 transition-opacity group/next"
			onClick={onNextSong}
		>
			{nextTrack && (
				<>
					<ChevronRight className="w-6 h-6 group-hover/next:text-green-400 transition-colors" />
					<div className="flex items-center gap-2 rounded bg-white/5 pl-1 pr-3 py-1 text-xs text-gray-300 max-w-72 transition-colors cursor-default">
						{nextTrack.album.images?.[0]?.url && (
							<div className="relative rounded w-12 h-12 overflow-hidden flex-shrink-0">
								<Image
									src={nextTrack.album.images[0].url}
									alt={nextTrack.album.name}
									fill
									className="object-cover"
								/>
							</div>
						)}
						<div className="flex items-center gap-1.5 min-w-0">
							<span className="opacity-50 text-[9px] uppercase tracking-wider font-bold group-hover/next:text-green-400 transition-colors flex-shrink-0">
								Next
							</span>
							<div className="w-[1px] h-3 bg-white/10 flex-shrink-0"></div>
							<span className="truncate font-medium text-gray-200">{nextTrack.name}</span>
						</div>
					</div>
				</>
			)}
		</div>
	);
}
