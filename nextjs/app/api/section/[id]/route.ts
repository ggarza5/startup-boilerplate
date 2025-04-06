import { NextRequest, NextResponse } from 'next/server';
import { fetchQuestionsBySectionId } from '../../../services/questionService';

export const maxDuration = 45;
export const dynamic = 'force-dynamic';

// Using 'any' as a temporary workaround for Next.js 15 compatibility
export async function GET(request: NextRequest, context: any) {
  const sectionId = context.params.id;

  if (!sectionId) {
    return NextResponse.json(
      { error: 'Section ID is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch questions using the service
    const questions = await fetchQuestionsBySectionId(sectionId);

    // Combine section and questions
    const responseData = {
      questions, // Include questions in the response
      id: sectionId
    };

    return NextResponse.json(responseData);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    // Default return for unexpected error types
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
