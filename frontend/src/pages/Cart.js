import { useEffect } from 'react';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useRouter } from '../hooks/useRouter';
import { formatPrice } from '../utils/format';
import { useAuth } from '../contexts/AuthContext';

export default function Cart() {
  const { items, loading, updateQuantity, removeFromCart, total, fetchCart } = useCart();
  const { user } = useAuth();
  const { navigate } = useRouter();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-semibold mb-4">
            Debes iniciar sesión para ver tu carrito
          </p>
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-semibold mb-4">Tu carrito está vacío</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Ir a comprar
          </button>
        </div>
      </div>
    );
  }

  const shippingCost = total >= 150000 ? 0 : 15000;
  const finalTotal = total + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-8 text-sm font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Seguir comprando
        </button>

        <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Carrito de Compras</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4"
              >
                {/* Image */}
                <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                  {item.product?.image_base64 ? (
                    <img
                      src={item.product.image_base64}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag size={32} className="text-gray-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1">{item.product?.name}</h3>
                  <p className="text-sky-600 font-extrabold text-lg mb-3">
                    {formatPrice(item.product?.price || 0)}
                  </p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-colors"
                    >
                      <Minus size={16} className="mx-auto" />
                    </button>
                    <span className="w-10 text-center font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          Math.min(item.product?.stock || 99, item.quantity + 1)
                        )
                      }
                      className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-gray-700 transition-colors"
                    >
                      <Plus size={16} className="mx-auto" />
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col items-end justify-between">
                  <p className="font-extrabold text-gray-900 text-lg">
                    {formatPrice((item.product?.price || 0) * item.quantity)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="font-extrabold text-gray-900 text-lg mb-4">Resumen del pedido</h2>
              
              <div className="space-y-3 mb-4 pb-4 border-b border-gray-100">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className={`font-semibold ${shippingCost === 0 ? 'text-green-600' : ''}`}>
                    {shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
                  </span>
                </div>
                {total < 150000 && (
                  <p className="text-xs text-gray-500">
                    Agrega {formatPrice(150000 - total)} más para envío gratis
                  </p>
                )}
              </div>

              <div className="flex justify-between font-extrabold text-gray-900 text-xl mb-6">
                <span>Total</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-green-200"
              >
                Proceder al pago
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
