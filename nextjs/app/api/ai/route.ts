import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  const { prompt } = await request.json();
  console.log('we called the right one')

  console.log('Loaded environment variables:', {
    SUPABASE_URL: supabaseUrl,
    SUPABASE_KEY: supabaseKey,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  });

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  // Call OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "gpt-3.5-turbo",
  });

  const generatedText = completion.choices[0].message.content;

  // Store question and answer in Supabase
  const { data, error } = await supabase
    .from('questions_answers')
    .insert([
      { question: prompt, answer: generatedText }
    ]);

  if (error) {
    return NextResponse.json({ error: 'Error storing data in Supabase: ' + error.message }, { status: 500 });
  }

  return NextResponse.json({ answer: generatedText });
}
