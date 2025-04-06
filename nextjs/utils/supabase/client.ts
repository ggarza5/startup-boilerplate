import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types_db';
import { getURL } from '@/utils/helpers';

// Define a function to create a Supabase client for client-side operations
export const createClient = () => {
  // Get the base URL for the current environment (dev or prod)
  const siteUrl = getURL().replace(/^https?:\/\//, '');
  const domain = siteUrl.split(':')[0]; // Remove port if present

  return createBrowserClient<Database>(
    // Pass Supabase URL and anonymous key from the environment to the client
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Add cookie options with the correct format
      cookies: {
        // Using standard setter/getter methods since 'name' isn't recognized
        get(name) {
          return document.cookie
            .split('; ')
            .find((c) => c.startsWith(`${name}=`))
            ?.split('=')[1];
        },
        set(name, value, options) {
          const cookieOptions = {
            path: '/',
            sameSite: 'lax' as const,
            domain: domain === 'localhost' ? undefined : '.' + domain,
            secure: domain !== 'localhost',
            ...options
          };

          let cookie = `${name}=${value}`;
          if (cookieOptions.path) cookie += `; path=${cookieOptions.path}`;
          if (cookieOptions.maxAge)
            cookie += `; max-age=${cookieOptions.maxAge}`;
          if (cookieOptions.domain)
            cookie += `; domain=${cookieOptions.domain}`;
          if (cookieOptions.secure) cookie += `; secure`;
          if (cookieOptions.sameSite)
            cookie += `; samesite=${cookieOptions.sameSite}`;

          document.cookie = cookie;
        },
        remove(name, options) {
          const domain =
            options?.domain ||
            (document.location.hostname === 'localhost'
              ? undefined
              : '.' + document.location.hostname);

          document.cookie = `${name}=; path=${options?.path || '/'}; max-age=0; ${domain ? `domain=${domain};` : ''} ${options?.secure ? 'secure;' : ''} samesite=${options?.sameSite || 'lax'}`;
        }
      }
    }
  );
};
