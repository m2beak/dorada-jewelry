// Product Types
export interface Product {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  categoryAr: string;
  inStock: boolean;
  featured: boolean;
  quantity: number;
  sku: string;
  // Custom features - can be added per product
  features: ProductFeature[];
  // Additional custom fields
  weight?: string;
  material?: string;
  size?: string;
  color?: string;
  warranty?: string;
  createdAt: string;
  updatedAt: string;
}

// Product Feature - Custom feature for each product
export interface ProductFeature {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon?: string;
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  createdAt: string;
}

export interface Admin {
  id: string;
  username: string;
  password: string;
  createdAt: string;
}

// Cart Types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Wishlist Type
export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface Wishlist {
  items: WishlistItem[];
}

// Order Types
export interface OrderItem {
  productId: string;
  name: string;
  nameAr: string;
  price: number;
  quantity: number;
  image: string;
  sku: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  statusAr: string;
  createdAt: string;
  updatedAt: string;
  telegramMessageId?: number;
}

// Telegram Bot Config
export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

// App State
export interface AppState {
  currentUser: User | null;
  isAdmin: boolean;
  cart: Cart;
  wishlist: Wishlist;
  orders: Order[];
}

// Toast Notification
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}
