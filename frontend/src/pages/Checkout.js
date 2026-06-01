import { useState } from 'react';
import { CheckCircle, CreditCard, MapPin, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from '../hooks/useRouter';
import { formatPrice } from '../utils/format';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { navigate } = useRouter();
  
  const [step, setStep] = useState('shipping');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');

  const [shipping, setShipping] = useState({
    name: user?.full_name || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zip_code: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('mercadopago');

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Crear orden
      const { data: order } = await api.post('/orders', {
        shipping_address: shipping,
        payment_info: {
          method: paymentMethod,
          status: 'pending',
        },
      });

      setOrderId(order.id);

      // Si es Mercado Pago, crear preferencia y redirigir
      if (paymentMethod === 'mercadopago') {
        try {
          const { data: pref } = await api.post(`/payments/create-preference/${order.id}`);
          
          // Limpiar carrito antes de redirigir
          await clearCart();
          
          // Redirigir a Mercado Pago (sandbox_init_point para pruebas)
          const checkoutUrl = pref.sandbox_init_point || pref.init_point;
          window.location.href = checkoutUrl;
          return;
        } catch (mpError) {
          setError('Error al crear el pago en Mercado Pago. Tu pedido fue creado pero no se procesó el pago.');
          console.error('Error MP:', mpError);
          setLoading(false);
          return;
        }
      }

      // Para otros métodos de pago (Nequi, Bancolombia, Transferencia)
      await clearCart();
      setStep('success');
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al procesar el pedido');
      console.error('Error creating order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Debes iniciar sesión para continuar</p>
          <button
            onClick={() => navigate('/')}
            className="text-sky-600 font-bold hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No tienes artículos en el carrito</p>
          <button
            onClick={() => navigate('/products')}
            className="text-sky-600 font-bold hover:underline"
          >
            Ver productos
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
            ¡Pedido realizado!
          </h2>
          <p className="text-gray-500 mb-2">
            Tu pedido ha sido confirmado exitosamente.
          </p>
          <p className="text-xs text-gray-400 font-mono bg-gray-50 rounded-xl p-3 mb-4 border border-gray-100">
            ID: {orderId.slice(0, 8).toUpperCase()}...
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-sm text-blue-700">
            <p className="font-semibold mb-2">
              {paymentMethod === 'mercadopago'
                ? '💳 Pago con Mercado Pago'
                : paymentMethod === 'nequi'
                ? '📱 Pago con Nequi'
                : paymentMethod === 'bancolombia'
                ? '🏦 Transferencia Bancolombia'
                : '💵 Transferencia Bancaria'}
            </p>
            <p className="text-xs">
              Recibirás un correo con las instrucciones de pago y el estado de tu pedido.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/')}
              className="py-3 border border-gray-200 rounded-2xl text-gray-700 font-bold hover:bg-gray-50 transition-colors text-sm"
            >
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

  const shippingCost = total >= 150000 ? 0 : 15000;
  const finalTotal = total + shippingCost;

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => (step === 'payment' ? setStep('shipping') : navigate('/cart'))}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-8 text-sm font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          {step === 'payment' ? 'Volver a envío' : 'Volver al carrito'}
        </button>

        {/* Steps */}
        <div className="flex items-center gap-4 mb-8">
          {[
            { id: 'shipping', label: 'Dirección de envío', icon: MapPin },
            { id: 'payment', label: 'Pago', icon: CreditCard },
          ].map(({ id, label }, i) => (
            <div key={id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step === id ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1}
              </div>
              <span
                className={`font-semibold text-sm hidden sm:block ${
                  step === id ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
              {i < 1 && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <form
                onSubmit={handleShippingSubmit}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={20} className="text-sky-500" />
                  <h2 className="font-extrabold text-gray-900 text-lg">
                    Dirección de envío
                  </h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={shipping.name}
                      onChange={(e) => setShipping({ ...shipping, name: e.target.value })}
                      required
                      placeholder="Tu nombre"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={shipping.phone}
                      onChange={(e) => setShipping({ ...shipping, phone: e.target.value })}
                      required
                      placeholder="+57 300 123 4567"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={shipping.street}
                    onChange={(e) => setShipping({ ...shipping, street: e.target.value })}
                    required
                    placeholder="Calle, número, colonia"
                    className={inputClass}
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={shipping.city}
                      onChange={(e) => setShipping({ ...shipping, city: e.target.value })}
                      required
                      placeholder="Ciudad"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={shipping.state}
                      onChange={(e) => setShipping({ ...shipping, state: e.target.value })}
                      required
                      placeholder="Departamento"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Código postal
                    </label>
                    <input
                      type="text"
                      value={shipping.zip_code}
                      onChange={(e) =>
                        setShipping({ ...shipping, zip_code: e.target.value })
                      }
                      required
                      placeholder="110111"
                      className={inputClass}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-sky-200"
                >
                  Continuar al pago
                </button>
              </form>
            )}

            {step === 'payment' && (
              <form
                onSubmit={handlePaymentSubmit}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard size={20} className="text-sky-500" />
                  <h2 className="font-extrabold text-gray-900 text-lg">
                    Método de pago
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'mercadopago',
                      name: 'Mercado Pago',
                      desc: 'Tarjetas, PSE, Nequi y más',
                    },
                    { id: 'nequi', name: 'Nequi', desc: 'Pago con QR o transferencia' },
                    {
                      id: 'bancolombia',
                      name: 'Bancolombia',
                      desc: 'Transferencia bancaria',
                    },
                    {
                      id: 'transferencia',
                      name: 'Transferencia',
                      desc: 'Otros bancos',
                    },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-sky-500 bg-sky-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 accent-sky-500"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{method.name}</p>
                        <p className="text-sm text-gray-500">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                  <p className="font-semibold mb-1">📌 Nota importante</p>
                  <p>
                    Recibirás un correo con las instrucciones para completar tu pago. El
                    pedido será procesado una vez confirmemos el pago.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-green-200"
                >
                  {loading ? 'Procesando...' : `Confirmar pedido - ${formatPrice(finalTotal)}`}
                </button>
              </form>
            )}
          </div>

          {/* Order summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h3 className="font-extrabold text-gray-900 mb-4">Tu pedido</h3>
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      {product.image_base64 && (
                        <img
                          src={product.image_base64}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-400">x{quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800">
                      {formatPrice(product.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Envío</span>
                  <span className={shippingCost === 0 ? 'text-green-600' : ''}>
                    {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between font-extrabold text-gray-900 text-base pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
