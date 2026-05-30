import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  ShoppingBag, 
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const Wishlist: React.FC = () => {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlistFn, addToCart, cartItemsCount, formatPrice } = useApp();
  const { language, t, dir, getLocalized } = useLanguage();

  const handleAddToCart = (product: any) => {
    if (product.quantity <= 0) {
      return;
    }
    addToCart(product, 1);
  };

  if (wishlist.items.length === 0) {
    return (
      <div className="min-h-screen bg-[#070b11] text-dorada-cream" dir={dir}>
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b11] border-b border-white/10 py-4 shadow-md">
          <div className="w-full px-4 lg:px-8 relative">
            <div className="flex items-center justify-between h-12">
              <button
                onClick={() => navigate('/shop')}
                className="flex items-center gap-2 text-dorada-cream/60 hover:text-dorada-gold transition-colors z-10"
              >
                {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                <span className="text-sm">{t('cart_back_to_shop')}</span>
              </button>

              <button 
                onClick={() => navigate('/')} 
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2"
              >
                <img src="/doradaicon.svg" alt={t('brand_name')} className="w-8 h-8 text-dorada-gold object-contain" />
                <span className="font-serif text-lg font-bold gold-text">{t('brand_name')}</span>
              </button>

              <div className="flex items-center justify-end z-10 gap-3">
                <LanguageSwitcher />
                <button
                  onClick={() => navigate('/cart')}
                  className="relative p-2.5 rounded-full bg-[#121c2c] border border-white/5 hover:bg-dorada-gold/20 text-dorada-cream hover:text-dorada-gold transition-all"
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

        {/* Empty Wishlist */}
        <main className="pt-24 pb-20 px-4 lg:px-8 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-[#121c2c] border border-white/10 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-dorada-cream/30" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-dorada-cream mb-2">
              {language === 'ku' ? 'لیستی دڵخواز چۆڵە' : language === 'en' ? 'Wishlist is empty' : 'المفضلة فارغة'}
            </h2>
            <p className="text-dorada-cream/50 mb-6">
              {language === 'ku' ? 'تا ئێستا هیچ بابەتێکت بۆ لیستی دڵخواز زیاد نەکردووە' : language === 'en' ? 'You have not added any products to wishlist yet' : 'لم تضف أي منتجات إلى المفضلة بعد'}
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="gold-btn flex items-center gap-2 mx-auto"
            >
              <span>{language === 'ku' ? 'تەماشای بابەتەکان بکە' : language === 'en' ? 'Browse Products' : 'تصفح المنتجات'}</span>
              {dir === 'rtl' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b11] text-dorada-cream" dir={dir}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070b11] border-b border-white/10 py-4 shadow-md">
        <div className="w-full px-4 lg:px-8 relative">
          <div className="flex items-center justify-between h-12">
            <button
              onClick={() => navigate('/shop')}
              className="flex items-center gap-2 text-dorada-cream/60 hover:text-dorada-gold transition-colors z-10"
            >
              {dir === 'rtl' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              <span className="text-sm">{t('cart_back_to_shop')}</span>
            </button>

            <button 
              onClick={() => navigate('/')} 
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2"
            >
              <img src="/doradaicon.svg" alt={t('brand_name')} className="w-8 h-8 text-dorada-gold object-contain" />
              <span className="font-serif text-lg font-bold gold-text">{t('brand_name')}</span>
            </button>

            <div className="flex items-center justify-end z-10 gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2.5 rounded-full bg-[#121c2c] border border-white/5 hover:bg-dorada-gold/20 text-dorada-cream hover:text-dorada-gold transition-all"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-dorada-gold text-[#070b11] text-xs font-bold rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Wishlist Content */}
      <main className="pt-24 pb-20 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-3xl font-bold text-dorada-cream mb-8">
            {t('nav_wishlist')}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.items.map((item) => (
              <div key={item.product.id} className="bg-[#121c2c] border border-white/10 rounded-2xl overflow-hidden group flex flex-col h-full">
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.product.images[0]}
                    alt={getLocalized(item.product, 'name')}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {item.product.quantity === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-bold">{t('product_out_of_stock')}</span>
                    </div>
                  )}
                  <button
                    onClick={() => removeFromWishlistFn(item.product.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-red-500/80 text-white hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-xs text-dorada-gold mb-1">{getLocalized(item.product, 'category')}</p>
                  <h3 
                    className="font-serif text-lg font-semibold text-dorada-cream mb-2 cursor-pointer hover:text-dorada-gold transition-colors"
                    onClick={() => navigate(`/product/${item.product.id}`)}
                  >
                    {getLocalized(item.product, 'name')}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="font-bold gold-text">{formatPrice(item.product.price)}</span>
                    <button
                      onClick={() => handleAddToCart(item.product)}
                      disabled={item.product.quantity === 0}
                      className="p-2 rounded-lg bg-dorada-gold/20 text-dorada-gold hover:bg-dorada-gold hover:text-dorada-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Wishlist;
