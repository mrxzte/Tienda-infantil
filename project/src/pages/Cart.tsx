import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useRouter } from '../hooks/useRouter';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { items, total, removeItem, updateQuantity, itemCount } = useCart();
  const { user } = useAuth();
  const { navigate } = useRouter();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-sky-50 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-sky-400" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8 text-center">Explora nuestros productos y agrega tus favoritos</p>
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-4 rounded-2xl transition-colors"
        >
          Explorar productos
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-8 text-sm font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Seguir comprando
        </button>

        <h1 className="text-2xl font-extrabold text-gray-900 mb-8">
          Mi carrito <span className="text-gray-400 font-normal text-lg">({itemCount} artículos)</span>
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex gap-5">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-xl cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                  onClick={() => navigate(`/product/${product.id}`)}
                />
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold text-gray-800 hover:text-sky-600 cursor-pointer transition-colors line-clamp-2"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sky-600 text-sm font-semibold mt-1">
                    ${product.price.toFixed(2)} c/u
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center font-bold text-sm">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock}
                        className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-extrabold text-gray-900">
                        ${(product.price * quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(product.id)}
                        className="text-red-400 hover:text-red-600 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="font-extrabold text-gray-900 text-lg mb-5">Resumen del pedido</h2>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal ({itemCount} artículos)</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Envío</span>
                  <span className={total >= 50 ? 'text-green-600 font-semibold' : ''}>
                    {total >= 50 ? 'Gratis' : '$5.99'}
                  </span>
                </div>
                {total < 50 && (
                  <p className="text-xs text-gray-400 bg-amber-50 p-2 rounded-lg border border-amber-100">
                    Agrega ${(50 - total).toFixed(2)} más para envío gratis
                  </p>
                )}
              </div>
              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between font-extrabold text-gray-900 text-lg">
                  <span>Total</span>
                  <span>${(total + (total >= 50 ? 0 : 5.99)).toFixed(2)}</span>
                </div>
              </div>
              {user ? (
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-200"
                >
                  Proceder al pago
                  <ArrowRight size={18} />
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    Iniciar sesión para pagar
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full border border-sky-500 text-sky-600 font-bold py-3 rounded-2xl hover:bg-sky-50 transition-colors text-sm"
                  >
                    Crear cuenta nueva
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
