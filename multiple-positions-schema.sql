-- Migration to allow multiple positions with the same role
-- This removes the unique constraint on the role field

-- Drop the unique constraint on role
ALTER TABLE board_positions DROP CONSTRAINT IF EXISTS board_positions_role_key;

-- Add a new column for position identifier (optional)
ALTER TABLE board_positions 
ADD COLUMN IF NOT EXISTS position_identifier TEXT;

-- Update existing positions to have unique identifiers
UPDATE board_positions 
SET position_identifier = role 
WHERE position_identifier IS NULL;

-- Create a composite unique constraint on role + identifier (optional, for specific cases)
-- This allows multiple "Treasurer" positions but prevents duplicate "Treasurer - Primary" positions
-- ALTER TABLE board_positions 
-- ADD CONSTRAINT board_positions_role_identifier_unique 
-- UNIQUE (role, position_identifier);

-- Add index for better performance when querying by role
CREATE INDEX IF NOT EXISTS idx_board_positions_role_identifier ON board_positions(role, position_identifier);

-- Update the default positions to show how multiple positions work
-- First, let's add some example multiple positions
INSERT INTO board_positions (role, position_identifier, username, display_order, is_active) VALUES
  ('Treasurer', 'Primary', NULL, 5, true),
  ('Treasurer', 'Secondary', NULL, 6, true),
  ('Social Chair', 'Events', NULL, 7, true),
  ('Social Chair', 'Outreach', NULL, 8, true),
  ('Social Chair', 'Internal', NULL, 9, true),
  ('Culture Show Chair', 'Production', NULL, 10, true),
  ('Culture Show Chair', 'Logistics', NULL, 11, true),
  ('Communications Chair', 'Social Media', NULL, 12, true),
  ('Communications Chair', 'Content', NULL, 13, true)
ON CONFLICT (role, position_identifier) DO NOTHING; 