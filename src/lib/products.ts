import { Product } from './types';
import { FALLBACK_IMAGES } from './constants';
import { supabase, isSupabaseConfigured } from './supabase';

export const BUNDLED_PRODUCTS: Product[] = [
  {
    id: 1,
    slug: 'acne-ease-facewash',
    name: 'Acne Ease Facewash',
    category: 'face',
    family: 'Acne Ease',
    price: 830,
    tagline: 'Daily facewash for oily and acne-prone skin.',
    overview: 'Acne Ease Facewash is designed for oily and acne-prone skin. It helps cleanse excess oil and daily impurities while supporting a fresh, clearer-looking complexion.',
    benefits: [
      'Helps cleanse excess oil',
      'Supports clearer-looking skin',
      'Refreshes the skin without stripping moisture',
      'Suitable for a simple daily morning & evening routine',
    ],
    how_to_use: [
      'Wet face with lukewarm water.',
      'Apply a coin-sized amount and massage gently across face in circular motions.',
      'Rinse thoroughly with fresh water.',
      'Use twice daily — morning and night.',
    ],
    caution: 'For external use only. Avoid direct contact with eyes. Discontinue use if persistent irritation occurs.',
    concerns: ['acne-prone-skin', 'daily-cleansing'],
    featured: true,
  },
  {
    id: 2,
    slug: 'giga-white-creamy-facewash',
    name: 'Giga White Creamy Facewash',
    category: 'face',
    family: 'Giga White',
    price: 890,
    tagline: 'Creamy daily facewash for fresh and brighter-looking skin.',
    overview: 'Giga White Creamy Facewash gently cleanses daily impurities with a creamy, non-stripping formula, supporting fresh and brighter-looking skin tone.',
    benefits: [
      'Gently cleanses daily impurities',
      'Supports fresh, brighter-looking skin',
      'Creamy, non-stripping formula',
      'Suitable for daily use on all skin types',
    ],
    how_to_use: [
      'Wet face with clean water.',
      'Massage cream onto skin gently for 30-60 seconds.',
      'Rinse thoroughly and pat dry with a soft towel.',
      'Follow with your preferred moisturizer.',
    ],
    caution: 'For external use only. Avoid contact with eyes.',
    concerns: ['brightening', 'daily-cleansing'],
    featured: true,
  },
  {
    id: 3,
    slug: 'grow-up-hair-regrowth-spray',
    name: 'Grow Up Hair Regrowth Spray',
    category: 'hair',
    family: 'Grow Up',
    price: 1950,
    tagline: 'Hair and scalp care spray for daily hair-fall support.',
    overview: 'Grow Up Hair Regrowth Spray is a lightweight, non-greasy spray formulated to support a daily hair and scalp care routine, strengthening roots and nourishing follicles.',
    benefits: [
      'Supports a daily hair-fall care routine',
      'Formulated specifically for root & scalp nourishment',
      'Lightweight, non-greasy non-sticky formula',
      'Easy daily spray application',
    ],
    how_to_use: [
      'Part hair into sections to expose clean scalp.',
      'Spray 4–6 pumps directly onto the scalp area.',
      'Massage gently with fingertips for 2–3 minutes.',
      'Do not rinse immediately. Leave in for optimal absorption.',
    ],
    caution: 'Avoid spraying into eyes. If contact occurs, rinse with cool water.',
    concerns: ['hair-fall-care'],
    featured: true,
  },
  {
    id: 4,
    slug: 'grow-up-anti-hair-fall-shampoo',
    name: 'Grow Up Anti Hair Fall Shampoo',
    category: 'hair',
    family: 'Grow Up',
    price: 980,
    tagline: 'Daily shampoo designed for a hair-fall care routine.',
    overview: 'Grow Up Anti Hair Fall Shampoo gently cleanses scalp and hair as part of a simple, daily hair-fall care routine, eliminating buildup while reinforcing strands.',
    benefits: [
      'Formulated for a targeted hair-fall care routine',
      'Gently cleanses scalp and hair without over-drying',
      'Supports healthier, resilient-looking hair',
      'Suitable for daily or alternate-day use',
    ],
    how_to_use: [
      'Apply to wet hair and scalp.',
      'Lather gently and work through hair lengths.',
      'Leave on scalp for 1–2 minutes before rinsing.',
      'Rinse thoroughly with water.',
    ],
    caution: 'In case of eye contact, flush with water immediately.',
    concerns: ['hair-fall-care', 'daily-cleansing'],
    featured: true,
  },
  {
    id: 5,
    slug: 'acne-ease-soap',
    name: 'Acne Ease Soap',
    category: 'soap',
    family: 'Acne Ease',
    price: 280,
    tagline: 'Bar soap formulated for acne-prone skin.',
    overview: 'Acne Ease Soap is formulated for acne-prone skin as part of a simple daily cleansing routine, targeted at controlling excess oil and impurities.',
    benefits: [
      'Formulated specifically for acne-prone skin',
      'Gently cleanses skin and body',
      'Helps manage excess surface sebum',
      'Suitable for daily face and body use',
    ],
    how_to_use: [
      'Work into a rich lather with water.',
      'Gently apply across face and body.',
      'Rinse thoroughly and pat dry.',
    ],
    caution: 'For external use only.',
    concerns: ['acne-prone-skin', 'daily-cleansing'],
  },
  {
    id: 6,
    slug: 'giga-white-plus-soap',
    name: 'Giga White Plus Soap',
    category: 'soap',
    family: 'Giga White',
    price: 350,
    tagline: 'Advanced daily soap for brighter-looking skin.',
    overview: 'Giga White Plus Soap is an enriched formulation designed for everyday cleansing, actively supporting clearer, brighter, and more refreshed skin tone.',
    benefits: [
      'Advanced formula supporting brighter-looking skin',
      'Gently washes away dullness and environmental impurities',
      'Rich, nourishing lather for face and body',
      'Suitable for daily use',
    ],
    how_to_use: [
      'Lather with water and apply smoothly over wet skin.',
      'Massage gently for 1 minute.',
      'Rinse with fresh water.',
    ],
    caution: 'Avoid direct eye contact.',
    concerns: ['brightening', 'daily-cleansing'],
  },
  {
    id: 7,
    slug: 'giga-white-soap',
    name: 'Giga White Soap',
    category: 'soap',
    family: 'Giga White',
    price: 280,
    tagline: 'Daily soap for fresh, brighter-looking skin.',
    overview: 'Giga White Soap supports fresh, brighter-looking skin as part of an everyday face and body cleansing routine.',
    benefits: [
      'Supports fresh and glowing skin appearance',
      'Gently removes daily dust and oil',
      'Comfortable on skin after washing',
    ],
    how_to_use: ['Lather well and massage onto damp skin. Rinse cleanly.'],
    caution: 'For external use only.',
    concerns: ['brightening', 'daily-cleansing'],
  },
  {
    id: 8,
    slug: 'hydro-med-baby-soap',
    name: 'Hydro Med Baby Soap',
    category: 'soap',
    family: 'Hydro Med',
    price: 290,
    tagline: 'Gentle daily soap formulated for baby skin.',
    overview: 'Hydro Med Baby Soap is specially formulated to be ultra-gentle and mild for delicate daily baby-care and sensitive skin routines.',
    benefits: [
      'Ultra-mild, gentle cleansing formulation',
      'Tailored for baby and sensitive skin care',
      'Non-irritating, soft lather',
    ],
    how_to_use: ['Work into a soft lather with warm water. Cleanse skin gently and rinse thoroughly.'],
    caution: 'For external baby and family use.',
    concerns: ['baby-care', 'daily-cleansing'],
  },
  {
    id: 9,
    slug: 'hydro-med-soap',
    name: 'Hydro Med Soap',
    category: 'soap',
    family: 'Hydro Med',
    price: 290,
    tagline: 'Gentle daily moisturizing soap.',
    overview: 'Hydro Med Soap is designed for everyday use, helping cleanse while supporting comfortable, hydrated-feeling skin and preventing tightness.',
    benefits: [
      'Gentle moisturizing cleansing formula',
      'Cleanses effectively without over-drying',
      'Ideal for dry, tight, or sensitive-feeling skin',
    ],
    how_to_use: ['Lather onto wet hands or sponge, cleanse thoroughly and rinse.'],
    caution: 'For external use only.',
    concerns: ['dry-skin-care', 'daily-cleansing'],
  },
  {
    id: 10,
    slug: 'mycoease-soap',
    name: 'MycoEase Soap',
    category: 'soap',
    family: 'MycoEase',
    price: 280,
    tagline: 'Daily soap formulated for everyday skin care.',
    overview: 'MycoEase Soap is formulated for a simple, everyday skin-cleansing routine with clarifying benefits.',
    benefits: [
      'Gently cleanses and purifies skin',
      'Fits easily into a daily hygiene routine',
      'Fresh and clean skin feel',
    ],
    how_to_use: ['Use daily during bath or shower. Rinse with warm water.'],
    caution: 'For external use only.',
    concerns: ['daily-cleansing'],
  },
  {
    id: 11,
    slug: 'salitar-soap',
    name: 'Salitar Soap',
    category: 'soap',
    family: 'Salitar',
    price: 290,
    tagline: 'Daily soap formulated for targeted skin care.',
    overview: 'Salitar Soap is formulated for a simple, targeted daily cleansing routine for problem-prone skin areas.',
    benefits: [
      'Deeply cleanses congested pores',
      'Helps purify tough areas',
      'Suitable for daily targeted use',
    ],
    how_to_use: ['Lather over affected areas. Leave on skin for 1 minute before rinsing thoroughly.'],
    caution: 'For external use only.',
    concerns: ['daily-cleansing', 'acne-prone-skin'],
  },
  {
    id: 12,
    slug: 'scab-ease-soap',
    name: 'Scab Ease Soap',
    category: 'soap',
    family: 'Scab Ease',
    price: 290,
    tagline: 'Daily soap formulated for sensitive, targeted care.',
    overview: 'Scab Ease Soap is formulated for a gentle, everyday cleansing routine providing comfort to sensitive skin.',
    benefits: [
      'Gentle soothing cleansing action',
      'Calms uncomfortable skin feeling',
      'Suitable for regular family hygiene',
    ],
    how_to_use: ['Lather gently over wet skin. Rinse thoroughly with water.'],
    caution: 'For external use only.',
    concerns: ['daily-cleansing'],
  },
];

