import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  Trash2, 
  Minus, 
  Plus, 
  Crown,
  ChevronLeft,
  ArrowRight,
  Package,
  Heart
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartItemQuantity, formatPrice, wishlistItemsCount } = useApp();

  if (cart.items.length === 0) {
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
                <span className="text-sm">العودة للمتجر</span>
              </button>

              <button onClick={() => navigate('/')} className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-dorada-gold" />
                <span className="font-serif text-lg font-bold gold-text">دورادا</span>
              </button>

              <div className="flex items-center gap-2">
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
              </div>
            </div>
          </div>
        </nav>

        {/* Empty Cart */}
        <main className="pt-24 pb-20 px-4 lg:px-8 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-12 h-12 text-dorada-cream/30" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-dorada-cream mb-2">
              السلة فارغة
            </h2>
            <p className="text-dorada-cream/50 mb-6">
              لم تضف أي منتجات إلى سلة التسوق بعد
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="gold-btn flex items-center gap-2 mx-auto"
            >
              <span>تصفح المنتجات</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    );
  }

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
              <span className="text-sm">العودة للمتجر</span>
            </button>

            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-dorada-gold" />
              <span className="font-serif text-lg font-bold gold-text">دورادا</span>
            </button>

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
          </div>
        </div>
      </nav>

      {/* Cart Content */}
      <main className="pt-24 pb-20 px-4 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-serif text-3xl font-bold text-dorada-cream mb-8">
            سلة التسوق
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div key={item.product.id} className="glass-card p-4 flex gap-4">
                  <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.nameAr}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-dorada-cream">
                        {item.product.nameAr}
                      </h3>
                      <p className="text-sm text-dorada-cream/50">{item.product.categoryAr}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 glass-card px-2 py-1">
                        <button
                          onClick={() => updateCartItemQuantity(item.product.id, item.quantity - 1)}
                          className="p-1.5 rounded hover:bg-white/10 text-dorada-cream transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-bold text-dorada-cream">{item.quantity}</span>
                        <button
                          onClick={() => updateCartItemQuantity(item.product.id, item.quantity + 1)}
                          className="p-1.5 rounded hover:bg-white/10 text-dorada-cream transition-colors"
                          disabled={item.quantity >= item.product.quantity}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold gold-text">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 text-dorada-cream/60 hover:text-red-400 transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="glass-card p-6">
                <h2 className="font-serif text-xl font-bold text-dorada-cream mb-6">
                  ملخص الطلب
                </h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-dorada-cream/60">
                    <span>عدد المنتجات</span>
                    <span>{cart.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                  </div>
                  <div className="flex justify-between text-dorada-cream/60">
                    <span>المجموع الفرعي</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-dorada-cream/60">
                    <span>الشحن</span>
                    <span className="text-green-400">مجاني</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-dorada-cream font-medium">المجموع الكلي</span>
                    <span className="text-2xl font-bold gold-text">{formatPrice(cart.total)}</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full gold-btn py-4 flex items-center justify-center gap-2"
                >
                  <span>إتمام الطلب</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="mt-6 flex items-center justify-center gap-2 text-dorada-cream/40 text-sm">
                  <Package className="w-4 h-4" />
                  <span>الشحن مجاني لجميع الطلبات</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Cart;
