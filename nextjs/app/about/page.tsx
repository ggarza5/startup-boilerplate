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
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function AboutPage() {
  const router = useRouter();
  const { user, refreshUser, isLoading, hasValidSession } = useUser();
  const [showDebug, setShowDebug] = useState(false);
  const [authState, setAuthState] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [repairingSession, setRepairingSession] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkSession = async () => {
        try {
          setSessionLoading(true);
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
          setSessionLoading(false);
        }
      };

      checkSession();
    }
  }, []);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.'
      });
      await refreshUser();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Could not sign out. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSigningOut(false);
    }
  };

  // Function to attempt to repair the session
  const handleRepairSession = async () => {
    try {
      setRepairingSession(true);
      toast({
        title: 'Refreshing Session',
        description: 'Attempting to refresh your authentication session...'
      });

      // Use the refreshUser function instead of repairSession
      await refreshUser();

      // Check if the session is valid after refresh
      const supabase = createClient();
      const {
        data: { session },
        error
      } = await supabase.auth.getSession();

      const success = !!session && !error;

      if (success) {
        toast({
          title: 'Session Refreshed',
          description: 'Authentication session successfully refreshed.'
        });

        // Update local session data
        setAuthState({
          hasSession: true,
          expiresAt: session?.expires_at
            ? new Date(session.expires_at * 1000).toLocaleString()
            : 'N/A',
          provider: session?.user?.app_metadata?.provider || 'None',
          lastSignIn: session?.user?.last_sign_in_at
            ? new Date(session.user.last_sign_in_at).toLocaleString()
            : 'Never'
        });
      } else {
        toast({
          title: 'Session Refresh Failed',
          description: 'Could not refresh your authentication session.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error refreshing session:', error);
      toast({
        title: 'Session Refresh Failed',
        description:
          error.message || 'Could not refresh authentication session.',
        variant: 'destructive'
      });
    } finally {
      setRepairingSession(false);
    }
  };

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
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={hasValidSession ? 'success' : 'destructive'}>
                  {hasValidSession ? 'Valid Session' : 'Invalid Session'}
                </Badge>

                {isLoading && (
                  <Badge variant="outline" className="animate-pulse">
                    Loading...
                  </Badge>
                )}
              </div>

              {sessionLoading ? (
                <p className="text-sm text-gray-500 mt-2">
                  Loading session details...
                </p>
              ) : (
                <div className="space-y-2 mt-2">
                  <p className="font-medium">
                    {user ? `Logged in as: ${user.email}` : 'Not authenticated'}
                  </p>

                  {authState && (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <p className="text-gray-500">Context Session Status:</p>
                      <p>{hasValidSession ? 'Valid' : 'Invalid'}</p>

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

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refreshUser()}
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
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleRepairSession}
                      disabled={repairingSession}
                    >
                      {repairingSession ? 'Refreshing...' : 'Refresh Session'}
                    </Button>
                    {user && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleSignOut}
                        disabled={signingOut}
                      >
                        {signingOut ? 'Signing Out...' : 'Sign Out'}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/auth/debug')}
                    >
                      Advanced Auth Debug
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
