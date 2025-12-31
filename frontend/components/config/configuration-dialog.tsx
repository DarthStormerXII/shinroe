'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Settings,
  Network,
  Wallet,
  Palette,
  Shield,
  ExternalLink,
  Copy,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react'
import { toast } from 'sonner'
import { type EnvConfig, type SocialProvider, DEFAULT_CONFIG } from '@/lib/config/env-config'
import { MAINNET_CHAIN_NAMES, TESTNET_CHAIN_NAMES } from '@/lib/config/chains'

// Validation schema
const configSchema = z.object({
  walletConnectProjectId: z.string().min(1, 'Project ID is required'),
  alchemyApiKey: z.string().optional(),
  appName: z.string().min(1, 'App name is required'),
  appUrl: z.string().url('Must be a valid URL'),
  appDescription: z.string().optional(),
  supportedChains: z.array(z.string()).min(1, 'At least one chain must be selected'),
  defaultChain: z.string().optional(),
  enableAnalytics: z.boolean(),
  enableEmail: z.boolean(),
  enableOnramp: z.boolean(),
  enableSwap: z.boolean(),
  enablePayWithExchange: z.boolean(),
  socialProviders: z.array(z.string()),
  emailShowWallets: z.boolean(),
  smartAccountEnabled: z.boolean(),
  sponsoredTransactions: z.boolean(),
  paymasterUrl: z.string().optional(),
  bundlerUrl: z.string().optional(),
  themeMode: z.enum(['light', 'dark', 'auto']),
  allWallets: z.enum(['SHOW', 'HIDE', 'ONLY_MOBILE']),
  enableTestnets: z.boolean(),
})

type ConfigFormData = z.infer<typeof configSchema>

interface ConfigurationDialogProps {
  open: boolean
  onClose: () => void
  missingVars: string[]
  recommendedVars: string[]
  onConfigSave: (config: Partial<EnvConfig>) => void
}

// Chains available in the configuration dialog
const AVAILABLE_CHAINS: { value: string; label: string; description: string; isTestnet: boolean }[] = [
  // Mainnets
  { value: 'ethereum', label: 'Ethereum', description: 'Ethereum Mainnet', isTestnet: false },
  { value: 'polygon', label: 'Polygon', description: 'Polygon PoS network', isTestnet: false },
  { value: 'arbitrum', label: 'Arbitrum One', description: 'Arbitrum L2', isTestnet: false },
  { value: 'optimism', label: 'Optimism', description: 'Optimism L2', isTestnet: false },
  { value: 'base', label: 'Base', description: 'Coinbase L2', isTestnet: false },
  // Testnets
  { value: 'sepolia', label: 'Sepolia', description: 'Ethereum testnet', isTestnet: true },
  { value: 'amoy', label: 'Polygon Amoy', description: 'Polygon testnet', isTestnet: true },
  { value: 'arbitrum-sepolia', label: 'Arbitrum Sepolia', description: 'Arbitrum testnet', isTestnet: true },
  { value: 'optimism-sepolia', label: 'Optimism Sepolia', description: 'Optimism testnet', isTestnet: true },
  { value: 'base-sepolia', label: 'Base Sepolia', description: 'Base testnet', isTestnet: true },
]

const SOCIAL_PROVIDERS: { value: SocialProvider; label: string; icon: string }[] = [
  { value: 'google', label: 'Google', icon: '🔍' },
  { value: 'discord', label: 'Discord', icon: '🎮' },
  { value: 'apple', label: 'Apple', icon: '🍎' },
  { value: 'github', label: 'GitHub', icon: '🐙' },
  { value: 'x', label: 'X (Twitter)', icon: '❌' },
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'twitch', label: 'Twitch', icon: '🟣' },
  { value: 'farcaster', label: 'Farcaster', icon: '🟪' },
]

