-- ==============================================================================
-- COSMEVO: Videos Showcase Table Setup
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New query)
-- ==============================================================================

-- 1. Create Videos Table
CREATE TABLE IF NOT EXISTS public.videos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    product_id TEXT,
    product_name TEXT,
    product_slug TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS) on videos
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for Videos (Public read & admin management)
DROP POLICY IF EXISTS "Enable read access for all users on videos" ON public.videos;
CREATE POLICY "Enable read access for all users on videos" ON public.videos FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Enable insert for all users on videos" ON public.videos;
CREATE POLICY "Enable insert for all users on videos" ON public.videos FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on videos" ON public.videos;
CREATE POLICY "Enable update for all users on videos" ON public.videos FOR UPDATE TO public USING (true);

DROP POLICY IF EXISTS "Enable delete for all users on videos" ON public.videos;
CREATE POLICY "Enable delete for all users on videos" ON public.videos FOR DELETE TO public USING (true);

-- 4. Seed Initial Luxury Skincare & Cosmetic Videos
INSERT INTO public.videos (title, description, video_url, thumbnail_url, product_name, product_slug, display_order, is_active)
VALUES 
    (
        'Hydra-Glow Serum Texture',
        'Watch the ultra-lightweight texture absorb instantly into skin for an all-day luminous glass glow.',
        'https://assets.mixkit.co/videos/preview/mixkit-applying-facial-serum-to-face-with-dropper-40244-large.mp4',
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        'Niacinamide Glowing Serum',
        'niacinamide-serum',
        1,
        true
    ),
    (
        'Dewy Moisture Rich Cream',
        'Luxurious whipped velvet texture that replenishes the skin barrier with zero greasy residue.',
        'https://assets.mixkit.co/videos/preview/mixkit-putting-moisturizer-cream-on-face-40243-large.mp4',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
        'Ceramide Barrier Cream',
        'ceramide-barrier-cream',
        2,
        true
    ),
    (
        'Gentle Cloud Foaming Cleanser',
        'Dense micro-bubbles lift makeup and impurities without stripping natural skin oils.',
        'https://assets.mixkit.co/videos/preview/mixkit-woman-washing-her-face-with-foam-40246-large.mp4',
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        'Gentle Foaming Face Wash',
        'gentle-foaming-face-wash',
        3,
        true
    ),
    (
        'Rose Hydration Mist & Essence',
        'Micro-fine mist infused with botanical extracts to refresh tired skin on the go.',
        'https://assets.mixkit.co/videos/preview/mixkit-spraying-hydrating-facial-mist-on-face-40248-large.mp4',
        'https://images.unsplash.com/photo-1608248597359-00976527b134?auto=format&fit=crop&w=800&q=80',
        'Rose Hydration Mist',
        'rose-hydration-mist',
        4,
        true
    )
ON CONFLICT DO NOTHING;
