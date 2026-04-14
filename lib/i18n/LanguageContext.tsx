// Language Context for app-wide language switching
'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Language } from '@/lib/i18n/translations';
import { translations } from '@/lib/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (section: keyof typeof translations.uz, key: string) => string;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function getInitialLanguage(): Language {
  // Check localStorage first
  if (typeof window !== 'undefined') {
    const savedLang = localStorage.getItem('ibox_language') as Language;
    if (savedLang && ['uz', 'ru', 'en'].includes(savedLang)) {
      return savedLang;
    }
  }
  return 'uz'; // Default language
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('uz');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initialLang = getInitialLanguage();
    setLanguageState(initialLang);
    document.documentElement.lang = initialLang;
    setIsLoaded(true);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('ibox_language', lang);
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((section: keyof typeof translations.uz, key: string): string => {
    if (!isLoaded) return key;
    const langData = translations[language] || translations.en;
    const sectionObj = langData?.[section] || translations.en?.[section];
    const value = (sectionObj as any)?.[key];
    if (value) return value;
    const enValue = (translations.en?.[section] as any)?.[key];
    if (enValue) return enValue;
    return key;
  }, [language, isLoaded]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
