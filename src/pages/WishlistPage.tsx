import React, { useEffect, useState } from 'react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import toast from 'react-hot-toast';

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 2,
  }).format(value);
}

const WishlistPage: React.FC = () => {
  const { wishlist, wishlistIds, removeFromWishlist, loading } = useWishlist();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load product details for localStorage wishlist items
  useEffect(() => {
    const loadLocalProducts = async () => {
      if (isAuthenticated || wishlistIds.size === 0) return;

      setLoadingProducts(true);
      try {
        const productIds = Array.from(wishlistIds);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (error) throw error;
        setLocalProducts(data || []);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Error cargando productos de la lista de deseos');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadLocalProducts();
  }, [wishlistIds, isAuthenticated]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success('Producto agregado al carrito');
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    await removeFromWishlist(productId);
  };

  // Get the products to display
  const productsToShow = isAuthenticated ? wishlist : localProducts;
  const isLoading = loading || loadingProducts;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (productsToShow.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <Heart size={64} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu lista de deseos está vacía</h2>
          <p className="text-gray-500 mb-6">
            Explora nuestros productos y agrega tus favoritos a la lista de deseos
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <ShoppingBag className="mr-2" size={20} />
            Ir a la tienda
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mi Lista de Deseos</h1>
          <div className="text-sm text-gray-500">
            {productsToShow.length} {productsToShow.length === 1 ? 'producto' : 'productos'}
          </div>
        </div>

        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Nota:</strong> Tu lista de deseos se guarda temporalmente. 
              <Link to="/login" className="underline hover:text-blue-900 ml-1">
                Inicia sesión
              </Link> para guardarla permanentemente.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {productsToShow.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <Link to={`/product/${product.id}`} className="block">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={product.thumbnail} 
                    alt={product.title} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </Link>
              
              <div className="p-4">
                <Link to={`/product/${product.id}`}>
                  <h3 className="font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors line-clamp-2">
                    {product.title}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between mb-3">
                  <div>
                    {product.discountPercentage ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">
                          {formatPrice(product.price * (1 - product.discountPercentage / 100))}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  
                  {product.brand && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {product.brand}
                    </span>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium inline-flex items-center justify-center"
                    disabled={product.stock <= 0}
                  >
                    <ShoppingBag className="mr-1" size={16} />
                    {product.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
                  </button>
                  
                  <button
                    onClick={() => handleRemoveFromWishlist(product.id)}
                    className="bg-red-600 text-white px-3 py-2 rounded-md hover:bg-red-700 transition-colors"
                    aria-label="Eliminar de la lista de deseos"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;