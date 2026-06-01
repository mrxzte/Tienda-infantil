import { useState } from 'react';
import { Eye, EyeOff, AlertCircle, Baby } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Modal from './Modal';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Login form
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  
  // Register form
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await login(loginData.email, loginData.password);
    
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      onClose();
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await register(
      registerData.email,
      registerData.password,
      registerData.full_name,
      registerData.phone
    );
    
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      onClose();
    }
  };

  const inputClass =
    'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {/* Logo */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-200">
            <Baby size={24} className="text-white" />
          </div>
          <span className="text-2xl font-extrabold text-gray-800">
            Peque<span className="text-sky-500">World</span>
          </span>
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          {mode === 'login' ? 'Bienvenido de nuevo' : '¡Únete a nosotros!'}
        </h2>
        <p className="text-gray-500 text-sm">
          {mode === 'login'
            ? 'Inicia sesión para continuar'
            : 'Crea tu cuenta gratis'}
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData({ ...loginData, email: e.target.value })
              }
              required
              placeholder="tu@correo.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
                required
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
      ) : (
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              value={registerData.full_name}
              onChange={(e) =>
                setRegisterData({ ...registerData, full_name: e.target.value })
              }
              required
              placeholder="Tu nombre"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              value={registerData.email}
              onChange={(e) =>
                setRegisterData({ ...registerData, email: e.target.value })
              }
              required
              placeholder="tu@correo.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              value={registerData.phone}
              onChange={(e) =>
                setRegisterData({ ...registerData, phone: e.target.value })
              }
              placeholder="+57 300 123 4567"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
                required
                placeholder="••••••••"
                className={`${inputClass} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-sky-200 text-sm"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>
      )}

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="text-sky-600 font-bold hover:text-sky-700 transition-colors"
          >
            {mode === 'login' ? 'Registrarse gratis' : 'Iniciar sesión'}
          </button>
        </p>
      </div>
    </Modal>
  );
}
