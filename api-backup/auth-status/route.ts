import { NextRequest, NextResponse } from 'next/server';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  authenticated: boolean;
}

// Simple in-memory storage for auth tokens
let authTokens: AuthTokens | null = null;

export async function GET() {
  try {
    console.log('GET /api/auth-status - Current tokens:', authTokens ? 'available' : 'none');

    if (authTokens && authTokens.authenticated) {
      const tokens = { ...authTokens };
      authTokens = null; // Clear after reading (one-time use)
      console.log('Returning tokens and clearing storage');
      return NextResponse.json(tokens);
    }

    console.log('No tokens available');
    return NextResponse.json({ authenticated: false });
  } catch (error) {
    console.error('Error in GET /api/auth-status:', error);
    return NextResponse.json({ authenticated: false, error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('POST /api/auth-status - Saving tokens');
    const authData = await req.json();
    console.log('Received auth data keys:', Object.keys(authData));

    authTokens = {
      accessToken: authData.accessToken || '',
      refreshToken: authData.refreshToken || '',
      authenticated: true
    };

    console.log('Tokens saved successfully');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/auth-status:', error);
    return NextResponse.json({ error: 'Failed to save auth status' }, { status: 500 });
  }
}
