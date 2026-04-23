import { UserRole } from '@prisma/client';

export interface Order {
  id: string;
  docNumber: string;
  date: Date;
  customerId?: string | null;
  customer?: {
    id: string;
    fullName: string;
    phone?: string | null;
  } | null;
  warehouseId: string;
  warehouse?: {
    id: string;
    name: string;
    address?: string | null;
  } | null;
  totalAmount: number;
  discount: number;
  finalAmount: number;
  status: 'DRAFT' | 'COMPLETED' | 'CANCELLED' | 'RETURNED';
  paymentMethod?: 'CASH' | 'CARD' | 'TRANSFER' | null;
  notes?: string | null;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  productId: string;
  product?: {
    id: string;
    name: string;
    sku?: string | null;
  } | null;
  quantity: number;
  price: number;
  total: number;
}

export interface Product {
  id: string;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  barcodeType: string;
  imageUrl?: string | null;
  sellPrice: number;
  wholesalePrice: number;
  minPrice: number;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  folderId?: string | null;
  folder?: {
    id: string;
    name: string;
  } | null;
  unitId?: string | null;
  unit?: {
    id: string;
    name: string;
    shortName: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Customer {
  id: string;
  fullName: string;
  companyName?: string | null;
  phone?: string | null;
  region?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  balanceUSD: number;
  balanceUZS: number;
  creditLimit: number;
  creditUsed: number;
  groupId?: string | null;
  group?: {
    id: string;
    name: string;
    defaultDiscount: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string | null;
  phone?: string | null;
  category?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  balanceUSD: number;
  balanceUZS: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  address?: string | null;
  district?: string | null;
  isDefault: boolean;
  companyId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockEntry {
  id: string;
  quantity: number;
  reserved: number;
  costPrice: number;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  warehouseId?: string | null;
  warehouse?: Warehouse;
  isActive: boolean;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date | string;
}

export interface CompanySettings {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  inn: string;
  logo?: string;
}

export interface Cashbox {
  id: string;
  name: string;
  type: 'CASH' | 'CARD' | 'BANK';
  currency: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashTransaction {
  id: string;
  cashboxId: string;
  cashbox?: Cashbox;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  date: Date;
  referenceId?: string | null;
  description?: string | null;
  createdAt: Date;
}

export interface Purchase {
  id: string;
  docNumber: string;
  date: Date;
  supplierId: string;
  supplier?: Supplier;
  warehouseId: string;
  warehouse?: Warehouse;
  totalAmount: number;
  status: 'DRAFT' | 'COMPLETED' | 'CANCELLED';
  notes?: string | null;
  items?: PurchaseItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseItem {
  id: string;
  purchaseId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Transfer {
  id: string;
  docNumber: string;
  date: Date;
  responsiblePerson?: string | null;
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  fromWarehouseId: string;
  fromWarehouse?: Warehouse;
  toWarehouseId: string;
  toWarehouse?: Warehouse;
  items?: TransferItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TransferItem {
  id: string;
  transferId: string;
  productId: string;
  product?: Product;
  quantity: number;
}

export interface ProductBatch {
  id: string;
  batchNumber: string;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  quantity: number;
  initialQty: number;
  costPrice: number;
  manufactureDate?: Date | null;
  expiryDate?: Date | null;
  supplierId?: string | null;
  supplier?: Supplier;
  purchaseId?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Delivery {
  id: string;
  docNumber: string;
  date: Date;
  orderId?: string | null;
  order?: Order;
  customerId?: string | null;
  customer?: Customer;
  warehouseId: string;
  warehouse?: Warehouse;
  driverName?: string | null;
  driverPhone?: string | null;
  vehicleNumber?: string | null;
  status: 'PREPARING' | 'LOADED' | 'IN_TRANSIT' | 'DELIVERED' | 'PARTIALLY_DELIVERED' | 'RETURNED' | 'CANCELLED';
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  notes?: string | null;
  totalWeight?: number | null;
  deliveredAt?: Date | null;
  items?: DeliveryItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryItem {
  id: string;
  deliveryId: string;
  productId: string;
  product?: Product;
  quantity: number;
  deliveredQty: number;
  notes?: string | null;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  budget?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  categoryId: string;
  category?: ExpenseCategory;
  amount: number;
  currency: string;
  description?: string | null;
  date: Date;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';
  receiptUrl?: string | null;
  requestedBy?: string | null;
  approvedBy?: string | null;
  approvedAt?: Date | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalesAgent {
  id: string;
  userId?: string | null;
  user?: AppUser;
  name: string;
  phone?: string | null;
  commissionRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Commission {
  id: string;
  agentId: string;
  agent?: SalesAgent;
  orderId?: string | null;
  order?: Order;
  amount: number;
  rate: number;
  saleAmount: number;
  isPaid: boolean;
  paidDate?: Date | null;
  period?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyAccount {
  id: string;
  customerId: string;
  customer?: Customer;
  points: number;
  totalEarned: number;
  totalRedeemed: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoyaltyTransaction {
  id: string;
  accountId: string;
  account?: LoyaltyAccount;
  type: string;
  points: number;
  orderId?: string | null;
  description?: string | null;
  expiresAt?: Date | null;
  createdAt: Date;
}

export interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  type: string;
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  startDate: Date;
  endDate?: Date | null;
  value?: number | null;
  currency: string;
  description?: string | null;
  terms?: string | null;
  customerId?: string | null;
  customer?: Customer;
  supplierId?: string | null;
  supplier?: Supplier;
  attachments?: ContractAttachment[];
  payments?: ContractPayment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractAttachment {
  id: string;
  contractId: string;
  fileName: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
  description?: string | null;
  createdAt: Date;
}

export interface ContractPayment {
  id: string;
  contractId: string;
  amount: number;
  currency: string;
  dueDate: Date;
  paidDate?: Date | null;
  isPaid: boolean;
  notes?: string | null;
  createdAt: Date;
}

export interface DemandForecast {
  id: string;
  productId: string;
  product?: Product;
  warehouseId?: string | null;
  warehouse?: Warehouse;
  period: string;
  predictedQty: number;
  confidence: number;
  algorithm: string;
  inputData?: string | null;
  month: number;
  year: number;
  createdAt: Date;
}

export interface PrintTemplate {
  id: string;
  name: string;
  type: 'INVOICE' | 'RECEIPT' | 'WAYBILL' | 'ACT' | 'CUSTOM';
  content: string;
  isActive: boolean;
  isDefault: boolean;
  paperSize: string;
  orientation: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TelegramBotConfig {
  id: string;
  botToken: string;
  botName?: string | null;
  isActive: boolean;
  welcomeMessage?: string | null;
  notifyNewOrder: boolean;
  notifyLowStock: boolean;
  notifyPayment: boolean;
  notifyDailyReport: boolean;
  dailyReportTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TelegramChat {
  id: string;
  chatId: string;
  chatType: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
  botConfigId: string;
  userId?: string | null;
  user?: AppUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExchangeRate {
  id: string;
  currency: string;
  rate: number;
  date: Date;
  updatedAt: Date;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName?: string | null;
  userRole?: string | null;
  type: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT';
  entity: string;
  entityId?: string | null;
  action: string;
  details?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  permissions: string[];
  expiresAt?: Date | null;
  lastUsedAt?: Date | null;
  isActive: boolean;
  createdBy?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Webhook {
  id: string;
  name: string;
  url: string;
  secret?: string | null;
  events: string[];
  isActive: boolean;
  lastTriggeredAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  amount: number;
  currency: string;
  dueDate: Date;
  isPaid: boolean;
  paidDate?: Date | null;
  note?: string | null;
  userId: string;
  user?: AppUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserNotification {
  id: string;
  userId: string;
  user?: AppUser;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  id: string;
  userId: string;
  user?: AppUser;
  emailNotifications: boolean;
  pushNotifications: boolean;
  lowStockAlerts: boolean;
  orderNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryAudit {
  id: string;
  docNumber: string;
  date: Date;
  responsiblePerson?: string | null;
  status: 'IN_PROGRESS' | 'COMPLETED';
  warehouseId: string;
  warehouse?: Warehouse;
  items?: InventoryAuditItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryAuditItem {
  id: string;
  expectedQty: number;
  actualQty: number;
  difference: number;
  reason?: string | null;
  auditId: string;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
}

export interface PriceList {
  id: string;
  name: string;
  type: 'SALE' | 'PURCHASE';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  items?: PriceListItem[];
}

export interface PriceListItem {
  id: string;
  price: number;
  priceListId: string;
  priceList?: PriceList;
  productId: string;
  product?: Product;
}

export interface ProductVariant {
  id: string;
  productId: string;
  product?: Product;
  name: string;
  sku?: string | null;
  price: number;
  costPrice: number;
  quantity: number;
  imageUrl?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerGroup {
  id: string;
  name: string;
  description?: string | null;
  defaultDiscount: number;
  customers?: Customer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Folder {
  id: string;
  name: string;
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Unit {
  id: string;
  name: string;
  shortName: string;
  products?: Product[];
  createdAt: Date;
  updatedAt: Date;
}

export interface StockThreshold {
  id: string;
  productId: string;
  product?: Product;
  warehouseId: string;
  warehouse?: Warehouse;
  minStock: number;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerTransaction {
  id: string;
  type: 'DEBT' | 'PAYMENT';
  amount: number;
  currency: string;
  date: Date;
  dueDate?: Date | null;
  description?: string | null;
  customerId: string;
  customer?: Customer;
  createdAt: Date;
}

export interface SupplierTransaction {
  id: string;
  type: 'DEBT' | 'PAYMENT';
  amount: number;
  currency: string;
  date: Date;
  dueDate?: Date | null;
  description?: string | null;
  supplierId: string;
  supplier?: Supplier;
  createdAt: Date;
}

export interface UserRequest {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  password: string;
  warehouseId?: string | null;
  warehouse?: Warehouse;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OneCConfig {
  id: string;
  apiUrl: string;
  apiKey: string;
  isActive: boolean;
  syncInterval?: number | null;
  lastSyncAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OneCSyncLog {
  id: string;
  entityType: string;
  entityId?: string | null;
  action: string;
  status: 'PENDING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  payload?: string | null;
  response?: string | null;
  error?: string | null;
  syncedAt?: Date | null;
  createdAt: Date;
}

export interface LoyaltyProgram {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  pointsPerDollar: number;
  bronzeThreshold: number;
  bronzeDiscount: number;
  silverThreshold: number;
  silverDiscount: number;
  goldThreshold: number;
  goldDiscount: number;
  platinumThreshold: number;
  platinumDiscount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryRoute {
  id: string;
  deliveryId: string;
  delivery?: Delivery;
  totalDistance: number;
  estimatedTime?: number | null;
  optimizedOrder?: string | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  polyline?: string | null;
  stops?: DeliveryRouteStop[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryRouteStop {
  id: string;
  routeId: string;
  route?: DeliveryRoute;
  stopOrder: number;
  customerId?: string | null;
  customer?: Customer;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  plannedAt?: Date | null;
  arrivedAt?: Date | null;
  status: 'PREPARING' | 'LOADED' | 'IN_TRANSIT' | 'DELIVERED' | 'PARTIALLY_DELIVERED' | 'RETURNED' | 'CANCELLED';
  notes?: string | null;
}
