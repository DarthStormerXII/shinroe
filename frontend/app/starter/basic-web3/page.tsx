'use client'

import { useState, useEffect, useRef, useId, useMemo } from 'react'
import { useAccount, useBalance, useReadContract, useEnsName } from '@/lib/web3'
import { formatUnits, formatEther, createPublicClient, http } from 'viem'
import { AddressDisplay } from '@/components/web3/wallet/address-display'
import { AccountAvatar } from '@/components/web3/wallet/account-avatar'
import { TokenIcon } from '@/components/web3/tokens/token-display/token-icon'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getERC20Tokens, getERC721Tokens } from '@/constants/tokens'
import { getChainById, getSupportedChainList } from '@/lib/config/chains'
import { ERC20ABI, ERC721ABI } from '@/lib/web3/abis'
import { ExternalLink, ArrowUpRight, ArrowDownLeft, Loader2, Copy, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useOutsideClick } from '@/hooks/use-outside-click'
import { WepinSdkTests } from '@/components/web3/wepin/wepin-sdk-tests'

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timeStamp: string
  isError: string
  chainId?: number
  chainName?: string
  asset?: string
}

interface ChainBalance {
  chainId: number
  chainName: string
  balance: string
  symbol: string
  gasPrice: string
  iconUrl: string
}

interface NFTItem {
  address: `0x${string}`
  name: string
  symbol: string
  logoURI?: string
  chainId?: number
  chainName?: string
  balance: string
  explorerUrl?: string
}

// Alchemy network slugs for getAssetTransfers API
const ALCHEMY_NETWORKS: Record<number, string> = {
  1: 'eth-mainnet',
  11155111: 'eth-sepolia',
  137: 'polygon-mainnet',
  80002: 'polygon-amoy',
  42161: 'arb-mainnet',
  421614: 'arb-sepolia',
  10: 'opt-mainnet',
  11155420: 'opt-sepolia',
  8453: 'base-mainnet',
  84532: 'base-sepolia',
}

interface AlchemyTransfer {
  hash: string
  from: string
  to: string | null
  value: number | null
  asset: string | null
  category: string
  blockNum: string
  metadata?: { blockTimestamp?: string }
  rawContract?: {
    value: string | null
    address: string | null
    decimal: string | null
  }
}

async function fetchAlchemyTransactions(
  address: string,
  chainId: number,
  limit: number = 10
): Promise<Transaction[]> {
  const network = ALCHEMY_NETWORKS[chainId]
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY

  if (!network || !apiKey) return []

  const url = `https://${network}.g.alchemy.com/v2/${apiKey}`

  try {
    // Fetch both sent and received transactions
    const [sentRes, receivedRes] = await Promise.all([
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'alchemy_getAssetTransfers',
          params: [{
            fromAddress: address,
            category: ['external', 'erc20'],
            order: 'desc',
            maxCount: `0x${limit.toString(16)}`,
            withMetadata: true,
          }]
        })
      }),
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'alchemy_getAssetTransfers',
          params: [{
            toAddress: address,
            category: ['external', 'erc20'],
            order: 'desc',
            maxCount: `0x${limit.toString(16)}`,
            withMetadata: true,
          }]
        })
      })
    ])

    const [sentData, receivedData] = await Promise.all([sentRes.json(), receivedRes.json()])

    // Debug log to check response structure
    if (sentData.result?.transfers?.[0]) {
      console.log('Alchemy transfer sample:', sentData.result.transfers[0])
    }

    const transfers: AlchemyTransfer[] = [
      ...(sentData.result?.transfers || []),
      ...(receivedData.result?.transfers || [])
    ]

    // Convert to Transaction format and dedupe by hash
    const seen = new Set<string>()
    const transactions: Transaction[] = []

    for (const tx of transfers) {
      if (seen.has(tx.hash)) continue
      seen.add(tx.hash)

      // Parse timestamp from ISO string
      let timestamp = '0'
      if (tx.metadata?.blockTimestamp) {
        const date = new Date(tx.metadata.blockTimestamp)
        if (!isNaN(date.getTime())) {
          timestamp = Math.floor(date.getTime() / 1000).toString()
        }
      }

      // Alchemy returns `value` as a normalized number (e.g., 20 for 20 USDC)
      // Use value directly - it's already human-readable
      const displayValue = tx.value ?? 0

      // Get asset symbol - for external transfers it's the native currency
      const assetSymbol = tx.asset || (tx.category === 'external' ? 'ETH' : 'UNKNOWN')

      console.log(`TX ${tx.hash.slice(0, 10)}: value=${tx.value}, asset=${tx.asset}, category=${tx.category}`)

      transactions.push({
        hash: tx.hash,
        from: tx.from,
        to: tx.to || '',
        value: displayValue.toString(),
        timeStamp: timestamp,
        isError: '0',
        chainId,
        asset: assetSymbol,
      })
    }

    // Sort by timestamp descending
    transactions.sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp))

    return transactions.slice(0, limit)
  } catch (error) {
    console.error(`Failed to fetch transactions for chain ${chainId}:`, error)
    return []
  }
}

