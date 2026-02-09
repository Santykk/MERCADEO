  import React from 'react';
  import { Link } from 'react-router-dom';
  import { ShoppingCart, Heart, Star } from 'lucide-react';
  import { Product } from '../../types';
  import { useCart } from '../../context/CartContext';
  import { useWishlist } from '../../context/WishlistContext';
  import toast from 'react-hot-toast';
  
  interface ProductCardProps {
    product: Product;
  }
  
  const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [isHovered, setIsHovered] = React.useState(false);
    
    // Calcular el precio con descuento
    const discountedPrice = product.discount_percentage
      ? product.price * (1 - product.discount_percentage / 100)
      : null;
  
    const isProductInWishlist = isInWishlist(product.id);
  
    const handleAddToCart = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addToCart(product);
      toast.success('Producto agregado al carrito');
    };
  
    const handleWishlistToggle = async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (isProductInWishlist) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product);
      }
    };
    
    // Formatear el precio
    function formatPrice(price: number) {
      return new Intl.NumberFormat("es-CO", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price).replace(/\u00A0/g, "");
    }
    
    return (
      <div 
        className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl transform hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/product/${product.id}`} className="block">
          <div className="relative h-64 overflow-hidden">
            <img 
              src={product.thumbnail} 
              alt={product.title} 
              className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
            {product.discount_percentage && product.discount_percentage > 0 && (
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                {Math.round(product.discount_percentage)}% OFF
              </div>
            )}
            <button
              onClick={handleAddToCart}
              className={`absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-all duration-300 ${
                isHovered ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}
              aria-label="Add to cart"
            >
              <ShoppingCart size={16} />
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`absolute bottom-2 left-2 p-2 rounded-full transition-all duration-300 ${
                isProductInWishlist 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } ${
                isHovered ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
              }`}
              aria-label={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={16} className={isProductInWishlist ? 'fill-current' : ''} />
            </button>
          </div>
          
          <div className="p-4">
            <h3 className="text-gray-800 font-semibold text-lg mb-1 truncate">{product.title}</h3>
            
            <div className="flex items-center mb-2">
              <div className="flex items-center text-yellow-500">
                <Star size={16} fill="currentColor" />
                <span className="ml-1 text-sm font-medium">{product.rating}</span>
              </div>
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-sm text-gray-500">{product.brand}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                {discountedPrice ? (
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-gray-900">${formatPrice(discountedPrice)}</span>
                    <span className="ml-2 text-sm text-gray-500 line-through">${formatPrice(product.price)}</span>
                  </div>
                ) : (
                  <span className="text-xl font-bold text-gray-900">${formatPrice(product.price)}</span>
                )}
              </div>
              
              <span className={`text-xs font-medium ${product.stock > 10 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 10 ? 'Disponible' : `Solo quedan ${product.stock}`}
              </span>
            </div>
          </div>
        </Link>
      </div>
    );
  };
  
  export default ProductCard;
