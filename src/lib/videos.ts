import { createClient } from '@supabase/supabase-js';
import { ShowcaseVideo } from './types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: {
    fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
  },
});

export const FALLBACK_SHOWCASE_VIDEOS: ShowcaseVideo[] = [
  {
    id: 'fallback-video-1',
    title: 'Hydra-Glow Serum Texture',
    description: 'Ultra-lightweight liquid gold texture absorbs instantly, infusing intense hydration and an instant glass-skin radiance.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-applying-facial-serum-to-face-with-dropper-40244-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    product_name: 'Niacinamide Glowing Serum',
    product_slug: 'niacinamide-serum',
    display_order: 1,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-video-2',
    title: 'Velvet Barrier Moisture Cream',
    description: 'Whipped cloud texture melts into skin to lock in moisture for 24 hours without feeling heavy or greasy.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-putting-moisturizer-cream-on-face-40243-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    product_name: 'Ceramide Barrier Cream',
    product_slug: 'ceramide-barrier-cream',
    display_order: 2,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-video-3',
    title: 'Dense Cloud Foam Cleanser',
    description: 'Micro-bubble formula effortlessly lifts dirt, environmental grime, and makeup while keeping skin supple.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-woman-washing-her-face-with-foam-40246-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    product_name: 'Gentle Foaming Face Wash',
    product_slug: 'gentle-foaming-face-wash',
    display_order: 3,
    is_active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'fallback-video-4',
    title: 'Rose Glow Dew Mist',
    description: 'Ultra-fine botanical micro-mist revives skin with an instant boost of glow and dewiness whenever you need a refresh.',
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-spraying-hydrating-facial-mist-on-face-40248-large.mp4',
    thumbnail_url: 'https://images.unsplash.com/photo-1608248597359-00976527b134?auto=format&fit=crop&w=800&q=80',
    product_name: 'Rose Hydration Mist',
    product_slug: 'rose-hydration-mist',
    display_order: 4,
    is_active: true,
    created_at: new Date().toISOString(),
  },
];

export async function getAllActiveVideos(): Promise<ShowcaseVideo[]> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      // Table doesn't exist in Supabase yet
      return FALLBACK_SHOWCASE_VIDEOS;
    }

    return (data || []) as ShowcaseVideo[];
  } catch (err) {
    console.error('Unexpected error in getAllActiveVideos:', err);
    return FALLBACK_SHOWCASE_VIDEOS;
  }
}

export async function getAllAdminVideos(): Promise<ShowcaseVideo[]> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      return FALLBACK_SHOWCASE_VIDEOS;
    }

    return (data || []) as ShowcaseVideo[];
  } catch (err) {
    console.error('Unexpected error in getAllAdminVideos:', err);
    return FALLBACK_SHOWCASE_VIDEOS;
  }
}
