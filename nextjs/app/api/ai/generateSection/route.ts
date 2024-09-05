import { NextRequest, NextResponse } from 'next/server';
import { generateSection } from '../../../services/generateSectionService';

export async function POST(request: NextRequest) {
  try {
    const { sectionName } = await request.json();
    const result = await generateSection(sectionName);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error' }, { status: 500 });
  }
}