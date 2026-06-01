import { useEffect, useState } from 'react';
import { ShoppingCart, ArrowLeft, Star, Shield, Truck, Package, Minus, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useRouter } from '../hooks/useRouter';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { path, navigate, extractParam } = useRouter();
  const productId = extractParam('/product/:id', 'id');
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setQuantity(1);
    setAdded(false);
    supabase
      .from('products')
      .select('*, categories(*)')
      .eq('id', productId)
      .maybeSingle()
      .then(({ data }) => {
        setProduct(data as Product);
        if (data?.category_id) {
          supabase
            .from('products')
            .select('*, categories(*)')
            .eq('category_id', data.category_id)
            .neq('id', productId)
            .limit(4)
            .then(({ data: rel }) => {
              if (rel) setRelated(rel as Product[]);
            });
        }
        setLoading(false);
      });
  }, [productId]);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    setAdding(true);
    await addItem(product, quantity);
    setAdding(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-100 rounded-3xl animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-6 bg-gray-100 rounded-xl animate-pulse w-1/3" />
            <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Producto no encontrado</p>
          <button onClick={() => navigate('/products')} className="text-sky-600 font-semibold hover:underline">
            Ver todos los productos
          </button>
        </div>
      </div>
    );
  }

  const inStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/products')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-8 text-sm font-medium group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Volver a productos
        </button>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="aspect-square rounded-3xl overflow-hidden bg-white shadow-sm">
            <img
              src={product.image_url || 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=600'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.categories && (
              <span className="text-sky-600 font-bold text-sm uppercase tracking-wider mb-2">
                {product.categories.name}
              </span>
            )}
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>

            {product.featured && (
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-amber-400 fill-amber-400" />
                ))}
                <span className="text-sm text-gray-600 ml-2">Producto destacado</span>
              </div>
            )}

            <p className="text-4xl font-extrabold text-gray-900 mb-6">
              ${product.price.toFixed(2)}
            </p>

            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Stock */}
            <div className="flex items-center gap-2 mb-6">
              <div className={`w-2.5 h-2.5 rounded-full ${inStock ? 'bg-green-500' : 'bg-red-400'}`} />
              <span className={`text-sm font-semibold ${inStock ? 'text-green-700' : 'text-red-600'}`}>
                {inStock ? `${product.stock} en stock` : 'Agotado'}
              </span>
            </div>

            {/* Quantity */}
            {inStock && (
              <div className="flex items-center gap-4 mb-6">
                <span className="text-sm font-semibold text-gray-700">Cantidad:</span>
                <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Add to cart button */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              className={`flex items-center justify-center gap-3 w-full py-4 rounded-2xl text-lg font-bold transition-all duration-200 shadow-lg mb-4 ${
                added
                  ? 'bg-green-500 text-white shadow-green-200'
                  : inStock
                  ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200 active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
              }`}
            >
              <ShoppingCart size={22} />
              {added ? '¡Agregado al carrito!' : adding ? 'Agregando...' : 'Agregar al carrito'}
            </button>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mt-2">
              {[
                { icon: Shield, label: 'Seguro', sub: 'Certificado' },
                { icon: Truck, label: 'Envío rápido', sub: '2-5 días' },
                { icon: Package, label: 'Devolución', sub: '30 días' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                  <Icon size={18} className="text-sky-600 mx-auto mb-1" />
                  <p className="text-xs font-bold text-gray-700">{label}</p>
                  <p className="text-xs text-gray-500">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Productos relacionados</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
