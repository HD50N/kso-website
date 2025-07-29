-- Fix RLS policies for cart_items table
-- This script will drop and recreate the RLS policies to ensure they work correctly

-- First, disable RLS temporarily
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

-- Re-enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Create new, more permissive policies
-- Allow users to view their own cart items
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT USING (auth.uid()::text = user_id::text);

-- Allow users to insert their own cart items
CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Allow users to update their own cart items
CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Allow users to delete their own cart items
CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Grant necessary permissions
GRANT ALL ON cart_items TO anon, authenticated;

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'cart_items'; 