-- Add salary_expectation column to applications table
ALTER TABLE applications 
ADD COLUMN salary_expectation TEXT;

-- Refresh the schema cache (sometimes needed, though usually automatic)
NOTIFY pgrst, 'reload config';
