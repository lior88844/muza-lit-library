import 'i18next'

import english from './translations/english'
export type TransKey = keyof typeof english
// Extend i18next types to include our translations for type safety
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof english
    }
    // Allow string keys for dynamic translations (with fallback)
    returnNull: false
  }
}
