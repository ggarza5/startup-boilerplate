'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import CookieDebug from './CookieDebug';

export default function AuthDebug() {
  const [userJson, setUserJson] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [environment, setEnvironment] = useState<string>('unknown');
  const [activeTab, setActiveTab] = useState<'auth' | 'cookies'>('auth');

  const checkAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      if (typeof window === 'undefined') {
        setUserJson(
          JSON.stringify({ message: 'Server environment detected' }, null, 2)
        );
        setEnvironment('server');
        return;
      }

      setEnvironment('browser');
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        setError(error.message);
        console.error('Auth check error:', error);
      } else {
        setUserJson(JSON.stringify(data, null, 2));
        console.log('Auth check result:', data);
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error checking auth');
      console.error('Exception in auth check:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      checkAuth();
    }
  }, []);

  return (
    <div>
      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'auth' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('auth')}
        >
          Auth Status
        </button>
        <button
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'cookies' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('cookies')}
        >
          Cookies
        </button>
      </div>

      <div className="mt-3">
        {activeTab === 'auth' && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex justify-between items-center">
                <span>Authentication Debug</span>
                <div className="text-xs text-gray-500">
                  Environment: {environment}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Current User Status:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkAuth}
                    disabled={loading}
                  >
                    {loading ? 'Checking...' : 'Check Now'}
                  </Button>
                </div>

                {error && (
                  <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 p-2 rounded border border-red-200 dark:border-red-800">
                    Error: {error}
                  </div>
                )}

                <div className="relative">
                  <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-3 rounded border overflow-auto max-h-60">
                    {userJson || 'No user data available'}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'cookies' && <CookieDebug />}
      </div>
    </div>
  );
}
