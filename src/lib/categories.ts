import { createClient } from '@supabase/supabase-js';
import { DbCategory, DbSubcategory } from './types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: {
    fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }),
  },
});

// Fetch all categories including their subcategories
export async function getAllCategories(): Promise<DbCategory[]> {
  
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return categories as DbCategory[];
  } catch (err) {
    console.error('Error in getAllCategories:', err);
    return [];
  }
}

export async function getAllSubcategories(): Promise<DbSubcategory[]> {
  try {
    const { data: subcategories, error } = await supabase
      .from('subcategories')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching subcategories:', error);
      return [];
    }

    return subcategories as DbSubcategory[];
  } catch (err) {
    console.error('Error in getAllSubcategories:', err);
    return [];
  }
}
