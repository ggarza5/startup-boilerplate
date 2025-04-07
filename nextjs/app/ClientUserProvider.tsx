'use client';

import { User } from '@supabase/supabase-js';
import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import UserProvider to ensure it only runs on client
const DynamicUserProvider = dynamic(
  () => import('@/context/UserContext').then((mod) => mod.UserProvider),
  { ssr: false }
);

interface ClientUserProviderProps {
  children: ReactNode;
  initialUser: User | null;
}

export default function ClientUserProvider({
  children,
  initialUser
}: ClientUserProviderProps) {
  return (
    <DynamicUserProvider initialUser={initialUser}>
      {children}
    </DynamicUserProvider>
  );
}
