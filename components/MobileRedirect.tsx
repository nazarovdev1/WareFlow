'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function MobileRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      const isOnMobilePath = pathname.startsWith('/mobile');
      const isApiOrAsset = pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname === '/favicon.ico';

      if (isMobile && !isOnMobilePath && !isApiOrAsset && pathname !== '/login') {
        router.push('/mobile');
      }
    };

    // Initial check
    handleResize();

    // Listen for resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pathname, router]);

  return null;
}
