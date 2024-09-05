import { NextApiRequest, NextApiResponse } from 'next';
import { fetchSections } from '../../services/sectionsService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        try {
            const sections = await fetchSections();
            res.status(200).json(sections);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch sections' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}