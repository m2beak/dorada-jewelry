import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, User, Shield } from 'lucide-react';
import { loginAdmin, isAdminSetup } from '@/services/database';
import { hasAdminAccess } from '@/services/security';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has secret key access
  React.useEffect(() => {
    if (!hasAdminAccess()) {
      navigate('/secure-access');
    }
    // If admin not set up, redirect to setup
    if (!isAdminSetup()) {
      navigate('/admin/setup');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await loginAdmin(username, password);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" dir="rtl">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-dorada-blue via-[#1a2a3d] to-[#0d1a26]" />

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dorada-gold/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-dorada-gold/5 rounded-full blur-3xl" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dorada-gold/10 mb-4">
              <Shield className="w-8 h-8 text-dorada-gold" />
            </div>
            <h1 className="font-serif text-2xl font-bold gold-text mb-2">
              تسجيل دخول المسؤول
            </h1>
            <p className="font-sans text-sm text-dorada-cream/60">
              أدخل بيانات حسابك للمتابعة
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block font-sans text-sm text-dorada-cream/80 mb-2">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dorada-cream/40" />
                <input
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pr-12 pl-4 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none transition-colors font-sans"
                  placeholder="admin@dorada.jewelry"
                  required
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
                  <Lock className="w-4 h-4" />
                  <span>تسجيل الدخول</span>
                </>
              )}
            </button>
          </form>

          {/* Back to Shop */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="font-sans text-sm text-dorada-cream/50 hover:text-dorada-gold transition-colors"
            >
              العودة إلى المتجر
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
