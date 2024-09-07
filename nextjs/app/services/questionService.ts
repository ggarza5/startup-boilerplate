import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to fetch questions by section ID
export const fetchQuestionsBySectionId = async (sectionId: string) => {
    try {
        console.log(sectionId);
        // Fetch questions associated with the section
        const { data: questions, error: questionsError } = await supabase
            .from('questions') // Replace with your actual questions table name
            .select('id, question, answer_choices, answer, explanation, section_id, created_at') // Include section_id and created_at
            .eq('section_id', sectionId); // Assuming section_id is the foreign key in questions table

        if (questionsError) {
            throw new Error(questionsError.message);
        }

        return questions || []; // Return questions or an empty array
    } catch (error) {
        throw new Error(error instanceof Error ? error.message : 'Unknown error');
    }
};