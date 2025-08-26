import { useMemo } from 'react'

export interface Translation {
  name: string
  description: string
}

export interface Translations {
  [languageCode: string]: Translation
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ca', name: 'Català', flag: '🏴󠁥󠁳󠁣󠁴󠁿' },
  { code: 'eu', name: 'Euskara', flag: '🏴󠁥󠁳󠁰󠁶󠁿' },
  { code: 'gl', name: 'Galego', flag: '🏴󠁥󠁳󠁧󠁡󠁿' }
] as const

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGES[number]['code']

export function useTranslations(
  defaultName: string,
  defaultDescription: string,
  translations: Translations | null,
  currentLanguage: SupportedLanguageCode = 'en'
) {
  const translatedContent = useMemo(() => {
    if (!translations || !translations[currentLanguage]) {
      return {
        name: defaultName,
        description: defaultDescription
      }
    }

    const translation = translations[currentLanguage]
    return {
      name: translation.name || defaultName,
      description: translation.description || defaultDescription
    }
  }, [defaultName, defaultDescription, translations, currentLanguage])

  const getTranslation = (languageCode: SupportedLanguageCode): Translation => {
    if (!translations || !translations[languageCode]) {
      return {
        name: '',
        description: ''
      }
    }
    return translations[languageCode]
  }

  const hasTranslation = (languageCode: SupportedLanguageCode): boolean => {
    return !!(translations && translations[languageCode])
  }

  const getAvailableLanguages = (): SupportedLanguageCode[] => {
    if (!translations) return []
    return Object.keys(translations) as SupportedLanguageCode[]
  }

  return {
    ...translatedContent,
    getTranslation,
    hasTranslation,
    getAvailableLanguages,
    currentLanguage
  }
}

export function getLanguageName(code: SupportedLanguageCode): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code)
  return language?.name || code
}

export function getLanguageFlag(code: SupportedLanguageCode): string {
  const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code)
  return language?.flag || '🌐'
}






