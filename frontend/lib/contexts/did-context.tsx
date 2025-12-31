'use client'

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import type { Address } from 'viem'
import { useAccount } from '@/lib/web3'
import { didService } from '@/lib/services/did-service'
import { useRegistrationStatus } from '@/lib/hooks/use-registration-status'
import type { DIDDocument } from '@/lib/types/did'

interface TransactionResult {
  hash: `0x${string}`
  success: boolean
}

interface DIDContextValue {
  did: string | null
  didDocument: DIDDocument | null
  isOnchainRegistered: boolean
  isCheckingRegistration: boolean
  createDID: () => string | null
  refreshDID: () => Promise<void>
  ensureOnchainRegistration: () => Promise<TransactionResult>
}

const DIDContext = createContext<DIDContextValue | null>(null)

interface DIDProviderProps {
  children: ReactNode
  onEnsureRegistration: () => Promise<TransactionResult>
}

export function DIDProvider({ children, onEnsureRegistration }: DIDProviderProps) {
  const { address, isConnected } = useAccount()
  const { isRegistered, isLoading: isCheckingRegistration, refetch } = useRegistrationStatus(
    address as Address | null
  )

  const [did, setDid] = useState<string | null>(null)
  const [didDocument, setDidDocument] = useState<DIDDocument | null>(null)

  // Create DID from address (gasless - pure computation)
  const createDID = useCallback((): string | null => {
    if (!address) return null
    const newDid = didService.createDID(address as Address)
    setDid(newDid)
    return newDid
  }, [address])

  // Resolve and refresh DID document
  const refreshDID = useCallback(async () => {
    if (!did) return
    const result = await didService.resolveDID(did)
    if (result.didDocument) {
      setDidDocument(result.didDocument)
    }
  }, [did])

  // Auto-create DID when wallet connects
  useEffect(() => {
    if (isConnected && address && !did) {
      const newDid = didService.createDID(address as Address)
      setDid(newDid)

      // Build initial DID document (off-chain)
      const { document } = didService.createDIDWithOptions({
        address: address as Address,
        serviceEndpoints: [
          { type: 'ShinroeProfile', serviceEndpoint: `https://shinroe.app/profile/${address}` },
        ],
      })
      setDidDocument(document)
    }
  }, [isConnected, address, did])

  // Clear DID when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      setDid(null)
      setDidDocument(null)
    }
  }, [isConnected])

  // Ensure on-chain registration (lazy - only when needed)
  const ensureOnchainRegistration = useCallback(async (): Promise<TransactionResult> => {
    if (isRegistered) {
      return { hash: '0x0' as `0x${string}`, success: true }
    }
    const result = await onEnsureRegistration()
    if (result.success) {
      refetch()
    }
    return result
  }, [isRegistered, onEnsureRegistration, refetch])

  const value: DIDContextValue = {
    did,
    didDocument,
    isOnchainRegistered: isRegistered,
    isCheckingRegistration,
    createDID,
    refreshDID,
    ensureOnchainRegistration,
  }

  return <DIDContext.Provider value={value}>{children}</DIDContext.Provider>
}

export function useDID() {
  const context = useContext(DIDContext)
  if (!context) {
    throw new Error('useDID must be used within a DIDProvider')
  }
  return context
}

export { DIDContext }
