'use client'

import { useCallback, useState } from 'react'
import { StoryClient, StoryConfig } from '@story-protocol/core-sdk'
import { custom, http, Account } from 'viem'
import { useWalletClient, usePublicClient } from '@/lib/web3'
import { STORY_CHAIN_ID, STORY_RPC_URL } from '@/constants/protocols/story'
import { toast } from 'sonner'

// Story Aeneid Testnet chain configuration
const storyAeneidChain = {
  id: STORY_CHAIN_ID,
  name: 'Story Aeneid Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'IP',
    symbol: 'IP',
  },
  rpcUrls: {
    default: { http: [STORY_RPC_URL] },
  },
  blockExplorers: {
    default: {
      name: 'Story Explorer',
      url: 'https://aeneid.explorer.story.foundation',
    },
  },
  testnet: true,
}

export interface UseStoryClientReturn {
  getClient: () => Promise<StoryClient | null>
  isInitializing: boolean
}

/**
 * Hook to create and manage a Story Protocol client instance
 * Uses the connected wallet for signing transactions
 */
export function useStoryClient(): UseStoryClientReturn {
  const { walletClient } = useWalletClient()
  const { publicClient } = usePublicClient()
  const [isInitializing, setIsInitializing] = useState(false)

  const getClient = useCallback(async (): Promise<StoryClient | null> => {
    if (!walletClient) {
      toast.error('Please connect your wallet first')
      return null
    }

    setIsInitializing(true)
    try {
      // Check if user is on the correct chain
      const chainId = await walletClient.getChainId()
      if (chainId !== STORY_CHAIN_ID) {
        toast.error(`Please switch to Story Aeneid Testnet (Chain ID: ${STORY_CHAIN_ID})`)
        return null
      }

      // Create Story SDK configuration
      const config: StoryConfig = {
        account: walletClient.account as Account,
        transport: custom(walletClient.transport),
        chainId: 'aeneid',
      }

      // Initialize Story Client
      const client = StoryClient.newClient(config)

      return client
    } catch (error: any) {
      console.error('Failed to initialize Story client:', error)
      toast.error(error.message || 'Failed to initialize Story client')
      return null
    } finally {
      setIsInitializing(false)
    }
  }, [walletClient])

  return {
    getClient,
    isInitializing,
  }
}

export default useStoryClient
