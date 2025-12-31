'use client'

import { useState, useCallback } from 'react'
import { verychatService, type VeryChatUser, type VeryChatTokens } from '@/lib/services/verychat-service'

export interface UseVeryChatAuthReturn {
  // State
  isAuthenticated: boolean
  user: VeryChatUser | null
  isLoading: boolean
  error: string | null
  step: 'idle' | 'requesting' | 'verifying' | 'authenticated'

  // Actions
  requestCode: (handleId: string) => Promise<boolean>
  verifyCode: (handleId: string, code: number) => Promise<boolean>
  verifyAndGetTokens: (handleId: string, code: number) => Promise<VeryChatTokens | null>
  logout: () => void
  clearError: () => void

  // Token management
  accessToken: string | null
  refreshToken: string | null
  refreshSession: () => Promise<boolean>
  validateSession: () => Promise<boolean>

  // Config
  isConfigured: boolean
}

export function useVeryChatAuth(): UseVeryChatAuthReturn {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<VeryChatUser | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'idle' | 'requesting' | 'verifying' | 'authenticated'>('idle')
  const [currentHandleId, setCurrentHandleId] = useState<string | null>(null)

  const isConfigured = verychatService.isConfigured()

  const requestCode = useCallback(async (handleId: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    setStep('requesting')

    try {
      const result = await verychatService.requestVerificationCode(handleId)
      if (result.success) {
        setCurrentHandleId(handleId)
        setStep('verifying')
      } else {
        setError(result.message)
        setStep('idle')
      }
      return result.success
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request code')
      setStep('idle')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyCode = useCallback(async (handleId: string, code: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const isValid = await verychatService.verifyCode(handleId, code)
      if (!isValid) {
        setError('Invalid or expired verification code')
      }
      return isValid
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyAndGetTokens = useCallback(async (handleId: string, code: number): Promise<VeryChatTokens | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const tokens = await verychatService.getTokens(handleId, code)
      setAccessToken(tokens.accessToken)
      setRefreshToken(tokens.refreshToken)
      setUser(tokens.user)
      setIsAuthenticated(true)
      setStep('authenticated')
      return tokens
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to authenticate')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (!currentHandleId || !refreshToken) return false

    try {
      const tokens = await verychatService.refreshTokens(currentHandleId, refreshToken)
      setAccessToken(tokens.accessToken)
      setRefreshToken(tokens.refreshToken)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh session')
      return false
    }
  }, [currentHandleId, refreshToken])

  const validateSession = useCallback(async (): Promise<boolean> => {
    if (!accessToken) return false

    try {
      const result = await verychatService.validateToken(accessToken)
      if (!result.valid) {
        setIsAuthenticated(false)
      }
      return result.valid
    } catch {
      return false
    }
  }, [accessToken])

  const logout = useCallback(() => {
    setIsAuthenticated(false)
    setUser(null)
    setAccessToken(null)
    setRefreshToken(null)
    setCurrentHandleId(null)
    setStep('idle')
    setError(null)
  }, [])

  const clearError = useCallback(() => setError(null), [])

  return {
    isAuthenticated,
    user,
    isLoading,
    error,
    step,
    requestCode,
    verifyCode,
    verifyAndGetTokens,
    logout,
    clearError,
    accessToken,
    refreshToken,
    refreshSession,
    validateSession,
    isConfigured,
  }
}
