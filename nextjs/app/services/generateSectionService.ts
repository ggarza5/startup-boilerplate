import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import {
  OPENAI_RESPONSE_FORMAT_INSTRUCTIONS,
  OPENAI_QUESTION_FORMAT_INSTRUCTIONS,
  OPENAI_PASSAGE_INSTRUCTIONS,
  OPENAI_TITLE_INSTRUCTIONS,
  ERROR_NO_OPENAI_CONTENT,
  ERROR_SETTING_SECTION_DB,
  ERROR_SETTING_QUESTION_DB
} from '../constants'; // Import constants

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Define the schema for a question using Zod
const QuestionSchema = z.object({
  question: z.string(),
  answer_choices: z.array(z.string()),
  answer: z.string(),
  explanation: z.string()
});

// Define the schema for a section using Zod
const SectionSchema = z.object({
  section_title: z.string(),
  questions: z.array(QuestionSchema)
});

// Function to generate a new section using OpenAI and store it in Supabase
export const generateSection = async (
  sectionName: string,
  sectionType: string,
  category?: string
) => {
  console.log(
    `generateSectionService: generating a ${sectionType} section with category: ${category}`
  );

  let prompt;
  const baseInstructions = `${OPENAI_RESPONSE_FORMAT_INSTRUCTIONS} ${OPENAI_QUESTION_FORMAT_INSTRUCTIONS} ${OPENAI_PASSAGE_INSTRUCTIONS} ${OPENAI_TITLE_INSTRUCTIONS}`;

  if (category) {
    console.log(
      `generateSectionService: Using category in prompt: ${category}`
    );
    prompt = `Generate a 10 question ${sectionType} SAT question section focused on the category "${category}". 
    ${baseInstructions}
    All questions should be appropriate for the ${category} category of the ${sectionType} section of the SAT.`;
  } else {
    prompt = `Generate a 10 question ${sectionType} SAT question section. 
    ${baseInstructions}`;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  // Call OpenAI API to generate the section
  const completion: any = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: zodResponseFormat(SectionSchema, 'section'),
    reasoning_effort: 'high'
  });

  const generatedText = completion['choices'][0].message.content;
  if (!generatedText) {
    throw new Error(ERROR_NO_OPENAI_CONTENT);
  }

  //generatedText is a string, so we need to parse it as json
  const generatedTextJson = JSON.parse(generatedText);
  const generatedTitle = generatedTextJson.section_title; // Get the title
  const questions = generatedTextJson.questions;

  if (!generatedTitle) {
    console.warn('OpenAI did not return a section_title. Using default name.');
    // Potentially use sectionName (the timestamped one) or a default as fallback
  }

  // Create a new section in Supabase
  console.log(
    `generateSectionService: Inserting into Supabase with name: ${generatedTitle || sectionName}, type: ${sectionType}, category: ${category}`
  );
  const { data: sectionData, error: sectionError } = await supabase
    .from('sections')
    .insert([
      {
        name: generatedTitle || sectionName,
        section_type: sectionType,
        category: category
      } // Use generated title or fallback
    ])
    .select('*')
    .single();

  if (sectionError) {
    throw new Error(`${ERROR_SETTING_SECTION_DB}: ${sectionError.message}`);
  }

  const sectionId = sectionData.id;

  // Store each question and answer in Supabase
  for (const question of questions) {
    const { error: questionError } = await supabase.from('questions').insert([
      {
        section_id: sectionId, // Use the newly created section ID
        question: question.question,
        answer_choices: question.answer_choices,
        answer: question.answer,
        explanation: question.explanation
      }
    ]);

    if (questionError) {
      throw new Error(`${ERROR_SETTING_QUESTION_DB}: ${questionError.message}`);
    }
  }

  return {
    answer: generatedText,
    sectionId: sectionId,
    name: generatedTitle || sectionName, // Return the used name
    type: sectionType,
    category: category,
    created_at: sectionData.created_at
  };
};
