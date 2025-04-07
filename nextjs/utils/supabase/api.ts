import { Database } from '@/types_db';
import {
  Provider,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  SupabaseClient
} from '@supabase/supabase-js';
import { getURL } from '@/utils/helpers';

// Check if running in browser
const isBrowser = typeof window !== 'undefined';

export const createApiClient = (supabase: SupabaseClient<Database>) => {
  const passwordSignup = async (creds: SignUpWithPasswordCredentials) => {
    const res = await supabase.auth.signUp(creds);
    if (res.error) throw res.error;
    return res.data;
  };
  const passwordSignin = async (creds: SignInWithPasswordCredentials) => {
    const res = await supabase.auth.signInWithPassword(creds);
    if (res.error) throw res.error;
    return res.data;
  };
  const passwordReset = async (email: string) => {
    const res = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: getURL('/api/reset_password')
    });
    console.log(res);
    if (res.error) throw res.error;
    return res.data;
  };
  const passwordUpdate = async (password: string) => {
    const res = await supabase.auth.updateUser({ password });
    if (res.error) throw res.error;
    return res.data;
  };
  const oauthSignin = async (provider: Provider) => {
    if (isBrowser) {
      // Clean up any existing cookies before starting a new OAuth flow
      // This prevents PKCE issues with stale state
      try {
        // Access the cleanupAuthCookies function if it's available on window
        const cleanupFn = (window as any).cleanupAuthCookies;
        if (typeof cleanupFn === 'function') {
          cleanupFn();
          console.log('Cleaned up auth cookies before OAuth flow');
        }
      } catch (err) {
        console.error('Failed to clean up cookies:', err);
      }
    }

    // Build the redirect URL with the correct domain
    const redirectTo = getURL('/api/auth_callback');
    console.log(`OAuth redirect URL: ${redirectTo}`);

    const res = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: false,
        queryParams: {
          // Include provider in callback for better debugging
          provider: provider,
          // These parameters help with Google OAuth refresh tokens
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    });

    if (res.error) {
      console.error(`OAuth sign-in error (${provider}):`, res.error.message);
      throw res.error;
    }

    return res.data;
  };
  const signOut = async () => {
    const res = await supabase.auth.signOut();
    if (res.error) throw res.error;
    return res;
  };

  return {
    passwordSignin,
    passwordSignup,
    passwordReset,
    passwordUpdate,
    oauthSignin,
    signOut
  };
};
