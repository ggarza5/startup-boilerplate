CREATE TABLE sections (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_type text NOT NULL,
  question text NOT NULL,
  answer_choices text[],  -- This stores an array of text values for the answer choices
  answer text NOT NULL,
  explanation text,
  created_at timestamp with time zone DEFAULT now()
);
