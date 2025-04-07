import { getURL } from '@/utils/helpers';
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // The `/api/auth_callback` route is required for the server-side auth flow implemented
  // by the `@supabase/ssr` package. It exchanges an auth code for the user's session.
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const errorMessage = requestUrl.searchParams.get('error_description');
  const provider = requestUrl.searchParams.get('provider') || 'unknown';

  console.log(
    `Auth callback triggered for ${provider}. Code present: ${!!code}, Error: ${errorMessage || 'none'}`
  );

  try {
    if (code) {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error(
          `Error exchanging code for session (${provider}):`,
          error.message
        );

        // More detailed error for debugging
        if (error.message.includes('code verifier')) {
          console.error(
            'PKCE verification failed - code verifier missing or invalid'
          );
          console.error(
            'This often happens when cookies are not properly maintained between requests'
          );
        }

        throw error;
      }

      // Successfully authenticated
      console.log(`Successfully exchanged code for session (${provider})`);
      console.log(`User authenticated: ${data.user?.id}`);

      // Add a small delay to ensure cookies are set properly
      await new Promise((resolve) => setTimeout(resolve, 500));

      return NextResponse.redirect(getURL('/'));
    } else if (errorMessage) {
      console.error(`OAuth error (${provider}):`, errorMessage);
      throw new Error(errorMessage);
    } else {
      // No code or error message
      console.error(
        `No code or error message present in callback URL (${provider})`
      );
      throw new Error('No code or error message present in callback URL');
    }
  } catch (e) {
    if (!(e instanceof Error)) throw e;

    console.error(`Auth callback error (${provider}):`, e.message);

    // Redirect with error information
    return NextResponse.redirect(
      getURL(
        `/auth/signin?toast_title=Authentication+Error&toast_description=${encodeURIComponent(e.message)}&toast_variant=destructive`
      )
    );
  }
}
