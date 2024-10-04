'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react'; // Import useState

export const Newsletter = () => {
  const [subscriptionMessage, setSubscriptionMessage] = useState(''); // Add state for subscription message

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const email = e.target[0].value; // Get the email from the input

    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setSubscriptionMessage('This email has already been subscribed.'); // Set message for already subscribed
        } else {
          throw new Error(result.error || 'Failed to subscribe');
        }
      } else {
        setSubscriptionMessage(
          'Subscribed! Thank you for joining our newsletter.'
        ); // Set success message
        console.log('Subscribed!', result.data);
      }
    } catch (error: any) {
      console.error('Error subscribing:', error);
      // Only set the error message if it wasn't a 409 error
      if (error.message !== 'This email has already been subscribed.') {
        setSubscriptionMessage('Error subscribing. Please try again.'); // Set error message
      }
    }
  };

  return (
    <section id="newsletter">
      <hr className="w-11/12 mx-auto" />

      <div className="container py-24 sm:py-32">
        <h3 className="text-center text-4xl md:text-5xl font-bold">
          Join Our Daily{' '}
          <span className="bg-gradient-to-b from-primary/60 to-primary text-transparent bg-clip-text">
            Newsletter
          </span>
        </h3>
        <p className="text-xl text-muted-foreground text-center mt-4 mb-8">
          Stay updated with the latest SAT practice tips and resources.
        </p>

        {subscriptionMessage && ( // Display subscription message if it exists
          <p className="text-center text-green-500">{subscriptionMessage}</p>
        )}

        <form
          className="flex flex-col w-full md:flex-row md:w-6/12 lg:w-4/12 mx-auto gap-4 md:gap-2"
          onSubmit={handleSubmit}
        >
          <Input
            placeholder="youremail@example.com"
            className="bg-muted/50 dark:bg-muted/80 "
            aria-label="email"
          />
          <Button>Subscribe</Button>
        </form>
      </div>

      <hr className="w-11/12 mx-auto" />
    </section>
  );
};
