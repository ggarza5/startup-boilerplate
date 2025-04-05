import { NextRequest, NextResponse } from 'next/server';
import { generateSection } from '../../../services/generateSectionService';

export const maxDuration = 45;
export const dynamic = 'force-dynamic';
// API handler to generate a new section using OpenAI
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json();
    const { name, type, category } = requestBody; // Destructure category
    console.log(
      `API Endpoint /api/ai/generateSection: Received name: ${name}, type: ${type}, category: ${category}`
    );

    const result = await generateSection(name, type, category);
    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}
