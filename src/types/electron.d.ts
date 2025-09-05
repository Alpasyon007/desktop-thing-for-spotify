export interface ElectronAPI {
	on: (channel: string, callback: (...args: unknown[]) => void) => void;
	send: (channel: string, args: unknown) => void;
	windowMinimize: () => Promise<void>;
	windowMaximize: () => Promise<void>;
	windowClose: () => Promise<void>;
	windowIsMaximized: () => Promise<boolean>;
	openExternal: (url: string) => Promise<void>;
	setSpotifyTokens: (tokens: { accessToken: string; refreshToken: string }) => Promise<boolean>;
	getSpotifyTokens: () => Promise<{ accessToken: string; refreshToken: string } | null>;
	clearSpotifyTokens: () => Promise<boolean>;
	setCodeVerifier: (codeVerifier: string) => Promise<void>;
	getCodeVerifier: () => Promise<string | null>;
	clearCodeVerifier: () => Promise<void>;
	handleOAuthCallback: (code: string, state?: string) => Promise<{ success: boolean }>;
	getPendingAuth: () => Promise<{ authCode: string; authState?: string } | null>;
	windowDragStart: (coordinates: {
		x: number;
		y: number;
	}) => Promise<{ windowX: number; windowY: number; startMouseX: number; startMouseY: number }>;
	windowDragMove: (data: { mouseX: number; mouseY: number; startData: any }) => Promise<void>;
}

declare global {
	interface Window {
		electronAPI?: ElectronAPI;
	}
}

export {};
