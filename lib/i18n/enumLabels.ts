// Localized labels for Prisma enums
import { Language } from './translations';

type LocalizedRecord = Record<string, Record<Language, string>>;

export const orderStatusLabels: LocalizedRecord = {
  DRAFT: { uz: 'Qoralama', ru: 'Черновик', en: 'Draft' },
  COMPLETED: { uz: 'Tugallangan', ru: 'Завершено', en: 'Completed' },
  CANCELLED: { uz: 'Bekor qilingan', ru: 'Отменено', en: 'Cancelled' },
  RETURNED: { uz: 'Qaytarilgan', ru: 'Возвращено', en: 'Returned' },
};

export const purchaseStatusLabels: LocalizedRecord = {
  DRAFT: { uz: 'Qoralama', ru: 'Черновик', en: 'Draft' },
  COMPLETED: { uz: 'Tugallangan', ru: 'Завершено', en: 'Completed' },
  CANCELLED: { uz: 'Bekor qilingan', ru: 'Отменено', en: 'Cancelled' },
};

export const transferStatusLabels: LocalizedRecord = {
  PENDING: { uz: 'Kutilmoqda', ru: 'В ожидании', en: 'Pending' },
  IN_TRANSIT: { uz: 'Yo\'lda', ru: 'В пути', en: 'In Transit' },
  COMPLETED: { uz: 'Tugallangan', ru: 'Завершено', en: 'Completed' },
  CANCELLED: { uz: 'Bekor qilingan', ru: 'Отменено', en: 'Cancelled' },
};

export const auditStatusLabels: LocalizedRecord = {
  IN_PROGRESS: { uz: 'Jarayonda', ru: 'В процессе', en: 'In Progress' },
  COMPLETED: { uz: 'Tugallangan', ru: 'Завершено', en: 'Completed' },
};

export const customerStatusLabels: LocalizedRecord = {
  ACTIVE: { uz: 'Faol', ru: 'Активный', en: 'Active' },
  INACTIVE: { uz: 'Faol emas', ru: 'Неактивный', en: 'Inactive' },
};

export const supplierStatusLabels: LocalizedRecord = {
  ACTIVE: { uz: 'Faol', ru: 'Активный', en: 'Active' },
  INACTIVE: { uz: 'Faol emas', ru: 'Неактивный', en: 'Inactive' },
};

export const userRoleLabels: LocalizedRecord = {
  ADMIN: { uz: 'Admin', ru: 'Админ', en: 'Admin' },
  MANAGER: { uz: 'Menejer', ru: 'Менеджер', en: 'Manager' },
  STAFF: { uz: 'Xodim', ru: 'Сотрудник', en: 'Staff' },
};

export const paymentMethodLabels: LocalizedRecord = {
  CASH: { uz: 'Naqd', ru: 'Наличные', en: 'Cash' },
  CARD: { uz: 'Karta', ru: 'Карта', en: 'Card' },
  TRANSFER: { uz: 'O\'tkazma', ru: 'Перевод', en: 'Transfer' },
};

export const cashboxTypeLabels: LocalizedRecord = {
  CASH: { uz: 'Naqd', ru: 'Наличные', en: 'Cash' },
  CARD: { uz: 'Karta', ru: 'Карта', en: 'Card' },
  BANK: { uz: 'Bank', ru: 'Банк', en: 'Bank' },
};

export const transactionTypeLabels: LocalizedRecord = {
  DEBT: { uz: 'Qarz', ru: 'Долг', en: 'Debt' },
  PAYMENT: { uz: 'To\'lov', ru: 'Оплата', en: 'Payment' },
};

export const templateTypeLabels: LocalizedRecord = {
  INVOICE: { uz: 'Hisob-faktura', ru: 'Счет-фактура', en: 'Invoice' },
  RECEIPT: { uz: 'Chek', ru: 'Чек', en: 'Receipt' },
  WAYBILL: { uz: 'Yo\'l xati', ru: 'Накладная', en: 'Waybill' },
  ACT: { uz: 'Dalolatnoma', ru: 'Акт', en: 'Act' },
  CUSTOM: { uz: 'Maxsus', ru: 'Пользовательский', en: 'Custom' },
};

export const deliveryStatusLabels: LocalizedRecord = {
  PREPARING: { uz: 'Tayyorlanmoqda', ru: 'Подготовка', en: 'Preparing' },
  LOADED: { uz: 'Yuklangan', ru: 'Загружено', en: 'Loaded' },
  IN_TRANSIT: { uz: 'Yo\'lda', ru: 'В пути', en: 'In Transit' },
  DELIVERED: { uz: 'Yetkazildi', ru: 'Доставлено', en: 'Delivered' },
  PARTIALLY_DELIVERED: { uz: 'Qisman yetkazildi', ru: 'Частично доставлено', en: 'Partially Delivered' },
  RETURNED: { uz: 'Qaytarildi', ru: 'Возвращено', en: 'Returned' },
  CANCELLED: { uz: 'Bekor qilingan', ru: 'Отменено', en: 'Cancelled' },
};

export const loyaltyTierLabels: LocalizedRecord = {
  BRONZE: { uz: 'Bronza', ru: 'Бронза', en: 'Bronze' },
  SILVER: { uz: 'Kumush', ru: 'Серебро', en: 'Silver' },
  GOLD: { uz: 'Oltin', ru: 'Золото', en: 'Gold' },
  PLATINUM: { uz: 'Platina', ru: 'Платина', en: 'Platinum' },
};

export const contractStatusLabels: LocalizedRecord = {
  DRAFT: { uz: 'Qoralama', ru: 'Черновик', en: 'Draft' },
  ACTIVE: { uz: 'Faol', ru: 'Активный', en: 'Active' },
  EXPIRED: { uz: 'Muddati o\'tgan', ru: 'Истекший', en: 'Expired' },
  TERMINATED: { uz: 'Bekor qilingan', ru: 'Расторгнут', en: 'Terminated' },
};

export const expenseStatusLabels: LocalizedRecord = {
  PENDING: { uz: 'Kutilmoqda', ru: 'В ожидании', en: 'Pending' },
  APPROVED: { uz: 'Tasdiqlangan', ru: 'Одобрено', en: 'Approved' },
  REJECTED: { uz: 'Rad etilgan', ru: 'Отклонено', en: 'Rejected' },
  PAID: { uz: 'To\'langan', ru: 'Оплачено', en: 'Paid' },
};

export function getEnumLabel(
  labels: LocalizedRecord,
  value: string,
  lang: Language
): string {
  return labels[value]?.[lang] || labels[value]?.['en'] || value;
}
