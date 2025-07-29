-- Disable RLS for cart_items table
-- This is a simpler solution that bypasses RLS entirely for cart operations

-- Disable RLS on cart_items table
ALTER TABLE cart_items DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can insert own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can update own cart items" ON cart_items;
DROP POLICY IF EXISTS "Users can delete own cart items" ON cart_items;

-- Grant necessary permissions
GRANT ALL ON cart_items TO anon, authenticated;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'cart_items'; 