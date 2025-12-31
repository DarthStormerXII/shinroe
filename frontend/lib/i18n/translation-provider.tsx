'use client'

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { type Locale, defaultLocale, locales } from './config'
import enMessages from './messages/en.json'
import koMessages from './messages/ko.json'

type Messages = typeof enMessages

const messages: Record<Locale, Messages> = {
  en: enMessages,
  ko: koMessages,
}

const LOCALE_STORAGE_KEY = 'shinroe-locale'

interface TranslationContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  messages: Messages
}

const TranslationContext = createContext<TranslationContextType | null>(null)

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split('.')
  let current: unknown = obj

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key]
    } else {
      return undefined
    }
  }

  return typeof current === 'string' ? current : undefined
}

function interpolate(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`
  })
}

interface TranslationProviderProps {
  children: ReactNode
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale)
  const [mounted, setMounted] = useState(false)

  // Load saved locale from localStorage on mount, or detect from browser
  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as Locale | null
    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale)
    } else {
      // Detect browser language - default to Korean for Korean users
      const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || ''
      const detectedLocale: Locale = browserLang.toLowerCase().startsWith('ko') ? 'ko' : 'en'
      setLocaleState(detectedLocale)
      localStorage.setItem(LOCALE_STORAGE_KEY, detectedLocale)
      document.documentElement.lang = detectedLocale
    }
    setMounted(true)
  }, [])

  // Update localStorage and document lang when locale changes
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale)
    localStorage.setItem(LOCALE_STORAGE_KEY, newLocale)
    document.documentElement.lang = newLocale
  }, [])

  // Translation function with parameter interpolation
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const currentMessages = messages[locale]
    const value = getNestedValue(currentMessages as unknown as Record<string, unknown>, key)

    if (!value) {
      console.warn(`Translation missing for key: ${key}`)
      return key
    }

    if (params) {
      return interpolate(value, params)
    }

    return value
  }, [locale])

  const currentMessages = messages[locale]

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <TranslationContext.Provider value={{ locale: defaultLocale, setLocale, t, messages: messages[defaultLocale] }}>
        {children}
      </TranslationContext.Provider>
    )
  }

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t, messages: currentMessages }}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider')
  }
  return context
}

// Shorthand hook for just the t function
export function useT() {
  const { t } = useTranslation()
  return t
}
