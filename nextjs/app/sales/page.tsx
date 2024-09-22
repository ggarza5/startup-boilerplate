'use client';

import { Footer } from '@/components/landing/Footer';
import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/router';

const SalesPage = () => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Error fetching user:', error.message);
          return;
        }
        if (data && data.user) {
          setUser(data.user as User); // Cast to User type
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  return (
    <div>
      <Navbar user={user} />
      <div className="container mx-auto p-4 h-screen">
        <h1 className="text-2xl font-bold mb-4">
          1 Hour SAT Consultation with a Stanford Graduate
        </h1>
        <p className="mb-4">
          We offer a 1-hour consultation with a Stanford graduate to discuss
          application prep, test prep, and life planning.
        </p>
        <p className="mb-4">
          This is a great opportunity to get personalized advice and guidance
          from someone who has successfully navigated the process.
        </p>
        <a
          href="https://buy.stripe.com/9AQ5kkfYn0LM8c814o"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded"
        >
          Book Now
        </a>
      </div>
      <Footer />
    </div>
  );
};

export default SalesPage;
