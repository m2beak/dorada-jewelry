import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Lock, User, Eye, EyeOff, Check } from 'lucide-react';
import { setupAdmin } from '@/services/database';

const AdminSetup: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!username.trim() || username.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
      return;
    }

    if (!password || password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    if (password !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
      return;
    }

    setIsLoading(true);

    const result = setupAdmin(username, password);
    
    if (result.success) {
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/admin');
      }, 2000);
    } else {
      setError(result.error || 'حدث خطأ');
    }
    
    setIsLoading(false);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" dir="rtl">
        <div className="absolute inset-0 bg-gradient-to-br from-dorada-blue via-[#1a2a3d] to-[#0d1a26]" />
        
        <div className="relative z-10 w-full max-w-md mx-4">
          <div className="glass-card p-8 md:p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-400" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-dorada-cream mb-4">
              تم إنشاء الحساب بنجاح!
            </h2>
            <p className="text-dorada-cream/60 mb-6">
              سيتم تحويلك إلى صفحة تسجيل الدخول...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dorada-blue via-[#1a2a3d] to-[#0d1a26]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dorada-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-dorada-gold/5 rounded-full blur-3xl" />

      {/* Setup Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dorada-gold/10 mb-4">
              <Crown className="w-8 h-8 text-dorada-gold" />
            </div>
            <h1 className="font-serif text-2xl font-bold gold-text mb-2">
              إعداد المسؤول
            </h1>
            <p className="font-sans text-sm text-dorada-cream/60">
              قم بإنشاء حساب المسؤول للوحة التحكم
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block font-sans text-sm text-dorada-cream/80 mb-2">
                اسم المستخدم
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dorada-cream/40" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none transition-colors font-sans"
                  placeholder="أدخل اسم المستخدم"
                  required
                  minLength={3}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-sans text-sm text-dorada-cream/80 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dorada-cream/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-12 pl-12 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none transition-colors font-sans"
                  placeholder="أدخل كلمة المرور"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-dorada-cream/40 hover:text-dorada-gold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block font-sans text-sm text-dorada-cream/80 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dorada-cream/40" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pr-12 pl-12 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none transition-colors font-sans"
                  placeholder="أعد إدخال كلمة المرور"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-dorada-cream/40 hover:text-dorada-gold transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-sans text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full gold-btn py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-dorada-blue/30 border-t-dorada-blue rounded-full animate-spin" />
              ) : (
                <>
                  <span>إنشاء الحساب</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Requirements */}
          <div className="mt-6 p-4 rounded-lg bg-dorada-gold/5 border border-dorada-gold/20">
            <p className="font-sans text-xs text-dorada-cream/60">
              متطلبات كلمة المرور:
            </p>
            <ul className="mt-2 space-y-1 font-sans text-xs text-dorada-cream/50">
              <li className={password.length >= 6 ? 'text-green-400' : ''}>
                {password.length >= 6 ? '✓' : '•'} 6 أحرف على الأقل
              </li>
              <li className={password === confirmPassword && password !== '' ? 'text-green-400' : ''}>
                {password === confirmPassword && password !== '' ? '✓' : '•'} كلمتا المرور متطابقتان
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSetup;
