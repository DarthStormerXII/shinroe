'use client'

import { useState, useCallback, useEffect } from 'react'
import { Address, zeroAddress, parseEther } from 'viem'
import { StoryClient } from '@story-protocol/core-sdk'
import { Loader2, GitBranch, Plus, Trash2, Search, Coins, ExternalLink, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

import { STORY_EXPLORER, STORY_API_PROXY } from '@/constants/protocols/story'
import type { IPAsset, UserCollection, RegistrationResult, StoryTabProps, OwnedLicenseToken } from '@/lib/types/story'
import { useOwnedLicenseTokens } from '@/hooks/protocols/story'
import { CopyButton, TxLink, IpLink, MetadataBuilder } from '../shared'
import { getAssetDisplayName, getLicenseTypeLabel } from '@/lib/services/story-service'

interface ParentIPA extends IPAsset {
  licenses?: Array<{
    licenseTermsId: string
    terms?: {
      commercialUse?: boolean
      derivativesAllowed?: boolean
      commercialRevShare?: number
      defaultMintingFee?: string
      transferable?: boolean
      uri?: string
    }
  }>
}

export function DerivativeTab({ getClient, address }: StoryTabProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RegistrationResult | null>(null)

  // Parent IP state
  const [parentIpIdInput, setParentIpIdInput] = useState('')
  const [searchingParent, setSearchingParent] = useState(false)
  const [selectedParentIPAs, setSelectedParentIPAs] = useState<ParentIPA[]>([])
  const [parentLicenseSelections, setParentLicenseSelections] = useState<Record<string, string>>({})

  // Registration mode
  const [mode, setMode] = useState<'mint' | 'existing'>('mint')
  const [spgNftContract, setSpgNftContract] = useState('')
  const [nftContract, setNftContract] = useState('')
  const [tokenId, setTokenId] = useState('')

  // Metadata
  const [ipMetadataUri, setIpMetadataUri] = useState('')
  const [nftMetadataUri, setNftMetadataUri] = useState('')
  const [ipImageUri, setIpImageUri] = useState('')
  const [ipMediaUri, setIpMediaUri] = useState('')

  // User collections
  const [userCollections, setUserCollections] = useState<UserCollection[]>([])
  const [selectedCollection, setSelectedCollection] = useState('')

  // Owned license tokens (for using instead of minting)
  const { ownedTokens } = useOwnedLicenseTokens(address)
  const [selectedTokensForParents, setSelectedTokensForParents] = useState<Record<string, string>>({})

  // Fetch user collections
  const fetchCollections = useCallback(async () => {
    if (!address) return

    try {
      const response = await fetch(STORY_API_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: '/collections',
          orderBy: 'updatedAt',
          orderDirection: 'desc',
          pagination: { limit: 50, offset: 0 },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setUserCollections(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch collections:', error)
    }
  }, [address])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const handleSearchParent = async () => {
    if (!parentIpIdInput.trim()) {
      toast.error('Please enter a parent IP ID')
      return
    }

    if (selectedParentIPAs.some((p) => p.ipId.toLowerCase() === parentIpIdInput.toLowerCase())) {
      toast.error('This parent IP is already added')
      return
    }

    setSearchingParent(true)
    try {
      const response = await fetch(STORY_API_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: '/assets',
          where: { ipId: parentIpIdInput },
          includeLicenses: true,
          pagination: { limit: 1, offset: 0 },
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch IP')

      const data = await response.json()
      if (!data.data || data.data.length === 0) {
        toast.error('IP Asset not found')
        return
      }

      const ipa = data.data[0] as ParentIPA
      const derivableLicenses = ipa.licenses?.filter((l) => l.terms?.derivativesAllowed) || []

      if (derivableLicenses.length === 0) {
        toast.error('This IP has no licenses that allow derivatives')
        return
      }

      setSelectedParentIPAs([...selectedParentIPAs, ipa])
      setParentIpIdInput('')
      toast.success('Parent IP added!')
    } catch (error: any) {
      console.error('Failed to fetch parent IP:', error)
      toast.error(error.message || 'Failed to fetch parent IP')
    } finally {
      setSearchingParent(false)
    }
  }

  const removeParentIPA = (ipId: string) => {
    setSelectedParentIPAs(selectedParentIPAs.filter((p) => p.ipId !== ipId))
    const newSelections = { ...parentLicenseSelections }
    delete newSelections[ipId]
    setParentLicenseSelections(newSelections)
    const newTokenSelections = { ...selectedTokensForParents }
    delete newTokenSelections[ipId]
    setSelectedTokensForParents(newTokenSelections)
  }

  const handleCollectionSelect = (value: string) => {
    setSelectedCollection(value)
    if (value !== 'manual') {
      setSpgNftContract(value)
    } else {
      setSpgNftContract('')
    }
  }

  // Calculate total cost
  const calculateTotalCost = () => {
    let totalFee = 0n
    const feeBreakdown: Array<{
      parentIpId: string
      licenseTermsId: string
      fee: bigint
      usesToken: boolean
      tokenId?: string
    }> = []

    for (const parent of selectedParentIPAs) {
      const selectedLicenseId = parentLicenseSelections[parent.ipId]
      if (!selectedLicenseId) continue

      const license = parent.licenses?.find((l) => l.licenseTermsId === selectedLicenseId)
      const selectedToken = selectedTokensForParents[parent.ipId]

      if (selectedToken) {
        feeBreakdown.push({
          parentIpId: parent.ipId,
          licenseTermsId: selectedLicenseId,
          fee: 0n,
          usesToken: true,
          tokenId: selectedToken,
        })
      } else {
        const fee = license?.terms?.defaultMintingFee ? BigInt(license.terms.defaultMintingFee) : 0n
        totalFee += fee
        feeBreakdown.push({
          parentIpId: parent.ipId,
          licenseTermsId: selectedLicenseId,
          fee,
          usesToken: false,
        })
      }
    }

    return { totalFee, feeBreakdown }
  }

  const handleRegisterDerivative = async () => {
    const client = await getClient()
    if (!client) return

    if (selectedParentIPAs.length === 0) {
      toast.error('Please add at least one parent IP')
      return
    }

    if (!selectedParentIPAs.every((p) => parentLicenseSelections[p.ipId])) {
      toast.error('Please select a license for each parent IP')
      return
    }

    if (mode === 'mint' && !spgNftContract) {
      toast.error('Please select or enter an NFT collection')
      return
    }

    if (mode === 'existing' && (!nftContract || !tokenId)) {
      toast.error('Please enter NFT contract and token ID')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const parentIpIds = selectedParentIPAs.map((p) => p.ipId as Address)
      const licenseTermsIds = selectedParentIPAs.map((p) => parentLicenseSelections[p.ipId])

      // Check if using license tokens
      const licenseTokenIds: bigint[] = []
      for (const parent of selectedParentIPAs) {
        const tokenId = selectedTokensForParents[parent.ipId]
        if (tokenId) {
          licenseTokenIds.push(BigInt(tokenId))
        } else {
          licenseTokenIds.push(0n) // 0 means mint new
        }
      }

      let response: any

      // Convert string license terms IDs to bigint
      const licenseTermsIdsBigInt = licenseTermsIds.map(id => BigInt(id))

      if (mode === 'mint') {
        response = await client.ipAsset.mintAndRegisterIpAndMakeDerivative({
          spgNftContract: spgNftContract as Address,
          derivData: {
            parentIpIds,
            licenseTermsIds: licenseTermsIdsBigInt,
            licenseTemplate: '0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316' as Address,
          },
          ipMetadata: {
            ipMetadataURI: ipMetadataUri || '',
            ipMetadataHash: zeroAddress,
            nftMetadataURI: nftMetadataUri || '',
            nftMetadataHash: zeroAddress,
          },
        })
      } else {
        response = await client.ipAsset.registerDerivative({
          childIpId: nftContract as Address, // This is actually the child IP ID after registration
          parentIpIds,
          licenseTermsIds: licenseTermsIdsBigInt,
          licenseTemplate: '0x2E896b0b2Fdb7457499B56AAaA4AE55BCB4Cd316' as Address,
        })
      }

      setResult({
        txHash: response.txHash,
        ipId: response.ipId,
        tokenId: response.tokenId?.toString(),
      })

      toast.success('Derivative IP registered successfully!')
    } catch (error: any) {
      console.error('Failed to register derivative:', error)
      toast.error(error.message || 'Failed to register derivative')
    } finally {
      setLoading(false)
    }
  }

  const { totalFee, feeBreakdown } = calculateTotalCost()

  return (
    <div className="space-y-6">
      {/* Parent IP Selection */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Select Parent IPs
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Add parent IPs to create a derivative work
        </p>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Enter parent IP ID (0x...)"
            value={parentIpIdInput}
            onChange={(e) => setParentIpIdInput(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSearchParent} disabled={searchingParent}>
            {searchingParent ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Add
              </>
            )}
          </Button>
        </div>

        {selectedParentIPAs.length > 0 ? (
          <div className="space-y-4">
            {selectedParentIPAs.map((parent, index) => (
              <div key={parent.ipId} className="rounded-lg border p-4 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Parent {index + 1}</Badge>
                    <IpLink ipId={parent.ipId} />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeParentIPA(parent.ipId)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {parent.nftMetadata?.name && (
                  <p className="text-sm font-medium mb-2">{parent.nftMetadata.name}</p>
                )}

                <div>
                  <Label className="text-xs">Select License *</Label>
                  <Select
                    value={parentLicenseSelections[parent.ipId] || ''}
                    onValueChange={(v) =>
                      setParentLicenseSelections({ ...parentLicenseSelections, [parent.ipId]: v })
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Choose license terms" />
                    </SelectTrigger>
                    <SelectContent>
                      {parent.licenses
                        ?.filter((l) => l.terms?.derivativesAllowed)
                        .map((license) => (
                          <SelectItem key={license.licenseTermsId} value={license.licenseTermsId}>
                            <div className="flex items-center gap-2">
                              <span>License #{license.licenseTermsId}</span>
                              <span className="text-xs text-muted-foreground">
                                ({getLicenseTypeLabel(license.terms)})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* License token selection */}
                {parentLicenseSelections[parent.ipId] && (
                  <div className="mt-2">
                    {ownedTokens.filter(
                      (t) =>
                        t.licensorIpId.toLowerCase() === parent.ipId.toLowerCase() &&
                        t.licenseTermsId === parentLicenseSelections[parent.ipId]
                    ).length > 0 ? (
                      <div>
                        <Label className="text-xs">Use License Token (optional)</Label>
                        <Select
                          value={selectedTokensForParents[parent.ipId] || ''}
                          onValueChange={(v) =>
                            setSelectedTokensForParents({
                              ...selectedTokensForParents,
                              [parent.ipId]: v,
                            })
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Mint new (pay fee)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Mint new (pay fee)</SelectItem>
                            {ownedTokens
                              .filter(
                                (t) =>
                                  t.licensorIpId.toLowerCase() === parent.ipId.toLowerCase() &&
                                  t.licenseTermsId === parentLicenseSelections[parent.ipId]
                              )
                              .map((token) => (
                                <SelectItem key={token.tokenId} value={token.tokenId}>
                                  Token #{token.tokenId} (FREE)
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <GitBranch className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No parent IPs added yet</p>
          </div>
        )}
      </div>

      {/* Metadata Builder */}
      <MetadataBuilder
        ipMetadataUri={ipMetadataUri}
        setIpMetadataUri={setIpMetadataUri}
        nftMetadataUri={nftMetadataUri}
        setNftMetadataUri={setNftMetadataUri}
        ipImageUri={ipImageUri}
        setIpImageUri={setIpImageUri}
        ipMediaUri={ipMediaUri}
        setIpMediaUri={setIpMediaUri}
      />

      {/* Cost Breakdown */}
      {selectedParentIPAs.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Coins className="h-5 w-5" />
            Cost Breakdown
          </h3>
          <div className="space-y-2">
            {feeBreakdown.map((item) => (
              <div key={item.parentIpId} className="flex items-center justify-between text-sm">
                <span className="font-mono text-xs">
                  {item.parentIpId.slice(0, 8)}...{item.parentIpId.slice(-6)}
                </span>
                {item.usesToken ? (
                  <Badge className="bg-green-600">FREE (Token #{item.tokenId})</Badge>
                ) : (
                  <span>{item.fee > 0n ? `${Number(item.fee) / 1e18} WIP` : 'Free'}</span>
                )}
              </div>
            ))}
            <div className="pt-3 border-t flex items-center justify-between font-semibold">
              <span>Total Cost:</span>
              <span>{totalFee > 0n ? `${Number(totalFee) / 1e18} WIP` : 'Free'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Registration Options */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Registration Options</h3>

        <div className="flex items-center gap-4 mb-4">
          <Label>Mode:</Label>
          <div className="flex items-center gap-2">
            <Switch checked={mode === 'existing'} onCheckedChange={(c) => setMode(c ? 'existing' : 'mint')} />
            <span className="text-sm">{mode === 'mint' ? 'Mint New NFT' : 'Existing NFT'}</span>
          </div>
        </div>

        {mode === 'mint' ? (
          <div>
            <Label>SPG NFT Collection *</Label>
            {userCollections.length > 0 ? (
              <Select value={selectedCollection} onValueChange={handleCollectionSelect}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select collection" />
                </SelectTrigger>
                <SelectContent>
                  {userCollections.map((col) => (
                    <SelectItem key={col.collectionAddress} value={col.collectionAddress}>
                      {col.collectionMetadata?.name || col.collectionAddress.slice(0, 10) + '...'}
                    </SelectItem>
                  ))}
                  <SelectItem value="manual">Enter manually...</SelectItem>
                </SelectContent>
              </Select>
            ) : null}
            {(userCollections.length === 0 || selectedCollection === 'manual') && (
              <Input
                placeholder="0x..."
                value={spgNftContract}
                onChange={(e) => setSpgNftContract(e.target.value)}
                className="mt-1.5"
              />
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>NFT Contract *</Label>
              <Input
                placeholder="0x..."
                value={nftContract}
                onChange={(e) => setNftContract(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label>Token ID *</Label>
              <Input
                placeholder="1"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
        )}
      </div>

      {/* Register Button */}
      <Button
        onClick={handleRegisterDerivative}
        disabled={loading || selectedParentIPAs.length === 0}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering Derivative...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Register Derivative IP
            {selectedParentIPAs.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {selectedParentIPAs.length} Parent{selectedParentIPAs.length > 1 ? 's' : ''}
              </Badge>
            )}
          </>
        )}
      </Button>

      {/* Result */}
      {result && (
        <div className="rounded-lg border bg-card p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            Derivative Registered!
          </h4>
          <div className="space-y-3 text-sm">
            {result.txHash && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transaction:</span>
                <TxLink hash={result.txHash} />
              </div>
            )}
            {result.ipId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Derivative IP:</span>
                <div className="flex items-center gap-1">
                  <IpLink ipId={result.ipId} />
                  <CopyButton text={result.ipId} />
                </div>
              </div>
            )}
            {result.tokenId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Token ID:</span>
                <span>{result.tokenId}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DerivativeTab
