-- =======================================================
-- COSMEVO NEWSLETTER SUBSCRIBERS TABLE SETUP
-- Run this script in your Supabase Dashboard SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- =======================================================

-- 1. Create subscribers table (or ensure it exists)
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure is_active column exists if table was previously created without it
ALTER TABLE public.subscribers ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON public.subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON public.subscribers(created_at DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- 4. Allow public anonymous visitors and authenticated users to subscribe (INSERT)
DROP POLICY IF EXISTS "Enable insert for all users on subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow public newsletter subscriptions" ON public.subscribers;
CREATE POLICY "Enable insert for all users on subscribers" 
ON public.subscribers 
FOR INSERT 
TO public 
WITH CHECK (true);

-- 5. Allow reading subscribers for admin and dashboard
DROP POLICY IF EXISTS "Enable read access for all users on subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow select subscribers" ON public.subscribers;
CREATE POLICY "Enable read access for all users on subscribers" 
ON public.subscribers 
FOR SELECT 
TO public 
USING (true);

-- 6. Allow updating subscriber records
DROP POLICY IF EXISTS "Enable update for all users on subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow update subscribers" ON public.subscribers;
CREATE POLICY "Enable update for all users on subscribers" 
ON public.subscribers 
FOR UPDATE 
TO public 
USING (true)
WITH CHECK (true);

-- 7. Allow deleting subscribers
DROP POLICY IF EXISTS "Enable delete for all users on subscribers" ON public.subscribers;
DROP POLICY IF EXISTS "Allow delete subscribers" ON public.subscribers;
CREATE POLICY "Enable delete for all users on subscribers" 
ON public.subscribers 
FOR DELETE 
TO public 
USING (true);

