'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { PracticeTest, Section, Result } from '@/app/types';

interface TestResultsClientPageProps {
  testId: string;
}

export default function TestResultsClientPage({
  testId
}: TestResultsClientPageProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [test, setTest] = useState<PracticeTest | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Fetch results for this test
        const { data: resultsData, error: resultsError } = await supabase
          .from('results')
          .select('*')
          .eq('practice_test_id', testId)
          .order('created_at', { ascending: true });

        if (resultsError) throw new Error(resultsError.message);

        setResults(resultsData as Result[]);

        // Fetch section data
        const sectionIds = testData.sections || [];
        if (sectionIds.length > 0) {
          const { data: sectionsData, error: sectionsError } = await supabase
            .from('sections')
            .select('*')
            .in('id', sectionIds);

          if (sectionsError) throw new Error(sectionsError.message);

          setSections(sectionsData as Section[]);
        }
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
  }, [testId, router]);

  const formatDuration = (startTime: string, endTime: string | null) => {
    if (!startTime || !endTime) return 'N/A';

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAverageScore = () => {
    if (results.length === 0) return 0;

    const totalScore = results.reduce((sum, result) => sum + result.score, 0);
    return Math.round(totalScore / results.length);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading results...</div>;
  }

  if (error || !test) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="bg-destructive/20 text-destructive p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p>{error || 'Test results could not be loaded'}</p>
          <Button className="mt-4" onClick={() => router.push('/tests')}>
            Back to Tests
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{test.name} Results</h1>
          <p className="text-muted-foreground">
            Completed on {test.end_time ? formatDate(test.end_time) : 'N/A'}
          </p>
        </div>
        <Link href="/tests">
          <Button variant="outline">Back to Tests</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-card rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Average Score
          </h3>
          <p className="text-3xl font-bold">{getAverageScore()}%</p>
        </div>

        <div className="p-6 bg-card rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Sections Completed
          </h3>
          <p className="text-3xl font-bold">{results.length}</p>
        </div>

        <div className="p-6 bg-card rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Total Time
          </h3>
          <p className="text-3xl font-bold">
            {formatDuration(test.start_time || '', test.end_time || null)}
          </p>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Section Results</h2>

      {results.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg shadow-sm">
          <h3 className="text-xl font-medium mb-2">No Results Available</h3>
          <p className="text-muted-foreground">
            There are no recorded results for this test.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((result) => {
            const section = sections.find((s) => s.id === result.section_id);
            return (
              <div
                key={result.id}
                className="p-6 bg-card rounded-lg shadow-sm border"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {section?.name || 'Unknown Section'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {section?.section_type || 'Unknown Type'}
                      {section?.category && ` • ${section.category}`}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                    {result.score}%
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-4">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
