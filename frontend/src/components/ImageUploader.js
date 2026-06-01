import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { imageToBase64 } from '../utils/format';

export default function ImageUploader({ value, onChange, label = 'Imagen del producto' }) {
  const [preview, setPreview] = useState(value || '');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      return;
    }

    // Validar tamaño (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe pesar menos de 2MB');
      return;
    }

    setUploading(true);
    try {
      const base64 = await imageToBase64(file);
      setPreview(base64);
      onChange(base64);
    } catch (error) {
      console.error('Error converting image:', error);
      alert('Error al procesar la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview('');
    onChange('');
  };

  return (
    <div>
      <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
      
      {preview ? (
        <div className="relative group">
          <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-sky-500 hover:bg-sky-50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Upload size={32} className="text-gray-400 mb-2" />
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Subir imagen
              </p>
              <p className="text-xs text-gray-400 px-4 text-center">
                JPG, PNG o WEBP (máx. 2MB)
              </p>
            </>
          )}
        </label>
      )}
    </div>
  );
}
