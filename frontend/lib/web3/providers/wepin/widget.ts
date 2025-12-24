/**
 * WEPIN Widget SDK Hooks
 *
 * Provides hooks for WEPIN Widget SDK features like openWidget, closeWidget,
 * getAccounts, send, receive, getNFTs, and user management.
 */

'use client'

import { createContext, useContext, useCallback, useState } from 'react'
import type { WepinSDK } from '@wepin/sdk-js'

// =============================================================================
// Types
// =============================================================================

export interface WepinAccount {
  address: string
  network: string
  contract?: string
}

export interface WepinBalance {
  symbol: string
  balance: string
  tokens?: Array<{
    symbol: string
    balance: string
    contract: string
  }>
}

export interface WepinNFT {
  contract: string
  name: string
  symbol: string
  tokenId: string
  description?: string
  imageUrl?: string
  network: string
}

export interface WepinUserInfo {
  userId: string
  email: string
  provider: 'google' | 'apple' | 'naver' | 'discord' | 'email' | 'external_token'
  use2FA: boolean
}

export interface WepinUserStatus {
  loginStatus: 'complete' | 'pinRequired' | 'registerRequired'
  pinRequired?: boolean
}

export interface WepinUser {
  status: 'success' | 'fail'
  userInfo?: WepinUserInfo
  walletId?: string
  userStatus?: WepinUserStatus
  token?: {
    accessToken: string
    refreshToken: string
  }
}

export type WepinLifecycle =
  | 'not_initialized'
  | 'initializing'
  | 'initialized'
  | 'before_login'
  | 'login'
  | 'login_before_register'

export interface WepinTxData {
  toAddress: string
  amount: string
}

export interface WepinSendResult {
  txId: string
}

// =============================================================================
// Context
// =============================================================================

export interface WepinWidgetContextValue {
  widget: WepinSDK | null
  isWidgetInitialized: boolean
  // Widget Control
  openWidget: () => Promise<void>
  closeWidget: () => void
  getStatus: () => Promise<WepinLifecycle>
  // Accounts
  getAccounts: (networks?: string[]) => Promise<WepinAccount[]>
  // Balance
  getBalance: (account: WepinAccount) => Promise<WepinBalance | null>
  // NFTs
  getNFTs: (refresh?: boolean, networks?: string[]) => Promise<WepinNFT[]>
  // Send/Receive
  send: (account: WepinAccount, txData?: WepinTxData) => Promise<WepinSendResult | null>
  receive: (account: WepinAccount) => Promise<WepinAccount | null>
  // User Management
  getCurrentUser: () => Promise<WepinUser | null>
  register: () => Promise<WepinUser | null>
  loginWithUI: (providers?: Array<{ provider: string; clientId: string }>, email?: string) => Promise<WepinUser | null>
  logout: () => Promise<void>
  // Email Auth
  signUpWithEmailAndPassword: (email: string, password: string) => Promise<boolean>
  loginWithEmailAndPassword: (email: string, password: string) => Promise<WepinUser | null>
}

export const WepinWidgetContext = createContext<WepinWidgetContextValue | null>(null)

/**
 * Hook to access WEPIN Widget context
 */
export function useWepinWidget(): WepinWidgetContextValue {
  const context = useContext(WepinWidgetContext)
  if (!context) {
    throw new Error('useWepinWidget must be used within a WepinWidgetProvider')
  }
  return context
}

// =============================================================================
// Individual Feature Hooks
// =============================================================================

/**
 * Hook to get WEPIN SDK lifecycle status
 */
export function useWepinStatus() {
  const { widget, getStatus, isWidgetInitialized } = useWepinWidget()
  const [status, setStatus] = useState<WepinLifecycle>('not_initialized')

  const refresh = useCallback(async () => {
    if (widget && isWidgetInitialized) {
      const currentStatus = await getStatus()
      setStatus(currentStatus)
    }
  }, [widget, isWidgetInitialized, getStatus])

  return { status, refresh, isInitialized: isWidgetInitialized }
}

/**
 * Hook to control WEPIN widget visibility
 */
