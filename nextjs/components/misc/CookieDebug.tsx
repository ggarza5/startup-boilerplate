'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function CookieDebug() {
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const getCookies = () => {
    setLoading(true);
    try {
      const cookieObj: Record<string, string> = {};
      document.cookie.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (key) cookieObj[key] = value || '';
      });
      setCookies(cookieObj);
    } catch (error) {
      console.error('Error parsing cookies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      getCookies();
    }
  }, []);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-md flex justify-between items-center">
          <span>Cookie Information</span>
          <Button
            variant="outline"
            size="sm"
            onClick={getCookies}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-xs">
          {Object.keys(cookies).length > 0 ? (
            <div className="space-y-2">
              <p>Found {Object.keys(cookies).length} cookies:</p>
              <div className="max-h-60 overflow-y-auto border rounded p-2">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="p-1">Name</th>
                      <th className="p-1">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(cookies).map(([key, value]) => (
                      <tr key={key} className="border-b last:border-b-0">
                        <td className="p-1 font-medium truncate max-w-[150px]">
                          {key}
                        </td>
                        <td className="p-1 truncate max-w-[200px]">
                          {key.includes('supabase') || key.includes('auth') ? (
                            <span className="text-green-600 dark:text-green-400">
                              {value.substring(0, 20)}...
                            </span>
                          ) : (
                            value
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>
                  Note: Auth-related cookie values are truncated for security.
                </p>
              </div>
            </div>
          ) : (
            <p>No cookies found in this browser session.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
