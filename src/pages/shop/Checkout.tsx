import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  ChevronLeft, 
  Check, 
  MapPin, 
  User, 
  Phone,
  Building,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cart, formatPrice, placeOrder } = useApp();
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
  });
  
  // Phone display with +964 prefix
  const [phoneDisplay, setPhoneDisplay] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Redirect if cart is empty
  if (cart.items.length === 0 && !orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dorada-blue via-[#1a2a3d] to-[#0d1a26]" dir="rtl">
        <nav className="fixed top-0 left-0 right-0 z-50 nav-glass py-4">
          <div className="w-full px-4 lg:px-8">
            <div className="flex items-center justify-center">
              <button onClick={() => navigate('/')} className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-dorada-gold" />
                <span className="font-serif text-lg font-bold gold-text">دورادا</span>
              </button>
            </div>
          </div>
        </nav>
        <main className="pt-24 pb-20 px-4 lg:px-8 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full glass-card flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-dorada-cream/30" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-dorada-cream mb-2">
              السلة فارغة
            </h2>
            <p className="text-dorada-cream/50 mb-6">
              لا يمكن إتمام الطلب، السلة فارغة
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="gold-btn"
            >
              العودة للمتجر
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Format phone for display with +964
  const formatPhoneDisplay = (value: string) => {
    // Remove non-digits
    let digits = value.replace(/\D/g, '');
    
    // Remove leading 0 if present
    if (digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    
    // Limit to 10 digits (Iraqi mobile number without country code)
    if (digits.length > 10) {
      digits = digits.substring(0, 10);
    }
    
    return digits;
  };
  
  // Validate Iraqi phone number
  const validateIraqiPhone = (phone: string): boolean => {
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Iraqi mobile numbers: 10 digits starting with 7
    // Format: 7XX XXX XXXX where XX is the operator code
    const iraqiMobileRegex = /^7[0-9]{9}$/;
    
    return iraqiMobileRegex.test(digits);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'الرجاء إدخال الاسم';
    }
    
    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'الرجاء إدخال رقم الهاتف';
    } else if (!validateIraqiPhone(formData.customerPhone)) {
      newErrors.customerPhone = 'رقم الهاتف غير صحيح. يجب أن يكون 10 أرقام تبدأ بـ 7';
    }
    
    if (!formData.customerAddress.trim()) {
      newErrors.customerAddress = 'الرجاء إدخال العنوان بالتفصيل';
    }
    
    if (!formData.customerCity.trim()) {
      newErrors.customerCity = 'الرجاء إدخال المدينة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    const result = await placeOrder(formData);
    
    if (result.success && result.order) {
      setOrderId(result.order.id.slice(-6).toUpperCase());
      setOrderSuccess(true);
    } else {
      alert(result.error || 'حدث خطأ، يرجى المحاولة مرة أخرى');
    }
    
    setIsSubmitting(false);
  };

  // Success Screen
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dorada-blue via-[#1a2a3d] to-[#0d1a26]" dir="rtl">
        <nav className="fixed top-0 left-0 right-0 z-50 nav-glass py-4">
          <div className="w-full px-4 lg:px-8">
            <div className="flex items-center justify-center">
              <button onClick={() => navigate('/')} className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-dorada-gold" />
                <span className="font-serif text-lg font-bold gold-text">دورادا</span>
              </button>
            </div>
          </div>
        </nav>

        <main className="pt-24 pb-20 px-4 lg:px-8 min-h-screen flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Check className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="font-serif text-3xl font-bold text-dorada-cream mb-4">
              تم إرسال طلبك بنجاح!
            </h2>
            <p className="text-dorada-cream/60 mb-2">
              رقم الطلب: <span className="font-mono text-dorada-gold">#{orderId}</span>
            </p>
            <p className="text-dorada-cream/60 mb-8">
              سنتواصل معك قريباً لتأكيد الطلب وترتيب التوصيل
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/shop')}
                className="gold-btn"
              >
                مواصلة التسوق
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-6 py-3 rounded-full border border-white/20 text-dorada-cream hover:bg-white/5 transition-all"
              >
                العودة للرئيسية
              </button>
            </div>
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
              onClick={() => navigate('/cart')}
              className="flex items-center gap-2 text-dorada-cream/60 hover:text-dorada-gold transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm">العودة للسلة</span>
            </button>

            <button onClick={() => navigate('/')} className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-dorada-gold" />
              <span className="font-serif text-lg font-bold gold-text">دورادا</span>
            </button>

            <div className="w-10" />
          </div>
        </div>
      </nav>

      {/* Checkout Content */}
      <main className="pt-24 pb-20 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-3xl font-bold text-dorada-cream mb-8 text-center">
            إتمام الطلب
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm text-dorada-cream/80 mb-2">
                    الاسم الكامل <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dorada-cream/40" />
                    <input
                      type="text"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="أدخل اسمك الكامل"
                      className={`w-full pr-12 pl-4 py-3 rounded-xl bg-white/5 border text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none transition-colors ${
                        errors.customerName ? 'border-red-500/50' : 'border-white/10'
                      }`}
                    />
                  </div>
                  {errors.customerName && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.customerName}
                    </p>
                  )}
                </div>

                {/* Phone - Iraqi Format */}
                <div>
                  <label className="block text-sm text-dorada-cream/80 mb-2">
                    رقم الهاتف <span className="text-red-400">*</span>
                  </label>
                  <div className="relative flex">
                    {/* Country Code */}
                    <div className="flex items-center px-4 py-3 rounded-r-xl bg-dorada-gold/20 border border-l-0 border-white/10 text-dorada-gold font-medium">
                      <Phone className="w-4 h-4 ml-2" />
                      +964
                    </div>
                    {/* Phone Input */}
                    <input
                      type="tel"
                      value={phoneDisplay}
                      onChange={(e) => {
                        const formatted = formatPhoneDisplay(e.target.value);
                        setPhoneDisplay(formatted);
                        setFormData({ ...formData, customerPhone: formatted });
                      }}
                      placeholder="770 123 4567"
                      maxLength={10}
                      className={`flex-1 pr-4 pl-4 py-3 rounded-l-xl bg-white/5 border text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none transition-colors ${
                        errors.customerPhone ? 'border-red-500/50' : 'border-white/10'
                      }`}
                    />
                  </div>
                  <p className="mt-2 text-xs text-dorada-cream/40">
                    أدخل الرقم بدون الصفر في البداية. مثال: 7701234567
                  </p>
                  {errors.customerPhone && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.customerPhone}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm text-dorada-cream/80 mb-2">
                    المدينة <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Building className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dorada-cream/40" />
                    <input
                      type="text"
                      value={formData.customerCity}
                      onChange={(e) => setFormData({ ...formData, customerCity: e.target.value })}
                      placeholder="مثال: بغداد، أربيل، البصرة..."
                      className={`w-full pr-12 pl-4 py-3 rounded-xl bg-white/5 border text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none transition-colors ${
                        errors.customerCity ? 'border-red-500/50' : 'border-white/10'
                      }`}
                    />
                  </div>
                  {errors.customerCity && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.customerCity}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm text-dorada-cream/80 mb-2">
                    العنوان بالتفصيل <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-4 top-4 w-5 h-5 text-dorada-cream/40" />
                    <textarea
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      placeholder="المنطقة، الحي، أقرب نقطة دالة، رقم المنزل..."
                      rows={4}
                      className={`w-full pr-12 pl-4 py-3 rounded-xl bg-white/5 border text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none transition-colors resize-none ${
                        errors.customerAddress ? 'border-red-500/50' : 'border-white/10'
                      }`}
                    />
                  </div>
                  {errors.customerAddress && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.customerAddress}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full gold-btn py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري إرسال الطلب...</span>
                    </>
                  ) : (
                    <>
                      <span>تأكيد الطلب</span>
                      <Check className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6 sticky top-24">
                <h2 className="font-serif text-xl font-bold text-dorada-cream mb-6">
                  ملخص الطلب
                </h2>

                {/* Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.product.id} className="flex gap-3">
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.nameAr}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm text-dorada-cream truncate">{item.product.nameAr}</h4>
                        <p className="text-xs text-dorada-cream/50">
                          {formatPrice(item.product.price)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-sm gold-text">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-2">
                  <div className="flex justify-between text-dorada-cream/60 text-sm">
                    <span>المجموع الفرعي</span>
                    <span>{formatPrice(cart.total)}</span>
                  </div>
                  <div className="flex justify-between text-dorada-cream/60 text-sm">
                    <span>الشحن</span>
                    <span className="text-green-400">مجاني</span>
                  </div>
                </div>

                <div className="border-t border-white/10 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg text-dorada-cream font-medium">المجموع الكلي</span>
                    <span className="text-2xl font-bold gold-text">{formatPrice(cart.total)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-dorada-gold/5 border border-dorada-gold/20">
                  <p className="text-sm text-dorada-cream/60 text-center">
                    الدفع عند الاستلام
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
