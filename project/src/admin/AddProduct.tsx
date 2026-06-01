import { useState, FormEvent, useEffect } from 'react';
import { CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category } from '../types';
import SidebarAdmin from '../components/SidebarAdmin';
import { useRouter } from '../hooks/useRouter';

export default function AddProduct() {
  const { navigate } = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', stock: '',
    category_id: '', image_url: '', featured: false,
  });

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => {
      if (data) setCategories(data);
    });
  }, []);

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: generateSlug(name) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.from('products').insert({
      name: form.name,
      slug: form.slug,
      description: form.description,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      category_id: form.category_id || null,
      image_url: form.image_url,
      featured: form.featured,
    });

    if (error) {
      setError(error.message.includes('unique') ? 'Ya existe un producto con ese slug.' : 'Error al crear el producto.');
    } else {
      setSuccess(true);
      setForm({ name: '', slug: '', description: '', price: '', stock: '', category_id: '', image_url: '', featured: false });
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50";

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
          <h1 className="text-2xl font-extrabold text-gray-900">Agregar Producto</h1>
          <p className="text-gray-500 text-sm mt-1">Completa los datos del nuevo producto</p>
        </div>

        {success && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <CheckCircle size={18} className="text-green-500" />
            <p className="text-green-700 text-sm font-medium">Producto creado exitosamente</p>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <AlertCircle size={18} className="text-red-500" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del producto *</label>
                <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)} required placeholder="Ej: Set de bloques" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Slug (URL)</label>
                <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required placeholder="set-de-bloques" className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4}
                placeholder="Describe el producto..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Precio ($) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="0" step="0.01" placeholder="0.00" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stock *</label>
                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required min="0" placeholder="0" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categoría</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className={inputClass}>
                  <option value="">Sin categoría</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">URL de imagen</label>
              <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="https://images.pexels.com/..." className={inputClass} />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={form.featured}
                onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                className="w-4 h-4 rounded accent-sky-500"
              />
              <label htmlFor="featured" className="text-sm font-bold text-gray-700">Producto destacado</label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-sky-200"
            >
              {loading ? 'Guardando...' : 'Crear producto'}
            </button>
          </form>

          {/* Preview */}
          <div>
            <h3 className="font-bold text-gray-700 text-sm mb-3">Vista previa</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-50 relative">
                {form.image_url ? (
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Sin imagen</div>
                )}
              </div>
              <div className="p-4">
                <p className="font-bold text-gray-800 text-sm">{form.name || 'Nombre del producto'}</p>
                <p className="text-sky-600 font-extrabold text-lg mt-1">{form.price ? `$${parseFloat(form.price).toFixed(2)}` : '$0.00'}</p>
                {form.featured && <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Destacado</span>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
