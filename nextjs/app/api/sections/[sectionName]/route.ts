import { NextApiRequest, NextApiResponse } from 'next';
import { fetchSectionByName } from '../../../services/sectionsService';
import { NextResponse } from 'next/server';

export async function GET(req: NextApiRequest, res: NextApiResponse) {
    console.log(req.url)
    //just get the last part of the URL (after last /)
    const sectionName = req.url!.split('/').pop();

    if (typeof sectionName !== 'string') {
        return NextResponse.json({ error: 'Invalid section name' }, { status: 400 });
    }

    try {
        const section = await fetchSectionByName(sectionName);
        if (!section) {
            return NextResponse.json({ error: 'Section not found' }, { status: 404 });
        }
        return NextResponse.json(section);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}