import { NextApiRequest, NextApiResponse } from 'next';
import { fetchSections } from '../../services/sectionsService';
import { NextResponse } from 'next/server';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
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