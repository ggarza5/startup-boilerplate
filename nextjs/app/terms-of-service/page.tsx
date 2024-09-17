"use client";

import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/ui/Navbar';
import { createClient } from '@/utils/supabase/client';
import { Footer } from '@/components/landing/Footer';

const TermsOfService = () => {

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
            <h1 className="text-2xl font-bold mb-4">Terms of Service</h1>
            
            <h2 className="text-xl font-bold mt-4">1. Acceptance of Terms</h2>
            <p>By using our service, you agree to these Terms of Service. If you do not agree, please do not use our service.</p>
            
            <h2 className="text-xl font-bold mt-4">2. Use of Service</h2>
            <p>You agree to use our service only for lawful purposes and in accordance with these terms.</p>
            
            <h2 className="text-xl font-bold mt-4">3. User Accounts</h2>
            <p>To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your account information.</p>
            
            <h2 className="text-xl font-bold mt-4">4. Intellectual Property</h2>
            <p>All content provided through our service is the property of our company and is protected by copyright and other intellectual property laws.</p>
            
            <h2 className="text-xl font-bold mt-4">5. Limitation of Liability</h2>
            <p>We are not liable for any damages arising from your use of our service, to the fullest extent permitted by law.</p>
            
            <h2 className="text-xl font-bold mt-4">6. Changes to Terms</h2>
            <p>We may update these Terms of Service from time to time. We will notify you of any changes by posting the new terms on this page.</p>
            
            <h2 className="text-xl font-bold mt-4">7. Governing Law</h2>
            <p>These terms are governed by the laws of the jurisdiction in which our company is based.</p>
            <Footer />
        </div>
        </>
    );
};

export default TermsOfService;