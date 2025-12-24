/**
 * Price utilities for fetching and caching cryptocurrency prices
 * Uses CoinGecko API (free tier: 30 calls/min, 10k calls/month)
 */

import { CHAIN_METADATA, COMMON_TOKENS } from './assets'

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'
const CACHE_DURATION = 60 * 1000 // 1 minute cache
const BATCH_SIZE = 50 // CoinGecko allows up to 100 IDs per request

interface PriceData {
  usd: number
  usd_24h_change?: number
  usd_market_cap?: number
  usd_24h_vol?: number
  last_updated_at?: number
}

interface CachedPrice {
  data: PriceData
  timestamp: number
}

// In-memory price cache
const priceCache = new Map<string, CachedPrice>()

/**
 * Get prices for multiple tokens by CoinGecko IDs
 */
export async function getTokenPrices(
  coingeckoIds: string[],
  includeMktData = false
): Promise<Record<string, PriceData>> {
  if (coingeckoIds.length === 0) return {}

  // Check cache first
  const now = Date.now()
  const uncachedIds: string[] = []
  const cachedPrices: Record<string, PriceData> = {}

  coingeckoIds.forEach(id => {
    const cached = priceCache.get(id)
    if (cached && now - cached.timestamp < CACHE_DURATION) {
      cachedPrices[id] = cached.data
    } else {
      uncachedIds.push(id)
    }
  })

  // If all prices are cached, return them
  if (uncachedIds.length === 0) {
    return cachedPrices
  }

  // Fetch uncached prices in batches
  const allPrices: Record<string, PriceData> = { ...cachedPrices }
  
  for (let i = 0; i < uncachedIds.length; i += BATCH_SIZE) {
    const batch = uncachedIds.slice(i, i + BATCH_SIZE)
    const ids = batch.join(',')
    
    try {
      const params = new URLSearchParams({
        ids,
        vs_currencies: 'usd',
        include_market_cap: includeMktData.toString(),
        include_24hr_vol: includeMktData.toString(),
        include_24hr_change: 'true',
        include_last_updated_at: 'true'
      })

      const response = await fetch(`${COINGECKO_API_URL}/simple/price?${params}`)
      
      if (!response.ok) {
        console.error('CoinGecko API error:', response.status)
        continue
      }

      const data = await response.json()
      
      // Process and cache the results
      Object.entries(data).forEach(([id, priceData]: [string, any]) => {
        const price: PriceData = {
          usd: priceData.usd || 0,
          usd_24h_change: priceData.usd_24h_change,
          usd_market_cap: priceData.usd_market_cap,
          usd_24h_vol: priceData.usd_24h_vol,
          last_updated_at: priceData.last_updated_at
        }
        
        allPrices[id] = price
        priceCache.set(id, { data: price, timestamp: now })
      })
    } catch (error) {
      console.error('Failed to fetch prices:', error)
    }
  }

  return allPrices
}

/**
 * Get price for a single token
 */
export async function getTokenPrice(coingeckoId: string): Promise<PriceData | null> {
  const prices = await getTokenPrices([coingeckoId])
  return prices[coingeckoId] || null
}

/**
 * Get native token price by chain ID
 */
export async function getNativeTokenPrice(chainId: number): Promise<PriceData | null> {
  const chain = CHAIN_METADATA[chainId]
  if (!chain?.coingeckoId) return null
  
  return getTokenPrice(chain.coingeckoId)
}

/**
 * Convert token amount to USD value
 */
export async function convertToUSD(
  amount: bigint,
  decimals: number,
  coingeckoId: string
): Promise<number | null> {
  const price = await getTokenPrice(coingeckoId)
  if (!price) return null

  // Convert from wei to token amount
  const tokenAmount = Number(amount) / Math.pow(10, decimals)
  return tokenAmount * price.usd
}

/**
 * Format USD value with appropriate decimal places
 */
export function formatPriceUSD(value: number | null | undefined): string {
  if (value === null || value === undefined) return '$0.00'
  
  // For very small values, show more decimals
  if (value < 0.01 && value > 0) {
    return `$${value.toFixed(6)}`
  }
  
  // For values under $1, show 4 decimals
  if (value < 1) {
    return `$${value.toFixed(4)}`
  }
  
  // For regular values, show 2 decimals
  return `$${value.toFixed(2)}`
}

/**
 * Format large USD values with abbreviations (K, M, B)
 */
export function formatLargeUSD(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`
  }
  return formatPriceUSD(value)
}

/**
 * Format percentage change
 */
export function formatPercentChange(change: number | undefined): string {
  if (change === undefined) return ''
  
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

/**
 * Get price change color
 */
export function getPriceColorClass(change: number | undefined): string {
  if (change === undefined) return 'text-muted-foreground'
  return change >= 0 ? 'text-green-500' : 'text-red-500'
}

/**
 * Batch fetch prices for multiple tokens with different chain IDs
 */
export async function getMultiChainTokenPrices(
  tokens: Array<{ address: string; chainId: number }>
): Promise<Record<string, PriceData>> {
  const coingeckoIds: string[] = []
  const addressToId: Record<string, string> = {}

  // Map token addresses to CoinGecko IDs
  tokens.forEach(({ address, chainId }) => {
    // Check if it's a common token
    const tokenData = Object.values(COMMON_TOKENS).find(
      token => (token.addresses as any)[chainId]?.toLowerCase() === address.toLowerCase()
    )
    
    if (tokenData?.coingeckoId) {
      coingeckoIds.push(tokenData.coingeckoId)
      addressToId[`${chainId}-${address.toLowerCase()}`] = tokenData.coingeckoId
    }
  })

  // Fetch all prices
  const prices = await getTokenPrices(coingeckoIds, true)
  
  // Map back to addresses
  const result: Record<string, PriceData> = {}
  tokens.forEach(({ address, chainId }) => {
    const key = `${chainId}-${address.toLowerCase()}`
    const coingeckoId = addressToId[key]
    if (coingeckoId && prices[coingeckoId]) {
      result[key] = prices[coingeckoId]
    }
  })

  return result
}

/**
 * Clear price cache
 */
export function clearPriceCache() {
  priceCache.clear()
}

/**
 * Get cache statistics
 */
export function getPriceCacheStats() {
  return {
    size: priceCache.size,
    entries: Array.from(priceCache.entries()).map(([id, cached]) => ({
      id,
      age: Date.now() - cached.timestamp,
      price: cached.data.usd
    }))
  }
}