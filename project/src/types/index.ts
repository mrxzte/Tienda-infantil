export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  role: 'customer' | 'admin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category_id: string | null;
  image_url: string;
  featured: boolean;
  created_at: string;
  categories?: Category;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  products?: Product;
}

export interface Order {
  id: string;
  user_id: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: ShippingAddress;
  created_at: string;
  profiles?: Profile;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
  products?: Product;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface LocalCartItem {
  product: Product;
  quantity: number;
}
