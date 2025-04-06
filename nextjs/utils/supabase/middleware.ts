import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { getURL } from '@/utils/helpers';

export const createClient = (request: NextRequest) => {
  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers
    }
  });

  // Get the base URL for the current environment (dev or prod)
  const siteUrl = getURL().replace(/^https?:\/\//, '');
  const domain = siteUrl.split(':')[0]; // Remove port if present

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the cookies for the request and response
          // Only add domain for non-localhost environments
          const cookieOptions = {
            ...options,
            ...(domain !== 'localhost' && {
              domain: '.' + domain // Add dot prefix for subdomains
            }),
            path: options.path || '/'
          };

          request.cookies.set({
            name,
            value,
            ...cookieOptions
          });

          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });

          response.cookies.set({
            name,
            value,
            ...cookieOptions
          });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the cookies for the request and response
          // Only add domain for non-localhost environments
          const cookieOptions = {
            ...options,
            ...(domain !== 'localhost' && {
              domain: '.' + domain // Add dot prefix for subdomains
            }),
            path: options.path || '/'
          };

          request.cookies.set({
            name,
            value: '',
            ...cookieOptions
          });

          response = NextResponse.next({
            request: {
              headers: request.headers
            }
          });

          response.cookies.set({
            name,
            value: '',
            ...cookieOptions
          });
        }
      }
    }
  );

  return { supabase, response };
};

export const updateSession = async (request: NextRequest) => {
  try {
    const { supabase, response } = createClient(request);

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    await supabase.auth.getUser();

    return response;
  } catch (e) {
    console.error('Error updating session in middleware:', e);
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
