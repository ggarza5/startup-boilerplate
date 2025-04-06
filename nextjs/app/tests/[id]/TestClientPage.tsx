'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { PracticeTest, Section, Question } from '@/app/types';
import TestDetail from '@/app/components/practice-test/TestDetail';

interface TestClientPageProps {
  testId: string;
}

export default function TestClientPage({ testId }: TestClientPageProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [test, setTest] = useState<PracticeTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        const supabase = createClient();

        // Check if user is authenticated
        const {
          data: { session }
        } = await supabase.auth.getSession();
        if (!session) {
          router.push('/auth');
          return;
        }

        setUserId(session.user.id);

        // Fetch test data
        const { data: testData, error: testError } = await supabase
          .from('practice_tests')
          .select('*')
          .eq('id', testId)
          .single();

        if (testError) throw new Error(testError.message);
        if (!testData) throw new Error('Test not found');

        // Check if this test belongs to the user
        if (testData.user_id !== session.user.id) {
          router.push('/tests');
          return;
        }

        setTest(testData as PracticeTest);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
        console.error('Error fetching test:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [testId, router]);

  if (loading) {
    return <div className="p-10 text-center">Loading test...</div>;
  }

  if (error || !test || !userId) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="bg-destructive/20 text-destructive p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Test could not be loaded'}</p>
        </div>
      </div>
    );
  }

  return <TestDetail testId={testId} userId={userId} />;
}
