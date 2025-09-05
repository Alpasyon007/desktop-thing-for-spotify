"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { spotifyService } from '@/lib/spotify';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing...');
  const [isInElectron, setIsInElectron] = useState(false);

  useEffect(() => {
    // Check if we're running inside Electron
    setIsInElectron(typeof window !== 'undefined' && !!window.electronAPI);

    const handleAuthCode = async (code: string, state?: string) => {
      try {
        setStatus('Exchanging authorization code...');
        const success = await spotifyService.exchangeCodeForToken(code, state);

        if (success) {
          setStatus('Authentication successful! You can now return to the Spotify Desktop app.');

          // For browser-based auth, try to close the tab automatically
          if (!window.electronAPI) {
            // If we're in a browser and there's an Electron app running,
            // the tokens will be shared via HTTP to the Electron app
            setStatus('Authentication successful! Tokens sent to Spotify Desktop app. This tab will close automatically.');
            setTimeout(() => {
              window.close();
            }, 3000);
          } else {
            // If running inside Electron, redirect to main page
            setTimeout(() => router.push('/'), 2000);
          }
        } else {
          setStatus('Failed to authenticate. Please try again.');
          if (!window.electronAPI) {
            //setTimeout(() => window.close(), 3000);
          } else {
            setTimeout(() => router.push('/'), 3000);
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('Authentication error occurred. Please try again.');
        if (!window.electronAPI) {
          setTimeout(() => window.close(), 3000);
        } else {
          setTimeout(() => router.push('/'), 3000);
        }
      }
    };

    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      setStatus('Authentication failed. Please try again.');
      setTimeout(() => router.push('/'), 3000);
      return;
    }

    if (code) {
      handleAuthCode(code, state || undefined);
    } else {
      setStatus('No authorization code received.');
      setTimeout(() => router.push('/'), 3000);
    }
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto mb-6 animate-spin">
          <svg viewBox="0 0 496 512" className="w-full h-full fill-green-400">
            <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold">Spotify Authentication</h1>
        <p className="text-green-200">{status}</p>
        {!isInElectron && status.includes('successful') && (
          <div className="mt-6 p-4 bg-green-800 rounded-lg">
            <p className="text-sm">
              ✅ You can now close this browser tab and return to the Spotify Desktop app!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto mb-6 animate-spin">
            <svg viewBox="0 0 496 512" className="w-full h-full fill-green-400">
              <path d="M248 8C111.1 8 0 119.1 0 256s111.1 248 248 248 248-111.1 248-248S384.9 8 248 8zm100.7 364.9c-4.2 0-6.8-1.3-10.7-3.6-62.4-37.6-135-39.2-206.7-24.5-3.9 1-9 2.6-11.9 2.6-9.7 0-15.8-7.7-15.8-15.8 0-10.3 6.1-15.2 13.6-16.8 81.9-18.1 165.6-16.5 237 26.2 6.1 3.9 9.7 7.4 9.7 16.5s-7.1 15.4-15.2 15.4zm26.9-65.6c-5.2 0-8.7-2.3-12.3-4.2-62.5-37-155.7-51.9-238.6-29.4-4.8 1.3-7.4 2.6-11.9 2.6-10.7 0-19.4-8.7-19.4-19.4s5.2-17.8 15.5-20.7c27.8-7.8 56.2-13.6 97.8-13.6 64.9 0 127.6 16.1 177 45.5 8.1 4.8 11.3 11 11.3 19.7-.1 10.8-8.5 19.5-19.4 19.5zm31-76.2c-5.2 0-8.4-1.3-12.9-3.9-71.2-42.5-198.5-52.7-280.9-29.7-3.6 1-8.1 2.6-12.9 2.6-13.2 0-23.3-10.3-23.3-23.6 0-13.6 8.4-21.3 17.4-23.9 35.2-10.3 74.6-15.2 117.5-15.2 73 0 149.5 15.2 205.4 47.8 7.8 4.5 12.9 10.7 12.9 22.6 0 13.6-11 23.3-23.2 23.3z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Loading...</h1>
          <p className="text-green-200">Please wait...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
