'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

function useFetchUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const supabase = createClient();

  const fetchUser = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.getUser();
      if (authError) {
        throw authError;
      }
      setUser(data.user);
      setError(null);
    } catch (err) {
      const errorObj =
        err instanceof Error ? err : new Error('An unknown error occurred');
      setError(errorObj);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user data on mount
  useEffect(() => {
    fetchUser();
  }, []);

  return { user, loading, error, refetch: fetchUser, setLoading };
}

export default useFetchUser;
