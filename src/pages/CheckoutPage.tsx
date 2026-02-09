import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../lib/orders';
import toast from 'react-hot-toast';

interface ShippingForm {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

const CheckoutPage: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingForm>({
    fullName: user?.user_metadata?.full_name || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
  });

  const shippingCost = total > 50 ? 0 : 5.99;
  const tax = total * 0.08;
  const orderTotal = total + shippingCost + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create the order
      await createOrder(items, shippingInfo, orderTotal);
      
      // Clear the cart
      clearCart();
      
      // Show success message
      toast.success('Order placed successfully!');
      
      // Redirect to orders page
      navigate('/orders');
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
          <button
            onClick={() => navigate('/')}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continuar comprando
          </button>
        </div>
      </div>
    );
  }


  function formatPrice(value) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 2
    }).format(value || 0);
}
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Verificar</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shipping Form */}
            <div className="md:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Información de envío</h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                        Nombre completo
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={shippingInfo.fullName}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                        Dirección
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={shippingInfo.address}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={shippingInfo.city}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                          Barrio
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={shippingInfo.state}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                          Codigo postal
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={shippingInfo.zipCode}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                          Pais
                        </label>
                        <input
                          type="text"
                          id="country"
                          name="country"
                          value={shippingInfo.country}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Número de teléfono
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={shippingInfo.phone}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Información de pago</h2>
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex items-center text-blue-700">
                        <CreditCard className="mr-2" size={20} />
                        <span>El pago se gestionará de forma segura mediante Stripe.</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Finalizar pedido'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-lg font-semibold mb-4">Resumen del pedido</h2>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm">
                      <span>{item.product.title} × {item.quantity}</span>
                      <span>{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  ))}

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>Envío</span>
                      <span>{shippingCost === 0 ? 'Free' : `${formatPrice(shippingCost)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span>Impuesto</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg mt-4">
                      <span>Total</span>
                      <span>{formatPrice(orderTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Truck className="mr-2" size={18} />
                    <span>Envío gratuito en pedidos superiores a $50</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <ShieldCheck className="mr-2" size={18} />
                    <span>Caja segura impulsada por Stripe</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;