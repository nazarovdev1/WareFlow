'use client';

import { Provider } from 'react-redux';
import { store } from '../lib/store';
import AuthProvider from '@/components/providers/AuthProvider';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import { ThemeProvider } from '@/lib/ThemeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>
        <LanguageProvider>
          <Provider store={store}>{children}</Provider>
        </LanguageProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
