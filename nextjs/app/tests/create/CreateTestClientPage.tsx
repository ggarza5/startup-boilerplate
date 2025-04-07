'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Section } from '@/app/types';
import { createClient } from '@/utils/supabase/client';
import { Navbar } from '@/app/components/ui/Navbar';
import { User, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types_db';

export default function CreateTestClientPage() {
  const router = useRouter();
  const [testName, setTestName] = useState('');
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const supabase: SupabaseClient<Database> = createClient();

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

        // Fetch available sections
        const { data: sectionsData, error: sectionsError } = await supabase
          .from('sections')
          .select('id, name, section_type, created_at, category, created_by')
          .order('created_at', { ascending: false });

        if (sectionsError) throw new Error(sectionsError.message);

        // Map the fetched data (with section_type) to the internal Section type (with type)
        const mappedSections: Section[] = sectionsData
          ? sectionsData.map((item) => ({
              id: item.id,
              name: item.name || '',
              section_type: item.section_type,
              questions: [],
              created_at: item.created_at ?? undefined,
              category: item.category ?? undefined,
              created_by: item.created_by ?? undefined
            }))
          : [];

        setSections(mappedSections);
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

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleCreateTest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!testName.trim()) {
      setError('Please enter a test name');
      return;
    }

    if (selectedSections.length === 0) {
      setError('Please select at least one section');
      return;
    }

    if (!userId) {
      setError('User not authenticated');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/practice-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          name: testName,
          sections: selectedSections
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create test');
      }

      const newTest = await response.json();
      router.push(`/tests/${newTest.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const groupSectionsByType = () => {
    return sections.reduce(
      (groups, section) => {
        const type = section.section_type;
        if (!groups[type]) {
          groups[type] = [];
        }
        groups[type].push(section);
        return groups;
      },
      {} as Record<string, Section[]>
    );
  };

  if (loading) {
    return <div className="p-10 text-center">Loading sections...</div>;
  }

  const groupedSections = groupSectionsByType();

  return (
    <div>
      <Navbar user={user} />

      <div className="container max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Create New Practice Test</h1>

        {error && (
          <div className="bg-destructive/20 text-destructive p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleCreateTest} className="space-y-8">
          <div>
            <label
              htmlFor="testName"
              className="block text-sm font-medium mb-2"
            >
              Test Name
            </label>
            <input
              id="testName"
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g., Full SAT Practice Test 1"
              disabled={submitting}
            />
          </div>

          <div>
            <h2 className="text-lg font-medium mb-4">Select Sections</h2>

            {Object.entries(groupedSections).map(([type, typeSections]) => (
              <div key={type} className="mb-6">
                <h3 className="text-md font-medium mb-2 capitalize">
                  {type.replace('_', ' ')} Sections
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {typeSections.map((section) => (
                    <div
                      key={section.id}
                      className={`p-4 border rounded-md cursor-pointer transition-colors ${
                        selectedSections.includes(section.id)
                          ? 'bg-primary/20 border-primary'
                          : 'hover:bg-muted'
                      }`}
                      onClick={() => handleSectionToggle(section.id)}
                    >
                      <div className="font-medium">{section.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {sections.length === 0 && (
              <div className="text-center py-8 border rounded-md">
                <p className="text-muted-foreground">No sections available.</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/tests')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={submitting || selectedSections.length === 0}
            >
              {submitting ? 'Creating...' : 'Create Test'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