export function useWepinWidgetControl() {
  const { openWidget, closeWidget, isWidgetInitialized } = useWepinWidget()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const open = useCallback(async () => {
    if (!isWidgetInitialized) {
      setError(new Error('Widget not initialized'))
      return
    }
    setIsPending(true)
    setError(null)
    try {
      await openWidget()
      setIsOpen(true)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to open widget'))
    } finally {
      setIsPending(false)
    }
  }, [openWidget, isWidgetInitialized])

  const close = useCallback(() => {
    closeWidget()
    setIsOpen(false)
  }, [closeWidget])

  return { open, close, isOpen, isPending, error }
}

/**
 * Hook to get WEPIN accounts
 */
export function useWepinAccounts() {
  const { getAccounts, isWidgetInitialized } = useWepinWidget()
  const [accounts, setAccounts] = useState<WepinAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(
    async (networks?: string[]) => {
      if (!isWidgetInitialized) {
        setError(new Error('Widget not initialized'))
        return []
      }
      setIsLoading(true)
      setError(null)
      try {
        const result = await getAccounts(networks)
        setAccounts(result)
        return result
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get accounts'))
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [getAccounts, isWidgetInitialized]
  )

  return { accounts, fetch, isLoading, error }
}

/**
 * Hook to get WEPIN NFTs
 */
export function useWepinNFTs() {
  const { getNFTs, isWidgetInitialized } = useWepinWidget()
  const [nfts, setNfts] = useState<WepinNFT[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(
    async (refresh?: boolean, networks?: string[]) => {
      if (!isWidgetInitialized) {
        setError(new Error('Widget not initialized'))
        return []
      }
      setIsLoading(true)
      setError(null)
      try {
        const result = await getNFTs(refresh, networks)
        setNfts(result)
        return result
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to get NFTs'))
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [getNFTs, isWidgetInitialized]
  )

  return { nfts, fetch, isLoading, error }
}

/**
 * Hook for WEPIN send functionality
 */
export function useWepinSend() {
  const { send, isWidgetInitialized } = useWepinWidget()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastTxId, setLastTxId] = useState<string | null>(null)

  const sendTransaction = useCallback(
    async (account: WepinAccount, txData?: WepinTxData) => {
      if (!isWidgetInitialized) {
        throw new Error('Widget not initialized')
      }
      setIsPending(true)
      setError(null)
      try {
        const result = await send(account, txData)
        if (result?.txId) {
          setLastTxId(result.txId)
        }
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to send')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [send, isWidgetInitialized]
  )

  return { sendTransaction, isPending, error, lastTxId }
}

/**
 * Hook for WEPIN receive functionality
 */
export function useWepinReceive() {
  const { receive, isWidgetInitialized } = useWepinWidget()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const showReceive = useCallback(
    async (account: WepinAccount) => {
      if (!isWidgetInitialized) {
        throw new Error('Widget not initialized')
      }
      setIsPending(true)
      setError(null)
      try {
        return await receive(account)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to show receive')
        setError(error)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [receive, isWidgetInitialized]
  )

  return { showReceive, isPending, error }
}

/**
 * Hook for WEPIN user management
 */
export function useWepinUser() {
  const { getCurrentUser, register, loginWithUI, logout, isWidgetInitialized } = useWepinWidget()
  const [user, setUser] = useState<WepinUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchUser = useCallback(async () => {
    if (!isWidgetInitialized) return null
    setIsLoading(true)
    setError(null)
    try {
      const result = await getCurrentUser()
      setUser(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get user'))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [getCurrentUser, isWidgetInitialized])

  const doRegister = useCallback(async () => {
    if (!isWidgetInitialized) return null
    setIsLoading(true)
    setError(null)
    try {
      const result = await register()
      setUser(result)
      return result
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to register'))
      return null
    } finally {
      setIsLoading(false)
    }
  }, [register, isWidgetInitialized])

  const doLogin = useCallback(
    async (providers?: Array<{ provider: string; clientId: string }>, email?: string) => {
      if (!isWidgetInitialized) return null
      setIsLoading(true)
      setError(null)
      try {
        const result = await loginWithUI(providers, email)
        setUser(result)
        return result
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to login'))
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [loginWithUI, isWidgetInitialized]
  )

  const doLogout = useCallback(async () => {
    if (!isWidgetInitialized) return
    setIsLoading(true)
    setError(null)
    try {
      await logout()
      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to logout'))
    } finally {
      setIsLoading(false)
    }
  }, [logout, isWidgetInitialized])

  return { user, fetchUser, register: doRegister, login: doLogin, logout: doLogout, isLoading, error }
}
