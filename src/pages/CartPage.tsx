import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage: React.FC = () => {
  const { items, itemCount, total, removeFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const shippingCost = total > 50 ? 0 : 5.99;
  const tax = total * 0.08;
  const orderTotal = total + shippingCost + tax;

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }
    
    // Check if coupon is valid (in a real app, this would call an API)
    if (couponCode.toLowerCase() === 'discount10') {
      // Apply discount logic here
      setCouponError('');
      // Success message or discount application would go here
    } else {
      setCouponError('Invalid coupon code');
    }
  };
  
function formatPrice(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2
    }).format(value || 0);
}


  
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Tu carrito de compras</h1>

        {itemCount === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <ShoppingBag size={64} className="text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-6">Parece que aún no has añadido ningún producto a tu carrito.</p>
            <Link 
              to="/" 
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Empezar a comprar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Artículos del carrito ({itemCount})</h2>
                    <button 
                      onClick={clearCart}
                      className="text-gray-500 hover:text-red-600 text-sm flex items-center"
                    >
                      <Trash2 size={16} className="mr-1" />
                     Limpiar carrito
                    </button>
                  </div>
                </div>

                {/* Cart item list */}
                <div>
                  {items.map((item) => {
                    const discountedPrice = item.product.discountPercentage
                      ? item.product.price * (1 - item.product.discountPercentage / 100)
                      : item.product.price;
                    
                    return (
                      <div key={item.product.id} className="p-6 border-b border-gray-200 flex flex-col sm:flex-row">
                        <div className="sm:w-24 h-24 bg-gray-100 rounded overflow-hidden mb-4 sm:mb-0">
                          <img 
                            src={item.product.thumbnail} 
                            alt={item.product.title} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 sm:ml-6">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-gray-800 font-medium mb-1">
                                <Link to={`/product/${item.product.id}`} className="hover:text-blue-600">
                                  {item.product.title}
                                </Link>
                              </h3>
                              <p className="text-gray-500 text-sm mb-2">{item.product.brand}</p>
                            </div>
                            <button 
                              onClick={() => handleRemoveItem(item.product.id)}
                              className="text-gray-400 hover:text-red-600"
                              aria-label="Remove item"
                            >
                              <X size={18} />
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center mt-4">
                            <div className="flex items-center">
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l"
                                disabled={item.quantity <= 1}
                              >
                                -
                              </button>
                              <span className="w-10 h-8 flex items-center justify-center border-t border-b border-gray-300">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r"
                              >
                                +
                              </button>
                            </div>
                            
                            <div className="text-right">
                              {item.product.discountPercentage ? (
                                <div>
                                  <span className="text-lg font-semibold">{formatPrice(discountedPrice * item.quantity)}</span>
                                  <span className="text-sm text-gray-500 line-through ml-2">
                                    ${(item.product.price * item.quantity).formatearCOP}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-lg font-semibold">
                                  {formatPrice(item.product.price * item.quantity)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-24">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Envío</span>
                      <span>
                        {shippingCost === 0 ? (
                          <span className="text-green-600">Gratis</span>
                        ) : (
                          `${formatPrice(shippingCost)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Impuesto estimado</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    {total > 50 && (
                      <div className="flex justify-between text-green-600 text-sm">
                        <span>Envío gratuito aplicado</span>
                        <span>-$..</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3 mb-6">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(orderTotal)}</span>
                    </div>
                  </div>
                  
                  <form onSubmit={handleApplyCoupon} className="mb-6">
                    <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                      Código promocional
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="coupon"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="flex-1 border border-gray-300 rounded-l px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="bg-gray-800 text-white px-4 py-2 rounded-r hover:bg-gray-700 transition-colors"
                      >
                        Aplicar
                      </button>
                    </div>
                    {couponError && <p className="text-red-600 text-sm mt-1">{couponError}</p>}
                  </form>
                  
                  {isAuthenticated ? (
                    <Link
                      to="/checkout"
                      className="block w-full bg-blue-600 text-white text-center font-medium py-3 rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Pasar por la caja <ArrowRight size={16} className="inline ml-1" />
                    </Link>
                  ) : (
                    <div>
                      <Link
                        to="/login"
                        className="block w-full bg-blue-600 text-white text-center font-medium py-3 rounded-md hover:bg-blue-700 transition-colors mb-3"
                      >
                        Iniciar sesión para paga
                      </Link>
                      <p className="text-sm text-gray-500 text-center">
                        o <Link to="/checkout" className="text-blue-600 hover:underline">Continuar como invitado</Link>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;