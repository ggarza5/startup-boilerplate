import { Suspense } from 'react';
import TestsClientPage from './TestsClientPage';

export default function TestsPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading tests...</div>}
    >
      <TestsClientPage />
    </Suspense>
  );
}
