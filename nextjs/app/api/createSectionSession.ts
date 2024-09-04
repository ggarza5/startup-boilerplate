import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId, sectionId, startTime, endTime, duration } = req.body;

  try {
    const { data, error } = await supabase
      .from('section_sessions')
      .insert([{ user_id: userId, section_id: sectionId, start_time: startTime, end_time: endTime, duration }]);

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
}