'use client'

import { useState, useEffect } from 'react'
import { getCoinImageUrl } from '@/lib/web3/coingecko'
import { getTokenLogoUrl, getChainLogoUrl } from '@/lib/web3/assets'

/**
 * Hook to fetch token image from CoinGecko API
 */
export function useTokenImage(
  tokenAddress?: string,
  chainId?: number,
  coingeckoId?: string,
  size: 'thumb' | 'small' | 'large' = 'small'
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!coingeckoId && (!tokenAddress || !chainId)) {
      // Fallback to static URL immediately if no data for API call
      const fallbackUrl = getTokenLogoUrl(tokenAddress, chainId, coingeckoId, 'standard')
      setImageUrl(fallbackUrl)
      return
    }

    async function fetchImage() {
      setIsLoading(true)
      setError(null)

      try {
        // Try CoinGecko API first
        if (coingeckoId) {
          const apiImageUrl = await getCoinImageUrl(coingeckoId, size)
          if (apiImageUrl) {
            setImageUrl(apiImageUrl)
            setIsLoading(false)
            return
          }
        }

        // Fallback to static URL
        const fallbackUrl = getTokenLogoUrl(tokenAddress, chainId, coingeckoId, 'standard')
        setImageUrl(fallbackUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch image')
        // Use fallback on error
        const fallbackUrl = getTokenLogoUrl(tokenAddress, chainId, coingeckoId, 'standard')
        setImageUrl(fallbackUrl)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImage()
  }, [tokenAddress, chainId, coingeckoId, size])

  return { imageUrl, isLoading, error }
}

/**
 * Hook to fetch chain image from CoinGecko API
 */
export function useChainImage(
  chainId?: number,
  coingeckoId?: string,
  size: 'thumb' | 'small' | 'large' = 'small'
) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!chainId) {
      setImageUrl(null)
      return
    }

    async function fetchImage() {
      setIsLoading(true)
      setError(null)

      try {
        // Try CoinGecko API first
        if (coingeckoId) {
          const apiImageUrl = await getCoinImageUrl(coingeckoId, size)
          if (apiImageUrl) {
            setImageUrl(apiImageUrl)
            setIsLoading(false)
            return
          }
        }

        // Fallback to static URL
        const fallbackUrl = chainId ? getChainLogoUrl(chainId) : null
        setImageUrl(fallbackUrl)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch image')
        // Use fallback on error
        const fallbackUrl = chainId ? getChainLogoUrl(chainId) : null
        setImageUrl(fallbackUrl)
      } finally {
        setIsLoading(false)
      }
    }

    fetchImage()
  }, [chainId, coingeckoId, size])

  return { imageUrl, isLoading, error }
}

/**
 * Hook to fetch multiple coin images in batch
 */
export function useMultipleCoinImages(
  coinIds: string[],
  size: 'thumb' | 'small' | 'large' = 'small'
) {
  const [images, setImages] = useState<Record<string, string | null>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (coinIds.length === 0) {
      setImages({})
      return
    }

    async function fetchImages() {
      setIsLoading(true)
      setError(null)

      try {
        const promises = coinIds.map(async (coinId) => {
          try {
            const imageUrl = await getCoinImageUrl(coinId, size)
            return { coinId, imageUrl }
          } catch (err) {
            console.error(`Failed to fetch image for ${coinId}:`, err)
            return { coinId, imageUrl: null }
          }
        })

        const results = await Promise.allSettled(promises)
        const imageMap: Record<string, string | null> = {}

        results.forEach((result, index) => {
          const coinId = coinIds[index]
          if (result.status === 'fulfilled') {
            imageMap[coinId] = result.value.imageUrl
          } else {
            imageMap[coinId] = null
          }
        })

        setImages(imageMap)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch images')
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [coinIds.join(','), size]) // Use join to create stable dependency

  return { images, isLoading, error }
}