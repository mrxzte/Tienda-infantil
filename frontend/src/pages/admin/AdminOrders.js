import { useEffect, useState } from 'react';
import { ShoppingBag, Eye } from 'lucide-react';
import api from '../../utils/api';
import SidebarAdmin from '../../components/SidebarAdmin';
import Modal from '../../components/Modal';
import { formatPrice, formatDate } from '../../utils/format';

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

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setSelectedOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status?status=${newStatus}`);
      await fetchOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (error) {
      alert('Error al actualizar el estado');
      console.error('Error updating status:', error);
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Pedidos</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los pedidos de la tienda</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                filter === status
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {status === 'all' ? 'Todos' : statusLabels[status]}
              {status !== 'all' && (
                <span className="ml-2 text-xs opacity-75">
                  ({orders.filter((o) => o.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Orders table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <ShoppingBag size={48} className="mx-auto mb-3 opacity-30" />
              <p>
                No hay pedidos {filter !== 'all' ? `con estado "${statusLabels[filter]}"` : ''}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      ID
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Fecha
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Total
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Método
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Estado
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <p className="font-bold text-gray-900 text-sm font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-900 text-sm">
                        {formatPrice(order.total)}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 capitalize">
                        {order.payment_info?.method || '-'}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer ${statusColors[order.status]}`}
                        >
                          {Object.keys(statusLabels).map((s) => (
                            <option key={s} value={s}>
                              {statusLabels[s]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order detail modal */}
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={selectedOrder ? `Pedido #${selectedOrder.id.slice(0, 8).toUpperCase()}` : ''}
        >
          {selectedOrder && (
            <div className="space-y-5">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-bold text-gray-700">Estado</span>
                <span
                  className={`text-xs font-bold px-3 py-1.5 rounded-full ${statusColors[selectedOrder.status]}`}
                >
                  {statusLabels[selectedOrder.status]}
                </span>
              </div>

              {selectedOrder.user && (
                <div className="bg-white border border-gray-100 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-3">Cliente</h3>
                  <p className="text-sm text-gray-600">{selectedOrder.user.full_name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.user.email}</p>
                </div>
              )}

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Dirección de envío</h3>
                <p className="text-sm text-gray-700 font-semibold">
                  {selectedOrder.shipping_address?.name}
                </p>
                <p className="text-sm text-gray-600">{selectedOrder.shipping_address?.phone}</p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shipping_address?.street}, {selectedOrder.shipping_address?.city}
                </p>
                <p className="text-sm text-gray-600">
                  {selectedOrder.shipping_address?.state},{' '}
                  {selectedOrder.shipping_address?.zip_code}
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Pago</h3>
                <p className="text-sm text-gray-600">
                  Método:{' '}
                  <span className="font-semibold capitalize">
                    {selectedOrder.payment_info?.method}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Estado:{' '}
                  <span className="font-semibold capitalize">
                    {selectedOrder.payment_info?.status}
                  </span>
                </p>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <h3 className="font-bold text-gray-900 text-sm mb-3">Productos</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                        {item.product?.image_base64 && (
                          <img
                            src={item.product.image_base64}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-700">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-gray-400">x{item.quantity}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-sky-50 rounded-xl">
                <span className="font-extrabold text-gray-900">Total</span>
                <span className="font-extrabold text-sky-600 text-lg">
                  {formatPrice(selectedOrder.total)}
                </span>
              </div>
            </div>
          )}
        </Modal>
      </main>
    </div>
  );
}
