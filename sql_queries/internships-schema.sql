-- Internships/Job Postings Table
-- This table stores internship and job opportunities shared by board members

CREATE TABLE IF NOT EXISTS internships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  application_url TEXT,
  contact_email TEXT,
  contact_name TEXT,
  contact_linkedin TEXT,
  contact_phone TEXT,
  posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_internships_company ON internships(company);
CREATE INDEX IF NOT EXISTS idx_internships_posted_by ON internships(posted_by);
CREATE INDEX IF NOT EXISTS idx_internships_created_at ON internships(created_at DESC);

-- Enable Row Level Security
ALTER TABLE internships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Everyone can view internships (authenticated users only)
CREATE POLICY "Authenticated users can view internships" ON internships
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only board members can insert internships
CREATE POLICY "Board members can insert internships" ON internships
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND user_type = 'board_member'
    )
  );

-- Only board members can update internships
CREATE POLICY "Board members can update internships" ON internships
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND user_type = 'board_member'
    )
  );

-- Only board members can delete internships
CREATE POLICY "Board members can delete internships" ON internships
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND user_type = 'board_member'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_internships_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_internships_updated_at
  BEFORE UPDATE ON internships
  FOR EACH ROW EXECUTE FUNCTION update_internships_updated_at();
