import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Use server client
import * as Constants from '@/app/constants';
import { fetchQuestionsBySectionId } from '@/app/services/questionService';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } } // Use 'id' here
) {
  const sectionId = params.id; // Get ID from params.id

  if (!sectionId) {
    return NextResponse.json(
      { error: 'Section ID is required' },
      { status: 400 }
    );
  }

  try {
    const supabase = createClient();

    // Fetch section details by ID
    const { data: sectionData, error: sectionError } = await supabase
      .from('sections')
      .select('*')
      .eq('id', sectionId)
      .maybeSingle();

    if (sectionError) {
      console.error(`${Constants.ERROR_FETCHING_SECTION}:`, sectionError);
      return NextResponse.json(
        {
          error: `${Constants.ERROR_FETCHING_SECTION}: ${sectionError.message}`
        },
        { status: 500 }
      );
    }

    if (!sectionData) {
      return NextResponse.json(
        { error: `Section with ID ${sectionId} not found` },
        { status: 404 }
      );
    }

    // Fetch associated questions
    const questions = await fetchQuestionsBySectionId(sectionId);

    // Combine section data and questions
    const fullSectionData = {
      ...sectionData,
      questions: questions
    };

    return NextResponse.json(fullSectionData);
  } catch (error) {
    console.error('Unexpected error fetching section by ID:', error);
    const message =
      error instanceof Error ? error.message : Constants.ERROR_UNKNOWN;
    return NextResponse.json(
      { error: `Unexpected error: ${message}` },
      { status: 500 }
    );
  }
}
