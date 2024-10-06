'use client';

import { Footer } from '@/components/landing/Footer';
import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/router';
import ConsultationButton from '../components/ui/ConsultationButton';
import GabrielCard from '../components/GabrielCard';
import { logErrorIfNotProduction } from '../utils/helpers';

const SalesPage = () => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          logErrorIfNotProduction(error);
          return;
        }
        if (data && data.user) {
          setUser(data.user as User); // Cast to User type
        }
      } catch (err: any) {
        logErrorIfNotProduction(err);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <div>
      <Navbar user={user} />
      <div className="container mx-auto p-4 h-screen flex flex-col md:flex-row justify-center items-center gap-16">
        <GabrielCard className="md:hidden mt-16" />{' '}
        {/* Reduced margin-top for mobile */}
        <div className="w-full md:w-1/3">
          {' '}
          {/* Changed width to full for mobile */}
          <h1 className="text-2xl font-bold mb-4">
            {' '}
            {/* Adjusted margin-bottom */}1 Hour SAT Consultation with a
            Stanford Graduate
          </h1>
          <p className="mb-4">
            {' '}
            {/* Adjusted margin-bottom */}
            We offer a 1-hour consultation with a Stanford graduate to discuss
            college applications, test prep, and life planning.
          </p>
          <p className="mb-4">
            {' '}
            {/* Adjusted margin-bottom */}
            This is a great opportunity to get personalized advice and guidance
            from someone who has successfully navigated the process.
          </p>
          <ConsultationButton />
        </div>
        <GabrielCard className="hidden md:block mt-8" />{' '}
        {/* Reduced margin-top for larger screens */}
        {/* ... existing code ... */}
      </div>
      <Footer />
    </div>
  );
};

export default SalesPage;
