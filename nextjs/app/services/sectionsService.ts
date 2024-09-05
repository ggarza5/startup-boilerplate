import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchSections = async () => {
    try {
        const { data, error } = await supabase
            .from('sections')
            .select('*');

        if (error) {
            console.error('Error fetching sections:', error);
            return [];
        }

        return data;
    } catch (error) {
        console.error('Unexpected error fetching sections:', error);
        return [];
    }
};