import { useEffect, useState } from 'react';
import { ShoppingBag, Search, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import SidebarAdmin from '../components/SidebarAdmin';

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-sky-100 text-sky-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: 'Pendiente', processing: 'En proceso',
  shipped: 'Enviado', delivered: 'Entregado', cancelled: 'Cancelado',
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(*, products(name, image_url)), profiles(full_name, phone)')
      .order('created_at', { ascending: false });
    if (data) setOrders(data as Order[]);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, status: string) => {
    setUpdatingStatus(orderId);
    await supabase.from('orders').update({ status }).eq('id', orderId);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: status as Order['status'] } : o));
    if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: status as Order['status'] } : prev);
    setUpdatingStatus(null);
  };

  const filtered = orders.filter(o =>
    search === '' ||
    o.id.toLowerCase().includes(search.toLowerCase()) ||
    (o.profiles?.full_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} pedidos en total</p>
        </div>

        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por ID o cliente..."
            className="w-full sm:w-80 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Orders list */}
          <div className="lg:col-span-2 space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />)
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <ShoppingBag size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400">No hay pedidos</p>
              </div>
            ) : (
              filtered.map(order => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white rounded-2xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                    selectedOrder?.id === order.id ? 'border-sky-300 shadow-md' : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100">
                        <ShoppingBag size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm">#{order.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-500">{order.profiles?.full_name || 'Cliente'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      <span className="font-extrabold text-gray-900 text-sm">${Number(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(order.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Order detail */}
          <div>
            {selectedOrder ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sticky top-24">
                <h3 className="font-extrabold text-gray-900 mb-1">
                  #{selectedOrder.id.slice(0, 8).toUpperCase()}
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  {new Date(selectedOrder.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>

                {/* Status update */}
                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-600 mb-2">Estado del pedido</label>
                  <div className="relative">
                    <select
                      value={selectedOrder.status}
                      onChange={e => updateStatus(selectedOrder.id, e.target.value)}
                      disabled={updatingStatus === selectedOrder.id}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50 pr-8"
                    >
                      {Object.entries(statusLabels).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Client info */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4">
                  <p className="text-xs font-bold text-gray-600 mb-1">Cliente</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedOrder.profiles?.full_name || 'N/A'}</p>
                  {selectedOrder.profiles?.phone && <p className="text-xs text-gray-500">{selectedOrder.profiles.phone}</p>}
                </div>

                {/* Shipping */}
                {selectedOrder.shipping_address && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4">
                    <p className="text-xs font-bold text-gray-600 mb-1">Dirección de envío</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.city},{' '}
                      {selectedOrder.shipping_address.state} {selectedOrder.shipping_address.zip}
                    </p>
                  </div>
                )}

                {/* Items */}
                <div>
                  <p className="text-xs font-bold text-gray-600 mb-2">Artículos</p>
                  <div className="space-y-2">
                    {selectedOrder.order_items?.map(item => (
                      <div key={item.id} className="flex items-center gap-2">
                        {item.products?.image_url && (
                          <img src={item.products.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">{item.products?.name}</p>
                          <p className="text-xs text-gray-400">x{item.quantity} · ${Number(item.price).toFixed(2)}</p>
                        </div>
                        <span className="text-xs font-bold text-gray-800">${(Number(item.price) * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-100 mt-4 pt-3 flex justify-between">
                  <span className="font-extrabold text-gray-900 text-sm">Total</span>
                  <span className="font-extrabold text-gray-900">${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center sticky top-24">
                <ShoppingBag size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">Selecciona un pedido para ver detalles</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
