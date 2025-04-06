import { fetchSections } from '../../services/sectionsService';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 45;
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const sections = await fetchSections();
    return NextResponse.json(sections);
  } catch (error) {
    console.log('inside error of fetch');
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
