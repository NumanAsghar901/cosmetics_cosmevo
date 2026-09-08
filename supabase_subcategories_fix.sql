-- Drop the existing subcategories table which had the category_id relation
DROP TABLE IF EXISTS public.subcategories;

-- Create the new independent Subcategories (Concerns) Table
CREATE TABLE public.subcategories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access
CREATE POLICY "Enable read access for all users on subcategories" ON public.subcategories FOR SELECT TO public USING (true);

-- Allow anonymous inserts/updates/deletes (since managed via admin panel with anon key)
CREATE POLICY "Enable insert for all users on subcategories" ON public.subcategories FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all users on subcategories" ON public.subcategories FOR UPDATE TO public USING (true);
CREATE POLICY "Enable delete for all users on subcategories" ON public.subcategories FOR DELETE TO public USING (true);

-- Insert the default concerns as subcategories
INSERT INTO public.subcategories (name, slug) VALUES 
('Acne-Prone Skin', 'acne-prone-skin'),
('Brightening', 'brightening'),
('Hair Fall Care', 'hair-fall-care'),
('Daily Cleansing', 'daily-cleansing'),
('Dry Skin Care', 'dry-skin-care'),
('Baby Care', 'baby-care');

-- Reload the schema cache so the API recognizes the changes immediately
NOTIFY pgrst, 'reload schema';
