"use client";

import { Volume2 } from "lucide-react";

import Image from "next/image";

interface AlbumArtProps {
	albumArt: string;
	albumName: string;
}

export function AlbumArt({ albumArt, albumName }: AlbumArtProps) {
	return (
		<div className="relative aspect-square h-full">
			{albumArt ? (
				<Image
					src={albumArt}
					alt={`${albumName} cover`}
					fill
					className="rounded-lg object-cover shadow-2xl shadow-zinc-500"
					priority
				/>
			) : (
				<div className="w-full h-full rounded-2xl shadow-2xl shadow-zinc-500 flex items-center justify-center">
					<Volume2 className="w-1/4 h-1/4 text-gray-500" />
				</div>
			)}
		</div>
	);
}
