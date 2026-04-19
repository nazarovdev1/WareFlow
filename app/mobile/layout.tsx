import BottomNav from '@/components/mobile/BottomNav';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IBOX Mobile',
  description: 'Mobile interface for IBOX Warehouse Management',
  themeColor: '#4f46e5',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
};

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col antialiased">
      <div className="flex-1 w-full max-w-md mx-auto relative bg-slate-50 dark:bg-slate-950 pb-24 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 overflow-x-hidden min-h-screen">
        {/* Mobile Viewport Wrapper */}
        {children}
        
        {/* Bottom Navigation */}
        <BottomNav />
      </div>
    </div>
  );
}
