-- Rename num_of_like to note_obtenue in comments table
ALTER TABLE comments RENAME COLUMN num_of_like TO note_obtenue;
ALTER TABLE comments ALTER COLUMN note_obtenue SET DEFAULT 0;
