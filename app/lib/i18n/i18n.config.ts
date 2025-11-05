import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import english from './translations/english'

// Define available languages
export const LANGUAGES = {
  en: 'English',
} as const

export type SupportedLanguage = keyof typeof LANGUAGES

// i18next configuration
i18n
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: english,
      },
    },
    lng: 'en', // Default language
    fallbackLng: 'en', // Fallback language
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  })

export default i18n
