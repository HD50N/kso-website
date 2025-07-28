-- Board Positions Configuration Table
-- This table stores the mapping between board positions and usernames

-- Create the board_positions table
CREATE TABLE IF NOT EXISTS board_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL UNIQUE,
  username TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_board_positions_role ON board_positions(role);
CREATE INDEX IF NOT EXISTS idx_board_positions_username ON board_positions(username);
CREATE INDEX IF NOT EXISTS idx_board_positions_display_order ON board_positions(display_order);
CREATE INDEX IF NOT EXISTS idx_board_positions_active ON board_positions(is_active);

-- Enable Row Level Security
ALTER TABLE board_positions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Only admins can view, insert, update, and delete board positions
CREATE POLICY "Admins can view board positions" ON board_positions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can insert board positions" ON board_positions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can update board positions" ON board_positions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admins can delete board positions" ON board_positions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND is_admin = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_board_positions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_board_positions_updated_at
  BEFORE UPDATE ON board_positions
  FOR EACH ROW
  EXECUTE FUNCTION update_board_positions_updated_at();

-- Insert default board positions
INSERT INTO board_positions (role, username, display_order) VALUES
  ('President', 'huddychung', 1),
  ('VP Internal', NULL, 2),
  ('VP External', NULL, 3),
  ('Secretary', NULL, 4),
  ('Treasurer', NULL, 5),
  ('Treasurer', NULL, 6),
  ('Social Chair', NULL, 7),
  ('Social Chair', NULL, 8),
  ('Social Chair', NULL, 9),
  ('Culture Show Chair', NULL, 10),
  ('Culture Show Chair', NULL, 11),
  ('Communications Chair', NULL, 12),
  ('Communications Chair', NULL, 13)
ON CONFLICT (role) DO NOTHING;

-- Grant permissions
GRANT ALL ON board_positions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated; 