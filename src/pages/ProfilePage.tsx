import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Phone, User, Settings, ShoppingBag, CreditCard,
  Bell, Shield, LogOut, PlusCircle, Edit, Save, X,
  Check, Globe, Palette, Trash2, AlertTriangle, ChevronRight,
  Package, Clock, Truck, CheckCircle, XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getUserSettings, updateUserSettings, enable2FA, disable2FA, deleteUserAccount, UserSettings } from '../lib/userSettings';
import { getOrders, Order } from '../lib/orders';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, userRole, logout, resetPassword } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const [editForm, setEditForm] = useState({
    fullName: user?.user_metadata?.full_name || '',
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (!user) return;
      setSettingsLoading(true);
      try {
        const userSettings = await getUserSettings();
        if (userSettings) setSettings(userSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setSettingsLoading(false);
      }
    };
    loadSettings();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'orders' && user) {
      loadOrders();
    }
  }, [activeTab, user]);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setOrdersLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-sm border border-gray-100">
          <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-blue-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Acceso requerido</h2>
          <p className="text-gray-500 mb-6">Por favor, inicia sesión para gestionar tu perfil.</p>
          <Link to="/login" className="block w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-md shadow-blue-100">
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  const fullName = user.user_metadata?.full_name || 'Usuario';
  const email = user.email || '';
  const isAdmin = userRole === 'admin';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock size={16} className="text-yellow-500" />;
      case 'processing':
        return <Package size={16} className="text-blue-500" />;
      case 'shipped':
        return <Truck size={16} className="text-purple-500" />;
      case 'delivered':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value || 0);
  };

  const handleEditProfile = async () => {
    if (!isEditing) {
      setIsEditing(true);
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: editForm.fullName },
      });
      if (updateError) throw updateError;
      const { error: profileError } = await supabase.from('profiles').update({ full_name: editForm.fullName }).eq('id', user.id);
      if (profileError) throw profileError;
      toast.success('Perfil actualizado');
      setIsEditing(false);
    } catch (error) {
      toast.error('Error al actualizar');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Mi Perfil', icon: User },
    { id: 'orders', label: 'Mis Pedidos', icon: ShoppingBag },
    ...(isAdmin ? [{ id: 'admin-panel', label: 'Panel de Control', icon: Settings }] : []),
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-12 transition-colors">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR NAVIGATION */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-8">
              <div className="p-4 text-center mb-4">
                <div className="w-20 h-20 rounded-full mx-auto mb-3 bg-blue-50 flex items-center justify-center border-4 border-white shadow-sm overflow-hidden text-blue-600">
                   {user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                   ) : <User size={40} />}
                </div>
                <h3 className="font-bold text-gray-800 truncate">{fullName}</h3>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-tighter mt-1">
                  {isAdmin ? '🛡️ Administrador' : 'Cliente'}
                </p>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                      activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <tab.icon size={18} />
                      {tab.label}
                    </div>
                    {activeTab === tab.id && <ChevronRight size={14} />}
                  </button>
                ))}
                <div className="pt-4 mt-4 border-t border-gray-50">
                  <button onClick={logout} className="w-full flex items-center px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-colors text-sm font-semibold">
                    <LogOut size={18} className="mr-3" /> Cerrar sesión
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[550px]">
              
              {/* PERFIL */}
              {activeTab === 'profile' && (
                <div className="animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Datos Personales</h2>
                      <p className="text-gray-500 text-sm">Información básica de tu cuenta.</p>
                    </div>
                    <button
                      onClick={handleEditProfile}
                      className={`flex items-center px-5 py-2.5 rounded-xl font-bold transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {isEditing ? <><Save size={18} className="mr-2"/> Guardar</> : <><Edit size={18} className="mr-2"/> Editar</>}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Nombre Completo</label>
                        <input
                          type="text"
                          readOnly={!isEditing}
                          value={isEditing ? editForm.fullName : fullName}
                          onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                          className={`w-full px-4 py-3 rounded-xl border transition-all ${isEditing ? 'border-blue-400 ring-4 ring-blue-50 bg-white' : 'border-gray-50 bg-gray-50 text-gray-500'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase ml-1">Email</label>
                        <input type="text" readOnly value={email} className="w-full px-4 py-3 rounded-xl border border-gray-50 bg-gray-50 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* MIS PEDIDOS */}
              {activeTab === 'orders' && (
                <div className="animate-in fade-in duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Mis Pedidos</h2>
                    <p className="text-gray-500 text-sm">Historial y detalles de tus compras.</p>
                  </div>

                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package size={48} className="mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">No hay pedidos</h3>
                      <p className="text-gray-500 mb-6">Aún no has realizado ningún pedido.</p>
                      <Link to="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                        Empezar a comprar
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all">
                          {/* RESUMEN COMPRIMIDO */}
                          <button
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                            className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1 text-left">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                                <Package size={24} className="text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold text-gray-800">Pedido #{order.id.slice(0, 8).toUpperCase()}</h3>
                                  <span className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                                    {getStatusIcon(order.status)}
                                    {order.status === 'pending' && 'Pendiente'}
                                    {order.status === 'processing' && 'Procesando'}
                                    {order.status === 'shipped' && 'Enviado'}
                                    {order.status === 'delivered' && 'Entregado'}
                                    {order.status === 'cancelled' && 'Cancelado'}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500">
                                  {new Date(order.created_at).toLocaleDateString('es-CO')} · {order.items?.length || 0} artículo{order.items?.length !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-800">{formatPrice(order.total)}</p>
                              <ChevronRight size={20} className={`text-gray-400 transition-transform ${expandedOrder === order.id ? 'rotate-90' : ''}`} />
                            </div>
                          </button>

                          {/* DETALLES EXPANDIDOS */}
                          {expandedOrder === order.id && (
                            <div className="border-t border-gray-200 bg-gray-50 p-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div>
                                <h4 className="font-semibold text-gray-700 mb-3">Artículos</h4>
                                <div className="space-y-3">
                                  {order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-start bg-white p-3 rounded-lg">
                                      {item.product?.thumbnail && (
                                        <img
                                          src={item.product.thumbnail}
                                          alt={item.product?.title}
                                          className="w-16 h-16 object-cover rounded-lg"
                                        />
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <h5 className="font-semibold text-gray-800 text-sm truncate">{item.product?.title}</h5>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {item.quantity}x {formatPrice(item.price)}
                                        </p>
                                      </div>
                                      <p className="font-semibold text-gray-800 whitespace-nowrap">
                                        {formatPrice(item.quantity * item.price)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="pt-4 border-t border-gray-200">
                                <h4 className="font-semibold text-gray-700 mb-3">Dirección de envío</h4>
                                <p className="text-sm text-gray-700">
                                  <span className="font-semibold">{order.shipping_address?.fullName}</span><br/>
                                  {order.shipping_address?.address}<br/>
                                  {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.zipCode}<br/>
                                  <span className="text-gray-500">{order.shipping_address?.country}</span>
                                </p>
                                {order.shipping_address?.phone && (
                                  <p className="text-sm text-gray-600 mt-2">{order.shipping_address.phone}</p>
                                )}
                              </div>

                              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                                <p className="text-gray-600">Total:</p>
                                <p className="text-xl font-bold text-gray-800">{formatPrice(order.total)}</p>
                              </div>

                              <Link
                                to={`/order/${order.id}`}
                                className="block w-full text-center bg-blue-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                              >
                                Ver detalles completos
                              </Link>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PANEL DE CONTROL (REDIRECCIONES) */}
              {activeTab === 'admin-panel' && isAdmin && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
                    <p className="text-gray-500 text-sm">Accesos directos para la gestión del catálogo.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PlusCircle size={28} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">Nuevo Producto</h4>
                      <p className="text-gray-500 text-sm mb-6">Crea un nuevo artículo con imágenes, descripción y precio.</p>
                      <Link to="/admin/create-product" className="block text-center w-full px-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
                        Crear Producto
                      </Link>
                    </div>

                    <div className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Edit size={28} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">Editar Catálogo</h4>
                      <p className="text-gray-500 text-sm mb-6">Modifica existencias, precios o detalles de productos actuales.</p>
                      <Link to="/admin/edit-product" className="block text-center w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                        Ver Inventario
                      </Link>
                    </div>

                    <div className="md:col-span-2 flex items-center justify-between p-6 bg-blue-50 rounded-2xl border border-blue-100">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><ShoppingBag /></div>
                        <div>
                          <h4 className="font-bold text-gray-800">Órdenes de Clientes</h4>
                          <p className="text-xs text-gray-500">Gestiona envíos y estados de compra.</p>
                        </div>
                      </div>
                      <Link to="/admin/orders" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-200">
                        Ver Pedidos
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* SEGURIDAD */}
              {activeTab === 'security' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Seguridad</h2>
                  <div className="p-6 border border-gray-100 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-blue-50 p-3 rounded-xl text-blue-600"><Shield size={24}/></div>
                      <div>
                        <h4 className="font-bold text-gray-800">Contraseña y 2FA</h4>
                        <p className="text-sm text-gray-500">Mantén tu cuenta protegida.</p>
                      </div>
                    </div>
                    <button onClick={handleEditProfile} className="text-sm font-bold text-blue-600 hover:underline">Gestionar</button>
                  </div>

                  <div className="p-6 border border-red-50 bg-red-50/20 rounded-2xl mt-12">
                    <h4 className="text-red-600 font-bold mb-1 flex items-center gap-2">
                      <AlertTriangle size={18}/> Zona de Peligro
                    </h4>
                    <p className="text-sm text-red-500/80 mb-4">Borrar tu cuenta eliminará todos tus datos permanentemente.</p>
                    <button onClick={() => setShowDeleteModal(true)} className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-red-100">
                      Eliminar Cuenta
                    </button>
                  </div>
                </div>
              )}

              {/* AJUSTES */}
              {activeTab === 'settings' && (
                <div className="animate-in fade-in duration-500 space-y-8">
                  <h2 className="text-2xl font-bold text-gray-800">Ajustes</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="flex items-center font-bold text-gray-700 uppercase text-xs tracking-widest"><Palette size={14} className="mr-2"/> Apariencia</h4>
                      <div className="p-4 bg-gray-50 rounded-2xl flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600">Tema</span>
                        <select className="bg-white border-none text-sm font-bold rounded-lg shadow-sm">
                          <option>Modo Claro</option>
                          <option disabled>Modo Oscuro (Próximamente)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE ELIMINACIÓN */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={30} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">¿Confirmas la eliminación?</h3>
            <p className="text-gray-500 text-center text-sm mb-6">Esta acción no se puede deshacer. Escribe <span className="font-bold text-red-600">ELIMINAR</span> para continuar.</p>
            <input 
              type="text" 
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 focus:border-red-500 outline-none text-center font-bold mb-4"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50">Cancelar</button>
              <button 
                disabled={deleteConfirmation !== 'ELIMINAR'}
                className="flex-1 py-3 rounded-xl font-bold bg-red-600 text-white disabled:opacity-20 transition-opacity shadow-lg shadow-red-100"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;