'use client'

import { useState, useCallback, useEffect } from 'react'
import { Address, zeroAddress, parseEther } from 'viem'
import { StoryClient, PIL_TYPE } from '@story-protocol/core-sdk'
import {
  Loader2,
  Plus,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

import { STORY_EXPLORER, STORY_API_PROXY, IP_TYPES, type IPType } from '@/constants/protocols/story'
import type { UserCollection, RegistrationResult, StoryTabProps } from '@/lib/types/story'
import { CopyButton, TxLink, IpLink, MetadataBuilder } from '../shared'

// License type options for PIL
type LicenseType = 'non_commercial' | 'commercial_use' | 'commercial_remix'

const LICENSE_TYPES: { value: LicenseType; label: string; description: string }[] = [
  {
    value: 'non_commercial',
    label: 'Non-Commercial Social Remix',
    description: 'Others can remix non-commercially with attribution',
  },
  {
    value: 'commercial_use',
    label: 'Commercial Use',
    description: 'Commercial use allowed without derivatives',
  },
  {
    value: 'commercial_remix',
    label: 'Commercial Remix',
    description: 'Commercial use with derivatives and revenue share',
  },
]

interface CreateCollectionFormProps {
  getClient: () => Promise<StoryClient | null>
  onSuccess: (address: string) => void
}

function CreateCollectionForm({ getClient, onSuccess }: CreateCollectionFormProps) {
  const [loading, setLoading] = useState(false)
  const [collectionName, setCollectionName] = useState('')
  const [collectionSymbol, setCollectionSymbol] = useState('')

  const handleCreate = async () => {
    const client = await getClient()
    if (!client) return

    if (!collectionName || !collectionSymbol) {
      toast.error('Please fill in collection name and symbol')
      return
    }

    setLoading(true)
    try {
      const response = await client.nftClient.createNFTCollection({
        name: collectionName,
        symbol: collectionSymbol,
        isPublicMinting: true,
        mintOpen: true,
        mintFeeRecipient: zeroAddress,
        contractURI: '',
      })

      toast.success('NFT Collection created successfully!')
      onSuccess(response.spgNftContract as string)
      setCollectionName('')
      setCollectionSymbol('')
    } catch (error: any) {
      console.error('Failed to create collection:', error)
      toast.error(error.message || 'Failed to create NFT collection')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h4 className="font-medium mb-3">Create New SPG Collection</h4>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Collection Name</Label>
          <Input
            placeholder="My IP Collection"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Symbol</Label>
          <Input
            placeholder="MYIP"
            value={collectionSymbol}
            onChange={(e) => setCollectionSymbol(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>
      <Button onClick={handleCreate} disabled={loading} className="mt-3 w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Create Collection
          </>
        )}
      </Button>
    </div>
  )
}

export function RegisterIPTab({ getClient, address }: StoryTabProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RegistrationResult | null>(null)

  // Form state
  const [mode, setMode] = useState<'mint' | 'existing'>('mint')
  const [spgNftContract, setSpgNftContract] = useState('')
  const [nftContract, setNftContract] = useState('')
  const [tokenId, setTokenId] = useState('')

  // Metadata state
  const [ipMetadataUri, setIpMetadataUri] = useState('')
  const [nftMetadataUri, setNftMetadataUri] = useState('')
  const [ipImageUri, setIpImageUri] = useState('')
  const [ipMediaUri, setIpMediaUri] = useState('')

  // License state
  const [attachLicense, setAttachLicense] = useState(false)
  const [licenseType, setLicenseType] = useState<LicenseType>('non_commercial')
  const [mintingFee, setMintingFee] = useState('')
  const [commercialRevShare, setCommercialRevShare] = useState('10')

  // User collections
  const [userCollections, setUserCollections] = useState<UserCollection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string>('')
  const [loadingCollections, setLoadingCollections] = useState(false)

  // Fetch user collections
  const fetchCollections = useCallback(async () => {
    if (!address) return

    setLoadingCollections(true)
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
    } finally {
      setLoadingCollections(false)
    }
  }, [address])

  useEffect(() => {
    fetchCollections()
  }, [fetchCollections])

  const handleCollectionCreated = (address: string) => {
    setSpgNftContract(address)
    fetchCollections()
  }

  const handleCollectionSelect = (value: string) => {
    setSelectedCollection(value)
    if (value !== 'manual') {
      setSpgNftContract(value)
    } else {
      setSpgNftContract('')
    }
  }

  const handleRegister = async () => {
    const client = await getClient()
    if (!client) return

    // Validation
    if (mode === 'mint' && !spgNftContract) {
      toast.error('Please select or enter an SPG NFT collection')
      return
    }
    if (mode === 'existing' && (!nftContract || !tokenId)) {
      toast.error('Please enter NFT contract and token ID')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      let response: any

      // Build license terms if attaching
      const licenseTerms = attachLicense
        ? {
            terms: {
              transferable: true,
              royaltyPolicy: '0xBe54FB168b3c982b7AaE60dB6CF75Bd8447b390E' as Address,
              defaultMintingFee: mintingFee ? parseEther(mintingFee) : 0n,
              expiration: 0n,
              commercialUse: licenseType !== 'non_commercial',
              commercialAttribution: true,
              commercializerChecker: zeroAddress,
              commercializerCheckerData: '0x' as `0x${string}`,
              commercialRevShare: licenseType === 'commercial_remix' ? parseInt(commercialRevShare) * 1_000_000 : 0,
              commercialRevCeiling: 0n,
              derivativesAllowed: licenseType !== 'commercial_use',
              derivativesAttribution: true,
              derivativesApproval: false,
              derivativesReciprocal: licenseType === 'commercial_remix',
              derivativeRevCeiling: 0n,
              currency: '0x1514000000000000000000000000000000000000' as Address,
              uri: '',
            },
          }
        : undefined

      if (mode === 'mint') {
        // Mint and register in one transaction
        if (attachLicense && licenseTerms) {
          response = await (client.ipAsset as any).mintAndRegisterIpAssetWithPilTerms({
            spgNftContract: spgNftContract as Address,
            pilType: PIL_TYPE.NON_COMMERCIAL_REMIX, // Base type, terms override
            ipMetadata: {
              ipMetadataURI: ipMetadataUri || '',
              ipMetadataHash: zeroAddress,
              nftMetadataURI: nftMetadataUri || '',
              nftMetadataHash: zeroAddress,
            },
            ...licenseTerms,
          })
        } else {
          response = await client.ipAsset.mintAndRegisterIp({
            spgNftContract: spgNftContract as Address,
            ipMetadata: {
              ipMetadataURI: ipMetadataUri || '',
              ipMetadataHash: zeroAddress,
              nftMetadataURI: nftMetadataUri || '',
              nftMetadataHash: zeroAddress,
            },
          })
        }
      } else {
        // Register existing NFT
        if (attachLicense && licenseTerms) {
          response = await (client.ipAsset as any).registerIpAndAttachPilTerms({
            nftContract: nftContract as Address,
            tokenId: BigInt(tokenId),
            pilType: PIL_TYPE.NON_COMMERCIAL_REMIX,
            ipMetadata: {
              ipMetadataURI: ipMetadataUri || '',
              ipMetadataHash: zeroAddress,
              nftMetadataURI: nftMetadataUri || '',
              nftMetadataHash: zeroAddress,
            },
            ...licenseTerms,
          })
        } else {
          response = await client.ipAsset.register({
            nftContract: nftContract as Address,
            tokenId: BigInt(tokenId),
            ipMetadata: {
              ipMetadataURI: ipMetadataUri || '',
              ipMetadataHash: zeroAddress,
              nftMetadataURI: nftMetadataUri || '',
              nftMetadataHash: zeroAddress,
            },
          })
        }
      }

      setResult({
        txHash: response.txHash,
        ipId: response.ipId,
        tokenId: response.tokenId?.toString(),
        licenseTermsIds: response.licenseTermsIds?.map((id: bigint) => id.toString()),
      })

      toast.success('IP Asset registered successfully!')
    } catch (error: any) {
      console.error('Failed to register IP:', error)
      toast.error(error.message || 'Failed to register IP Asset')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Registration Mode */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Registration Mode</h3>
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'mint' | 'existing')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mint">
              <Plus className="h-4 w-4 mr-2" />
              Mint New NFT
            </TabsTrigger>
            <TabsTrigger value="existing">
              <FileText className="h-4 w-4 mr-2" />
              Existing NFT
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mint" className="mt-4 space-y-4">
            <div>
              <Label>SPG NFT Collection *</Label>
              {userCollections.length > 0 ? (
                <Select value={selectedCollection} onValueChange={handleCollectionSelect}>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                  <SelectContent>
                    {userCollections.map((col) => (
                      <SelectItem key={col.collectionAddress} value={col.collectionAddress}>
                        {col.collectionMetadata?.name || col.collectionAddress.slice(0, 10) + '...'}
                        {col.collectionMetadata?.symbol && ` (${col.collectionMetadata.symbol})`}
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

            <CreateCollectionForm getClient={getClient} onSuccess={handleCollectionCreated} />
          </TabsContent>

          <TabsContent value="existing" className="mt-4 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>NFT Contract Address *</Label>
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
          </TabsContent>
        </Tabs>
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

      {/* License Terms */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">License Terms</h3>
            <p className="text-sm text-muted-foreground">
              Attach PIL license terms to your IP
            </p>
          </div>
          <Switch checked={attachLicense} onCheckedChange={setAttachLicense} />
        </div>

        {attachLicense && (
          <div className="space-y-4">
            <div>
              <Label>License Type</Label>
              <Select value={licenseType} onValueChange={(v) => setLicenseType(v as LicenseType)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LICENSE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
                <p className="text-xs text-muted-foreground mt-1">
                  Fee for others to mint license tokens
                </p>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    % of derivative revenue you receive
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Register Button */}
      <Button onClick={handleRegister} disabled={loading} className="w-full" size="lg">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Registering IP Asset...
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Register IP Asset
          </>
        )}
      </Button>

      {/* Result */}
      {result && (
        <div className="rounded-lg border bg-card p-6">
          <h4 className="font-semibold mb-4 flex items-center gap-2 text-green-600 dark:text-green-400">
            <CheckCircle className="h-5 w-5" />
            Registration Successful!
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
                <span className="text-muted-foreground">IP Asset ID:</span>
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
            {result.licenseTermsIds && result.licenseTermsIds.length > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">License Terms:</span>
                <div className="flex gap-1">
                  {result.licenseTermsIds.map((id) => (
                    <Badge key={id} variant="secondary">
                      #{id}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default RegisterIPTab
