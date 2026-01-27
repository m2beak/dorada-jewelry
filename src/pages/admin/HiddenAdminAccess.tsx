import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { grantAdminAccess, hasAdminAccess } from '@/services/security';
import { isAdminSetup } from '@/services/database';

const HiddenAdminAccess: React.FC = () => {
  const navigate = useNavigate();
  const [secretKey, setSecretKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if already has access
  // Check if already has access
  useEffect(() => {
    if (hasAdminAccess()) {
      // Allow user to see the page if they explicitly navigated here, 
      // or redirect if they are already fully set up
      if (isAdminSetup()) {
        // If they are fully setup and logged in, maybe redirect, but asking for key again is safer or fine
        // For now, let's NOT auto-redirect if they are just re-visiting this page to login
        // Actually, if they have access, they should probably go to login/setup
        // BUT the user said it "doesn't take me there", implying they want to see THIS page.
        // Let's comment out the auto-redirect for now to ensure they can at least see the input.

        // navigate('/admin/login'); // Intentionally disabled to allow re-entry
      } else {
        // navigate('/admin/setup'); // Intentionally disabled
      }
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = grantAdminAccess(secretKey);

    if (result.success) {
      // Redirect based on admin setup status
      if (isAdminSetup()) {
        navigate('/admin/login');
      } else {
        navigate('/admin/setup');
      }
    } else {
      setError(result.error || 'مفتاح غير صحيح');
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

      {/* Access Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="glass-card p-8 md:p-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-dorada-gold/10 mb-4">
              <Shield className="w-8 h-8 text-dorada-gold" />
            </div>
            <h1 className="font-serif text-2xl font-bold gold-text mb-2">
              وصول آمن
            </h1>
            <p className="font-sans text-sm text-dorada-cream/60">
              هذا القسم مخصص للمسؤول فقط
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Secret Key */}
            <div>
              <label className="block font-sans text-sm text-dorada-cream/80 mb-2">
                المفتاح السري
              </label>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dorada-cream/40" />
                <input
                  type={showKey ? 'text' : 'password'}
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full pr-12 pl-12 py-3 rounded-xl bg-white/5 border border-white/10 text-dorada-cream placeholder-dorada-cream/30 focus:border-dorada-gold focus:outline-none transition-colors font-sans"
                  placeholder="أدخل المفتاح السري"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-dorada-cream/40 hover:text-dorada-gold transition-colors"
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
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
                  <Shield className="w-4 h-4" />
                  <span>الدخول</span>
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

          {/* Security Note */}
          <div className="mt-8 p-4 rounded-lg bg-dorada-gold/5 border border-dorada-gold/20">
            <p className="font-sans text-xs text-dorada-cream/50 text-center">
              <Shield className="w-4 h-4 inline-block ml-1" />
              هذا القسم محمي ومتاح فقط للمسؤول المصرح له
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiddenAdminAccess;
