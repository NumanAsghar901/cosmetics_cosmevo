-- Create Categories Table
CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Subcategories Table
CREATE TABLE public.subcategories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access for categories and subcategories
CREATE POLICY "Enable read access for all users on categories" ON public.categories FOR SELECT TO public USING (true);
CREATE POLICY "Enable read access for all users on subcategories" ON public.subcategories FOR SELECT TO public USING (true);

-- Allow anonymous inserts/updates/deletes (since you are managing this via the admin panel with the anon key)
CREATE POLICY "Enable insert for all users on categories" ON public.categories FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all users on categories" ON public.categories FOR UPDATE TO public USING (true);
CREATE POLICY "Enable delete for all users on categories" ON public.categories FOR DELETE TO public USING (true);

CREATE POLICY "Enable insert for all users on subcategories" ON public.subcategories FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Enable update for all users on subcategories" ON public.subcategories FOR UPDATE TO public USING (true);
CREATE POLICY "Enable delete for all users on subcategories" ON public.subcategories FOR DELETE TO public USING (true);

-- Insert initial default categories so your shop doesn't break
INSERT INTO public.categories (name, slug, description) VALUES 
('Face Care', 'face', 'Cleansers and targeted face treatments.'),
('Hair Care', 'hair', 'Grow Up anti-hair fall sprays and shampoos.'),
('Soaps', 'soap', 'Dermatological and everyday beauty cleansing bars.');
