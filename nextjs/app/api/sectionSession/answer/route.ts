import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { userId, sectionId, questionId, answer } = requestBody;

    // Validate required fields
    if (!userId || !sectionId || !questionId || !answer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = createClient();

    // Check if an answer already exists
    const { data: existingAnswer, error: checkError } = await supabase
      .from('answers')
      .select('*')
      .eq('user_id', userId)
      .eq('section_id', sectionId)
      .eq('question_id', questionId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing answer:', checkError);
      return NextResponse.json(
        { error: 'Error checking for existing answer' },
        { status: 500 }
      );
    }

    let result;

    // If answer exists, update it
    if (existingAnswer) {
      const { data, error } = await supabase
        .from('answers')
        .update({ answer })
        .eq('user_id', userId)
        .eq('section_id', sectionId)
        .eq('question_id', questionId)
        .select();

      if (error) {
        console.error('Error updating answer:', error);
        return NextResponse.json(
          { error: 'Error updating answer' },
          { status: 500 }
        );
      }

      result = data;
    }
    // Otherwise, create a new answer
    else {
      const { data, error } = await supabase
        .from('answers')
        .insert([
          {
            user_id: userId,
            section_id: sectionId,
            question_id: questionId,
            answer
          }
        ])
        .select();

      if (error) {
        console.error('Error inserting answer:', error);
        return NextResponse.json(
          { error: 'Error inserting answer' },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error storing answer:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
