-- Create the sections table
CREATE TABLE sections (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_type text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create the questions table
CREATE TABLE questions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id uuid REFERENCES sections(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer_choices text[],  -- This stores an array of text values for the answer choices
  answer text NOT NULL,
  explanation text,
  created_at timestamp with time zone DEFAULT now()
);
