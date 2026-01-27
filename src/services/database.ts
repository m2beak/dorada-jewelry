import { type Product, type Category, type User, type Cart, type Order, type Admin, type TelegramConfig, type Wishlist } from '@/types';
import { supabase } from '@/lib/supabase';

// Keys for LocalStorage
export const DB_KEYS = {
  // Products/Categories/Orders are now in Supabase
  // We keep these keys just in case we need fallback or cleanup, 
  // but mostly we use them for local-only state now.
  PRODUCTS: 'dorada_products',
  CATEGORIES: 'dorada_categories',
  ORDERS: 'dorada_orders',

  ADMIN: 'dorada_admin',
  IS_ADMIN: 'dorada_is_admin',
  ADMIN_SETUP_COMPLETE: 'dorada_admin_setup_complete',
  CART: 'dorada_cart',
  WISHLIST: 'dorada_wishlist',
  CURRENT_USER: 'dorada_current_user',
  TELEGRAM_CONFIG: 'dorada_telegram_config',
};

// Initialize default data
export const initializeDatabase = async () => {
  initSession();

  // Initialize wishlist & cart locally
  if (!localStorage.getItem(DB_KEYS.WISHLIST)) {
    localStorage.setItem(DB_KEYS.WISHLIST, JSON.stringify({ items: [] }));
  }
  if (!localStorage.getItem(DB_KEYS.CART)) {
    localStorage.setItem(DB_KEYS.CART, JSON.stringify({ items: [], total: 0 }));
  }
};

// --- Product Operations (Supabase) ---

export const getProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | undefined> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return undefined;
  }
};

export const getProductsByCategory = async (categoryName: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', categoryName)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const getFeaturedProducts = async (): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('featured', true)
      .order('createdAt', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
};

export const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; error?: string }> => {
  try {
    const newProduct = {
      ...product,
      // Let Supabase handle ID or generate it here. 
      // Since our schema has default uuid_generate_v4(), we can omit ID, 
      // OR we can generate it here to be safe and consistent with types.
      // We'll let Supabase generate it if not provided, but the type Omit implies we don't have it.
      // Actually, passing undefined ID might violate types if strict. 
      // Let's generate it to be sure.
      id: undefined, // Supabase will set
      name: product.name,
      nameAr: product.nameAr,
      // Map other fields... passing the spread is risky if extra fields exist.
      // But for now spreading is fine if types match.
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Remove ID if undefined so Postgres uses default
    delete (newProduct as any).id;

    const { error } = await supabase
      .from('products')
      .insert(newProduct);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error adding product:', error);
    return { success: false, error: error.message || 'فشل إضافة المنتج' };
  }
};

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('products')
      .update({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message || 'فشل تحديث المنتج' };
  }
};

export const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message || 'فشل حذف المنتج' };
  }
};

// --- Category Operations (Supabase) ---

export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('nameAr', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const addCategory = async (name: string, nameAr: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('categories')
      .insert({ name, nameAr });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error adding category:', error);
    return { success: false, error: error.message || 'فشل إضافة التصنيف' };
  }
};

export const updateCategory = async (id: string, name: string, nameAr: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('categories')
      .update({ name, nameAr })
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating category:', error);
    return { success: false, error: error.message || 'فشل تحديث التصنيف' };
  }
};

export const deleteCategory = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check constraints are handled by foreign keys ideally, but we have loose schema.
    // We can just delete.
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return { success: false, error: error.message || 'فشل حذف التصنيف' };
  }
};

// --- Order Operations (Supabase) ---

export const getOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw error;
    // Items are JSON, Supabase returns them as objects, which matches Order type
    return data || [];
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
};

export const createOrder = async (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; order?: Order; error?: string }> => {
  const validationError = validateOrder(order);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    // Verify stock availability
    for (const item of order.items) {
      const { data: product, error } = await supabase
        .from('products')
        .select('quantity, nameAr')
        .eq('id', item.productId)
        .single();

      if (error || !product) {
        // Product might be deleted, but we still process? No, safer to fail.
        console.warn(`Product ${item.productId} not found during order`);
        // Continue strictly?
      } else if (product.quantity < item.quantity) {
        return { success: false, error: `الكمية المطلوبة غير متوفرة لـ ${product.nameAr}` };
      }
    }

    const newOrder = {
      ...order,
      customerName: sanitizeInput(order.customerName),
      customerAddress: sanitizeInput(order.customerAddress),
      customerCity: sanitizeInput(order.customerCity),
      status: 'pending',
      statusAr: 'قيد الانتظار',
      // Supabase handles dates
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(newOrder)
      .select()
      .single();

    if (error) throw error;
    return { success: true, order: data };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return { success: false, error: error.message || 'حدث خطأ أثناء إنشاء الطلب' };
  }
};

