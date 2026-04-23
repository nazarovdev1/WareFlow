export const WAREHOUSE_PERMISSIONS = [
  'view_warehouse',
  'edit_warehouse',
  'delete_warehouse',
] as const;

export const PRODUCT_PERMISSIONS = [
  'view_products',
  'create_products',
  'edit_products',
  'delete_products',
] as const;

export const CUSTOMER_PERMISSIONS = [
  'view_customers',
  'create_customers',
  'edit_customers',
  'delete_customers',
] as const;

export const SUPPLIER_PERMISSIONS = [
  'view_suppliers',
  'create_suppliers',
  'edit_suppliers',
  'delete_suppliers',
] as const;

export const SALES_PERMISSIONS = [
  'view_sales',
  'create_sales',
  'edit_sales',
  'delete_sales',
  'refund_sales',
] as const;

export const PURCHASE_PERMISSIONS = [
  'view_purchases',
  'create_purchases',
  'edit_purchases',
  'delete_purchases',
  'receive_purchases',
] as const;

export const REPORT_PERMISSIONS = [
  'view_reports',
  'export_reports',
] as const;

export const ALL_PERMISSIONS = [
  ...WAREHOUSE_PERMISSIONS,
  ...PRODUCT_PERMISSIONS,
  ...CUSTOMER_PERMISSIONS,
  ...SUPPLIER_PERMISSIONS,
  ...SALES_PERMISSIONS,
  ...PURCHASE_PERMISSIONS,
  ...REPORT_PERMISSIONS,
] as const;

export type Permission = typeof ALL_PERMISSIONS[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  view_warehouse: 'Omborni ko\'rish',
  edit_warehouse: 'Omborni o\'zgartirish',
  delete_warehouse: 'Omborni o\'chirish',
  view_products: 'Mahsulotlarni ko\'rish',
  create_products: 'Mahsulot yaratish',
  edit_products: 'Mahsulot tahrirlash',
  delete_products: 'Mahsulot o\'chirish',
  view_customers: 'Mijozlarni ko\'rish',
  create_customers: 'Mijoz yaratish',
  edit_customers: 'Mijoz tahrirlash',
  delete_customers: 'Mijoz o\'chirish',
  view_suppliers: 'Yetkazib beruvchilarni ko\'rish',
  create_suppliers: 'Yetkazib beruvchi yaratish',
  edit_suppliers: 'Yetkazib beruvchi tahrirlash',
  delete_suppliers: 'Yetkazib beruvchi o\'chirish',
  view_sales: 'Savdoni ko\'rish',
  create_sales: 'Savdo yaratish',
  edit_sales: 'Savdo tahrirlash',
  delete_sales: 'Savdo o\'chirish',
  refund_sales: 'Savdo qaytarish',
  view_purchases: 'Xaridlarni ko\'rish',
  create_purchases: 'Xarid yaratish',
  edit_purchases: 'Xarid tahrirlash',
  delete_purchases: 'Xarid o\'chirish',
  receive_purchases: 'Xarid qabul qilish',
  view_reports: 'Hisobotlarni ko\'rish',
  export_reports: 'Hisobotlarni eksport qilish',
} as const;
