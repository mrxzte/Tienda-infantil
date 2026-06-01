import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';
import { useRouter } from '../hooks/useRouter';

export default function Products() {
  const { path, navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('created_at');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Read category from URL hash query string
  useEffect(() => {
    const hashParts = window.location.hash.split('?');
    if (hashParts[1]) {
      const params = new URLSearchParams(hashParts[1]);
      const cat = params.get('category');
      setSelectedCategory(cat);
    } else {
      setSelectedCategory(null);
    }
  }, [path]);

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*, categories(*)');
    if (selectedCategory) {
      const cat = categories.find(c => c.slug === selectedCategory);
      if (cat) query = query.eq('category_id', cat.id);
    }
    query = query.order(sortBy === 'price_asc' ? 'price' : sortBy === 'price_desc' ? 'price' : 'created_at', {
      ascending: sortBy === 'price_asc',
    });
    const { data } = await query;
    if (data) setProducts(data as Product[]);
    setLoading(false);
  };

  const filtered = products.filter(p =>
    search === '' ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCategoryClick = (slug: string | null) => {
    setSelectedCategory(slug);
    if (slug) {
      navigate(`/products?category=${slug}`);
    } else {
      navigate('/products');
    }
    setFiltersOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-4">
            {selectedCategory
              ? categories.find(c => c.slug === selectedCategory)?.name || 'Productos'
              : 'Todos los Productos'}
          </h1>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <X size={16} className="text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="created_at">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
            </select>

            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-gray-100 transition-colors sm:hidden"
            >
              <SlidersHorizontal size={16} />
              Filtros
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar filters - desktop */}
          <aside className={`w-56 shrink-0 ${filtersOpen ? 'block' : 'hidden'} sm:block`}>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
              <h3 className="font-bold text-gray-800 mb-3 text-sm">Categorías</h3>
              <div className="space-y-1">
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    !selectedCategory ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Todos
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      selectedCategory === cat.slug ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gray-100 rounded-2xl aspect-[3/4] animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg font-semibold">No se encontraron productos</p>
                <p className="text-gray-400 text-sm mt-2">Intenta con otros términos de búsqueda</p>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">{filtered.length} productos encontrados</p>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                  {filtered.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
