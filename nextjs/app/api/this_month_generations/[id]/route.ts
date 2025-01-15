import { NextResponse } from 'next/server';
import { fetchQuestionsBySectionId } from '../../../services/questionService';

export const maxDuration = 45;
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const sectionId = params.id;
  if (!sectionId)
    return NextResponse.json(
      { error: 'Section ID is required' },
      { status: 400 }
    );

  try {
    // Get first and last day of current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Combine section and questions
    const responseData = {
      id: sectionId
    };

    return NextResponse.json(responseData);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}
