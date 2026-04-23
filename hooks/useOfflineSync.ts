import { useState, useEffect } from 'react';
import { offlineManager } from '@/lib/offline/store';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(offlineManager.isOnline());
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  const syncPendingData = async () => {
    const unsyncedOrders = offlineManager.getUnsyncedOrders();
    setPendingSync(unsyncedOrders.length);

    if (unsyncedOrders.length === 0) return;

    setIsSyncing(true);

    for (const order of unsyncedOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerId: order.customerId,
            warehouseId: order.warehouseId,
            discount: order.discount,
            items: order.items,
          }),
        });

        if (response.ok) {
          offlineManager.markOrderSynced(order.id);
        }
      } catch (error) {
        console.error('Failed to sync order:', error);
      }
    }

    setIsSyncing(false);
    setPendingSync(offlineManager.getUnsyncedOrders().length);
  };

  const loadData = async () => {
    try {
      // Load products
      const productsRes = await fetch('/api/products');
      if (productsRes.ok) {
        const data = await productsRes.json();
        offlineManager.setProducts(Array.isArray(data) ? data : data.data || []);
      }

      // Load customers
      const customersRes = await fetch('/api/customers');
      if (customersRes.ok) {
        const data = await customersRes.json();
        offlineManager.setCustomers(Array.isArray(data) ? data : data.data || []);
      }

      // Load warehouses
      const warehousesRes = await fetch('/api/warehouses');
      if (warehousesRes.ok) {
        const data = await warehousesRes.json();
        offlineManager.setWarehouses(Array.isArray(data) ? data : data.data || []);
      }

      offlineManager.setLastSync(new Date().toISOString());
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  };

  return {
    isOnline,
    isSyncing,
    pendingSync,
    syncPendingData,
    loadData,
  };
}
