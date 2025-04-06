import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PracticeTest, Section } from '@/app/types';

interface CreateTestFormProps {
  userId: string;
  availableSections: Section[];
}

const CreateTestForm: React.FC<CreateTestFormProps> = ({
  userId,
  availableSections
}) => {
  const router = useRouter();
  const [testName, setTestName] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSectionToggle = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!testName.trim()) {
      setError('Please enter a test name');
      return;
    }

    if (selectedSections.length === 0) {
      setError('Please select at least one section');
      return;
    }

    setIsLoading(true);
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
        throw new Error('Failed to create practice test');
      }

      const newTest: PracticeTest = await response.json();

      // Redirect to the test page
      router.push(`/tests/${newTest.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Create New Practice Test</h2>

      {error && (
        <div className="bg-destructive/20 text-destructive p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="testName" className="block text-sm font-medium mb-1">
            Test Name
          </label>
          <input
            id="testName"
            type="text"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="e.g., Full SAT Practice Test 1"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Select Sections
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableSections.map((section) => (
              <div
                key={section.id}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedSections.includes(section.id)
                    ? 'bg-primary/20 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleSectionToggle(section.id)}
              >
                <div className="font-medium">{section.name}</div>
                <div className="text-sm text-muted-foreground">
                  {section.section_type}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Practice Test'}
        </Button>
      </form>
    </div>
  );
};

export default CreateTestForm;
