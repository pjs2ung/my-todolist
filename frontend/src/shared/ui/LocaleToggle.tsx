import './LocaleToggle.css'
import { LOCALES } from '../lib/i18n'
import type { Locale } from '../lib/i18n'
import { useLocaleStore, useT } from '../lib/localeStore'

export function LocaleToggle() {
  const locale = useLocaleStore((s) => s.locale)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const t = useT()

  return (
    <select
      className="locale-toggle"
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label={t.language_label}
    >
      {LOCALES.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}
