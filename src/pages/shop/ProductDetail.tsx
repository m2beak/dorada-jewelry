import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Check,
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
  Star
} from 'lucide-react';
import { getProductById, getProductsByCategory } from '@/services/database';
import { useApp } from '@/contexts/AppContext';
import ImageGallery from '@/components/ImageGallery';
import RecentlyViewed, { addToRecentlyViewed } from '@/components/RecentlyViewed';
import type { Product } from '@/types';
import { getOptimizedImageUrl } from '@/utils/image';
import { useReviews, useAddReviewMutation } from '@/hooks/useReviews';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, cartItemsCount, wishlistItemsCount, formatPrice, addToWishlistFn, isInWishlistFn, removeFromWishlistFn } = useApp();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isAdded, setIsAdded] = useState(false);

  // Reviews query and mutation
  const { data: productReviews = [], refetch: refetchProductReviews } = useReviews(id);
  const addReviewMutation = useAddReviewMutation(id);

  // Form State
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      const loadProduct = async () => {
        const prod = await getProductById(id);
        if (prod) {
          setProduct(prod);
          setQuantity(1);
          addToRecentlyViewed(id);
          const allCategoryProducts = await getProductsByCategory(prod.category);
          const related = allCategoryProducts
            .filter(p => p.id !== prod.id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      };
      loadProduct();
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newReview.name.trim() || !newReview.comment.trim()) {
      alert('الرجاء كتابة الاسم والتعليق');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addReviewMutation.mutateAsync({
        name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment,
        productId: id
      });
      setNewReview({ name: '', rating: 5, comment: '' });
      refetchProductReviews();
      alert('تم إضافة تقييمك للمنتج بنجاح!');
    } catch (err) {
      console.error(err);
      alert('فشل إرسال التقييم');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070b11]" dir="rtl">
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

  // Combine specs
  const allSpecs = [
    ...(product.weight ? [{ icon: Scale, label: 'الوزن', value: product.weight }] : []),
    ...(product.material ? [{ icon: Tag, label: 'المادة', value: product.material }] : []),
    ...(product.size ? [{ icon: Ruler, label: 'المقاس', value: product.size }] : []),
    ...(product.color ? [{ icon: Palette, label: 'اللون', value: product.color }] : []),
    ...(product.warranty ? [{ icon: Shield, label: 'الضمان', value: product.warranty }] : []),
    ...(product.features || []).map(f => ({ icon: Sparkles, label: f.label, value: f.value })),
  ];

  // Average Rating
  const averageRating = productReviews.length > 0 
    ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-[#070b11] text-dorada-cream relative overflow-x-hidden font-sans" dir="rtl">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b11] border-b border-white/10 py-3 shadow-md">
        <div className="w-full px-4 lg:px-12 relative">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-1.5 text-dorada-cream/60 hover:text-dorada-gold transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs sm:text-sm">العودة</span>
            </button>

            <button 
              onClick={() => navigate('/')} 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2"
            >
              <img src="/doradaicon.svg" alt="دورادا" className="w-8 h-8 text-dorada-gold object-contain" />
              <span className="font-serif text-lg font-bold gold-text">دورادا</span>
            </button>

            <div className="flex items-center gap-2 z-10 justify-end w-24">
              {/* Wishlist */}
              <button
                onClick={() => navigate('/wishlist')}
                className="relative p-2.5 rounded-full bg-[#121c2c] border border-white/5 hover:border-dorada-gold/30 text-dorada-cream hover:text-dorada-gold transition-all"
              >
                <Heart className="w-4.5 h-4.5" />
                {wishlistItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlistItemsCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2.5 rounded-full bg-[#121c2c] border border-white/5 hover:border-dorada-gold/30 text-dorada-cream hover:text-dorada-gold transition-all"
              >
                <ShoppingBag className="w-4.5 h-4.5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-dorada-gold text-[#070b11] text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Details */}
      <main className="pt-28 pb-16 px-4 lg:px-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
            {/* Image Gallery */}
            <div className="bg-[#121c2c] border border-white/10 p-4 rounded-2xl">
              <ImageGallery
                images={product.images}
                alt={product.nameAr}
                className="w-full aspect-square"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center py-2">
              <span className="inline-block w-fit px-4 py-1 rounded-full bg-[#121c2c] border border-white/10 text-[10px] sm:text-xs font-semibold text-dorada-gold mb-4 uppercase tracking-wider">
                {product.categoryAr}
              </span>

              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-dorada-cream mb-4">
                {product.nameAr}
              </h1>

              {/* Average Rating summary */}
              {averageRating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex text-dorada-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-dorada-cream/20'}`} />
                    ))}
                  </div>
                  <span className="text-xs text-dorada-cream/70 font-mono">({averageRating})</span>
                  <span className="text-xs text-dorada-cream/40">• {productReviews.length} تقييمات</span>
                </div>
              )}

              <p className="text-sm sm:text-base text-dorada-cream/75 mb-6 leading-relaxed font-light">
                {product.descriptionAr}
              </p>

              {/* Stock Status */}
              {isOutOfStock ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/25 text-red-400 text-xs font-bold w-fit mb-6">
                  <span>نفذت الكمية</span>
                </div>
              ) : product.quantity <= 3 ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/25 text-yellow-400 text-xs font-medium w-fit mb-6">
                  <span>متبقي فقط {product.quantity} قطع</span>
                </div>
              ) : null}

              {/* Price */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-2xl sm:text-3xl font-bold gold-text font-mono">{formatPrice(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-base sm:text-lg text-dorada-cream/40 line-through font-mono">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-xs sm:text-sm text-dorada-cream/70">الكمية:</span>
                  <div className="flex items-center gap-3 bg-[#121c2c] border border-white/10 px-2.5 py-1 rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-dorada-cream transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-sm text-dorada-cream font-mono">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-dorada-cream transition-colors"
                      disabled={quantity >= product.quantity}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || isAdded}
                  className={`flex-1 py-3 px-6 rounded-full font-bold transition-all text-xs flex items-center justify-center gap-2 ${
                    isAdded
                      ? 'bg-green-500/20 text-green-400 border border-green-500/35'
                      : isOutOfStock
                        ? 'bg-white/5 text-dorada-cream/30 cursor-not-allowed border border-white/10'
                        : 'gold-btn'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تمت الإضافة للسلة</span>
                    </>
                  ) : isOutOfStock ? (
                    <span>نفذت الكمية</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4.5 h-4.5" />
                      <span>أضف إلى السلة</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleWishlistToggle}
                  className={`px-4 py-3 rounded-full border transition-all ${
                    isInWishlist
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'border-white/10 text-dorada-cream hover:border-dorada-gold hover:text-dorada-gold'
                  }`}
                >
                  <Heart className={`w-4.5 h-4.5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Specifications */}
              {allSpecs.length > 0 && (
                <div className="border-t border-white/10 pt-6 mb-6">
                  <h3 className="font-serif text-sm font-semibold text-dorada-cream mb-4">مواصفات القطعة</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {allSpecs.map((spec, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-[#121c2c] border border-white/5">
                        <spec.icon className="w-4 h-4 text-dorada-gold flex-shrink-0" />
                        <div>
                          <p className="text-[10px] text-dorada-cream/40">{spec.label}</p>
                          <p className="text-xs text-dorada-cream font-medium">{spec.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Product Specific Reviews Panel */}
          <div className="border-t border-white/10 pt-16 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Review Display List */}
              <div className="lg:col-span-2 space-y-6">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-dorada-cream mb-6">تقييمات المشترين للقطعة</h3>
                
                {productReviews.length > 0 ? (
                  <div className="space-y-4">
                    {productReviews.map((review) => (
                      <div key={review.id} className="bg-[#121c2c] border border-white/5 p-4 sm:p-5 rounded-2xl">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-dorada-cream text-sm sm:text-base">{review.name}</h4>
                          <span className="text-[10px] text-dorada-cream/40 font-mono">
                            {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        <div className="flex text-dorada-gold mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-dorada-cream/20'}`} />
                          ))}
                        </div>
                        <p className="text-xs sm:text-sm text-dorada-cream/70 leading-relaxed font-light">
                          {review.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-[#121c2c]/40 border border-white/5 p-6 rounded-2xl text-center text-dorada-cream/45 text-sm">
                    لا توجد تقييمات لهذا المنتج بعد. كن أول من يكتب تقييماً!
                  </div>
                )}
              </div>

              {/* Add Review Panel */}
              <div className="bg-[#121c2c] border border-white/10 p-6 rounded-2xl h-fit">
                <h4 className="font-serif text-lg font-bold text-dorada-cream mb-4">كتابة تقييم للمنتج</h4>
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-dorada-cream/60 mb-1">الاسم الكامل</label>
                    <input
                      type="text"
                      required
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/20 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none"
                      placeholder="اسمك هنا"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-dorada-cream/60 mb-1">التقييم</label>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                          className="text-dorada-gold"
                        >
                          <Star className={`w-5 h-5 ${star <= newReview.rating ? 'fill-current' : 'text-dorada-cream/35'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-dorada-cream/60 mb-1">التعليق والملحوظة</label>
                    <textarea
                      required
                      rows={3}
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-black/20 border border-white/10 text-dorada-cream focus:border-dorada-gold focus:outline-none resize-none"
                      placeholder="شاركنا رأيك في التصميم وجودة الصياغة..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full gold-btn py-2 text-[11px] font-bold disabled:opacity-50 mt-2"
                  >
                    {isSubmittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-dorada-cream mb-6 pr-2 border-r-2 border-dorada-gold">
                قطع مجوهرات مشابهة
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
                {relatedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-[#121c2c] border border-white/10 rounded-xl overflow-hidden group cursor-pointer hover:border-dorada-gold/30 hover:shadow-gold transition-all duration-300 flex flex-col h-full"
                    onClick={() => navigate(`/product/${prod.id}`)}
                  >
                    <div className="relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-black/20">
                      <img
                        src={getOptimizedImageUrl(prod.images[0], 300)}
                        alt={prod.nameAr}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-2 sm:p-4 flex flex-col flex-grow justify-between">
                      <h3 className="font-serif text-xs sm:text-base font-semibold text-dorada-cream group-hover:text-dorada-gold transition-colors line-clamp-1">
                        {prod.nameAr}
                      </h3>
                      <span className="text-xs font-bold gold-text font-mono mt-1 sm:mt-2">{formatPrice(prod.price)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Recently Viewed */}
      <section className="bg-[#070b11] border-t border-white/5">
        <RecentlyViewed currentProductId={id} formatPrice={formatPrice} />
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 lg:px-12 bg-[#0a0f18] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-dorada-cream mb-4">
              للتواصل معنا
            </h2>
            <p className="text-xs text-dorada-cream/60">
              نحن هنا لمساعدتك، تواصل معنا عبر القنوات التالية
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Instagram */}
            <a
              href="https://instagram.com/dorada_accessories"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#121c2c] border border-white/10 p-6 rounded-2xl text-center group hover:border-dorada-gold/50 transition-all hover:shadow-gold"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Instagram className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-serif text-base font-semibold text-dorada-cream mb-1.5">إنستغرام</h3>
              <p className="text-dorada-gold text-xs">@dorada_accessories</p>
            </a>

            {/* Phone */}
            <a
              href="https://wa.me/9647507078397"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#121c2c] border border-white/10 p-6 rounded-2xl text-center group hover:border-dorada-gold/50 transition-all block hover:shadow-gold"
            >
              <div className="w-12 h-12 rounded-full bg-[#1e293b] border border-dorada-gold/20 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
                <Phone className="w-6 h-6 text-dorada-gold" />
              </div>
              <h3 className="font-serif text-base font-semibold text-dorada-cream mb-1.5">اتصل بنا</h3>
              <p className="text-dorada-cream/65 text-xs group-hover:text-dorada-gold transition-colors">07507078397</p>
            </a>

            {/* Location */}
            <div className="bg-[#121c2c] border border-white/10 p-6 rounded-2xl text-center hover:shadow-gold transition-all duration-300">
              <div className="w-12 h-12 rounded-full bg-[#1e293b] border border-dorada-gold/20 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-dorada-gold" />
              </div>
              <h3 className="font-serif text-base font-semibold text-dorada-cream mb-1.5">الموقع</h3>
              <p className="text-dorada-cream/65 text-xs">قريباً</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#070b11] py-12 px-4 lg:px-12 text-center md:text-right animate-fade-in">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/doradaicon.svg" alt="دورادا" className="w-10 h-10 text-dorada-gold object-contain" />
            <span className="font-serif text-2xl font-bold gold-text">دورادا</span>
          </div>
          <p className="text-dorada-cream/30 text-xs text-center">
            © 2026 دورادا للمجوهرات. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;
