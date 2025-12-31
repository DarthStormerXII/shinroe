'use client'

import { useState, useCallback, useEffect } from 'react'
import { Loader2, FileText, Shield, FolderOpen, Send, Gavel, RefreshCw, AlertCircle, ExternalLink, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

import { STORY_EXPLORER, STORY_API_PROXY } from '@/constants/protocols/story'
import type { IPAsset, UserCollection, OwnedLicenseToken, DisputeData, TransactionData, MyAssetsTabProps } from '@/lib/types/story'
import { CopyButton, IpLink, TxLink } from '../shared'
import { formatTimestamp, getAssetDisplayName, getAssetImageUrl } from '@/lib/services/story-service'

type SubTab = 'assets' | 'licenses' | 'collections' | 'transactions' | 'disputes'

export function MyAssetsTab({ address }: MyAssetsTabProps) {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('assets')

  // Assets state
  const [assets, setAssets] = useState<IPAsset[]>([])
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [assetsError, setAssetsError] = useState<string | null>(null)

  // Licenses state
  const [licenses, setLicenses] = useState<OwnedLicenseToken[]>([])
  const [licensesLoading, setLicensesLoading] = useState(false)
  const [licensesError, setLicensesError] = useState<string | null>(null)

  // Collections state
  const [collections, setCollections] = useState<UserCollection[]>([])
  const [collectionsLoading, setCollectionsLoading] = useState(false)
  const [collectionsError, setCollectionsError] = useState<string | null>(null)

  // Transactions state
  const [transactions, setTransactions] = useState<TransactionData[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  const [transactionsError, setTransactionsError] = useState<string | null>(null)

  // Disputes state
  const [disputes, setDisputes] = useState<DisputeData[]>([])
  const [disputesLoading, setDisputesLoading] = useState(false)
  const [disputesError, setDisputesError] = useState<string | null>(null)

  // Fetch IP assets
  const fetchAssets = useCallback(async () => {
    if (!address) return
    setAssetsLoading(true)
    setAssetsError(null)
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
      if (!response.ok) throw new Error('Failed to fetch assets')
      const data = await response.json()
      setAssets(data.data || [])
    } catch (error: any) {
      setAssetsError(error.message)
    } finally {
      setAssetsLoading(false)
    }
  }, [address])

  // Fetch license tokens
  const fetchLicenses = useCallback(async () => {
    if (!address) return
    setLicensesLoading(true)
    setLicensesError(null)
    try {
      const response = await fetch(STORY_API_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: '/licenses/tokens',
          where: { ownerAddress: address },
          pagination: { limit: 100, offset: 0 },
        }),
      })
      if (!response.ok) throw new Error('Failed to fetch licenses')
      const data = await response.json()
      setLicenses(data.data || [])
    } catch (error: any) {
      setLicensesError(error.message)
    } finally {
      setLicensesLoading(false)
    }
  }, [address])

  // Fetch collections
  const fetchCollections = useCallback(async () => {
    if (assets.length === 0) {
      setCollections([])
      return
    }
    setCollectionsLoading(true)
    setCollectionsError(null)
    try {
      const collectionAddresses = [...new Set(assets.map((a) => a.tokenContract).filter(Boolean))]
      if (collectionAddresses.length === 0) {
        setCollections([])
        return
      }
      const response = await fetch(STORY_API_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: '/collections',
          where: { collectionAddresses },
          orderBy: 'assetCount',
          orderDirection: 'desc',
          pagination: { limit: 50, offset: 0 },
        }),
      })
      if (!response.ok) throw new Error('Failed to fetch collections')
      const data = await response.json()
      setCollections(data.data || [])
    } catch (error: any) {
      setCollectionsError(error.message)
    } finally {
      setCollectionsLoading(false)
    }
  }, [assets])

  // Fetch transactions
  const fetchTransactions = useCallback(async () => {
    if (!address) return
    setTransactionsLoading(true)
    setTransactionsError(null)
    try {
      const response = await fetch(STORY_API_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: '/transactions',
          where: { initiators: [address] },
          pagination: { limit: 100, offset: 0 },
        }),
      })
      if (!response.ok) throw new Error('Failed to fetch transactions')
      const data = await response.json()
      setTransactions(data.data || [])
    } catch (error: any) {
      setTransactionsError(error.message)
    } finally {
      setTransactionsLoading(false)
    }
  }, [address])

  // Fetch disputes
  const fetchDisputes = useCallback(async () => {
    if (!address) return
    setDisputesLoading(true)
    setDisputesError(null)
    try {
      const response = await fetch(STORY_API_PROXY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: '/disputes',
          where: { initiator: address },
          pagination: { limit: 100, offset: 0 },
        }),
      })
      if (!response.ok) throw new Error('Failed to fetch disputes')
      const data = await response.json()
      setDisputes(data.data || [])
    } catch (error: any) {
      setDisputesError(error.message)
    } finally {
      setDisputesLoading(false)
    }
  }, [address])

  // Initial fetch
  useEffect(() => {
    fetchAssets()
    fetchLicenses()
    fetchTransactions()
  }, [fetchAssets, fetchLicenses, fetchTransactions])

  // Fetch collections and disputes after assets load
  useEffect(() => {
    if (address) {
      fetchCollections()
      fetchDisputes()
    }
  }, [address, assets.length, fetchCollections, fetchDisputes])

  const refreshCurrentTab = () => {
    switch (activeSubTab) {
      case 'assets': fetchAssets(); break
      case 'licenses': fetchLicenses(); break
      case 'collections': fetchCollections(); break
      case 'transactions': fetchTransactions(); break
      case 'disputes': fetchDisputes(); break
    }
  }

  const isLoading =
    activeSubTab === 'assets' ? assetsLoading :
    activeSubTab === 'licenses' ? licensesLoading :
    activeSubTab === 'collections' ? collectionsLoading :
    activeSubTab === 'transactions' ? transactionsLoading :
    disputesLoading

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      IPRegistered: 'bg-green-500/10 text-green-500 border-green-500/20',
      LicenseTermsAttached: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      DerivativeRegistered: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      DisputeRaised: 'bg-red-500/10 text-red-500 border-red-500/20',
      RoyaltyPaid: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    }
    return colors[eventType] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'assets' as SubTab, icon: FileText, label: 'IP Assets', count: assets.length },
            { id: 'licenses' as SubTab, icon: Shield, label: 'Licenses', count: licenses.length },
            { id: 'collections' as SubTab, icon: FolderOpen, label: 'Collections', count: collections.length },
            { id: 'transactions' as SubTab, icon: Send, label: 'Transactions', count: transactions.length },
            { id: 'disputes' as SubTab, icon: Gavel, label: 'Disputes', count: disputes.length },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeSubTab === tab.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSubTab(tab.id)}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={refreshCurrentTab} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* IP Assets */}
      {activeSubTab === 'assets' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">My IP Assets</h3>
            <p className="text-sm text-muted-foreground">Your registered IP Assets</p>
          </div>

          {assetsError && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-500">{assetsError}</span>
              </div>
            </div>
          )}

          {assetsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : assets.length === 0 ? (
            <div className="text-center py-12 rounded-lg border bg-card">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">No IP Assets Found</h4>
              <p className="text-sm text-muted-foreground">Register an IP Asset in the Register IP tab</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset) => {
                const imageUrl = getAssetImageUrl(asset)
                const name = getAssetDisplayName(asset)
                return (
                  <div key={asset.ipId} className="rounded-lg border bg-card overflow-hidden">
                    {imageUrl ? (
                      <div className="aspect-square bg-muted">
                        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="font-medium truncate mb-2">{name}</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">IP ID:</span>
                          <div className="flex items-center gap-1">
                            <IpLink ipId={asset.ipId} />
                            <CopyButton text={asset.ipId} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Token ID:</span>
                          <span>{asset.tokenId}</span>
                        </div>
                        {asset.licenses && asset.licenses.length > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Licenses:</span>
                            <Badge className="bg-green-500/10 text-green-500">{asset.licenses.length}</Badge>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t">
                        <a href={`${STORY_EXPLORER}/ipa/${asset.ipId}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* License Tokens */}
      {activeSubTab === 'licenses' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">My License Tokens</h3>
            <p className="text-sm text-muted-foreground">License tokens you own</p>
          </div>

          {licensesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : licenses.length === 0 ? (
            <div className="text-center py-12 rounded-lg border bg-card">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">No License Tokens</h4>
              <p className="text-sm text-muted-foreground">Mint licenses in the License tab</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {licenses.map((license) => (
                <div key={license.tokenId} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline">Token #{license.tokenId}</Badge>
                    {license.transferable ? (
                      <Badge className="bg-green-500/10 text-green-500">Transferable</Badge>
                    ) : (
                      <Badge className="bg-yellow-500/10 text-yellow-500">Non-transferable</Badge>
                    )}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Licensor IP:</span>
                      <IpLink ipId={license.licensorIpId} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Terms ID:</span>
                      <span>#{license.licenseTermsId}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Collections */}
      {activeSubTab === 'collections' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">My Collections</h3>
            <p className="text-sm text-muted-foreground">Collections where you have IP Assets</p>
          </div>

          {collectionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-12 rounded-lg border bg-card">
              <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">No Collections</h4>
              <p className="text-sm text-muted-foreground">Register IP Assets to see collections</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {collections.map((col) => (
                <div key={col.collectionAddress} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium truncate">{col.collectionMetadata?.name || 'Collection'}</h4>
                    {col.collectionMetadata?.symbol && <Badge variant="outline">{col.collectionMetadata.symbol}</Badge>}
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Contract:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono">{col.collectionAddress.slice(0, 8)}...</span>
                        <CopyButton text={col.collectionAddress} />
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IP Assets:</span>
                      <Badge className="bg-blue-500/10 text-blue-500">{col.assetCount}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Transactions */}
      {activeSubTab === 'transactions' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">My Transactions</h3>
            <p className="text-sm text-muted-foreground">Your IP-related transactions</p>
          </div>

          {transactionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12 rounded-lg border bg-card">
              <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">No Transactions</h4>
              <p className="text-sm text-muted-foreground">Start using Story Protocol to see transactions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, i) => (
                <div key={`${tx.txHash}-${i}`} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getEventTypeColor(tx.eventType)}>{tx.eventType}</Badge>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(tx.blockTimestamp)}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transaction:</span>
                      <TxLink hash={tx.txHash} />
                    </div>
                    {tx.ipId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IP ID:</span>
                        <IpLink ipId={tx.ipId} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Disputes */}
      {activeSubTab === 'disputes' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Disputes</h3>
            <p className="text-sm text-muted-foreground">Disputes you&apos;ve raised or are involved in</p>
          </div>

          {disputesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : disputes.length === 0 ? (
            <div className="text-center py-12 rounded-lg border bg-card">
              <Gavel className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h4 className="text-lg font-medium mb-2">No Disputes</h4>
              <p className="text-sm text-muted-foreground">No active disputes found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="rounded-lg border bg-card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Dispute #{dispute.disputeId}</Badge>
                      <Badge className="bg-red-500/10 text-red-500">{dispute.targetTag}</Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(dispute.blockTimestamp)}</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target IP:</span>
                      <IpLink ipId={dispute.targetIpId} />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Initiator:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono">{dispute.initiator.slice(0, 8)}...</span>
                        <CopyButton text={dispute.initiator} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MyAssetsTab
