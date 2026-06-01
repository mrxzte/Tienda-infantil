import { useEffect, useState } from 'react';
import { Package, Search, PlusCircle, CreditCard as Edit2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Product } from '../types';
import SidebarAdmin from '../components/SidebarAdmin';
import { useRouter } from '../hooks/useRouter';

export default function ProductsList() {
  const { navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase
      .from('products')
      .select('*, categories(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setProducts(data as Product[]);
        setLoading(false);
      });
  }, []);

  const filtered = products.filter(p =>
    search === '' ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.categories?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Productos</h1>
            <p className="text-gray-500 text-sm mt-1">{products.length} productos en catálogo</p>
          </div>
          <button
            onClick={() => navigate('/admin/products/add')}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-sky-200 text-sm"
          >
            <PlusCircle size={18} />
            Agregar
          </button>
        </div>

        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full sm:w-80 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Package size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400 mb-4">No hay productos</p>
              <button
                onClick={() => navigate('/admin/products/add')}
                className="text-sky-600 font-bold text-sm hover:underline"
              >
                Crear el primero
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-bold text-gray-500 px-5 py-3">Producto</th>
                  <th className="text-left text-xs font-bold text-gray-500 px-5 py-3 hidden sm:table-cell">Categoría</th>
                  <th className="text-left text-xs font-bold text-gray-500 px-5 py-3">Precio</th>
                  <th className="text-left text-xs font-bold text-gray-500 px-5 py-3 hidden md:table-cell">Stock</th>
                  <th className="text-left text-xs font-bold text-gray-500 px-5 py-3">Estado</th>
                  <th className="text-left text-xs font-bold text-gray-500 px-5 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || 'https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={product.name}
                          className="w-10 h-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-bold text-gray-800 text-sm line-clamp-1">{product.name}</p>
                          {product.featured && <span className="text-xs text-amber-600 font-semibold">Destacado</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{product.categories?.name || '—'}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-gray-900">${Number(product.price).toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className={`text-sm font-semibold ${product.stock === 0 ? 'text-red-500' : product.stock <= 5 ? 'text-orange-500' : 'text-gray-700'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {product.stock === 0 ? 'Agotado' : 'Disponible'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                        className="flex items-center gap-1.5 text-sky-600 hover:bg-sky-50 border border-sky-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Edit2 size={13} />
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
