/**
 * Web3 Provider - WEPIN Implementation
 *
 * Provides WEPIN Provider and Widget SDK contexts to the application.
 */

'use client'

import { useState, useCallback, useEffect, useMemo, useRef, type ReactNode } from 'react'
import type { WepinProvider as WepinProviderSDK } from '@wepin/provider-js'
import type { WepinSDK, Account, IWepinUser } from '@wepin/sdk-js'
import { WepinContext, type WepinContextValue, isWepinConfigured, getWepinConfig } from './wepin-client'
import {
  WepinWidgetContext,
  type WepinWidgetContextValue,
  type WepinAccount,
  type WepinBalance,
  type WepinUser,
  type WepinTxData,
  type WepinSendResult,
  type WepinLifecycle,
} from './widget'
import { getWepinNetworkName } from './config'
import { getDefaultChain } from '@/lib/config/chains'

interface Web3ProviderProps {
  children: ReactNode
}

/**
 * Web3 Provider Component
 *
 * Wraps the application with WEPIN Provider and Widget SDK contexts.
 */
export function Web3Provider({ children }: Web3ProviderProps) {
  // Provider SDK state
  const [provider, setProvider] = useState<WepinProviderSDK | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [networkProvider, setNetworkProvider] = useState<unknown | null>(null)

  // Widget SDK state
  const [widget, setWidget] = useState<WepinSDK | null>(null)
  const [isWidgetInitialized, setIsWidgetInitialized] = useState(false)

  // Refs to prevent race conditions and ensure we always use the latest initialized instances
  const isInitializingRef = useRef(false)
  const providerRef = useRef<WepinProviderSDK | null>(null)
  const widgetRef = useRef<WepinSDK | null>(null)
  const networkProviderRef = useRef<unknown | null>(null)
  const chainIdRef = useRef<number | null>(null)

  // Initialize both WEPIN SDKs
  const initialize = useCallback(async () => {
    // Prevent double initialization (React strict mode or concurrent rendering)
    if (isInitializingRef.current || providerRef.current) {
      return
    }

    if (!isWepinConfigured()) {
      console.warn('[WEPIN] Not configured. Set NEXT_PUBLIC_WEPIN_APP_ID and NEXT_PUBLIC_WEPIN_APP_KEY')
      return
    }

    isInitializingRef.current = true

    try {
      const { appId, appKey } = getWepinConfig()

      // Dynamic imports to avoid SSR issues (these packages access window on import)
      const [{ WepinProvider: WepinProviderClass }, { WepinSDK: WepinSDKClass }] = await Promise.all([
        import('@wepin/provider-js'),
        import('@wepin/sdk-js'),
      ])

      // Initialize Provider SDK
      const wepinProvider = new WepinProviderClass({ appId, appKey })
      await wepinProvider.init({
        defaultLanguage: 'en',
        defaultCurrency: 'USD',
      })
      // Store in ref first (synchronous), then update state
      providerRef.current = wepinProvider
      setProvider(wepinProvider)
      setIsInitialized(true)

      // Initialize Widget SDK
      const wepinWidget = new WepinSDKClass({ appId, appKey })
      await wepinWidget.init({
        defaultLanguage: 'en',
        defaultCurrency: 'USD',
      })
      widgetRef.current = wepinWidget
      setWidget(wepinWidget)
      setIsWidgetInitialized(true)
    } catch (error) {
      console.error('[WEPIN] Failed to initialize:', error)
      isInitializingRef.current = false
    }
  }, [])

  // Auto-initialize on mount and cleanup on unmount
  useEffect(() => {
    if (typeof window !== 'undefined' && !providerRef.current && !isInitializingRef.current) {
      initialize()
    }

    return () => {
      // Cleanup: finalize both WEPIN SDKs on unmount
      if (providerRef.current) {
        providerRef.current.finalize()
        providerRef.current = null
      }
      if (widgetRef.current) {
        widgetRef.current.finalize()
        widgetRef.current = null
      }
      isInitializingRef.current = false
    }
  }, [initialize])

  // Connect wallet
  const connect = useCallback(async (): Promise<string[]> => {
    // Use ref to ensure we have the latest initialized provider
    const currentProvider = providerRef.current
    if (!currentProvider) {
      throw new Error('WEPIN not initialized')
    }

    try {
      // Get default chain from configuration
      const defaultChain = getDefaultChain()
      const defaultChainId = defaultChain.chain.id
      const networkName = getWepinNetworkName(defaultChainId)

      if (!networkName) {
        throw new Error(`No WEPIN network name configured for chain ${defaultChainId}`)
      }

      console.log(`[WEPIN] Connecting to default chain: ${defaultChain.name} (${defaultChainId}) - network: ${networkName}`)

      // Get the provider for the default network
      const ethProvider = await currentProvider.getProvider(networkName)
      // Update both ref and state
      networkProviderRef.current = ethProvider
      chainIdRef.current = defaultChainId
      setNetworkProvider(ethProvider)

      // Request accounts (triggers login if needed)
      const accounts = (await ethProvider.request({
        method: 'eth_requestAccounts',
      })) as string[]

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
        setIsConnected(true)
        setChainId(defaultChainId)
      }

      return accounts
    } catch (error) {
      console.error('[WEPIN] Failed to connect:', error)
      throw error
    }
  }, [])

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    networkProviderRef.current = null
    chainIdRef.current = null
    setAddress(null)
    setIsConnected(false)
    setNetworkProvider(null)
    setChainId(null)
  }, [])

  // Get provider for specific network
  const getProvider = useCallback(
    async (network: string): Promise<unknown> => {
      const currentProvider = providerRef.current
      if (!currentProvider) {
        throw new Error('WEPIN not initialized')
      }
      return currentProvider.getProvider(network)
    },
    []
  )

  // Switch network
  const switchNetwork = useCallback(
    async (newChainId: number) => {
      const currentProvider = providerRef.current
      if (!currentProvider) {
        throw new Error('WEPIN not initialized')
      }

      const networkName = getWepinNetworkName(newChainId)
      if (!networkName) {
        throw new Error(`Unsupported chain ID: ${newChainId}`)
      }

      try {
        const ethProvider = await currentProvider.getProvider(networkName)
        // Update refs FIRST (synchronous) before state updates
        networkProviderRef.current = ethProvider
        chainIdRef.current = newChainId
        // Then update state for React re-renders
        setNetworkProvider(ethProvider)
        setChainId(newChainId)

        // Request accounts for the new network
        const accounts = (await ethProvider.request({
          method: 'eth_accounts',
        })) as string[]

        if (accounts && accounts.length > 0) {
          setAddress(accounts[0])
        }
      } catch (error) {
        console.error('[WEPIN] Failed to switch network:', error)
        throw error
      }
    },
    []
  )

  // =============================================================================
  // Widget SDK Methods
  // =============================================================================

  const openWidget = useCallback(async () => {
    const currentWidget = widgetRef.current
    if (!currentWidget) {
      throw new Error('Widget SDK not initialized')
    }
    await currentWidget.openWidget()
  }, [])

  const closeWidget = useCallback(() => {
    const currentWidget = widgetRef.current
    if (currentWidget) {
      currentWidget.closeWidget()
    }
  }, [])

  const getStatus = useCallback(async (): Promise<WepinLifecycle> => {
    const currentWidget = widgetRef.current
    if (!currentWidget) return 'not_initialized'
    const status = await currentWidget.getStatus()
    return status as WepinLifecycle
  }, [])

  const getAccounts = useCallback(
    async (networks?: string[]): Promise<WepinAccount[]> => {
      const currentWidget = widgetRef.current
      if (!currentWidget) {
        throw new Error('Widget SDK not initialized')
      }
      const accounts = await currentWidget.getAccounts({ networks })
      return accounts.map((acc: Account) => ({
        address: acc.address,
        network: acc.network,
        contract: acc.contract,
      }))
    },
    []
  )

  const getBalance = useCallback(
    async (account: WepinAccount): Promise<WepinBalance | null> => {
      const currentWidget = widgetRef.current
      if (!currentWidget) {
        throw new Error('Widget SDK not initialized')
      }
      const balances = await currentWidget.getBalance([{ network: account.network, address: account.address }])
      if (balances && balances.length > 0) {
        const bal = balances[0]
        return {
          symbol: bal.symbol,
          balance: bal.balance,
          tokens: bal.tokens?.map((t) => ({
            symbol: t.symbol,
            balance: t.balance,
            contract: t.contract,
          })),
        }
      }
      return null
    },
    []
  )

  // Note: getNFTs is not available in the Web Widget SDK - only in mobile SDKs
  const getNFTs = useCallback(async (): Promise<never[]> => {
    console.warn('[WEPIN] getNFTs is not available in the Web SDK')
    return []
  }, [])

  const send = useCallback(
    async (account: WepinAccount, txData?: WepinTxData): Promise<WepinSendResult | null> => {
      const currentWidget = widgetRef.current
      if (!currentWidget) {
        throw new Error('Widget SDK not initialized')
      }
      const result = await currentWidget.send({
        account: { address: account.address, network: account.network, contract: account.contract },
        txData: txData ? { toAddress: txData.toAddress, amount: txData.amount } : undefined,
      })
      return result ? { txId: String(result) } : null
    },
    []
  )

  // Note: receive is not available in the Web Widget SDK - only in mobile SDKs
  const receive = useCallback(async (): Promise<null> => {
    console.warn('[WEPIN] receive is not available in the Web SDK')
    return null
  }, [])

  // Note: For user info, we need to track it from loginWithUI response
  const [currentUser, setCurrentUser] = useState<IWepinUser | null>(null)

  const getCurrentUser = useCallback(async (): Promise<WepinUser | null> => {
    if (!currentUser) return null
    return {
      status: currentUser.status as 'success' | 'fail',
      userInfo: currentUser.userInfo
        ? {
            userId: currentUser.userInfo.userId,
            email: currentUser.userInfo.email,
            provider: currentUser.userInfo.provider as WepinUser['userInfo'] extends { provider: infer P } ? P : never,
            use2FA: currentUser.userInfo.use2FA,
          }
        : undefined,
      walletId: currentUser.walletId,
      userStatus: currentUser.userStatus
        ? {
            loginStatus: currentUser.userStatus.loginStatus as 'complete' | 'pinRequired' | 'registerRequired',
            pinRequired: currentUser.userStatus.pinRequired,
          }
        : undefined,
      token: currentUser.token,
    }
  }, [currentUser])

  const register = useCallback(async (): Promise<WepinUser | null> => {
    const currentWidget = widgetRef.current
    if (!currentWidget) {
      throw new Error('Widget SDK not initialized')
    }
    const user = await currentWidget.register()
    setCurrentUser(user)
    return getCurrentUser()
  }, [getCurrentUser])

  const loginWithUI = useCallback(
    async (_providers?: Array<{ provider: string; clientId: string }>, email?: string): Promise<WepinUser | null> => {
      const currentWidget = widgetRef.current
      if (!currentWidget) {
        throw new Error('Widget SDK not initialized')
      }
      // Note: Web SDK loginWithUI only takes email option, not loginProviders
      const user = await currentWidget.loginWithUI({ email })
      setCurrentUser(user)
      return getCurrentUser()
    },
    [getCurrentUser]
  )

  const widgetLogout = useCallback(async () => {
    const currentWidget = widgetRef.current
    if (!currentWidget) {
      return
    }
    await currentWidget.logout()
    setCurrentUser(null)
  }, [])

  // Note: Email auth methods are not directly available on WepinSDK - they require WepinLogin
  const signUpWithEmailAndPassword = useCallback(async (): Promise<boolean> => {
    console.warn('[WEPIN] signUpWithEmailAndPassword requires @wepin/login-js package')
    return false
  }, [])

  const loginWithEmailAndPassword = useCallback(async (): Promise<WepinUser | null> => {
    console.warn('[WEPIN] loginWithEmailAndPassword requires @wepin/login-js package')
    return null
  }, [])

  // =============================================================================
  // Getter functions for refs (to avoid stale closures in hooks)
  // =============================================================================

  const getCurrentNetworkProvider = useCallback(() => networkProviderRef.current, [])
  const getCurrentChainId = useCallback(() => chainIdRef.current, [])

  // =============================================================================
  // Context Values
  // =============================================================================

  const contextValue: WepinContextValue = useMemo(
    () => ({
      provider,
      isInitialized,
      isConnected,
      address,
      chainId,
      networkProvider,
      initialize,
      connect,
      disconnect,
      getProvider,
      switchNetwork,
      getCurrentNetworkProvider,
      getCurrentChainId,
    }),
    [
      provider,
      isInitialized,
      isConnected,
      address,
      chainId,
      networkProvider,
      initialize,
      connect,
      disconnect,
      getProvider,
      switchNetwork,
      getCurrentNetworkProvider,
      getCurrentChainId,
    ]
  )

  const widgetContextValue: WepinWidgetContextValue = useMemo(
    () => ({
      widget,
      isWidgetInitialized,
      openWidget,
      closeWidget,
      getStatus,
      getAccounts,
      getBalance,
      getNFTs,
      send,
      receive,
      getCurrentUser,
      register,
      loginWithUI,
      logout: widgetLogout,
      signUpWithEmailAndPassword,
      loginWithEmailAndPassword,
    }),
    [
      widget,
      isWidgetInitialized,
      openWidget,
      closeWidget,
      getStatus,
      getAccounts,
      getBalance,
      getNFTs,
      send,
      receive,
      getCurrentUser,
      register,
      loginWithUI,
      widgetLogout,
      signUpWithEmailAndPassword,
      loginWithEmailAndPassword,
    ]
  )

  return (
    <WepinContext.Provider value={contextValue}>
      <WepinWidgetContext.Provider value={widgetContextValue}>{children}</WepinWidgetContext.Provider>
    </WepinContext.Provider>
  )
}
