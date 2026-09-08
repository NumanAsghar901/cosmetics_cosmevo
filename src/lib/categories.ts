import { createClient } from '@supabase/supabase-js';
import { DbCategory, DbSubcategory } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Fetch all categories including their subcategories
export async function getAllCategories(): Promise<DbCategory[]> {
  if (!supabaseUrl) return [];
  
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
  if (!supabaseUrl) return [];
  
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
