import { fetchSections } from '../../services/sectionsService';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 45; 
export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest, res: NextResponse) {
    try {
        const sections = await fetchSections();
        return NextResponse.json(sections);
    } catch (error) {
        console.log('inside error of fetch')
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }    
}