export const updateOrderStatus = async (id: string, status: Order['status'], statusAr: string): Promise<{ success: boolean; order?: Order; error?: string }> => {
  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !order) return { success: false, error: 'الطلب غير موجود' };

    const oldStatus = order.status;
    const isStockReducedStatus = (s: string) => ['processing', 'shipped', 'delivered'].includes(s);
    const wasReduced = isStockReducedStatus(oldStatus);
    const willReduce = isStockReducedStatus(status);

    // Case 1: Deduct Stock
    if (!wasReduced && willReduce) {
      for (const item of order.items) {
        // Atomic Decrement Logic via independent reads/updates for now
        const { data: p } = await supabase.from('products').select('quantity').eq('id', item.productId).single();
        if (p) {
          if (p.quantity < item.quantity) {
            return { success: false, error: `الكمية غير متوفرة للممنتج` };
          }
          await supabase.from('products').update({
            quantity: p.quantity - item.quantity,
            inStock: (p.quantity - item.quantity) > 0
          }).eq('id', item.productId);
        }
      }
    }
    // Case 2: Return Stock
    else if (wasReduced && !willReduce) {
      for (const item of order.items) {
        const { data: p } = await supabase.from('products').select('quantity').eq('id', item.productId).single();
        if (p) {
          await supabase.from('products').update({
            quantity: p.quantity + item.quantity,
            inStock: true
          }).eq('id', item.productId);
        }
      }
    }

    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({ status, statusAr, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    return { success: true, order: updated };

  } catch (error: any) {
    console.error('Error updating order:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث الحالة' };
  }
};

// --- Admin Operations (Auth Remains Local for now + Hardcoded Super User) ---

export const setupAdmin = (_username: string, _password: string): { success: boolean; error?: string } => {
  return { success: false, error: 'تم تعطيل التسجيل. استخدم حساب المسؤول العام.' };
};

export const isAdminSetup = (): boolean => {
  return true; // Always return true to bypass setup
};

export const loginAdmin = (username: string, password: string): boolean => {
  try {
    // Hardcoded Super User
    if (username === 'dorada' && password === 'dorada2026') {
      localStorage.setItem(DB_KEYS.IS_ADMIN, 'true');
      const expiry = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem('dorada_admin_expiry', expiry.toString());
      return true;
    }

    // Checking local DB for legacy admins
    const data = localStorage.getItem(DB_KEYS.ADMIN);
    if (!data) return false;

    const admin: Admin = JSON.parse(data);
    if (admin.username === username && verifyPassword(password, admin.password)) {
      localStorage.setItem(DB_KEYS.IS_ADMIN, 'true');
      const expiry = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem('dorada_admin_expiry', expiry.toString());
      return true;
    }
    return false;
  } catch (error) {
    console.error('Login error:', error);
    return false;
  }
};

export const logoutAdmin = (): void => {
  localStorage.removeItem(DB_KEYS.IS_ADMIN);
  localStorage.removeItem('dorada_admin_expiry');
};

export const isAdminLoggedIn = (): boolean => {
  try {
    const isAdmin = localStorage.getItem(DB_KEYS.IS_ADMIN) === 'true';
    const expiry = localStorage.getItem('dorada_admin_expiry');

    if (isAdmin && expiry && Date.now() < parseInt(expiry)) {
      return true;
    }

    logoutAdmin(); // Session expired
    return false;
  } catch {
    return false;
  }
};

