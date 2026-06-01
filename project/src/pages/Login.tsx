import { useState, FormEvent } from 'react';
import { Baby, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../hooks/useRouter';

export default function Login() {
  const { signIn } = useAuth();
  const { navigate } = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      setError('Correo o contraseña incorrectos. Verifica tus datos.');
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center group-hover:bg-sky-600 transition-colors shadow-lg shadow-sky-200">
              <Baby size={24} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold text-gray-800">
              Peque<span className="text-sky-500">World</span>
            </span>
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-6 mb-2">Bienvenido de nuevo</h1>
          <p className="text-gray-500 text-sm">Inicia sesión para continuar</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50 pr-12 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-sky-200 text-sm"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              ¿No tienes cuenta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-sky-600 font-bold hover:text-sky-700 transition-colors"
              >
                Registrarse gratis
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
