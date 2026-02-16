-- Add duration column to announcements table
ALTER TABLE announcements ADD COLUMN duration INTEGER;

-- Add duration column to deliveries table
ALTER TABLE deliveries ADD COLUMN duration INTEGER;
