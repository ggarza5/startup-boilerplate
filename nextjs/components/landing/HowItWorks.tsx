'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  MedalIcon,
  MapIcon,
  PlaneIcon,
  GiftIcon
} from '@/components/landing/Icons';

interface FeatureProps {
  icon: JSX.Element;
  title: string;
  description: string;
}

const features: FeatureProps[] = [
  {
    icon: <MedalIcon />,
    title: 'Accessibility',
    description:
      'Our platform is accessible on all devices, ensuring you can practice anytime, anywhere.'
  },
  {
    icon: <MapIcon />,
    title: 'Community',
    description:
      'Join a community of students and educators to share tips and resources.'
  },
  {
    icon: <PlaneIcon />,
    title: 'Scalability',
    description:
      'Our platform scales with your needs, offering more resources as you progress.'
  },
  {
    icon: <GiftIcon />,
    title: 'Gamification',
    description:
      'Engage with our gamified practice tests to make learning fun and effective.'
  }
];

export const HowItWorks = () => {
  return (
    <section id="howItWorks" className="container text-center py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold ">
        How It{' '}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Works{' '}
        </span>
        Step-by-Step Guide
      </h2>
      <p className="md:w-3/4 mx-auto mt-4 mb-8 text-xl text-muted-foreground">
        Follow these simple steps to start your SAT practice journey with us.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map(({ icon, title, description }: FeatureProps) => (
          <Card key={title} className="bg-muted/50">
            <CardHeader>
              <CardTitle className="grid gap-4 place-items-center">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>{description}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
