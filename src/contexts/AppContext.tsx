import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product, Cart, CartItem, User, Order, Wishlist, Toast } from '@/types';
import {
  getProducts,
  getCart,
  saveCart,
  clearCart,
  getCurrentUser,
  setCurrentUser,
  isAdminLoggedIn,
  createOrder,
  formatPrice,
  initializeDatabase,
  getWishlist,
  addToWishlistWithProduct,
  removeFromWishlist,
  isInWishlist,
} from '@/services/database';


interface AppContextType {
  // Products
  products: Product[];
  refreshProducts: () => void;

  // Cart
  cart: Cart;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCartItems: () => void;
  cartItemsCount: number;

  // Wishlist
  wishlist: Wishlist;
  addToWishlistFn: (productId: string) => { success: boolean; error?: string };
  removeFromWishlistFn: (productId: string) => void;
  isInWishlistFn: (productId: string) => boolean;
  wishlistItemsCount: number;

  // User
  currentUser: User | null;
  setUser: (user: User | null) => void;

  // Admin
  isAdmin: boolean;
  setAdmin: (value: boolean) => void;

  // Order
  placeOrder: (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
  }) => Promise<{ success: boolean; order?: Order; error?: string }>;

  // Toast
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  removeToast: (id: string) => void;

  // Utils
  formatPrice: (price: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize database on mount
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);

  const refreshProducts = useCallback(async () => {
    const data = await getProducts();
    setProducts(data);
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  // Cart State
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });

  useEffect(() => {
    setCart(getCart());
  }, []);

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    // Check if product is in stock
    if (product.quantity <= 0) {
      showToast('نفذت الكمية - المنتج غير متوفر', 'error');
      return;
    }

    const currentCart = getCart();
    const existingItem = currentCart.items.find((item: CartItem) => item.product.id === product.id);

    // Check if adding would exceed available quantity
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    if (currentQuantity + quantity > product.quantity) {
      showToast(`الكمية المتوفرة: ${product.quantity} فقط`, 'error');
      return;
    }

    let newItems: CartItem[];
    if (existingItem) {
      newItems = currentCart.items.map((item: CartItem) =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      newItems = [...currentCart.items, { product, quantity }];
    }

    const newTotal = newItems.reduce((sum: number, item: CartItem) =>
      sum + (item.product.price * item.quantity), 0
    );

    const newCart = { items: newItems, total: newTotal };
    saveCart(newCart);
    setCart(newCart);
    showToast('تمت الإضافة إلى السلة', 'success');
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    const currentCart = getCart();
    const newItems = currentCart.items.filter((item: CartItem) => item.product.id !== productId);
    const newTotal = newItems.reduce((sum: number, item: CartItem) =>
      sum + (item.product.price * item.quantity), 0
    );

    const newCart = { items: newItems, total: newTotal };
    saveCart(newCart);
    setCart(newCart);
  }, []);

  const updateCartItemQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const currentCart = getCart();
    const product = currentCart.items.find((item: CartItem) => item.product.id === productId)?.product;

    if (product && quantity > product.quantity) {
      showToast(`الكمية المتوفرة: ${product.quantity} فقط`, 'error');
      return;
    }

    const newItems = currentCart.items.map((item: CartItem) =>
      item.product.id === productId ? { ...item, quantity } : item
    );

    const newTotal = newItems.reduce((sum: number, item: CartItem) =>
      sum + (item.product.price * item.quantity), 0
    );

    const newCart = { items: newItems, total: newTotal };
    saveCart(newCart);
    setCart(newCart);
  }, [removeFromCart]);

  const clearCartItems = useCallback(() => {
    clearCart();
    setCart({ items: [], total: 0 });
  }, []);

  const cartItemsCount = cart.items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  // Wishlist State
  const [wishlist, setWishlist] = useState<Wishlist>({ items: [] });

  useEffect(() => {
    setWishlist(getWishlist());
  }, []);

  const addToWishlistFn = useCallback((productId: string) => {
    // Find the product from our state
    const product = products.find(p => p.id === productId);
    if (!product) {
      showToast('المنتج غير موجود', 'error');
      return { success: false, error: 'Not found' };
    }

    // Use our new Helper that accepts Product
    const result = addToWishlistWithProduct(product);

    if (result.success) {
      setWishlist(getWishlist());
      showToast('تمت الإضافة إلى المفضلة', 'success');
    } else if (result.error === 'المنتج موجود في المفضلة') {
      showToast('المنتج موجود في المفضلة', 'info');
    } else {
      showToast(result.error || 'حدث خطأ', 'error');
    }
    return result;
  }, [products]);

  const removeFromWishlistFn = useCallback((productId: string) => {
    removeFromWishlist(productId);
    setWishlist(getWishlist());
    showToast('تمت الإزالة من المفضلة', 'success');
  }, []);

  const isInWishlistFn = useCallback((productId: string) => {
    return isInWishlist(productId);
  }, []);

  const wishlistItemsCount = wishlist.items.length;

  // User State
  const [currentUser, setCurrentUserState] = useState<User | null>(null);

  useEffect(() => {
    setCurrentUserState(getCurrentUser());
  }, []);

  const setUser = useCallback((user: User | null) => {
    setCurrentUser(user);
    setCurrentUserState(user);
  }, []);

  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isAdminLoggedIn());
  }, []);

  const setAdmin = useCallback((value: boolean) => {
    setIsAdmin(value);
  }, []);

  // Toast State
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', duration: number = 3000) => {
    const id = Math.random().toString(36).substring(7);
    const newToast: Toast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Order Function
  const placeOrder = useCallback(async (orderData: {
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
  }) => {
    const currentCart = getCart();

    if (currentCart.items.length === 0) {
      return { success: false, error: 'السلة فارغة' };
    }

    const orderItems = currentCart.items.map((item: CartItem) => ({
      productId: item.product.id,
      name: item.product.name,
      nameAr: item.product.nameAr,
      price: item.product.price,
      quantity: item.quantity,
      image: item.product.images[0] || '',
      sku: item.product.sku,
    }));

    const result = await createOrder({
      ...orderData,
      items: orderItems,
      total: currentCart.total + 5000,
      status: 'pending',
      statusAr: 'قيد الانتظار',
    });

    if (!result.success || !result.order) {
      return { success: false, error: result.error || 'حدث خطأ أثناء إنشاء الطلب' };
    }

    // Telegram notification is now handled server-side (in SQL)


    // Refresh products to update quantities
    refreshProducts();

    // Clear cart after successful order
    clearCartItems();

    return { success: true, order: result.order };
  }, [clearCartItems, refreshProducts]);

  const value: AppContextType = {
    products,
    refreshProducts,
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCartItems,
    cartItemsCount,
    wishlist,
    addToWishlistFn,
    removeFromWishlistFn,
    isInWishlistFn,
    wishlistItemsCount,
    currentUser,
    setUser,
    isAdmin,
    setAdmin,
    placeOrder,
    toasts,
    showToast,
    removeToast,
    formatPrice,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
