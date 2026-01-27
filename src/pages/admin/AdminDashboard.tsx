import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Check,
  Send,
  Menu,
  Eye,
  Hash,
  Layers,
  AlertTriangle,
  CheckCircle,
  Image as ImageIcon,
  Trash,
  Sparkles,
  Tag,
  Scale,
  Palette,
  Ruler,
  Shield,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  getProducts,
  getOrders,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  updateCategory,
  deleteCategory,
  updateOrderStatus,
  logoutAdmin,
  getTelegramConfig,
  updateTelegramConfig,
  formatPrice,
  fileToBase64,
  validateImageFile,
} from '@/services/database';
import { revokeAdminAccess } from '@/services/security';
import { testTelegramConnection, getBotInfo } from '@/services/telegram';
import { useApp } from '@/contexts/AppContext';
import type { Product, Order, Category, ProductFeature } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { setAdmin, refreshProducts, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'categories' | 'settings'>('products');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Telegram Config State
  const [telegramConfig, setTelegramConfig] = useState({ botToken: '', chatId: '', enabled: false });
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [botUsername, setBotUsername] = useState('');

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedProducts, loadedOrders, loadedCategories, loadedConfig] = await Promise.all([
          getProducts(),
          getOrders(),
          getCategories(),
          getTelegramConfig()
        ]);

        setProducts(loadedProducts);
        setOrders(loadedOrders);
        setCategories(loadedCategories);
        setTelegramConfig(loadedConfig);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        showToast('حدث خطأ أثناء تحميل البيانات', 'error');
      }
    };
    loadData();
  }, []);

  // Get bot info when token changes
  useEffect(() => {
    if (telegramConfig.botToken) {
      getBotInfo(telegramConfig.botToken).then(result => {
        if (result.success && result.username) {
          setBotUsername(result.username);
        }
      });
    }
  }, [telegramConfig.botToken]);

  const handleLogout = () => {
    logoutAdmin();
    revokeAdminAccess();
    setAdmin(false);
    navigate('/');
  };

  // Product Handlers
  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    let result;
    if (editingProduct) {
      result = await updateProduct(editingProduct.id, productData);
    } else {
      result = await addProduct(productData);
    }

    if (result.success) {
      setProducts(await getProducts());
      refreshProducts();
      setIsProductModalOpen(false);
      setEditingProduct(null);
      showToast(editingProduct ? 'تم تحديث المنتج' : 'تم إضافة المنتج', 'success');
    } else {
      showToast(result.error || 'حدث خطأ', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      const result = await deleteProduct(id);
      if (result.success) {
        setProducts(await getProducts());
        refreshProducts();
        showToast('تم حذف المنتج', 'success');
      } else {
        showToast(result.error || 'حدث خطأ أثناء الحذف', 'error');
      }
    }
  };

  // Category Handlers
  const handleSaveCategory = async (name: string, nameAr: string) => {
    let result;
    if (editingCategory) {
      result = await updateCategory(editingCategory.id, name, nameAr);
    } else {
      result = await addCategory(name, nameAr);
    }

    if (result.success) {
      setCategories(await getCategories());
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      showToast(editingCategory ? 'تم تحديث التصنيف' : 'تم إضافة التصنيف', 'success');
    } else {
      showToast(result.error || 'حدث خطأ', 'error');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      const result = await deleteCategory(id);
      if (result.success) {
        setCategories(await getCategories());
        showToast('تم حذف التصنيف', 'success');
      } else {
        showToast(result.error || 'حدث خطأ أثناء الحذف', 'error');
      }
    }
  };

  // Order Handlers
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status'], statusAr: string) => {
    const result = await updateOrderStatus(orderId, status, statusAr);
    if (result.success) {
      setOrders(await getOrders());
      showToast('تم تحديث حالة الطلب', 'success');
    } else {
      showToast(result.error || 'حدث خطأ أثناء تحديث الحالة', 'error');
    }
  };

  // Telegram Handlers
  const handleSaveTelegramConfig = async () => {
    const result = await updateTelegramConfig(telegramConfig);
    if (result.success) {
      showToast('تم حفظ الإعدادات بنجاح!', 'success');
    } else {
      showToast(result.error || 'حدث خطأ أثناء الحفظ', 'error');
    }
  };

  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    const result = await testTelegramConnection(telegramConfig.botToken, telegramConfig.chatId);
    setIsTestingTelegram(false);
    if (result.success) {
      showToast('تم الاتصال بنجاح!', 'success');
    } else {
      showToast(result.error || 'فشل الاتصال', 'error');
    }
  };

  const filteredProducts = products.filter(p =>
    p.nameAr.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30';
    }
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity === 0) return { text: 'نفذت الكمية', color: 'bg-red-500/20 text-red-400' };
    if (product.quantity <= 2) return { text: `متبقي ${product.quantity}`, color: 'bg-yellow-500/20 text-yellow-400' };
    return { text: `متاح (${product.quantity})`, color: 'bg-green-500/20 text-green-400' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dorada-blue via-[#1a2a3d] to-[#0d1a26]" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full z-40 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
          }`}
      >
        <div className="h-full glass-card border-l border-white/10 rounded-none">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-dorada-gold/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-dorada-gold" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold gold-text">دورادا</h2>
                <p className="text-xs text-dorada-cream/50">لوحة التحكم الآمنة</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {[
              { id: 'products', label: 'المنتجات', icon: Package },
              { id: 'orders', label: 'الطلبات', icon: ShoppingCart },
              { id: 'categories', label: 'التصنيفات', icon: LayoutDashboard },
              { id: 'settings', label: 'الإعدادات', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id
                  ? 'bg-dorada-gold/20 text-dorada-gold border border-dorada-gold/30'
                  : 'text-dorada-cream/60 hover:bg-white/5 hover:text-dorada-cream'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-sans text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-sans text-sm">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${isSidebarOpen ? 'mr-64' : 'mr-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 glass-card border-b border-white/10 rounded-none px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-white/5 text-dorada-cream/60"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <span className="text-xs text-dorada-cream/40 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                وصول آمن
              </span>
              <h1 className="font-serif text-xl font-bold text-dorada-cream">
                {activeTab === 'products' && 'إدارة المنتجات'}
                {activeTab === 'orders' && 'إدارة الطلبات'}
                {activeTab === 'categories' && 'إدارة التصنيفات'}
                {activeTab === 'settings' && 'الإعدادات'}
              </h1>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dorada-cream/40" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="البحث في المنتجات (اسم، كود...)"
                    className="w-full pr-12 pl-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                  className="gold-btn flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة منتج</span>
                </button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product);
                  return (
                    <div key={product.id} className="glass-card overflow-hidden group">
                      <div className="aspect-square overflow-hidden relative">
                        <img
                          src={product.images[0]}
                          alt={product.nameAr}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Stock Badge */}
                        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                          {stockStatus.text}
                        </div>
                        {/* Featured Badge */}
                        {product.featured && (
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-dorada-gold/80 text-dorada-blue text-xs font-medium">
                            مميز
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Hash className="w-3 h-3 text-dorada-cream/40" />
                          <span className="text-xs text-dorada-cream/40 font-mono">{product.sku}</span>
                        </div>
                        <h3 className="font-serif text-lg font-semibold text-dorada-cream mb-1">
                          {product.nameAr}
                        </h3>
                        <p className="text-sm text-dorada-cream/50 mb-2">{product.categoryAr}</p>

                        {/* Features Preview */}
                        {product.features && product.features.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {product.features.slice(0, 2).map((feature, idx) => (
                              <span key={idx} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-dorada-cream/60">
                                {feature.label}: {feature.value}
                              </span>
                            ))}
                            {product.features.length > 2 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-dorada-cream/60">
                                +{product.features.length - 2}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="font-bold gold-text">{formatPrice(product.price)}</span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setIsProductModalOpen(true);
                              }}
                              className="p-2 rounded-lg bg-white/5 hover:bg-dorada-gold/20 text-dorada-cream/60 hover:text-dorada-gold transition-all"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-dorada-cream/60 hover:text-red-400 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              {orders.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingCart className="w-16 h-16 text-dorada-cream/20 mx-auto mb-4" />
                  <p className="text-dorada-cream/50">لا توجد طلبات بعد</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="glass-card p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm text-dorada-gold">
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                              {order.statusAr}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg text-dorada-cream mb-1">
                            {order.customerName}
                          </h3>
                          <p className="text-sm text-dorada-cream/50">
                            {order.items.length} منتجات • {formatPrice(order.total)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <select
                            value={order.status}
                            onChange={(e) => {
                              const status = e.target.value as Order['status'];
                              const statusAr = {
                                pending: 'قيد الانتظار',
                                processing: 'قيد المعالجة',
                                shipped: 'تم الشحن',
                                delivered: 'تم التوصيل',
                                cancelled: 'ملغي',
                              }[status];
                              handleUpdateOrderStatus(order.id, status, statusAr);
                            }}
                            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-dorada-cream text-sm focus:border-dorada-gold focus:outline-none"
                          >
                            <option value="pending">قيد الانتظار</option>
                            <option value="processing">قيد المعالجة</option>
                            <option value="shipped">تم الشحن</option>
                            <option value="delivered">تم التوصيل</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 rounded-lg bg-white/5 hover:bg-dorada-gold/20 text-dorada-cream/60 hover:text-dorada-gold transition-all"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setIsCategoryModalOpen(true);
                  }}
                  className="gold-btn flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة تصنيف</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div key={category.id} className="glass-card p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-dorada-cream">
                          {category.nameAr}
                        </h3>
                        <p className="text-sm text-dorada-cream/50">{category.name}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setIsCategoryModalOpen(true);
                          }}
                          className="p-2 rounded-lg bg-white/5 hover:bg-dorada-gold/20 text-dorada-cream/60 hover:text-dorada-gold transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-dorada-cream/60 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Telegram Settings */}
              <div className="glass-card p-6">
                <h3 className="font-serif text-xl font-bold text-dorada-cream mb-6">
                  إعدادات Telegram Bot
                </h3>
                <div className="space-y-4 max-w-xl">
                  <div>
                    <label className="block text-sm text-dorada-cream/80 mb-2">
                      Bot Token
                    </label>
                    <input
                      type="text"
                      value={telegramConfig.botToken}
                      onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                      placeholder="أدخل Bot Token من BotFather"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none"
                    />
                    {botUsername && (
                      <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        متصل بـ @{botUsername}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm text-dorada-cream/80 mb-2">
                      Chat ID
                    </label>
                    <input
                      type="text"
                      value={telegramConfig.chatId}
                      onChange={(e) => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
                      placeholder="أدخل Chat ID (استخدم @userinfobot)"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="telegram-enabled"
                      checked={telegramConfig.enabled}
                      onChange={(e) => setTelegramConfig({ ...telegramConfig, enabled: e.target.checked })}
                      className="w-5 h-5 rounded border-white/10 bg-white/5 text-dorada-gold focus:ring-dorada-gold"
                    />
                    <label htmlFor="telegram-enabled" className="text-dorada-cream/80">
                      تفعيل إشعارات Telegram
                    </label>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSaveTelegramConfig}
                      className="gold-btn flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>حفظ الإعدادات</span>
                    </button>
                    <button
                      onClick={handleTestTelegram}
                      disabled={isTestingTelegram || !telegramConfig.botToken || !telegramConfig.chatId}
                      className="px-6 py-3 rounded-full border border-dorada-gold/30 text-dorada-gold hover:bg-dorada-gold/10 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isTestingTelegram ? (
                        <div className="w-4 h-4 border-2 border-dorada-gold/30 border-t-dorada-gold rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>اختبار الاتصال</span>
                    </button>
                  </div>
                  <div className="mt-4 p-4 rounded-lg bg-dorada-gold/5 border border-dorada-gold/20">
                    <p className="text-sm text-dorada-cream/60">
                      <strong className="text-dorada-gold">كيفية الحصول على Bot Token:</strong><br />
                      1. افتح Telegram وابحث عن <code className="bg-white/10 px-1 rounded">@BotFather</code><br />
                      2. أرسل <code className="bg-white/10 px-1 rounded">/newbot</code><br />
                      3. اتبع التعليمات واحفظ الـ Token<br /><br />
                      <strong className="text-dorada-gold">كيفية الحصول على Chat ID:</strong><br />
                      1. ابحث عن <code className="bg-white/10 px-1 rounded">@userinfobot</code><br />
                      2. أرسل أي رسالة، ستحصل على الـ Chat ID
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <CategoryModal
          category={editingCategory}
          onSave={handleSaveCategory}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
        />
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
};

// Product Modal Component with Custom Features
const ProductModal: React.FC<{
  product: Product | null;
  categories: Category[];
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ product, categories, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    nameAr: product?.nameAr || '',
    description: product?.description || '',
    descriptionAr: product?.descriptionAr || '',
    price: product?.price || 0,
    originalPrice: product?.originalPrice || 0,
    images: product?.images || [],
    category: product?.category || categories[0]?.name || '',
    categoryAr: product?.categoryAr || categories[0]?.nameAr || '',
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
    quantity: product?.quantity ?? 0,
    sku: product?.sku || '',
    features: product?.features || [],
    weight: product?.weight || '',
    material: product?.material || '',
    size: product?.size || '',
    color: product?.color || '',
    warranty: product?.warranty || '',
  });

  const [showFeaturesSection, setShowFeaturesSection] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCategoryChange = (categoryName: string) => {
    const selectedCat = categories.find(c => c.name === categoryName);
    setFormData({
      ...formData,
      category: categoryName,
      categoryAr: selectedCat?.nameAr || '',
    });
  };

  const handleImagesChange = (newImages: string[]) => {
    setFormData({ ...formData, images: newImages });
  };

  // Add custom feature
  const addFeature = () => {
    const newFeature: ProductFeature = {
      id: uuidv4(),
      label: 'ميزة جديدة',
      value: '',
    };
    setFormData({ ...formData, features: [...formData.features, newFeature] });
  };

  // Update feature
  const updateFeature = (index: number, field: 'label' | 'value', value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    setFormData({ ...formData, features: updatedFeatures });
  };

  // Remove feature
  const removeFeature = (index: number) => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: updatedFeatures });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-dorada-cream">
            {product ? 'تعديل منتج' : 'إضافة منتج جديد'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-dorada-cream/60" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dorada-cream/80 mb-2">الاسم (عربي) *</label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-dorada-cream/80 mb-2">الاسم (إنجليزي) *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none"
                required
              />
            </div>
          </div>

          {/* SKU Field */}
          <div>
            <label className="block text-sm text-dorada-cream/80 mb-2">
              <Hash className="w-4 h-4 inline-block ml-1" />
              كود المنتج (SKU) *
            </label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
              placeholder="مثال: DOR-RNG-001"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none font-mono"
              required
            />
            <p className="text-xs text-dorada-cream/40 mt-1">هذا الكود يظهر فقط لك عند الطلبات</p>
          </div>

          {/* Price & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-dorada-cream/80 mb-2">السعر (IQD) *</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none"
                required
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm text-dorada-cream/80 mb-2">السعر الأصلي (IQD)</label>
              <input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none"
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm text-dorada-cream/80 mb-2">
                <Layers className="w-4 h-4 inline-block ml-1" />
                الكمية المتوفرة *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => {
                  const qty = Number(e.target.value);
                  setFormData({
                    ...formData,
                    quantity: qty,
                    inStock: qty > 0
                  });
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none"
                required
                min={0}
              />
              {formData.quantity === 0 && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  نفذت الكمية - المنتج غير متوفر للعملاء
                </p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-dorada-cream/80 mb-2">التصنيف *</label>
            <select
              value={formData.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.nameAr}</option>
              ))}
            </select>
          </div>

          {/* Multiple Images Upload */}
          <div>
            <label className="block text-sm text-dorada-cream/80 mb-2">
              <ImageIcon className="w-4 h-4 inline-block ml-1" />
              صور المنتج *
            </label>
            <MultiImageUpload
              images={formData.images}
              onImagesChange={handleImagesChange}
            />
          </div>

          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-dorada-cream/80 mb-2">الوصف (عربي)</label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-dorada-cream/80 mb-2">الوصف (إنجليزي)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Product Specifications */}
          <div className="border border-white/10 rounded-xl p-4">
            <button
              type="button"
              onClick={() => setShowFeaturesSection(!showFeaturesSection)}
              className="w-full flex items-center justify-between text-dorada-cream/80 mb-4"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-dorada-gold" />
                مواصفات المنتج
              </span>
              {showFeaturesSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showFeaturesSection && (
              <div className="space-y-4">
                {/* Quick Specs */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-dorada-cream/60 mb-1">
                      <Scale className="w-3 h-3 inline-block ml-1" />
                      الوزن
                    </label>
                    <input
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="مثال: 15 جرام"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-dorada-cream text-sm focus:border-dorada-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dorada-cream/60 mb-1">
                      <Tag className="w-3 h-3 inline-block ml-1" />
                      المادة
                    </label>
                    <input
                      type="text"
                      value={formData.material}
                      onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                      placeholder="مثال: ذهب عيار 18"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-dorada-cream text-sm focus:border-dorada-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dorada-cream/60 mb-1">
                      <Ruler className="w-3 h-3 inline-block ml-1" />
                      المقاس
                    </label>
                    <input
                      type="text"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      placeholder="مثال: قابل للتعديل"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-dorada-cream text-sm focus:border-dorada-gold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-dorada-cream/60 mb-1">
                      <Palette className="w-3 h-3 inline-block ml-1" />
                      اللون
                    </label>
                    <input
                      type="text"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      placeholder="مثال: ذهبي"
                      className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-dorada-cream text-sm focus:border-dorada-gold focus:outline-none"
                    />
                  </div>
                </div>

                {/* Warranty */}
                <div>
                  <label className="block text-xs text-dorada-cream/60 mb-1">
                    <Shield className="w-3 h-3 inline-block ml-1" />
                    الضمان
                  </label>
                  <input
                    type="text"
                    value={formData.warranty}
                    onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                    placeholder="مثال: مدى الحياة"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-dorada-cream text-sm focus:border-dorada-gold focus:outline-none"
                  />
                </div>

                {/* Custom Features */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-dorada-cream/80">مميزات إضافية</span>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="text-xs px-3 py-1.5 rounded-lg bg-dorada-gold/20 text-dorada-gold hover:bg-dorada-gold/30 transition-colors"
                    >
                      + إضافة ميزة
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={feature.id} className="flex gap-2">
                        <input
                          type="text"
                          value={feature.label}
                          onChange={(e) => updateFeature(index, 'label', e.target.value)}
                          placeholder="العنوان (مثال: المادة)"
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-dorada-cream text-sm focus:border-dorada-gold focus:outline-none"
                        />
                        <input
                          type="text"
                          value={feature.value}
                          onChange={(e) => updateFeature(index, 'value', e.target.value)}
                          placeholder="القيمة (مثال: ذهب عيار 18)"
                          className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-dorada-cream text-sm focus:border-dorada-gold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock}
                onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-dorada-gold"
              />
              <span className="text-dorada-cream/80">متوفر للبيع</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="w-5 h-5 rounded border-white/10 bg-white/5 text-dorada-gold"
              />
              <span className="text-dorada-cream/80">منتج مميز</span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="submit" className="gold-btn flex-1">
              {product ? 'حفظ التغييرات' : 'إضافة المنتج'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-full border border-white/20 text-dorada-cream hover:bg-white/5">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Multi Image Upload Component
const MultiImageUpload: React.FC<{
  images: string[];
  onImagesChange: (images: string[]) => void;
}> = ({ images, onImagesChange }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newImages: string[] = [];

    for (const file of Array.from(files)) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        continue;
      }

      try {
        const base64 = await fileToBase64(file);
        newImages.push(base64);
      } catch (err) {
        console.error('Error converting file:', err);
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }

    setIsUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-3">
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group">
              <img
                src={image}
                alt={`صورة ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Remove Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash className="w-3 h-3" />
              </button>
              {/* Main Image Badge */}
              {index === 0 && (
                <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded-full bg-dorada-gold/80 text-dorada-blue text-xs font-medium">
                  رئيسية
                </div>
              )}
              {/* Reorder Buttons */}
              <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index - 1)}
                    className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    ←
                  </button>
                )}
                {index < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(index, index + 1)}
                    className="p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <div className="flex flex-col items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream hover:bg-white/10 hover:border-dorada-gold/50 transition-all disabled:opacity-50"
        >
          {isUploading ? (
            <>
              <div className="w-5 h-5 border-2 border-dorada-cream/30 border-t-dorada-gold rounded-full animate-spin" />
              <span>جاري الرفع...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>{images.length > 0 ? 'إضافة صور أخرى' : 'اختيار صور'}</span>
            </>
          )}
        </button>

        <p className="text-xs text-dorada-cream/40">
          JPG, PNG, WebP - الحد الأقصى 5 ميجابايت للصورة
        </p>
      </div>
    </div>
  );
};

