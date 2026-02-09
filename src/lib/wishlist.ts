// wishlist.ts
import { supabase } from './supabase';
import { Product } from '../types';

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

// Get wishlist items for authenticated user
export async function getWishlistItems(): Promise<WishlistItem[]> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select(`
      *,
      product:products (*)
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Error fetching wishlist: ${error.message}`);
  }

  return data || [];
}

// Add item to wishlist
export async function addToWishlist(productId: string): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('wishlists')
    .insert({
      product_id: productId,
      user_id: user.id
    });

  if (error) {
    throw new Error(`Error adding to wishlist: ${error.message}`);
  }
}

// Remove item from wishlist
export async function removeFromWishlist(productId: string): Promise<void> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('product_id', productId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Error removing from wishlist: ${error.message}`);
  }
}

// Check if product is in wishlist
export async function isInWishlist(productId: string): Promise<boolean> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return false;
  }

  const { data, error } = await supabase
    .from('wishlists')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Error checking wishlist: ${error.message}`);
  }

  return !!data;
}

// Sync localStorage wishlist to database when user logs in
export async function syncWishlistToDatabase(localWishlist: string[]): Promise<void> {
  if (localWishlist.length === 0) return;

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const wishlistItems = localWishlist.map(productId => ({
    product_id: productId,
    user_id: user.id
  }));

  const { error } = await supabase
    .from('wishlists')
    .upsert(wishlistItems, {
      onConflict: 'user_id,product_id',
      ignoreDuplicates: true
    });

  if (error) {
    console.error('Error syncing wishlist to database:', error);
  }
}
