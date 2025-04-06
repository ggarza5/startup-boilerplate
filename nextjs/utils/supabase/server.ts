import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types_db';
import { getURL } from '@/utils/helpers';

// Define a function to create a Supabase client for server-side operations
// The function takes a cookie store created with next/headers cookies as an argument
export const createClient = async () => {
  const cookieStore = cookies();

  // Get the base URL for the current environment (dev or prod)
  const siteUrl = getURL().replace(/^https?:\/\//, '');
  const domain = siteUrl.split(':')[0]; // Remove port if present

  return createServerClient<Database>(
    // Pass Supabase URL and anonymous key from the environment to the client
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

    // Define a cookies object with methods for interacting with the cookie store and pass it to the client
    {
      cookies: {
        // The get method is used to retrieve a cookie by its name
        async get(name: string) {
          const cookies = await cookieStore;
          return cookies.get(name)?.value;
        },
        // The set method is used to set a cookie with a given name, value, and options
        async set(name: string, value: string, options: CookieOptions) {
          try {
            const cookies = await cookieStore;
            // Add domain setting to match client-side cookie settings
            cookies.set({
              name,
              value,
              ...options,
              // Only set domain for non-localhost
              ...(domain !== 'localhost' && {
                domain: '.' + domain // Add dot prefix for subdomains
              })
            });
          } catch (error) {
            // If the set method is called from a Server Component, an error may occur
            // This can be ignored if there is middleware refreshing user sessions
            console.error('Error setting cookie in server component:', error);
          }
        },
        // The remove method is used to delete a cookie by its name
        async remove(name: string, options: CookieOptions) {
          try {
            const cookies = await cookieStore;
            // Add domain setting to match client-side cookie settings
            cookies.set({
              name,
              value: '',
              ...options,
              // Only set domain for non-localhost
              ...(domain !== 'localhost' && {
                domain: '.' + domain // Add dot prefix for subdomains
              })
            });
          } catch (error) {
            // If the remove method is called from a Server Component, an error may occur
            // This can be ignored if there is middleware refreshing user sessions
            console.error('Error removing cookie in server component:', error);
          }
        }
      }
    }
  );
};
