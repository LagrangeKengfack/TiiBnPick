-- Set default rating to 2.5 for existing and new persons
UPDATE persons SET rating = 2.5 WHERE rating IS NULL;
ALTER TABLE persons ALTER COLUMN rating SET DEFAULT 2.5;
