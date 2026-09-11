-- ==============================================================================
-- COSMEVO: Add tracking_number column to orders table for Leopards Courier
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Add tracking_number column if it doesn't already exist
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- 2. Add an index for fast lookups by tracking number
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number);
