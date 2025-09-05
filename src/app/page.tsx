"use client";

import { SpotifyPlayer } from "@/components/spotify-player";

export default function Home() {
	return (
		<div className="flex-1 flex flex-col">
			<SpotifyPlayer />
		</div>
	);
}
