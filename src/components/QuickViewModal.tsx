import React, { useEffect } from 'react';
import { X, Heart, ShoppingBag, Share2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';

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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('تم نسخ رابط المنتج!');
    }
  };

  const isOutOfStock = product.quantity === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-auto glass-card animate-in fade-in zoom-in duration-300">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-red-500/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Image */}
          <div className="relative aspect-square rounded-xl overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.nameAr}
              className="w-full h-full object-cover"
            />
            
            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white font-bold text-xl">نفذت الكمية</span>
              </div>
            )}
            
            {/* Discount Badge */}
            {product.originalPrice && product.originalPrice > product.price && !isOutOfStock && (
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-500 text-white text-sm font-medium">
                خصم
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-sm text-dorada-gold mb-2">{product.categoryAr}</p>
            <h2 className="font-serif text-2xl font-bold text-dorada-cream mb-4">
              {product.nameAr}
            </h2>
            
            {/* Price */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold gold-text">{formatPrice(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-dorada-cream/40 line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-dorada-cream/60 mb-6 line-clamp-3">
              {product.descriptionAr}
            </p>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-medium text-dorada-cream/80 mb-2">المميزات:</h4>
                <div className="flex flex-wrap gap-2">
                  {product.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature.id}
                      className="px-3 py-1 rounded-full bg-dorada-gold/10 text-dorada-gold text-xs"
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
                <span className="inline-flex items-center gap-2 text-red-400">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  نفذت الكمية
                </span>
              ) : product.quantity <= 3 ? (
                <span className="inline-flex items-center gap-2 text-orange-400">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  متبقي {product.quantity} فقط
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 text-green-400">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  متوفر
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-auto">
              {/* Add to Cart */}
              {!isOutOfStock && (
                <button
                  onClick={() => {
                    onAddToCart(product);
                    onClose();
                  }}
                  className="flex-1 gold-btn py-3 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  أضف إلى السلة
                </button>
              )}

              {/* Wishlist */}
              <button
                onClick={() => onAddToWishlist(product.id)}
                className={`p-3 rounded-xl border transition-all ${
                  isInWishlist
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-white/20 text-dorada-cream hover:border-red-500 hover:text-red-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-3 rounded-xl border border-white/20 text-dorada-cream hover:border-dorada-gold hover:text-dorada-gold transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {/* View Full Details */}
              <button
                onClick={() => {
                  onClose();
                  navigate(`/product/${product.id}`);
                }}
                className="p-3 rounded-xl border border-white/20 text-dorada-cream hover:border-dorada-gold hover:text-dorada-gold transition-all"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
