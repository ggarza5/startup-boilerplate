import { Suspense } from 'react';
import TestResultsClientPage from './TestResultsClientPage';

// Define params type for Next.js 15
export type TestResultsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TestResultsPage({
  params
}: TestResultsPageProps) {
  // Destructure while awaiting to get the actual id value
  const { id } = await params;

  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading results...</div>}
    >
      <TestResultsClientPage testId={id} />
    </Suspense>
  );
}
