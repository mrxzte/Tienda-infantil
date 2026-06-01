import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import api from '../utils/api';
import { useRouter } from '../hooks/useRouter';
import { formatPrice } from '../utils/format';

export default function CheckoutResult() {
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  // Leer query params de Mercado Pago
  const params = new URLSearchParams(window.location.search);
  const status = params.get('status'); // approved, rejected, pending
  const externalReference = params.get('external_reference'); // nuestro order_id
  const paymentId = params.get('payment_id');

  useEffect(() => {
    if (!externalReference) {
      setError('No se encontró información del pedido');
      setLoading(false);
      return;
    }

    // Consultar el estado actualizado en nuestro backend
    // El webhook ya debería haber actualizado el estado
    let attempts = 0;
    const maxAttempts = 5;

    const checkStatus = async () => {
      try {
        const { data } = await api.get(`/payments/status/${externalReference}`);
        setOrder(data);
        
        // Si todavía está pending y no hemos intentado mucho, reintentar
        if (data.payment_info?.status === 'pending' && attempts < maxAttempts) {
          attempts++;
          setTimeout(checkStatus, 2000); // Reintentar en 2 segundos
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError('Error al consultar el estado del pago');
        setLoading(false);
      }
    };

    checkStatus();
  }, [externalReference]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">
            Verificando tu pago...
          </h2>
          <p className="text-gray-500 text-sm">
            Estamos confirmando los detalles con Mercado Pago
          </p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
            Algo salió mal
          </h2>
          <p className="text-gray-500 mb-8">{error || 'No pudimos verificar tu pago'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-6 rounded-2xl"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  const paymentStatus = order.payment_info?.status || status || 'pending';
  
  const config = {
    approved: {
      icon: CheckCircle,
      color: 'green',
      title: '¡Pago aprobado!',
      message: 'Tu pago se procesó correctamente. Tu pedido está siendo preparado.',
    },
    rejected: {
      icon: XCircle,
      color: 'red',
      title: 'Pago rechazado',
      message: 'Tu pago fue rechazado. Por favor intenta con otro método de pago.',
    },
    pending: {
      icon: Clock,
      color: 'amber',
      title: 'Pago pendiente',
      message: 'Tu pago está en proceso. Te notificaremos cuando se confirme.',
    },
    cancelled: {
      icon: XCircle,
      color: 'red',
      title: 'Pago cancelado',
      message: 'El pago fue cancelado. Puedes intentarlo de nuevo.',
    },
  };

  const currentConfig = config[paymentStatus] || config.pending;
  const Icon = currentConfig.icon;

  const colorClasses = {
    green: { bg: 'bg-green-100', text: 'text-green-500' },
    red: { bg: 'bg-red-100', text: 'text-red-500' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-500' },
  };

  const colors = colorClasses[currentConfig.color];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
        <div className={`w-20 h-20 ${colors.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
          <Icon size={40} className={colors.text} />
        </div>
        
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
          {currentConfig.title}
        </h2>
        
        <p className="text-gray-500 mb-6">{currentConfig.message}</p>

        {/* Detalles del pedido */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">ID del pedido:</span>
            <span className="font-mono font-bold text-gray-900">
              #{order.order_id?.slice(0, 8).toUpperCase()}
            </span>
          </div>
          {paymentId && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">ID de pago:</span>
              <span className="font-mono font-bold text-gray-900">{paymentId}</span>
            </div>
          )}
          {order.payment_info?.payment_method_detail && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Método:</span>
              <span className="font-bold text-gray-900 capitalize">
                {order.payment_info.payment_method_detail}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
            <span className="text-gray-500">Total:</span>
            <span className="font-extrabold text-sky-600 text-lg">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/')}
            className="py-3 border border-gray-200 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm"
          >
            <ArrowLeft size={16} className="inline mr-1" />
            Ir al inicio
          </button>
          <button
            onClick={() => navigate('/products')}
            className="py-3 bg-sky-500 hover:bg-sky-600 rounded-2xl text-white font-bold transition-colors text-sm"
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
}
