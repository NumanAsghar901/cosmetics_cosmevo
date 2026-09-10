-- ==============================================================================
-- COSMEVO: Distributors Table Setup
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Create Distributors Table
CREATE TABLE IF NOT EXISTS public.distributors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    contact_person TEXT,
    city TEXT NOT NULL,
    province TEXT,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT,
    address TEXT NOT NULL,
    area_covered TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_distributors_city ON public.distributors(city);
CREATE INDEX IF NOT EXISTS idx_distributors_active ON public.distributors(is_active);
CREATE INDEX IF NOT EXISTS idx_distributors_order ON public.distributors(display_order);

-- 3. Row Level Security (RLS) Policies
ALTER TABLE public.distributors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users on distributors" ON public.distributors;
CREATE POLICY "Enable read access for all users on distributors" ON public.distributors 
FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Enable insert for all users on distributors" ON public.distributors;
CREATE POLICY "Enable insert for all users on distributors" ON public.distributors 
FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on distributors" ON public.distributors;
CREATE POLICY "Enable update for all users on distributors" ON public.distributors 
FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable delete for all users on distributors" ON public.distributors;
CREATE POLICY "Enable delete for all users on distributors" ON public.distributors 
FOR DELETE TO public USING (true);

-- 4. Seed Initial Cosmevo Certified Regional Distributors
INSERT INTO public.distributors (name, contact_person, city, province, phone, whatsapp, email, address, area_covered, display_order, is_active)
VALUES 
    (
        'Cosmevo Central Distribution Punjab',
        'M. Haris Khan',
        'Lahore',
        'Punjab',
        '0309 4560316',
        '923094560316',
        'lahore@cosmevo.pk',
        'Suite 402, Al-Hafeez Heights, Ghalib Road, Gulberg III, Lahore',
        'Gulberg, DHA, Model Town, Johar Town & Cantt',
        1,
        true
    ),
    (
        'Sindh Derma & Cosmeceuticals Hub',
        'Dr. Tariq Mahmood',
        'Karachi',
        'Sindh',
        '0321 8294711',
        '923218294711',
        'karachi@cosmevo.pk',
        'Plot 18-C, 4th Commercial Lane, Zamzama Blvd, DHA Phase 5, Karachi',
        'Clifton, DHA, Saddar, PECHS, Gulshan & North Nazimabad',
        2,
        true
    ),
    (
        'Capital Derma Care Network',
        'Shahid Rafique',
        'Islamabad',
        'Islamabad',
        '0333 5192844',
        '923335192844',
        'islamabad@cosmevo.pk',
        'Office 12, Executive Heights, Sector F-7 Markaz, Islamabad',
        'F-Sectors, G-Sectors, Blue Area & Bahria Enclave',
        3,
        true
    ),
    (
        'Cosmevo Flagship Regional Supply',
        'Numan Asghar',
        'Faisalabad',
        'Punjab',
        '0309 4560316',
        '923094560316',
        'info@cosmevo.pk',
        'Canal Road Trade Center, East Canal Road, Faisalabad',
        'Canal Road, D-Ground, Susan Road, Peoples Colony & Madina Town',
        4,
        true
    ),
    (
        'Rawalpindi Medical & Aesthetic Supply',
        'Adeel Raza',
        'Rawalpindi',
        'Punjab',
        '0300 5519201',
        '923005519201',
        'rawalpindi@cosmevo.pk',
        'Plaza 24, Main Bank Road, Saddar, Rawalpindi',
        'Saddar, Bahria Town Phases 1-8, DHA Rawalpindi & Chaklala',
        5,
        true
    ),
    (
        'South Punjab Derma & Pharma Line',
        'Malik Naveed Ahmed',
        'Multan',
        'Punjab',
        '0300 7329104',
        '923007329104',
        'multan@cosmevo.pk',
        'Shop 7, Medical Commercial Center, Nishtar Road, Multan',
        'Nishtar Road, Cantt, Gulgasht Colony & Bosan Road',
        6,
        true
    ),
    (
        'Khyber Aesthetics & Derma Supply',
        'Junaid Khan',
        'Peshawar',
        'KPK',
        '0314 9182334',
        '923149182334',
        'peshawar@cosmevo.pk',
        'Shop 14, Dean’s Trade Center, University Road, Peshawar',
        'University Road, Hayatabad, Cantt & Saddar',
        7,
        true
    ),
    (
        'Crescent Medicos & Aesthetics',
        'Chaudhry Bilal',
        'Gujranwala',
        'Punjab',
        '0301 6451299',
        '923016451299',
        'gujranwala@cosmevo.pk',
        'Main GT Road Commercial Zone, Model Town, Gujranwala',
        'Model Town, Satellite Town, DC Colony & Cantt',
        8,
        true
    ),
    (
        'Chenab Healthcare & Derma Supply',
        'Kashif Butt',
        'Sialkot',
        'Punjab',
        '0345 6172833',
        '923456172833',
        'sialkot@cosmevo.pk',
        'Paris Road Commercial Plaza, Paris Road, Sialkot',
        'Paris Road, Sialkot Cantt & Model Town',
        9,
        true
    )
ON CONFLICT (id) DO NOTHING;
