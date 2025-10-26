import { useCallback, useEffect, useState } from 'react'

// Translation type
interface Translations {
  [key: string]: string
}

// Current language state
let currentLanguage = 'english'
let translations: Translations = {}
const updateCallbacks: Set<() => void> = new Set()

// Load translation file dynamically
const loadTranslations = async (language: string): Promise<Translations> => {
  try {
    switch (language) {
      case 'english': {
        const englishModule = await import('./translations/english')
        return englishModule.default
      }
      default: {
        // Fallback to english for unknown languages
        const fallbackModule = await import('./translations/english')
        return fallbackModule.default
      }
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Failed to load translations for language: ${language}`, error)
    return {}
  }
}

// Initialize translations
const initializeTranslations = async () => {
  translations = await loadTranslations(currentLanguage)
}

// Initialize on load
initializeTranslations()

// Translation hook
export const useTranslation = () => {
  const [updateCounter, setUpdateCounter] = useState(0)

  // Register this component for updates
  useEffect(() => {
    const updateCallback = () => setUpdateCounter(prev => prev + 1)
    updateCallbacks.add(updateCallback)

    return () => {
      updateCallbacks.delete(updateCallback)
    }
  }, [])

  const t = useCallback(
    (key: string, fallback?: string): string => {
      // Access updateCounter to ensure re-render when translations change
      return translations[key] || fallback || key
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateCounter]
  ) // Include updateCounter to ensure re-render when translations change

  const changeLanguage = useCallback(async (language: string) => {
    currentLanguage = language
    translations = await loadTranslations(language)
    // Notify all registered components to update
    updateCallbacks.forEach(callback => callback())
  }, [])

  return { t, changeLanguage, currentLanguage }
}

// Direct translation function for non-component usage
export const t = (key: string, fallback?: string): string => {
  return translations[key] || fallback || key
}