export async function getAllProducts(): Promise<Product[]> {
  const sortComingSoonFirst = (list: Product[]) => {
    return [...list].sort((a, b) => {
      if (a.is_coming_soon && !b.is_coming_soon) return -1;
      if (!a.is_coming_soon && b.is_coming_soon) return 1;
      return 0;
    });
  };

  if (!isSupabaseConfigured || !supabase) {
    return sortComingSoonFirst(BUNDLED_PRODUCTS);
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return sortComingSoonFirst(BUNDLED_PRODUCTS);
    }

    const mapped: Product[] = data
      .filter((row) => row.name !== 'LACABINE CREAM BTX7 LIFT 50ML')
      .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: row.category,
      subcategory: row.subcategory,
      family: row.family || '',
      price: Number(row.price) || 0,
      tagline: row.tagline || '',
      overview: row.overview || '',
      benefits: Array.isArray(row.benefits) ? row.benefits : [],
      how_to_use: Array.isArray(row.how_to_use) ? row.how_to_use : [],
      caution: row.caution || '',
      concerns: Array.isArray(row.concerns) ? row.concerns : [],
      featured: Boolean(row.featured),
      is_coming_soon: Boolean(row.is_coming_soon),
      image_url: row.image_url || FALLBACK_IMAGES[row.category] || FALLBACK_IMAGES.face,
    }));

    // Coming soon products always come first, then others
    return sortComingSoonFirst(mapped);
  } catch {
    return sortComingSoonFirst(BUNDLED_PRODUCTS);
  }
}

export function getProductBySlug(slug: string, products: Product[] = BUNDLED_PRODUCTS): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: number | string, products: Product[] = BUNDLED_PRODUCTS): Product | undefined {
  return products.find((p) => String(p.id) === String(id));
}

export function getRelatedProducts(currentProduct: Product, products: Product[] = BUNDLED_PRODUCTS, limit = 4): Product[] {
  return products
    .filter((p) => String(p.id) !== String(currentProduct.id) && (p.category === currentProduct.category || p.family === currentProduct.family))
    .slice(0, limit);
}
