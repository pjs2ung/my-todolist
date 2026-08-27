import { create } from 'zustand'
import type { Locale } from './i18n'
import { getMessages } from './i18n'

const STORAGE_KEY = 'locale'

function readStoredLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored === 'en' || stored === 'ja' ? stored : 'ko'
}

type LocaleState = {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: readStoredLocale(),
  setLocale: (locale) => {
    localStorage.setItem(STORAGE_KEY, locale)
    set({ locale })
  },
}))

export function useT() {
  const locale = useLocaleStore((s) => s.locale)
  return getMessages(locale)
}
