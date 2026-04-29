// Server-side i18n utilities for API routes and server components
import { Language } from './translations';
import { translations, getTranslation } from './translations';

/**
 * Get user's language from request headers or fallback to default
 */
export function getLanguageFromRequest(req?: { headers?: { get?: (name: string) => string | null } }): Language {
  if (!req?.headers?.get) return 'uz';
  
  const acceptLang = req.headers.get('accept-language') || '';
  const preferred = acceptLang.split(',')[0]?.trim().toLowerCase();
  
  if (preferred?.startsWith('ru')) return 'ru';
  if (preferred?.startsWith('en')) return 'en';
  if (preferred?.startsWith('uz')) return 'uz';
  
  return 'uz';
}

/**
 * Server-side translation function
 */
export function t(
  lang: Language,
  section: keyof typeof translations.uz,
  key: string,
  replacements?: Record<string, string | number>
): string {
  let text = getTranslation(lang, section, key);
  
  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      text = text.replace(new RegExp(`{{${placeholder}}}`, 'g'), String(value));
    });
  }
  
  return text;
}

/**
 * Common API error messages in all languages
 */
export const apiErrors = {
  unauthorized: { uz: 'Ruxsat yo\'q', ru: 'Доступ запрещен', en: 'Unauthorized' },
  forbidden: { uz: 'Huquq yetarli emas', ru: 'Недостаточно прав', en: 'Forbidden' },
  notFound: { uz: 'Topilmadi', ru: 'Не найдено', en: 'Not Found' },
  badRequest: { uz: 'Noto\'g\'ri so\'rov', ru: 'Неверный запрос', en: 'Bad Request' },
  internalError: { uz: 'Server xatosi', ru: 'Ошибка сервера', en: 'Internal Server Error' },
  validationError: { uz: 'Validatsiya xatosi', ru: 'Ошибка валидации', en: 'Validation Error' },
  alreadyExists: { uz: 'Allaqachon mavjud', ru: 'Уже существует', en: 'Already Exists' },
} as const;

export function getApiError(
  key: keyof typeof apiErrors,
  lang: Language = 'uz'
): string {
  return apiErrors[key]?.[lang] || apiErrors[key]?.['en'] || 'Error';
}
