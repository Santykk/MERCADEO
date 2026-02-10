import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Phone, User, Settings, ShoppingBag, CreditCard,
  Bell, Shield, LogOut, PlusCircle, Edit, Save, X,
  Check, Globe, Palette, Trash2, AlertTriangle, ChevronRight,
  Package, Clock, Truck, CheckCircle, XCircle, LayoutGrid
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getUserSettings, UserSettings } from '../lib/userSettings';
import { getOrders, Order } from '../lib/orders';
import toast from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { user, userRole, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
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
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
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
              </nav>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[550px]">
              
              {/* TAB: PROFILE */}
              {activeTab === 'profile' && (
                <div className="animate-in fade-in duration-500">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">Datos Personales</h2>
                      <p className="text-gray-500 text-sm">Información básica de tu cuenta.</p>
                    </div>
                    <button
                      onClick={handleEditProfile}
                      disabled={loading}
                      className={`flex items-center px-5 py-2.5 rounded-xl font-bold transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {isEditing ? <><Save size={18} className="mr-2"/> {loading ? 'Guardando...' : 'Guardar'}</> : <><Edit size={18} className="mr-2"/> Editar</>}
                    </button>
                  </div>
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
              )}

              {/* TAB: ADMIN PANEL */}
              {activeTab === 'admin-panel' && isAdmin && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Panel de Control</h2>
                    <p className="text-gray-500 text-sm">Gestión administrativa del catálogo y operaciones.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Opción: Productos */}
                    <div className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all bg-white">
                      <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PlusCircle size={28} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">Productos</h4>
                      <p className="text-gray-500 text-sm mb-6">Añade nuevos artículos al catálogo.</p>
                      <Link to="/admin/create-product" className="block text-center w-full px-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
                        Crear Nuevo
                      </Link>
                    </div>

                    {/* Opción: Categorías (NUEVA) */}
                    <div className="group p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-50 transition-all bg-white">
                      <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <LayoutGrid size={28} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">Categorías</h4>
                      <p className="text-gray-500 text-sm mb-6">Organiza y gestiona las secciones.</p>
                      <Link to="/admin/categories" className="block text-center w-full px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">
                        Gestionar
                      </Link>
                    </div>

                    {/* Opción: Inventario */}
                    <div className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all bg-white">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Edit size={28} />
                      </div>
                      <h4 className="text-lg font-bold text-gray-800 mb-1">Inventario</h4>
                      <p className="text-gray-500 text-sm mb-6">Edita precios y existencias actuales.</p>
                      <Link to="/admin/edit-product" className="block text-center w-full px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">
                        Ver Lista
                      </Link>
                    </div>

                    {/* Banner de Órdenes */}
                    <div className="md:col-span-3 flex items-center justify-between p-6 bg-blue-50 rounded-2xl border border-blue-100 mt-2">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><ShoppingBag /></div>
                        <div>
                          <h4 className="font-bold text-gray-800">Gestión de Pedidos</h4>
                          <p className="text-xs text-gray-500">Controla envíos y estados de compra.</p>
                        </div>
                      </div>
                      <Link to="/admin/orders" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-200">
                        Ver Pedidos
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* OTROS TABS (Seguridad, Ajustes, etc.) se mantienen igual... */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;