const CloseIcon = () => (
  <motion.svg
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0, transition: { duration: 0.05 } }}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4 text-black"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </motion.svg>
)

function CopyButton({ text, className = '' }: { text: string, className?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      onClick={handleCopy}
      className={`p-1 hover:bg-muted rounded transition-colors ${className}`}
      title="Copy address"
    >
      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />}
    </button>
  )
}

export default function BasicWeb3() {
  const { address, isConnected, chainId: connectedChainId, chain } = useAccount()

  const [multichain, setMultichain] = useState(false)
  const [chainBalances, setChainBalances] = useState<ChainBalance[]>([])
  const [multiChainTxs, setMultiChainTxs] = useState<Transaction[]>([])
  const [loadingBalances, setLoadingBalances] = useState(false)
  const [loadingTxs, setLoadingTxs] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [txLoading, setTxLoading] = useState(false)
  const [activeNFT, setActiveNFT] = useState<NFTItem | null>(null)
  const nftModalRef = useRef<HTMLDivElement>(null)
  const nftCardId = useId()

  const { balance: balanceValue, formatted: balanceFormatted, symbol: balanceSymbol, decimals: balanceDecimals } = useBalance({ address })
  const { ensName } = useEnsName({ address })

  const avatarUrl = address ? `https://api.dicebear.com/7.x/pixel-art/svg?seed=${address}` : undefined

  const chainId = connectedChainId || 11155111
  const chainConfig = getChainById(chainId)
  const supportedChains = useMemo(() => getSupportedChainList(), [])

  const erc20Tokens = getERC20Tokens(chainId)
  const erc721Tokens = getERC721Tokens(chainId)

  const allErc20Tokens = useMemo(() =>
    multichain
      ? supportedChains.flatMap(c => getERC20Tokens(c.chain.id).map(t => ({ ...t, chainId: c.chain.id, chainName: c.name })))
      : []
  , [multichain, supportedChains])

  const allErc721Tokens = useMemo(() =>
    multichain
      ? supportedChains.flatMap(c => getERC721Tokens(c.chain.id).map(t => ({ ...t, chainId: c.chain.id, chainName: c.name })))
      : []
  , [multichain, supportedChains])

  // Handle escape key and body scroll
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setActiveNFT(null)
    }
    if (activeNFT) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeNFT])

  useOutsideClick(nftModalRef, () => setActiveNFT(null))

  // Fetch balances for all chains
  useEffect(() => {
    async function fetchMultiChainData() {
      if (!multichain || !address) return
      setLoadingBalances(true)
      const balances: ChainBalance[] = []

      for (const cfg of supportedChains) {
        try {
          const client = createPublicClient({ chain: cfg.chain, transport: http(cfg.rpcUrl) })
          const [balanceWei, gasPriceWei] = await Promise.all([
            client.getBalance({ address: address as `0x${string}` }),
            client.getGasPrice(),
          ])
          balances.push({
            chainId: cfg.chain.id,
            chainName: cfg.name,
            balance: formatEther(balanceWei),
            symbol: cfg.chain.nativeCurrency.symbol,
            gasPrice: formatUnits(gasPriceWei, 9),
            iconUrl: cfg.iconUrl,
          })
        } catch (error) {
          console.error(`Failed to fetch data for ${cfg.name}:`, error)
        }
      }
      setChainBalances(balances)
      setLoadingBalances(false)
    }
    fetchMultiChainData()
  }, [multichain, address, supportedChains])

  // Fetch transactions for all chains using Alchemy
  useEffect(() => {
    async function fetchMultiChainTransactions() {
      if (!multichain || !address) return
      setLoadingTxs(true)

      const txPromises = supportedChains.map(async (cfg) => {
        const txs = await fetchAlchemyTransactions(address, cfg.chain.id, 5)
        return txs.map(tx => ({ ...tx, chainName: cfg.name }))
      })

      const results = await Promise.all(txPromises)
      const allTxs = results.flat()
      allTxs.sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp))
      setMultiChainTxs(allTxs.slice(0, 5))
      setLoadingTxs(false)
    }
    fetchMultiChainTransactions()
  }, [multichain, address, supportedChains])

  // Fetch single chain transactions using Alchemy
  useEffect(() => {
    async function fetchTransactions() {
      if (!address || !chainConfig || multichain) return
      setTxLoading(true)
      try {
        const txs = await fetchAlchemyTransactions(address, chainId, 10)
        setTransactions(txs)
      } catch (error) {
        console.error('Failed to fetch transactions:', error)
        setTransactions([])
      } finally {
        setTxLoading(false)
      }
    }
    fetchTransactions()
  }, [address, chainId, chainConfig, multichain])

  const formatGasPrice = (price: bigint | undefined) => {
    if (!price) return '0'
    return Number(formatUnits(price, 9)).toFixed(2)
  }

  const truncateAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`
  const formatTimestamp = (ts: string) => {
    const num = Number(ts)
    if (!num || num < 1000000000) return 'Unknown' // Invalid or before ~2001
    return new Date(num * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* NFT Expandable Card Modal */}
      <AnimatePresence>
        {activeNFT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 h-full w-full z-10"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {activeNFT && (
          <div className="fixed inset-0 grid place-items-center z-[100]">
            <motion.button
              key={`button-${activeNFT.address}-${nftCardId}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.05 } }}
              className="flex absolute top-2 right-2 lg:hidden items-center justify-center bg-white rounded-full h-6 w-6"
              onClick={() => setActiveNFT(null)}
            >
              <CloseIcon />
            </motion.button>
            <motion.div
              layoutId={`nft-card-${activeNFT.address}-${activeNFT.chainId || chainId}-${nftCardId}`}
              ref={nftModalRef}
              className="w-full max-w-[500px] h-full md:h-fit md:max-h-[90%] flex flex-col bg-white dark:bg-neutral-900 sm:rounded-3xl overflow-hidden"
            >
              <motion.div layoutId={`nft-image-${activeNFT.address}-${activeNFT.chainId || chainId}-${nftCardId}`}>
                <div className="w-full h-80 lg:h-80 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
                  <span className="text-8xl font-bold text-white/80">{activeNFT.symbol.slice(0, 2)}</span>
                </div>
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4">
                  <div>
                    <motion.h3
                      layoutId={`nft-title-${activeNFT.address}-${activeNFT.chainId || chainId}-${nftCardId}`}
                      className="font-bold text-neutral-700 dark:text-neutral-200 text-xl"
                    >
                      {activeNFT.name}
                    </motion.h3>
                    <motion.p
                      layoutId={`nft-symbol-${activeNFT.address}-${activeNFT.chainId || chainId}-${nftCardId}`}
                      className="text-neutral-600 dark:text-neutral-400"
                    >
                      {activeNFT.symbol}
                    </motion.p>
                  </div>
                  <motion.span
                    layoutId={`nft-balance-${activeNFT.address}-${activeNFT.chainId || chainId}-${nftCardId}`}
                    className="px-4 py-2 text-sm rounded-full font-bold bg-green-500 text-white"
                  >
                    {activeNFT.balance} Owned
                  </motion.span>
                </div>
                <div className="pt-4 relative px-4 pb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Contract</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono">{truncateAddress(activeNFT.address)}</span>
                        <CopyButton text={activeNFT.address} />
                        {activeNFT.explorerUrl && (
                          <a
                            href={`${activeNFT.explorerUrl}/token/${activeNFT.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-muted rounded transition-colors"
                            title="View on explorer"
                          >
                            <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </a>
                        )}
                      </div>
                    </div>
                    {activeNFT.chainName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Chain</span>
                        <span>{activeNFT.chainName}</span>
                      </div>
                    )}
                    {activeNFT.explorerUrl && (
                      <a
                        href={`${activeNFT.explorerUrl}/token/${activeNFT.address}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full mt-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View on Explorer
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Basic Web3</h1>
            <p className="text-lg text-muted-foreground">Test basic EVM integrations with WEPIN</p>
          </div>
          {isConnected && (
            <div className="flex items-center gap-2">
              <Label htmlFor="multichain" className="text-sm font-medium">Multichain</Label>
              <Switch id="multichain" checked={multichain} onCheckedChange={setMultichain} />
            </div>
          )}
        </div>

        {!isConnected ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
            <p className="text-muted-foreground mb-8">Please connect your wallet to interact with the components</p>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Wallet Card */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">Wallet</h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <AccountAvatar address={address!} ensAvatar={avatarUrl} size="lg" />
                    <AddressDisplay address={address!} ensName={ensName || undefined} chainId={chainId} showCopy={true} showExplorer={true} truncate={true} />
                  </div>
                  <div className="pt-3 border-t space-y-2">
                    {multichain ? (
                      loadingBalances ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading balances...
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {chainBalances.map((cb) => {
                            const cbChainConfig = getChainById(cb.chainId)
                            return (
                              <div key={cb.chainId} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <img src={cb.iconUrl} alt={cb.chainName} className="w-4 h-4 rounded-full" />
                                  <span className="text-muted-foreground">{cb.chainName}</span>
                                  {cbChainConfig?.explorerUrl && (
                                    <a
                                      href={`${cbChainConfig.explorerUrl}/address/${address}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-0.5 hover:bg-muted rounded transition-colors"
                                      title={`View on ${cb.chainName} explorer`}
                                    >
                                      <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </a>
                                  )}
                                </div>
                                <div className="text-right">
                                  <span className="font-semibold">{parseFloat(cb.balance).toFixed(4)} {cb.symbol}</span>
                                  <span className="text-muted-foreground ml-2">({parseFloat(cb.gasPrice).toFixed(1)} Gwei)</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Balance</span>
                          <span className="font-semibold">{parseFloat(balanceFormatted || '0').toFixed(4)} {balanceSymbol || 'ETH'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Network</span>
                          <span className="font-semibold">{chain?.name || chainConfig?.name || `Chain ${chainId}`}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ERC20 Tokens Card */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">ERC20 Tokens</h2>
                {multichain ? (
                  allErc20Tokens.length > 0 ? (
                    <ScrollArea className="h-48">
                      <div className="space-y-3 pr-3">
                        {allErc20Tokens.map((token) => (
                          <MultiChainERC20TokenRow key={`${token.chainId}-${token.address}`} token={token} userAddress={address} />
                        ))}
                      </div>
                    </ScrollArea>
                  ) : <p className="text-sm text-muted-foreground">No ERC20 tokens configured across chains.</p>
                ) : erc20Tokens.length > 0 ? (
                  <ScrollArea className="h-48">
                    <div className="space-y-3 pr-3">
                      {erc20Tokens.map((token) => <ERC20TokenRow key={token.address} token={token} userAddress={address} explorerUrl={chainConfig?.explorerUrl} />)}
                    </div>
                  </ScrollArea>
                ) : <p className="text-sm text-muted-foreground">No ERC20 tokens configured for this chain.</p>}
              </div>

              {/* ERC721 Collections Card - Expandable */}
              <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <h2 className="text-lg font-semibold mb-4">ERC721 Collections</h2>
                {multichain ? (
                  allErc721Tokens.length > 0 ? (
                    <ScrollArea className="h-48">
                      <div className="space-y-2 pr-3">
                        {allErc721Tokens.map((token) => (
                          <MultiChainERC721ExpandableRow
                            key={`${token.chainId}-${token.address}`}
                            token={token}
                            userAddress={address}
                            onSelect={setActiveNFT}
                            layoutId={nftCardId}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  ) : <p className="text-sm text-muted-foreground">No ERC721 collections configured across chains.</p>
                ) : erc721Tokens.length > 0 ? (
                  <ScrollArea className="h-48">
                    <div className="space-y-2 pr-3">
                      {erc721Tokens.map((token) => (
                        <ERC721ExpandableRow
                          key={token.address}
                          token={token}
                          userAddress={address}
                          chainId={chainId}
                          explorerUrl={chainConfig?.explorerUrl}
                          onSelect={setActiveNFT}
                          layoutId={nftCardId}
                        />
                      ))}
                    </div>
                  </ScrollArea>
                ) : <p className="text-sm text-muted-foreground">No ERC721 collections configured for this chain.</p>}
              </div>
            </div>

            {/* Transaction History */}
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold">Transaction History</h2>
                <p className="text-sm text-muted-foreground">
                  {multichain ? 'Recent transactions across all chains' : `Recent transactions on ${chainConfig?.name || 'this network'}`}
                </p>
              </div>
              <div className="divide-y">
                {(multichain ? loadingTxs : txLoading) ? (
                  <div className="p-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading transactions...</p>
                  </div>
                ) : (multichain ? multiChainTxs : transactions).length > 0 ? (
                  (multichain ? multiChainTxs : transactions).map((tx) => {
                    const isOutgoing = tx.from.toLowerCase() === address?.toLowerCase()
                    // Alchemy returns value in human-readable format, not wei
                    const displayValue = parseFloat(tx.value || '0')
                    const assetSymbol = tx.asset || 'ETH'
                    const txChainConfig = tx.chainId ? getChainById(tx.chainId) : chainConfig
                    const explorerUrl = txChainConfig?.explorerUrl

                    return (
                      <div key={`${tx.chainId || chainId}-${tx.hash}`} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${isOutgoing ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                              {isOutgoing ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{isOutgoing ? 'Sent' : 'Received'}</span>
                                {multichain && tx.chainName && <span className="text-xs px-1.5 py-0.5 bg-muted rounded">{tx.chainName}</span>}
                                {tx.isError === '1' && <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded">Failed</span>}
                              </div>
                              <p className="text-sm text-muted-foreground">{isOutgoing ? 'To: ' : 'From: '}{truncateAddress(isOutgoing ? tx.to : tx.from)}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${isOutgoing ? 'text-red-600' : 'text-green-600'}`}>
                              {isOutgoing ? '-' : '+'}{displayValue.toFixed(displayValue < 1 ? 6 : 4)} {assetSymbol}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{formatTimestamp(tx.timeStamp)}</span>
                              {explorerUrl && (
                                <a href={`${explorerUrl}/tx/${tx.hash}`} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="p-8 text-center"><p className="text-muted-foreground">No transactions found.</p></div>
                )}
              </div>
            </div>

            {/* WEPIN SDK Feature Tests */}
            <WepinSdkTests />
          </div>
        )}
      </div>
    </main>
  )
}

function ERC20TokenRow({ token, userAddress, explorerUrl }: { token: { address: `0x${string}`, name: string, symbol: string, decimals: number, logoURI?: string }, userAddress: string | undefined, explorerUrl?: string }) {
  const { data: balanceRaw } = useReadContract({ address: token.address, abi: ERC20ABI, functionName: 'balanceOf', args: userAddress ? [userAddress as `0x${string}`] : undefined })
  const balance = balanceRaw ? formatUnits(balanceRaw as bigint, token.decimals) : '0'
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <TokenIcon token={{ ...token, chainId: 1, logoURI: token.logoURI || '/images/token-placeholder.svg' }} size="sm" />
        <span className="font-medium">{token.symbol}</span>
        <CopyButton text={token.address} />
        {explorerUrl && (
          <a
            href={`${explorerUrl}/token/${token.address}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="View on explorer"
          >
            <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
          </a>
        )}
      </div>
      <span className="text-sm">{parseFloat(balance).toLocaleString()}</span>
    </div>
  )
}

function MultiChainERC20TokenRow({ token, userAddress }: { token: { address: `0x${string}`, name: string, symbol: string, decimals: number, logoURI?: string, chainId: number, chainName: string }, userAddress: string | undefined }) {
  const chainConfig = getChainById(token.chainId)
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function fetchBalance() {
      if (!userAddress || !chainConfig) {
        setLoading(false)
        return
      }
      setLoading(true)
      setHasError(false)
      try {
        const client = createPublicClient({ chain: chainConfig.chain, transport: http(chainConfig.rpcUrl) })
        const balanceRaw = await client.readContract({ address: token.address, abi: ERC20ABI, functionName: 'balanceOf', args: [userAddress as `0x${string}`] })
        setBalance(formatUnits(balanceRaw as bigint, token.decimals))
      } catch {
        setHasError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [userAddress, token, chainConfig])

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <TokenIcon token={{ ...token, logoURI: token.logoURI || '/images/token-placeholder.svg' }} size="sm" />
        <div className="flex items-center gap-1">
          <span className="font-medium">{token.symbol}</span>
          <span className="text-xs text-muted-foreground">({token.chainName})</span>
          <CopyButton text={token.address} />
          {chainConfig?.explorerUrl && (
            <a
              href={`${chainConfig.explorerUrl}/token/${token.address}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1 hover:bg-muted rounded transition-colors"
              title="View on explorer"
            >
              <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </a>
          )}
        </div>
      </div>
      <span className="text-sm">
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : hasError ? '--' : parseFloat(balance).toLocaleString()}
      </span>
    </div>
  )
}

// ERC721 Expandable Row (single chain)
function ERC721ExpandableRow({
  token,
  userAddress,
  chainId,
  explorerUrl,
  onSelect,
  layoutId
}: {
  token: { address: `0x${string}`, name: string, symbol: string, logoURI?: string }
  userAddress: string | undefined
  chainId: number
  explorerUrl?: string
  onSelect: (nft: NFTItem) => void
  layoutId: string
}) {
  const { data: balance } = useReadContract({ address: token.address, abi: ERC721ABI, functionName: 'balanceOf', args: userAddress ? [userAddress as `0x${string}`] : undefined })
  const balanceStr = balance ? Number(balance).toString() : '0'

  return (
    <motion.div
      layoutId={`nft-card-${token.address}-${chainId}-${layoutId}`}
      onClick={() => onSelect({ ...token, balance: balanceStr, explorerUrl })}
      className="p-3 flex items-center justify-between hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <motion.div
          layoutId={`nft-image-${token.address}-${chainId}-${layoutId}`}
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center"
        >
          <span className="text-sm font-bold text-white">{token.symbol.slice(0, 2)}</span>
        </motion.div>
        <div>
          <div className="flex items-center gap-1">
            <motion.p layoutId={`nft-title-${token.address}-${chainId}-${layoutId}`} className="font-medium text-sm">{token.name}</motion.p>
            <CopyButton text={token.address} />
            {explorerUrl && (
              <a
                href={`${explorerUrl}/token/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="View on explorer"
              >
                <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </a>
            )}
          </div>
          <motion.p layoutId={`nft-symbol-${token.address}-${chainId}-${layoutId}`} className="text-xs text-muted-foreground">{token.symbol}</motion.p>
        </div>
      </div>
      <motion.span
        layoutId={`nft-balance-${token.address}-${chainId}-${layoutId}`}
        className="text-xs px-2 py-1 bg-muted rounded-full font-medium"
      >
        {balanceStr} owned
      </motion.span>
    </motion.div>
  )
}

// ERC721 Expandable Row (multichain)
function MultiChainERC721ExpandableRow({
  token,
  userAddress,
  onSelect,
  layoutId
}: {
  token: { address: `0x${string}`, name: string, symbol: string, logoURI?: string, chainId: number, chainName: string }
  userAddress: string | undefined
  onSelect: (nft: NFTItem) => void
  layoutId: string
}) {
  const chainConfig = getChainById(token.chainId)
  const [balance, setBalance] = useState<string>('0')
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    async function fetchBalance() {
      if (!userAddress || !chainConfig) {
        setLoading(false)
        return
      }
      setLoading(true)
      setHasError(false)
      try {
        const client = createPublicClient({ chain: chainConfig.chain, transport: http(chainConfig.rpcUrl) })
        const balanceRaw = await client.readContract({ address: token.address, abi: ERC721ABI, functionName: 'balanceOf', args: [userAddress as `0x${string}`] })
        setBalance(Number(balanceRaw).toString())
      } catch {
        setHasError(true)
      } finally {
        setLoading(false)
      }
    }
    fetchBalance()
  }, [userAddress, token, chainConfig])

  return (
    <motion.div
      layoutId={`nft-card-${token.address}-${token.chainId}-${layoutId}`}
      onClick={() => onSelect({ ...token, balance, explorerUrl: chainConfig?.explorerUrl })}
      className="p-3 flex items-center justify-between hover:bg-muted/50 rounded-lg cursor-pointer transition-colors"
    >
      <div className="flex items-center gap-3">
        <motion.div
          layoutId={`nft-image-${token.address}-${token.chainId}-${layoutId}`}
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center"
        >
          <span className="text-sm font-bold text-white">{token.symbol.slice(0, 2)}</span>
        </motion.div>
        <div>
          <div className="flex items-center gap-1">
            <motion.p layoutId={`nft-title-${token.address}-${token.chainId}-${layoutId}`} className="font-medium text-sm">{token.name}</motion.p>
            <CopyButton text={token.address} />
            {chainConfig?.explorerUrl && (
              <a
                href={`${chainConfig.explorerUrl}/token/${token.address}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1 hover:bg-muted rounded transition-colors"
                title="View on explorer"
              >
                <ExternalLink className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </a>
            )}
          </div>
          <motion.p layoutId={`nft-symbol-${token.address}-${token.chainId}-${layoutId}`} className="text-xs text-muted-foreground">{token.symbol} <span className="text-muted-foreground">({token.chainName})</span></motion.p>
        </div>
      </div>
      <motion.span
        layoutId={`nft-balance-${token.address}-${token.chainId}-${layoutId}`}
        className="text-xs px-2 py-1 bg-muted rounded-full font-medium"
      >
        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : hasError ? '--' : `${balance} owned`}
      </motion.span>
    </motion.div>
  )
}
