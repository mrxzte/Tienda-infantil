import { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { useRouter } from './hooks/useRouter';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutResult from './pages/CheckoutResult';
import MyOrders from './pages/MyOrders';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminAddProduct from './pages/admin/AdminAddProduct';
import AdminEditProduct from './pages/admin/AdminEditProduct';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';

function Router() {
  const { path, navigate, matches } = useRouter();
  const { user, loading, isAdmin } = useAuth();

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

  const isAdminRoute = path.startsWith('/admin');

  // Proteger rutas de admin
  if (isAdminRoute && !user) {
    navigate('/');
    return null;
  }
  if (isAdminRoute && !isAdmin) {
    navigate('/');
    return null;
  }

  // Proteger checkout
  if (path === '/checkout' && !user) {
    navigate('/cart');
    return null;
  }

  // Proteger mis pedidos
  if (path === '/my-orders' && !user) {
    navigate('/');
    return null;
  }

  const renderPage = () => {
    if (path === '/') return <Home />;
    if (path === '/products' || path.startsWith('/products?')) return <Products />;
    if (matches('/product/:id')) return <ProductDetail />;
    if (path === '/cart') return <Cart />;
    if (path === '/checkout') return <Checkout />;
    if (path === '/checkout/result' || path.startsWith('/checkout/result?')) return <CheckoutResult />;
    if (path === '/my-orders') return <MyOrders />;
    if (path === '/admin') return <AdminDashboard />;
    if (path === '/admin/products') return <AdminProducts />;
    if (path === '/admin/products/add') return <AdminAddProduct />;
    if (matches('/admin/products/edit/:id')) return <AdminEditProduct />;
    if (path === '/admin/categories') return <AdminCategories />;
    if (path === '/admin/orders') return <AdminOrders />;
    if (path === '/admin/users') return <AdminUsers />;
    
    // 404
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
      <main className="flex-1">{renderPage()}</main>
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
