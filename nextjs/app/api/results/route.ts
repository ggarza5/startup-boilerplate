import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const practiceTestId = searchParams.get('practiceTestId');

  try {
    let query = supabase.from('results').select('*').eq('user_id', userId);

    if (practiceTestId) {
      query = query.eq('practice_test_id', practiceTestId);
    }

    const { data, error } = await query.order('created_at', {
      ascending: true
    });

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

//takes userId, sectionId and score and inserts into results table
export async function POST(request: NextRequest) {
  const { userId, sectionId, score, practiceTestId } = await request.json();

  try {
    const resultData: {
      user_id: string;
      section_id: string;
      score: number;
      practice_test_id?: string;
    } = {
      user_id: userId,
      section_id: sectionId,
      score: score
    };

    // Add practice_test_id if provided
    if (practiceTestId) {
      resultData.practice_test_id = practiceTestId;
    }

    const { data, error } = await supabase.from('results').insert([resultData]);

    console.log('Result inserted:', data);
    if (error) {
      console.error('Error inserting result:', error);
      throw error;
    }

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
