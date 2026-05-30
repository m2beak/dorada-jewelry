import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Sparkles, Globe } from 'lucide-react';

export const LanguageGate: React.FC = () => {
  const { setLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const cached = localStorage.getItem('dorada_language');
    if (!cached) {
      setIsVisible(true);
    }
  }, []);

  if (!isVisible) return null;

  const handleSelect = (lang: 'ar' | 'en' | 'ku') => {
    setLanguage(lang);
    setIsVisible(false);
  };

  return (
    <div className="fixed inset-0 bg-[#070b11] z-[99999] flex items-center justify-center p-4 select-none font-sans overflow-hidden">
      {/* Decorative Gold Blurs in Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-dorada-gold/5 rounded-full filter blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-dorada-gold/5 rounded-full filter blur-[100px] animate-pulse" />
      </div>

      <div className="w-full max-w-md bg-[#121c2c] border border-white/10 rounded-3xl p-8 text-center space-y-8 relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {/* Brand Icon & Heading */}
        <div className="space-y-4">
          <div className="w-20 h-20 rounded-full bg-dorada-gold/10 border border-dorada-gold/20 flex items-center justify-center mx-auto text-dorada-gold shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            <Globe className="w-10 h-10 animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-bold text-dorada-cream tracking-wide">
              DORADA ACCESSORIES
            </h1>
            <p className="text-xs text-dorada-gold uppercase tracking-wider font-mono">
              Luxury Collection
            </p>
          </div>
        </div>

        {/* Language Prompts */}
        <div className="border-y border-white/5 py-4 space-y-1.5 text-dorada-cream/60 text-xs leading-relaxed">
          <p>يرجى اختيار لغتك المفضلة للتسوق</p>
          <p>تکایە زمانەکەت هەڵبژێرە بۆ بازاڕکردن</p>
          <p>Please select your language to shop</p>
        </div>

        {/* Buttons List */}
        <div className="space-y-3">
          {/* Arabic */}
          <button
            onClick={() => handleSelect('ar')}
            className="w-full py-4 px-6 rounded-2xl bg-[#0a0f18] border border-white/5 text-dorada-cream hover:border-dorada-gold/50 hover:bg-dorada-gold/5 transition-all text-sm font-semibold flex items-center justify-between group"
          >
            <span className="font-serif text-dorada-gold">العربية</span>
            <span className="text-xs text-dorada-cream/40 group-hover:text-dorada-cream transition-colors">العراق</span>
          </button>

          {/* Kurdish */}
          <button
            onClick={() => handleSelect('ku')}
            className="w-full py-4 px-6 rounded-2xl bg-[#0a0f18] border border-white/5 text-dorada-cream hover:border-dorada-gold/50 hover:bg-dorada-gold/5 transition-all text-sm font-semibold flex items-center justify-between group"
          >
            <span className="font-serif text-dorada-gold">کوردی</span>
            <span className="text-xs text-dorada-cream/40 group-hover:text-dorada-cream transition-colors">سۆرانی</span>
          </button>

          {/* English */}
          <button
            onClick={() => handleSelect('en')}
            className="w-full py-4 px-6 rounded-2xl bg-[#0a0f18] border border-white/5 text-dorada-cream hover:border-dorada-gold/50 hover:bg-dorada-gold/5 transition-all text-sm font-semibold flex items-center justify-between group"
            dir="ltr"
          >
            <span className="font-serif text-dorada-gold">English</span>
            <span className="text-xs text-dorada-cream/40 group-hover:text-dorada-cream transition-colors">United States</span>
          </button>
        </div>

        {/* Footer Accent */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-dorada-cream/30">
          <Sparkles className="w-3.5 h-3.5 text-dorada-gold/40" />
          <span>إطلالة مميزة بكل اللغات</span>
        </div>
      </div>
    </div>
  );
};
