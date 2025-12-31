'use client'

import { ConnectButton } from '@/lib/web3'
import { ThemeToggleSimple } from '@/components/ui/theme-toggle'
import { LanguageSwitcher } from '@/components/ui/language-switcher'
import { Button } from '@/components/ui/button'
import { Settings, Info } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useConfiguration } from '@/components/config/configuration-provider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from '@/lib/i18n'

interface NavbarProps {
  className?: string
}

const showSettings = process.env.NEXT_PUBLIC_DISABLE_SETTINGS !== 'true'

export function Navbar({ className }: NavbarProps) {
  const { config, isConfigured, showConfigDialog, missingVars } = useConfiguration()
  const pathname = usePathname()
  const { t } = useTranslation()

  const navLinks = [
    { href: '/dashboard', label: t('nav.dashboard') },
    { href: '/verify', label: t('nav.verify') },
    { href: '/airdrops', label: t('nav.airdrops') },
    { href: '/settings', label: t('nav.settings') },
  ]

  return (
    <nav className={cn('main-navbar border-b border-border bg-background', className)}>
      <div className="container mx-auto px-4 h-16 flex items-center">
        {/* Logo and App Name */}
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/logo.png" alt={t('common.appName')} width={28} height={28} />
            <span className="text-xl font-bold text-foreground">{t('common.appName')}</span>
          </Link>
        </div>

        {/* Navigation Links - Centered in available space */}
        <div className="hidden md:flex items-center justify-center gap-1 flex-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-violet'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Configuration Settings */}
          {showSettings && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 text-sm h-9 border border-border bg-secondary text-muted-foreground hover:text-foreground hover:bg-accent",
                    !isConfigured && !config.isDefaults && "border-destructive text-destructive"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">{t('navbar.settings')}</span>
                  {missingVars.length > 0 && !config.isDefaults && (
                    <Badge className="text-xs px-1 bg-destructive text-destructive-foreground">
                      {missingVars.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-80 bg-popover border-border">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2 text-foreground">{t('navbar.appConfiguration')}</h3>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>{t('navbar.status')}:</span>
                        <Badge className={isConfigured ? "bg-violet text-violet-foreground" : "bg-destructive text-destructive-foreground"}>
                          {isConfigured ? t('navbar.configured') : t('navbar.incomplete')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('navbar.mode')}:</span>
                        <Badge className="bg-secondary text-secondary-foreground">
                          {config.isDefaults ? t('navbar.defaults') : t('navbar.custom')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>{t('navbar.networks')}:</span>
                        <span className="text-foreground">{config.supportedChainNames?.length || 0} {t('common.chains')}</span>
                      </div>
                    </div>
                  </div>

                  {missingVars.length > 0 && !config.isDefaults && (
                    <div>
                      <h4 className="text-sm font-medium text-destructive mb-2">{t('navbar.missingConfiguration')}</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {missingVars.slice(0, 3).map(varName => (
                          <li key={varName} className="flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            <code className="text-foreground">{varName}</code>
                          </li>
                        ))}
                        {missingVars.length > 3 && (
                          <li className="text-muted-foreground">
                            {t('navbar.andMore', { count: missingVars.length - 3 })}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  <Button
                    onClick={showConfigDialog}
                    className="w-full bg-violet hover:bg-violet/90 text-violet-foreground"
                    size="sm"
                  >
                    <Settings className="h-3 w-3 mr-2" />
                    {t('navbar.openConfiguration')}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Wallet Connection */}
          <ConnectButton />

          {/* Theme Toggle */}
          <ThemeToggleSimple />
        </div>
      </div>
    </nav>
  )
}
