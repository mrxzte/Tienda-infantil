import { useEffect, useState } from 'react';
import { ArrowLeft, ShoppingCart, Package, AlertCircle } from 'lucide-react';
import api from '../utils/api';
import { useRouter } from '../hooks/useRouter';
import { formatPrice } from '../utils/format';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProductDetail() {
  const { getParam, navigate } = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const productId = getParam('/product/:id', 'id');
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${productId}`);
      setProduct(data);
    } catch (error) {
      setError('Producto no encontrado');
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      alert('Debes iniciar sesión para agregar al carrito');
      return;
    }

    setAdding(true);
    const { error } = await addToCart(product.id, quantity);
    
    if (error) {
      alert(error);
    } else {
      alert('Producto agregado al carrito');
    }
    setAdding(false);
  };

  const handleQuantityChange = (e) => {
    const val = e.target.value;
    if (val === '' || val === '0') {
      setQuantity('');
      return;
    }
    const num = parseInt(val);
    if (!isNaN(num) && num >= 1 && num <= product.stock) {
      setQuantity(num);
    }
  };

  const handleQuantityBlur = () => {
    if (quantity === '' || quantity < 1) {
      setQuantity(1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-semibold mb-4">{error}</p>
          <button
            onClick={() => navigate('/products')}
            className="text-sky-600 font-bold hover:underline"
          >
            Volver a productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-8 text-sm font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Volver a productos
        </button>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <div className="aspect-square bg-gray-50 flex items-center justify-center relative">
              {product.image_base64 ? (
                <img
                  src={product.image_base64}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={80} className="text-gray-300" />
              )}
              {product.featured && (
                <span className="absolute top-4 left-4 bg-amber-400 text-amber-900 text-sm font-bold px-4 py-2 rounded-full">
                  Destacado
                </span>
              )}
            </div>
          </div>

          <div>
            {product.category && (
              <span className="inline-block bg-sky-50 text-sky-700 text-sm font-bold px-3 py-1 rounded-full mb-4">
                {product.category.name}
              </span>
            )}
            
            <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4">
              {product.name}
            </h1>
            
            <p className="text-4xl font-extrabold text-sky-600 mb-6">
              {formatPrice(product.price)}
            </p>

            {product.description && (
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Descripción</h2>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-700">Disponibilidad</span>
                {product.stock > 0 ? (
                  <span className="text-sm font-bold text-green-600">
                    ✓ En stock ({product.stock} unidades)
                  </span>
                ) : (
                  <span className="text-sm font-bold text-red-600">✗ Agotado</span>
                )}
              </div>
              {product.stock > 0 && product.stock <= 5 && (
                <p className="text-xs text-orange-600 font-semibold">
                  ¡Apresúrate! Solo quedan {product.stock} unidades
                </p>
              )}
            </div>

            {product.stock > 0 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Cantidad
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={handleQuantityChange}
                      onBlur={handleQuantityBlur}
                      className="w-16 text-center font-bold text-gray-900 border border-gray-200 rounded-xl py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-gray-700 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-sky-200"
                >
                  <ShoppingCart size={20} />
                  <span>{adding ? 'Agregando...' : 'Agregar al carrito'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
