// DID (Decentralized Identifier) Types for Shinroe
import type { Address } from 'viem'

// DID Document according to W3C DID Core specification
export interface DIDDocument {
  '@context': string[]
  id: string // did:ethr:verychain:0x...
  controller: string
  verificationMethod: VerificationMethod[]
  authentication: string[]
  assertionMethod: string[]
  service?: ServiceEndpoint[]
}

export interface VerificationMethod {
  id: string
  type: 'EcdsaSecp256k1RecoveryMethod2020'
  controller: string
  blockchainAccountId: string
}

export interface ServiceEndpoint {
  id: string
  type: 'ShinroeProfile' | 'VeryChatMessaging'
  serviceEndpoint: string
}

// DID creation and resolution types
export interface CreateDIDOptions {
  address: Address
  serviceEndpoints?: Omit<ServiceEndpoint, 'id'>[]
}

export interface DIDResolutionResult {
  didDocument: DIDDocument | null
  didResolutionMetadata: {
    error?: string
    message?: string
  }
  didDocumentMetadata: {
    created?: string
    updated?: string
    deactivated?: boolean
  }
}

// JWT types for DID-based authentication
export interface DIDJWTHeader {
  alg: 'ES256K-R' | 'ES256K'
  typ: 'JWT'
  kid?: string
}

export interface DIDJWTPayload {
  iss: string // Issuer DID
  sub?: string // Subject DID
  aud?: string | string[] // Audience
  iat: number // Issued at
  exp?: number // Expiration
  nbf?: number // Not before
  jti?: string // JWT ID
  [key: string]: unknown
}

export interface SignedDIDJWT {
  jwt: string
  payload: DIDJWTPayload
}

// Verification types
export interface VerifyDIDJWTOptions {
  audience?: string
  callbackUrl?: string
}

// Use generic object for signer since did-resolver's VerificationMethod is broader
export interface VerifyDIDJWTResult {
  verified: boolean
  payload: DIDJWTPayload | null
  issuer: string | null
  signer: Record<string, unknown> | null
  error?: string
}

// DID method constants
export const DID_METHOD = 'ethr'
export const DID_NETWORK = 'verychain'
export const DID_PREFIX = `did:${DID_METHOD}:${DID_NETWORK}:`

// Helper to create DID from address
export function addressToDID(address: Address): string {
  return `${DID_PREFIX}${address.toLowerCase()}`
}

// Helper to extract address from DID
export function didToAddress(did: string): Address | null {
  if (!did.startsWith(DID_PREFIX)) return null
  const address = did.slice(DID_PREFIX.length)
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) return null
  return address as Address
}