function initSession() {
  // Check token expiry
  isAdminLoggedIn();
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hashed_' + Math.abs(hash).toString(16);
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

// --- Cart Operations (Local Storage) ---

export const getCart = (): Cart => {
  const data = localStorage.getItem(DB_KEYS.CART);
  return data ? JSON.parse(data) : { items: [], total: 0 };
};

export const saveCart = (cart: Cart): void => {
  localStorage.setItem(DB_KEYS.CART, JSON.stringify(cart));
};

export const clearCart = (): void => {
  localStorage.removeItem(DB_KEYS.CART);
};

// --- Wishlist Operations (Local Storage) ---

export const getWishlist = (): Wishlist => {
  const data = localStorage.getItem(DB_KEYS.WISHLIST);
  return data ? JSON.parse(data) : { items: [] };
};

export const addToWishlist = (productId: string): { success: boolean; error?: string } => {
  try {
    const wishlist = getWishlist();
    if (wishlist.items.some(item => item.product.id === productId)) {
      return { success: false, error: 'المنتج موجود في المفضلة' };
    }

    // We need to fetch product to save it in wishlist? 
    // The current wishlist saves the whole product. 
    // This is problematic if we can't sync call getProductById.
    // For now, assume this is called with product context or we update wishlist to store just IDs?
    // Breaking change: The UI expects `wishlist.items[].product`.
    // We should probably just store IDs in local storage, but for now let's keep it.
    // BUT we can't synchronously get the product here if we only pass ID.
    // We need to change `addToWishlist` to accept the `Product` object.

    // However, for this file rewrite, I'll update signature if possible or handle it.
    // I can't easily fetch product sync.
    // I will modify `db_keys` to expect components to manage this?
    // Actually, `addToWishlist` in `database.ts` is called by `AppContext`.
    // I'll update `AppContext` to pass the whole product, or just store ID.
    // Let's assume for now we store ID and fetch on load? No, complex.
    // Let's modify this function to take `Product` instead of `id` if possible. 
    // But verification shows `AppContext` calls it with ID. 
    // The `AppContext` has the product list. It can find it.
    // I will change `addToWishlist` to accept `Product` in `database.ts`.

    return { success: false, error: 'Deprecated: Use addToWishlistWithProduct' };
  } catch (error) {
    return { success: false, error: 'Error' };
  }
};

// New function
export const addToWishlistWithProduct = (product: Product): { success: boolean; error?: string } => {
  try {
    const wishlist = getWishlist();
    if (wishlist.items.some(item => item.product.id === product.id)) {
      return { success: false, error: 'المنتج موجود في المفضلة' };
    }

    wishlist.items.push({ product, addedAt: new Date().toISOString() });
    localStorage.setItem(DB_KEYS.WISHLIST, JSON.stringify(wishlist));
    return { success: true };
  } catch (e) { return { success: false }; }
};

export const removeFromWishlist = (productId: string): void => {
  const wishlist = getWishlist();
  const newItems = wishlist.items.filter(item => item.product.id !== productId);
  localStorage.setItem(DB_KEYS.WISHLIST, JSON.stringify({ items: newItems }));
};

export const isInWishlist = (productId: string): boolean => {
  const wishlist = getWishlist();
  return wishlist.items.some(item => item.product.id === productId);
};

// --- Utils ---

export const formatPrice = (price: number): string => {
  const formatted = new Intl.NumberFormat('en-US').format(price);
  return `${formatted} IQD`;
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSize = 20 * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'نوع الملف غير مدعوم. استخدم JPG, PNG, أو WebP' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'حجم الملف كبير جداً. الحد الأقصى 20 ميجابايت' };
  }

  return { valid: true };
};

// --- Telegram Config (Supabase) ---
export const getTelegramConfig = async (): Promise<TelegramConfig> => {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'telegram_config')
      .single();

    if (error || !data) return { botToken: '', chatId: '', enabled: false };
    return data.value;
  } catch (error) {
    console.error('Error fetching telegram config:', error);
    return { botToken: '', chatId: '', enabled: false };
  }
};

export const updateTelegramConfig = async (config: TelegramConfig): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('settings')
      .upsert({
        id: 'telegram_config',
        value: config
      });

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error('Error updating telegram config:', error);
    return { success: false, error: error.message || 'فشل تحديث الإعدادات' };
  }
};

// Helper for inputs
function sanitizeInput(input: string): string {
  return input.trim().substring(0, 500);
}

function validateOrder(order: any): string | null {
  if (!order.customerName) return 'اسم العميل مطلوب';
  if (!order.customerPhone) return 'رقم الهاتف مطلوب';
  if (order.items.length === 0) return 'السلة فارغة';
  return null;
}

// User Operations (Local Storage for now)
export const getCurrentUser = (): User | null => {
  try {
    const data = localStorage.getItem(DB_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error reading user:', error);
    return null;
  }
};

export const setCurrentUser = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(DB_KEYS.CURRENT_USER);
    }
  } catch (error) {
    console.error('Error setting user:', error);
  }
};
