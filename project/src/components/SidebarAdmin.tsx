import { LayoutDashboard, Package, ShoppingBag, Users, PlusCircle, Baby, ChevronRight } from 'lucide-react';
import { useRouter } from '../hooks/useRouter';

const links = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Productos', href: '/admin/products', icon: Package },
  { label: 'Agregar Producto', href: '/admin/products/add', icon: PlusCircle },
  { label: 'Pedidos', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Usuarios', href: '/admin/users', icon: Users },
];

export default function SidebarAdmin() {
  const { path, navigate } = useRouter();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return path === href;
    return path.startsWith(href);
  };

  return (
    <aside className="w-64 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-sky-500 rounded-xl flex items-center justify-center">
            <Baby size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-extrabold text-sm">PequeWorld</p>
            <p className="text-gray-400 text-xs">Panel de Administración</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => {
          const Icon = link.icon;
          const active = isActive(link.href, link.exact);
          return (
            <button
              key={link.href}
              onClick={() => navigate(link.href)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                active
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-900/30'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{link.label}</span>
              {active && <ChevronRight size={14} />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={() => navigate('/')}
          className="w-full px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors font-medium"
        >
          Ver tienda
        </button>
      </div>
    </aside>
  );
}
