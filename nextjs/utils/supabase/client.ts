import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types_db';
import { getURL } from '@/utils/helpers';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

const isBrowser = typeof window !== 'undefined';

// Set debug log level
const DEBUG_LEVEL = 1; // 0=none, 1=errors only, 2=all

// Improved function to cleanup duplicate auth cookies
function cleanupAuthCookies() {
  if (!isBrowser) return;

  try {
    const cookies = document.cookie.split(';');
    const authCookies: Record<string, string[]> = {};
    const flowStateCookies: string[] = [];

    // Identify all auth cookies and flow state cookies
    cookies.forEach((cookie) => {
      const [name, value] = cookie.trim().split('=');
      if (name && name.includes('-auth-token')) {
        const baseName = name.split('.')[0];
        if (!authCookies[baseName]) {
          authCookies[baseName] = [];
        }
        authCookies[baseName].push(name);
      }

      // Track flow_state cookies that might be stale
      if (name && name.includes('supabase-auth-flow-state')) {
        flowStateCookies.push(name);
      }
    });

    // Keep only the most recent pair (0 and 1) for each auth cookie base name
    Object.values(authCookies).forEach((cookieNames) => {
      if (cookieNames.length > 2) {
        // Sort by .0 and .1 suffix to keep the correct pair
        const sorted = [...cookieNames].sort((a, b) => {
          const aSuffix = parseInt(a.split('.').pop() || '0');
          const bSuffix = parseInt(b.split('.').pop() || '0');
          return aSuffix - bSuffix;
        });

        // Find duplicates to remove (keep only newest pair)
        const toRemove = sorted.slice(0, sorted.length - 2);

        if (DEBUG_LEVEL >= 1) {
          console.log(
            `Found ${toRemove.length} duplicate auth cookies to remove`
          );
        }

        // Remove duplicates
        toRemove.forEach((name) => {
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
          if (DEBUG_LEVEL >= 2) {
            console.log(`Removed duplicate cookie: ${name}`);
          }
        });
      }
    });

    // Check for stale flow state cookies (older than 10 minutes)
    // These cookies are used for OAuth PKCE flow and can cause issues if stale
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
    flowStateCookies.forEach((name) => {
      // We'll clean up flow state cookies older than 10 minutes
      // as they should be used quickly after creation
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
      if (DEBUG_LEVEL >= 2) {
        console.log(`Removed stale flow state cookie: ${name}`);
      }
    });
  } catch (error) {
    if (DEBUG_LEVEL >= 1) {
      console.error('Error cleaning up auth cookies:', error);
    }
  }
}

// Improved function to log cookie debug information with less verbosity
function logCookieDebug(message: string) {
  if (!isBrowser || DEBUG_LEVEL < 2) return;

  console.log(`[Cookie Debug] ${message}`);

  try {
    const cookies = document.cookie.split(';');
    const relevantCookies = cookies.filter(
      (cookie) =>
        cookie.trim().includes('-auth-token') ||
        cookie.trim().includes('supabase-auth-flow-state') ||
        cookie.trim().includes('supabase-auth-pkce')
    );

    if (relevantCookies.length > 0) {
      console.log(`Auth-related cookies (${relevantCookies.length}):`);
      relevantCookies.forEach((cookie) => {
        console.log(`- ${cookie.trim()}`);
      });
    } else {
      console.log('No auth-related cookies found');
    }
  } catch (error) {
    console.error('Error logging cookie debug info:', error);
  }
}

// Export for debugging in console
if (isBrowser) {
  (window as any).cleanupAuthCookies = cleanupAuthCookies;
  (window as any).logCookieDebug = logCookieDebug;
}

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Get domain for cookie settings
  const siteUrl = getURL();
  let domain: string | undefined = undefined;

  try {
    if (!isBrowser) {
      if (DEBUG_LEVEL >= 1) {
        console.log('Server environment detected for Supabase client');
      }
    } else {
      const url = new URL(siteUrl);
      // Don't set domain for localhost (causes issues)
      if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
        // Add a dot prefix for subdomain support
        domain = `.${url.hostname.split('.').slice(-2).join('.')}`;

        if (DEBUG_LEVEL >= 1) {
          console.log(`Setting cookie domain to: ${domain}`);
        }
      } else if (DEBUG_LEVEL >= 1) {
        console.log('Using default cookie domain for localhost');
      }

      // Extract the project reference from the Supabase URL
      const supabaseProjectRef =
        supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || '';

      // Clean up any duplicate auth cookies that might be causing issues
      cleanupAuthCookies();

      // Log cookie debug info on client init
      logCookieDebug(`After client init`);
    }
  } catch (err) {
    console.error('Error parsing domain for cookies:', err);
  }

  // Extract the project reference from the Supabase URL
  const supabaseProjectRef =
    supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || '';
  const authCookieName = `sb-${supabaseProjectRef}-auth-token`;

  if (DEBUG_LEVEL >= 1) {
    console.log(`Looking for auth cookie with name: ${authCookieName}`);
  }

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
              if (DEBUG_LEVEL >= 1) {
                console.log(`Auth cookie not found: ${authCookieName}`);
              }
              return undefined;
            }

            // Combine all parts in order
            const combinedValue = Object.keys(authCookieParts)
              .sort((a, b) => parseInt(a) - parseInt(b))
              .map((k) => authCookieParts[k])
              .join('');

            if (DEBUG_LEVEL >= 1) {
              console.log(
                `Found ${numParts} auth cookie parts, combined length: ${combinedValue.length}`
              );
            }
            return decodeURIComponent(combinedValue);
          }

          // Standard cookie handling for non-auth cookies
          const cookie = document.cookie
            .split(';')
            .find((c) => c.trim().startsWith(`${name}=`));

          if (!cookie) {
            if (DEBUG_LEVEL >= 1) {
              console.log(`Cookie not found: ${name}`);
            }
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
          if (DEBUG_LEVEL >= 1) {
            console.log(
              'Attempting to set cookie in non-browser environment, skipping'
            );
          }
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

          if (DEBUG_LEVEL >= 1) {
            console.log(
              `Set cookie ${name} with domain ${options?.domain || domain || 'default'}`
            );
          }
        } catch (error) {
          console.error('Error setting cookie:', error);
        }
      },
      remove(name, options) {
        if (!isBrowser) {
          if (DEBUG_LEVEL >= 1) {
            console.log(
              'Attempting to remove cookie in non-browser environment, skipping'
            );
          }
          return;
        }

        try {
          // Set expiration to past date to remove
          let cookieString = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax;`;

          if (options?.domain || domain) {
            cookieString += ` domain=${options?.domain || domain};`;
          }

          document.cookie = cookieString;

          if (DEBUG_LEVEL >= 1) {
            console.log(
              `Removed cookie ${name} with domain ${options?.domain || domain || 'default'}`
            );
          }
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

  // Set up auth state change listener outside of the auth config
  if (isBrowser) {
    client.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        // Only log for significant auth events
        if (
          [
            'SIGNED_IN',
            'SIGNED_OUT',
            'TOKEN_REFRESHED',
            'USER_UPDATED',
            'INITIAL_SESSION'
          ].includes(event)
        ) {
          if (DEBUG_LEVEL >= 1) {
            console.log(`Auth state changed: ${event}`);
          }

          if (DEBUG_LEVEL >= 2) {
            logCookieDebug(`After auth event: ${event}`);
          }

          // Clean up cookies after auth events to prevent duplicates
          if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            setTimeout(cleanupAuthCookies, 1000); // Delay to ensure cookies are set
          }
        }
      }
    );
  }

  return client;
};
