import { useEffect, useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  Home,
  XCircle,
  Eye,
  ShoppingBag,
  ChevronRight,
  MapPin,
  CreditCard,
} from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../hooks/useRouter';
import { formatPrice, formatDate } from '../utils/format';

const statusConfig = {
  pending: {
    label: 'Pendiente',
    color: 'bg-amber-100 text-amber-700',
    icon: Clock,
    description: 'Esperando confirmación de pago',
  },
  processing: {
    label: 'En proceso',
    color: 'bg-blue-100 text-blue-700',
    icon: Package,
    description: 'Tu pedido está siendo preparado',
  },
  shipped: {
    label: 'Enviado',
    color: 'bg-sky-100 text-sky-700',
    icon: Truck,
    description: 'Tu pedido está en camino',
  },
  delivered: {
    label: 'Entregado',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
    description: 'Tu pedido ha sido entregado',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
    description: 'Este pedido fue cancelado',
  },
};

// Componente: Tracker visual del estado del pedido
function OrderTracker({ status }) {
  const steps = [
    { key: 'pending', label: 'Pedido recibido', icon: Clock },
    { key: 'processing', label: 'En preparación', icon: Package },
    { key: 'shipped', label: 'Enviado', icon: Truck },
    { key: 'delivered', label: 'Entregado', icon: Home },
  ];

  if (status === 'cancelled') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center">
        <XCircle size={40} className="text-red-500 mx-auto mb-2" />
        <p className="font-bold text-red-700">Pedido cancelado</p>
      </div>
    );
  }

  const currentStep = steps.findIndex((s) => s.key === status);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="font-bold text-gray-900 mb-5 text-sm">Estado del pedido</h3>
      <div className="relative">
        {/* Líneas de conexión */}
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full" />
        <div
          className="absolute top-5 left-0 h-1 bg-sky-500 rounded-full transition-all duration-500"
          style={{
            width: `${Math.max(0, (currentStep / (steps.length - 1)) * 100)}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isCompleted
                      ? 'bg-sky-500 text-white shadow-lg shadow-sky-200'
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-sky-100 scale-110' : ''}`}
                >
                  <Icon size={18} />
                </div>
                <p
                  className={`text-xs font-bold mt-2 text-center max-w-[80px] ${
                    isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function MyOrders() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    setLoading(true);
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
    setSelectedOrder({ id: orderId });
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrderDetail(data);
    } catch (error) {
      console.error('Error fetching order detail:', error);
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setOrderDetail(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-semibold mb-4">
            Debes iniciar sesión para ver tus pedidos
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-sky-600 font-bold hover:underline"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  const filteredOrders = filter === 'all' 
    ? orders 
    : filter === 'active'
    ? orders.filter((o) => ['pending', 'processing', 'shipped'].includes(o.status))
    : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900">Mis Pedidos</h1>
          <p className="text-gray-500 mt-1">Sigue el estado de tus compras</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
          {[
            { key: 'all', label: 'Todos' },
            { key: 'active', label: 'Activos' },
            { key: 'delivered', label: 'Entregados' },
            { key: 'cancelled', label: 'Cancelados' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              data-testid={`filter-${f.key}`}
              className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-colors ${
                filter === f.key
                  ? 'bg-sky-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-semibold mb-4">
              {filter === 'all' ? 'Aún no tienes pedidos' : 'No hay pedidos en este filtro'}
            </p>
            <button
              onClick={() => navigate('/products')}
              className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
              data-testid="btn-empty-go-shopping"
            >
              Ir a comprar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const cfg = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = cfg.icon;

              return (
                <div
                  key={order.id}
                  data-testid={`order-card-${order.id}`}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Header del pedido */}
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cfg.color}`}>
                          <StatusIcon size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 font-mono text-sm">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="font-extrabold text-gray-900">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-3">{cfg.description}</p>
                  </div>

                  {/* Tracker mini (solo si no está cancelado) */}
                  {order.status !== 'cancelled' && (
                    <div className="p-5 bg-gray-50">
                      <OrderTracker status={order.status} />
                    </div>
                  )}

                  {/* Footer con botón ver detalles */}
                  <div className="p-4 bg-white">
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      data-testid={`btn-view-order-${order.id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sky-600 hover:bg-sky-50 rounded-xl transition-colors font-bold text-sm"
                    >
                      <Eye size={16} />
                      Ver detalles del pedido
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={handleCloseModal}
        title={orderDetail ? `Pedido #${orderDetail.id.slice(0, 8).toUpperCase()}` : 'Cargando...'}
      >
        {!orderDetail ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            {/* Estado actual */}
            <OrderTracker status={orderDetail.status} />

            {/* Productos */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <Package size={16} />
                Productos ({orderDetail.items?.length || 0})
              </h3>
              <div className="space-y-3">
                {orderDetail.items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white rounded-lg p-3">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.product?.image_base64 ? (
                        <img
                          src={item.product.image_base64}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={20} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                        {item.product?.name || 'Producto'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <MapPin size={16} />
                Dirección de envío
              </h3>
              <p className="text-sm text-gray-800 font-semibold">
                {orderDetail.shipping_address?.name}
              </p>
              <p className="text-sm text-gray-600">
                {orderDetail.shipping_address?.phone}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {orderDetail.shipping_address?.street}
              </p>
              <p className="text-sm text-gray-600">
                {orderDetail.shipping_address?.city}, {orderDetail.shipping_address?.state}
              </p>
              <p className="text-sm text-gray-600">
                CP: {orderDetail.shipping_address?.zip_code}
              </p>
            </div>

            {/* Información de pago */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                <CreditCard size={16} />
                Pago
              </h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Método:</span>
                <span className="font-bold text-gray-800 capitalize">
                  {orderDetail.payment_info?.method || 'No especificado'}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Estado del pago:</span>
                <span className={`font-bold capitalize ${
                  orderDetail.payment_info?.status === 'approved' 
                    ? 'text-green-600' 
                    : orderDetail.payment_info?.status === 'rejected'
                    ? 'text-red-600'
                    : 'text-amber-600'
                }`}>
                  {orderDetail.payment_info?.status === 'approved' && '✓ Aprobado'}
                  {orderDetail.payment_info?.status === 'pending' && '⏳ Pendiente'}
                  {orderDetail.payment_info?.status === 'rejected' && '✗ Rechazado'}
                  {orderDetail.payment_info?.status === 'cancelled' && 'Cancelado'}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center p-4 bg-sky-50 rounded-xl">
              <span className="font-extrabold text-gray-900">Total pagado</span>
              <span className="font-extrabold text-sky-600 text-xl">
                {formatPrice(orderDetail.total)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
