'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Server,
  Globe,
  Shield,
  Info
} from 'lucide-react'
import {
  REQUIRED_CLIENT_ENV_VARS,
  OPTIONAL_CLIENT_ENV_VARS,
  REQUIRED_SERVER_ENV_VARS,
  OPTIONAL_SERVER_ENV_VARS,
  type ServerValidationResult
} from '@/lib/config/env-config'

interface EnvValidationDialogProps {
  open: boolean
  onClose: () => void
  serverValidation?: ServerValidationResult
  clientEnvStatus?: { present: string[]; missing: string[]; values: Record<string, string> }
}

type EnvVarStatus = 'present' | 'missing' | 'unknown'

interface EnvVarInfo {
  name: string
  status: EnvVarStatus
  description: string
  value?: string
}

export function EnvValidationDialog({
  open,
  onClose,
  serverValidation,
  clientEnvStatus = { present: [], missing: [], values: {} }
}: EnvValidationDialogProps) {
  // Get client-side environment variable statuses
  const getClientEnvStatus = (varName: string): EnvVarStatus => {
    if (clientEnvStatus.present.includes(varName)) return 'present'
    if (clientEnvStatus.missing.includes(varName)) return 'missing'
    return 'unknown'
  }

  // Get server-side environment variable statuses
  const getServerEnvStatus = (varName: string): EnvVarStatus => {
    if (!serverValidation) return 'unknown'
    const isConfigured = serverValidation.configured.includes(varName as any)
    return isConfigured ? 'present' : 'missing'
  }

  const requiredClientVars: EnvVarInfo[] = REQUIRED_CLIENT_ENV_VARS.map(varName => ({
    name: varName,
    status: getClientEnvStatus(varName),
    description: getEnvVarDescription(varName),
    value: clientEnvStatus.values[varName]
  }))

  const optionalClientVars: EnvVarInfo[] = OPTIONAL_CLIENT_ENV_VARS.map(varName => ({
    name: varName,
    status: getClientEnvStatus(varName),
    description: getEnvVarDescription(varName),
    value: clientEnvStatus.values[varName]
  }))

  const requiredServerVars: EnvVarInfo[] = REQUIRED_SERVER_ENV_VARS.map(varName => ({
    name: varName,
    status: getServerEnvStatus(varName),
    description: getEnvVarDescription(varName),
    value: serverValidation?.configured.includes(varName as any) ? '••••••••' : undefined
  }))

  const optionalServerVars: EnvVarInfo[] = OPTIONAL_SERVER_ENV_VARS.map(varName => ({
    name: varName,
    status: getServerEnvStatus(varName),
    description: getEnvVarDescription(varName),
    value: serverValidation?.configured.includes(varName as any) ? '••••••••' : undefined
  }))

  const getStatusIcon = (status: EnvVarStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'unknown':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: EnvVarStatus) => {
    switch (status) {
      case 'present':
        return <Badge variant="default" className="bg-green-100 text-green-800">Present</Badge>
      case 'missing':
        return <Badge variant="destructive">Missing</Badge>
      case 'unknown':
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const totalRequired = requiredClientVars.length + requiredServerVars.length
  const totalPresent = [
    ...requiredClientVars,
    ...requiredServerVars
  ].filter(v => v.status === 'present').length

  const hasRequiredMissing = totalRequired > totalPresent

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Environment Variables Status
          </DialogTitle>
          <DialogDescription>
            {hasRequiredMissing ? (
              <span className="text-red-600 font-medium">
                {totalRequired - totalPresent} required environment variables are missing.
              </span>
            ) : (
              <span className="text-green-600 font-medium">
                All required environment variables are configured.
              </span>
            )}
            {' '}Add missing variables to your <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file and restart the application.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-[70vh] w-full">
            <div className="space-y-6 pr-4">
              {/* Required Client-Side Variables */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5" />
                    Required Client-Side Variables
                    <Badge variant={requiredClientVars.every(v => v.status === 'present') ? 'default' : 'destructive'}>
                      {requiredClientVars.filter(v => v.status === 'present').length}/{requiredClientVars.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    These variables are required and must be set for the application to function properly.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {requiredClientVars.map((envVar) => (
                      <div key={envVar.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(envVar.status)}
                          <div className="flex-1">
                            <code className="font-mono text-sm">{envVar.name}</code>
                            <p className="text-xs text-muted-foreground mt-1">{envVar.description}</p>
                            {envVar.value && (
                              <code className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded mt-1 block">
                                {envVar.value}
                              </code>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(envVar.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Optional Client-Side Variables */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Globe className="h-5 w-5" />
                    Optional Client-Side Variables
                    <Badge variant="secondary">
                      {optionalClientVars.filter(v => v.status === 'present').length}/{optionalClientVars.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    These variables enhance functionality but are not required.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optionalClientVars.map((envVar) => (
                      <div key={envVar.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(envVar.status)}
                          <div className="flex-1">
                            <code className="font-mono text-sm">{envVar.name}</code>
                            <p className="text-xs text-muted-foreground mt-1">{envVar.description}</p>
                            {envVar.value && (
                              <code className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded mt-1 block">
                                {envVar.value}
                              </code>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(envVar.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {requiredServerVars.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Server className="h-5 w-5" />
                      Required Server-Side Variables
                      <Badge variant={requiredServerVars.every(v => v.status === 'present') ? 'default' : 'destructive'}>
                        {requiredServerVars.filter(v => v.status === 'present').length}/{requiredServerVars.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      These server-only variables are required for backend functionality.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {requiredServerVars.map((envVar) => (
                        <div key={envVar.name} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(envVar.status)}
                            <div className="flex-1">
                              <code className="font-mono text-sm">{envVar.name}</code>
                              <p className="text-xs text-muted-foreground mt-1">{envVar.description}</p>
                              {envVar.value && (
                                <code className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded mt-1 block">
                                  {envVar.value}
                                </code>
                              )}
                            </div>
                          </div>
                          {getStatusBadge(envVar.status)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Optional Server-Side Variables */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Server className="h-5 w-5" />
                    Optional Server-Side Variables
                    <Badge variant="secondary">
                      {optionalServerVars.filter(v => v.status === 'present').length}/{optionalServerVars.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    These server-only variables enable additional features and integrations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {optionalServerVars.map((envVar) => (
                      <div key={envVar.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(envVar.status)}
                          <div className="flex-1">
                            <code className="font-mono text-sm">{envVar.name}</code>
                            <p className="text-xs text-muted-foreground mt-1">{envVar.description}</p>
                            {envVar.value && (
                              <code className="text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded mt-1 block">
                                {envVar.value}
                              </code>
                            )}
                          </div>
                        </div>
                        {getStatusBadge(envVar.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

             
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function getEnvVarDescription(varName: string): string {
  const descriptions: Record<string, string> = {
    // Required Client-Side
    'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID': 'Project ID from Reown (WalletConnect) dashboard',
    'NEXT_PUBLIC_APP_NAME': 'Display name of your application',
    'NEXT_PUBLIC_APP_URL': 'Canonical URL of your application',
    'NEXT_PUBLIC_SUPPORTED_CHAINS': 'Comma-separated list of supported blockchain networks',

    // Optional Client-Side
    'NEXT_PUBLIC_ALCHEMY_API_KEY': 'Alchemy API key for enhanced RPC performance',
    'NEXT_PUBLIC_APP_DESCRIPTION': 'Description of your application',
    'NEXT_PUBLIC_APP_ICON': 'URL or path to your app icon',
    'NEXT_PUBLIC_DEFAULT_CHAIN': 'Default blockchain network to connect to',
    'NEXT_PUBLIC_ENABLE_ANALYTICS': 'Enable usage analytics (default: true)',
    'NEXT_PUBLIC_ENABLE_EMAIL': 'Enable email wallet creation (default: true)',
    'NEXT_PUBLIC_ENABLE_ONRAMP': 'Enable fiat on-ramp features (default: true)',
    'NEXT_PUBLIC_ENABLE_SWAP': 'Enable token swap features (default: true)',
    'NEXT_PUBLIC_ENABLE_PAY_WITH_EXCHANGE': 'Enable pay with exchange features (default: false)',
    'NEXT_PUBLIC_SOCIAL_PROVIDERS': 'Comma-separated list of social login providers',
    'NEXT_PUBLIC_EMAIL_SHOW_WALLETS': 'Show wallet options with email login (default: true)',
    'NEXT_PUBLIC_SMART_ACCOUNT_ENABLED': 'Enable smart contract wallets (default: false)',
    'NEXT_PUBLIC_SPONSORED_TRANSACTIONS': 'Enable gasless transactions (default: false)',
    'NEXT_PUBLIC_PAYMASTER_URL': 'URL for transaction sponsorship service',
    'NEXT_PUBLIC_BUNDLER_URL': 'URL for transaction bundling service',
    'NEXT_PUBLIC_THEME_MODE': 'Theme mode: light, dark, or auto (default: auto)',
    'NEXT_PUBLIC_ALL_WALLETS': 'Wallet display mode: SHOW, HIDE, or ONLY_MOBILE',
    'NEXT_PUBLIC_ENABLE_TESTNETS': 'Allow connections to test networks (default: false)',
    'NEXT_PUBLIC_CUSTOM_RPC_URLS': 'JSON object of custom RPC URLs for networks',
    'NEXT_PUBLIC_IS_DEFAULTS': 'Use default configuration and skip validation',
    'NEXT_PUBLIC_TENDERLY_USERNAME': 'Tenderly username for transaction simulation',
    'NEXT_PUBLIC_TENDERLY_PROJECT_SLUG': 'Tenderly project slug for transaction simulation',

    // Optional Server-Side
    'GEMINI_API_KEY': 'Google Gemini AI API key for transaction summaries',
    'GEMINI_MODEL': 'Gemini model to use (default: gemini-2.0-flash-lite)',
    'DISABLE_AI_SUMMARIES': 'Disable AI transaction summaries',
    'TENDERLY_ACCESS_TOKEN': 'Tenderly access token for transaction simulation',
    'PINATA_JWT': 'Pinata JWT token for IPFS file storage',
    'DATABASE_URL': 'Database connection string',
    'MONGODB_URI': 'MongoDB connection URI',
    'NEXTAUTH_SECRET': 'NextAuth.js secret for session encryption',
    'NEXTAUTH_URL': 'NextAuth.js canonical URL'
  }

  return descriptions[varName] || 'Environment variable'
}