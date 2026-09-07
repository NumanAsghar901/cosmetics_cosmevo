import { Concern, Category } from './types';

export const FREE_DELIVERY_THRESHOLD = 2000;
export const WA_NUMBER = '923094560316';
export const WA_DISPLAY = '0309 4560316';
export const SUPPORT_EMAIL = 'info@cosmevo.pk';
export const LOCATION_DISPLAY = 'Faisalabad, Pakistan';

export const CATEGORIES: Category[] = [
  { key: 'all', label: 'All' },
  { key: 'face', label: 'Face Care', description: 'Cleansers and targeted face treatments.' },
  { key: 'hair', label: 'Hair Care', description: 'Grow Up anti-hair fall sprays and shampoos.' },
  { key: 'soap', label: 'Soaps', description: 'Dermatological and everyday beauty cleansing bars.' },
];

export const CONCERNS: Concern[] = [
  { key: 'acne-prone-skin', label: 'Acne-Prone Skin' },
  { key: 'brightening', label: 'Brightening' },
  { key: 'hair-fall-care', label: 'Hair Fall Care' },
  { key: 'daily-cleansing', label: 'Daily Cleansing' },
  { key: 'dry-skin-care', label: 'Dry Skin Care' },
  { key: 'baby-care', label: 'Baby Care' },
];

export const FALLBACK_IMAGES: Record<string, string> = {
  face: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=85',
  hair: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=85',
  soap: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?auto=format&fit=crop&w=900&q=85',
};
