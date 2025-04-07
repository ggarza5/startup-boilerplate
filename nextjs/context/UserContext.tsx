// context/UserContext.tsx
'use client'; // Mark this as a Client Component

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client'; // Use the client-side Supabase client

// Ensure this component is only used in client environment
const isBrowser = typeof window !== 'undefined';

interface UserContextProps {
  user: User | null;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  hasValidSession: boolean;
  repairSession: () => Promise<boolean>;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  refreshUser: async () => {},
  isLoading: true,
  hasValidSession: false,
  repairSession: async () => false
});

interface UserProviderProps {
  children: ReactNode;
  initialUser: User | null;
}

export const UserProvider = ({ children, initialUser }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);

  const refreshUser = async () => {
    if (!isBrowser) return;

    setIsLoading(true);
    try {
      console.log('Refreshing user data...');
      const supabase = createClient();

      // First check if there's a valid session
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        setHasValidSession(false);
        setUser(null);
        return;
      }

      const hasSession = !!sessionData.session;
      console.log('Has active session:', hasSession);
      setHasValidSession(hasSession);

      if (!hasSession) {
        console.log('No active session found, clearing user data');
        setUser(null);
        return;
      }

      // If session exists, get the user data
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      } else if (data?.user) {
        console.log('User data refreshed successfully');
        setUser(data.user);
      } else {
        console.log('No user found despite valid session');
        setUser(null);
      }
    } catch (error) {
      console.error('Exception refreshing user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const repairSession = async (): Promise<boolean> => {
    if (!isBrowser) return false;

    setIsLoading(true);
    try {
      console.log('Attempting session repair...');
      const supabase = createClient();

      // Check if we have auth token cookies despite missing session
      const cookies = document.cookie;
      const hasTokenCookies =
        cookies.includes('sb-') && cookies.includes('-auth-token');

      if (!hasTokenCookies) {
        console.log('No auth cookies found, cannot repair session');
        return false;
      }

      console.log('Auth cookies found, attempting to refresh session');

      // Force token refresh
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('Session refresh error:', error);
        return false;
      }

      if (data.session) {
        console.log('Session successfully refreshed');
        setUser(data.user);
        setHasValidSession(true);
        return true;
      } else {
        console.log('No session returned after refresh');
        return false;
      }
    } catch (error) {
      console.error('Exception repairing session:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isBrowser) return;

    // Set initial user state from props
    if (initialUser) {
      console.log('Setting initial user from server-side data');
      setUser(initialUser);
    }

    const initializeAuth = async () => {
      // Initial validation
      await refreshUser();

      // If no valid session but we have a user, try to recover
      if (!hasValidSession && !recoveryAttempted && user) {
        console.log(
          'No valid session but user data exists, attempting recovery'
        );
        setRecoveryAttempted(true);
        await repairSession();
      }
    };

    initializeAuth();

    // Set up auth state listener
    const supabase = createClient();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);

      if (event === 'SIGNED_IN') {
        console.log('User signed in');
        setUser(session?.user || null);
        setHasValidSession(true);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setHasValidSession(false);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('Auth token refreshed');
        setUser(session?.user || null);
        setHasValidSession(true);
      } else if (event === 'USER_UPDATED') {
        console.log('User data updated');
        setUser(session?.user || null);
      }
    });

    // Set up a timer to periodically check the session status (every 5 minutes)
    const refreshInterval = setInterval(
      () => {
        console.log('Periodic session check');
        refreshUser();
      },
      5 * 60 * 1000
    );

    return () => {
      subscription.unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [initialUser, hasValidSession, recoveryAttempted, user]);

  return (
    <UserContext.Provider
      value={{
        user,
        refreshUser,
        isLoading,
        hasValidSession,
        repairSession
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
