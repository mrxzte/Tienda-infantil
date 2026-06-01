import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useRouter } from '../hooks/useRouter';
import { useState } from 'react';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const { navigate } = useRouter();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    setAdding(true);
    await addItem(product);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const inStock = product.stock > 0;

  return (
    <div
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden border border-gray-100 hover:border-sky-200 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-square bg-gray-50">
        <img
          src={product.image_url || 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=400'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.featured && (
          <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
            <Star size={10} fill="currentColor" />
            Destacado
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
            <span className="bg-white text-gray-700 font-bold text-sm px-3 py-1 rounded-full">Agotado</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-sky-600 font-semibold uppercase tracking-wide mb-1">
          {product.categories?.name || 'Producto'}
        </p>
        <h3 className="font-bold text-gray-800 text-sm leading-tight mb-2 line-clamp-2 group-hover:text-sky-700 transition-colors">
          {product.name}
        </h3>

        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-xl font-extrabold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!inStock || adding}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
              added
                ? 'bg-green-500 text-white'
                : inStock
                ? 'bg-sky-500 hover:bg-sky-600 text-white active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart size={15} />
            {added ? '¡Listo!' : adding ? '...' : 'Agregar'}
          </button>
        </div>

        {inStock && product.stock <= 5 && (
          <p className="text-xs text-orange-500 font-medium mt-2">
            Solo quedan {product.stock} unidades
          </p>
        )}
      </div>
    </div>
  );
}
