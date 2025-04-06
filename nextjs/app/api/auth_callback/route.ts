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

  console.log(
    `Auth callback triggered. Code present: ${!!code}, Error: ${errorMessage || 'none'}`
  );

  try {
    if (code) {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Error exchanging code for session:', error.message);
        throw error;
      }

      // Successfully authenticated
      console.log('Successfully exchanged code for session');
      return NextResponse.redirect(getURL('/'));
    } else if (errorMessage) {
      console.error('OAuth error:', errorMessage);
      throw new Error(errorMessage);
    } else {
      // No code or error message
      console.error('No code or error message present in callback URL');
      throw new Error('No code or error message present in callback URL');
    }
  } catch (e) {
    if (!(e instanceof Error)) throw e;

    console.error('Auth callback error:', e.message);

    // Redirect with error information
    return NextResponse.redirect(
      getURL(
        `/auth/signin?toast_title=Authentication+Error&toast_description=${encodeURIComponent(e.message)}&toast_variant=destructive`
      )
    );
  }
}
