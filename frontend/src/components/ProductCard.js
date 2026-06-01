import { ShoppingCart } from 'lucide-react';
import { useRouter } from '../hooks/useRouter';
import { formatPrice } from '../utils/format';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function ProductCard({ product }) {
  const { navigate } = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (!user) {
      // Podríamos abrir el modal de login aquí
      alert('Debes iniciar sesión para agregar al carrito');
      return;
    }

    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
  };

  return (
    <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      <button
        onClick={() => navigate(`/product/${product.id}`)}
        className="w-full text-left"
      >
        {/* Image */}
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          {product.image_base64 ? (
            <img
              src={product.image_base64}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <ShoppingCart size={48} />
            </div>
          )}
          {product.featured && (
            <span className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
              Destacado
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-900 font-bold px-4 py-2 rounded-xl">
                Agotado
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2 group-hover:text-sky-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-sky-600 font-extrabold text-lg mb-3">
            {formatPrice(product.price)}
          </p>
          
          {product.stock > 0 && product.stock <= 5 && (
            <p className="text-xs text-orange-600 font-semibold mb-2">
              ¡Solo quedan {product.stock}!
            </p>
          )}
        </div>
      </button>

      {/* Add to cart button */}
      {product.stock > 0 && (
        <div className="px-4 pb-4">
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-sky-200"
          >
            <ShoppingCart size={18} />
            <span className="text-sm">
              {adding ? 'Agregando...' : 'Agregar al carrito'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
