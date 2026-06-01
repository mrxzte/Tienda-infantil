import { useEffect, useState } from 'react';
import { Users, Shield, User as UserIcon } from 'lucide-react';
import api from '../../utils/api';
import SidebarAdmin from '../../components/SidebarAdmin';
import { formatDate } from '../../utils/format';
import { useAuth } from '../../contexts/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (userId === currentUser.id) {
      alert('No puedes cambiar tu propio rol');
      return;
    }

    if (!window.confirm(`¿Cambiar rol a "${newRole}"?`)) return;

    try {
      await api.put(`/users/${userId}/role?role=${newRole}`);
      await fetchUsers();
    } catch (error) {
      alert('Error al cambiar el rol');
      console.error('Error changing role:', error);
    }
  };

  const customerCount = users.filter((u) => u.role === 'customer').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <SidebarAdmin />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Gestiona los usuarios registrados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-5 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-sky-50 text-sky-600">
                <UserIcon size={22} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mb-1">{customerCount}</p>
            <p className="text-sm font-bold text-gray-600">Clientes</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-amber-50 text-amber-600">
                <Shield size={22} />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 mb-1">{adminCount}</p>
            <p className="text-sm font-bold text-gray-600">Administradores</p>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users size={48} className="mx-auto mb-3 opacity-30" />
              <p>No hay usuarios registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Usuario
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Email
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Teléfono
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Registro
                    </th>
                    <th className="text-left py-4 px-6 text-xs font-bold text-gray-600 uppercase">
                      Rol
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-sky-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.full_name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <p className="font-semibold text-gray-900 text-sm">
                            {user.full_name}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs text-sky-600 font-bold">(Tú)</span>
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{user.email}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{user.phone || '-'}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={user.id === currentUser?.id}
                          className={`text-xs font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.role === 'admin'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-sky-100 text-sky-700'
                          }`}
                        >
                          <option value="customer">Cliente</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
