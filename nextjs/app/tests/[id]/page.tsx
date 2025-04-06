import { Suspense } from 'react';
import TestClientPage from './TestClientPage';

interface TestPageProps {
  params: {
    id: string;
  };
}

export default function TestPage({ params }: TestPageProps) {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading test...</div>}
    >
      <TestClientPage testId={params.id} />
    </Suspense>
  );
}
