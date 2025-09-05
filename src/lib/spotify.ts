"use client";

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
}

export interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: SpotifyTrack | null;
  device: {
    id: string;
    name: string;
    volume_percent: number;
  } | null;
}

class SpotifyService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private clientId: string = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
  private redirectUri: string = 'http://127.0.0.1:3004/callback'; // Always use the Electron HTTP server
  private codeVerifier: string | null = null;

  constructor() {
    console.log('Spotify redirect URI:', this.redirectUri);
    // Note: We don't load tokens in constructor since it's async
    // Tokens will be loaded on first call to reloadTokens() or isAuthenticated()
  }

  // Generate a random string for PKCE
  private generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
  }

  // Generate code challenge for PKCE
  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  // Load tokens from either Electron IPC or localStorage
  private async loadTokens(): Promise<void> {
    console.log('Loading tokens from storage...');

    if (typeof window !== 'undefined' && window.electronAPI) {
      // Use Electron IPC if available
      try {
        console.log('Attempting to load tokens from Electron IPC...');
        const tokens = await window.electronAPI.getSpotifyTokens();
        if (tokens) {
          console.log('Tokens loaded from Electron IPC:', !!tokens.accessToken, !!tokens.refreshToken);
          this.accessToken = tokens.accessToken;
          this.refreshToken = tokens.refreshToken;
        } else {
          console.log('No tokens found in Electron IPC');
        }
      } catch (error) {
        console.error('Error loading tokens from Electron:', error);
      }
    }

    // If we still don't have tokens, try localStorage
    if (!this.accessToken && typeof window !== 'undefined') {
      console.log('Attempting to load tokens from localStorage...');
      this.accessToken = localStorage.getItem('spotify_access_token');
      this.refreshToken = localStorage.getItem('spotify_refresh_token');

      if (this.accessToken) {
        console.log('Tokens loaded from localStorage:', !!this.accessToken, !!this.refreshToken);
      } else {
        console.log('No tokens found in localStorage');
      }
    }

    console.log('Final token status after loading:', !!this.accessToken, !!this.refreshToken);
  }

  // Store tokens in either Electron IPC or localStorage
  private async storeTokens(accessToken: string, refreshToken: string): Promise<void> {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;

    if (typeof window !== 'undefined' && window.electronAPI) {
      // Use Electron IPC if available
      try {
        await window.electronAPI.setSpotifyTokens({ accessToken, refreshToken });
        console.log('Tokens stored via Electron IPC');
      } catch (error) {
        console.error('Error storing tokens via Electron:', error);
      }
    } else if (typeof window !== 'undefined') {
      // If running in browser (not Electron), try to send tokens to Electron app
      try {
        const response = await fetch('http://127.0.0.1:3004/spotify-tokens', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ accessToken, refreshToken }),
        });

        if (response.ok) {
          console.log('Tokens sent to Electron app');
        } else {
          console.log('Electron app not running, tokens stored locally only');
        }
      } catch {
        console.log('Electron app not accessible, tokens stored locally only');
      }
    }

    // Also store in localStorage as fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_access_token', accessToken);
      localStorage.setItem('spotify_refresh_token', refreshToken);
      console.log('Tokens stored in localStorage');
    }
  }

  // Reload tokens from storage
  async reloadTokens(): Promise<void> {
    await this.loadTokens();
  }

  // Store code verifier in either Electron IPC or localStorage
  private async storeCodeVerifier(codeVerifier: string): Promise<void> {
    this.codeVerifier = codeVerifier;

    if (typeof window !== 'undefined' && window.electronAPI) {
      // Use Electron IPC if available
      try {
        await window.electronAPI.setCodeVerifier(codeVerifier);
        console.log('Code verifier stored via Electron IPC');
      } catch (error) {
        console.error('Error storing code verifier via Electron:', error);
      }
    }

    // Also store in localStorage as fallback
    if (typeof window !== 'undefined') {
      localStorage.setItem('spotify_code_verifier', codeVerifier);
      console.log('Code verifier stored in localStorage');
    }
  }

  // Get code verifier from either Electron IPC, localStorage, or URL state
  private async getCodeVerifier(state?: string): Promise<string | null> {
    // First try to get from memory
    if (this.codeVerifier) {
      return this.codeVerifier;
    }

    // Try Electron IPC
    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        const codeVerifier = await window.electronAPI.getCodeVerifier();
        if (codeVerifier) {
          this.codeVerifier = codeVerifier;
          return codeVerifier;
        }
      } catch (error) {
        console.error('Error getting code verifier from Electron:', error);
      }
    }

    // Try localStorage
    if (typeof window !== 'undefined') {
      const codeVerifier = localStorage.getItem('spotify_code_verifier');
      if (codeVerifier) {
        this.codeVerifier = codeVerifier;
        return codeVerifier;
      }
    }

    // Finally, try to extract from state parameter
    if (state) {
      try {
        const decodedState = JSON.parse(atob(state));
        if (decodedState.codeVerifier) {
          this.codeVerifier = decodedState.codeVerifier;
          // Store it for future use
          await this.storeCodeVerifier(decodedState.codeVerifier);
          return decodedState.codeVerifier;
        }
      } catch (error) {
        console.error('Error parsing state parameter:', error);
      }
    }

    return null;
  }

  // Clear code verifier from storage
  private async clearCodeVerifier(): Promise<void> {
    this.codeVerifier = null;

    if (typeof window !== 'undefined' && window.electronAPI) {
      try {
        await window.electronAPI.clearCodeVerifier();
      } catch (error) {
        console.error('Error clearing code verifier from Electron:', error);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('spotify_code_verifier');
    }
  }

  // Generate Spotify authorization URL with PKCE
  async getAuthUrl(): Promise<string> {
    const scopes = [
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'streaming',
      'user-read-email',
      'user-read-private'
    ].join(' ');

    // Generate PKCE parameters
    this.codeVerifier = this.generateRandomString(128);
    const codeChallenge = await this.generateCodeChallenge(this.codeVerifier);

    // Store code verifier for later use
    await this.storeCodeVerifier(this.codeVerifier);

    // Also encode the code verifier in the state parameter as a backup
    // This ensures the browser callback can access it even if IPC isn't available
    const state = btoa(JSON.stringify({ codeVerifier: this.codeVerifier }));

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      state: state,
      show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  // Exchange authorization code for access token using PKCE
  async exchangeCodeForToken(code: string, state?: string): Promise<boolean> {
    try {
      // Get the code verifier from storage or state parameter
      const codeVerifier = await this.getCodeVerifier(state);

      if (!codeVerifier) {
        console.error('No code verifier found');
        return false;
      }

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
          client_id: this.clientId,
          code_verifier: codeVerifier
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Token exchange failed:', response.status, response.statusText, errorText);
        return false;
      }

      const data = await response.json();

      // Store tokens using the new storage system
      await this.storeTokens(data.access_token, data.refresh_token);

      // Clean up code verifier
      await this.clearCodeVerifier();

      console.log('Tokens stored successfully');
      return true;
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      return false;
    }
  }

  // Refresh the access token
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      console.error('No refresh token available');
      return false;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
          client_id: this.clientId
        })
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status, response.statusText);
        return false;
      }

      const data = await response.json();

      // Store updated tokens using the new storage system
      const newRefreshToken = data.refresh_token || this.refreshToken;
      await this.storeTokens(data.access_token, newRefreshToken);

      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return false;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    // If we haven't loaded tokens yet and we're in a browser environment, try to load them synchronously
    if (!this.accessToken && typeof window !== 'undefined') {
      // Try to load from localStorage synchronously as a fallback
      this.accessToken = localStorage.getItem('spotify_access_token');
      this.refreshToken = localStorage.getItem('spotify_refresh_token');

      if (this.accessToken) {
        console.log('Loaded tokens from localStorage synchronously');
      }
    }

    return !!this.accessToken;
  }

  // Check if we have both access and refresh tokens (more robust check)
  hasValidTokens(): boolean {
    return !!(this.accessToken && this.refreshToken);
  }

  // Make authenticated API request with automatic token refresh
  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    const headers = {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    let response = await fetch(url, { ...options, headers });

    // If token expired, try to refresh and retry
    if (response.status === 401) {
      console.log('Token expired, attempting refresh...');
      const refreshed = await this.refreshAccessToken();

      if (refreshed) {
        // Retry with new token
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        throw new Error('Token refresh failed');
      }
    }

    return response;
  }

  // Get current playback state
  async getCurrentPlayback(): Promise<SpotifyPlaybackState | null> {
    try {
      const response = await this.makeAuthenticatedRequest('https://api.spotify.com/v1/me/player');

      if (response.status === 204) {
        // No active device
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting current playback:', error);
      return null;
    }
  }

  // Play/pause
  async togglePlayback(): Promise<boolean> {
    try {
      const currentState = await this.getCurrentPlayback();

      if (!currentState) {
        return false;
      }

      const endpoint = currentState.is_playing ? 'pause' : 'play';
      const response = await this.makeAuthenticatedRequest(
        `https://api.spotify.com/v1/me/player/${endpoint}`,
        { method: 'PUT' }
      );

      return response.ok;
    } catch (error) {
      console.error('Error toggling playback:', error);
      return false;
    }
  }

  // Next track
  async nextTrack(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(
        'https://api.spotify.com/v1/me/player/next',
        { method: 'POST' }
      );

      return response.ok;
    } catch (error) {
      console.error('Error skipping to next track:', error);
      return false;
    }
  }

  // Previous track
  async previousTrack(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(
        'https://api.spotify.com/v1/me/player/previous',
        { method: 'POST' }
      );

      return response.ok;
    } catch (error) {
      console.error('Error skipping to previous track:', error);
      return false;
    }
  }

  // Alias methods for component compatibility
  async skipToNext(): Promise<boolean> {
    return this.nextTrack();
  }

  async skipToPrevious(): Promise<boolean> {
    return this.previousTrack();
  }

  // Seek to position in current track
  async seekToPosition(positionMs: number): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(
        `https://api.spotify.com/v1/me/player/seek?position_ms=${positionMs}`,
        { method: 'PUT' }
      );

      return response.ok;
    } catch (error) {
      console.error('Error seeking to position:', error);
      return false;
    }
  }

  // Clear stored tokens (logout)
  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;

    if (typeof window !== 'undefined' && window.electronAPI) {
      // Clear from Electron IPC
      try {
        await window.electronAPI.clearSpotifyTokens();
        console.log('Tokens cleared from Electron IPC');
      } catch (error) {
        console.error('Error clearing tokens from Electron:', error);
      }
    }

    // Also clear from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      console.log('Tokens cleared from localStorage');
    }
  }

  // Alias for clearTokens (for backwards compatibility)
  logout(): void {
    this.clearTokens();
  }
}export const spotifyService = new SpotifyService();
