import { v4 as uuidv4 } from 'uuid';
import type { Product, Category, Order, User, Admin, TelegramConfig, Wishlist } from '@/types';

// Database Keys
const DB_KEYS = {
  PRODUCTS: 'dorada_products_v4',
  CATEGORIES: 'dorada_categories_v4',
  ORDERS: 'dorada_orders_v4',
  USERS: 'dorada_users_v4',
  ADMIN: 'dorada_admin_v4',
  TELEGRAM_CONFIG: 'dorada_telegram_config_v4',
  CURRENT_USER: 'dorada_current_user_v4',
  CART: 'dorada_cart_v4',
  WISHLIST: 'dorada_wishlist_v4',
  IS_ADMIN: 'dorada_is_admin_v4',
  SESSION_LOCK: 'dorada_session_lock',
  ADMIN_SETUP_COMPLETE: 'dorada_admin_setup',
};

// Session Management for concurrent users
class SessionManager {
  private static instance: SessionManager;
  private sessionId: string;

  private constructor() {
    this.sessionId = uuidv4();
    this.acquireLock();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private acquireLock(): void {
    const now = Date.now();
    const lock = localStorage.getItem(DB_KEYS.SESSION_LOCK);
    
    if (!lock) {
      localStorage.setItem(DB_KEYS.SESSION_LOCK, JSON.stringify({ 
        sessionId: this.sessionId, 
        timestamp: now 
      }));
    }
  }

  public refreshLock(): void {
    localStorage.setItem(DB_KEYS.SESSION_LOCK, JSON.stringify({ 
      sessionId: this.sessionId, 
      timestamp: Date.now() 
    }));
  }
}

// Initialize Session Manager
export const initSession = () => SessionManager.getInstance();

// Check if admin is already set up
export const isAdminSetup = (): boolean => {
  return localStorage.getItem(DB_KEYS.ADMIN_SETUP_COMPLETE) === 'true';
};

// Setup admin for first time
export const setupAdmin = (username: string, password: string): { success: boolean; error?: string } => {
  if (!username.trim() || username.length < 3) {
    return { success: false, error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' };
  }

  try {
    const admin: Admin = {
      id: uuidv4(),
      username: username.trim(),
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(DB_KEYS.ADMIN, JSON.stringify(admin));
    localStorage.setItem(DB_KEYS.ADMIN_SETUP_COMPLETE, 'true');
    return { success: true };
  } catch (error) {
    console.error('Error setting up admin:', error);
    return { success: false, error: 'حدث خطأ أثناء إنشاء المسؤول' };
  }
};

// Initialize default data
export const initializeDatabase = () => {
  initSession();

  // Create default categories if not exists
  if (!localStorage.getItem(DB_KEYS.CATEGORIES)) {
    const defaultCategories: Category[] = [
      { id: uuidv4(), name: 'Necklaces', nameAr: 'القلائد', icon: 'necklace' },
      { id: uuidv4(), name: 'Bracelets', nameAr: 'الأساور', icon: 'bracelet' },
      { id: uuidv4(), name: 'Rings', nameAr: 'الخواتم', icon: 'ring' },
      { id: uuidv4(), name: 'Earrings', nameAr: 'الأقراط', icon: 'earrings' },
      { id: uuidv4(), name: 'Watches', nameAr: 'الساعات', icon: 'watch' },
      { id: uuidv4(), name: 'Sets', nameAr: 'الطقم', icon: 'set' },
    ];
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(defaultCategories));
  }

  // Create sample products if not exists
  if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
    const sampleProducts: Product[] = [
      {
        id: uuidv4(),
        name: 'Celestial Diamond Necklace',
        nameAr: 'قلادة الماس السماوية',
        description: 'Exquisite diamond necklace with celestial design',
        descriptionAr: 'قلادة ماسية رائعة بتصميم سماوي',
        price: 2750000,
        originalPrice: 3200000,
        images: ['/product1.jpg'],
        category: 'Necklaces',
        categoryAr: 'القلائد',
        inStock: true,
        featured: true,
        quantity: 5,
        sku: 'DOR-NCK-001',
        features: [
          { id: uuidv4(), label: 'الجودة', value: 'جودة رائعة' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Geometric Gold Bracelet',
        nameAr: 'سوار الذهب الهندسي',
        description: 'Modern geometric design gold bracelet',
        descriptionAr: 'سوار ذهبي بتصميم هندسي عصري',
        price: 1430000,
        images: ['/product2.jpg'],
        category: 'Bracelets',
        categoryAr: 'الأساور',
        inStock: true,
        featured: true,
        quantity: 3,
        sku: 'DOR-BRC-002',
        features: [
          { id: uuidv4(), label: 'الجودة', value: 'جودة رائعة' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        name: 'Royal Sapphire Ring',
        nameAr: 'خاتم الياقوت الملكي',
        description: 'Elegant sapphire ring with gold band',
        descriptionAr: 'خاتم ياقوت أنيق بإطار ذهبي',
        price: 4290000,
        images: ['/product3.jpg'],
        category: 'Rings',
        categoryAr: 'الخواتم',
        inStock: true,
        featured: true,
        quantity: 2,
        sku: 'DOR-RNG-003',
        features: [
          { id: uuidv4(), label: 'الجودة', value: 'جودة رائعة' },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(sampleProducts));
  }

  // Initialize Telegram config
  if (!localStorage.getItem(DB_KEYS.TELEGRAM_CONFIG)) {
    const telegramConfig: TelegramConfig = {
      botToken: '',
      chatId: '',
      enabled: false,
    };
    localStorage.setItem(DB_KEYS.TELEGRAM_CONFIG, JSON.stringify(telegramConfig));
  }

  // Initialize wishlist
  if (!localStorage.getItem(DB_KEYS.WISHLIST)) {
    localStorage.setItem(DB_KEYS.WISHLIST, JSON.stringify({ items: [] }));
  }
};

// Simple password hashing (for demo - use bcrypt in production)
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

// Validation functions
const validateProduct = (product: Partial<Product>): string | null => {
  if (!product.nameAr?.trim()) return 'اسم المنتج (عربي) مطلوب';
  if (!product.name?.trim()) return 'اسم المنتج (إنجليزي) مطلوب';
  if (!product.price || product.price <= 0) return 'السعر يجب أن يكون أكبر من صفر';
  if (!product.images || product.images.length === 0) return 'صورة المنتج مطلوبة';
  if (!product.category?.trim()) return 'التصنيف مطلوب';
  if (!product.sku?.trim()) return 'كود المنتج (SKU) مطلوب';
  if (product.quantity === undefined || product.quantity < 0) return 'الكمية يجب أن تكون 0 أو أكثر';
  return null;
};

const validateOrder = (order: Partial<Order>): string | null => {
  if (!order.customerName?.trim()) return 'اسم العميل مطلوب';
  if (!order.customerPhone?.trim()) return 'رقم الهاتف مطلوب';
  if (!/^[0-9]{10,15}$/.test(order.customerPhone.replace(/\s/g, ''))) {
    return 'رقم الهاتف غير صحيح';
  }
  if (!order.customerAddress?.trim()) return 'العنوان مطلوب';
  if (!order.customerCity?.trim()) return 'المدينة مطلوبة';
  if (!order.items || order.items.length === 0) return 'السلة فارغة';
  return null;
};

// Sanitize input to prevent XSS
const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Product Operations
export const getProducts = (): Product[] => {
  try {
    const data = localStorage.getItem(DB_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
};

export const getProductById = (id: string): Product | null => {
  const products = getProducts();
  return products.find(p => p.id === id) || null;
};

export const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; product?: Product; error?: string } => {
  const validationError = validateProduct(product);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const products = getProducts();
    const newProduct: Product = {
      ...product,
      nameAr: sanitizeInput(product.nameAr),
      name: sanitizeInput(product.name),
      descriptionAr: product.descriptionAr ? sanitizeInput(product.descriptionAr) : '',
      description: product.description ? sanitizeInput(product.description) : '',
      sku: product.sku.toUpperCase(),
      features: product.features || [],
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    products.push(newProduct);
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    return { success: true, product: newProduct };
  } catch (error) {
    console.error('Error adding product:', error);
    return { success: false, error: 'حدث خطأ أثناء إضافة المنتج' };
  }
};

export const updateProduct = (id: string, updates: Partial<Product>): { success: boolean; product?: Product; error?: string } => {
  const validationError = validateProduct(updates);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return { success: false, error: 'المنتج غير موجود' };
    
    products[index] = {
      ...products[index],
      ...updates,
      nameAr: updates.nameAr ? sanitizeInput(updates.nameAr) : products[index].nameAr,
      name: updates.name ? sanitizeInput(updates.name) : products[index].name,
      descriptionAr: updates.descriptionAr ? sanitizeInput(updates.descriptionAr) : products[index].descriptionAr,
      description: updates.description ? sanitizeInput(updates.description) : products[index].description,
      sku: updates.sku ? updates.sku.toUpperCase() : products[index].sku,
      features: updates.features || products[index].features,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    return { success: true, product: products[index] };
  } catch (error) {
    console.error('Error updating product:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث المنتج' };
  }
};

export const deleteProduct = (id: string): { success: boolean; error?: string } => {
  try {
    const products = getProducts();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return { success: false, error: 'المنتج غير موجود' };
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, error: 'حدث خطأ أثناء حذف المنتج' };
  }
};

export const getFeaturedProducts = (): Product[] => {
  // Show all featured products including out of stock
  return getProducts().filter(p => p.featured);
};

export const getProductsByCategory = (category: string): Product[] => {
  // Show all products in category including out of stock
  return getProducts().filter(p => p.category === category);
};

// Category Operations
export const getCategories = (): Category[] => {
  try {
    const data = localStorage.getItem(DB_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
};

export const addCategory = (name: string, nameAr: string): { success: boolean; category?: Category; error?: string } => {
  if (!name.trim() || !nameAr.trim()) {
    return { success: false, error: 'اسم التصنيف مطلوب' };
  }

  try {
    const categories = getCategories();
    const newCategory: Category = {
      id: uuidv4(),
      name: sanitizeInput(name),
      nameAr: sanitizeInput(nameAr),
    };
    categories.push(newCategory);
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(categories));
    return { success: true, category: newCategory };
  } catch (error) {
    console.error('Error adding category:', error);
    return { success: false, error: 'حدث خطأ أثناء إضافة التصنيف' };
  }
};

export const updateCategory = (id: string, name: string, nameAr: string): { success: boolean; category?: Category; error?: string } => {
  if (!name.trim() || !nameAr.trim()) {
    return { success: false, error: 'اسم التصنيف مطلوب' };
  }

  try {
    const categories = getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return { success: false, error: 'التصنيف غير موجود' };
    
    categories[index] = { 
      ...categories[index], 
      name: sanitizeInput(name), 
      nameAr: sanitizeInput(nameAr) 
    };
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(categories));
    return { success: true, category: categories[index] };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث التصنيف' };
  }
};

export const deleteCategory = (id: string): { success: boolean; error?: string } => {
  try {
    const categories = getCategories();
    const filtered = categories.filter(c => c.id !== id);
    if (filtered.length === categories.length) return { success: false, error: 'التصنيف غير موجود' };
    localStorage.setItem(DB_KEYS.CATEGORIES, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'حدث خطأ أثناء حذف التصنيف' };
  }
};

// Order Operations with concurrency handling
export const getOrders = (): Order[] => {
  try {
    const data = localStorage.getItem(DB_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
};

export const getOrderById = (id: string): Order | null => {
  const orders = getOrders();
  return orders.find(o => o.id === id) || null;
};

export const createOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; order?: Order; error?: string } => {
  const validationError = validateOrder(order);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    const orders = getOrders();
    const newOrder: Order = {
      ...order,
      customerName: sanitizeInput(order.customerName),
      customerAddress: sanitizeInput(order.customerAddress),
      customerCity: sanitizeInput(order.customerCity),
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    
    // Update product quantities
    const products = getProducts();
    order.items.forEach(orderItem => {
      const productIndex = products.findIndex(p => p.id === orderItem.productId);
      if (productIndex !== -1) {
        products[productIndex].quantity -= orderItem.quantity;
        if (products[productIndex].quantity <= 0) {
          products[productIndex].inStock = false;
        }
      }
    });
    localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products));
    
    return { success: true, order: newOrder };
  } catch (error) {
    console.error('Error creating order:', error);
    return { success: false, error: 'حدث خطأ أثناء إنشاء الطلب' };
  }
};

export const updateOrderStatus = (id: string, status: Order['status'], statusAr: string): { success: boolean; order?: Order; error?: string } => {
  try {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return { success: false, error: 'الطلب غير موجود' };
    
    orders[index] = {
      ...orders[index],
      status,
      statusAr,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(orders));
    return { success: true, order: orders[index] };
  } catch (error) {
    console.error('Error updating order:', error);
    return { success: false, error: 'حدث خطأ أثناء تحديث الطلب' };
  }
};

export const deleteOrder = (id: string): { success: boolean; error?: string } => {
  try {
    const orders = getOrders();
    const filtered = orders.filter(o => o.id !== id);
    if (filtered.length === orders.length) return { success: false, error: 'الطلب غير موجود' };
    localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify(filtered));
    return { success: true };
  } catch (error) {
    console.error('Error deleting order:', error);
    return { success: false, error: 'حدث خطأ أثناء حذف الطلب' };
  }
};

// Admin Operations
export const loginAdmin = (username: string, password: string): boolean => {
  try {
    const data = localStorage.getItem(DB_KEYS.ADMIN);
    if (!data) return false;
    
    const admin: Admin = JSON.parse(data);
    if (admin.username === username && verifyPassword(password, admin.password)) {
      localStorage.setItem(DB_KEYS.IS_ADMIN, 'true');
      // Set session expiry (24 hours)
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
  const isAdmin = localStorage.getItem(DB_KEYS.IS_ADMIN) === 'true';
  const expiry = localStorage.getItem('dorada_admin_expiry');
  
  if (isAdmin && expiry) {
    if (Date.now() > parseInt(expiry)) {
      logoutAdmin();
      return false;
    }
    return true;
  }
  return false;
};

export const changeAdminPassword = (currentPassword: string, newPassword: string): { success: boolean; error?: string } => {
  try {
    const data = localStorage.getItem(DB_KEYS.ADMIN);
    if (!data) return { success: false, error: 'المسؤول غير موجود' };
    
    const admin: Admin = JSON.parse(data);
    if (!verifyPassword(currentPassword, admin.password)) {
      return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
    }
    
    if (newPassword.length < 6) {
      return { success: false, error: 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' };
    }
    
    admin.password = hashPassword(newPassword);
    localStorage.setItem(DB_KEYS.ADMIN, JSON.stringify(admin));
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: 'حدث خطأ أثناء تغيير كلمة المرور' };
  }
};

// Telegram Config Operations
export const getTelegramConfig = (): TelegramConfig => {
  try {
    const data = localStorage.getItem(DB_KEYS.TELEGRAM_CONFIG);
    return data ? JSON.parse(data) : { botToken: '', chatId: '', enabled: false };
  } catch (error) {
    console.error('Error reading telegram config:', error);
    return { botToken: '', chatId: '', enabled: false };
  }
};

export const updateTelegramConfig = (config: TelegramConfig): { success: boolean; error?: string } => {
  try {
    localStorage.setItem(DB_KEYS.TELEGRAM_CONFIG, JSON.stringify(config));
    return { success: true };
  } catch (error) {
    console.error('Error updating telegram config:', error);
    return { success: false, error: 'حدث خطأ أثناء حفظ الإعدادات' };
  }
};

// Cart Operations
export const getCart = () => {
  try {
    const data = localStorage.getItem(DB_KEYS.CART);
    return data ? JSON.parse(data) : { items: [], total: 0 };
  } catch (error) {
    console.error('Error reading cart:', error);
    return { items: [], total: 0 };
  }
};

export const saveCart = (cart: { items: any[]; total: number }): void => {
  try {
    localStorage.setItem(DB_KEYS.CART, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

export const clearCart = (): void => {
  try {
    localStorage.removeItem(DB_KEYS.CART);
  } catch (error) {
    console.error('Error clearing cart:', error);
  }
};

// Wishlist Operations
export const getWishlist = (): Wishlist => {
  try {
    const data = localStorage.getItem(DB_KEYS.WISHLIST);
    return data ? JSON.parse(data) : { items: [] };
  } catch (error) {
    console.error('Error reading wishlist:', error);
    return { items: [] };
  }
};

export const addToWishlist = (productId: string): { success: boolean; error?: string } => {
  try {
    const wishlist = getWishlist();
    const exists = wishlist.items.find(item => item.product.id === productId);
    
    if (exists) {
      return { success: false, error: 'المنتج موجود في المفضلة' };
    }
    
    const product = getProductById(productId);
    if (!product) {
      return { success: false, error: 'المنتج غير موجود' };
    }
    
    wishlist.items.push({
      product,
      addedAt: new Date().toISOString(),
    });
    
    localStorage.setItem(DB_KEYS.WISHLIST, JSON.stringify(wishlist));
    return { success: true };
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return { success: false, error: 'حدث خطأ' };
  }
};

export const removeFromWishlist = (productId: string): { success: boolean } => {
  try {
    const wishlist = getWishlist();
    wishlist.items = wishlist.items.filter(item => item.product.id !== productId);
    localStorage.setItem(DB_KEYS.WISHLIST, JSON.stringify(wishlist));
    return { success: true };
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return { success: false };
  }
};

export const isInWishlist = (productId: string): boolean => {
  const wishlist = getWishlist();
  return wishlist.items.some(item => item.product.id === productId);
};

// User Operations
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

// Format price in IQD with ENGLISH numerals
export const formatPrice = (price: number): string => {
  // Format with English numerals (en-US locale)
  const formatted = new Intl.NumberFormat('en-US').format(price);
  return `${formatted} IQD`;
};

// Image upload helper - Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

// Validate image file - Increased size for high quality images
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const maxSize = 20 * 1024 * 1024; // 20MB for high quality images

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'نوع الملف غير مدعوم. استخدم JPG, PNG, أو WebP' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'حجم الملف كبير جداً. الحد الأقصى 20 ميجابايت' };
  }

  return { valid: true };
};

// Export DB_KEYS for external use
export { DB_KEYS };
