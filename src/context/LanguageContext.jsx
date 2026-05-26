import React, { createContext, useContext, useState } from 'react'

const LanguageContext = createContext()

export const LANGUAGES = [
  { code: 'en',    label: 'English',    flag: '🇬🇧' },
  { code: 'ta',    label: 'தமிழ்',      flag: '🇮🇳' },
  { code: 'hi',    label: 'हिंदी',       flag: '🇮🇳' },
  { code: 'te',    label: 'తెలుగు',     flag: '🇮🇳' },
  { code: 'kn',    label: 'ಕನ್ನಡ',      flag: '🇮🇳' },
  { code: 'ml',    label: 'മലയാളം',    flag: '🇮🇳' },
  { code: 'bn',    label: 'বাংলা',      flag: '🇧🇩' },
  { code: 'ur',    label: 'اردو',       flag: '🇵🇰' },
  { code: 'ar',    label: 'العربية',    flag: '🇸🇦' },
  { code: 'fr',    label: 'Français',   flag: '🇫🇷' },
  { code: 'es',    label: 'Español',    flag: '🇪🇸' },
  { code: 'de',    label: 'Deutsch',    flag: '🇩🇪' },
  { code: 'pt',    label: 'Português',  flag: '🇧🇷' },
  { code: 'ru',    label: 'Русский',    flag: '🇷🇺' },
  { code: 'zh',    label: '中文',        flag: '🇨🇳' },
  { code: 'ja',    label: '日本語',      flag: '🇯🇵' },
  { code: 'ko',    label: '한국어',      flag: '🇰🇷' },
  { code: 'tr',    label: 'Türkçe',     flag: '🇹🇷' },
  { code: 'id',    label: 'Indonesia',  flag: '🇮🇩' },
  { code: 'ms',    label: 'Melayu',     flag: '🇲🇾' },
]

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('doccareai-lang') || 'en'
    } catch {
      return 'en'
    }
  })

  function changeLanguage(code) {
    setLanguage(code)
    try {
      localStorage.setItem('doccareai-lang', code)
    } catch {
      // ignore
    }
  }

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
