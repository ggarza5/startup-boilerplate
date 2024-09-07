// context/UserContext.tsx
"use client"; // Mark this as a Client Component

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client'; // Use the client-side Supabase client

interface UserContextProps {
  user: User | null;
  userLoading: boolean;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  userLoading: true,
  setUser: () => {},
});

interface UserProviderProps {
  children: ReactNode;
  initialUser: User | null;
}

export const UserProvider = ({ children, initialUser }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser);
  const [userLoading, setUserLoading] = useState(!initialUser);

  useEffect(() => {
    // If no initial user, fetch on client-side
    if (!initialUser) {
      const fetchUser = async () => {
        const client = createClient();
        const { data: { user } } = await client.auth.getUser();
        setUser(user);
        setUserLoading(false);
      };
      fetchUser();       
    } else {
      // If initial user exists, set loading to false
      setUserLoading(false);
    }
  }, [initialUser]);

  return (
    <UserContext.Provider value={{ user, userLoading, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
