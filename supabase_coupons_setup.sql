-- ==============================================================================
-- COSMEVO: Coupons Table Setup & Orders Table Enhancements
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    discount_percent NUMERIC NOT NULL CHECK (discount_percent > 0 AND discount_percent <= 100),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) on coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Coupons (matching categories & products permissions)
DROP POLICY IF EXISTS "Enable read access for all users on coupons" ON public.coupons;
CREATE POLICY "Enable read access for all users on coupons" ON public.coupons FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Enable insert for all users on coupons" ON public.coupons;
CREATE POLICY "Enable insert for all users on coupons" ON public.coupons FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on coupons" ON public.coupons;
CREATE POLICY "Enable update for all users on coupons" ON public.coupons FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Enable delete for all users on coupons" ON public.coupons;
CREATE POLICY "Enable delete for all users on coupons" ON public.coupons FOR DELETE TO public USING (true);

-- 4. Enhance Orders Table with Province, Shipping Fee, and Coupon Discount Columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_fee NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;

-- 5. Enhance Products Table with Coming Soon Column
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS is_coming_soon BOOLEAN DEFAULT false;

-- 5. Insert starter coupons for testing / immediate use
INSERT INTO public.coupons (code, discount_percent, is_active)
VALUES 
    ('WELCOME10', 10, true),
    ('COSMEVO15', 15, true),
    ('FLAT20', 20, true)
ON CONFLICT (code) DO NOTHING;
