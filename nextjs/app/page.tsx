'use client';
// app/page.tsx (Landing Page in App Router)
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { About } from '@/components/landing/About';
import { Cta } from '@/components/landing/Cta';
import { FAQ } from '@/components/landing/FAQ';
import { Features } from '@/components/landing/Features';
import { Footer } from '@/components/landing/Footer';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Navbar } from '@/components/landing/Navbar';
import { Newsletter } from '@/components/landing/Newsletter';
import { Pricing } from '@/components/landing/Pricing';
import { ScrollToTop } from '@/components/landing/ScrollToTop';
import { Services } from '@/components/landing/Services';
import { Team } from '@/components/landing/Team';
import { Testimonials } from '@/components/landing/Testimonials';
import { UserProvider } from '@/context/UserContext';
//nextjs app

// This is now an async server component to fetch user data.
export default function LandingPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      console.log(data);

      // Redirect to /questions if the user is logged in
      if (data.user) {
        router.push('/questions');
      }
    };

    checkUser();
  }, []);

  // Render the landing page if the user is not logged in and no code is present
  return (
    <>
      <Navbar user={null} />
      <Hero />
      {/* <About /> */}
      <HowItWorks />
      <Features />
      <Services />
      <Cta />
      {/* <Testimonials /> */}
      {/* <Team /> */}
      <Pricing user={null} />
      <Newsletter />
      <FAQ />
      <Footer />
      <ScrollToTop />
    </>
  );
}
