import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '@/locales/translations';
import type { Language, TranslationKey } from '@/locales/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
  formatPrice: (price: number) => string;
  getLocalized: (obj: any, field: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Read initial language from local cache, fallback to 'ar'
  const [language, setLanguageState] = useState<Language>(() => {
    const cached = localStorage.getItem('dorada_language');
    if (cached === 'ar' || cached === 'en' || cached === 'ku') {
      return cached;
    }
    // Return 'ar' as default, but the gate modal will override this if not set
    return 'ar';
  });

  const dir = language === 'en' ? 'ltr' : 'rtl';

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('dorada_language', lang);
  }, []);

  // Update HTML tag attributes when language/direction changes
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    document.documentElement.setAttribute('dir', dir);
  }, [language, dir]);

  // Translate function
  const t = useCallback((key: TranslationKey): string => {
    const keysGroup = translations[language];
    if (!keysGroup) return translations['ar'][key] || String(key);
    
    const val = keysGroup[key];
    if (val === undefined) {
      // Fallback to Arabic, then key name if missing
      return translations['ar'][key] || String(key);
    }
    return val;
  }, [language]);

  // Translate object fields dynamically
  const getLocalized = useCallback((obj: any, field: string): string => {
    if (!obj) return '';
    
    if (language === 'ku') {
      const kuField = `${field}Ku`;
      const arField = `${field}Ar`;
      return obj[kuField] || obj[arField] || obj[field] || '';
    }
    if (language === 'en') {
      return obj[field] || obj[`${field}Ar`] || '';
    }
    // Default 'ar'
    const arField = `${field}Ar`;
    return obj[arField] || obj[field] || '';
  }, [language]);

  // Translation-aware price formatter
  const formatPrice = useCallback((price: number): string => {
    if (language === 'ku') {
      const val = price / 1000;
      // Format number to have commas if it is large (e.g. 1250 -> 1,250)
      const formattedNum = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 1
      }).format(val);
      return `${formattedNum} هەزار`;
    }
    
    const formatted = new Intl.NumberFormat('en-US').format(price);
    if (language === 'ar') {
      return `${formatted} د.ع`;
    }
    return `${formatted} IQD`;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, formatPrice, getLocalized }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
