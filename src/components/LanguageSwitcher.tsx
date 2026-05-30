import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'ar' as const, name: 'العربية', region: 'العراق' },
    { code: 'ku' as const, name: 'کوردی', region: 'سۆرانی' },
    { code: 'en' as const, name: 'English', region: 'US' },
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#121c2c] border border-white/5 hover:border-dorada-gold/20 text-dorada-cream hover:text-dorada-gold transition-all text-xs font-semibold select-none cursor-pointer"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe className="w-4 h-4 text-dorada-gold" />
        <span className="hidden sm:inline">{currentLang.name}</span>
        <span className="sm:hidden uppercase">{currentLang.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-dorada-cream/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 rounded-2xl bg-[#0a0f18] border border-white/10 shadow-2xl p-1.5 z-[999] animate-in fade-in slide-in-from-top-2 duration-150"
          style={{ transformOrigin: 'top right' }}
        >
          <div className="py-1 space-y-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium transition-all text-right cursor-pointer ${
                  language === lang.code
                    ? 'bg-dorada-gold/10 text-dorada-gold border border-dorada-gold/10'
                    : 'text-dorada-cream/70 hover:text-dorada-cream hover:bg-white/5 border border-transparent'
                }`}
              >
                <span>{lang.name}</span>
                <span className="text-[10px] opacity-40">{lang.region}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
