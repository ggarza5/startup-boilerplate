'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useUser } from '@/context/UserContext';

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic';

export default function AuthDebugPage() {
  const { user, isLoading, refreshUser, hasValidSession } = useUser();
  const [cookies, setCookies] = useState<string[]>([]);
  const [cookieCount, setCookieCount] = useState(0);
  const [authTokens, setAuthTokens] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [showAllCookies, setShowAllCookies] = useState(false);

  // Check if running in browser
  const isBrowser = typeof window !== 'undefined';

  const cleanupCookies = () => {
    if (!isBrowser) return;

    try {
      // Access the cleanupAuthCookies function if it's available on window
      const cleanupFn = (window as any).cleanupAuthCookies;
      if (typeof cleanupFn === 'function') {
        cleanupFn();
        refreshCookies();
        return true;
      }
    } catch (err) {
      console.error('Failed to clean up cookies:', err);
      setError(`Failed to clean up cookies: ${err}`);
    }
    return false;
  };

  const refreshCookies = () => {
    if (!isBrowser) return;

    try {
      const allCookies = document.cookie.split(';');
      setCookies(allCookies.map((c) => c.trim()));
      setCookieCount(allCookies.length);

      // Extract auth tokens
      const authCookies = allCookies.filter((c) => c.includes('-auth-token'));
      setAuthTokens(authCookies.map((c) => c.trim()));
    } catch (err) {
      console.error('Error refreshing cookies:', err);
      setError(`Error refreshing cookies: ${err}`);
    }
  };

  const checkSupabaseAuth = async () => {
    if (!isBrowser) return;

    try {
      setError(null);
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error('Error getting user:', error.message);
        setError(`Supabase auth error: ${error.message}`);
        setSupabaseUser(null);
      } else {
        setSupabaseUser(data.user);
        console.log('Supabase user:', data.user);
      }
    } catch (err) {
      console.error('Unexpected error checking auth:', err);
      setError(`Unexpected error: ${err}`);
    }
  };

  useEffect(() => {
    if (isBrowser) {
      refreshCookies();
      checkSupabaseAuth();
    }
  }, []);

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">User Context State</h2>
          <p className="text-sm text-gray-500 mb-4">
            Information from UserContext
          </p>

          <div className="mb-4">
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${hasValidSession ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
            >
              {hasValidSession ? 'Valid Session' : 'No Valid Session'}
            </span>
            {isLoading && (
              <span className="inline-block ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                Loading...
              </span>
            )}
          </div>

          <div className="space-y-2">
            <p>
              <strong>User ID:</strong> {user?.id || 'Not logged in'}
            </p>
            <p>
              <strong>Email:</strong> {user?.email || 'N/A'}
            </p>
            <p>
              <strong>Provider:</strong> {user?.app_metadata?.provider || 'N/A'}
            </p>
          </div>

          <div className="mt-4">
            <button
              onClick={refreshUser}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh User
            </button>
          </div>
        </div>

        <div className="border rounded-lg p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Supabase Auth Check</h2>
          <p className="text-sm text-gray-500 mb-4">
            Direct check with Supabase client
          </p>

          <div className="space-y-2">
            <p>
              <strong>User ID:</strong> {supabaseUser?.id || 'Not logged in'}
            </p>
            <p>
              <strong>Email:</strong> {supabaseUser?.email || 'N/A'}
            </p>
            <p>
              <strong>Provider:</strong>{' '}
              {supabaseUser?.app_metadata?.provider || 'N/A'}
            </p>
            {error && (
              <div className="text-red-500 mt-2 p-2 bg-red-50 rounded">
                {error}
              </div>
            )}
          </div>

          <div className="mt-4">
            <button
              onClick={checkSupabaseAuth}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Check Supabase Auth
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 border rounded-lg p-4 shadow-sm">
        <h2 className="text-xl font-semibold mb-2">Cookie Debug</h2>
        <div className="flex items-center mb-4">
          <p className="text-sm text-gray-500">{cookieCount} cookies found</p>

          <button
            onClick={refreshCookies}
            className="ml-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          >
            Refresh
          </button>

          <button
            onClick={cleanupCookies}
            className="ml-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
          >
            Clean Auth Cookies
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          <button
            className={`px-3 py-1 text-sm rounded ${!showAllCookies ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
            onClick={() => setShowAllCookies(false)}
          >
            Auth Cookies ({authTokens.length})
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${showAllCookies ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}
            onClick={() => setShowAllCookies(true)}
          >
            All Cookies ({cookies.length})
          </button>
        </div>

        {!showAllCookies ? (
          authTokens.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded overflow-auto max-h-80">
              <pre className="text-xs">
                {authTokens.map((cookie, i) => (
                  <div key={i} className="mb-1">
                    {cookie}
                  </div>
                ))}
              </pre>
            </div>
          ) : (
            <p>No auth cookies found</p>
          )
        ) : (
          <div className="bg-gray-50 p-4 rounded overflow-auto max-h-80">
            <pre className="text-xs">
              {cookies.map((cookie, i) => (
                <div key={i} className="mb-1">
                  {cookie}
                </div>
              ))}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
