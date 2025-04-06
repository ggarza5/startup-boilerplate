CREATE TABLE sections (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  section_type text NOT NULL,
  category text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Add RLS policies
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sections"
ON sections
FOR SELECT
USING (auth.uid() = created_by OR created_by IS NULL);

CREATE POLICY "Users can insert their own sections"
ON sections
FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own sections"
ON sections
FOR UPDATE
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own sections"
ON sections
FOR DELETE
USING (auth.uid() = created_by);
