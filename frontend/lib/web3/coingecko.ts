/**
 * CoinGecko API integration for fetching coin data and images
 */

interface CoinGeckoResponse {
  id: string
  symbol: string
  name: string
  image: {
    thumb: string
    small: string
    large: string
  }
  market_data?: {
    current_price?: {
      usd?: number
    }
    market_cap?: {
      usd?: number
    }
    price_change_percentage_24h?: number
  }
  description?: {
    en?: string
  }
}

interface CachedCoinData {
  data: CoinGeckoResponse
  timestamp: number
}

// Cache for API responses (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000
const coinCache = new Map<string, CachedCoinData>()

/**
 * Fetch coin data from CoinGecko API with caching
 */
export async function fetchCoinData(coinId: string): Promise<CoinGeckoResponse | null> {
  try {
    // Check cache first
    const cached = coinCache.get(coinId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    const response = await fetch(`/api/coingecko?coinId=${encodeURIComponent(coinId)}`)

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data: CoinGeckoResponse = await response.json()

    // Cache the response
    coinCache.set(coinId, {
      data,
      timestamp: Date.now()
    })

    return data
  } catch (error) {
    console.error(`Failed to fetch coin data for ${coinId}:`, error)
    return null
  }
}

/**
 * Get coin image URL from CoinGecko
 */
export async function getCoinImageUrl(
  coinId: string,
  size: 'thumb' | 'small' | 'large' = 'small'
): Promise<string | null> {
  try {
    const coinData = await fetchCoinData(coinId)
    return coinData?.image?.[size] || null
  } catch (error) {
    console.error(`Failed to get image for ${coinId}:`, error)
    return null
  }
}

/**
 * Get coin price from CoinGecko
 */
export async function getCoinPrice(coinId: string): Promise<number | null> {
  try {
    const coinData = await fetchCoinData(coinId)
    return coinData?.market_data?.current_price?.usd || null
  } catch (error) {
    console.error(`Failed to get price for ${coinId}:`, error)
    return null
  }
}

/**
 * Batch fetch multiple coins data
 */
export async function fetchMultipleCoinsData(coinIds: string[]): Promise<Record<string, CoinGeckoResponse | null>> {
  const promises = coinIds.map(async (coinId) => {
    const data = await fetchCoinData(coinId)
    return { coinId, data }
  })

  const results = await Promise.allSettled(promises)
  const coinDataMap: Record<string, CoinGeckoResponse | null> = {}

  results.forEach((result, index) => {
    const coinId = coinIds[index]
    if (result.status === 'fulfilled') {
      coinDataMap[coinId] = result.value.data
    } else {
      coinDataMap[coinId] = null
    }
  })

  return coinDataMap
}

/**
 * Get enhanced chain metadata with CoinGecko data
 */
export async function getEnhancedChainMetadata(chainId: number, coingeckoId?: string) {
  if (!coingeckoId) {
    return null
  }

  try {
    const coinData = await fetchCoinData(coingeckoId)
    if (!coinData) return null

    return {
      coinId: coingeckoId,
      name: coinData.name,
      symbol: coinData.symbol.toUpperCase(),
      image: coinData.image,
      price: coinData.market_data?.current_price?.usd,
      priceChange24h: coinData.market_data?.price_change_percentage_24h,
      marketCap: coinData.market_data?.market_cap?.usd,
      description: coinData.description?.en
    }
  } catch (error) {
    console.error(`Failed to get enhanced metadata for chain ${chainId}:`, error)
    return null
  }
}

/**
 * Get enhanced token metadata with CoinGecko data
 */
export async function getEnhancedTokenMetadata(tokenSymbol: string, coingeckoId: string) {
  try {
    const coinData = await fetchCoinData(coingeckoId)
    if (!coinData) return null

    return {
      coinId: coingeckoId,
      name: coinData.name,
      symbol: coinData.symbol.toUpperCase(),
      image: coinData.image,
      price: coinData.market_data?.current_price?.usd,
      priceChange24h: coinData.market_data?.price_change_percentage_24h,
      marketCap: coinData.market_data?.market_cap?.usd,
      description: coinData.description?.en
    }
  } catch (error) {
    console.error(`Failed to get enhanced metadata for token ${tokenSymbol}:`, error)
    return null
  }
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearCoinCache() {
  coinCache.clear()
}

/**
 * Get cache stats
 */
export function getCacheStats() {
  return {
    size: coinCache.size,
    keys: Array.from(coinCache.keys())
  }
}