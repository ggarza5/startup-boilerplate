// context/UserContext.tsx
'use client'; // Mark this as a Client Component

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode
} from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client'; // Use the client-side Supabase client

// Ensure this component is only used in client environment
const isBrowser = typeof window !== 'undefined';

interface UserContextProps {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  hasValidSession: boolean;
  lastRefresh: number;
}

// Default context state
const defaultContextState: UserContextProps = {
  user: null,
  isLoading: true,
  refreshUser: async () => {},
  hasValidSession: false,
  lastRefresh: 0
};

const UserContext = createContext<UserContextProps>(defaultContextState);

interface UserProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

// Minimum time between session refreshes in milliseconds (5 seconds)
const REFRESH_THROTTLE = 5000;

export const UserProvider: React.FC<UserProviderProps> = ({
  children,
  initialUser = null
}) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasValidSession, setHasValidSession] = useState<boolean>(false);
  const [lastRefresh, setLastRefresh] = useState<number>(0);
  const [authError, setAuthError] = useState<string | null>(null);

  // Throttled refresh function to prevent excessive API calls
  const refreshUser = useCallback(async () => {
    if (!isBrowser) return;

    const now = Date.now();
    if (now - lastRefresh < REFRESH_THROTTLE) {
      console.log('Session refresh throttled');
      return;
    }

    setLastRefresh(now);
    setIsLoading(true);
    setAuthError(null);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Error fetching user:', error.message);
        setAuthError(error.message);
        setUser(null);
        setHasValidSession(false);
      } else {
        setUser(user);
        setHasValidSession(!!user);
        if (user) {
          console.log('User session refreshed successfully');
        }
      }
    } catch (error) {
      console.error('Unexpected error in refreshUser:', error);
      setAuthError(error instanceof Error ? error.message : 'Unknown error');
      setUser(null);
      setHasValidSession(false);
    } finally {
      setIsLoading(false);
    }
  }, [lastRefresh]);

  // Initial auth check + subscription to auth changes
  useEffect(() => {
    if (!isBrowser) return;

    // Initial auth check
    refreshUser();

    // Subscribe to auth changes
    const supabase = createClient();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`Auth state changed: ${event}`);

      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
        setHasValidSession(!!session?.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setHasValidSession(false);
      } else if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setUser(session?.user || null);
        setHasValidSession(!!session?.user);
      }
    });

    // Cleanup subscription
    return () => {
      subscription?.unsubscribe();
    };
  }, [refreshUser]);

  return (
    <UserContext.Provider
      value={{ user, isLoading, refreshUser, hasValidSession, lastRefresh }}
    >
      {children}
      {authError && isBrowser && (
        <div style={{ display: 'none' }}>
          {/* Hidden div to record errors for debugging */}
          Auth error: {authError}
        </div>
      )}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

export default UserContext;
