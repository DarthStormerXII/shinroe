'use client'

import { useState, useEffect } from 'react'
import { ArrowDown, Settings, Zap, ExternalLink, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { ChainSelectorPair } from './chain-selector'
import { TokenInput } from './token-selector'
import { ExecuteActionsSelector } from './execute-actions-selector'
import { BridgeSettings } from './bridge-settings'
import type { Chain, BridgeToken, TokenBalance, BridgeQuote, ExecuteAction, BridgeFormState } from '@/lib/types/bridge'
import type { BridgeProvider } from '@/lib/config/evm-config'
import { BRIDGE_CONFIGS, getEnabledBridges } from '@/lib/config/evm-config'
import { wormholeService } from '@/lib/services/wormhole-service'

interface BridgeFormProps {
  onBridge: (quote: BridgeQuote) => Promise<void>
  balances?: TokenBalance[]
  isLoading?: boolean
  error?: string | null
}

export function BridgeForm({
  onBridge,
  balances = [],
  isLoading = false,
  error = null,
}: BridgeFormProps) {
  const [formState, setFormState] = useState<BridgeFormState>({
    sourceChain: null,
    destinationChain: null,
    token: null,
    amount: '',
    sourceAddress: '',
    destinationAddress: '',
    slippage: 0.5,
    customRecipient: false,
  })

  const [selectedProvider, setSelectedProvider] = useState<BridgeProvider>('wormhole')

  const [quote, setQuote] = useState<BridgeQuote | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [enableExecuteActions, setEnableExecuteActions] = useState(false)
  const [executeAction, setExecuteAction] = useState<ExecuteAction | undefined>()
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteError, setQuoteError] = useState<string | null>(null)

  // Get quote from selected bridge provider
  const getQuote = async (): Promise<BridgeQuote | null> => {
    if (!formState.sourceChain || !formState.destinationChain || !formState.token || !formState.amount) {
      return null
    }

    try {
      setQuoteLoading(true)
      setQuoteError(null)

      // Get quote based on selected provider
      if (selectedProvider === 'wormhole') {
        const sourceChainId = typeof formState.sourceChain.id === 'number' ? formState.sourceChain.id : parseInt(formState.sourceChain.id as string)
        const destChainId = typeof formState.destinationChain.id === 'number' ? formState.destinationChain.id : parseInt(formState.destinationChain.id as string)

        // Get quote from Wormhole service
        const wormholeQuote = await wormholeService.getQuote({
          sourceChainId,
          destinationChainId: destChainId,
          token: formState.token.addresses[sourceChainId] as `0x${string}` || 'native',
          amount: BigInt(parseFloat(formState.amount) * 10 ** formState.token.decimals),
          recipient: '0x0000000000000000000000000000000000000000' as `0x${string}`, // Will be filled by wallet
        })

        const amount = parseFloat(formState.amount)
        const bridgeFeeFormatted = Number(wormholeQuote.bridgeFee) / 1e18
        const relayerFeeFormatted = Number(wormholeQuote.relayerFee) / 1e18
        const totalFee = bridgeFeeFormatted + relayerFeeFormatted

        return {
          provider: selectedProvider,
          sourceChain: formState.sourceChain,
          destinationChain: formState.destinationChain,
          token: formState.token,
          amount: formState.amount,
          estimatedOutput: (amount - totalFee).toString(),
          fees: {
            bridge: bridgeFeeFormatted.toString(),
            gas: relayerFeeFormatted.toString(),
            total: totalFee.toString(),
          },
          estimatedTime: wormholeQuote.estimatedTime,
          slippage: formState.slippage,
          minReceived: ((amount - totalFee) * (1 - formState.slippage / 100)).toString(),
          executeAction,
        }
      } else {
        // Fallback to mock quote for other providers
        await new Promise(resolve => setTimeout(resolve, 1000))

        const amount = parseFloat(formState.amount)
        const providerConfig = BRIDGE_CONFIGS[selectedProvider]
        const baseFee = 0.001
        const gasFee = 0.005
        const totalFee = baseFee + gasFee
        const outputAmount = Math.max(0, amount - totalFee)

        const mockQuote: BridgeQuote = {
          provider: selectedProvider,
          sourceChain: formState.sourceChain,
          destinationChain: formState.destinationChain,
          token: formState.token,
          amount: formState.amount,
          estimatedOutput: outputAmount.toString(),
          fees: {
            bridge: baseFee.toString(),
            gas: gasFee.toString(),
            total: totalFee.toString(),
          },
          estimatedTime: parseInt(providerConfig.estimatedTime.split('-')[0]) * 60, // Convert minutes to seconds
          slippage: formState.slippage,
          minReceived: (outputAmount * (1 - formState.slippage / 100)).toString(),
          executeAction,
        }

        return mockQuote
      }
    } catch (error) {
      console.error('Failed to get quote:', error)
      setQuoteError(`Failed to get quote from ${BRIDGE_CONFIGS[selectedProvider].name}`)
      return null
    } finally {
      setQuoteLoading(false)
    }
  }

  // Update quote when form changes
  useEffect(() => {
    const updateQuote = async () => {
      const newQuote = await getQuote()
      setQuote(newQuote)
    }

    if (formState.sourceChain && formState.destinationChain && formState.token && formState.amount) {
      updateQuote()
    } else {
      setQuote(null)
    }
  }, [formState, executeAction, selectedProvider])

  const handleSwapChains = () => {
    setFormState(prev => ({
      ...prev,
      sourceChain: prev.destinationChain,
      destinationChain: prev.sourceChain,
    }))
  }

  const handleAmountChange = (amount: string) => {
    setFormState(prev => ({ ...prev, amount }))
  }

  const handleTokenSelect = (token: BridgeToken) => {
    setFormState(prev => ({ ...prev, token }))
  }

  const handleBridge = async () => {
    if (!quote) return

    try {
      await onBridge(quote)
    } catch (error) {
      console.error('Bridge failed:', error)
    }
  }

  const canBridge = () => {
    return (
      quote &&
      formState.sourceChain &&
      formState.destinationChain &&
      formState.token &&
      formState.amount &&
      parseFloat(formState.amount) > 0 &&
      !isLoading &&
      !quoteLoading
    )
  }

  const getSourceBalance = (): TokenBalance | undefined => {
    if (!formState.token || !formState.sourceChain) return undefined
    return balances.find(balance =>
      balance.token.symbol === formState.token?.symbol
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Chain Selection */}
      <ChainSelectorPair
        sourceChain={formState.sourceChain}
        destinationChain={formState.destinationChain}
        onSourceChainSelect={(chain) => setFormState(prev => ({ ...prev, sourceChain: chain }))}
        onDestinationChainSelect={(chain) => setFormState(prev => ({ ...prev, destinationChain: chain }))}
        onSwapChains={handleSwapChains}
        showTestnets={true}
      />

      {/* Bridge Provider Selection */}
      <Card className="p-4">
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Bridge Provider</h3>
          <div className="grid grid-cols-2 gap-2">
            {getEnabledBridges().map((bridge) => (
              <Button
                key={bridge.provider}
                variant={selectedProvider === bridge.provider ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProvider(bridge.provider)}
                className="justify-start"
              >
                <div className="flex flex-col items-start text-left">
                  <span className="text-xs font-medium">{bridge.name}</span>
                  <span className="text-xs text-muted-foreground">{bridge.estimatedTime}</span>
                </div>
              </Button>
            ))}
          </div>
          {BRIDGE_CONFIGS[selectedProvider] && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="secondary" className="text-xs">
                {BRIDGE_CONFIGS[selectedProvider].bridgeAndExecute ? 'Bridge + Execute' : 'Bridge Only'}
              </Badge>
              <span>•</span>
              <span>Fees: {BRIDGE_CONFIGS[selectedProvider].fees.base}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Token Input */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Amount</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="h-8 w-8 p-0"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <TokenInput
            selectedToken={formState.token}
            onTokenSelect={handleTokenSelect}
            amount={formState.amount}
            onAmountChange={handleAmountChange}
            chain={formState.sourceChain}
            balances={balances}
            label="You Send"
            disabled={!formState.sourceChain}
          />

          <div className="flex justify-center">
            <div className="p-2 bg-muted rounded-full">
              <ArrowDown className="h-4 w-4" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">You Receive</label>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
              <div className="flex items-center gap-3">
                {formState.token && (
                  <img
                    src={formState.token.logoUrl || '/tokens/unknown.png'}
                    alt={formState.token.symbol}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium">
                    {quote ? parseFloat(quote.estimatedOutput).toFixed(6) : '0.0'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formState.token?.symbol || 'Token'}
                  </div>
                </div>
              </div>
              {formState.destinationChain && (
                <Badge variant="secondary">
                  {formState.destinationChain.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Execute Actions */}
      {enableExecuteActions && formState.destinationChain && (
        <Card className="p-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <h3 className="font-semibold">Execute on Arrival</h3>
            </div>
            <ExecuteActionsSelector
              chain={formState.destinationChain}
              onActionSelect={setExecuteAction}
              selectedAction={executeAction}
            />
          </div>
        </Card>
      )}

      {/* Bridge Quote */}
      {quote && (
        <Card className="p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Route</span>
              <Badge variant="outline">{BRIDGE_CONFIGS[selectedProvider].name}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimated Time</span>
              <span className="text-sm">~{Math.round(quote.estimatedTime / 60)} minutes</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Bridge Fee</span>
              <span className="text-sm">${quote.fees.bridge}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Gas Fee</span>
              <span className="text-sm">${quote.fees.gas}</span>
            </div>
            <Separator />
            <div className="flex items-center justify-between font-medium">
              <span>Total Fees</span>
              <span>${quote.fees.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Min. Received</span>
              <span className="text-sm">{parseFloat(quote.minReceived).toFixed(6)} {quote.token.symbol}</span>
            </div>
          </div>
        </Card>
      )}

      {/* Error Display */}
      {(error || quoteError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || quoteError}
          </AlertDescription>
        </Alert>
      )}

      {/* Bridge + Execute Toggle */}
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <div className="font-medium">Bridge + Execute</div>
          <div className="text-xs text-muted-foreground">
            Execute actions on destination chain
          </div>
        </div>
        <Switch
          checked={enableExecuteActions}
          onCheckedChange={setEnableExecuteActions}
          disabled={!formState.destinationChain}
        />
      </div>

      {/* Bridge Button */}
      <Button
        onClick={handleBridge}
        disabled={!canBridge()}
        className="w-full h-12 text-base font-semibold"
        size="lg"
      >
        {isLoading || quoteLoading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
            {isLoading ? 'Bridging...' : 'Getting Quote...'}
          </div>
        ) : !formState.sourceChain || !formState.destinationChain ? (
          'Select Networks'
        ) : !formState.token ? (
          'Select Token'
        ) : !formState.amount || parseFloat(formState.amount) <= 0 ? (
          'Enter Amount'
        ) : !quote ? (
          'Get Quote'
        ) : (
          `Bridge ${formState.token.symbol}`
        )}
      </Button>

      {/* Settings Panel */}
      {showSettings && (
        <BridgeSettings
          slippage={formState.slippage}
          onSlippageChange={(slippage) => setFormState(prev => ({ ...prev, slippage }))}
          customRecipient={formState.customRecipient}
          onCustomRecipientChange={(customRecipient) => setFormState(prev => ({ ...prev, customRecipient }))}
          destinationAddress={formState.destinationAddress}
          onDestinationAddressChange={(destinationAddress) => setFormState(prev => ({ ...prev, destinationAddress }))}
        />
      )}

      {/* Additional Info */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>
          Powered by {BRIDGE_CONFIGS[selectedProvider].name} •
          <a href="#" className="hover:underline ml-1">
            Learn more <ExternalLink className="inline h-3 w-3" />
          </a>
        </p>
      </div>
    </div>
  )
}