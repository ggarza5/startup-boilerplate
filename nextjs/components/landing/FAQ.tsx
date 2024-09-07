'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: 'Is this platform free?',
    answer: 'Yes. Our basic plan is free and includes access to practice tests and basic analytics.',
    value: 'item-1'
  },
  {
    question: 'How can I track my progress?',
    answer:
      'Our platform provides detailed analytics and progress tracking to help you understand your strengths and areas for improvement.',
    value: 'item-2'
  },
  {
    question: 'Can I access the platform on mobile?',
    answer:
      'Yes, our platform is fully responsive and can be accessed on any device, including mobile phones and tablets.',
    value: 'item-3'
  },
  {
    question: 'Do you offer personalized study plans?',
    answer: 'Yes, we offer personalized study plans based on your performance and goals.',
    value: 'item-4'
  },
  {
    question: 'How do I get started?',
    answer:
      'Simply sign up for a free account and start practicing. You can upgrade to a premium plan for additional features.',
    value: 'item-5'
  }
];

export const FAQ = () => {
  return (
    <section id="faq" className="container py-24 sm:py-32">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Frequently Asked{' '}
        <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
          Questions
        </span>
      </h2>

      <Accordion type="single" collapsible className="w-full AccordionRoot">
        {FAQList.map(({ question, answer, value }: FAQProps) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h3 className="font-medium mt-4">
        Still have questions?{' '}
        <a
          rel="noreferrer noopener"
          href="#"
          className="text-primary transition-all border-primary hover:border-b-2"
        >
          Contact us
        </a>
      </h3>
    </section>
  );
};
