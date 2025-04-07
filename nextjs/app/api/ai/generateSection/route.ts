import { NextRequest, NextResponse } from 'next/server';
import { generateSection } from '../../../services/generateSectionService';
import { ERROR_UNKNOWN } from '@/app/constants';

export const maxDuration = 45;
export const dynamic = 'force-dynamic';
// API handler to generate a new section using OpenAI
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { name, type, category } = requestBody;
    // console.log(`API Endpoint /api/ai/generateSection: Received name: ${name}, type: ${type}, category: ${category}`); // Removed log

    const result = await generateSection(name, type, category);
    return NextResponse.json(result);
  } catch (error) {
    // Keep essential error logs
    console.error('Error in /api/ai/generateSection:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: ERROR_UNKNOWN }, { status: 500 }); // Use constant
  }
}
