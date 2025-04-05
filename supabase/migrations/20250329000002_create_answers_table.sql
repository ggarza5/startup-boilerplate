/**
* ANSWERS
* This table stores user answers to specific questions in a section.
* It enables features like reviewing past answers and analyzing performance by category.
*/
CREATE TABLE answers (
  -- Unique identifier for each answer entry
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  -- User who provided the answer
  user_id uuid REFERENCES auth.users NOT NULL,
  -- Section the question belongs to
  section_id uuid REFERENCES sections NOT NULL,
  -- Question being answered
  question_id uuid REFERENCES questions NOT NULL,
  -- The user's selected answer
  answer text NOT NULL,
  -- When the answer was recorded
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- When the answer was last updated
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a unique constraint to prevent duplicate answers
CREATE UNIQUE INDEX idx_unique_user_question ON answers(user_id, question_id);

-- Create indexes for common query patterns
CREATE INDEX idx_answers_section ON answers(section_id);
CREATE INDEX idx_answers_user ON answers(user_id);

-- Enable RLS to ensure users can only access their own answers
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policies for answers table
CREATE POLICY "Users can view their own answers" 
ON answers
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own answers" 
ON answers
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own answers" 
ON answers
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_answers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_answers_updated_at_trigger
BEFORE UPDATE ON answers
FOR EACH ROW
EXECUTE FUNCTION update_answers_updated_at(); 