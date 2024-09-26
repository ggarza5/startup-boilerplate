'use client';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface FeatureProps {
  title: string;
  description: string;
  image: string;
}

const features: FeatureProps[] = [
  {
    title: 'Comprehensive Practice Tests',
    description:
      'Access a wide range of practice tests covering all sections of the SAT.',
    image: '/landing/looking-ahead.png'
  },
  {
    title: 'Detailed Performance Analytics',
    description:
      'Get detailed insights into your performance to identify strengths and areas for improvement.',
    image: '/landing/reflecting.png'
  },
  {
    title: 'Personalized Study Plans',
    description:
      'Receive personalized study plans tailored to your performance and goals.',
    image: '/landing/growth.png'
  }
];

const featureList: string[] = [
  'Practice Sections',
  // 'Performance Analytics',
  'Study Plans',
  'Progress Tracking',
  // 'Responsive Design',
  'Community Support',
  'Mobile Access'
  // 'Expert Tips'
];

export const Features = () => {
  return (
    <section id="features" className="container py-24 sm:py-32 space-y-8">
      <h2 className="text-3xl lg:text-4xl font-bold md:text-center">
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Our Features
        </span>
      </h2>

      <div className="flex flex-wrap md:justify-center gap-4">
        {featureList.map((feature: string) => (
          <div key={feature}>
            <Badge variant="secondary" className="text-sm">
              {feature}
            </Badge>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map(({ title, description, image }: FeatureProps) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>

            <CardContent>{description}</CardContent>

            <CardFooter>
              <img
                src={image}
                alt="About feature"
                className="w-[200px] lg:w-[300px] mx-auto"
              />
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
