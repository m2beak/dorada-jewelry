import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock } from 'lucide-react';
import { getProductById } from '@/services/database';
import type { Product } from '@/types';
import { getOptimizedUrl } from '@/utils/image';

interface RecentlyViewedProps {
  currentProductId?: string;
  formatPrice: (price: number) => string;
}

const STORAGE_KEY = 'dorada_recently_viewed';
const MAX_ITEMS = 8;

export const addToRecentlyViewed = (productId: string) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let viewed: string[] = stored ? JSON.parse(stored) : [];

    // Remove if already exists
    viewed = viewed.filter(id => id !== productId);

    // Add to beginning
    viewed.unshift(productId);

    // Keep only max items
    viewed = viewed.slice(0, MAX_ITEMS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed));
  } catch (error) {
    console.error('Error saving recently viewed:', error);
  }
};

const RecentlyViewed: React.FC<RecentlyViewedProps> = ({ currentProductId, formatPrice }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const viewedIds: string[] = JSON.parse(stored);

        const fetchProducts = async () => {
          const promises = viewedIds
            .filter(id => id !== currentProductId)
            .slice(0, 4)
            .map(id => getProductById(id));

          const results = await Promise.all(promises);
          const viewedProducts = results.filter((p): p is Product => !!p);
          setProducts(viewedProducts);
        };
        fetchProducts();
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  }, [currentProductId]);

  if (products.length === 0) return null;

  return (
    <section className="py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-dorada-gold" />
            <h2 className="font-serif text-xl font-bold text-dorada-cream">
              شاهدت مؤخراً
            </h2>
          </div>
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-1 text-sm text-dorada-gold hover:underline"
          >
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => navigate(`/product/${product.id}`)}
              className="glass-card overflow-hidden cursor-pointer group"
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={getOptimizedUrl(product.images[0], 400)}
                  alt={product.nameAr}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                {product.quantity === 0 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">نفذت الكمية</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm text-dorada-cream truncate group-hover:text-dorada-gold transition-colors">
                  {product.nameAr}
                </h3>
                <p className="text-xs gold-text mt-1">{formatPrice(product.price)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
