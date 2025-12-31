'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Address } from 'viem'
import { useAccount } from '@/lib/web3'
import { didService } from '@/lib/services/did-service'
import { userMetadataService, type UserMetadata } from '@/lib/services/user-metadata-service'
import { uploadProfileMetadata } from '@/lib/services/ipfs-service'
import { useRegistrationStatus } from './use-registration-status'
import { useRegistrationContract } from './use-registration-contract'
import type { DIDDocument } from '@/lib/types/did'

interface ProfileUpdate {
  displayName?: string
  avatarUrl?: string
  bio?: string
  saveOnChain?: boolean // If true, also save to blockchain via IPFS
}

interface UseRegistrationReturn {
  // DID (always available after connect)
  did: string | null
  didDocument: DIDDocument | null

  // On-chain status
  isOnchainRegistered: boolean
  isCheckingRegistration: boolean
  registrationTxHash: string | null
  refetchRegistration: () => void
  setRegisteredOptimistic: () => void

  // Actions
  ensureRegistered: () => Promise<void>
  saveProfileOnChain: (data: { displayName: string; avatarUrl?: string; bio?: string }) => Promise<string>

  // Profile (off-chain, works without on-chain registration)
  profile: UserMetadata | null
  isLoadingProfile: boolean
  updateProfile: (data: ProfileUpdate) => Promise<boolean>
  refreshProfile: () => Promise<void>
}

export function useRegistration(): UseRegistrationReturn {
  const { address, isConnected } = useAccount()
  const { isRegistered, isLoading: isCheckingRegistration, refetch, setRegisteredOptimistic } = useRegistrationStatus(
    address as Address | null
  )
  const { registerUser, setProfileUri } = useRegistrationContract()

  // DID state
  const [did, setDid] = useState<string | null>(null)
  const [didDocument, setDidDocument] = useState<DIDDocument | null>(null)

  // Registration state
  const [registrationTxHash, setRegistrationTxHash] = useState<string | null>(null)
  const [isRegistering, setIsRegistering] = useState(false)

  // Profile state
  const [profile, setProfile] = useState<UserMetadata | null>(null)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)

  // Auto-create DID when wallet connects (gasless)
  useEffect(() => {
    if (isConnected && address && !did) {
      const newDid = didService.createDID(address as Address)
      setDid(newDid)

      // Build DID document
      const { document } = didService.createDIDWithOptions({
        address: address as Address,
        serviceEndpoints: [
          { type: 'ShinroeProfile', serviceEndpoint: `https://shinroe.app/profile/${address}` },
        ],
      })
      setDidDocument(document)
    }
  }, [isConnected, address, did])

  // Clear state on disconnect
  useEffect(() => {
    if (!isConnected) {
      setDid(null)
      setDidDocument(null)
      setProfile(null)
      setRegistrationTxHash(null)
    }
  }, [isConnected])

  // Load profile on connect
  useEffect(() => {
    if (address) {
      loadProfile(address)
    }
  }, [address])

  const loadProfile = async (addr: string) => {
    setIsLoadingProfile(true)
    try {
      const metadata = await userMetadataService.getMetadata(addr)
      setProfile(metadata)
    } finally {
      setIsLoadingProfile(false)
    }
  }

  const refreshProfile = useCallback(async () => {
    if (address) {
      await loadProfile(address)
    }
  }, [address])

  // Update profile (works without on-chain registration)
  const updateProfile = useCallback(
    async (data: ProfileUpdate): Promise<boolean> => {
      if (!address) return false
      const success = await userMetadataService.setMetadata({
        address,
        ...data,
      })
      if (success) {
        await refreshProfile()
      }
      return success
    },
    [address, refreshProfile]
  )

  // Ensure on-chain registration (only when needed)
  const ensureRegistered = useCallback(async (): Promise<void> => {
    if (isRegistered || isRegistering) return

    setIsRegistering(true)
    try {
      const result = await registerUser()
      setRegistrationTxHash(result.hash)
      if (result.success) {
        // Optimistically update UI immediately, then refetch to confirm
        setRegisteredOptimistic()
        refetch()
      } else {
        throw new Error('Registration transaction failed')
      }
    } finally {
      setIsRegistering(false)
    }
  }, [isRegistered, isRegistering, registerUser, refetch, setRegisteredOptimistic])

  // Save profile metadata to IPFS and store URI on-chain
  const saveProfileOnChain = useCallback(
    async (data: { displayName: string; avatarUrl?: string; bio?: string }): Promise<string> => {
      if (!address || !did) {
        throw new Error('Wallet not connected or DID not created')
      }

      // Upload profile metadata to IPFS
      const profileUri = await uploadProfileMetadata({
        displayName: data.displayName,
        avatarUrl: data.avatarUrl,
        bio: data.bio,
        did,
        address,
      })

      // Save URI on-chain
      const result = await setProfileUri(profileUri)
      if (!result.success) {
        throw new Error('Failed to save profile on-chain')
      }

      return profileUri
    },
    [address, did, setProfileUri]
  )

  return {
    // DID
    did,
    didDocument,

    // On-chain status
    isOnchainRegistered: isRegistered,
    isCheckingRegistration,
    registrationTxHash,
    refetchRegistration: refetch,
    setRegisteredOptimistic,

    // Actions
    ensureRegistered,
    saveProfileOnChain,

    // Profile
    profile,
    isLoadingProfile,
    updateProfile,
    refreshProfile,
  }
}
