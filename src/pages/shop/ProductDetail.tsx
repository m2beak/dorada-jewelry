import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Check,
  Crown,
  Minus,
  Plus,
  ChevronLeft,
  Heart,
  Instagram,
  Phone,
  MapPin,
  Scale,
  Tag,
  Ruler,
  Palette,
  Shield,
  Sparkles,
} from 'lucide-react';
import { getProductById, getProductsByCategory } from '@/services/database';
import { useApp } from '@/contexts/AppContext';
import ImageGallery from '@/components/ImageGallery';
import RecentlyViewed, { addToRecentlyViewed } from '@/components/RecentlyViewed';
import type { Product } from '@/types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItemsCount, wishlistItemsCount, formatPrice, addToWishlistFn, isInWishlistFn, removeFromWishlistFn } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    if (id) {
      const prod = getProductById(id);
      if (prod) {
        setProduct(prod);
        setQuantity(1);
        // Add to recently viewed
        addToRecentlyViewed(id);
        // Get related products from same category
        const related = getProductsByCategory(prod.category)
          .filter(p => p.id !== prod.id)
          .slice(0, 4);
        setRelatedProducts(related);
      }
    }
  }, [id]);

  const handleAddToCart = () => {
    if (product && product.quantity > 0) {
      addToCart(product, quantity);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    }
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    if (isInWishlistFn(product.id)) {
      removeFromWishlistFn(product.id);
    } else {
      addToWishlistFn(product.id);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dorada-blue via-[#1a2a3d] to-[#0d1a26]" dir="rtl">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 text-dorada-cream/20 mx-auto mb-4" />
          <p className="text-dorada-cream/50">المنتج غير موجود</p>
          <button
            onClick={() => navigate('/shop')}
            className="mt-4 gold-btn"
          >
            العودة للمتجر
          </button>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.quantity === 0;
  const isInWishlist = isInWishlistFn(product.id);

  // Combine all specs for display
  const allSpecs = [
    ...(product.weight ? [{ icon: Scale, label: 'الوزن', value: product.weight }] : []),
    ...(product.material ? [{ icon: Tag, label: 'المادة', value: product.material }] : []),
    ...(product.size ? [{ icon: Ruler, label: 'المقاس', value: product.size }] : []),
    ...(product.color ? [{ icon: Palette, label: 'اللون', value: product.color }] : []),
    ...(product.warranty ? [{ icon: Shield, label: 'الضمان', value: product.warranty }] : []),
    ...(product.features || []).map(f => ({ icon: Sparkles, label: f.label, value: f.value })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dorada-blue via-[#1a2a3d] to-[#0d1a26]" dir="rtl">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 nav-glass py-4">
        <div className="w-full px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 text-dorada-cream/60 hover:text-dorada-gold transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">العودة</span>
            </button>

            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-dorada-gold" />
              <span className="font-serif text-lg font-bold gold-text">دورادا</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Wishlist */}
              <button
                onClick={() => navigate('/wishlist')}
                className="relative p-2 rounded-full bg-white/5 hover:bg-dorada-gold/20 text-dorada-cream hover:text-dorada-gold transition-all"
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
                className="relative p-2 rounded-full bg-white/5 hover:bg-dorada-gold/20 text-dorada-cream hover:text-dorada-gold transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-dorada-gold text-dorada-blue text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Product Details */}
      <main className="pt-24 pb-20 px-4 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Product Image Gallery */}
            <div className="glass-card p-4 lg:p-8">
              <ImageGallery
                images={product.images}
                alt={product.nameAr}
                className="w-full aspect-square"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
              <span className="inline-block w-fit px-4 py-1.5 rounded-full glass-card text-xs font-medium text-dorada-gold mb-4">
                {product.categoryAr}
              </span>

              <h1 className="font-serif text-3xl md:text-4xl font-bold text-dorada-cream mb-4">
                {product.nameAr}
              </h1>

              <p className="text-dorada-cream/60 mb-6 leading-relaxed">
                {product.descriptionAr}
              </p>

              {/* Stock Status */}
              {isOutOfStock ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 mb-6">
                  <span className="font-bold">نفذت الكمية</span>
                </div>
              ) : product.quantity <= 3 ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500/20 text-yellow-400 mb-6">
                  <span>متبقي فقط {product.quantity} قطع</span>
                </div>
              ) : null}

              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-bold gold-text">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xl text-dorada-cream/40 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-dorada-cream/80">الكمية:</span>
                  <div className="flex items-center gap-3 glass-card px-2 py-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg hover:bg-white/10 text-dorada-cream transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-dorada-cream">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      className="p-2 rounded-lg hover:bg-white/10 text-dorada-cream transition-colors"
                      disabled={quantity >= product.quantity}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdded}
                  className={`flex-1 px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2 ${isAdded
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : isOutOfStock
                        ? 'bg-dorada-cream/10 text-dorada-cream/40 cursor-not-allowed'
                        : 'gold-btn'
                    }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>تمت الإضافة</span>
                    </>
                  ) : isOutOfStock ? (
                    <>
                      <span>نفذت الكمية</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-5 h-5" />
                      <span>أضف إلى السلة</span>
                    </>
                  )}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlistToggle}
                  className={`px-4 py-4 rounded-full border-2 transition-all ${isInWishlist
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-dorada-cream/30 text-dorada-cream hover:border-dorada-gold hover:text-dorada-gold'
                    }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Product Specifications */}
              {allSpecs.length > 0 && (
                <div className="border-t border-white/10 pt-6 mb-6">
                  <h3 className="font-serif text-lg text-dorada-cream mb-4">مواصفات المنتج</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {allSpecs.map((spec, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                        <spec.icon className="w-4 h-4 text-dorada-gold flex-shrink-0" />
                        <div>
                          <p className="text-xs text-dorada-cream/50">{spec.label}</p>
                          <p className="text-sm text-dorada-cream">{spec.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Default Feature - Only "جودة رائعة" */}
              <div className="border-t border-white/10 pt-6">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-dorada-gold" />
                  <span className="text-sm text-dorada-cream/60">جودة رائعة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-20">
              <h2 className="font-serif text-2xl font-bold text-dorada-cream mb-8">
                منتجات مشابهة
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="glass-card overflow-hidden group cursor-pointer"
                    onClick={() => navigate(`/product/${prod.id}`)}
                  >
                    <div className="aspect-square overflow-hidden">
                      <img
                        src={prod.images[0]}
                        alt={prod.nameAr}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-lg font-semibold text-dorada-cream group-hover:text-dorada-gold transition-colors">
                        {prod.nameAr}
                      </h3>
                      <p className="font-bold gold-text mt-2">{formatPrice(prod.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Recently Viewed */}
      <div className="px-4 lg:px-8">
        <RecentlyViewed currentProductId={id} formatPrice={formatPrice} />
      </div>

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
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Crown className="w-8 h-8 text-dorada-gold" />
              <span className="font-serif text-2xl font-bold gold-text">دورادا</span>
            </div>
            <p className="text-dorada-cream/40 text-sm text-center">
              © 2024 دورادا. جميع الحقوق محفوظة.
            </p>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;
