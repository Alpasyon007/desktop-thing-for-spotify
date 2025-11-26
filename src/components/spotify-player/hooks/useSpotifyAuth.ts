"use client";

import { spotifyService } from "@/lib/spotify";

import { useCallback, useEffect, useState } from "react";

export function useSpotifyAuth() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isAuthenticating, setIsAuthenticating] = useState(false);

	const checkAuth = useCallback(async () => {
		try {
			console.log("Checking existing authentication...");

			// First check if we already have tokens in memory
			let isAuth = spotifyService.isAuthenticated();
			console.log("Initial authentication check:", isAuth);

			// If not authenticated, try to reload tokens from storage
			if (!isAuth) {
				console.log("No tokens in memory, reloading from storage...");
				await spotifyService.reloadTokens();
				isAuth = spotifyService.isAuthenticated();
				console.log("Authentication status after reload:", isAuth);
			}

			setIsAuthenticated(isAuth);
		} catch (error) {
			console.error("Error checking authentication:", error);
			setIsAuthenticated(false);
		}
	}, []);

	// Check authentication status on mount and when tokens might change
	useEffect(() => {
		checkAuth();

		// Also listen for storage events in case tokens are updated in another window/tab
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === "spotify_access_token" || e.key === "spotify_refresh_token") {
				console.log("Spotify tokens changed in storage, rechecking auth...");
				checkAuth();
			}
		};

		if (typeof window !== "undefined") {
			window.addEventListener("storage", handleStorageChange);
		}

		return () => {
			if (typeof window !== "undefined") {
				window.removeEventListener("storage", handleStorageChange);
			}
		};
	}, [checkAuth]);

	// Periodic authentication check to ensure tokens are still valid
	useEffect(() => {
		if (!isAuthenticated) return;

		const checkTokenValidity = async () => {
			try {
				// Try to make a simple API call to verify token validity
				await spotifyService.getCurrentPlayback();
			} catch (error) {
				console.error("Token validation failed:", error);
				if (error instanceof Error && error.message.includes("Token refresh failed")) {
					console.log("Authentication lost, clearing session");
					setIsAuthenticated(false);
				}
			}
		};

		// Check token validity every 30 minutes
		const tokenCheckInterval = setInterval(checkTokenValidity, 30 * 60 * 1000);
		return () => clearInterval(tokenCheckInterval);
	}, [isAuthenticated]);

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
	};

	return {
		isAuthenticated,
		isAuthenticating,
		handleLogin,
		handleLogout,
		checkAuth
	};
}
