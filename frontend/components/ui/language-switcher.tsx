'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTranslation, locales, localeFlags, type Locale } from '@/lib/i18n'
import { cn } from '@/lib/utils'

interface LanguageSwitcherProps {
  className?: string
}

const localeShortNames: Record<Locale, string> = {
  en: 'EN',
  ko: '한국',
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { locale, setLocale } = useTranslation()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-1.5 text-sm h-9 px-2.5 border border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent',
            className
          )}
        >
          <span className="text-base">{localeFlags[locale]}</span>
          <span className="font-medium">{localeShortNames[locale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border min-w-0">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className={cn(
              'cursor-pointer gap-2',
              locale === loc && 'bg-accent'
            )}
          >
            <span className="text-base">{localeFlags[loc]}</span>
            <span className="font-medium">{localeShortNames[loc]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
