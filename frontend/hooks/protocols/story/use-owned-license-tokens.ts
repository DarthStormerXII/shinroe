'use client'

import { useState, useEffect, useCallback } from 'react'
import { Address } from 'viem'
import { usePublicClient } from '@/lib/web3'
import { STORY_CONTRACTS } from '@/constants/protocols/story'
import { LICENSE_TOKEN_ABI } from '@/lib/abis/story'
import type { OwnedLicenseToken } from '@/lib/types/story'

// License Token contract address (ERC-721)
// This is deployed by Story Protocol to track license tokens
const LICENSE_TOKEN_CONTRACT = '0xFe3838BFb30B34170F00030B52EFa71999C4Ec3B' as Address

interface UseOwnedLicenseTokensReturn {
  ownedTokens: OwnedLicenseToken[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Hook to fetch license tokens owned by an address
 * Uses direct contract reads to get accurate on-chain data
 */
export function useOwnedLicenseTokens(
  address: string | undefined
): UseOwnedLicenseTokensReturn {
  const { publicClient } = usePublicClient()
  const [ownedTokens, setOwnedTokens] = useState<OwnedLicenseToken[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOwnedTokens = useCallback(async () => {
    if (!address || !publicClient) {
      setOwnedTokens([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Get balance of license tokens for this address
      const balance = await publicClient.readContract({
        address: LICENSE_TOKEN_CONTRACT,
        abi: LICENSE_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [address as Address],
      })

      const tokenCount = Number(balance)
      if (tokenCount === 0) {
        setOwnedTokens([])
        setLoading(false)
        return
      }

      const tokens: OwnedLicenseToken[] = []

      // Fetch each token's details
      for (let i = 0; i < tokenCount; i++) {
        try {
          // Get token ID at this index
          const tokenId = await publicClient.readContract({
            address: LICENSE_TOKEN_CONTRACT,
            abi: LICENSE_TOKEN_ABI,
            functionName: 'tokenOfOwnerByIndex',
            args: [address as Address, BigInt(i)],
          })

          // Get license terms ID for this token
          const licenseTermsId = await publicClient.readContract({
            address: LICENSE_TOKEN_CONTRACT,
            abi: LICENSE_TOKEN_ABI,
            functionName: 'getLicenseTermsId',
            args: [tokenId],
          })

          // Get licensor IP ID for this token
          const licensorIpId = await publicClient.readContract({
            address: LICENSE_TOKEN_CONTRACT,
            abi: LICENSE_TOKEN_ABI,
            functionName: 'getLicensorIpId',
            args: [tokenId],
          })

          tokens.push({
            tokenId: tokenId.toString(),
            licenseTermsId: licenseTermsId.toString(),
            licensorIpId: licensorIpId as string,
            transferable: true, // License tokens are transferable by default
            ownerAddress: address,
          })
        } catch (tokenError) {
          console.warn(`Failed to fetch token at index ${i}:`, tokenError)
          // Continue fetching other tokens
        }
      }

      setOwnedTokens(tokens)
    } catch (err: any) {
      console.error('Failed to fetch owned license tokens:', err)
      setError(err.message || 'Failed to fetch license tokens')
      setOwnedTokens([])
    } finally {
      setLoading(false)
    }
  }, [address, publicClient])

  // Fetch tokens on mount and when address changes
  useEffect(() => {
    fetchOwnedTokens()
  }, [fetchOwnedTokens])

  return {
    ownedTokens,
    loading,
    error,
    refetch: fetchOwnedTokens,
  }
}

export default useOwnedLicenseTokens
