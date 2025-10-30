-- RLS Policies for users table
-- Run these commands in your Supabase SQL Editor

-- Policy to allow users to read their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Policy to allow users to insert their own profile (for new signups)
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Optional: Policy to allow users to delete their own profile
CREATE POLICY "Users can delete own profile" ON public.users
    FOR DELETE USING (auth.uid() = id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
