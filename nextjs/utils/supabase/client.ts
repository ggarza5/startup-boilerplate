import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types_db';
import { getURL } from '@/utils/helpers';

const isBrowser = typeof window !== 'undefined';

// Debug function to log cookie information
const logCookieDebug = () => {
  if (!isBrowser) return;

  try {
    console.log('Cookie Debug Info:');
    const allCookies = document.cookie;
    console.log('All cookies:', allCookies);

    // Check for specific auth cookies
    const authCookies = allCookies
      .split(';')
      .map((c) => c.trim())
      .filter(
        (c) =>
          c.startsWith('sb-') || c.includes('supabase') || c.includes('auth')
      );

    console.log('Auth cookies:', authCookies);

    if (authCookies.length === 0) {
      console.warn('No auth cookies found - may cause authentication issues');
    }
  } catch (err) {
    console.error('Error in cookie debug:', err);
  }
};

/**
 * Parses a cookie value and attempts to extract JSON content
 */
const parseCookieValue = (value: string): any => {
  try {
    // First try simple JSON parse
    return JSON.parse(decodeURIComponent(value));
  } catch (e) {
    // If that fails, try to handle URL-encoded JSON
    try {
      return JSON.parse(decodeURIComponent(value.replace(/\+/g, ' ')));
    } catch (e2) {
      // If both fail, return the raw value
      console.log('Could not parse cookie value as JSON:', e2);
      return value;
    }
  }
};

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Get domain for cookie settings
  const siteUrl = getURL();
  let domain: string | undefined = undefined;

  try {
    if (!isBrowser) {
      console.log('Server environment detected for Supabase client');
    } else {
      const url = new URL(siteUrl);
      // Don't set domain for localhost (causes issues)
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        // Add a dot prefix for subdomain support
        domain = `.${url.hostname.split('.').slice(-2).join('.')}`;
        console.log(`Setting cookie domain to: ${domain}`);
      } else {
        console.log('Using default cookie domain for localhost');
      }

      // Log cookie debug info on client init
      logCookieDebug();
    }
  } catch (err) {
    console.error('Error parsing domain for cookies:', err);
  }

  // Extract the project reference from the Supabase URL
  const supabaseProjectRef =
    supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || '';
  const authCookieName = `sb-${supabaseProjectRef}-auth-token`;

  console.log(`Looking for auth cookie with name: ${authCookieName}`);

  // Create the Supabase client with enhanced cookie handling
  const client = createBrowserClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      get(name) {
        if (!isBrowser) return undefined;

        try {
          // Special handling for auth token cookie
          if (name === authCookieName) {
            const cookies = document.cookie.split(';');

            // Find all parts of the auth token
            const authCookieParts: Record<string, string> = {};

            cookies.forEach((cookie) => {
              const [key, value] = cookie.trim().split('=');
              if (key && key.startsWith(`${authCookieName}.`)) {
                const index = key.split('.')[1];
                authCookieParts[index] = value || '';
              }
            });

            // Check if we found any auth token parts
            const numParts = Object.keys(authCookieParts).length;
            if (numParts === 0) {
              console.log(`Auth cookie not found: ${authCookieName}`);
              return undefined;
            }

            // Combine all parts in order
            const combinedValue = Object.keys(authCookieParts)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((k) => authCookieParts[k])
              .join('');

            console.log(
              `Found ${numParts} auth cookie parts, combined length: ${combinedValue.length}`
            );
            return decodeURIComponent(combinedValue);
          }

          // Standard cookie handling for non-auth cookies
          const cookie = document.cookie
            .split(';')
            .find((c) => c.trim().startsWith(`${name}=`));

          if (!cookie) {
            console.log(`Cookie not found: ${name}`);
            return undefined;
          }

          const value = cookie.split('=')[1];
          return decodeURIComponent(value);
        } catch (error) {
          console.error('Error retrieving cookie:', error);
          return undefined;
        }
      },
      set(name, value, options) {
        if (!isBrowser) {
          console.log(
            'Attempting to set cookie in non-browser environment, skipping'
          );
          return;
        }

        try {
          let cookieString = `${name}=${encodeURIComponent(value)}; path=/; samesite=lax;`;

          if (options?.domain || domain) {
            cookieString += ` domain=${options?.domain || domain};`;
          }

          if (options?.maxAge) {
            cookieString += ` max-age=${options.maxAge};`;
          }

          if (options?.expires) {
            cookieString += ` expires=${options.expires.toUTCString()};`;
          }

          document.cookie = cookieString;
          console.log(
            `Set cookie ${name} with domain ${options?.domain || domain || 'default'}`
          );
        } catch (error) {
          console.error('Error setting cookie:', error);
        }
      },
      remove(name, options) {
        if (!isBrowser) {
          console.log(
            'Attempting to remove cookie in non-browser environment, skipping'
          );
          return;
        }

        try {
          // Set expiration to past date to remove
          let cookieString = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax;`;

          if (options?.domain || domain) {
            cookieString += ` domain=${options?.domain || domain};`;
          }

          document.cookie = cookieString;
          console.log(
            `Removed cookie ${name} with domain ${options?.domain || domain || 'default'}`
          );
        } catch (error) {
          console.error('Error removing cookie:', error);
        }
      }
    },
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true
    }
  });

  // Set up auth state listener manually
  if (isBrowser) {
    client.auth.onAuthStateChange((event, session) => {
      console.log(
        'Auth state changed:',
        event,
        session ? 'Session exists' : 'No session'
      );
      logCookieDebug();
    });
  }

  return client;
};
