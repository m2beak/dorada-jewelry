import React, { useState } from 'react';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { useReviews } from '@/hooks/useReviews';

interface ProductReviewsSummaryProps {
  productId: string;
}

export const ProductReviewsSummary: React.FC<ProductReviewsSummaryProps> = ({ productId }) => {
  const { data: reviews = [], isLoading } = useReviews(productId);
  const [isOpen, setIsOpen] = useState(false);

  if (isLoading) {
    return <span className="text-[10px] text-dorada-cream/40 font-light">جاري تحميل التقييمات...</span>;
  }

  if (reviews.length === 0) {
    return (
      <span className="text-[10px] text-dorada-cream/30 font-light">
        لا توجد تقييمات بعد
      </span>
    );
  }

  const averageRating = (
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="mt-2 text-right" dir="rtl">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 text-xs text-dorada-cream/60 hover:text-dorada-gold transition-colors focus:outline-none"
      >
        <div className="flex text-dorada-gold">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < Math.round(Number(averageRating)) ? 'fill-current' : 'text-dorada-cream/20'
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-[11px] text-dorada-gold">({averageRating})</span>
        <span className="text-[10px] border-b border-dashed border-white/20 hover:border-dorada-gold">
          {reviews.length} {reviews.length === 1 ? 'تقييم' : 'تقييمات'}
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-2 space-y-2 bg-black/35 border border-white/5 rounded-xl p-3 max-h-40 overflow-y-auto text-right">
          {reviews.map((review) => (
            <div key={review.id} className="border-b border-white/5 last:border-b-0 pb-2 last:pb-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-medium text-[11px] text-dorada-cream">{review.name}</span>
                <span className="text-[9px] text-dorada-cream/30 font-mono">
                  {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>
              <div className="flex text-dorada-gold mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-2.5 h-2.5 ${i < review.rating ? 'fill-current' : 'text-dorada-cream/20'}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-dorada-cream/70 leading-relaxed font-light">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
