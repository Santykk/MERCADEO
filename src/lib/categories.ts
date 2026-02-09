export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  created_at: string;
}

import { supabase } from './supabase';

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching categories: ${error.message}`);
  }

  return data || [];
}
