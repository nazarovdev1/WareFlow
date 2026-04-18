import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { NotificationProvider } from '@/lib/NotificationContext';
import ToastContainer from '@/components/ToastContainer';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-[#f8fafc] dark:bg-slate-900">
            {children}
          </main>
        </div>
        <ToastContainer />
      </div>
    </NotificationProvider>
  );
}