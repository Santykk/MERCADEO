import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, Truck, CheckCircle, XCircle, Clock, ChevronLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderItem {
  id: string;
  product_id: string;
  product_title: string;
  product_thumbnail: string;
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Order {
  id: string;
  created_at: string;
  total: number;
  status: OrderStatus;
  shipping_address: ShippingAddress;
  items: OrderItem[];
}

const OrderStatusIcon = ({ status }: { status: OrderStatus }) => {
  const icons = {
    pending: <Clock className="text-yellow-500" />,
    processing: <Package className="text-blue-500" />,
    shipped: <Truck className="text-purple-500" />,
    delivered: <CheckCircle className="text-green-500" />,
    cancelled: <XCircle className="text-red-500" />
  };
  return icons[status] || null;
};

const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total,
          status,
          shipping_address,
          order_items (
            id,
            product_id,
            quantity,
            price,
            products (
              title,
              thumbnail
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        const formattedItems = (data.order_items || []).map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product_title: item.products?.title || '',
          product_thumbnail: item.products?.thumbnail || ''
        }));

        setOrder({
          id: data.id,
          created_at: data.created_at,
          total: data.total,
          status: data.status,
          shipping_address: data.shipping_address,
          items: formattedItems
        });
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <p className="text-gray-700 mb-4">Pedido no encontrado</p>
        <Link to="/orders" className="text-blue-600 hover:underline">Volver a lista de pedidos</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 max-w-5xl mx-auto">
      <button 
        onClick={() => navigate(-1)}
        className="mb-6 text-blue-600 hover:underline flex items-center gap-2"
        aria-label="Volver a lista de pedidos"
      >
        <ChevronLeft /> Volver a Pedidos
      </button>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h1 className="text-xl font-bold mb-4">Detalles Pedido: {order.id}</h1>
        <p className="mb-4 text-sm text-gray-600">
          Fecha de pedido: {new Date(order.created_at).toLocaleString()}
        </p>

        <div className="mb-6">
          <div className="flex items-center mb-4">
            <OrderStatusIcon status={order.status} />
            <span className="ml-2 capitalize text-lg font-medium">{order.status}</span>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Dirección de Envío</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{order.shipping_address.fullName}</p>
              <p>{order.shipping_address.address}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}</p>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold mb-4">Items del Pedido</h2>
        <div className="space-y-4">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-4 border rounded p-3 bg-gray-50">
              <img
                src={item.product_thumbnail}
                alt={item.product_title}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-semibold">{item.product_title}</p>
                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                <p className="text-sm text-gray-600">Precio unitario: {formatPrice(item.price)}</p>
              </div>
              <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xl font-bold">Total: {formatPrice(order.total)}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;