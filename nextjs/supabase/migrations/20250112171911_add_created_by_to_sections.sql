ALTER TABLE sections
ADD COLUMN created_by uuid REFERENCES auth.users(id) NOT NULL;

-- Add RLS policies to ensure users can only see their own sections
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sections"
ON sections
FOR SELECT
USING (auth.uid() = created_by);

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