import { useEffect, useState } from 'react';
import {
  Package,
  ShoppingBag,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
} from 'lucide-react';
import api from '../../utils/api';
import SidebarAdmin from '../../components/SidebarAdmin';
import { formatPrice, formatDate } from '../../utils/format';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total_products: 0,
    total_orders: 0,
    total_users: 0,
    total_revenue: 0,
    recent_orders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Productos',
      value: stats.total_products,
      icon: Package,
      color: 'bg-sky-50 text-sky-600',
      change: 'Total en catálogo',
    },
    {
      label: 'Pedidos',
      value: stats.total_orders,
      icon: ShoppingBag,
      color: 'bg-orange-50 text-orange-600',
      change: 'Total histórico',
    },
    {
      label: 'Clientes',
      value: stats.total_users,
      icon: Users,
      color: 'bg-green-50 text-green-600',
      change: 'Registrados',
    },
    {
      label: 'Ingresos',
      value: formatPrice(stats.total_revenue),
      icon: DollarSign,
      color: 'bg-amber-50 text-amber-600',
      change: 'Total vendido',
    },
  ];

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    shipped: 'bg-sky-100 text-sky-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const statusLabels = {
    pending: 'Pendiente',
    processing: 'En proceso',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen de tu tienda</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map(({ label, value, icon: Icon, color, change }) => (
            <div
              key={label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}
                >
                  <Icon size={22} />
                </div>
                <TrendingUp size={14} className="text-green-500" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900 mb-1">
                {loading ? (
                  <span className="w-16 h-7 bg-gray-100 rounded animate-pulse inline-block" />
                ) : (
                  value
                )}
              </p>
              <p className="text-sm font-bold text-gray-600">{label}</p>
              <p className="text-xs text-gray-400 mt-1">{change}</p>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gray-400" />
              <h2 className="font-extrabold text-gray-900">Pedidos recientes</h2>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : stats.recent_orders.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
              <p>Aún no hay pedidos</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      <ShoppingBag size={16} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(order.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                        statusColors[order.status]
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                    <span className="font-extrabold text-gray-900 text-sm">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
