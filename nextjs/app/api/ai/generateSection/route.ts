import { NextRequest, NextResponse } from 'next/server';
import { generateSection } from '../../../services/generateSectionService';

export const maxDuration = 45; 
export const dynamic = 'force-dynamic';
// API handler to generate a new section using OpenAI
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json(); // Store the result of request.json() in a variable
    const { name, type } = requestBody; // Destructure from the stored variable
    const result = await generateSection(name, type);
    return NextResponse.json(result);
  } catch (error) {
    console.log(error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}