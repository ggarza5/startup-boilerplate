import React, { Suspense } from 'react';
import { Loader } from '@/components/ui/loader';
import ReviewClientComponent from './ReviewClientComponent'; // Import the new client component

// This outer component remains simple and can be statically rendered.
const ReviewPage: React.FC = () => {
  return (
    // Wrap the client component in Suspense
    <Suspense fallback={<Loader className="h-screen" />}>
      <ReviewClientComponent />
    </Suspense>
  );
};

export default ReviewPage;
