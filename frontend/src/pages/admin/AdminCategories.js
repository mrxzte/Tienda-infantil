import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Tag, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import SidebarAdmin from '../../components/SidebarAdmin';
import ImageUploader from '../../components/ImageUploader';
import Modal from '../../components/Modal';
import { generateSlug } from '../../utils/format';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_base64: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setForm({
        name: category.name,
        slug: category.slug,
        description: category.description,
        image_base64: category.image_base64,
      });
    } else {
      setEditingCategory(null);
      setForm({ name: '', slug: '', description: '', image_base64: '' });
    }
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFormLoading(true);

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, form);
        setSuccess('Categoría actualizada exitosamente');
      } else {
        await api.post('/categories', form);
        setSuccess('Categoría creada exitosamente');
      }
      await fetchCategories();
      setTimeout(() => {
        setShowModal(false);
        setSuccess('');
      }, 1500);
    } catch (error) {
      setError(error.response?.data?.detail || 'Error al guardar la categoría');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Eliminar la categoría "${name}"?`)) return;

    try {
      await api.delete(`/categories/${id}`);
      setCategories(categories.filter((c) => c.id !== id));
      alert('Categoría eliminada correctamente');
    } catch (error) {
      alert('Error al eliminar la categoría');
      console.error('Error deleting category:', error);
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Categorías</h1>
            <p className="text-gray-500 text-sm mt-1">Gestiona las categorías de productos</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-lg shadow-sky-200"
          >
            <Plus size={20} />
            Agregar categoría
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <Tag size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No hay categorías creadas</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="aspect-video bg-gray-50">
                  {category.image_base64 ? (
                    <img
                      src={category.image_base64}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Tag size={48} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {category.description || 'Sin descripción'}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenModal(category)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors text-sm font-semibold"
                    >
                      <Edit size={16} />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-semibold"
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        >
          {success && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <CheckCircle size={18} className="text-green-500" />
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle size={18} className="text-red-500" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nombre *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })
                }
                required
                placeholder="Ej: Juguetes"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                placeholder="juguetes"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Descripción</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Describe la categoría..."
                className={`${inputClass} resize-none`}
              />
            </div>

            <ImageUploader
              value={form.image_base64}
              onChange={(base64) => setForm({ ...form, image_base64: base64 })}
              label="Imagen de la categoría"
            />

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {formLoading
                ? 'Guardando...'
                : editingCategory
                ? 'Actualizar categoría'
                : 'Crear categoría'}
            </button>
          </form>
        </Modal>
      </main>
    </div>
  );
}
