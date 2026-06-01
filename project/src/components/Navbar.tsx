import { useState } from 'react';
import { ShoppingCart, Menu, X, Baby, ChevronDown, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useRouter } from '../hooks/useRouter';

export default function Navbar() {
  const { user, profile, signOut, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { navigate, path } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Productos', href: '/products' },
  ];

  const handleNav = (href: string) => {
    navigate(href);
    setMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setUserMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === '/') return path === '/';
    return path.startsWith(href);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav('/')}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center group-hover:bg-sky-600 transition-colors">
              <Baby size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold text-gray-800">
              Peque<span className="text-sky-500">World</span>
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => handleNav(link.href)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                  isActive(link.href)
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => handleNav('/cart')}
              className="relative p-2 rounded-xl hover:bg-sky-50 transition-colors group"
            >
              <ShoppingCart size={22} className="text-gray-600 group-hover:text-sky-600 transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center">
                    <User size={16} className="text-sky-600" />
                  </div>
                  <span className="hidden md:block text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                    {profile?.full_name || 'Mi cuenta'}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                    {isAdmin && (
                      <button
                        onClick={() => { navigate('/admin'); setUserMenuOpen(false); }}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                      >
                        <LayoutDashboard size={16} />
                        Panel Admin
                      </button>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <button
                  onClick={() => handleNav('/login')}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-sky-600 transition-colors"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => handleNav('/register')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-sky-500 hover:bg-sky-600 rounded-xl transition-colors"
                >
                  Registrarse
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map(link => (
            <button
              key={link.href}
              onClick={() => handleNav(link.href)}
              className={`block w-full text-left px-4 py-3 rounded-xl font-semibold text-sm transition-colors ${
                isActive(link.href)
                  ? 'bg-sky-50 text-sky-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </button>
          ))}
          {!user && (
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => handleNav('/login')}
                className="w-full py-3 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Iniciar sesión
              </button>
              <button
                onClick={() => handleNav('/register')}
                className="w-full py-3 text-sm font-semibold text-white bg-sky-500 rounded-xl hover:bg-sky-600 transition-colors"
              >
                Registrarse
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
