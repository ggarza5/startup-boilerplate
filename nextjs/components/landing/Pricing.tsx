'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getURL } from '@/utils/helpers';
import { useToast } from '@/components/ui/use-toast';

enum PopularPlanType {
  NO = 0,
  YES = 1
}

interface PricingProps {
  id?: string;
  title: string;
  popular: PopularPlanType;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
  redirectURL?: string;
}

const pricingList: PricingProps[] = [
  {
    title: 'Free',
    popular: 0,
    price: 0,
    description: 'Access unlimited SAT practice sections.',
    buttonText: 'Start Practicing',
    benefitList: [
      'Unlimited Sections',
      'Performance Analytics',
      'Community Support'
    ],
    redirectURL: '/account'
  },
  {
    id: 'price_1Q5I5mKJxpbjCqLbcq2lrfJp',
    title: 'Study',
    popular: 1,
    price: 5,
    description:
      'Access to unlimited follow up questions, practice tests, and more.',
    buttonText: 'Subscribe Now',
    benefitList: [
      'Unlimited Follow Up Questions',
      'Unlimited Practice Tests',
      'Priority Support'
    ]
  }
];

export const Pricing = ({ user }: { user: User | null }) => {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<boolean>(false);

  const isLoggedIn = user != null;

  const handleClick = async (price: PricingProps) => {
    if (price.redirectURL) {
      return router.push(price.redirectURL);
    }
    setLoading(true);

    if (!user) {
      setLoading(false);
      return router.push('/auth/signup');
    }

    //Just check
    const { data, error } = await supabase.functions.invoke('get_stripe_url', {
      body: {
        return_url: getURL('/account'),
        price: price.id
      }
    });
    if (error) {
      setLoading(false);
      return toast({
        title: 'Error Occured',
        description: error.message,
        variant: 'destructive'
      });
    }
    const redirectUrl = data?.redirect_url;
    if (!redirectUrl) {
      setLoading(false);
      return toast({
        title: 'An unknown error occurred.',
        description:
          'Please try again later or contact a system administrator.',
        variant: 'destructive'
      });
    }
    router.push(redirectUrl);
    setLoading(false);
  };
  return (
    <section id="pricing" className="container py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold text-center">
        Get
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {' '}
          Unlimited{' '}
        </span>
        Access
      </h2>
      <h3 className="text-xl text-center text-muted-foreground pt-4 pb-8">
        Practice for the SAT effortlessly with the required sections for your
        preparation, including quizzes, results, and more.
      </h3>
      {/* place in the middle */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
        {pricingList.map((pricing: PricingProps) =>
          // If logged in, skip first plan
          isLoggedIn && pricing.title === 'Free' ? null : (
            <Card
              key={pricing.title}
              className={
                pricing.popular === PopularPlanType.YES
                  ? 'drop-shadow-xl shadow-black/10 dark:shadow-white/10'
                  : ''
              }
            >
              <CardHeader>
                <CardTitle className="flex item-center justify-between">
                  {pricing.title} Plan
                  {pricing.popular === PopularPlanType.YES && !isLoggedIn ? (
                    <Badge variant="secondary" className="text-sm text-primary">
                      Most popular
                    </Badge>
                  ) : null}
                </CardTitle>
                <div>
                  <span className="text-3xl font-bold">${pricing.price}</span>
                  <span className="text-muted-foreground"> /month</span>
                </div>

                <CardDescription>{pricing.description}</CardDescription>
              </CardHeader>

              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => handleClick(pricing)}
                  disabled={loading}
                >
                  {pricing.buttonText}
                </Button>
              </CardContent>

              <hr className="w-4/5 m-auto mb-4" />

              <CardFooter className="flex">
                <div className="space-y-4">
                  {pricing.benefitList.map((benefit: string) => (
                    <span key={benefit} className="flex">
                      <Check className="text-green-500" />{' '}
                      <h3 className="ml-2">{benefit}</h3>
                    </span>
                  ))}
                </div>
              </CardFooter>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
