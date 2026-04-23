interface OfflineOrder {
  id: string;
  docNumber: string;
  customerId?: string;
  warehouseId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
    batchId?: string;
  }>;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: 'DRAFT' | 'COMPLETED';
  createdAt: string;
  synced: boolean;
}

interface OfflineStore {
  orders: OfflineOrder[];
  products: any[];
  customers: any[];
  warehouses: any[];
  lastSync?: string;
}

const STORAGE_KEY = 'wareflow_offline_data';

class OfflineManager {
  private store: OfflineStore = {
    orders: [],
    products: [],
    customers: [],
    warehouses: [],
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.load();
    }
  }

  private load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.store = JSON.parse(data);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  // Orders
  getOrders(): OfflineOrder[] {
    return this.store.orders;
  }

  addOrder(order: OfflineOrder) {
    this.store.orders.push(order);
    this.save();
  }

  updateOrder(id: string, updates: Partial<OfflineOrder>) {
    const index = this.store.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.store.orders[index] = { ...this.store.orders[index], ...updates };
      this.save();
    }
  }

  removeOrder(id: string) {
    this.store.orders = this.store.orders.filter(o => o.id !== id);
    this.save();
  }

  markOrderSynced(id: string) {
    this.updateOrder(id, { synced: true });
  }

  getUnsyncedOrders(): OfflineOrder[] {
    return this.store.orders.filter(o => !o.synced);
  }

  // Products
  getProducts(): any[] {
    return this.store.products;
  }

  setProducts(products: any[]) {
    this.store.products = products;
    this.save();
  }

  // Customers
  getCustomers(): any[] {
    return this.store.customers;
  }

  setCustomers(customers: any[]) {
    this.store.customers = customers;
    this.save();
  }

  // Warehouses
  getWarehouses(): any[] {
    return this.store.warehouses;
  }

  setWarehouses(warehouses: any[]) {
    this.store.warehouses = warehouses;
    this.save();
  }

  // Sync
  getLastSync(): string | undefined {
    return this.store.lastSync;
  }

  setLastSync(date: string) {
    this.store.lastSync = date;
    this.save();
  }

  // Clear
  clear() {
    this.store = {
      orders: [],
      products: [],
      customers: [],
      warehouses: [],
    };
    this.save();
  }

  // Check if online
  isOnline(): boolean {
    if (typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  }
}

export const offlineManager = new OfflineManager();