// Category Modal Component
const CategoryModal: React.FC<{
  category: Category | null;
  onSave: (name: string, nameAr: string) => void;
  onClose: () => void;
}> = ({ category, onSave, onClose }) => {
  const [name, setName] = useState(category?.name || '');
  const [nameAr, setNameAr] = useState(category?.nameAr || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name, nameAr);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-md">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-dorada-cream">
            {category ? 'تعديل تصنيف' : 'إضافة تصنيف'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-dorada-cream/60" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-dorada-cream/80 mb-2">الاسم (عربي)</label>
            <input
              type="text"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm text-dorada-cream/80 mb-2">الاسم (إنجليزي)</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="gold-btn flex-1">
              {category ? 'حفظ التغييرات' : 'إضافة التصنيف'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-full border border-white/20 text-dorada-cream hover:bg-white/5">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Order Modal Component
const OrderModal: React.FC<{
  order: Order;
  onClose: () => void;
}> = ({ order, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-xl font-bold text-dorada-cream">
              تفاصيل الطلب
            </h2>
            <span className="font-mono text-sm text-dorada-gold">
              #{order.id.slice(-6).toUpperCase()}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5 text-dorada-cream/60" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div>
            <h3 className="font-serif text-lg text-dorada-cream mb-4">معلومات العميل</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <p className="text-sm text-dorada-cream/50 mb-1">الاسم</p>
                <p className="text-dorada-cream font-medium">{order.customerName}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-sm text-dorada-cream/50 mb-1">رقم الهاتف</p>
                <p className="text-dorada-cream font-medium">{order.customerPhone}</p>
              </div>
              <div className="glass-card p-4 md:col-span-2">
                <p className="text-sm text-dorada-cream/50 mb-1">العنوان</p>
                <p className="text-dorada-cream font-medium">{order.customerAddress}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-sm text-dorada-cream/50 mb-1">المدينة</p>
                <p className="text-dorada-cream font-medium">{order.customerCity}</p>
              </div>
              <div className="glass-card p-4">
                <p className="text-sm text-dorada-cream/50 mb-1">الحالة</p>
                <p className="text-dorada-gold font-medium">{order.statusAr}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-serif text-lg text-dorada-cream mb-4">المنتجات</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="glass-card p-4 flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.nameAr}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h4 className="text-dorada-cream font-medium">{item.nameAr}</h4>
                    <p className="text-xs text-dorada-gold font-mono mt-1">كود: {item.sku}</p>
                    <p className="text-sm text-dorada-cream/50">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-dorada-gold font-bold">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <span className="text-lg text-dorada-cream">المجموع الكلي</span>
              <span className="text-2xl font-bold gold-text">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
