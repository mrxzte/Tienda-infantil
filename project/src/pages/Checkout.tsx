import { useState, FormEvent } from 'react';
import { CheckCircle, CreditCard, MapPin, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../hooks/useRouter';
import { ShippingAddress } from '../types';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [step, setStep] = useState<'shipping' | 'payment' | 'success'>('shipping');
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState('');

  const [shipping, setShipping] = useState<ShippingAddress>({
    name: '', phone: '', street: '', city: '', state: '', zip: '',
  });

  const [payment] = useState({ card: '', expiry: '', cvv: '', cardName: '' });

  const handleShippingSubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePaymentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setLoading(true);

    const shippingCost = total >= 50 ? 0 : 5.99;
    const finalTotal = total + shippingCost;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total: finalTotal,
        status: 'pending',
        shipping_address: shipping,
      })
      .select()
      .single();

    if (!error && order) {
      const orderItems = items.map(({ product, quantity }) => ({
        order_id: order.id,
        product_id: product.id,
        quantity,
        price: product.price,
      }));
      await supabase.from('order_items').insert(orderItems);
      await clearCart();
      setOrderId(order.id);
      setStep('success');
    }
    setLoading(false);
  };

  if (items.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No tienes artículos en el carrito</p>
          <button onClick={() => navigate('/products')} className="text-sky-600 font-bold hover:underline">
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
          <h2 className="text-2xl font-extrabold text-gray-900 mb-3">¡Pedido realizado!</h2>
          <p className="text-gray-500 mb-2">Tu pedido ha sido confirmado exitosamente.</p>
          <p className="text-xs text-gray-400 font-mono bg-gray-50 rounded-xl p-3 mb-8 border border-gray-100">
            ID: {orderId.slice(0, 8).toUpperCase()}...
          </p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => step === 'payment' ? setStep('shipping') : navigate('/cart')}
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
          ].map(({ id, label, icon: Icon }, i) => (
            <div key={id} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step === id ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {i + 1}
              </div>
              <span className={`font-semibold text-sm hidden sm:block ${step === id ? 'text-gray-900' : 'text-gray-400'}`}>
                {label}
              </span>
              {i < 1 && <div className="w-8 h-0.5 bg-gray-200 mx-1" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {step === 'shipping' && (
              <form onSubmit={handleShippingSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin size={20} className="text-sky-500" />
                  <h2 className="font-extrabold text-gray-900 text-lg">Dirección de envío</h2>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nombre completo', key: 'name', placeholder: 'Tu nombre', type: 'text' },
                    { label: 'Teléfono', key: 'phone', placeholder: '+1 (555) 000-0000', type: 'tel' },
                  ].map(({ label, key, placeholder, type }) => (
                    <div key={key}>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
                      <input
                        type={type}
                        value={shipping[key as keyof ShippingAddress]}
                        onChange={e => setShipping(s => ({ ...s, [key]: e.target.value }))}
                        required
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Dirección</label>
                  <input
                    type="text"
                    value={shipping.street}
                    onChange={e => setShipping(s => ({ ...s, street: e.target.value }))}
                    required
                    placeholder="Calle, número, colonia"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
                  />
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Ciudad', key: 'city', placeholder: 'Ciudad' },
                    { label: 'Estado/Provincia', key: 'state', placeholder: 'Estado' },
                    { label: 'Código postal', key: 'zip', placeholder: '00000' },
                  ].map(({ label, key, placeholder }) => (
                    <div key={key}>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
                      <input
                        type="text"
                        value={shipping[key as keyof ShippingAddress]}
                        onChange={e => setShipping(s => ({ ...s, [key]: e.target.value }))}
                        required
                        placeholder={placeholder}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
                <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-sky-200">
                  Continuar al pago
                </button>
              </form>
            )}

            {step === 'payment' && (
              <form onSubmit={handlePaymentSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard size={20} className="text-sky-500" />
                  <h2 className="font-extrabold text-gray-900 text-lg">Información de pago</h2>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                  Esta es una demo. No ingresa datos de tarjeta reales.
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Número de tarjeta</label>
                  <input
                    type="text"
                    required
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nombre en la tarjeta</label>
                  <input
                    type="text"
                    required
                    placeholder="NOMBRE APELLIDO"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Vencimiento</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">CVV</label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-gray-50"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-green-200"
                >
                  {loading ? 'Procesando...' : `Pagar $${(total + (total >= 50 ? 0 : 5.99)).toFixed(2)}`}
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
                    <img src={product.image_url} alt={product.name} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-700 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-400">x{quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800">${(product.price * quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span><span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Envío</span>
                  <span className={total >= 50 ? 'text-green-600' : ''}>{total >= 50 ? 'Gratis' : '$5.99'}</span>
                </div>
                <div className="flex justify-between font-extrabold text-gray-900 text-base pt-1 border-t border-gray-100">
                  <span>Total</span>
                  <span>${(total + (total >= 50 ? 0 : 5.99)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
