import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI();

export const generateQuestionSection = async (prompt: string) => {
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
    throw new Error('Error storing data in Supabase: ' + error.message);
  }

  return generatedText;
};
