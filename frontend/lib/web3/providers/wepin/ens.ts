/**
 * ENS Hooks - WEPIN Implementation
 *
 * Provides ENS name and avatar resolution.
 * Uses viem directly for ENS resolution on Ethereum mainnet.
 */

'use client'

import { useState, useEffect } from 'react'
import { createPublicClient, http } from 'viem'
import { mainnet } from 'viem/chains'
import type {
  UseEnsNameParams,
  UseEnsNameReturn,
  UseEnsAvatarParams,
  UseEnsAvatarReturn,
} from './types'

// Create a public client for ENS resolution on mainnet
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

/**
 * Hook to resolve an address to an ENS name
 */
export function useEnsName(params: UseEnsNameParams): UseEnsNameReturn {
  const { address } = params
  const [ensName, setEnsName] = useState<string | null | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!address) {
      setEnsName(undefined)
      return
    }

    setIsLoading(true)
    setError(null)

    ensClient
      .getEnsName({ address })
      .then((name) => {
        setEnsName(name)
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to resolve ENS name'))
        setEnsName(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [address])

  return {
    ensName,
    isLoading,
    error,
  }
}

/**
 * Hook to get an ENS avatar
 */
export function useEnsAvatar(params: UseEnsAvatarParams): UseEnsAvatarReturn {
  const { name } = params
  const [ensAvatar, setEnsAvatar] = useState<string | null | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!name) {
      setEnsAvatar(undefined)
      return
    }

    setIsLoading(true)
    setError(null)

    ensClient
      .getEnsAvatar({ name })
      .then((avatar) => {
        setEnsAvatar(avatar)
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to resolve ENS avatar'))
        setEnsAvatar(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [name])

  return {
    ensAvatar,
    isLoading,
    error,
  }
}
