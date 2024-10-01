'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import GabrielCard from '@/app/components/GabrielCard';

export const HeroCards = () => {
  const router = useRouter();
  const handleAuth = async () => {
    router.push('/auth');
  };
  return (
    <div className="hidden lg:flex flex-row flex-wrap gap-8 relative w-[700px] h-[500px]">
      {/* Team */}
      <GabrielCard />
      {/* Pricing */}
      <Card className="absolute top-[150px] left-[50px] w-72  drop-shadow-xl shadow-black/10 dark:shadow-white/10">
        <CardHeader>
          <CardTitle className="flex item-center justify-between">
            Free
            <Badge variant="secondary" className="text-sm text-primary">
              Most popular
            </Badge>
          </CardTitle>
          <div>
            <span className="text-3xl font-bold">$0</span>
            <span className="text-muted-foreground"> /month</span>
          </div>

          <CardDescription>
            Access unlimited SAT practice sections.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Button className="w-full" onClick={handleAuth}>
            Start Practicing
          </Button>
        </CardContent>

        <hr className="w-4/5 m-auto mb-4" />

        <CardFooter className="flex">
          <div className="space-y-4">
            {[
              'Unlimited Sections',
              'Performance Analytics',
              'Community Support'
            ].map((benefit: string) => (
              <span key={benefit} className="flex">
                <Check className="text-green-500" />{' '}
                <h3 className="ml-2">{benefit}</h3>
              </span>
            ))}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
