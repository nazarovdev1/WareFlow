import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import { NotificationProvider } from '@/lib/NotificationContext';
import ToastContainer from '@/components/ToastContainer';
import MobileRedirect from '@/components/MobileRedirect';

export const metadata: Metadata = {
  title: 'IBOX - Ombor Tizimi',
  description: 'Professional Warehouse Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-200">
        <Providers>
          <NotificationProvider>
            <MobileRedirect />
            {children}
            <ToastContainer />
          </NotificationProvider>
        </Providers>
      </body>
    </html>
  );
}