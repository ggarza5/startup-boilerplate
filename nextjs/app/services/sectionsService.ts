import { createClient } from '@supabase/supabase-js';
import { Section } from '../types'; // Import the Section type
import { fetchQuestionsBySectionId } from './questionService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export const fetchSections = async (): Promise<Section[]> => {
    try {
        console.log('we are inside the fetchSections');
        const { data, error } = await supabase
            .from('sections')
            .select('*');
        console.log(data);

        if (error) {
            console.error('Error fetching sections:', error);
            return [];
        }

        // Map the API response to the Section type
        const sections: Section[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.section_type,
            questions: [], // Assuming questions are not returned in this API call
            createdAt: item.created_at
        }));

        return sections;
    } catch (error) {
        console.error('Unexpected error fetching sections:', error);
        return [];
    }
};

export const fetchSectionByName = async (name: string): Promise<Section | null> => {
    try {
        const { data, error } = await supabase
            .from('sections')
            .select('*')
            .eq('name', name);

        if (error) {
            console.error('Error fetching section:', error);
            return null;
        }

        if (data.length === 0) {
            console.error('No section found with the given name');
            return null;
        }

        if (data.length > 1) {
            console.warn('Multiple sections found with the given name, returning the first one');
        }

        // Map the API response to the Section type
        const section: Section = {
            id: data[0].id,
            name: data[0].name,
            type: data[0].section_type,
            questions: [], // Assuming questions are not returned in this API call
            createdAt: data[0].created_at
        };

        //get the questions from the questions table
        const questions = await fetchQuestionsBySectionId(section.id);
        section.questions = questions;

        return section;
    } catch (error) {
        console.error('Unexpected error fetching section:', error);
        return null;
    }
};