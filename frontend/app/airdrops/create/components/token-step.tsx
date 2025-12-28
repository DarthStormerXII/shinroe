'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Card, CardContent } from '@/components/ui/card'
import { useTokenFactory, type CreateTokenParams } from '@/lib/hooks/use-token-factory'
import { Loader2, Check, Coins, Clock, Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { isAddress } from 'viem'
import type { Address } from 'viem'
import { toast } from 'sonner'
import { getExplorerUrl } from '@/lib/web3'

const CHAIN_ID = 80002 // Polygon Amoy

export interface TokenStepData {
  mode: 'existing' | 'create'
  existingTokenAddress?: Address
  newTokenParams?: CreateTokenParams
  createdTokenAddress?: Address
  tokenDecimals: number
  tokenSymbol: string
}

interface TokenStepProps {
  data: TokenStepData
  onUpdate: (data: Partial<TokenStepData>) => void
  onNext: () => void
}

export function TokenStep({ data, onUpdate, onNext }: TokenStepProps) {
  const { createToken, isLoading: isCreating, myTokens } = useTokenFactory()
  const [error, setError] = useState<string | null>(null)

  const handleModeChange = (mode: 'existing' | 'create') => {
    onUpdate({ mode })
  }

  const handleExistingAddressChange = (address: string) => {
    onUpdate({ existingTokenAddress: address as Address })
    if (address && !isAddress(address)) {
      setError('Invalid address format')
    } else {
      setError(null)
    }
  }

  const handleCreateToken = async () => {
    if (!data.newTokenParams) return
    setError(null)

    const toastId = toast.loading('Creating token...')

    try {
      const result = await createToken(data.newTokenParams)
      const explorerUrl = getExplorerUrl(CHAIN_ID)

      if (result.tokenAddress) {
        onUpdate({
          createdTokenAddress: result.tokenAddress,
          tokenDecimals: data.newTokenParams.decimals,
          tokenSymbol: data.newTokenParams.symbol,
        })
        toast.success(`Token ${data.newTokenParams.symbol} created!`, {
          id: toastId,
          description: `Address: ${result.tokenAddress.slice(0, 10)}...${result.tokenAddress.slice(-8)}`,
          action: explorerUrl ? {
            label: 'View Tx',
            onClick: () => window.open(`${explorerUrl}/tx/${result.hash}`, '_blank'),
          } : undefined,
        })
      } else {
        toast.error('Token creation failed', {
          id: toastId,
          description: 'Could not extract token address from transaction',
          action: explorerUrl ? {
            label: 'View Tx',
            onClick: () => window.open(`${explorerUrl}/tx/${result.hash}`, '_blank'),
          } : undefined,
        })
        setError('Failed to extract token address from transaction')
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create token'
      toast.error('Transaction failed', {
        id: toastId,
        description: errorMsg,
      })
      setError(errorMsg)
    }
  }

  const canProceed =
    (data.mode === 'existing' && data.existingTokenAddress && isAddress(data.existingTokenAddress)) ||
    (data.mode === 'create' && data.createdTokenAddress)

  const getEffectiveToken = (): Address | undefined => {
    if (data.mode === 'existing') return data.existingTokenAddress
    return data.createdTokenAddress
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Select or Create Token</h2>
        <p className="text-muted-foreground text-sm">
          Choose an existing ERC20 token or create a new one for your airdrop.
        </p>
      </div>

      <RadioGroup value={data.mode} onValueChange={(v) => handleModeChange(v as 'existing' | 'create')}>
        {/* Existing Token Option - Disabled / Coming Soon */}
        <Card className="opacity-60 cursor-not-allowed">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="existing" id="existing" className="mt-1" disabled />
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="existing" className="text-base font-medium text-muted-foreground">
                    Use existing token
                  </Label>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Coming Soon
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Support for existing ERC20 tokens will be available soon.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create New Token Option */}
        <Card className={data.mode === 'create' ? 'border-violet' : ''}>
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="create" id="create" className="mt-1" />
              <div className="flex-1 space-y-3">
                <Label htmlFor="create" className="text-base font-medium cursor-pointer">
                  Create new token
                </Label>
                {data.mode === 'create' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newName">Token Name</Label>
                        <Input
                          id="newName"
                          placeholder="Community Token"
                          value={data.newTokenParams?.name || ''}
                          onChange={(e) =>
                            onUpdate({ newTokenParams: { ...data.newTokenParams!, name: e.target.value } })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newSymbol">Symbol</Label>
                        <Input
                          id="newSymbol"
                          placeholder="CTK"
                          value={data.newTokenParams?.symbol || ''}
                          onChange={(e) =>
                            onUpdate({
                              newTokenParams: { ...data.newTokenParams!, symbol: e.target.value },
                              tokenSymbol: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="newSupply">Total Supply</Label>
                        <Input
                          id="newSupply"
                          placeholder="1000000"
                          value={data.newTokenParams?.totalSupply || ''}
                          onChange={(e) =>
                            onUpdate({ newTokenParams: { ...data.newTokenParams!, totalSupply: e.target.value } })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newDecimals">Decimals</Label>
                        <Input
                          id="newDecimals"
                          type="number"
                          value={data.newTokenParams?.decimals ?? 18}
                          onChange={(e) =>
                            onUpdate({
                              newTokenParams: { ...data.newTokenParams!, decimals: Number(e.target.value) },
                              tokenDecimals: Number(e.target.value),
                            })
                          }
                        />
                      </div>
                    </div>

                    {data.createdTokenAddress ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-violet" />
                            Token Created
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={data.createdTokenAddress}
                              readOnly
                              className="font-mono text-sm bg-muted"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="shrink-0"
                              onClick={() => {
                                navigator.clipboard.writeText(data.createdTokenAddress!)
                                toast.success('Address copied!')
                              }}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your token <span className="font-medium text-foreground">{data.tokenSymbol}</span> has been deployed. You can proceed to the next step.
                        </p>
                      </div>
                    ) : (
                      <Button
                        onClick={handleCreateToken}
                        disabled={
                          isCreating ||
                          !data.newTokenParams?.name ||
                          !data.newTokenParams?.symbol ||
                          !data.newTokenParams?.totalSupply
                        }
                        className="w-full bg-violet hover:bg-violet/90"
                      >
                        {isCreating ? (
                          <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating Token...</>
                        ) : (
                          <><Coins className="h-4 w-4 mr-2" /> Create Token</>
                        )}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex justify-end pt-4">
        <Button onClick={onNext} disabled={!canProceed} className="bg-violet hover:bg-violet/90">
          Next Step
        </Button>
      </div>
    </div>
  )
}
