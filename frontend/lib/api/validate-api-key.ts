// API Key validation for external dApp access
import { NextRequest } from 'next/server'

export interface ApiKeyValidation {
  valid: boolean
  error?: string
  rateLimit?: {
    remaining: number
    resetAt: number
  }
}

// In-memory rate limiting (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 100 // requests per window

/**
 * Validate API key from request headers
 * For MVP, accepts any valid-format key or skips for internal requests
 */
export function validateApiKey(request: NextRequest): ApiKeyValidation {
  const apiKey = request.headers.get('x-api-key')
  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')

  // Allow internal requests (same origin) without API key
  const isInternalRequest = !origin || origin.includes('localhost') ||
    (referer && referer.includes('localhost'))

  if (isInternalRequest && !apiKey) {
    return { valid: true }
  }

  // External requests require API key
  if (!apiKey) {
    return {
      valid: false,
      error: 'API key required. Include x-api-key header.'
    }
  }

  // Validate key format (should be 32+ chars alphanumeric)
  if (!isValidKeyFormat(apiKey)) {
    return {
      valid: false,
      error: 'Invalid API key format'
    }
  }

  // Check rate limit
  const rateLimit = checkRateLimit(apiKey)
  if (rateLimit.remaining === 0) {
    return {
      valid: false,
      error: 'Rate limit exceeded',
      rateLimit,
    }
  }

  return { valid: true, rateLimit }
}

/**
 * Validate API key format
 */
function isValidKeyFormat(key: string): boolean {
  // MVP: accept keys that are 32+ alphanumeric characters
  return /^[a-zA-Z0-9]{32,}$/.test(key)
}

/**
 * Check and update rate limit for an API key
 */
function checkRateLimit(apiKey: string): { remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(apiKey)

  if (!entry || now > entry.resetAt) {
    // Reset window
    const resetAt = now + RATE_LIMIT_WINDOW
    rateLimitMap.set(apiKey, { count: 1, resetAt })
    return { remaining: RATE_LIMIT_MAX - 1, resetAt }
  }

  entry.count++
  const remaining = Math.max(0, RATE_LIMIT_MAX - entry.count)
  return { remaining, resetAt: entry.resetAt }
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Create error response for API
 */
export function apiError(message: string, status: number) {
  return {
    error: message,
    timestamp: Date.now()
  }
}
