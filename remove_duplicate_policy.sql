-- First, let's see all the policies on the profiles table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND cmd = 'UPDATE';

-- Remove the duplicate UPDATE policy (keep the first one, remove the second)
-- Replace 'policy_name_to_remove' with the actual name of the duplicate policy
DROP POLICY IF EXISTS "Users can update own profile or admins can update any profile" ON profiles;

-- Verify the policies after removal
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
AND cmd = 'UPDATE';
