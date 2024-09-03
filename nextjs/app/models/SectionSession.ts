import { createClient } from '@supabase/supabase-js';

const supabase = createClient('your-supabase-url', 'your-supabase-key');

export const createSectionSession = async (userId: string, sectionId: number, timeSpent: number) => {
  const { data, error } = await supabase
    .from('section_sessions')
    .insert([{ user_id: userId, section_id: sectionId, time_spent: timeSpent }]);
  if (error) throw error;
  return data;
};