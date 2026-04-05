'use client';

import { useAppStore } from '@/lib/store/useAppStore';
import { en } from '@/locales/en';
import { ru } from '@/locales/ru';
import { kz } from '@/locales/kz';
import type { Translations } from '@/locales/en';

export type Locale = 'en' | 'ru' | 'kz';

const translations: Record<Locale, Translations> = { en, ru, kz };

export function useT() {
  const locale = useAppStore(s => s.locale);
  return { t: translations[locale], locale };
}
