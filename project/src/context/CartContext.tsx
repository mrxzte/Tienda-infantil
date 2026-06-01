import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { Product, LocalCartItem } from '../types';

interface CartContextType {
  items: LocalCartItem[];
  itemCount: number;
  total: number;
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

const STORAGE_KEY = 'tienda_cart';

function loadLocalCart(): LocalCartItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalCart(items: LocalCartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      syncFromSupabase();
    } else {
      setItems(loadLocalCart());
    }
  }, [user]);

  const syncFromSupabase = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', user!.id);
    if (data) {
      const mapped: LocalCartItem[] = data
        .filter(ci => ci.products)
        .map(ci => ({ product: ci.products as Product, quantity: ci.quantity }));
      setItems(mapped);
    }
    setLoading(false);
  };

  const addItem = async (product: Product, quantity = 1) => {
    const existing = items.find(i => i.product.id === product.id);
    const newQty = (existing?.quantity ?? 0) + quantity;

    if (user) {
      await supabase.from('cart_items').upsert({
        user_id: user.id,
        product_id: product.id,
        quantity: newQty,
      }, { onConflict: 'user_id,product_id' });
    }

    const updated = existing
      ? items.map(i => i.product.id === product.id ? { ...i, quantity: newQty } : i)
      : [...items, { product, quantity }];
    setItems(updated);
    if (!user) saveLocalCart(updated);
  };

  const removeItem = async (productId: string) => {
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);
    }
    const updated = items.filter(i => i.product.id !== productId);
    setItems(updated);
    if (!user) saveLocalCart(updated);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) { await removeItem(productId); return; }
    if (user) {
      await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);
    }
    const updated = items.map(i => i.product.id === productId ? { ...i, quantity } : i);
    setItems(updated);
    if (!user) saveLocalCart(updated);
  };

  const clearCart = async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('user_id', user.id);
    }
    setItems([]);
    if (!user) localStorage.removeItem(STORAGE_KEY);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, itemCount, total, addItem, removeItem, updateQuantity, clearCart, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
