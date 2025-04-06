import { Suspense } from 'react';
import TestResultsClientPage from './TestResultsClientPage';

interface TestResultsPageProps {
  params: {
    id: string;
  };
}

export default function TestResultsPage({ params }: TestResultsPageProps) {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading results...</div>}
    >
      <TestResultsClientPage testId={params.id} />
    </Suspense>
  );
}
