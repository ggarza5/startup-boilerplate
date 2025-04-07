'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import AuthDebug from '@/components/misc/AuthDebug';
import CookieDebug from '@/components/misc/CookieDebug';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/client';

export default function AboutPage() {
  const { user, refreshUser } = useUser();
  const [showDebug, setShowDebug] = useState(false);
  const [authState, setAuthState] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkSession = async () => {
        try {
          setLoading(true);
          const supabase = createClient();
          const {
            data: { session },
            error
          } = await supabase.auth.getSession();
          if (error) {
            console.error('Error fetching session:', error);
          } else {
            setAuthState({
              hasSession: !!session,
              expiresAt: session?.expires_at
                ? new Date(session.expires_at * 1000).toLocaleString()
                : 'N/A',
              provider: session?.user?.app_metadata?.provider || 'None',
              lastSignIn: session?.user?.last_sign_in_at
                ? new Date(session.user.last_sign_in_at).toLocaleString()
                : 'Never'
            });
          }
        } catch (err) {
          console.error('Error checking session:', err);
        } finally {
          setLoading(false);
        }
      };

      checkSession();
    }
  }, []);

  return (
    <div className="container mx-auto py-10">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About This Application</CardTitle>
          <CardDescription>
            Technical details and debugging information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Application Info</h3>
              <p>Version: 1.0.0</p>
              <p>Environment: {process.env.NODE_ENV}</p>
              <p>Next.js Runtime: {process.env.NEXT_RUNTIME || 'browser'}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium">Authentication Status</h3>
              {loading ? (
                <p className="text-sm text-gray-500">
                  Loading authentication status...
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium">
                    {user ? `Logged in as: ${user.email}` : 'Not authenticated'}
                  </p>

                  {authState && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <p className="text-gray-500">Active Session:</p>
                      <p>{authState.hasSession ? 'Yes' : 'No'}</p>

                      <p className="text-gray-500">Auth Provider:</p>
                      <p>{authState.provider}</p>

                      <p className="text-gray-500">Session Expires:</p>
                      <p>{authState.expiresAt}</p>

                      <p className="text-gray-500">Last Sign In:</p>
                      <p>{authState.lastSignIn}</p>
                    </div>
                  )}

                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshUser()}
                      className="mr-2"
                    >
                      Refresh Auth State
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDebug(!showDebug)}
                    >
                      {showDebug ? 'Hide' : 'Show'} Debug Info
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {showDebug && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Auth Debugging</h3>
                <AuthDebug />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
