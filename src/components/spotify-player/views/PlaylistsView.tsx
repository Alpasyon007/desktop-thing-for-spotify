"use client";

import { Button } from "@/components/ui/button";
import { type SpotifyPlaylist } from "@/lib/spotify";

import { DragHandle } from "../components/DragHandle";
import { WindowControls } from "./types";

import { ChevronLeft, ChevronRight, Copy, Minus, Play, Square, Volume2, X } from "lucide-react";
import { useEffect, useRef } from "react";

import Image from "next/image";

interface PlaylistsViewProps {
	playlists: SpotifyPlaylist[];
	onPlayPlaylist: (uri: string) => Promise<void>;
	onLogout: () => void;
	windowControls: WindowControls;
}

export function PlaylistsView({ playlists, onPlayPlaylist, onLogout, windowControls }: PlaylistsViewProps) {
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const scroll = (direction: "left" | "right") => {
		if (scrollContainerRef.current && playlists.length > 0) {
			const container = scrollContainerRef.current;
			const scrollAmount = 200;

			if (direction === "right") {
				container.scrollTo({
					left: container.scrollLeft + scrollAmount,
					behavior: "smooth"
				});
			} else {
				container.scrollTo({
					left: container.scrollLeft - scrollAmount,
					behavior: "smooth"
				});
			}
		}
	};

	// Handle infinite scroll wrapping
	const handleScroll = () => {
		if (!scrollContainerRef.current || playlists.length === 0) return;

		const container = scrollContainerRef.current;
		const maxScroll = container.scrollWidth;
		const scrollLeft = container.scrollLeft;

		// Calculate the width of one set of playlists
		const singleSetWidth = maxScroll / 3; // We have 3 copies

		// If scrolled past the second set, jump back to middle set
		if (scrollLeft >= singleSetWidth * 2) {
			container.scrollLeft = scrollLeft - singleSetWidth;
		}
		// If scrolled before the first set, jump forward to middle set
		else if (scrollLeft <= 0) {
			container.scrollLeft = scrollLeft + singleSetWidth;
		}
	};

	// Initialize scroll position to middle set on mount
	useEffect(() => {
		if (scrollContainerRef.current && playlists.length > 0) {
			const container = scrollContainerRef.current;
			// Wait for layout to complete
			setTimeout(() => {
				container.scrollLeft = container.scrollWidth / 3;
			}, 0);
		}
	}, [playlists.length]);

	return (
		<div className="flex flex-col h-full" style={windowControls.getContainerStyle(false)}>
			{/* Drag Handle at top */}
			<DragHandle getDragStyle={windowControls.getDragStyle} isVisible={windowControls.showDragHandle} />

			{/* Content */}
			<div className="flex flex-col flex-1 p-3" style={windowControls.getDragStyle(false)}>
				{/* Header */}
				<div className="flex justify-between items-center shrink-0 px-1 mb-1" style={windowControls.getDragStyle(true)}>
					<h2 className="text-sm font-bold text-white/90">Your Playlists</h2>
					<div
						className="flex gap-1"
						onMouseDown={(e) => e.stopPropagation()}
						style={windowControls.getDragStyle(false)}
					>
						<Button variant="ghost" size="sm" className="w-6 h-6 p-0" onClick={windowControls.handleMinimize}>
							<Minus className="w-3 h-3" />
						</Button>
						<Button variant="ghost" size="sm" className="w-6 h-6 p-0" onClick={windowControls.handleMaximize}>
							{windowControls.isMaximized ? (
								<Copy className="w-3 h-3 [transform:scaleX(-1)]" />
							) : (
								<Square className="w-3 h-3" />
							)}
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="w-6 h-6 p-0 hover:bg-red-500/20 hover:text-red-500"
							onClick={windowControls.handleClose}
						>
							<X className="w-3 h-3" />
						</Button>
					</div>
				</div>

				{/* Playlist Carousel */}
				<div className="relative flex items-center gap-2 flex-1 min-h-0 max-h-full overflow-hidden scrollbar-none">
					{/* Left Arrow */}
					<Button
						variant="ghost"
						size="sm"
						className="absolute left-0 z-10 w-8 h-8 p-0 bg-zinc-900/90 hover:bg-zinc-800 rounded-full shadow-lg flex-shrink-0"
						onClick={() => scroll("left")}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<ChevronLeft className="w-5 h-5" />
					</Button>

					{/* Scrollable Playlists Container */}
					<div
						ref={scrollContainerRef}
						className="flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-none flex-1 h-full items-center"
						style={windowControls.getDragStyle(false)}
						onMouseDown={(e) => e.stopPropagation()}
						onScroll={handleScroll}
					>
						{playlists.length > 0 ? (
							<>
								{/* First copy - for seamless left scrolling */}
								{playlists.map((playlist, index) => (
									<div
										key={`prev-${playlist.id}-${index}`}
										className="group relative flex-shrink-0 aspect-square max-h-full bg-zinc-800/50 rounded-md overflow-hidden cursor-pointer hover:bg-zinc-700/50 transition-all hover:scale-105"
										style={{ width: "auto", height: "calc(100%)" }}
										onClick={() => onPlayPlaylist(playlist.uri)}
										title={playlist.name}
									>
										{playlist.images?.[0]?.url ? (
											<Image
												src={playlist.images[0].url}
												alt={playlist.name}
												fill
												className="object-cover"
												sizes="(max-height: 100px) 100px, 150px"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-zinc-600">
												<Volume2 size={24} />
											</div>
										)}
										<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
											<Play className="w-10 h-10 text-white fill-white drop-shadow-lg" />
										</div>
										<div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
											<p className="text-[9px] text-white font-medium truncate leading-tight">
												{playlist.name}
											</p>
										</div>
									</div>
								))}
								{/* Main copy - the visible set */}
								{playlists.map((playlist, index) => (
									<div
										key={`main-${playlist.id}-${index}`}
										className="group relative flex-shrink-0 aspect-square max-h-full bg-zinc-800/50 rounded-md overflow-hidden cursor-pointer hover:bg-zinc-700/50 transition-all hover:scale-105"
										style={{ width: "auto", height: "calc(100%)" }}
										onClick={() => onPlayPlaylist(playlist.uri)}
										title={playlist.name}
									>
										{playlist.images?.[0]?.url ? (
											<Image
												src={playlist.images[0].url}
												alt={playlist.name}
												fill
												className="object-cover"
												sizes="(max-height: 100px) 100px, 150px"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-zinc-600">
												<Volume2 size={24} />
											</div>
										)}
										<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
											<Play className="w-10 h-10 text-white fill-white drop-shadow-lg" />
										</div>
										<div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
											<p className="text-[9px] text-white font-medium truncate leading-tight">
												{playlist.name}
											</p>
										</div>
									</div>
								))}
								{/* Third copy - for seamless right scrolling */}
								{playlists.map((playlist, index) => (
									<div
										key={`next-${playlist.id}-${index}`}
										className="group relative flex-shrink-0 aspect-square max-h-full bg-zinc-800/50 rounded-md overflow-hidden cursor-pointer hover:bg-zinc-700/50 transition-all hover:scale-105"
										style={{ width: "auto", height: "calc(100%)" }}
										onClick={() => onPlayPlaylist(playlist.uri)}
										title={playlist.name}
									>
										{playlist.images?.[0]?.url ? (
											<Image
												src={playlist.images[0].url}
												alt={playlist.name}
												fill
												className="object-cover"
												sizes="(max-height: 100px) 100px, 150px"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center text-zinc-600">
												<Volume2 size={24} />
											</div>
										)}
										<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
											<Play className="w-10 h-10 text-white fill-white drop-shadow-lg" />
										</div>
										<div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
											<p className="text-[9px] text-white font-medium truncate leading-tight">
												{playlist.name}
											</p>
										</div>
									</div>
								))}
							</>
						) : (
							<div className="flex flex-col items-center justify-center text-white/40 flex-1 gap-2">
								<Volume2 className="w-8 h-8 opacity-50" />
								<div className="text-xs">No playlists found</div>
							</div>
						)}
					</div>

					{/* Right Arrow */}
					<Button
						variant="ghost"
						size="sm"
						className="absolute right-0 z-10 w-8 h-8 p-0 bg-zinc-900/90 hover:bg-zinc-800 rounded-full shadow-lg flex-shrink-0"
						onClick={() => scroll("right")}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<ChevronRight className="w-5 h-5" />
					</Button>
				</div>
			</div>
		</div>
	);
}
