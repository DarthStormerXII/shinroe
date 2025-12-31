'use client'

import { useState, useCallback, useEffect } from 'react'
import { Address, zeroAddress, parseEther } from 'viem'
import { StoryClient, PIL_TYPE } from '@story-protocol/core-sdk'
import { Loader2, Shield, Coins, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

import { STORY_EXPLORER, STORY_API_PROXY, STORY_CONTRACTS } from '@/constants/protocols/story'
import type { IPAsset, LicenseResult, MintResult, StoryTabProps, OwnedLicenseToken } from '@/lib/types/story'
import { useOwnedLicenseTokens } from '@/hooks/protocols/story'
import { CopyButton, TxLink, IpLink } from '../shared'
import { formatMintingFee, getLicenseTypeLabel, getAssetDisplayName, getAssetImageUrl } from '@/lib/services/story-service'

// License type options
type LicenseType = 'non_commercial' | 'commercial_use' | 'commercial_remix'

const LICENSE_TYPES: { value: LicenseType; label: string }[] = [
  { value: 'non_commercial', label: 'Non-Commercial Social Remix' },
  { value: 'commercial_use', label: 'Commercial Use' },
  { value: 'commercial_remix', label: 'Commercial Remix' },
]

export function LicenseTab({ getClient, address }: StoryTabProps) {
  // Attach license state
  const [attachLoading, setAttachLoading] = useState(false)
  const [attachResult, setAttachResult] = useState<LicenseResult | null>(null)
  const [ipIdForAttach, setIpIdForAttach] = useState('0x1234567890abcdef1234567890abcdef12345678')
  const [licenseType, setLicenseType] = useState<LicenseType>('non_commercial')
  const [mintingFee, setMintingFee] = useState('0.01')
  const [commercialRevShare, setCommercialRevShare] = useState('10')

  // Mint license state
  const [mintLoading, setMintLoading] = useState(false)
  const [mintResult, setMintResult] = useState<MintResult | null>(null)
  const [ipIdForMint, setIpIdForMint] = useState('0x1234567890abcdef1234567890abcdef12345678')
  const [licenseTermsIdForMint, setLicenseTermsIdForMint] = useState('1')
  const [mintAmount, setMintAmount] = useState('1')
  const [mintRecipient, setMintRecipient] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f1eB2a')

  // User's IP assets
  const [userAssets, setUserAssets] = useState<IPAsset[]>([])
  const [loadingAssets, setLoadingAssets] = useState(false)

  // Owned license tokens
  const { ownedTokens, loading: loadingTokens, refetch: refetchTokens } = useOwnedLicenseTokens(address)

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
          includeLicenses: true,
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

  const handleAttachLicense = async () => {
    const client = await getClient()
    if (!client) return

    if (!ipIdForAttach) {
      toast.error('Please enter an IP ID')
      return
    }

    setAttachLoading(true)
    setAttachResult(null)

    try {
      const response = await client.license.attachLicenseTerms({
        ipId: ipIdForAttach as Address,
        licenseTemplate: STORY_CONTRACTS.PIL_TEMPLATE,
        licenseTermsId:
          licenseType === 'non_commercial'
            ? PIL_TYPE.NON_COMMERCIAL_REMIX
            : licenseType === 'commercial_use'
              ? PIL_TYPE.COMMERCIAL_USE
              : PIL_TYPE.COMMERCIAL_REMIX,
      })

      setAttachResult({
        txHash: response.txHash,
        licenseTermsId: (response as any).licenseTermsId?.toString(),
      })
      toast.success('License terms attached successfully!')
      fetchUserAssets()
    } catch (error: any) {
      console.error('Failed to attach license:', error)
      toast.error(error.message || 'Failed to attach license terms')
    } finally {
      setAttachLoading(false)
    }
  }

  const handleMintLicense = async () => {
    const client = await getClient()
    if (!client) return

    if (!ipIdForMint || !licenseTermsIdForMint) {
      toast.error('Please enter IP ID and License Terms ID')
      return
    }

    setMintLoading(true)
    setMintResult(null)

    try {
      const response = await client.license.mintLicenseTokens({
        licensorIpId: ipIdForMint as Address,
        licenseTermsId: BigInt(licenseTermsIdForMint),
        amount: parseInt(mintAmount) || 1,
        receiver: (mintRecipient || address) as Address,
      })

      setMintResult({
        txHash: response.txHash,
        licenseTokenIds: response.licenseTokenIds?.map((id) => id.toString()),
      })
      toast.success('License tokens minted successfully!')
      refetchTokens()
    } catch (error: any) {
      console.error('Failed to mint license:', error)
      toast.error(error.message || 'Failed to mint license tokens')
    } finally {
      setMintLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Attach License Terms */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Attach License Terms
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Add PIL license terms to your IP Asset to define usage rights
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
                <Select value={ipIdForAttach} onValueChange={setIpIdForAttach}>
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
                <Input
                  placeholder="0x..."
                  value={ipIdForAttach}
                  onChange={(e) => setIpIdForAttach(e.target.value)}
                  className="mt-1.5"
                />
              )}
            </div>

            <div>
              <Label>License Type</Label>
              <Select value={licenseType} onValueChange={(v) => setLicenseType(v as LicenseType)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LICENSE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {licenseType !== 'non_commercial' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Minting Fee (WIP)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={mintingFee}
                    onChange={(e) => setMintingFee(e.target.value)}
                    className="mt-1.5"
                    step="0.01"
                    min="0"
                  />
                </div>
                {licenseType === 'commercial_remix' && (
                  <div>
                    <Label>Revenue Share (%)</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={commercialRevShare}
                      onChange={(e) => setCommercialRevShare(e.target.value)}
                      className="mt-1.5"
                      min="0"
                      max="100"
                    />
                  </div>
                )}
              </div>
            )}

            <Button onClick={handleAttachLicense} disabled={attachLoading} className="w-full">
              {attachLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Attaching...
                </>
              ) : (
                'Attach License Terms'
              )}
            </Button>

            {attachResult && (
              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                {attachResult.txHash && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transaction:</span>
                    <TxLink hash={attachResult.txHash} />
                  </div>
                )}
                {attachResult.licenseTermsId && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">License Terms ID:</span>
                    <Badge variant="secondary">#{attachResult.licenseTermsId}</Badge>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mint License Tokens */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Mint License Tokens
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Mint license tokens from an IP Asset to use or transfer
          </p>

          <div className="space-y-4">
            <div>
              <Label>IP Asset ID *</Label>
              <Input
                placeholder="0x..."
                value={ipIdForMint}
                onChange={(e) => setIpIdForMint(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div>
              <Label>License Terms ID *</Label>
              <Input
                placeholder="1"
                value={licenseTermsIdForMint}
                onChange={(e) => setLicenseTermsIdForMint(e.target.value)}
                className="mt-1.5"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="1"
                  value={mintAmount}
                  onChange={(e) => setMintAmount(e.target.value)}
                  className="mt-1.5"
                  min="1"
                />
              </div>
              <div>
                <Label>Recipient (optional)</Label>
                <Input
                  placeholder={address || '0x...'}
                  value={mintRecipient}
                  onChange={(e) => setMintRecipient(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>

            <Button onClick={handleMintLicense} disabled={mintLoading} className="w-full">
              {mintLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Minting...
                </>
              ) : (
                'Mint License Tokens'
              )}
            </Button>

            {mintResult && (
              <div className="mt-4 pt-4 border-t space-y-2 text-sm">
                {mintResult.txHash && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transaction:</span>
                    <TxLink hash={mintResult.txHash} />
                  </div>
                )}
                {mintResult.licenseTokenIds && mintResult.licenseTokenIds.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Token IDs:</span>
                    <div className="flex gap-1">
                      {mintResult.licenseTokenIds.map((id) => (
                        <Badge key={id} variant="secondary">
                          #{id}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Owned License Tokens */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your License Tokens ({ownedTokens.length})
          </h3>
          <Button variant="outline" size="sm" onClick={refetchTokens} disabled={loadingTokens}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingTokens ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loadingTokens ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : ownedTokens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No license tokens found</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ownedTokens.map((token) => (
              <div key={token.tokenId} className="rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">Token #{token.tokenId}</Badge>
                  {token.transferable && (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Transferable
                    </Badge>
                  )}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Licensor IP:</span>
                    <IpLink ipId={token.licensorIpId} />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Terms ID:</span>
                    <span>#{token.licenseTermsId}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default LicenseTab
