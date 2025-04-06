import { Metadata } from 'next';
import { PropsWithChildren } from 'react';
import { getURL } from '@/utils/helpers';
import '@/styles/main.css';
import { PHProvider } from './providers';
import { ThemeProvider } from '@/components/landing/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SectionsProvider } from '@/context/SectionsContext';
import PostHogPageViewWrapper from '@/components/misc/PostHogPageViewWrapper';
import { UserProvider } from '@/context/UserContext';
import { createClient } from '@/utils/supabase/server';

const GoogleAnalyticsID = 'G-J8XQH1YH0C';

const meta = {
  title: 'SAT Practice Bot',
  description: 'Infinite SAT Practice',
  cardImage: '/og.png',
  robots: 'follow, index',
  favicon: '/favicon.ico',
  url: getURL()
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: meta.title,
    description: meta.description,
    referrer: 'origin-when-cross-origin',
    keywords: ['Vercel', 'Supabase', 'Next.js', 'Stripe', 'Subscription'],
    authors: [{ name: 'Vercel', url: 'https://vercel.com/' }],
    creator: 'Vercel',
    publisher: 'Vercel',
    robots: meta.robots,
    icons: { icon: meta.favicon },
    metadataBase: new URL(meta.url),
    openGraph: {
      url: meta.url,
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage],
      type: 'website',
      siteName: meta.title
    },
    twitter: {
      card: 'summary_large_image',
      site: '@Vercel',
      creator: '@Vercel',
      title: meta.title,
      description: meta.description,
      images: [meta.cardImage]
    }
  };
}

export default async function RootLayout({ children }: PropsWithChildren) {
  // Get the initial user server-side
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <ThemeProvider>
        <PHProvider>
          <body>
            <UserProvider initialUser={user}>
              <SectionsProvider>
                <PostHogPageViewWrapper />
                <main
                  id="skip"
                  className="min-h-[calc(100dvh-4rem)] md:min-h[calc(100dvh-5rem)]"
                >
                  {children}
                </main>
                <Toaster />
              </SectionsProvider>
            </UserProvider>
          </body>
        </PHProvider>
      </ThemeProvider>
      <GoogleAnalytics gaId={GoogleAnalyticsID} />
    </html>
  );
}
