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
  const siteUrl = getURL();
  let domain: string | undefined = undefined;

  try {
    const url = new URL(siteUrl);
    // Don't set domain for localhost (causes issues)
    if (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1') {
      // Add a dot prefix for subdomain support
      domain = `.${url.hostname.split('.').slice(-2).join('.')}`;
      console.log(`Middleware: Setting cookie domain to ${domain}`);
    } else {
      console.log('Middleware: Using default cookie domain for localhost');
    }
  } catch (err) {
    console.error('Middleware: Error parsing domain for cookies:', err);
  }

  // Extract the project reference from the Supabase URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseProjectRef =
    supabaseUrl.match(/https:\/\/([^.]+)\./)?.[1] || '';

  console.log(`Middleware: Project ref is ${supabaseProjectRef}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          // Log the cookie access to debug authentication issues
          const cookie = request.cookies.get(name);

          if (name.startsWith(`sb-${supabaseProjectRef}-auth-token`)) {
            console.log(
              `Middleware: Auth cookie ${name} ${cookie ? 'found' : 'not found'}`
            );
          }

          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // If the cookie is updated, update the cookies for the request and response
          const cookieOptions = {
            ...options,
            ...(domain && { domain }), // Only set domain if defined
            path: options.path || '/'
          };

          // Log when setting auth cookies
          if (name.startsWith(`sb-${supabaseProjectRef}-auth-token`)) {
            console.log(
              `Middleware: Setting auth cookie ${name} with domain ${domain || 'default'}`
            );
          }

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
          const cookieOptions = {
            ...options,
            ...(domain && { domain }), // Only set domain if defined
            path: options.path || '/'
          };

          // Log when removing auth cookies
          if (name.startsWith(`sb-${supabaseProjectRef}-auth-token`)) {
            console.log(
              `Middleware: Removing auth cookie ${name} with domain ${domain || 'default'}`
            );
          }

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

    console.log('Middleware: Updating session...');

    // Extract the URL to see if we're on a route that needs authentication
    const { pathname } = new URL(request.url);
    const isAuthRoute = pathname.startsWith('/auth') || pathname === '/';
    const isApiRoute = pathname.startsWith('/api');

    // This will refresh session if expired - required for Server Components
    // https://supabase.com/docs/guides/auth/server-side/nextjs
    const {
      data: { session },
      error
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Middleware: Error getting session:', error.message);
    } else {
      console.log(`Middleware: Session ${session ? 'found' : 'not found'}`);
    }

    // Return the updated response with refreshed session cookies
    return response;
  } catch (e) {
    console.error('Middleware: Error updating session:', e);
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up environment variables.
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    });
  }
};
