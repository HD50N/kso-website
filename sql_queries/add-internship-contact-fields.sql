-- Add LinkedIn and Phone Number fields to internships table
-- Run this migration to add the new contact fields

ALTER TABLE internships 
ADD COLUMN IF NOT EXISTS contact_linkedin TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT;
