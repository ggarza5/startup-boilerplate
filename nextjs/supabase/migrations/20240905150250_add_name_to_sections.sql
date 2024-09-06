ALTER TABLE sections ADD COLUMN name VARCHAR;

UPDATE sections SET name = 'default_name' WHERE name IS NULL;

ALTER TABLE sections ALTER COLUMN name SET NOT NULL;