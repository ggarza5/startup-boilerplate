-- Create the practice_tests table
CREATE TABLE public.practice_tests (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  name VARCHAR NOT NULL,
  sections uuid[] NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  status VARCHAR CHECK(status IN ('in_progress', 'completed', 'paused')) DEFAULT 'in_progress',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add practice_test_id to results table
ALTER TABLE public.results ADD COLUMN practice_test_id uuid REFERENCES practice_tests(id); 