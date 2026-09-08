import { Concern, Category } from './types';

export const FREE_DELIVERY_THRESHOLD = 2500;
export const WA_NUMBER = '923094560316';
export const WA_DISPLAY = '0309 4560316';
export const SUPPORT_EMAIL = 'info@cosmevo.pk';
export const LOCATION_DISPLAY = 'Faisalabad, Pakistan';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zjfdehrctocdvmpczknj.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_xS_DqV5db2Vo7AzrnY9b7w_YFNtJcMD';
export const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'kj5rzhaj';
export const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'cosmevo_products';

export const PROVINCES = [
  'Punjab',
  'Sindh',
  'KPK',
  'Balochistan',
  'Kashmir',
] as const;

export type Province = (typeof PROVINCES)[number];

export const DELIVERY_RATES: Record<string, number> = {
  Punjab: 300,
  default: 400,
};

export const FALLBACK_IMAGES: Record<string, string> = {
  face: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85',
  hair: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85',
  soap: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=900&q=85',
};

