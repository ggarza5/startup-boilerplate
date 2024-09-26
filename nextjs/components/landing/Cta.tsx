'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export const Cta = () => {
  const router = useRouter();
  const handleAuth = async () => {
    router.push('/auth');
  };
  return (
    <section id="cta" className="bg-muted/50 py-16 my-24 sm:my-32">
      <div className="container lg:grid lg:grid-cols-2 place-items-center">
        <div className="lg:col-start-1">
          <h2 className="text-3xl md:text-4xl font-bold ">
            All Your
            <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
              {' '}
              SAT Practice Needs{' '}
            </span>
            In One Platform
          </h2>
          <p className="text-muted-foreground text-xl mt-4 mb-8 lg:mb-0">
            Our platform offers everything you need to excel on the SAT, from
            practice sections to detailed performance analytics.
          </p>
        </div>

        <div className="space-y-4 lg:col-start-2">
          <Button className="w-full md:mr-4 md:w-auto" onClick={handleAuth}>
            Start Practicing
          </Button>
        </div>
      </div>
    </section>
  );
};
