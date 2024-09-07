'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

interface TestimonialProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
}

const testimonials: TestimonialProps[] = [
  {
    image: 'https://github.com/shadcn.png',
    name: 'Jane Doe',
    userName: '@jane_doe',
    comment: 'This SAT practice platform is amazing!'
  },
  {
    image: 'https://github.com/shadcn.png',
    name: 'John Smith',
    userName: '@john_smith',
    comment:
      'The detailed analytics helped me understand my strengths and weaknesses.'
  },
  {
    image: 'https://github.com/shadcn.png',
    name: 'Emily Johnson',
    userName: '@emily_johnson',
    comment:
      'The personalized study plans were a game-changer for my SAT preparation.'
  },
  {
    image: 'https://github.com/shadcn.png',
    name: 'Michael Brown',
    userName: '@michael_brown',
    comment:
      'I loved the gamified practice tests. They made learning fun and engaging.'
  },
  {
    image: 'https://github.com/shadcn.png',
    name: 'Sarah Davis',
    userName: '@sarah_davis',
    comment:
      'The community support was fantastic. I got tips and resources from other students.'
  },
  {
    image: 'https://github.com/shadcn.png',
    name: 'David Wilson',
    userName: '@david_wilson',
    comment:
      'The platform is very user-friendly and accessible on all my devices.'
  }
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold">
        Discover Why
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          {' '}
          Students Love{' '}
        </span>
        Our SAT Practice Platform
      </h2>

      <p className="text-xl text-muted-foreground pt-4 pb-8">
        Hear from students who have used our platform to prepare for the SAT.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 sm:block columns-2  lg:columns-3 lg:gap-6 mx-auto space-y-4 lg:space-y-6">
        {testimonials.map(
          ({ image, name, userName, comment }: TestimonialProps) => (
            <Card
              key={userName}
              className="max-w-md md:break-inside-avoid overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <Avatar>
                  <AvatarImage alt="" src={image} />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <CardTitle className="text-lg">{name}</CardTitle>
                  <CardDescription>{userName}</CardDescription>
                </div>
              </CardHeader>

              <CardContent>{comment}</CardContent>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
