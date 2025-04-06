-- Create a dedicated follow_up_questions table
CREATE TABLE public.follow_up_questions (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  follow_up_content text NOT NULL,
  answer_choices text[] NOT NULL,
  correct_answer text NOT NULL,
  explanation text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add proper RLS policies
ALTER TABLE public.follow_up_questions ENABLE ROW LEVEL SECURITY;

-- Remove the column from questions table (optional, can keep for backward compatibility)
-- ALTER TABLE public.questions DROP COLUMN follow_up_questions; 