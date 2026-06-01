import { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import api from '../../utils/api';
import SidebarAdmin from '../../components/SidebarAdmin';
import { useRouter } from '../../hooks/useRouter';
import { formatPrice } from '../../utils/format';

export default function AdminProducts() {
  const { navigate } = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products?limit=100');
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar el producto "${name}"?`)) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p.id !== id));
      alert('Producto eliminado correctamente');
    } catch (error) {
      alert('Error al eliminar el producto');
      console.error('Error deleting product:', error);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Productos</h1>
            <p className="text-gray-500 text-sm mt-1">
              Gestiona el catálogo de productos
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/products/add')}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-sky-200"
          >
            <Plus size={20} />
            Agregar producto
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Products table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Package size={48} className="mx-auto mb-3 opacity-30" />
              <p>No se encontraron productos</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Producto
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Categoría
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Precio
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Stock
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Estado
                    </th>
                    <th className="text-right py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                            {product.image_base64 ? (
                              <img
                                src={product.image_base64}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package size={20} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {product.name}
                            </p>
                            {product.featured && (
                              <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
                                Destacado
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-600">
                          {product.category?.name || '-'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-gray-900 text-sm">
                          {formatPrice(product.price)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`text-sm font-semibold ${
                            product.stock === 0
                              ? 'text-red-600'
                              : product.stock <= 5
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${
                            product.stock > 0
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {product.stock > 0 ? 'Disponible' : 'Agotado'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
