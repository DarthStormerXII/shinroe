/**
 * Connection Hooks - WEPIN Implementation
 *
 * Provides connect/disconnect functionality using WEPIN.
 */

'use client'

import { useCallback, useState } from 'react'
import { useWepinContext } from './wepin-client'
import type { UseConnectReturn, UseDisconnectReturn } from './types'

/**
 * Hook to connect a wallet
 */
export function useConnect(): UseConnectReturn {
  const { connect: wepinConnect, isInitialized } = useWepinContext()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const connect = useCallback(() => {
    if (!isInitialized) {
      setError(new Error('WEPIN not initialized'))
      return
    }

    setIsPending(true)
    setError(null)

    wepinConnect()
      .catch((err) => {
        const error = err instanceof Error ? err : new Error('Failed to connect')
        setError(error)
      })
      .finally(() => {
        setIsPending(false)
      })
  }, [wepinConnect, isInitialized])

  return { connect, isPending, error }
}

/**
 * Hook to disconnect the wallet
 */
export function useDisconnect(): UseDisconnectReturn {
  const { disconnect: wepinDisconnect, isConnected } = useWepinContext()
  const [isPending, setIsPending] = useState(false)

  const disconnect = useCallback(() => {
    if (!isConnected) return

    setIsPending(true)
    wepinDisconnect().finally(() => {
      setIsPending(false)
    })
  }, [wepinDisconnect, isConnected])

  return { disconnect, isPending }
}
