import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Get all practice tests for a user
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const testId = searchParams.get('testId');

  try {
    if (testId) {
      // Get a specific practice test
      const { data, error } = await supabase
        .from('practice_tests')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) throw error;

      return NextResponse.json(data, { status: 200 });
    } else if (userId) {
      // Get all practice tests for a user
      const { data, error } = await supabase
        .from('practice_tests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return NextResponse.json(data, { status: 200 });
    } else {
      return NextResponse.json(
        { error: 'Missing userId or testId parameter' },
        { status: 400 }
      );
    }
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

// Create a new practice test
export async function POST(request: NextRequest) {
  const { userId, name, sections } = await request.json();

  try {
    const { data, error } = await supabase
      .from('practice_tests')
      .insert([
        {
          user_id: userId,
          name: name,
          sections: sections,
          start_time: new Date().toISOString()
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

// Update an existing practice test (e.g., for pausing, resuming, or completing)
export async function PATCH(request: NextRequest) {
  const { id, status, end_time } = await request.json();
  const updates: any = { status };

  if (status === 'completed' || end_time) {
    updates.end_time = end_time || new Date().toISOString();
  }

  try {
    const { data, error } = await supabase
      .from('practice_tests')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 200 });
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
