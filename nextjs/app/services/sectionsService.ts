import { createClient } from '@supabase/supabase-js';
import { Section } from '../types'; // Import the Section type
import { fetchQuestionsBySectionId } from './questionService';
import { ERROR_FETCHING_SECTIONS, ERROR_FETCHING_SECTION } from '../constants'; // Import specific constants

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch all sections
export const fetchSections = async (): Promise<Section[]> => {
  try {
    const { data, error } = await supabase.from('sections').select('*');

    if (error) {
      console.error(ERROR_FETCHING_SECTIONS, error);
      return [];
    }

    const sections: Section[] = data.map((item: any) => {
      return {
        id: item.id,
        name: item.name,
        section_type: item.section_type,
        category: item.category,
        created_at: item.created_at,
        created_by: item.created_by
      };
    });

    return sections;
  } catch (error) {
    console.error('Unexpected error fetching sections:', error);
    return [];
  }
};

// Function to fetch a section by its name
export const fetchSectionByName = async (
  name: string
): Promise<Section | null> => {
  try {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .eq('name', name);

    if (error) {
      console.error(ERROR_FETCHING_SECTION, error);
      return null;
    }

    if (data.length === 0) {
      console.error('No section found with the given name');
      return null;
    }

    if (data.length > 1) {
      console.warn(
        'Multiple sections found with the given name, returning the first one'
      );
    }

    // Map the API response to the Section type
    const section: Section = {
      id: data[0].id,
      name: data[0].name,
      section_type: data[0].section_type,
      category: data[0].category,
      created_at: data[0].created_at,
      created_by: data[0].created_by,
      questions: []
    };

    // Get the questions from the questions table
    const questions = await fetchQuestionsBySectionId(section.id);
    section.questions = questions;

    return section;
  } catch (error) {
    console.error('Unexpected error fetching section:', error);
    return null;
  }
};
