"use client";

import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { createClient } from '@/utils/supabase/client';
import { Footer } from '@/components/landing/Footer';

const PrivacyPolicy = () => {

    const [user, setUser] = useState(null);
    const supabase = createClient();
  
    useEffect(() => {
      const fetchUser = async () => {
        const { data } = await supabase.auth.getUser();
        setUser(data.user as any);
      };
      fetchUser();
    }, []);

    return (
        <>
        <Navbar user={user} />
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
            <p>This Privacy Policy outlines how we collect, use, and protect your information when you use our SAT study service.</p>
            
            <h2 className="text-xl font-bold mt-4">Information We Collect</h2>
            <p>We only collect your email address for account management and direct email marketing purposes.</p>
            
            <h2 className="text-xl font-bold mt-4">How We Use Your Information</h2>
            <p>Your email address is used solely for managing your account and sending you updates or promotional materials related to our service.</p>
            
            <h2 className="text-xl font-bold mt-4">Data Sharing</h2>
            <p>We do not share your information with any third parties, except for Supabase, which securely stores your password.</p>
            
            <h2 className="text-xl font-bold mt-4">User Rights</h2>
            <p>You have the right to access your account information at any time and can delete your account whenever you choose.</p>
            
            <h2 className="text-xl font-bold mt-4">Local Storage</h2>
            <p>We use local storage in your browser to maintain your account session for a seamless experience when you return to our site.</p>
            
            <h2 className="text-xl font-bold mt-4">Compliance</h2>
            <p>We are committed to complying with all applicable privacy regulations, including GDPR and CCPA.</p>
            
            <h2 className="text-xl font-bold mt-4">Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
            <Footer />
        </div>
        </>
    );
};

export default PrivacyPolicy;