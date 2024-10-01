import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  const event = await request.json();

  if (event.type === 'checkout.session.completed') {
    const { id } = event.data.object;
    const { user_id } = event.data.object.metadata;

    try {
      const { data, error } = await supabase
        .from('users')
        .update({ is_subscribed: true })
        .eq('id', user_id);

      if (error) throw error;

      return NextResponse.json({ message: 'Subscription updated successfully' }, { status: 200 });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      console.log('Checkout Session Completed:', event.data.object);
      return NextResponse.json({ message: 'Checkout Session Completed' }, { status: 200 });
      break;
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Handle successful payment intent
      console.log('Payment Intent Succeeded:', paymentIntent);
      return NextResponse.json({ message: 'Payment Intent Succeeded' }, { status: 200 });
      break;
    case 'payment_intent.created':
      const createdPaymentIntent = event.data.object;
      // Handle payment intent created
      console.log('Payment Intent Created:', createdPaymentIntent);
      return NextResponse.json({ message: 'Payment Intent Created' }, { status: 200 });
      break;
    case 'charge.succeeded':
      const charge = event.data.object;
      // Handle successful charge
      console.log('Charge Succeeded:', charge);
      return NextResponse.json({ message: 'Charge Succeeded' }, { status: 200 });
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ message: 'Event type not supported' }, { status: 400 });
}
