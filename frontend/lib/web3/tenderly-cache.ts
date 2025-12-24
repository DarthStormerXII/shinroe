/**
 * Tenderly simulation cache to prevent duplicate API calls
 * Caches simulation results based on transaction parameters
 */

import type { Address } from 'viem'
import type { SimulationResponse } from './tenderly'

interface CacheKey {
  from: Address
  to: Address
  input?: string
  value?: string
  network_id: number
  block_number?: number
}

interface CacheEntry {
  result: SimulationResponse
  timestamp: number
  expiresAt: number
}

class TenderlySimulationCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly CACHE_DURATION_MS = 60 * 1000 // 60 seconds cache

  /**
   * Generate a cache key from simulation parameters
   */
  private generateKey(params: CacheKey): string {
    // Create a deterministic key based on transaction parameters
    // Exclude block_number if it's close to current block (within 2 blocks)
    const keyParams = {
      from: params.from.toLowerCase(),
      to: params.to.toLowerCase(),
      input: params.input || '0x',
      value: params.value || '0x0',
      network_id: params.network_id,
    }
    
    return JSON.stringify(keyParams)
  }

  /**
   * Get cached simulation result if available
   */
  get(params: CacheKey): SimulationResponse | null {
    const key = this.generateKey(params)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if cache entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    console.log('Returning cached Tenderly simulation')
    return entry.result
  }

  /**
   * Store simulation result in cache
   */
  set(params: CacheKey, result: SimulationResponse): void {
    const key = this.generateKey(params)
    const now = Date.now()

    this.cache.set(key, {
      result,
      timestamp: now,
      expiresAt: now + this.CACHE_DURATION_MS,
    })

    console.log('Cached Tenderly simulation result')
  }

  /**
   * Clear expired entries from cache
   */
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }
}

// Create a singleton instance
export const tenderlyCache = new TenderlySimulationCache()

// Run cleanup every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    tenderlyCache.cleanup()
  }, 5 * 60 * 1000)
}