import { useEffect, useState } from 'react';
import { Users as UsersIcon, Search, Shield, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Profile } from '../types';
import SidebarAdmin from '../components/SidebarAdmin';

export default function Users() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setUsers(data);
        setLoading(false);
      });
  }, []);

  const toggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    setUpdatingRole(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as Profile['role'] } : u));
    }
    setUpdatingRole(null);
  };

  const filtered = users.filter(u =>
    search === '' ||
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  const adminsCount = users.filter(u => u.role === 'admin').length;
  const customersCount = users.filter(u => u.role === 'customer').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} usuarios registrados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-2xl font-extrabold text-gray-900">{users.length}</p>
            <p className="text-sm text-gray-500 font-medium">Total</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-2xl font-extrabold text-sky-600">{adminsCount}</p>
            <p className="text-sm text-gray-500 font-medium">Admins</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-2xl font-extrabold text-green-600">{customersCount}</p>
            <p className="text-sm text-gray-500 font-medium">Clientes</p>
          </div>
        </div>

        <div className="relative mb-5">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o ID..."
            className="w-full sm:w-80 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <UsersIcon size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-400">No hay usuarios</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-bold text-gray-500 px-5 py-3">Usuario</th>
                  <th className="text-left text-xs font-bold text-gray-500 px-5 py-3 hidden sm:table-cell">Teléfono</th>
                  <th className="text-left text-xs font-bold text-gray-500 px-5 py-3 hidden md:table-cell">Registrado</th>
                  <th className="text-left text-xs font-bold text-gray-500 px-5 py-3">Rol</th>
                  <th className="text-left text-xs font-bold text-gray-500 px-5 py-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                          user.role === 'admin' ? 'bg-sky-100' : 'bg-gray-100'
                        }`}>
                          {user.role === 'admin'
                            ? <Shield size={16} className="text-sky-600" />
                            : <User size={16} className="text-gray-400" />
                          }
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-sm">{user.full_name || 'Sin nombre'}</p>
                          <p className="text-xs text-gray-400 font-mono">{user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{user.phone || '—'}</span>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <span className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        user.role === 'admin' ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'Cliente'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleRole(user.id, user.role)}
                        disabled={updatingRole === user.id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                          user.role === 'admin'
                            ? 'text-red-600 hover:bg-red-50 border border-red-200'
                            : 'text-sky-600 hover:bg-sky-50 border border-sky-200'
                        }`}
                      >
                        {updatingRole === user.id ? '...' : user.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
