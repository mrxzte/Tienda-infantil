import { useState, FormEvent, useEffect } from 'react';
import { CheckCircle, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Category, Product } from '../types';
import SidebarAdmin from '../components/SidebarAdmin';
import { useRouter } from '../hooks/useRouter';

export default function EditProduct() {
  const { navigate, extractParam } = useRouter();
  const productId = extractParam('/admin/products/edit/:id', 'id');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', stock: '',
    category_id: '', image_url: '', featured: false,
  });

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('products').select('*').eq('id', productId).maybeSingle(),
    ]).then(([cats, prod]) => {
      if (cats.data) setCategories(cats.data);
      if (prod.data) {
        const p = prod.data as Product;
        setForm({
          name: p.name, slug: p.slug, description: p.description,
          price: String(p.price), stock: String(p.stock),
          category_id: p.category_id || '', image_url: p.image_url, featured: p.featured,
        });
      }
      setFetching(false);
    });
  }, [productId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.from('products').update({
      name: form.name, slug: form.slug, description: form.description,
      price: parseFloat(form.price), stock: parseInt(form.stock),
      category_id: form.category_id || null, image_url: form.image_url, featured: form.featured,
    }).eq('id', productId);

    if (error) {
      setError('Error al actualizar el producto.');
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (!error) navigate('/admin/products');
  };

  const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50";

  if (fetching) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <SidebarAdmin />
        <main className="flex-1 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-100 rounded-xl w-48" />
            <div className="h-64 bg-gray-100 rounded-2xl" />
          </div>
        </main>
      </div>
    );
  }

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

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Editar Producto</h1>
            <p className="text-gray-500 text-sm mt-1">Modifica los datos del producto</p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors text-sm font-bold"
          >
            <Trash2 size={16} />
            Eliminar
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
              <h3 className="font-extrabold text-gray-900 mb-2">¿Eliminar producto?</h3>
              <p className="text-gray-500 text-sm mb-5">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-3 bg-red-500 rounded-xl font-bold text-white hover:bg-red-600 text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

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

        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nombre *</label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Slug</label>
                <input type="text" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required className={inputClass} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4} className={`${inputClass} resize-none`} />
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Precio ($) *</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required min="0" step="0.01" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Stock *</label>
                <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required min="0" className={inputClass} />
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
              <input type="url" value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className={inputClass} />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 rounded accent-sky-500" />
              <label htmlFor="featured" className="text-sm font-bold text-gray-700">Producto destacado</label>
            </div>
            <button type="submit" disabled={loading} className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-sky-200">
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>

          <div>
            <h3 className="font-bold text-gray-700 text-sm mb-3">Vista previa</h3>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="aspect-square bg-gray-50">
                {form.image_url ? (
                  <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">Sin imagen</div>
                )}
              </div>
              <div className="p-4">
                <p className="font-bold text-gray-800 text-sm">{form.name}</p>
                <p className="text-sky-600 font-extrabold text-lg mt-1">${parseFloat(form.price || '0').toFixed(2)}</p>
                {form.featured && <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">Destacado</span>}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
