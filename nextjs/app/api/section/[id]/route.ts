import { NextResponse } from 'next/server';
import { fetchQuestionsBySectionId } from '../../../services/questionService';

export const maxDuration = 45; 
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const sectionId = params.id;
    if (!sectionId) 
        return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    
    try {
        // Fetch questions using the service
        const questions = await fetchQuestionsBySectionId(sectionId);

        // Combine section and questions
        const responseData = {
            questions, // Include questions in the response
            id: sectionId,
        };

        return NextResponse.json(responseData);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}