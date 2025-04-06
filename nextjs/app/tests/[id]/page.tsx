import { Suspense } from 'react';
import TestClientPage from './TestClientPage';

// Define params type for Next.js 15
export type Params = Promise<{ id: string }>;

// Make the component async to allow awaiting params
export default async function TestPage({ params }: { params: Params }) {
  // Destructure while awaiting to get the actual id value
  const { id } = await params;

  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading test...</div>}
    >
      <TestClientPage testId={id} />
    </Suspense>
  );
}
