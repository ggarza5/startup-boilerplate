/**
* Add category field to sections table
* This field allows sections to be categorized (e.g., Algebra, Information and Ideas, etc.)
*/

-- Add category column to sections table
ALTER TABLE sections 
ADD COLUMN category text;

-- Create an index on the category for better performance when filtering
CREATE INDEX idx_sections_category ON sections(category);

-- Make sure the RLS policies still apply
ALTER TABLE sections FORCE ROW LEVEL SECURITY; 