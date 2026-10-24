import { de, type Dictionary } from './de';
import { en } from './en';

export const locales = ['de', 'en'] as const;
export type Locale = (typeof locales)[number];

export const dictionaries: Record<Locale, Dictionary> = { de, en };

export const isLocale = (value: string | undefined): value is Locale =>
  value === 'de' || value === 'en';

export type LegalPageName = 'privacy' | 'imprint' | 'terms';

export const isLegalPage = (value: string | null | undefined): value is LegalPageName =>
  value === 'privacy' || value === 'imprint' || value === 'terms';

export const useTranslations = (locale: Locale) => dictionaries[locale];

export const otherLocale = (locale: Locale): Locale => (locale === 'de' ? 'en' : 'de');
