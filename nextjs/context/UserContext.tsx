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

interface UserContextProps {
  user: User | null;
  userLoading: boolean;
  setUser: (user: User | null) => void;
  refreshUser: () => Promise<void>; // Add refreshUser function
}

const UserContext = createContext<UserContextProps>({
  user: null,
  userLoading: true,
  setUser: () => {},
  refreshUser: async () => {} // Initialize refreshUser
});

interface UserProviderProps {
  children: ReactNode;
  initialUser: User | null;
}

export const UserProvider = ({ children, initialUser }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [userLoading, setUserLoading] = useState(!initialUser);

  // Add refreshUser function that can be called anywhere in the app
  const refreshUser = async () => {
    setUserLoading(true);
    try {
      const client = createClient();
      const { data, error } = await client.auth.getUser();

      if (error) {
        console.error('Error refreshing user:', error.message);
        setUser(null);
      } else {
        console.log(
          'User refreshed successfully:',
          data.user ? 'Authenticated' : 'Not authenticated'
        );
        setUser(data.user);
      }
    } catch (e) {
      console.error('Exception refreshing user:', e);
      setUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state change listener
    const client = createClient();

    // Set initial state if no initialUser
    if (!initialUser) {
      refreshUser();
    } else {
      setUserLoading(false);
    }

    // Subscribe to auth state changes
    const {
      data: { subscription }
    } = client.auth.onAuthStateChange((event, session) => {
      console.log(
        'Auth state changed:',
        event,
        session ? 'Has session' : 'No session'
      );

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user || null);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [initialUser]);

  return (
    <UserContext.Provider value={{ user, userLoading, setUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
