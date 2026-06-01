import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar carrito cuando el usuario está autenticado
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get('/cart');
      setItems(data);
    } catch (error) {
      console.error('Error al cargar carrito:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) {
      throw new Error('Debes iniciar sesión para agregar al carrito');
    }
    
    try {
      await api.post('/cart', { product_id: productId, quantity });
      await fetchCart();
      return { error: null };
    } catch (error) {
      return { error: error.response?.data?.detail || 'Error al agregar al carrito' };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await api.put(`/cart/${itemId}?quantity=${quantity}`);
      await fetchCart();
      return { error: null };
    } catch (error) {
      return { error: error.response?.data?.detail || 'Error al actualizar cantidad' };
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
      return { error: null };
    } catch (error) {
      return { error: error.response?.data?.detail || 'Error al eliminar del carrito' };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setItems([]);
      return { error: null };
    } catch (error) {
      return { error: error.response?.data?.detail || 'Error al limpiar carrito' };
    }
  };

  const total = items.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        fetchCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
}
