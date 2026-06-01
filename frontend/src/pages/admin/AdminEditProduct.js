import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import SidebarAdmin from '../../components/SidebarAdmin';
import ImageUploader from '../../components/ImageUploader';
import { useRouter } from '../../hooks/useRouter';
import { generateSlug } from '../../utils/format';

export default function AdminEditProduct() {
  const { navigate, getParam } = useRouter();
  const productId = getParam('/admin/products/edit/:id', 'id');
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_base64: '',
    featured: false,
  });

  useEffect(() => {
    fetchCategories();
    if (productId) fetchProduct();
  }, [productId]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      const { data } = await api.get(`/products/${productId}`);
      setForm({
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price.toString(),
        stock: data.stock.toString(),
        category_id: data.category_id || '',
        image_base64: data.image_base64,
        featured: data.featured,
      });
    } catch (error) {
      setError('Error al cargar el producto');
      console.error('Error fetching product:', error);
    } finally {
      setLoadingProduct(false);
    }
  };

  const handleNameChange = (name) => {
    setForm({ ...form, name, slug: generateSlug(name) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.put(`/products/${productId}`, {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category_id: form.category_id || null,
        image_base64: form.image_base64,
        featured: form.featured,
      });
      setSuccess(true);
      setTimeout(() => navigate('/admin/products'), 1500);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al actualizar el producto');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProduct) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarAdmin />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
        </main>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 p-8 overflow-auto">
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm font-medium group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Volver a productos
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Editar Producto</h1>
          <p className="text-gray-500 text-sm mt-1">Actualiza la información del producto</p>
        </div>

        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <CheckCircle size={18} className="text-green-500" />
            <p className="text-green-700 text-sm font-medium">Producto actualizado exitosamente</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <AlertCircle size={18} className="text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nombre del producto *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Slug (URL)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Precio (COP) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                  min="0"
                  step="100"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stock *</label>
                <input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  required
                  min="0"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
                <select
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Sin categoría</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="w-4 h-4 rounded accent-sky-500"
              />
              <label htmlFor="featured" className="text-sm font-bold text-gray-700">
                Producto destacado
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-sky-200"
            >
              {loading ? 'Guardando...' : 'Actualizar producto'}
            </button>
          </div>

          <div>
            <ImageUploader
              value={form.image_base64}
              onChange={(base64) => setForm({ ...form, image_base64: base64 })}
            />
          </div>
        </form>
      </main>
    </div>
  );
}
