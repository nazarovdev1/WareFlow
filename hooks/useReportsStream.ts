'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface ReportsStreamData {
  sales_update?: any[];
  purchase_update?: any[];
  inventory_update?: any[];
  cash_update?: any[];
  debt_update?: any[];
}

export function useReportsStream() {
  const [data, setData] = useState<ReportsStreamData>({});
  const [isConnected, setIsConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource('/api/reports/stream');
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      setIsConnected(false);
      setTimeout(connect, 5000);
    };

    eventSource.addEventListener('sales_update', (e) => {
      try {
        const newData = JSON.parse(e.data);
        setData((prev) => ({ ...prev, sales_update: newData }));
      } catch {}
    });

    eventSource.addEventListener('purchase_update', (e) => {
      try {
        const newData = JSON.parse(e.data);
        setData((prev) => ({ ...prev, purchase_update: newData }));
      } catch {}
    });

    eventSource.addEventListener('inventory_update', (e) => {
      try {
        const newData = JSON.parse(e.data);
        setData((prev) => ({ ...prev, inventory_update: newData }));
      } catch {}
    });

    eventSource.addEventListener('cash_update', (e) => {
      try {
        const newData = JSON.parse(e.data);
        setData((prev) => ({ ...prev, cash_update: newData }));
      } catch {}
    });

    eventSource.addEventListener('debt_update', (e) => {
      try {
        const newData = JSON.parse(e.data);
        setData((prev) => ({ ...prev, debt_update: newData }));
      } catch {}
    });

    eventSource.addEventListener('heartbeat', () => {});
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      setIsConnected(false);
    };
  }, [connect]);

  return { data, isConnected, reconnect: connect };
}