// Intl formatters for dates, numbers, and currency
import { Language } from './translations';

const dateLocales: Record<Language, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

export function formatDate(
  date: Date | string,
  lang: Language = 'uz',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const opts: Intl.DateTimeFormatOptions = options || {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat(dateLocales[lang], opts).format(d);
}

export function formatDateTime(
  date: Date | string,
  lang: Language = 'uz'
): string {
  return formatDate(date, lang, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatNumber(
  num: number,
  lang: Language = 'uz',
  decimals: number = 0
): string {
  return new Intl.NumberFormat(dateLocales[lang], {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatCurrency(
  amount: number,
  currency: 'USD' | 'UZS',
  lang: Language = 'uz'
): string {
  if (currency === 'UZS') {
    return new Intl.NumberFormat(dateLocales[lang], {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' so\'m';
  }
  return new Intl.NumberFormat(dateLocales[lang], {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatRelativeTime(
  date: Date | string,
  lang: Language = 'uz'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const labels: Record<Language, Record<string, string>> = {
    uz: { justNow: 'Hozirgina', min: 'daqiqa oldin', hour: 'soat oldin', day: 'kun oldin', yesterday: 'Kecha' },
    ru: { justNow: 'Только что', min: 'мин. назад', hour: 'ч. назад', day: 'дн. назад', yesterday: 'Вчера' },
    en: { justNow: 'Just now', min: 'min ago', hour: 'hours ago', day: 'days ago', yesterday: 'Yesterday' },
  };

  const l = labels[lang];

  if (diffMins < 1) return l.justNow;
  if (diffMins < 60) return `${diffMins} ${l.min}`;
  if (diffHours < 24) return `${diffHours} ${l.hour}`;
  if (diffDays === 1) return l.yesterday;
  if (diffDays < 7) return `${diffDays} ${l.day}`;

  return formatDate(d, lang);
}
