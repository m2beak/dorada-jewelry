import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Crown,
  Heart,
  Instagram,
  Phone,
  MapPin,
  Eye
} from 'lucide-react';

import { useApp } from '@/contexts/AppContext';
import QuickViewModal from '@/components/QuickViewModal';
import RecentlyViewed from '@/components/RecentlyViewed';
import type { Product } from '@/types';
import { getOptimizedUrl } from '@/utils/image';
import { useProducts, useCategories } from '@/hooks/useProducts';

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const { cartItemsCount, addToCart, formatPrice, addToWishlistFn, isInWishlistFn, wishlistItemsCount } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // React Query Hooks
  const { data: categories = [] } = useCategories();
  const { data: products = [] } = useProducts(selectedCategory);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProducts = products.filter(p =>
    p.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  const handleAddToWishlist = (e: React.MouseEvent, productId: string) => {
    e.stopPropagation();
    addToWishlistFn(productId);
  };

  const handleQuickView = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dorada-blue via-[#1a2a3d] to-[#0d1a26]" dir="rtl">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'nav-glass py-3' : 'bg-transparent py-4'
        }`}>
        <div className="w-full px-4 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button onClick={() => navigate('/')} className="flex items-center gap-2 group">
              <Crown className="w-7 h-7 text-dorada-gold transition-transform group-hover:scale-110" />
              <span className="font-serif text-xl font-bold gold-text">دورادا</span>
            </button>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dorada-cream/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="البحث عن منتج..."
                  className="w-full pr-12 pl-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Wishlist */}
              <button
                onClick={() => navigate('/wishlist')}
                className="relative p-2.5 rounded-full bg-white/5 hover:bg-dorada-gold/20 text-dorada-cream hover:text-dorada-gold transition-all"
              >
                <Heart className="w-5 h-5" />
                {wishlistItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {wishlistItemsCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2.5 rounded-full bg-white/5 hover:bg-dorada-gold/20 text-dorada-cream hover:text-dorada-gold transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-dorada-gold text-dorada-blue text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-full bg-white/5 text-dorada-cream"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden mt-4">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dorada-cream/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث عن منتج..."
                className="w-full pr-12 pl-4 py-2.5 rounded-full bg-white/5 border border-white/10 text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none text-sm"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full glass-card text-xs font-medium text-dorada-gold tracking-wider mb-4">
              متجر دورادا
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-dorada-cream mb-4">
              مجوهرات <span className="gold-text">فاخرة</span>
            </h1>
            <p className="text-dorada-cream/60 max-w-xl mx-auto">
              اكتشف تشكيلتنا الرائعة من المجوهرات المصنوعة يدوياً بأعلى معايير الجودة
            </p>
          </div>
        </div>
      </section>

      {/* Categories & Products */}
      <section className="pb-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Categories */}
          <div className="flex flex-wrap gap-3 justify-center mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === null
                ? 'bg-dorada-gold text-dorada-blue'
                : 'glass-card text-dorada-cream hover:border-dorada-gold/50'
                }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.name
                  ? 'bg-dorada-gold text-dorada-blue'
                  : 'glass-card text-dorada-cream hover:border-dorada-gold/50'
                  }`}
              >
                {cat.nameAr}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="w-16 h-16 text-dorada-cream/20 mx-auto mb-4" />
              <p className="text-dorada-cream/50">لا توجد منتجات في هذا التصنيف</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onAddToWishlist={handleAddToWishlist}
                  onQuickView={handleQuickView}
                  isInWishlist={isInWishlistFn(product.id)}
                  onClick={() => navigate(`/product/${product.id}`)}
                  formatPrice={formatPrice}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed formatPrice={formatPrice} />

      {/* Contact Section */}
      <section className="py-20 px-4 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl font-bold text-dorada-cream mb-4">
              للتواصل
            </h2>
            <p className="text-dorada-cream/60">
              نحن هنا لمساعدتك، تواصل معنا عبر القنوات التالية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Instagram */}
            <a
              href="https://instagram.com/dorada_accessories"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card p-6 text-center group hover:border-dorada-gold/50 transition-all"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Instagram className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-dorada-cream mb-2">إنستغرام</h3>
              <p className="text-dorada-gold">@dorada_accessories</p>
            </a>

            {/* Phone */}
            <div className="glass-card p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-dorada-gold/20 flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-dorada-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-dorada-cream mb-2">اتصل بنا</h3>
              <p className="text-dorada-cream/60">07507078397</p>
            </div>

            {/* Location */}
            <div className="glass-card p-6 text-center">
              <div className="w-14 h-14 rounded-full bg-dorada-gold/20 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-7 h-7 text-dorada-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-dorada-cream mb-2">الموقع</h3>
              <p className="text-dorada-cream/60">قريبا</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-dorada-gold" />
              <span className="font-serif text-2xl font-bold gold-text">دورادا</span>
            </div>
            <p className="text-dorada-cream/40 text-sm text-center">
              © 2026 دورادا. جميع الحقوق محفوظة.
            </p>
            <button
              onClick={() => navigate('/secure-access')}
              className="mt-4 md:mt-0 text-dorada-cream/20 hover:text-dorada-gold/50 text-xs transition-colors"
            >
              Admin Panel
            </button>
          </div>
        </div>
      </footer>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        onAddToCart={handleAddToCart}
        onAddToWishlist={addToWishlistFn}
        isInWishlist={quickViewProduct ? isInWishlistFn(quickViewProduct.id) : false}
        formatPrice={formatPrice}
      />
    </div>
  );
};

// Product Card Component
const ProductCard: React.FC<{
  product: Product;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (e: React.MouseEvent, productId: string) => void;
  onQuickView?: (e: React.MouseEvent, product: Product) => void;
  isInWishlist: boolean;
  onClick: () => void;
  formatPrice: (price: number) => string;
}> = ({ product, onAddToCart, onAddToWishlist, onQuickView, isInWishlist, onClick, formatPrice }) => {
  const isOutOfStock = product.quantity === 0;

  return (
    <div className="glass-card overflow-hidden group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-square overflow-hidden">
        <img
          src={getOptimizedUrl(product.images[0], 500)}
          alt={product.nameAr}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">نفذت الكمية</span>
          </div>
        )}

        {/* Discount Badge */}
        {product.originalPrice && product.originalPrice > product.price && !isOutOfStock && (
          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-red-500/80 text-white text-xs font-medium">
            خصم
          </div>
        )}

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={(e) => onQuickView(e, product)}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-dorada-gold/80 transition-all opacity-0 group-hover:opacity-100"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => onAddToWishlist(e, product.id)}
          className={`absolute top-3 left-3 p-2 rounded-full transition-all ${isInWishlist
            ? 'bg-red-500 text-white'
            : 'bg-black/50 text-white hover:bg-red-500/80'
            }`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add to Cart */}
        {!isOutOfStock && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className="absolute bottom-4 left-4 right-4 gold-btn py-2.5 text-sm opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
          >
            أضف إلى السلة
          </button>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs text-dorada-gold mb-1">{product.categoryAr}</p>
        <h3 className="font-serif text-lg font-semibold text-dorada-cream mb-2 group-hover:text-dorada-gold transition-colors">
          {product.nameAr}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-bold gold-text">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm text-dorada-cream/40 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
