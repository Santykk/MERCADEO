import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { useAuth } from './AuthContext';
import { 
  getWishlistItems, 
  addToWishlist as addToWishlistDB, 
  removeFromWishlist as removeFromWishlistDB,
  syncWishlistToDatabase,
  WishlistItem
} from '../lib/wishlist';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlist: Product[];
  wishlistIds: Set<string>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'mercadoapp_wishlist';

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Load wishlist from localStorage
  const loadLocalWishlist = (): string[] => {
    try {
      const stored = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading wishlist from localStorage:', error);
      return [];
    }
  };

  // Save wishlist to localStorage
  const saveLocalWishlist = (productIds: string[]) => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(productIds));
    } catch (error) {
      console.error('Error saving wishlist to localStorage:', error);
    }
  };

  // Load wishlist from database for authenticated users
  const loadDatabaseWishlist = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const items = await getWishlistItems();
      const products = items
        .filter(item => item.product)
        .map(item => item.product as Product);
      
      setWishlist(products);
      setWishlistIds(new Set(products.map(p => p.id)));
    } catch (error) {
      console.error('Error loading wishlist from database:', error);
      toast.error('Error cargando lista de deseos');
    } finally {
      setLoading(false);
    }
  };

  // Sync localStorage to database when user logs in
  const syncLocalToDatabase = async () => {
    if (!isAuthenticated) return;

    const localWishlist = loadLocalWishlist();
    if (localWishlist.length > 0) {
      try {
        await syncWishlistToDatabase(localWishlist);
        // Clear localStorage after successful sync
        localStorage.removeItem(WISHLIST_STORAGE_KEY);
        // Reload from database to get the synced data
        await loadDatabaseWishlist();
        toast.success('Lista de deseos sincronizada');
      } catch (error) {
        console.error('Error syncing wishlist:', error);
      }
    }
  };

  // Load wishlist on component mount and auth state change
  useEffect(() => {
    if (isAuthenticated) {
      // First sync any local wishlist, then load from database
      syncLocalToDatabase();
    } else {
      // Load from localStorage for non-authenticated users
      const localWishlist = loadLocalWishlist();
      setWishlistIds(new Set(localWishlist));
      setWishlist([]); // We don't have product details in localStorage
    }
  }, [isAuthenticated]);

  const addToWishlist = async (product: Product) => {
    try {
      if (isAuthenticated) {
        // Add to database
        await addToWishlistDB(product.id);
        setWishlist(prev => [...prev, product]);
        setWishlistIds(prev => new Set([...prev, product.id]));
        toast.success('Producto agregado a la lista de deseos');
      } else {
        // Add to localStorage
        const localWishlist = loadLocalWishlist();
        if (!localWishlist.includes(product.id)) {
          const updatedWishlist = [...localWishlist, product.id];
          saveLocalWishlist(updatedWishlist);
          setWishlistIds(new Set(updatedWishlist));
          toast.success('Producto agregado a la lista de deseos');
        }
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Error agregando a la lista de deseos');
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      if (isAuthenticated) {
        // Remove from database
        await removeFromWishlistDB(productId);
        setWishlist(prev => prev.filter(p => p.id !== productId));
        setWishlistIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success('Producto eliminado de la lista de deseos');
      } else {
        // Remove from localStorage
        const localWishlist = loadLocalWishlist();
        const updatedWishlist = localWishlist.filter(id => id !== productId);
        saveLocalWishlist(updatedWishlist);
        setWishlistIds(new Set(updatedWishlist));
        toast.success('Producto eliminado de la lista de deseos');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Error eliminando de la lista de deseos');
    }
  };

  const isInWishlist = (productId: string): boolean => {
    return wishlistIds.has(productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistIds,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        loading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