export function ConfigurationDialog({ open, onClose, missingVars, recommendedVars, onConfigSave }: ConfigurationDialogProps) {
  const [isGeneratingEnv, setIsGeneratingEnv] = useState(false)
  const [activeTab, setActiveTab] = useState('core')

  const form = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      walletConnectProjectId: '',
      alchemyApiKey: '',
      appName: DEFAULT_CONFIG.appName,
      appUrl: DEFAULT_CONFIG.appUrl,
      appDescription: '',
      supportedChains: DEFAULT_CONFIG.supportedChainNames || [],
      defaultChain: DEFAULT_CONFIG.defaultChainName || '',
      enableAnalytics: DEFAULT_CONFIG.features.analytics,
      enableEmail: DEFAULT_CONFIG.features.email,
      enableOnramp: DEFAULT_CONFIG.features.onramp,
      enableSwap: DEFAULT_CONFIG.features.swap,
      enablePayWithExchange: DEFAULT_CONFIG.features.payWithExchange,
      socialProviders: DEFAULT_CONFIG.features.socials,
      emailShowWallets: DEFAULT_CONFIG.features.emailShowWallets,
      smartAccountEnabled: DEFAULT_CONFIG.smartAccount.enabled,
      sponsoredTransactions: DEFAULT_CONFIG.smartAccount.sponsoredTransactions,
      paymasterUrl: '',
      bundlerUrl: '',
      themeMode: DEFAULT_CONFIG.themeMode,
      allWallets: DEFAULT_CONFIG.allWallets,
      enableTestnets: false, // Controlled by NEXT_PUBLIC_APP_MODE now
    }
  })

  const watchedValues = form.watch()

  const generateEnvFile = () => {
    const values = form.getValues()

    const envContent = `# Reown AppKit Configuration
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=${values.walletConnectProjectId}

# Alchemy API Key (optional but recommended)
${values.alchemyApiKey ? `NEXT_PUBLIC_ALCHEMY_API_KEY=${values.alchemyApiKey}` : '# NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key'}

# App Configuration
NEXT_PUBLIC_APP_NAME="${values.appName}"
NEXT_PUBLIC_APP_URL="${values.appUrl}"
${values.appDescription ? `NEXT_PUBLIC_APP_DESCRIPTION="${values.appDescription}"` : '# NEXT_PUBLIC_APP_DESCRIPTION="Your app description"'}

# Supported Networks
NEXT_PUBLIC_SUPPORTED_CHAINS=${values.supportedChains.join(',')}
${values.defaultChain ? `NEXT_PUBLIC_DEFAULT_CHAIN=${values.defaultChain}` : '# NEXT_PUBLIC_DEFAULT_CHAIN=ethereum'}

# Feature Toggles
NEXT_PUBLIC_ENABLE_ANALYTICS=${values.enableAnalytics}
NEXT_PUBLIC_ENABLE_EMAIL=${values.enableEmail}
NEXT_PUBLIC_ENABLE_ONRAMP=${values.enableOnramp}
NEXT_PUBLIC_ENABLE_SWAP=${values.enableSwap}
NEXT_PUBLIC_ENABLE_PAY_WITH_EXCHANGE=${values.enablePayWithExchange}
NEXT_PUBLIC_EMAIL_SHOW_WALLETS=${values.emailShowWallets}

# Social Providers
NEXT_PUBLIC_SOCIAL_PROVIDERS=${values.socialProviders.join(',')}

# Smart Account Configuration
NEXT_PUBLIC_SMART_ACCOUNT_ENABLED=${values.smartAccountEnabled}
NEXT_PUBLIC_SPONSORED_TRANSACTIONS=${values.sponsoredTransactions}
${values.paymasterUrl ? `NEXT_PUBLIC_PAYMASTER_URL=${values.paymasterUrl}` : '# NEXT_PUBLIC_PAYMASTER_URL=your_paymaster_url'}
${values.bundlerUrl ? `NEXT_PUBLIC_BUNDLER_URL=${values.bundlerUrl}` : '# NEXT_PUBLIC_BUNDLER_URL=your_bundler_url'}

# UI Configuration
NEXT_PUBLIC_THEME_MODE=${values.themeMode}
NEXT_PUBLIC_ALL_WALLETS=${values.allWallets}
NEXT_PUBLIC_ENABLE_TESTNETS=${values.enableTestnets}

# Development: Set to true to use defaults and skip configuration
# NEXT_PUBLIC_IS_DEFAULTS=false
`

    return envContent
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleSave = () => {
    const values = form.getValues()

    const config: Partial<EnvConfig> = {
      walletConnectProjectId: values.walletConnectProjectId,
      alchemyApiKey: values.alchemyApiKey,
      appName: values.appName,
      appUrl: values.appUrl,
      appDescription: values.appDescription,
      supportedChainNames: values.supportedChains,
      defaultChainName: values.defaultChain,
      features: {
        analytics: values.enableAnalytics,
        email: values.enableEmail,
        onramp: values.enableOnramp,
        swap: values.enableSwap,
        payWithExchange: values.enablePayWithExchange,
        socials: values.socialProviders as SocialProvider[],
        emailShowWallets: values.emailShowWallets,
      },
      smartAccount: {
        enabled: values.smartAccountEnabled,
        sponsoredTransactions: values.sponsoredTransactions,
        paymasterUrl: values.paymasterUrl,
        bundlerUrl: values.bundlerUrl,
      },
      themeMode: values.themeMode,
      allWallets: values.allWallets,
      enableTestnets: values.enableTestnets,
    }

    onConfigSave(config)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Web3 Application Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your Web3 application settings. {missingVars.length > 0 && `${missingVars.length} required`}{missingVars.length > 0 && recommendedVars.length > 0 && ' and '}{recommendedVars.length > 0 && `${recommendedVars.length} recommended`} environment variables need to be set.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="core" className="flex items-center gap-1">
                <Settings className="h-3 w-3" />
                Core
              </TabsTrigger>
              <TabsTrigger value="features" className="flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                Features
              </TabsTrigger>
              <TabsTrigger value="networks" className="flex items-center gap-1">
                <Network className="h-3 w-3" />
                Networks
              </TabsTrigger>
              <TabsTrigger value="advanced" className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Advanced
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden mt-4">
              <Form {...form}>
                {/* Core Configuration */}
                <TabsContent value="core" className="mt-0 h-full">
                  <ScrollArea className="h-[60vh] w-full rounded-md border">
                    <div className="space-y-4 pr-4 pb-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Essential Configuration</CardTitle>
                          <CardDescription>
                            Required settings to get your application running
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="walletConnectProjectId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  WalletConnect Project ID
                                  <Badge variant={missingVars.includes('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID') ? 'destructive' : 'default'}>
                                    {missingVars.includes('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID') ? 'Required' : 'Set'}
                                  </Badge>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Get from dashboard.reown.com" {...field} />
                                </FormControl>
                                <FormDescription className="flex items-center gap-1">
                                  <ExternalLink className="h-3 w-3" />
                                  <a href="https://dashboard.reown.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                    Get your project ID from Reown Dashboard
                                  </a>
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="alchemyApiKey"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-2">
                                  Alchemy API Key
                                  <Badge variant={recommendedVars.includes('NEXT_PUBLIC_ALCHEMY_API_KEY') ? 'secondary' : 'default'}>
                                    {recommendedVars.includes('NEXT_PUBLIC_ALCHEMY_API_KEY') ? 'Recommended' : 'Set'}
                                  </Badge>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="Get from dashboard.alchemy.com" {...field} />
                                </FormControl>
                                <FormDescription className="flex items-center gap-1">
                                  <Info className="h-3 w-3" />
                                  Recommended for better RPC performance and onramp features
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="appName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Application Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="My Web3 App" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="appUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Application URL</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://myapp.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="appDescription"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Application Description (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="A description of your Web3 application" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Features Configuration */}
                <TabsContent value="features" className="mt-0 h-full">
                  <ScrollArea className="h-[60vh] w-full rounded-md border">
                    <div className="space-y-4 pr-4 pb-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Reown Features</CardTitle>
                          <CardDescription>
                            Enable or disable specific Web3 features
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="enableAnalytics"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Analytics</FormLabel>
                                    <FormDescription>Usage tracking and insights</FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="enableEmail"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Email Wallets</FormLabel>
                                    <FormDescription>Create wallets with email</FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="enableOnramp"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Fiat On-Ramp</FormLabel>
                                    <FormDescription>Buy crypto with credit cards</FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="enableSwap"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Token Swaps</FormLabel>
                                    <FormDescription>DEX aggregated swapping</FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="enablePayWithExchange"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Pay with Exchange</FormLabel>
                                    <FormDescription>Exchange-based payments</FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="emailShowWallets"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Show Wallets on Email</FormLabel>
                                    <FormDescription>Display wallet options with email login</FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>

                          <Separator />

                          <div>
                            <FormLabel className="text-base">Social Login Providers</FormLabel>
                            <FormDescription className="mb-4">
                              Select which social providers to enable for wallet creation
                            </FormDescription>
                            <FormField
                              control={form.control}
                              name="socialProviders"
                              render={({ field }) => (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                  {SOCIAL_PROVIDERS.map((provider) => (
                                    <FormItem key={provider.value} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value.includes(provider.value)}
                                          onCheckedChange={(checked) => {
                                            const updatedProviders = checked
                                              ? [...field.value, provider.value]
                                              : field.value.filter((p) => p !== provider.value)
                                            field.onChange(updatedProviders)
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm flex items-center gap-1">
                                          {provider.icon} {provider.label}
                                        </FormLabel>
                                      </div>
                                    </FormItem>
                                  ))}
                                </div>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Networks Configuration */}
                <TabsContent value="networks" className="mt-0 h-full">
                  <ScrollArea className="h-[60vh] w-full rounded-md border">
                    <div className="space-y-4 pr-4 pb-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Blockchain Networks</CardTitle>
                          <CardDescription>
                            Select which blockchain networks to support in your application
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="supportedChains"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Supported Networks</FormLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {AVAILABLE_CHAINS.map((chain) => (
                                    <FormItem key={chain.value} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value.includes(chain.value)}
                                          onCheckedChange={(checked) => {
                                            const updatedChains = checked
                                              ? [...field.value, chain.value]
                                              : field.value.filter((c) => c !== chain.value)
                                            field.onChange(updatedChains)
                                          }}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="font-medium">{chain.label}</FormLabel>
                                        <FormDescription className="text-xs">{chain.description}</FormDescription>
                                      </div>
                                    </FormItem>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="defaultChain"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Default Network</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select default network" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {AVAILABLE_CHAINS
                                      .filter(chain => watchedValues.supportedChains.includes(chain.value))
                                      .map((chain) => (
                                      <SelectItem key={chain.value} value={chain.value}>
                                        {chain.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  The network users will connect to by default
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="enableTestnets"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Enable Testnets</FormLabel>
                                  <FormDescription>Allow connections to test networks</FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>

                {/* Advanced Configuration */}
                <TabsContent value="advanced" className="mt-0 h-full">
                  <ScrollArea className="h-[60vh] w-full rounded-md border">
                    <div className="space-y-4 pr-4 pb-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Smart Account Configuration</CardTitle>
                          <CardDescription>
                            Configure smart contract wallets and sponsored transactions
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <FormField
                            control={form.control}
                            name="smartAccountEnabled"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Enable Smart Accounts</FormLabel>
                                  <FormDescription>Use smart contract wallets for advanced features</FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />

                          {watchedValues.smartAccountEnabled && (
                            <>
                              <FormField
                                control={form.control}
                                name="sponsoredTransactions"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 ml-6">
                                    <FormControl>
                                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                      <FormLabel>Sponsored Transactions</FormLabel>
                                      <FormDescription>Enable gasless transactions for users</FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />

                              {watchedValues.sponsoredTransactions && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                                  <FormField
                                    control={form.control}
                                    name="paymasterUrl"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Paymaster URL</FormLabel>
                                        <FormControl>
                                          <Input placeholder="https://paymaster.example.com" {...field} />
                                        </FormControl>
                                        <FormDescription>URL for transaction sponsorship</FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="bundlerUrl"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Bundler URL</FormLabel>
                                        <FormControl>
                                          <Input placeholder="https://bundler.example.com" {...field} />
                                        </FormControl>
                                        <FormDescription>URL for transaction bundling</FormDescription>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                              )}
                            </>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">UI & Theme Configuration</CardTitle>
                          <CardDescription>
                            Customize the appearance and behavior of the wallet interface
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="themeMode"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Theme Mode</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="light">Light</SelectItem>
                                      <SelectItem value="dark">Dark</SelectItem>
                                      <SelectItem value="auto">Auto (System)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="allWallets"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Wallet Display</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="SHOW">Show All</SelectItem>
                                      <SelectItem value="HIDE">Hide Non-Installed</SelectItem>
                                      <SelectItem value="ONLY_MOBILE">Mobile Only</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormDescription>
                                    Control which wallets are displayed to users
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Form>
            </div>
          </Tabs>
        </div>

        <Separator />

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <div className="flex gap-2 flex-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(generateEnvFile())}
              className="flex items-center gap-1"
            >
              <Copy className="h-3 w-3" />
              Copy .env
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const element = document.createElement('a')
                const file = new Blob([generateEnvFile()], { type: 'text/plain' })
                element.href = URL.createObjectURL(file)
                element.download = '.env.local'
                document.body.appendChild(element)
                element.click()
                document.body.removeChild(element)
              }}
              className="flex items-center gap-1"
            >
              Download .env
            </Button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!form.formState.isValid}
              className="flex items-center gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Save Configuration
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}