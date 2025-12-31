'use client'

import { ReactNode } from 'react'
import { useConfiguration } from './configuration-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  Loader2,
  Shield,
  Info,
  Link2Off
} from 'lucide-react'
import { hasChainConfigErrors, getChainConfigErrors, type ChainConfigError } from '@/lib/config/chains'

interface ConfigurationGuardProps {
  children: ReactNode
  requireConfig?: boolean // If true, blocks app until configured
}

export function ConfigurationGuard({ children, requireConfig = true }: ConfigurationGuardProps) {
  const { config, isConfigured, showConfigDialog, missingVars, recommendedVars, serverValidation, refreshServerValidation, isValidatingServer } = useConfiguration()

  // Check for chain configuration errors first - these are critical
  const chainConfigErrors = getChainConfigErrors()
  const hasChainErrors = hasChainConfigErrors()

  // If there are chain configuration errors, block the app
  if (hasChainErrors) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
        <div className="w-full max-w-md space-y-4">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Link2Off className="h-6 w-6 text-destructive" />
            </div>
            <h1 className="text-xl font-bold">Chain Configuration Error</h1>
          </div>

          <Card className="border-destructive/50">
            <CardContent className="p-4 space-y-3">
              {chainConfigErrors.map((error, index) => (
                <div key={index} className="text-sm">
                  <Badge variant="destructive" className="text-xs mb-1">
                    {error.type === 'app_mode' ? 'APP_MODE' : 'SUPPORTED_CHAINS'}
                  </Badge>
                  <p className="text-muted-foreground">{error.message}</p>
                </div>
              ))}

              <Button onClick={() => window.location.reload()} className="w-full" size="sm">
                Reload
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // If using defaults, always allow through
  if (config.isDefaults) {
    return <>{children}</>
  }

  // If configuration is complete, allow through
  if (isConfigured) {
    return <>{children}</>
  }

  // If requireConfig is false, show warning but allow through
  if (!requireConfig) {
    return (
      <div className="space-y-4">
        <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Application is running with incomplete configuration.
            <Button
              variant="link"
              className="p-0 h-auto text-yellow-700 dark:text-yellow-300"
              onClick={showConfigDialog}
            >
              Complete setup
            </Button>
          </AlertDescription>
        </Alert>
        {children}
      </div>
    )
  }

  // Block app and show configuration requirements
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Settings className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome to Your Web3 App</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Complete the setup to start using advanced Web3 features
            </p>
          </div>
        </div>

        {/* Configuration Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Configuration Required
            </CardTitle>
            <CardDescription>
              The following environment variables need to be configured before the application can start.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Missing Variables */}
            {missingVars.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  Required Configuration
                </h3>
                <div className="grid gap-2">
                  {missingVars.map((varName) => (
                    <div key={varName} className="flex items-center justify-between p-3 rounded-lg border bg-destructive/5">
                      <code className="text-sm font-mono">{varName}</code>
                      <Badge variant="destructive">Required</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Variables */}
            {recommendedVars.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-orange-500" />
                  Recommended Configuration
                </h3>
                <div className="grid gap-2">
                  {recommendedVars.map((varName) => (
                    <div key={varName} className="flex items-center justify-between p-3 rounded-lg border bg-orange-50 dark:bg-orange-950/20">
                      <code className="text-sm font-mono">{varName}</code>
                      <Badge variant="secondary">Recommended</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Server-Side Configuration Status */}
            <div>
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" />
                Server-Side Configuration
                {isValidatingServer && <Loader2 className="h-3 w-3 animate-spin" />}
              </h3>

              {serverValidation ? (
                <div className="space-y-3">
                  {Object.entries(serverValidation.categories).map(([category, data]) => (
                    <div key={category} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{category}</h4>
                        <Badge variant={data.configured > 0 ? "default" : "outline"}>
                          {data.configured}/{data.total} configured
                        </Badge>
                      </div>
                      <div className="grid gap-1">
                        {data.vars.map((envVar) => (
                          <div key={envVar.name} className="flex items-center justify-between text-xs">
                            <code className="font-mono">{envVar.name}</code>
                            <Badge variant={envVar.configured ? "default" : "outline"} className="text-xs">
                              {envVar.configured ? "Set" : "Not Set"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {serverValidation.warnings.length > 0 && (
                    <div className="border border-yellow-200 rounded-lg p-3 bg-yellow-50 dark:bg-yellow-950/20">
                      <h4 className="font-medium text-sm text-yellow-800 dark:text-yellow-200 mb-2">Warnings</h4>
                      <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                        {serverValidation.warnings.map((warning, idx) => (
                          <li key={idx}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg p-3 text-center text-muted-foreground">
                  <p className="text-sm">
                    {isValidatingServer ? 'Checking server configuration...' : 'Unable to check server configuration'}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refreshServerValidation()}
                    disabled={isValidatingServer}
                    className="mt-2"
                  >
                    {isValidatingServer ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : '🔄'}
                    Retry Check
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Setup Options */}
            <div className="space-y-4">
              <h3 className="font-medium">Setup Options</h3>

              <div className="grid gap-3">
                {/* Configuration Dialog */}
                <Card className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Interactive Setup</h4>
                        <p className="text-sm text-muted-foreground">
                          Configure your application through our guided setup wizard
                        </p>
                      </div>
                      <Button onClick={showConfigDialog} className="ml-4">
                        <Settings className="h-4 w-4 mr-2" />
                        Start Setup
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Manual Setup */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Manual Setup</h4>
                        <p className="text-sm text-muted-foreground">
                          Create a <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code> file with the required variables
                        </p>
                      </div>
                      <Button variant="outline" asChild>
                        <a
                          href="https://docs.reown.com/appkit/react/core/installation"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Docs
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Development Mode */}
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">Quick Start (Development)</h4>
                        <p className="text-sm text-muted-foreground">
                          Add <code className="text-xs bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_IS_DEFAULTS=true</code> to skip configuration
                        </p>
                      </div>
                      <Badge variant="outline">Development Only</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Features Preview */}
            <div className="space-y-3">
              <h3 className="font-medium">What You'll Get</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Multi-chain wallet support
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Social login integration
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Fiat on-ramp integration
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Token swap functionality
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Smart account support
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Sponsored transactions
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Powered by{' '}
            <a
              href="https://reown.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              Reown AppKit
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}