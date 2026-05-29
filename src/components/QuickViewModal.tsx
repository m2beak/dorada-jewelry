import React, { useEffect } from 'react';
import { X, Heart, ShoppingBag, Share2, Eye, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { useReviews } from '@/hooks/useReviews';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (productId: string) => void;
  isInWishlist: boolean;
  formatPrice: (price: number) => string;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
  onAddToWishlist,
  isInWishlist,
  formatPrice,
}) => {
  const navigate = useNavigate();
  const { data: productReviews = [] } = useReviews(product?.id);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const handleShare = async () => {
    const shareData = {
      title: product.nameAr,
      text: `${product.nameAr} - ${formatPrice(product.price)}`,
      url: window.location.origin + '/product/' + product.id,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('تم نسخ رابط المنتج!');
    }
  };

  const isOutOfStock = product.quantity === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      
      {/* Modal - Solid dark luxury theme */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#121c2c] border border-white/10 rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-red-500/80 transition-colors border border-white/5"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-6 border-b border-white/10">
          {/* Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-black/20">
            <img
              src={product.images[0]}
              alt={product.nameAr}
              className="w-full h-full object-cover"
            />
            
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
                <span className="text-white font-bold text-base border border-white/15 px-3 py-1 rounded-full bg-black/20">نفذت</span>
              </div>
            )}
            
            {/* Discount Badge */}
            {product.originalPrice && product.originalPrice > product.price && !isOutOfStock && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500 text-white text-xs font-bold tracking-wider">
                خصم
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="text-xs text-dorada-gold mb-1 uppercase tracking-wider">{product.categoryAr}</p>
            <h2 className="font-serif text-2xl font-bold text-dorada-cream mb-2">
              {product.nameAr}
            </h2>
            
            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl sm:text-2xl font-bold gold-text font-mono">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-sm sm:text-base text-dorada-cream/40 line-through font-mono">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-dorada-cream/70 mb-6 leading-relaxed font-light line-clamp-4">
              {product.descriptionAr}
            </p>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-semibold text-dorada-cream/70 mb-2">المميزات:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature.id}
                      className="px-2.5 py-1 rounded-lg bg-[#1e293b] border border-white/5 text-dorada-gold text-[10px]"
                    >
                      {feature.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Status */}
            <div className="mb-6">
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1.5 text-red-400 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  نفذت الكمية
                </span>
              ) : product.quantity <= 3 ? (
                <span className="inline-flex items-center gap-1.5 text-orange-400 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  متبقي {product.quantity} فقط
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-green-400 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  متوفر للطلب
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-auto">
              {!isOutOfStock && (
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="flex-1 gold-btn py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  أضف إلى السلة
                </button>
              )}

              <button
                onClick={() => onAddToWishlist(product.id)}
                className={`p-2.5 rounded-xl border transition-all ${
                  isInWishlist
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-white/10 text-dorada-cream hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl border border-white/10 text-dorada-cream hover:border-dorada-gold hover:text-dorada-gold transition-all"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  onClose();
                  navigate(`/product/${product.id}`);
                }}
                className="p-2.5 rounded-xl border border-white/10 text-dorada-cream hover:border-dorada-gold hover:text-dorada-gold transition-all"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Reviews area in QuickView */}
        <div className="p-4 sm:p-6 bg-[#0a0f18]/50">
          <h3 className="font-serif text-base font-bold text-dorada-cream mb-4 border-r-2 border-dorada-gold pr-2">تقييمات المشترين للقطعة</h3>
          
          {productReviews.length > 0 ? (
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {productReviews.map((review) => (
                <div key={review.id} className="bg-[#121c2c] border border-white/5 p-3.5 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-xs text-dorada-cream">{review.name}</span>
                    <span className="text-[9px] text-dorada-cream/40 font-mono">
                      {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div className="flex text-dorada-gold mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-dorada-cream/20'}`} />
                    ))}
                  </div>
                  <p className="text-[11px] text-dorada-cream/70 leading-relaxed font-light">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-dorada-cream/40 text-center py-4">لا توجد تقييمات بعد لهذا المنتج.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
