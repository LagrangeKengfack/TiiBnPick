-- Migration to replace luggage_max_capacity with detailed dimensions
ALTER TABLE logistics ADD COLUMN length DOUBLE PRECISION;
ALTER TABLE logistics ADD COLUMN width DOUBLE PRECISION;
ALTER TABLE logistics ADD COLUMN height DOUBLE PRECISION;
ALTER TABLE logistics ADD COLUMN unit VARCHAR(10);

-- Drop the old generic field
ALTER TABLE logistics DROP COLUMN luggage_max_capacity;
