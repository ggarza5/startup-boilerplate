// app/page.tsx (Landing Page in App Router)
import { redirect } from 'next/navigation'; // New redirect method in App Router
import { createClient } from '@/utils/supabase/server';
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

// This is now an async server component to fetch user data.
export default async function LandingPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();

  // Redirect to /questions if the user is logged in
  // if (data.user) {
  //   redirect('/questions');
  // }

  // Render the landing page if the user is not logged in
  return (
    <>
      <Navbar user={data.user} /> {/* Ensure user prop is passed here */}
      <Hero />
      <About />
      <HowItWorks />
      <Features />
      <Services />
      <Cta />
      <Testimonials />
      <Team />
      <Pricing user={data.user} />
      <Newsletter />
      <FAQ />
      <Footer />
      <ScrollToTop />
    </>
  );
}
