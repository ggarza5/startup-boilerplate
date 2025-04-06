import { Suspense } from 'react';
import CreateTestClientPage from './CreateTestClientPage';

export default function CreateTestPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>
      <CreateTestClientPage />
    </Suspense>
  );
}
