import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import TestTimer from './TestTimer';
import { PracticeTest, Section, Question } from '@/app/types';

interface TestDetailProps {
  testId: string;
  userId: string;
}

const TestDetail: React.FC<TestDetailProps> = ({ testId, userId }) => {
  const router = useRouter();
  const [test, setTest] = useState<PracticeTest | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      try {
        const testResponse = await fetch(
          `/api/practice-tests?testId=${testId}`
        );
        if (!testResponse.ok) throw new Error('Failed to fetch test');
        const testData: PracticeTest = await testResponse.json();
        setTest(testData);

        // Fetch sections data
        const sectionsData: Section[] = [];
        for (const sectionId of testData.sections) {
          const sectionResponse = await fetch(`/api/section/${sectionId}`);
          if (!sectionResponse.ok)
            throw new Error(`Failed to fetch section ${sectionId}`);
          const sectionData: Section = await sectionResponse.json();
          sectionsData.push(sectionData);
        }

        setSections(sectionsData);

        // Set timer state based on test status
        if (testData.status === 'in_progress') {
          setIsTimerActive(true);
          setIsTimerPaused(false);
        } else if (testData.status === 'paused') {
          setIsTimerActive(true);
          setIsTimerPaused(true);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  const currentSection = sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions?.[currentQuestionIndex];

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNextQuestion = () => {
    if (
      currentSection?.questions &&
      currentQuestionIndex < currentSection.questions.length - 1
    ) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentSectionIndex < sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
      setCurrentQuestionIndex(
        (sections[currentSectionIndex - 1]?.questions?.length || 1) - 1
      );
    }
  };

  const handlePauseTest = async () => {
    try {
      setIsTimerPaused(true);

      const response = await fetch('/api/practice-tests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: testId,
          status: 'paused'
        })
      });

      if (!response.ok) throw new Error('Failed to pause test');

      const updatedTest = await response.json();
      setTest(updatedTest);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
      setIsTimerPaused(false);
    }
  };

  const handleResumeTest = async () => {
    try {
      setIsTimerPaused(false);

      const response = await fetch('/api/practice-tests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: testId,
          status: 'in_progress'
        })
      });

      if (!response.ok) throw new Error('Failed to resume test');

      const updatedTest = await response.json();
      setTest(updatedTest);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
      setIsTimerPaused(true);
    }
  };

  const handleCompleteTest = async () => {
    try {
      // Calculate scores and submit results
      for (const section of sections) {
        if (!section.questions) continue;

        let correctAnswers = 0;
        for (const question of section.questions) {
          if (answers[question.id] === question.answer) {
            correctAnswers++;
          }
        }

        const score =
          section.questions.length > 0
            ? (correctAnswers / section.questions.length) * 100
            : 0;

        // Submit result for this section
        await fetch('/api/results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            sectionId: section.id,
            score,
            practiceTestId: testId
          })
        });
      }

      // Mark test as completed
      const response = await fetch('/api/practice-tests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: testId,
          status: 'completed',
          end_time: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Failed to complete test');

      router.push(`/tests/results/${testId}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-10">Loading test...</div>;
  }

  if (error) {
    return (
      <div className="bg-destructive/20 text-destructive p-5 rounded-md">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <Button className="mt-4" onClick={() => router.push('/tests')}>
          Back to Tests
        </Button>
      </div>
    );
  }

  if (!test || !sections.length) {
    return (
      <div className="p-5">
        <h2 className="text-xl font-bold mb-2">Test not found</h2>
        <Button onClick={() => router.push('/tests')}>Back to Tests</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{test.name}</h1>
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm font-medium">
              Section {currentSectionIndex + 1} of {sections.length}
            </span>
            <span className="mx-2">•</span>
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of{' '}
              {currentSection?.questions?.length || 0}
            </span>
          </div>
          <div className="capitalize px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
            {test.status}
          </div>
        </div>
      </div>

      <TestTimer
        isActive={isTimerActive}
        isPaused={isTimerPaused}
        onPause={handlePauseTest}
        onResume={handleResumeTest}
        onComplete={handleCompleteTest}
      />

      {currentQuestion && (
        <div className="mt-6 p-6 bg-card rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3 mt-4">
            {currentQuestion.answer_choices.map((choice, index) => (
              <div
                key={index}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  answers[currentQuestion.id] === choice
                    ? 'bg-primary/20 border-primary'
                    : 'hover:bg-muted'
                }`}
                onClick={() => handleAnswerSelect(currentQuestion.id, choice)}
              >
                <div className="font-medium">{choice}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
        >
          Previous
        </Button>

        {currentSectionIndex === sections.length - 1 &&
        currentQuestionIndex ===
          (currentSection?.questions?.length || 1) - 1 ? (
          <Button onClick={handleCompleteTest}>Complete Test</Button>
        ) : (
          <Button onClick={handleNextQuestion}>Next</Button>
        )}
      </div>
    </div>
  );
};

export default TestDetail;
