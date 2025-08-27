import { Badge } from "@/components/ui/badge"
import { SUPPORTED_LANGUAGES, type SupportedLanguageCode } from "@/hooks/use-translations"

interface TranslationBadgeProps {
  translations: Record<string, { name: string; description: string }> | null
  className?: string
}

export function TranslationBadge({ translations, className = "" }: TranslationBadgeProps) {
  if (!translations || Object.keys(translations).length === 0) {
    return null
  }

  const availableLanguages = Object.keys(translations) as SupportedLanguageCode[]

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {availableLanguages.map((langCode) => {
        const language = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode)
        if (!language) return null

        return (
          <Badge 
            key={langCode} 
            variant="outline" 
            className="text-xs px-2 py-1"
            title={`Available in ${language.name}`}
          >
            <span className="mr-1">{language.flag}</span>
            {langCode.toUpperCase()}
          </Badge>
        )
      })}
    </div>
  )
}







