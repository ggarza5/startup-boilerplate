'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PracticeTest, Section } from '@/app/types';
import { createClient } from '@/utils/supabase/client';
import { Navbar } from '@/app/components/ui/Navbar';
import { User } from '@supabase/supabase-js';

export default function TestsClientPage() {
  const router = useRouter();
  const [tests, setTests] = useState<PracticeTest[] | null>(null);
  const [sections, setSections] = useState<Section[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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
        setUser(session.user);

        // Fetch tests and sections
        const [testsResponse, sectionsResponse] = await Promise.all([
          supabase
            .from('practice_tests')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('sections')
            .select('id, name, section_type, created_at, created_by')
            .order('created_at', { ascending: false })
        ]);

        if (testsResponse.error) throw new Error(testsResponse.error.message);
        if (sectionsResponse.error)
          throw new Error(sectionsResponse.error.message);

        setTests(testsResponse.data as PracticeTest[]);
        setSections(sectionsResponse.data as Section[]);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (startTime: string, endTime: string | null) => {
    if (!endTime) return 'In progress';

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    const durationMs = end - start;

    const minutes = Math.floor(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return <div className="p-10 text-center">Loading tests...</div>;
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="bg-destructive/20 text-destructive p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error}</p>
          <Button className="mt-4" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar user={user} />

      <div className="container max-w-6xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Practice Tests</h1>
          <Link href="/tests/create">
            <Button>Create New Test</Button>
          </Link>
        </div>

        {!tests || tests.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-2">No Practice Tests Yet</h2>
            <p className="text-muted-foreground mb-6">
              Start your first practice test to simulate the real SAT
              experience.
            </p>
            <Link href="/tests/create">
              <Button size="lg">Create Your First Test</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className="p-6 bg-card rounded-lg shadow-sm border"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{test.name}</h2>
                    <p className="text-sm text-muted-foreground mb-2">
                      Created on {formatDate(test.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${
                        test.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                          : test.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}
                    >
                      {test.status.replace('_', ' ')}
                    </span>
                    {test.start_time && (
                      <span className="text-sm text-muted-foreground mt-1">
                        Duration:{' '}
                        {formatDuration(test.start_time, test.end_time || null)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex mt-4 space-x-2">
                  {test.status === 'completed' ? (
                    <Link href={`/tests/results/${test.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        View Results
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/tests/${test.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        {test.status === 'in_progress'
                          ? 'Continue Test'
                          : 'Resume Test'}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
