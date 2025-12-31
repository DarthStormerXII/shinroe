'use client'

import { useState, useCallback, useEffect } from 'react'
import { Address, zeroAddress, parseEther } from 'viem'
import { StoryClient } from '@story-protocol/core-sdk'
import { Loader2, Coins, Send, RefreshCw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

import { STORY_API_PROXY, STORY_CONTRACTS, WIP_TOKEN_ADDRESS } from '@/constants/protocols/story'
import type { IPAsset, RoyaltyResult, PaymentResult, StoryTabProps } from '@/lib/types/story'
import { CopyButton, TxLink } from '../shared'
import { getAssetDisplayName } from '@/lib/services/story-service'

export function RoyaltyTab({ getClient, address }: StoryTabProps) {
  // User's IP Assets
  const [userAssets, setUserAssets] = useState<IPAsset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)

  // Claim royalties state
  const [claimLoading, setClaimLoading] = useState(false)
  const [checkingRevenue, setCheckingRevenue] = useState(false)
  const [claimableRevenue, setClaimableRevenue] = useState<string | null>(null)
  const [claimResult, setClaimResult] = useState<RoyaltyResult | null>(null)
  const [ipId, setIpId] = useState('0x1234567890abcdef1234567890abcdef12345678')
  const [childIpIds, setChildIpIds] = useState('')

  // Pay royalties state
  const [payLoading, setPayLoading] = useState(false)
  const [payResult, setPayResult] = useState<PaymentResult | null>(null)
  const [receiverIpId, setReceiverIpId] = useState('0x1234567890abcdef1234567890abcdef12345678')
  const [payerIpId, setPayerIpId] = useState('')
  const [payAmount, setPayAmount] = useState('0.1')
  const [isExternalPayer, setIsExternalPayer] = useState(true)

  // Fetch user's IP assets
  const fetchUserAssets = useCallback(async () => {
    if (!address) return

    setLoadingAssets(true)
    try {
      const response = await fetch(STORY_API_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: '/assets',
          where: { ownerAddress: address },
          pagination: { limit: 100, offset: 0 },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserAssets(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch user assets:', error)
    } finally {
      setLoadingAssets(false)
    }
  }, [address])

  useEffect(() => {
    fetchUserAssets()
  }, [fetchUserAssets])

  const handleCheckRevenue = async () => {
    const client = await getClient()
    if (!client) return

    if (!ipId) {
      toast.error('Please select an IP Asset')
      return
    }

    setCheckingRevenue(true)
    setClaimableRevenue(null)

    try {
      // Check if the IP has a royalty vault
      const vaultAddress = await client.royalty.getRoyaltyVaultAddress(ipId as Address)

      if (!vaultAddress || vaultAddress === zeroAddress) {
        toast.error('This IP does not have a royalty vault yet')
        return
      }

      const response = await client.royalty.claimableRevenue({
        ipId: ipId as Address,
        claimer: ipId as Address,
        token: STORY_CONTRACTS.WIP_TOKEN,
      })

      setClaimableRevenue(response.toString())
      toast.success('Revenue checked!')
    } catch (error: any) {
      console.error('Failed to check revenue:', error)
      toast.error(error.message || 'Failed to check claimable revenue')
    } finally {
      setCheckingRevenue(false)
    }
  }

  const handleClaimRevenue = async () => {
    const client = await getClient()
    if (!client) return

    if (!ipId) {
      toast.error('Please select an IP Asset')
      return
    }

    setClaimLoading(true)
    setClaimResult(null)

    try {
      const vaultAddress = await client.royalty.getRoyaltyVaultAddress(ipId as Address)

      if (!vaultAddress || vaultAddress === zeroAddress) {
        toast.error('This IP does not have a royalty vault yet')
        return
      }

      const childIds = childIpIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean) as Address[]

      const response = await client.royalty.claimAllRevenue({
        ancestorIpId: ipId as Address,
        claimer: ipId as Address,
        childIpIds: childIds.length > 0 ? childIds : [],
        royaltyPolicies:
          childIds.length > 0 ? childIds.map(() => STORY_CONTRACTS.ROYALTY_POLICY_LAP) : [],
        currencyTokens: [STORY_CONTRACTS.WIP_TOKEN],
      })

      const totalClaimed =
        response.claimedTokens?.reduce((acc, t) => acc + BigInt(t.amount), 0n) || 0n

      setClaimResult({
        txHashes: response.txHashes,
        claimedAmount: totalClaimed.toString(),
      })
      toast.success('Revenue claimed successfully!')
    } catch (error: any) {
      console.error('Failed to claim revenue:', error)
      toast.error(error.message || 'Failed to claim revenue')
    } finally {
      setClaimLoading(false)
    }
  }

  const handlePayRoyalty = async () => {
    const client = await getClient()
    if (!client) return

    if (!receiverIpId) {
      toast.error('Please enter receiver IP ID')
      return
    }

    if (!payAmount || parseFloat(payAmount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!isExternalPayer && !payerIpId) {
      toast.error('Please select a payer IP')
      return
    }

    setPayLoading(true)
    setPayResult(null)

    try {
      const response = await client.royalty.payRoyaltyOnBehalf({
        receiverIpId: receiverIpId as Address,
        payerIpId: isExternalPayer ? zeroAddress : (payerIpId as Address),
        token: WIP_TOKEN_ADDRESS,
        amount: parseEther(payAmount),
      })

      setPayResult({ txHash: response.txHash })
      toast.success('Royalty paid successfully!')
    } catch (error: any) {
      console.error('Failed to pay royalty:', error)
      toast.error(error.message || 'Failed to pay royalty')
    } finally {
      setPayLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Claim Royalties */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Claim Royalties
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Check and claim revenue from your IP Assets
          </p>

          <div className="space-y-4">
            <div>
              <Label>Your IP Asset *</Label>
              {loadingAssets ? (
                <div className="flex items-center gap-2 mt-1.5 p-2 rounded-md border bg-muted/50">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
              ) : userAssets.length > 0 ? (
                <Select value={ipId} onValueChange={setIpId}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select IP Asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {userAssets.map((asset) => (
                      <SelectItem key={asset.ipId} value={asset.ipId}>
                        {getAssetDisplayName(asset)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 mt-1.5 p-3 rounded-md border bg-muted/50">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">No IP Assets found</span>
                </div>
              )}
            </div>

            <div>
              <Label>Child IP IDs (comma-separated)</Label>
              <Textarea
                placeholder="0x..., 0x..."
                value={childIpIds}
                onChange={(e) => setChildIpIds(e.target.value)}
                className="mt-1.5"
                rows={2}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Optional: Claim revenue from derivatives
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCheckRevenue}
                disabled={checkingRevenue}
                variant="secondary"
                className="flex-1"
              >
                {checkingRevenue ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Revenue'
                )}
              </Button>
              <Button onClick={handleClaimRevenue} disabled={claimLoading} className="flex-1">
                {claimLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  'Claim All'
                )}
              </Button>
            </div>

            {claimableRevenue !== null && (
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground mb-1">Claimable Revenue:</p>
                <p className="text-2xl font-bold">
                  {(Number(claimableRevenue) / 1e18).toFixed(4)} WIP
                </p>
              </div>
            )}

            {claimResult && (
              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                {claimResult.claimedAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Claimed:</span>
                    <span className="font-semibold">
                      {(Number(claimResult.claimedAmount) / 1e18).toFixed(4)} WIP
                    </span>
                  </div>
                )}
                {claimResult.txHashes && claimResult.txHashes.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Transactions:</span>
                    <div className="mt-1 space-y-1">
                      {claimResult.txHashes.map((hash, i) => (
                        <div key={i}>
                          <TxLink hash={hash} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pay Royalties */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Send className="h-5 w-5" />
            Pay Royalties
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Pay royalties to an IP Asset
          </p>

          <div className="space-y-4">
            <div>
              <Label>Receiver IP Asset ID *</Label>
              <Input
                placeholder="0x..."
                value={receiverIpId}
                onChange={(e) => setReceiverIpId(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <Label>External Payer (You)</Label>
                <p className="text-xs text-muted-foreground">
                  Toggle off to pay from another IP
                </p>
              </div>
              <Switch checked={isExternalPayer} onCheckedChange={setIsExternalPayer} />
            </div>

            {!isExternalPayer && (
              <div>
                <Label>Payer IP Asset *</Label>
                {userAssets.length > 0 ? (
                  <Select value={payerIpId} onValueChange={setPayerIpId}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select payer IP" />
                    </SelectTrigger>
                    <SelectContent>
                      {userAssets.map((asset) => (
                        <SelectItem key={asset.ipId} value={asset.ipId}>
                          {getAssetDisplayName(asset)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="0x..."
                    value={payerIpId}
                    onChange={(e) => setPayerIpId(e.target.value)}
                    className="mt-1.5"
                  />
                )}
              </div>
            )}

            <div>
              <Label>Amount (WIP) *</Label>
              <Input
                type="number"
                placeholder="1.0"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                className="mt-1.5"
                step="0.01"
                min="0"
              />
            </div>

            <Button onClick={handlePayRoyalty} disabled={payLoading} className="w-full">
              {payLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Paying...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Pay Royalty
                </>
              )}
            </Button>

            {payResult && payResult.txHash && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Transaction:</span>
                  <TxLink hash={payResult.txHash} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Royalty System</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Revenue Token: WIP</h4>
            <p className="text-sm text-muted-foreground">
              All royalties are paid in WIP (Wrapped IP) tokens.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Automatic Distribution</h4>
            <p className="text-sm text-muted-foreground">
              Revenue flows up to parent IPs based on revenue share %.
            </p>
          </div>
          <div className="p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Royalty Vault</h4>
            <p className="text-sm text-muted-foreground">
              Each IP has a vault that accumulates earnings.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t">
          <h4 className="font-medium mb-3">Contract Addresses</h4>
          <div className="grid gap-2 md:grid-cols-2 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded bg-muted/30">
              <span className="text-muted-foreground">RoyaltyPolicyLAP:</span>
              <div className="flex items-center gap-1">
                <span>{STORY_CONTRACTS.ROYALTY_POLICY_LAP.slice(0, 10)}...</span>
                <CopyButton text={STORY_CONTRACTS.ROYALTY_POLICY_LAP} />
              </div>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-muted/30">
              <span className="text-muted-foreground">WIP Token:</span>
              <div className="flex items-center gap-1">
                <span>{STORY_CONTRACTS.WIP_TOKEN.slice(0, 10)}...</span>
                <CopyButton text={STORY_CONTRACTS.WIP_TOKEN} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoyaltyTab
