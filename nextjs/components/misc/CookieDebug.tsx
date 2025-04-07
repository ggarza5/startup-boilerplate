'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useEffect } from 'react';

export default function CookieDebug() {
  const [cookies, setCookies] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [authCookies, setAuthCookies] = useState<
    { name: string; value: string; expires?: Date | null }[]
  >([]);

  const getCookies = () => {
    setLoading(true);
    try {
      const cookieObj: Record<string, string> = {};
      const authCookiesList: {
        name: string;
        value: string;
        expires?: Date | null;
      }[] = [];

      document.cookie.split(';').forEach((cookie) => {
        const [key, value] = cookie.trim().split('=');
        if (!key) return;

        cookieObj[key] = value || '';

        // Check if this is an auth-related cookie
        if (
          key.includes('supabase') ||
          key.includes('auth') ||
          key.includes('sb-')
        ) {
          try {
            // Try to decode the cookie value to check its structure
            const decodedValue = decodeURIComponent(value || '');
            // Get expiration by creating a temporary cookie and reading its expires value
            let expires: Date | null = null;

            authCookiesList.push({
              name: key,
              value: decodedValue,
              expires
            });
          } catch (e) {
            authCookiesList.push({ name: key, value: '[Error decoding]' });
          }
        }
      });

      setCookies(cookieObj);
      setAuthCookies(authCookiesList);
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
          {/* Auth-specific cookies section */}
          <div className="mb-4 border p-3 rounded bg-yellow-50 dark:bg-yellow-900/20">
            <h3 className="font-bold mb-2">
              Auth Cookies ({authCookies.length})
            </h3>
            {authCookies.length > 0 ? (
              <div className="space-y-2">
                {authCookies.map((cookie, idx) => (
                  <div
                    key={idx}
                    className="border-b pb-2 last:border-b-0 last:pb-0"
                  >
                    <p className="font-semibold">{cookie.name}</p>
                    <p className="text-xs overflow-hidden text-ellipsis whitespace-nowrap max-w-full text-green-600 dark:text-green-400">
                      {cookie.value.substring(0, 40)}...
                    </p>
                    {cookie.expires && (
                      <p className="text-xs text-gray-500">
                        Expires: {cookie.expires.toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-red-500">No authentication cookies found!</p>
            )}
          </div>

          {/* All cookies section */}
          {Object.keys(cookies).length > 0 ? (
            <div className="space-y-2">
              <p>Found {Object.keys(cookies).length} cookies in total:</p>
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
                          {key.includes('supabase') ||
                          key.includes('auth') ||
                          key.includes('sb-') ? (
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
