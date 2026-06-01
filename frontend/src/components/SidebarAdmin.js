import { LayoutDashboard, Package, Tag, ShoppingBag, Users, LogOut } from 'lucide-react';
import { useRouter } from '../hooks/useRouter';
import { useAuth } from '../contexts/AuthContext';

export default function SidebarAdmin() {
  const { path, navigate } = useRouter();
  const { logout } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Package, label: 'Productos', path: '/admin/products' },
    { icon: Tag, label: 'Categorías', path: '/admin/categories' },
    { icon: ShoppingBag, label: 'Pedidos', path: '/admin/orders' },
    { icon: Users, label: 'Usuarios', path: '/admin/users' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-xl font-extrabold text-gray-900">Panel Admin</h2>
        <p className="text-sm text-gray-500">PequeWorld</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = path === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${
                isActive
                  ? 'bg-sky-50 text-sky-600 font-bold'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors text-left mb-2"
        >
          <LayoutDashboard size={20} />
          <span>Ver tienda</span>
        </button>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-left"
        >
          <LogOut size={20} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}
