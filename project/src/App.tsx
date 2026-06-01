import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { useRouter } from './hooks/useRouter';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import AdminDashboard from './pages/AdminDashboard';
import AddProduct from './admin/AddProduct';
import EditProduct from './admin/EditProduct';
import Orders from './admin/Orders';
import Users from './admin/Users';
import ProductsList from './admin/ProductsList';

function Router() {
  const { path, navigate, matches } = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [path]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';
  const isAdminRoute = path.startsWith('/admin');
  const isAuthRoute = path === '/login' || path === '/register';

  if (isAdminRoute && !user) { navigate('/login'); return null; }
  if (isAdminRoute && !isAdmin) { navigate('/'); return null; }
  if (path === '/checkout' && !user) { navigate('/login'); return null; }
  if (isAuthRoute && user) { navigate('/'); return null; }

  const renderPage = () => {
    if (path === '/') return <Home />;
    if (path === '/products' || path.startsWith('/products?')) return <Products />;
    if (matches('/product/:id')) return <ProductDetail />;
    if (path === '/cart') return <Cart />;
    if (path === '/login') return <Login />;
    if (path === '/register') return <Register />;
    if (path === '/checkout') return <Checkout />;
    if (path === '/admin') return <AdminDashboard />;
    if (path === '/admin/products') return <ProductsList />;
    if (path === '/admin/products/add') return <AddProduct />;
    if (matches('/admin/products/edit/:id')) return <EditProduct />;
    if (path === '/admin/orders') return <Orders />;
    if (path === '/admin/users') return <Users />;
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-6xl font-extrabold text-gray-200 mb-4">404</h1>
        <p className="text-gray-500 mb-6">Página no encontrada</p>
        <button
          onClick={() => navigate('/')}
          className="bg-sky-500 text-white font-bold px-6 py-3 rounded-xl hover:bg-sky-600 transition-colors"
        >
          Ir al inicio
        </button>
      </div>
    );
  };

  const showNavFooter = !isAdminRoute;

  return (
    <div className="flex flex-col min-h-screen">
      {showNavFooter && <Navbar />}
      <main className="flex-1">
        {renderPage()}
      </main>
      {showNavFooter && <Footer />}
    </div>
  );
}

function CartWrapper() {
  return (
    <CartProvider>
      <Router />
    </CartProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartWrapper />
    </AuthProvider>
  );
}
