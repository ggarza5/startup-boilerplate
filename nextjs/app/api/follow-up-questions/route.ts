import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * GET handler for follow-up questions
 * Retrieves follow-up questions associated with a specific question
 *
 * @param request - The NextRequest object containing the questionId parameter
 * @returns A JSON response with the follow-up questions or an error message
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const questionId = searchParams.get('questionId');

  if (!questionId) {
    return NextResponse.json(
      { error: 'Missing questionId parameter' },
      { status: 400 }
    );
  }

  try {
    // Get follow-up questions directly from the dedicated table
    const { data, error } = await supabase
      .from('follow_up_questions')
      .select('*')
      .eq('question_id', questionId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: 'An unknown error occurred' },
        { status: 500 }
      );
    }
  }
}

/**
 * POST handler for follow-up questions
 * Creates a new follow-up question for a specific question
 *
 * @param request - The NextRequest object containing the follow-up question data
 * @returns A JSON response with the created follow-up question or an error message
 */
export async function POST(request: NextRequest) {
  const {
    questionId,
    followUpContent,
    answerChoices,
    correctAnswer,
    explanation
  } = await request.json();

  if (!questionId || !followUpContent || !answerChoices || !correctAnswer) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    // Insert new follow-up question
    const { data, error } = await supabase
      .from('follow_up_questions')
      .insert([
        {
          question_id: questionId,
          follow_up_content: followUpContent,
          answer_choices: answerChoices,
          correct_answer: correctAnswer,
          explanation: explanation || null
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: 'An unknown error occurred' },
        { status: 500 }
      );
    }
  }
}
