-- Add follow_up_questions to questions table
ALTER TABLE public.questions ADD COLUMN follow_up_questions uuid[]; 