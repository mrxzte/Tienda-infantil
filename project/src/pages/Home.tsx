import { useEffect, useState } from 'react';
import { ArrowRight, Shield, Truck, RefreshCw, Star, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { useRouter } from '../hooks/useRouter';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigate } = useRouter();

  useEffect(() => {
    Promise.all([
      supabase.from('products').select('*, categories(*)').eq('featured', true).limit(4),
      supabase.from('categories').select('*').limit(5),
    ]).then(([products, cats]) => {
      if (products.data) setFeaturedProducts(products.data as Product[]);
      if (cats.data) setCategories(cats.data);
      setLoading(false);
    });
  }, []);

  const categoryColors: Record<string, string> = {
    juguetes: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    ropa: 'bg-pink-100 text-pink-700 hover:bg-pink-200',
    libros: 'bg-green-100 text-green-700 hover:bg-green-200',
    'juegos-de-mesa': 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    'arte-manualidades': 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
  };

  const features = [
    { icon: Truck, title: 'Envío gratis', desc: 'En pedidos mayores a $50' },
    { icon: Shield, title: 'Productos seguros', desc: 'Certificados y no tóxicos' },
    { icon: RefreshCw, title: 'Devoluciones fáciles', desc: 'Hasta 30 días después' },
    { icon: Star, title: 'Calidad garantizada', desc: 'Los mejores productos' },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-sky-500 to-sky-700 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full" />
          <div className="absolute bottom-10 right-20 w-64 h-64 bg-white rounded-full" />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <Star size={14} fill="currentColor" />
                Los mejores juguetes y más
              </div>
              <h1 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                Todo lo que tus{' '}
                <span className="text-amber-300">pequeños</span>{' '}
                necesitan
              </h1>
              <p className="text-sky-100 text-lg mb-8 leading-relaxed max-w-lg">
                Descubre nuestra colección de productos seguros, divertidos y educativos diseñados para el desarrollo y alegría de tus hijos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/products')}
                  className="inline-flex items-center justify-center gap-2 bg-white text-sky-700 font-bold px-8 py-4 rounded-2xl hover:bg-sky-50 transition-colors shadow-lg shadow-sky-800/20 text-lg"
                >
                  Ver productos
                  <ArrowRight size={20} />
                </button>
                <button
                  onClick={() => navigate('/products?category=juguetes')}
                  className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors border border-white/20 text-lg"
                >
                  Ver juguetes
                </button>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="relative">
                <img
                  src="https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg?auto=compress&cs=tinysrgb&w=600"
                  alt="Juguetes infantiles"
                  className="w-full h-80 object-cover rounded-3xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Shield size={20} className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">100% Seguros</p>
                    <p className="text-gray-500 text-xs">Certificados para niños</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 group">
                <div className="w-11 h-11 bg-sky-50 rounded-xl flex items-center justify-center group-hover:bg-sky-100 transition-colors shrink-0">
                  <Icon size={20} className="text-sky-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{title}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900">Categorías</h2>
              <p className="text-gray-500 mt-1">Explora por tipo de producto</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-1 text-sky-600 font-semibold text-sm hover:text-sky-700 transition-colors"
            >
              Ver todo <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => navigate(`/products?category=${cat.slug}`)}
                className="group"
              >
                <div className="aspect-square rounded-2xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                  <img
                    src={cat.image_url}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <span className={`inline-block w-full text-center text-sm font-bold py-2 px-3 rounded-xl transition-colors ${
                  categoryColors[cat.slug] || 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900">Productos Destacados</h2>
              <p className="text-gray-500 mt-1">Los favoritos de nuestros clientes</p>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-1 text-sky-600 font-semibold text-sm hover:text-sky-700 transition-colors"
            >
              Ver todos <ChevronRight size={16} />
            </button>
          </div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Banner CTA */}
      <section className="py-16 bg-gradient-to-r from-orange-400 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-4">
            ¿Primera vez con nosotros?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Regístrate hoy y disfruta de envío gratis en tu primer pedido
          </p>
          <button
            onClick={() => navigate('/register')}
            className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-2xl hover:bg-orange-50 transition-colors shadow-lg text-lg"
          >
            Crear cuenta gratis
            <ArrowRight size={20} />
          </button>
        </div>
      </section>
    </div>
  );
}
