-- Make sure the created_by column exists and is nullable
DO $$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM information_schema.columns 
                 WHERE table_schema='public' AND table_name='sections' AND column_name='created_by') THEN
        ALTER TABLE sections ADD COLUMN created_by uuid REFERENCES auth.users(id);
    END IF;
END
$$;

-- Make sure RLS is enabled
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid errors
DROP POLICY IF EXISTS "Users can view their own sections" ON sections;
DROP POLICY IF EXISTS "Users can insert their own sections" ON sections;
DROP POLICY IF EXISTS "Users can update their own sections" ON sections;
DROP POLICY IF EXISTS "Users can delete their own sections" ON sections;

-- Create policies allowing access to sections with null created_by or matching auth.uid()
CREATE POLICY "Users can view their own sections"
ON sections
FOR SELECT
USING (created_by IS NULL OR auth.uid() = created_by);

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