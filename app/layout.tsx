import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Ombor System',
  description: 'Online Warehouse Management System',
};

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <body className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800">
        <Providers>
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <Header />
            <main className="flex-1 overflow-y-auto bg-[#f8fafc]">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

