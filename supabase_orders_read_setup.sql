-- ==============================================================================
-- COSMEVO: Orders Read / Unread Status Setup
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Add is_read column to orders table (defaults to false for all existing & new orders)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false NOT NULL;

-- 2. Create index on is_read for efficient filtering
CREATE INDEX IF NOT EXISTS idx_orders_is_read ON public.orders(is_read);

-- 3. Ensure Row Level Security allows updates on orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable update for all users on orders" ON public.orders;
CREATE POLICY "Enable update for all users on orders" ON public.orders 
FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for all users on orders" ON public.orders;
CREATE POLICY "Enable read access for all users on orders" ON public.orders 
FOR SELECT TO public USING (true);
