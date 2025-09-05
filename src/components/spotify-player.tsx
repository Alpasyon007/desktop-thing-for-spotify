"use client";

import { Button } from "@/components/ui/button";
import { type SpotifyPlaybackState, spotifyService } from "@/lib/spotify";

import { Copy, LogOut, Minus, Pause, Play, SkipBack, SkipForward, Square, Volume2, X } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";

import Image from "next/image";export function SpotifyPlayer() {
	const [playbackState, setPlaybackState] = useState<SpotifyPlaybackState | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAuthenticating, setIsAuthenticating] = useState(false);
	const [isMaximized, setIsMaximized] = useState(false);
	const [isElectron, setIsElectron] = useState(false);
	const [isHoveringWindow, setIsHoveringWindow] = useState(false);
	const [isShiftPressed, setIsShiftPressed] = useState(false);
	const [contextMenuOpen, setContextMenuOpen] = useState(false);
	const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

	useEffect(() => {
		// Check if running in Electron
		setIsElectron(typeof window !== "undefined" && !!window.electronAPI);

		if (window.electronAPI) {
			// Check initial maximized state
			window.electronAPI.windowIsMaximized().then(setIsMaximized);
		}
	}, []);

	// Track shift key for Windows drag features
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Shift') {
				console.log('Shift key pressed - enabling drag regions');
				setIsShiftPressed(true);
			}
		};

		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'Shift') {
				console.log('Shift key released - disabling drag regions');
				setIsShiftPressed(false);
			}
		};

		// Also listen for focus/blur events to reset shift state
		const handleFocus = () => {
			console.log('Window focused');
		};

		const handleBlur = () => {
			console.log('Window blurred - resetting shift state');
			setIsShiftPressed(false);
		};

		// Add event listeners to both document and window for better coverage
		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('keyup', handleKeyUp);
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		window.addEventListener('focus', handleFocus);
		window.addEventListener('blur', handleBlur);

		console.log('Shift key listeners attached');

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
			window.removeEventListener('focus', handleFocus);
			window.removeEventListener('blur', handleBlur);
			console.log('Shift key listeners removed');
		};
	}, []);

	// Handle clicks outside context menu
	useEffect(() => {
		const handleClickOutside = () => {
			if (contextMenuOpen) {
				setContextMenuOpen(false);
			}
		};

		if (contextMenuOpen) {
			document.addEventListener('click', handleClickOutside);
			document.addEventListener('contextmenu', handleClickOutside);
		}

		return () => {
			document.removeEventListener('click', handleClickOutside);
			document.removeEventListener('contextmenu', handleClickOutside);
		};
	}, [contextMenuOpen]);

	// Hybrid dragging: custom for smooth movement, native for Windows features
	const getDragStyle = (isDragRegion: boolean = true) => {
		if (!isShiftPressed) return {};
		console.log(`Applying drag region: ${isDragRegion ? 'drag' : 'no-drag'}`);
		return {
			WebkitAppRegion: isDragRegion ? 'drag' : 'no-drag'
		} as React.CSSProperties;
	};

	const getContainerStyle = (isDragRegion: boolean = true) => {
		const baseStyle = getDragStyle(isDragRegion);
		// Add subtle visual feedback when shift is pressed
		if (isShiftPressed && isDragRegion) {
			return {
				...baseStyle,
				outline: '1px solid rgba(34, 197, 94, 0.5)', // Subtle green outline
				outlineOffset: '-1px'
			} as React.CSSProperties;
		}
		return baseStyle;
	};

	const handleMouseDown = async (e: React.MouseEvent) => {
		if (!window.electronAPI) return;

		// Update shift state based on the mouse event
		if (e.shiftKey !== isShiftPressed) {
			setIsShiftPressed(e.shiftKey);
			console.log(`Updated shift state to: ${e.shiftKey}`);
		}

		console.log(`Mouse down - Shift pressed: ${e.shiftKey}, isShiftPressed state: ${isShiftPressed}`);

		// If shift key is pressed, use native drag region for Windows features
		if (e.shiftKey) {
			console.log('Using native Windows drag (FancyZones enabled)');
			// Let Windows handle this drag natively for FancyZones
			return;
		}

		console.log('Using custom smooth drag');
		e.preventDefault();

		const startData = await window.electronAPI.windowDragStart({
			x: e.screenX,
			y: e.screenY
		});

		// Add global mouse event listeners for smooth dragging
		let lastUpdateTime = 0;
		const THROTTLE_MS = 4; // ~250fps maximum for ultra-smooth dragging

		const updateWindowPosition = (mouseX: number, mouseY: number, shiftKey: boolean, ctrlKey: boolean) => {
			if (!window.electronAPI || !startData) return;

			// If shift is pressed during drag, switch to native mode
			if (shiftKey && process.platform === 'win32') {
				// Stop our custom dragging and let Windows take over
				document.removeEventListener('mousemove', handleGlobalMouseMove);
				document.removeEventListener('mouseup', handleGlobalMouseUp);
				return;
			}

			// Use send instead of invoke for non-blocking IPC
			window.electronAPI.send('window-drag-move', {
				mouseX,
				mouseY,
				startData: startData,
				shiftKey,
				ctrlKey
			});
		};

		const handleGlobalMouseMove = (globalEvent: MouseEvent) => {
			const now = performance.now();
			if (now - lastUpdateTime < THROTTLE_MS) {
				return; // Skip this update for better performance
			}
			lastUpdateTime = now;

			updateWindowPosition(globalEvent.screenX, globalEvent.screenY, globalEvent.shiftKey, globalEvent.ctrlKey);
		};

		const handleGlobalMouseUp = (globalEvent: MouseEvent) => {
			// Handle final drop with Windows features
			if (window.electronAPI && startData) {
				window.electronAPI.send('window-drag-end', {
					mouseX: globalEvent.screenX,
					mouseY: globalEvent.screenY,
					startData: startData,
					shiftKey: globalEvent.shiftKey,
					ctrlKey: globalEvent.ctrlKey
				});
			}

			document.removeEventListener('mousemove', handleGlobalMouseMove);
			document.removeEventListener('mouseup', handleGlobalMouseUp);
		};

		document.addEventListener('mousemove', handleGlobalMouseMove);
		document.addEventListener('mouseup', handleGlobalMouseUp);
	};

	const handleMinimize = async () => {
		if (window.electronAPI) {
			await window.electronAPI.windowMinimize();
		}
	};

	const handleMaximize = async () => {
		if (window.electronAPI) {
			await window.electronAPI.windowMaximize();
			const maximized = await window.electronAPI.windowIsMaximized();
			setIsMaximized(maximized);
		}
	};

	const handleClose = async () => {
		if (window.electronAPI) {
			await window.electronAPI.windowClose();
		}
	};

	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault();
		setContextMenuPosition({ x: e.clientX, y: e.clientY });
		setContextMenuOpen(true);
	};

	const handleCloseContextMenu = () => {
		setContextMenuOpen(false);
	};

	// Poll for playback state
	const updatePlaybackState = useCallback(async () => {
		if (!isAuthenticated) return;

		try {
			const state = await spotifyService.getCurrentPlayback();
			setPlaybackState(state);
		} catch (error) {
			console.error("Error updating playback state:", error);

			// If we get an authentication error, check if we need to re-authenticate
			if (error instanceof Error && error.message.includes('Token refresh failed')) {
				console.log('Token refresh failed, user needs to re-authenticate');
				setIsAuthenticated(false);
				setPlaybackState(null);
			}
		}
	}, [isAuthenticated]);

	// Check authentication status on mount and when tokens might change
	useEffect(() => {
		const checkAuth = async () => {
			try {
				console.log('Checking existing authentication...');

				// First check if we already have tokens in memory
				let isAuth = spotifyService.isAuthenticated();
				console.log('Initial authentication check:', isAuth);

				// If not authenticated, try to reload tokens from storage
				if (!isAuth) {
					console.log('No tokens in memory, reloading from storage...');
					await spotifyService.reloadTokens();
					isAuth = spotifyService.isAuthenticated();
					console.log('Authentication status after reload:', isAuth);
				}

				setIsAuthenticated(isAuth);

				// If authenticated, immediately try to get playback state
				if (isAuth) {
					console.log('User is authenticated, fetching initial playback state...');
					setTimeout(() => {
						updatePlaybackState();
					}, 500); // Small delay to ensure state is set
				}
			} catch (error) {
				console.error('Error checking authentication:', error);
				setIsAuthenticated(false);
			}
		};

		checkAuth();

		// Also listen for storage events in case tokens are updated in another window/tab
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'spotify_access_token' || e.key === 'spotify_refresh_token') {
				console.log('Spotify tokens changed in storage, rechecking auth...');
				checkAuth();
			}
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('storage', handleStorageChange);
		}

		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('storage', handleStorageChange);
			}
		};
	}, [updatePlaybackState]);

	// Poll every 1 second for playback updates
	useEffect(() => {
		if (!isAuthenticated) return;

		updatePlaybackState();
		const interval = setInterval(updatePlaybackState, 1000);

		return () => clearInterval(interval);
	}, [isAuthenticated, updatePlaybackState]);

	// Periodic authentication check to ensure tokens are still valid
	useEffect(() => {
		if (!isAuthenticated) return;

		const checkTokenValidity = async () => {
			try {
				// Try to make a simple API call to verify token validity
				await spotifyService.getCurrentPlayback();
			} catch (error) {
				console.error('Token validation failed:', error);
				if (error instanceof Error && error.message.includes('Token refresh failed')) {
					console.log('Authentication lost, clearing session');
					setIsAuthenticated(false);
					setPlaybackState(null);
				}
			}
		};

		// Check token validity every 30 minutes
		const tokenCheckInterval = setInterval(checkTokenValidity, 30 * 60 * 1000);
		return () => clearInterval(tokenCheckInterval);
	}, [isAuthenticated]);

	const getProgressPercentage = () => {
		if (!playbackState?.item || !playbackState.progress_ms) return 0;
		return (playbackState.progress_ms / playbackState.item.duration_ms) * 100;
	};

	const handleLogin = async () => {
		try {
			const authUrl = await spotifyService.getAuthUrl();

			// If running in Electron, open in default browser
			if (typeof window !== "undefined" && window.electronAPI) {
				window.electronAPI.openExternal(authUrl);
			} else {
				// Fallback for web browser
				window.open(authUrl, "_blank");
			}

			// Start polling for authentication after user goes to browser
			setIsAuthenticating(true);
			pollForAuthentication();
		} catch (error) {
			console.error("Error generating auth URL:", error);
		}
	};

	// Monitor for authentication completion
	const pollForAuthentication = () => {
		console.log("Starting authentication monitoring...");

		const pollInterval = setInterval(async () => {
			try {
				console.log("Checking for tokens...");

				// Check for pending auth code from the HTTP server
				if (typeof window !== "undefined" && window.electronAPI) {
					const pendingAuth = await window.electronAPI.getPendingAuth();
					if (pendingAuth && pendingAuth.authCode) {
						console.log("Found pending auth code, processing...");
						const success = await spotifyService.exchangeCodeForToken(pendingAuth.authCode, pendingAuth.authState);
						if (success) {
							console.log("Token exchange successful!");
							clearInterval(pollInterval);
							setIsAuthenticated(true);
							setIsAuthenticating(false);
							updatePlaybackState();
							return;
						}
					}
				}

				// Reload tokens from storage (this will check both IPC and localStorage)
				await spotifyService.reloadTokens();

				if (spotifyService.isAuthenticated()) {
					console.log("Authentication detected! Stopping monitoring.");
					clearInterval(pollInterval);
					setIsAuthenticated(true);
					setIsAuthenticating(false);
					updatePlaybackState();
				}
			} catch (error) {
				console.error("Error checking authentication:", error);
			}
		}, 2000); // Check every 2 seconds

		// Stop monitoring after 5 minutes
		setTimeout(() => {
			console.log("Authentication monitoring timeout reached, stopping.");
			clearInterval(pollInterval);
			setIsAuthenticating(false);
		}, 300000);
	};

	const handleLogout = () => {
		spotifyService.clearTokens();
		setIsAuthenticated(false);
		setPlaybackState(null);
	};

	const handlePlayPause = async () => {
		if (isLoading) return;
		setIsLoading(true);

		try {
			await spotifyService.togglePlayback();
			// Update state immediately for better UX
			setTimeout(updatePlaybackState, 500);
		} catch (error) {
			console.error("Error toggling playback:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleNext = async () => {
		if (isLoading) return;
		setIsLoading(true);

		try {
			await spotifyService.skipToNext();
			setTimeout(updatePlaybackState, 500);
		} catch (error) {
			console.error("Error skipping to next:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handlePrevious = async () => {
		if (isLoading) return;
		setIsLoading(true);

		try {
			await spotifyService.skipToPrevious();
			setTimeout(updatePlaybackState, 500);
		} catch (error) {
			console.error("Error skipping to previous:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const formatTime = (ms: number) => {
		const seconds = Math.floor(ms / 1000);
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
	};

	const handleProgressClick = async (e: React.MouseEvent<HTMLDivElement>) => {
		if (!playbackState?.item) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const clickX = e.clientX - rect.left;
		const percentage = clickX / rect.width;
		const newPosition = Math.floor(percentage * playbackState.item.duration_ms);

		try {
			await spotifyService.seekToPosition(newPosition);
			setTimeout(updatePlaybackState, 200);
		} catch (error) {
			console.error("Error seeking:", error);
		}
	};

	if (!isAuthenticated) {
		return (
			<div
				className="flex items-center justify-center h-full p-1 bg-gradient-to-br from-green-900 via-green-800 to-green-900 cursor-move"
				style={getContainerStyle(true)}
				onMouseDown={handleMouseDown}
			>
				<motion.div
					className="flex h-full flex-col justify-center items-center"
					style={getDragStyle(false)}
					initial={{ opacity: 0, x: -20 }}
					animate={{
						opacity: 1,
						x: 0
					}}
					exit={{ opacity: 0, x: -20 }}
					transition={{
						duration: 0.3,
						ease: "easeInOut"
					}}
					onMouseDown={(e) => e.stopPropagation()}
				>
					<Button variant="ghost" size="sm" className="aspect-square w-8 h-8" onClick={handleClose} onMouseDown={(e) => e.stopPropagation()}>
						<X />
					</Button>
					<Button variant="ghost" size="sm" className="aspect-square w-8 h-8" onClick={handleMaximize} onMouseDown={(e) => e.stopPropagation()}>
						{isMaximized ? <Copy className={"[transform:scaleX(-1)]"} /> : <Square />}
					</Button>
					<Button variant="ghost" size="sm" className="aspect-square w-8 h-8" onClick={handleMinimize} onMouseDown={(e) => e.stopPropagation()}>
						<Minus />
					</Button>
				</motion.div>
				<div className="flex items-center gap-3 max-w-full w-full px-2">
					<div className={`w-8 h-8 flex-shrink-0 ${isAuthenticating ? "animate-pulse" : ""}`}>
						<svg viewBox="0 0 496 512" className="w-full h-full fill-green-400">
							<path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z" />
						</svg>
					</div>
					<div className="flex-1 min-w-0">
						<h1 className="text-sm font-bold text-white truncate">
							{isAuthenticating ? "Waiting for Login..." : "Connect to Spotify"}
						</h1>
						<p className="text-green-200 text-xs truncate">
							{isAuthenticating
								? "Complete login in browser"
								: "Login to control playback"}
						</p>
					</div>
					<Button
						onClick={handleLogin}
						disabled={isAuthenticating}
						className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full font-semibold text-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
						style={getDragStyle(false)}
						onMouseDown={(e) => e.stopPropagation()}
					>
						{isAuthenticating ? "Authenticating..." : "Login"}
					</Button>
				</div>
			</div>
		);
	}

	if (!playbackState?.item) {
		return (
			<div
				className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 cursor-move"
				style={getContainerStyle(true)}
				onMouseDown={handleMouseDown}
				onContextMenu={handleContextMenu}
			>
				{/* Context Menu */}
				{contextMenuOpen && (
					<div
						className="fixed z-50 bg-gray-800 border border-gray-600 rounded-md shadow-lg py-1 min-w-[120px]"
						style={{
							left: contextMenuPosition.x,
							top: contextMenuPosition.y,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<button
							className="w-full px-3 py-2 text-left text-sm text-white hover:bg-gray-700 flex items-center gap-2"
							onClick={() => {
								handleLogout();
								handleCloseContextMenu();
							}}
						>
							<LogOut className="h-4 w-4" />
							Logout
						</button>
					</div>
				)}
				<div className="text-center space-y-6">
					<div className="w-24 h-24 mx-auto mb-6 animate-pulse">
						<svg viewBox="0 0 496 512" className="w-full h-full fill-gray-400">
							<path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z" />
						</svg>
					</div>
					<h2 className="text-2xl font-bold text-white">No Music Playing</h2>
					<p className="text-gray-400">Start playing music on Spotify to see controls here.</p>
					<Button
						onClick={handleLogout}
						variant="outline"
						className="border-gray-600 text-gray-400 hover:text-white hover:border-white cursor-pointer"
						style={getDragStyle(false)}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<LogOut className="mr-2 h-4 w-4" />
						Logout
					</Button>
				</div>
			</div>
		);
	}

	const track = playbackState.item;
	const albumArt = track.album.images[0]?.url || "";
	const progress = getProgressPercentage();

	return (
		<div
			className="flex h-full gap-4 p-4"
			style={getContainerStyle(true)}
			onMouseDown={handleMouseDown}
			onMouseEnter={() => setIsHoveringWindow(true)}
			onMouseLeave={() => setIsHoveringWindow(false)}
			onContextMenu={handleContextMenu}
		>
			{/* Context Menu */}
			{contextMenuOpen && (
				<div
					className="fixed z-50 rounded-md"
					style={{
						left: contextMenuPosition.x,
						top: contextMenuPosition.y,
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<Button
						onClick={() => {
							handleLogout();
							handleCloseContextMenu();
						}}
					>
						<LogOut className="h-4 w-4" />
						Logout
					</Button>
				</div>
			)}
			{/* Debug info for drag regions */}
			{/*<div className="fixed top-0 left-0 text-xs text-white bg-black p-2 z-50">
				Shift: {isShiftPressed ? 'ON' : 'OFF'} |
				Container: {JSON.stringify(getContainerStyle(true))} |
				Title: {JSON.stringify(getDragStyle(false))}
			</div>*/}
						{isHoveringWindow && (
				<motion.div
					className="flex h-full flex-col justify-center items-center"
					style={getDragStyle(false)}
					initial={{ opacity: 0, x: -20 }}
					animate={{
						opacity: 1,
						x: 0
					}}
					exit={{ opacity: 0, x: -20 }}
					transition={{
						duration: 0.3,
						ease: "easeInOut"
					}}
					onMouseDown={(e) => e.stopPropagation()}
				>
					<Button variant="ghost" size="sm" className="aspect-square w-8 h-8" onClick={handleClose} onMouseDown={(e) => e.stopPropagation()}>
						<X />
					</Button>
					<Button variant="ghost" size="sm" className="aspect-square w-8 h-8" onClick={handleMaximize} onMouseDown={(e) => e.stopPropagation()}>
						{isMaximized ? <Copy className={"[transform:scaleX(-1)]"} /> : <Square />}
					</Button>
					<Button variant="ghost" size="sm" className="aspect-square w-8 h-8" onClick={handleMinimize} onMouseDown={(e) => e.stopPropagation()}>
						<Minus />
					</Button>
				</motion.div>
			)}
			<div className="flex flex-col w-full h-full gap-2">
				{/* Main Content Area */}
				<div className="flex-1 h-full flex items-center justify-between">
					<div className="flex w-full h-full justify-between gap-4">
						{/* Album Art */}
						<div className="flex justify-center items-center h-full gap-4">
							<div className="relative aspect-square h-full">
								{albumArt ? (
									<Image
										src={albumArt}
										alt={`${track.album.name} cover`}
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

							{/* Track Info */}
							<div className="flex flex-col justify-center items-start text-center">
								<h1 className="text-lg font-bold truncate">{track.name}</h1>
								<p className="text-base text-gray-300 truncate">
									{track.artists.map((artist) => artist.name).join(", ")}
								</p>
							</div>
						</div>

						{/* Controls */}
						<div
							className="flex items-center justify-center gap-2 cursor-default"
							style={getDragStyle(false)}
							onMouseDown={(e) => e.stopPropagation()}
						>
							<Button
								variant="ghost"
								size="lg"
								onClick={handlePrevious}
								disabled={isLoading}
								className="p-4 aspect-square rounded-full w-8 h-8"
								onMouseDown={(e) => e.stopPropagation()}
							>
								<SkipBack fill="currentColor" />
							</Button>

							<Button
								size="lg"
								onClick={handlePlayPause}
								disabled={isLoading}
								className="p-4 aspect-square rounded-full w-8 h-8"
								onMouseDown={(e) => e.stopPropagation()}
							>
								{playbackState.is_playing ? (
									<Pause size={32} fill="currentColor" />
								) : (
									<Play size={32} className="ml-0.5" fill="currentColor" />
								)}
							</Button>

							<Button
								variant="ghost"
								size="lg"
								onClick={handleNext}
								disabled={isLoading}
								className="p-4 aspect-square rounded-full w-8 h-8"
								onMouseDown={(e) => e.stopPropagation()}
							>
								<SkipForward fill="currentColor" />
							</Button>
						</div>
					</div>
				</div>

				{/* Progress Bar */}
				<div
					className="flex justify-between items-center gap-2 cursor-default"
					style={getDragStyle(false)}
					onMouseDown={(e) => e.stopPropagation()}
				>
					<span className="text-xs">{formatTime(playbackState.progress_ms || 0)}</span>
					<div
						className="w-full h-2 bg-gray-700 cursor-pointer overflow-hidden rounded-xl"
						onClick={handleProgressClick}
						onMouseDown={(e) => e.stopPropagation()}
					>
						<div
							className="h-full bg-green-500 rounded-xl transition-all duration-1000 ease-linear"
							style={{ width: `${progress}%` }}
						/>
					</div>
					<span className="text-xs">{formatTime(track.duration_ms)}</span>
				</div>
			</div>
		</div>
	);
}
