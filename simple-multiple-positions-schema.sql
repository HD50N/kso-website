-- Simple migration to allow multiple positions with the same role
-- This removes the unique constraint on the role field without adding identifiers

-- Drop the unique constraint on role
ALTER TABLE board_positions DROP CONSTRAINT IF EXISTS board_positions_role_key;

-- Add some example multiple positions without identifiers
INSERT INTO board_positions (role, username, display_order, is_active) VALUES
  ('Treasurer', NULL, 5, true),
  ('Treasurer', NULL, 6, true),
  ('Social Chair', NULL, 7, true),
  ('Social Chair', NULL, 8, true),
  ('Social Chair', NULL, 9, true),
  ('Culture Show Chair', NULL, 10, true),
  ('Culture Show Chair', NULL, 11, true),
  ('Communications Chair', NULL, 12, true),
  ('Communications Chair', NULL, 13, true)
ON CONFLICT DO NOTHING; 