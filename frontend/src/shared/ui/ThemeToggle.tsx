import './ThemeToggle.css'
import { useTheme } from '../lib/useTheme'
import { useT } from '../lib/localeStore'

export function ThemeToggle() {
  const t = useT()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button type="button" className="theme-toggle" onClick={toggleTheme} aria-pressed={isDark}>
      {isDark ? t.theme_dark : t.theme_light}
    </button>
  )
}
