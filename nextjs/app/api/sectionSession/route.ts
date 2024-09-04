import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  const { userId, sectionId, startTime, endTime, duration } = await request.json();

  try {
    const { data, error } = await supabase
      .from('section_sessions')
      .insert([{ user_id: userId, section_id: sectionId, start_time: startTime, end_time: endTime, duration }]);

    if (error) throw error;

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'An unknown error occurred' }, { status: 500 });
    }
  }
}