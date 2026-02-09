import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Truck, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';
import { Order, getOrders } from '../lib/orders';
import { useAuth } from '../context/AuthContext';

const OrderStatusIcon = ({ status }: { status: Order['status'] }) => {
  switch (status) {
    case 'pending':
      return <Clock className="text-yellow-500" />;
    case 'processing':
      return <Package className="text-blue-500" />;
    case 'shipped':
      return <Truck className="text-purple-500" />;
    case 'delivered':
      return <CheckCircle className="text-green-500" />;
    case 'cancelled':
      return <XCircle className="text-red-500" />;
    default:
      return null;
  }
};

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userRole } = useAuth();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (err) {
        setError('Error al cargar los pedidos');
        console.error('Error loading orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userRole === 'admin') {
      loadOrders();
    }
  }, [userRole]);

  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900">Acceso denegado</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  function formatPrice(value: number) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-8">Vista de Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">Aún no hay pedidos</h2>
            <p className="text-gray-500 mb-6">Parece que aún no se han realizado pedidos.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold mb-4">Detalles del Pedido</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Pedido realizado</p>
                      <p className="font-medium">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total</p>
                      <p className="font-medium">{formatPrice(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">ID de pedido</p>
                      <p className="font-medium text-xs">{order.id}</p>
                    </div>
                    <div className="flex items-center">
                      <OrderStatusIcon status={order.status} />
                      <span className="ml-2 capitalize">{order.status}</span>
                    </div>
                  </div>

                  {/* Customer Email */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center">
                      <Mail className="text-blue-600 mr-2" size={16} />
                      <span className="text-sm text-gray-600">Cliente:</span>
                      <span className="ml-2 font-medium text-blue-800">{order.user_email || 'Email no disponible'}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">Artículos</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center border-b border-gray-300 pb-2 mb-2">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                          <img
                            src={item.product?.thumbnail}
                            alt={item.product?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium">{item.product?.title}</h3>
                          <p className="text-sm text-gray-500">
                            Cantidad: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <Link
                          to={`/product/${item.product_id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-gray-50">
                  <h3 className="text-lg font-semibold mb-2">Dirección de envío</h3>
                  <p className="text-sm text-gray-500">
                    {order.shipping_address.fullName}, {order.shipping_address.address}, {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
                  </p>
                  <div className="mt-4">
                    <Link
                      to={`/order/${order.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Ver detalles del pedido
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;