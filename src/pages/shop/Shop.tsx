import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Heart,
  Instagram,
  Phone,
  MapPin,
  Eye,
  Star,
  ChevronLeft,
  ShieldCheck,
  Gem,
  Award
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';

import { useApp } from '@/contexts/AppContext';
import QuickViewModal from '@/components/QuickViewModal';
import RecentlyViewed from '@/components/RecentlyViewed';
import { ProductSkeleton } from '@/components/ProductSkeleton';
import type { Product, Category } from '@/types';
import { getOptimizedImageUrl } from '@/utils/image';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useBackgrounds } from '@/hooks/useBackgrounds';

// Scroll Reveal Helper
const ScrollReveal: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
};

// "شنو تريدين تتسوقين ؟" Category Card Component
const CategorySquareCard: React.FC<{
  category: Category;
  products: Product[];
  onClick: () => void;
}> = ({ category, products, onClick }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const images = products.map(p => p.images[0]).filter(Boolean);

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setImgIndex(prev => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  const currentImage = images[imgIndex];

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-44 h-44 flex-shrink-0 bg-[#121c2c] border border-white/10 rounded-2xl overflow-hidden group text-right flex flex-col justify-end p-5 transition-colors hover:border-dorada-gold/30"
    >
      {/* Background Image Fading */}
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          {currentImage ? (
            <motion.div
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${currentImage})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-[#070b11]" />
          )}
        </AnimatePresence>
        {/* Dark Overlay gradient for solid readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070b11] via-black/30 to-[#070b11]/30 group-hover:from-black transition-all duration-300" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h4 className="font-serif text-lg font-bold text-dorada-cream group-hover:text-dorada-gold transition-colors">
          {category.nameAr}
        </h4>
        <p className="text-[10px] text-dorada-gold font-sans mt-1">
          تسوق الآن ←
        </p>
      </div>
    </motion.button>
  );
};

// Smooth Autoplay Horizontal Product Scroll Component
const AutoScrollRow: React.FC<{
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (e: React.MouseEvent, productId: string) => void;
  onQuickView: (e: React.MouseEvent, product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  formatPrice: (price: number) => string;
}> = ({ products, onProductClick, onAddToCart, onAddToWishlist, onQuickView, isInWishlist, formatPrice }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;
    setIsMouseDown(true);
    setStartX(e.pageX - container.offsetLeft);
    setScrollLeftState(container.scrollLeft);
  };

  const handleMouseUpOrLeave = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown) return;
    const container = containerRef.current;
    if (!container) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeftState - walk;
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || products.length === 0) return;

    let timer: number;
    const tick = () => {
      if (isHovered || isMouseDown) return;

      const maxScroll = container.scrollWidth - container.clientWidth;
      const isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';

      if (isRTL) {
        container.scrollLeft -= 1; // scroll left
        if (Math.abs(container.scrollLeft) >= maxScroll - 5) {
          container.scrollLeft = 0;
        }
      } else {
        container.scrollLeft += 1; // scroll right
        if (container.scrollLeft >= maxScroll - 5) {
          container.scrollLeft = 0;
        }
      }
    };

    timer = setInterval(tick, 25); // Smooth scrolling tick
    return () => clearInterval(timer);
  }, [isHovered, isMouseDown, products]);

  // Duplicate items to ensure smooth continuous looping
  const scrollItems = products.length < 5 ? [...products, ...products, ...products] : [...products, ...products];

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseUpOrLeave();
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUpOrLeave}
      onMouseMove={handleMouseMove}
      className="flex gap-6 overflow-x-auto scrollbar-hide py-4 px-4 lg:px-8 cursor-grab active:cursor-grabbing select-none"
      style={{ scrollBehavior: isMouseDown ? 'auto' : 'smooth' }}
    >
      {scrollItems.map((product, index) => (
        <div key={`${product.id}-${index}`} className="w-72 flex-shrink-0">
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
            onAddToWishlist={onAddToWishlist}
            onQuickView={onQuickView}
            isInWishlist={isInWishlist(product.id)}
            onClick={() => onProductClick(product)}
            formatPrice={formatPrice}
          />
        </div>
      ))}
    </div>
  );
};

const Shop: React.FC = () => {
  const navigate = useNavigate();
  const { cartItemsCount, addToCart, formatPrice, addToWishlistFn, isInWishlistFn, wishlistItemsCount } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Background Customization Hook
  const { data: backgrounds = {} } = useBackgrounds();

  // React Query Hooks
  const { data: categories = [] } = useCategories();
  const { data: products = [], isLoading } = useProducts(selectedCategory);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Testimonials Slider State
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);

  // Gallery Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

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

  // Get distinct images from products to use as Lifestyle Gallery images
  const galleryImages = products
    .flatMap(p => p.images)
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)
    .slice(0, 8); // Display top 8 images

  // Testimonial Quotes
  const testimonials = [
    {
      name: 'سارة أحمد',
      role: 'عميلة دائمة',
      text: 'المجوهرات غاية في الروعة والجمال وصياغتها دقيقة جداً. التوصيل سريع والمعاملة أرقى ما يكون.',
      rating: 5
    },
    {
      name: 'نور الهدى',
      role: 'عميلة جديدة',
      text: 'اشتريت خاتم ذهب وصياغته جداً ممتازة ونازكة، فعلاً نفس الصور والتفاصيل بالضبط. شكراً لكم.',
      rating: 5
    },
    {
      name: 'زينب محمد',
      role: 'عميلة دائمة',
      text: 'دورادا دائماً اختياري الأول للاكسسوارات الفاخرة والمجوهرات النازكة. تصاميم تجنن ومميزة.',
      rating: 5
    }
  ];

  // Default Luxury Backgrounds
  const heroBg = backgrounds.hero || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1920&q=80';
  const testimonialsBg = backgrounds.testimonials || '';
  const ctaBg = backgrounds.cta || '';

  // Reset page filters helper
  const handleResetFilters = () => {
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const isBrowsingAll = selectedCategory !== null || searchQuery !== '';

  return (
    <div className="min-h-screen bg-[#070b11] text-dorada-cream relative overflow-x-hidden font-sans" dir="rtl">
      
      {/* Premium Solid Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'bg-[#070b11] border-b border-white/10 py-3 shadow-xl' : 'bg-transparent py-5'
      }`}>
        <div className="w-full px-4 lg:px-12">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <button onClick={handleResetFilters} className="flex items-center gap-2 group">
              <img src="/doradaicon.svg" alt="دورادا" className="w-10 h-10 text-dorada-gold transition-transform group-hover:scale-110 object-contain" />
              <span className="font-serif text-2xl font-bold gold-text tracking-wide">دورادا</span>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8 text-sm">
              <button onClick={handleResetFilters} className={`transition-colors ${!isBrowsingAll ? 'text-dorada-gold font-medium' : 'text-dorada-cream/70 hover:text-dorada-gold'}`}>الرئيسية</button>
              {categories.slice(0, 5).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setSearchQuery('');
                  }}
                  className={`transition-colors ${selectedCategory === cat.name ? 'text-dorada-gold font-medium' : 'text-dorada-cream/70 hover:text-dorada-gold'}`}
                >
                  {cat.nameAr}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Wishlist */}
              <button
                onClick={() => navigate('/wishlist')}
                className="relative p-2.5 rounded-full bg-[#121c2c] border border-white/5 hover:border-dorada-gold/30 text-dorada-cream hover:text-dorada-gold transition-all"
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
                className="relative p-2.5 rounded-full bg-[#121c2c] border border-white/5 hover:border-dorada-gold/30 text-dorada-cream hover:text-dorada-gold transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-dorada-gold text-[#070b11] text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2.5 rounded-full bg-[#121c2c] border border-white/5 text-dorada-cream"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search bar inside header */}
          <div className="max-w-md mx-auto mt-4 md:mt-2">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dorada-cream/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث عن منتج مخصص..."
                className="w-full pr-11 pl-4 py-2 rounded-full bg-[#121c2c] border border-white/10 text-dorada-cream placeholder-dorada-cream/35 focus:border-dorada-gold focus:outline-none text-xs transition-colors"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-1 rounded-full text-dorada-cream/40 hover:text-dorada-cream"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/80"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 right-12 z-50 bg-[#070b11] border-r border-white/10 p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-2">
                    <img src="/doradaicon.svg" alt="Logo" className="w-8 h-8" />
                    <span className="font-serif text-lg font-bold gold-text">دورادا</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full bg-[#121c2c] text-dorada-cream/70"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 flex flex-col">
                  <button
                    onClick={() => {
                      handleResetFilters();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-right py-2 text-dorada-cream/80 hover:text-dorada-gold border-b border-white/5 font-medium"
                  >
                    الرئيسية
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setSearchQuery('');
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-right py-2 text-dorada-cream/80 hover:text-dorada-gold border-b border-white/5 font-medium"
                    >
                      {cat.nameAr}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <p className="text-xs text-dorada-cream/40 text-center mb-4">تواصل معنا</p>
                <div className="flex justify-center gap-4">
                  <a href="https://instagram.com/dorada_accessories" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-[#121c2c] text-dorada-gold">
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a href="https://wa.me/9647507078397" target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-[#121c2c] text-dorada-gold">
                    <Phone className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- PUBLIC LUXURY LANDING PAGE CONTENT --- */}
      {!isBrowsingAll ? (
        <>
          {/* Hero Banner Section with Ken Burns effect */}
          <section className="relative h-screen w-full flex items-center justify-center pt-24 text-center overflow-hidden">
            {/* Background Zoom Anim */}
            <div className="absolute inset-0 overflow-hidden z-0">
              <motion.div
                initial={{ scale: 1 }}
                animate={{ scale: 1.08 }}
                transition={{
                  duration: 25,
                  ease: 'linear',
                  repeat: Infinity,
                  repeatType: 'reverse',
                }}
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${heroBg})` }}
              />
              <div className="absolute inset-0 bg-black/60" />
            </div>

            <div className="relative z-10 px-4 max-w-4xl mx-auto flex flex-col items-center">
              <motion.span
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-block px-4 py-1 rounded-full border border-dorada-gold/30 text-xs font-semibold text-dorada-gold tracking-widest uppercase mb-6 bg-black/40"
              >
                مجوهرات دورادا الفاخرة
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.4 }}
                className="font-serif text-5xl md:text-7xl font-bold text-dorada-cream mb-6 tracking-wide leading-tight"
              >
                اكسسوارات <span className="gold-text">نازكة</span> وفخمة
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                className="text-dorada-cream/80 max-w-xl text-base md:text-lg mb-8 leading-relaxed font-light"
              >
                نسجنا من خيوط الفخامة والتفاصيل الدقيقة مجوهرات تليق بجمالك ونعومتك.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-wrap gap-4 justify-center"
              >
                <button
                  onClick={() => {
                    const scrollDest = document.getElementById('shop-categories');
                    scrollDest?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="gold-btn py-3 px-8 text-sm flex items-center gap-2 group border border-transparent"
                >
                  <span>استكشاف التشكيلة</span>
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </button>
              </motion.div>
            </div>

            {/* Bottom scroll hint */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
              <span className="text-[10px] text-dorada-cream/40 uppercase tracking-widest mb-2">اسحب للأسفل</span>
              <div className="w-[1px] h-10 bg-dorada-gold/30 animate-pulse" />
            </div>
          </section>

          {/* Feature Showcase: 3-column clean grid (Brand Pillars) */}
          <section className="py-24 px-4 lg:px-12 border-t border-white/5 bg-[#0a0f18] relative z-10">
            <div className="max-w-7xl mx-auto">
              <ScrollReveal>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Pillar 1 */}
                  <motion.div 
                    whileHover={{ y: -6 }}
                    className="bg-[#121c2c] border border-white/10 p-8 rounded-2xl text-center flex flex-col items-center group transition-all duration-300 hover:border-dorada-gold/30 hover:shadow-gold"
                  >
                    <div className="w-14 h-14 rounded-full bg-dorada-gold/10 flex items-center justify-center text-dorada-gold mb-6 group-hover:scale-110 transition-transform">
                      <Gem className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-dorada-cream mb-3">أحجار ألماس خالية من النزاعات</h3>
                    <p className="text-sm text-dorada-cream/60 leading-relaxed">
                      نلتزم بأعلى المعايير الأخلاقية، حيث أن جميع أحجار الماس والزريكون المستخدمة مصنفة بشكل مسؤول كلياً.
                    </p>
                  </motion.div>

                  {/* Pillar 2 */}
                  <motion.div 
                    whileHover={{ y: -6 }}
                    className="bg-[#121c2c] border border-white/10 p-8 rounded-2xl text-center flex flex-col items-center group transition-all duration-300 hover:border-dorada-gold/30 hover:shadow-gold"
                  >
                    <div className="w-14 h-14 rounded-full bg-dorada-gold/10 flex items-center justify-center text-dorada-gold mb-6 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-dorada-cream mb-3">صياغة إيطالية يدوية</h3>
                    <p className="text-sm text-dorada-cream/60 leading-relaxed">
                      تصاميمنا مصاغة يدوياً بدقة فائقة على أيدي خبراء المجوهرات الإيطاليين لضمان تفاصيل فريدة تدوم معك للأبد.
                    </p>
                  </motion.div>

                  {/* Pillar 3 */}
                  <motion.div 
                    whileHover={{ y: -6 }}
                    className="bg-[#121c2c] border border-white/10 p-8 rounded-2xl text-center flex flex-col items-center group transition-all duration-300 hover:border-dorada-gold/30 hover:shadow-gold"
                  >
                    <div className="w-14 h-14 rounded-full bg-dorada-gold/10 flex items-center justify-center text-dorada-gold mb-6 group-hover:scale-110 transition-transform">
                      <Award className="w-7 h-7" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-dorada-cream mb-3">كفالة مدى الحياة</h3>
                    <p className="text-sm text-dorada-cream/60 leading-relaxed">
                      ثقتنا في جودة الصياغة والمواد تجعلنا نقدم كفالة ذهبية شاملة مدى الحياة على كافة المجوهرات والقطع.
                    </p>
                  </motion.div>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* "شنو تريدين تتسوقين ؟" Section (Horizontal Slider to choose Category) */}
          <section id="shop-categories" className="py-20 px-4 lg:px-12 bg-[#070b11] border-t border-white/5">
            <div className="max-w-7xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-12">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-dorada-cream mb-4">
                    شنو تريدين تتسوقين ؟
                  </h2>
                  <p className="text-sm text-dorada-cream/50 max-w-md mx-auto">
                    اختر التصنيف المفضل لديك وتصفح قطع المجوهرات الفريدة المصممة خصيصاً لك.
                  </p>
                </div>
              </ScrollReveal>

              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth justify-start md:justify-center">
                {categories.map((cat) => {
                  const catProducts = products.filter(p => p.category === cat.name);
                  return (
                    <CategorySquareCard
                      key={cat.id}
                      category={cat}
                      products={catProducts}
                      onClick={() => {
                        setSelectedCategory(cat.name);
                        setSearchQuery('');
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </section>

          {/* Autoplay product carousels based on category */}
          <section className="py-16 bg-[#070b11] border-t border-white/5">
            <div className="max-w-7xl mx-auto">
              {categories.map((cat) => {
                const catProducts = products.filter(p => p.category === cat.name);
                if (catProducts.length === 0) return null;

                return (
                  <ScrollReveal key={cat.id}>
                    <div className="mb-20">
                      {/* Section Header */}
                      <div className="flex items-center justify-between mb-8 px-4 lg:px-8 border-r-2 border-dorada-gold pr-3">
                        <div>
                          <h3 className="font-serif text-2xl font-bold text-dorada-cream">
                            {cat.nameAr}
                          </h3>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setSearchQuery('');
                          }}
                          className="text-xs text-dorada-gold hover:text-dorada-gold-light flex items-center gap-1 transition-colors font-medium"
                        >
                          عرض الكل ({catProducts.length}) ←
                        </button>
                      </div>

                      {/* Moving Carousel */}
                      <AutoScrollRow
                        products={catProducts}
                        onProductClick={(p) => navigate(`/product/${p.id}`)}
                        onAddToCart={handleAddToCart}
                        onAddToWishlist={handleAddToWishlist}
                        onQuickView={handleQuickView}
                        isInWishlist={isInWishlistFn}
                        formatPrice={formatPrice}
                      />
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </section>

          {/* Interactive Lifestyle Gallery (Lifestyle Grid) */}
          <section className="py-24 px-4 lg:px-12 bg-[#0a0f18] border-t border-white/5">
            <div className="max-w-7xl mx-auto">
              <ScrollReveal>
                <div className="text-center mb-12">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-dorada-cream mb-4">
                    إطلالة متكاملة
                  </h2>
                  <p className="text-sm text-dorada-cream/50 max-w-md mx-auto">
                    شاهد كيف تبرق مجوهرات دورادا في صور حية وتضفي بريقاً ساحراً على أسلوبك.
                  </p>
                </div>
              </ScrollReveal>

              {galleryImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((imgUrl, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setLightboxImage(imgUrl)}
                      className="aspect-square bg-[#121c2c] border border-white/10 rounded-2xl overflow-hidden cursor-pointer relative group"
                    >
                      <img
                        src={getOptimizedImageUrl(imgUrl, 600)}
                        alt={`lifestyle-${idx}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-[#070b11]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="w-7 h-7 text-dorada-gold" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-dorada-cream/40">لا توجد صور متوفرة حالياً</p>
              )}
            </div>
          </section>

          {/* Testimonials Section: with editable background or default gradient */}
          <section
            className="py-24 px-4 lg:px-12 relative flex items-center justify-center text-center overflow-hidden border-t border-white/5"
            style={{
              backgroundImage: testimonialsBg ? `linear-gradient(rgba(7, 11, 17, 0.85), rgba(7, 11, 17, 0.85)), url(${testimonialsBg})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* If no custom background, show dark elegant mesh */}
            {!testimonialsBg && <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0f18] via-[#070b11] to-[#121c2c]" />}

            <div className="relative z-10 max-w-3xl mx-auto w-full px-4">
              <ScrollReveal>
                <div className="flex justify-center mb-4 text-dorada-gold">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>

                <div className="min-h-[160px] flex items-center justify-center mb-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTestimonialIndex}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="font-serif text-xl md:text-2xl text-dorada-cream italic leading-relaxed mb-6 font-light">
                        "{testimonials[activeTestimonialIndex].text}"
                      </p>
                      <h4 className="font-bold text-dorada-gold text-lg mb-1">
                        {testimonials[activeTestimonialIndex].name}
                      </h4>
                      <p className="text-xs text-dorada-cream/40">{testimonials[activeTestimonialIndex].role}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Dot indicators */}
                <div className="flex justify-center gap-2">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveTestimonialIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                        activeTestimonialIndex === idx ? 'bg-dorada-gold w-6' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* CTA Banner Section with editable background or solid gradient */}
          <section
            className="py-24 px-4 lg:px-12 relative flex items-center justify-center text-center overflow-hidden border-t border-white/5"
            style={{
              backgroundImage: ctaBg ? `linear-gradient(rgba(7, 11, 17, 0.8), rgba(7, 11, 17, 0.8)), url(${ctaBg})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {!ctaBg && <div className="absolute inset-0 bg-gradient-to-br from-[#121c2c] to-[#070b11]" />}

            <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
              <ScrollReveal>
                <h2 className="font-serif text-3xl md:text-5xl font-bold text-dorada-cream mb-6 leading-tight">
                  تريد قطعة مخصصة تناسب ذوقك؟
                </h2>
                <p className="text-sm md:text-base text-dorada-cream/70 max-w-xl mb-8 leading-relaxed">
                  فريقنا من الصاغة المحترفين يسعده تقديم المساعدة في تفصيل وتصميم قطعة مجوهرات أحلامك الفريدة تماماً.
                </p>
                <a
                  href="https://wa.me/9647507078397"
                  target="_blank"
                  rel="noreferrer"
                  className="gold-btn py-3 px-8 text-sm flex items-center gap-2 group border border-transparent inline-block"
                >
                  <Phone className="w-4 h-4" />
                  <span>تواصل معنا عبر الواتساب</span>
                </a>
              </ScrollReveal>
            </div>
          </section>
        </>
      ) : (
        /* --- DYNAMIC FILTERED SHOP VIEW --- */
        <section className="pt-36 pb-24 px-4 lg:px-12 min-h-[70vh]">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-8 gap-4">
              <div>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-dorada-gold hover:underline mb-2 block"
                >
                  ← العودة للرئيسية
                </button>
                <h2 className="font-serif text-3xl font-bold text-dorada-cream">
                  {selectedCategory ? categories.find(c => c.name === selectedCategory)?.nameAr : 'جميع المنتجات'}
                </h2>
                {searchQuery && (
                  <p className="text-sm text-dorada-cream/60 mt-1">نتائج البحث عن: "{searchQuery}"</p>
                )}
              </div>

              {/* Reset filter button */}
              <button
                onClick={handleResetFilters}
                className="px-5 py-2.5 rounded-full border border-white/10 hover:border-dorada-gold text-xs text-dorada-cream hover:text-dorada-gold transition-all"
              >
                إلغاء التصفية
              </button>
            </div>

            {/* Categories horizontal list */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-6 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategory === null
                    ? 'bg-dorada-gold text-[#070b11]'
                    : 'bg-[#121c2c] border border-white/10 text-dorada-cream hover:border-dorada-gold/50'
                }`}
              >
                الكل
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-6 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    selectedCategory === cat.name
                      ? 'bg-dorada-gold text-[#070b11]'
                      : 'bg-[#121c2c] border border-white/10 text-dorada-cream hover:border-dorada-gold/50'
                  }`}
                >
                  {cat.nameAr}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-24">
                <ShoppingBag className="w-16 h-16 text-dorada-cream/15 mx-auto mb-4" />
                <p className="text-dorada-cream/50">لا توجد منتجات مطابقة لهذا التصنيف حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
      )}

      {/* Recently Viewed Products */}
      <section className="bg-[#070b11] border-t border-white/5">
        <RecentlyViewed formatPrice={formatPrice} />
      </section>

      {/* Contact Section */}
      <section className="py-24 px-4 lg:px-12 bg-[#0a0f18] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-serif text-3xl font-bold text-dorada-cream mb-4">للتواصل معنا</h2>
              <p className="text-sm text-dorada-cream/50 max-w-sm mx-auto">
                نحن دائماً في خدمتك لمساعدتك في الحصول على أفضل تجربة تسوق ممكنة.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Instagram */}
            <a
              href="https://instagram.com/dorada_accessories"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#121c2c] border border-white/10 p-8 rounded-2xl text-center group hover:border-dorada-gold/50 transition-all block hover:shadow-gold"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Instagram className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-dorada-cream mb-2">إنستغرام</h3>
              <p className="text-dorada-gold text-sm">@dorada_accessories</p>
            </a>

            {/* Phone */}
            <a
              href="https://wa.me/9647507078397"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#121c2c] border border-white/10 p-8 rounded-2xl text-center group hover:border-dorada-gold/50 transition-all block hover:shadow-gold"
            >
              <div className="w-14 h-14 rounded-full bg-[#1e293b] border border-dorada-gold/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-dorada-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-dorada-cream mb-2">اتصل بنا</h3>
              <p className="text-dorada-cream/65 text-sm group-hover:text-dorada-gold transition-colors">07507078397</p>
            </a>

            {/* Location */}
            <div className="bg-[#121c2c] border border-white/10 p-8 rounded-2xl text-center hover:shadow-gold transition-all duration-300">
              <div className="w-14 h-14 rounded-full bg-[#1e293b] border border-dorada-gold/20 flex items-center justify-center mx-auto mb-5">
                <MapPin className="w-7 h-7 text-dorada-gold" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-dorada-cream mb-2">الموقع</h3>
              <p className="text-dorada-cream/65 text-sm">قريباً في بغداد</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#070b11] py-16 px-4 lg:px-12 text-center md:text-right">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <img src="/doradaicon.svg" alt="دورادا" className="w-12 h-12 text-dorada-gold object-contain" />
            <div>
              <span className="font-serif text-3xl font-bold gold-text block leading-none mb-1">دورادا</span>
              <span className="text-[10px] text-dorada-cream/30 uppercase tracking-widest">Luxury Accessories</span>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-dorada-cream/65">
            <button onClick={handleResetFilters} className="hover:text-dorada-gold transition-colors">الرئيسية</button>
            <button onClick={() => navigate('/wishlist')} className="hover:text-dorada-gold transition-colors">المفضلة</button>
            <button onClick={() => navigate('/cart')} className="hover:text-dorada-gold transition-colors">سلة المشتريات</button>
            <button
              onClick={() => navigate('/secure-access')}
              className="text-dorada-cream/30 hover:text-dorada-gold/50 text-xs transition-colors"
            >
              لوحة التحكم
            </button>
          </div>

          <p className="text-dorada-cream/30 text-xs text-center md:text-left">
            © 2026 دورادا للمجوهرات. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>

      {/* Gallery Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 left-6 p-3 rounded-full bg-white/10 text-white hover:bg-red-500/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={lightboxImage}
              alt="lightbox"
              className="max-w-full max-h-[90vh] object-contain rounded-lg border border-white/10"
            />
          </motion.div>
        )}
      </AnimatePresence>

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

// Reconstructed Product Card Component (No glassmorphism, solid premium dark layout)
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
    <div 
      className="bg-[#121c2c] border border-white/10 overflow-hidden group cursor-pointer hover:border-dorada-gold/30 hover:shadow-gold transition-all duration-500 rounded-2xl flex flex-col h-full"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-black/20">
        {!product.images[0] && (
          <div className="absolute inset-0 bg-white/5 animate-pulse" />
        )}
        <img
          src={getOptimizedImageUrl(product.images[0], 350)}
          alt={product.nameAr}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108 bg-black/20"
        />

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/75 flex items-center justify-center z-10">
            <span className="text-white font-bold text-sm border border-white/20 px-3 py-1 rounded-full bg-black/20">نفذت الكمية</span>
          </div>
        )}

        {/* Discount Badge */}
        {product.originalPrice && product.originalPrice > product.price && !isOutOfStock && (
          <div className="absolute top-3 right-3 px-3 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold z-10 tracking-wide">
            خصم
          </div>
        )}

        {/* Quick View Button */}
        {onQuickView && (
          <button
            onClick={(e) => onQuickView(e, product)}
            className="absolute top-3 left-3 p-2 rounded-full bg-black/60 text-white hover:bg-dorada-gold/90 hover:text-black transition-all opacity-0 group-hover:opacity-100 z-10 border border-white/5"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => onAddToWishlist(e, product.id)}
          className={`absolute top-3 left-3 md:left-auto md:right-3 p-2 rounded-full transition-all z-10 border border-white/5 ${
            isInWishlist
              ? 'bg-red-500 text-white opacity-100'
              : 'bg-black/60 text-white hover:bg-red-500/95 opacity-100 md:opacity-0 md:group-hover:opacity-100'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between">
        <div>
          <p className="text-[10px] text-dorada-gold font-sans font-medium mb-1 uppercase tracking-wider">{product.categoryAr}</p>
          <h3 className="font-serif text-base font-semibold text-dorada-cream mb-2 group-hover:text-dorada-gold transition-colors line-clamp-1">
            {product.nameAr}
          </h3>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-bold gold-text font-mono">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-dorada-cream/40 line-through font-mono">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button */}
          {!isOutOfStock && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              className="w-full bg-[#1e293b] hover:bg-dorada-gold hover:text-black border border-white/5 hover:border-transparent py-2 text-xs flex items-center justify-center gap-1.5 transition-all duration-300 rounded-xl"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>أضف إلى السلة</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
