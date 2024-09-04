import { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    console.log('got into the call')
  if (req.method === 'POST') {
    const { sectionName } = req.body;

    try {
      // Call OpenAI API or any external service
      const completion = await openai.chat.completions.create({
        messages: [{ role: "user", content: sectionName }],
        model: "gpt-3.5-turbo",
      });

      const generatedText = completion.choices[0].message.content;

      // Optionally store result in Supabase
      const { data, error } = await supabase
        .from('questions_answers')
        .insert([{ question: sectionName, answer: generatedText }]);

      if (error) {
        return res.status(500).json({ error: 'Error storing data in Supabase: ' + error.message });
      }

      return res.status(200).json({ answer: generatedText });
    } catch (error: any) { // Explicitly type error as any
      return res.status(500).json({ error: 'Error generating question section: ' + error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
