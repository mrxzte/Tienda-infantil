import { useState, FormEvent } from 'react';
import { Baby, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../hooks/useRouter';

export default function Register() {
  const { signUp } = useAuth();
  const { navigate } = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este correo ya está registrado. Intenta iniciar sesión.');
      } else {
        setError('Ocurrió un error al registrarse. Intenta de nuevo.');
      }
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    }
    setLoading(false);
  };

  const passwordStrength = () => {
    if (password.length === 0) return null;
    if (password.length < 6) return { level: 'weak', color: 'bg-red-400', label: 'Débil' };
    if (password.length < 10) return { level: 'medium', color: 'bg-amber-400', label: 'Media' };
    return { level: 'strong', color: 'bg-green-500', label: 'Fuerte' };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 group">
            <div className="w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center group-hover:bg-sky-600 transition-colors shadow-lg shadow-sky-200">
              <Baby size={24} className="text-white" />
            </div>
            <span className="text-2xl font-extrabold text-gray-800">
              Peque<span className="text-sky-500">World</span>
            </span>
          </button>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-6 mb-2">Crear cuenta</h1>
          <p className="text-gray-500 text-sm">Únete a miles de familias felices</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8">
          {success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">¡Cuenta creada!</h3>
              <p className="text-gray-500 text-sm">Redirigiendo a la tienda...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nombre completo</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    placeholder="Tu nombre"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50 transition-colors"
                  />
                </div>

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
                      placeholder="Mínimo 6 caracteres"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50 pr-12 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {strength && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full transition-all ${strength.color} ${
                          strength.level === 'weak' ? 'w-1/3' : strength.level === 'medium' ? 'w-2/3' : 'w-full'
                        }`} />
                      </div>
                      <span className="text-xs text-gray-500">{strength.label}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repite tu contraseña"
                    className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-gray-50 transition-colors ${
                      confirmPassword && confirmPassword !== password ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-300 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-sky-200 text-sm mt-2"
                >
                  {loading ? 'Creando cuenta...' : 'Crear cuenta gratis'}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-sky-600 font-bold hover:text-sky-700 transition-colors"
                  >
                    Iniciar sesión
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
