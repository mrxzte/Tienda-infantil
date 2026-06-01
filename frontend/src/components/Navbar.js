import { Baby, ShoppingCart, User, LogOut, LayoutDashboard, Package } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useRouter } from '../hooks/useRouter';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const { navigate, path } = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 group"
            >
              <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center group-hover:bg-sky-600 transition-colors shadow-md shadow-sky-200">
                <Baby size={20} className="text-white" />
              </div>
              <span className="text-xl font-extrabold text-gray-800 hidden sm:block">
                Peque<span className="text-sky-500">World</span>
              </span>
            </button>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/products')}
                className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
                  path === '/products'
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Productos
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-sky-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User menu */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="hidden sm:block text-sm font-semibold text-gray-700">
                      {user.full_name}
                    </span>
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20">
                        <button
                          onClick={() => {
                            navigate('/my-orders');
                            setShowUserMenu(false);
                          }}
                          data-testid="menu-my-orders"
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                        >
                          <Package size={18} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            Mis Pedidos
                          </span>
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              navigate('/admin');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                          >
                            <LayoutDashboard size={18} className="text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">
                              Panel Admin
                            </span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                            navigate('/');
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-100"
                        >
                          <LogOut size={18} className="text-gray-400" />
                          <span className="text-sm font-medium text-gray-700">
                            Cerrar sesión
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white font-bold px-4 py-2 rounded-xl transition-colors shadow-md shadow-sky-200"
                >
                  <User size={18} />
                  <span className="hidden sm:inline">Ingresar</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </>
  );
}
