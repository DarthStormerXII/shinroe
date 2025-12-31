// DID Service - Create, resolve, sign, and verify DIDs for VeryChain
import { createJWT, verifyJWT, ES256KSigner } from 'did-jwt'
import type { Address, Hex } from 'viem'
import { hexToBytes } from 'viem'
import { getDIDResolver, VERYCHAIN_CHAIN_ID } from '@/lib/config/did-config'
import {
  DIDDocument,
  DIDResolutionResult,
  DIDJWTPayload,
  SignedDIDJWT,
  VerifyDIDJWTResult,
  VerifyDIDJWTOptions,
  ServiceEndpoint,
  CreateDIDOptions,
  addressToDID,
  DID_PREFIX,
} from '@/lib/types/did'

class DIDService {
  private resolver = getDIDResolver()

  /**
   * Create a DID from a wallet address (gasless - pure computation)
   */
  createDID(address: Address): string {
    return addressToDID(address)
  }

  /**
   * Create a full DID with custom service endpoints
   */
  createDIDWithOptions(options: CreateDIDOptions): {
    did: string
    document: DIDDocument
  } {
    const did = addressToDID(options.address)
    const document = this.buildDIDDocument(options.address, options.serviceEndpoints)
    return { did, document }
  }

  /**
   * Resolve a DID to its DID Document
   */
  async resolveDID(did: string): Promise<DIDResolutionResult> {
    try {
      const result = await this.resolver.resolve(did)

      if (result.didResolutionMetadata.error) {
        return {
          didDocument: null,
          didResolutionMetadata: {
            error: result.didResolutionMetadata.error,
            message: result.didResolutionMetadata.message,
          },
          didDocumentMetadata: {},
        }
      }

      return {
        didDocument: result.didDocument as DIDDocument,
        didResolutionMetadata: {},
        didDocumentMetadata: result.didDocumentMetadata,
      }
    } catch (error) {
      return {
        didDocument: null,
        didResolutionMetadata: {
          error: 'resolutionError',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        didDocumentMetadata: {},
      }
    }
  }

  /**
   * Sign a JWT payload with a DID using the private key
   */
  async signWithDID(
    did: string,
    payload: Omit<DIDJWTPayload, 'iss' | 'iat'>,
    privateKey: Hex
  ): Promise<SignedDIDJWT> {
    const keyBytes = hexToBytes(privateKey)
    const signer = ES256KSigner(keyBytes)

    const now = Math.floor(Date.now() / 1000)
    const fullPayload: DIDJWTPayload = {
      ...payload,
      iss: did,
      iat: now,
    }

    const jwt = await createJWT(fullPayload, {
      issuer: did,
      signer,
      alg: 'ES256K-R',
    })

    return { jwt, payload: fullPayload }
  }

  /**
   * Verify a DID-signed JWT
   */
  async verifyDIDSignature(
    jwt: string,
    options?: VerifyDIDJWTOptions
  ): Promise<VerifyDIDJWTResult> {
    try {
      const result = await verifyJWT(jwt, {
        resolver: this.resolver,
        audience: options?.audience,
        callbackUrl: options?.callbackUrl,
      })

      return {
        verified: result.verified,
        payload: result.payload as DIDJWTPayload,
        issuer: result.issuer,
        signer: result.signer as unknown as Record<string, unknown> | null,
      }
    } catch (error) {
      return {
        verified: false,
        payload: null,
        issuer: null,
        signer: null,
        error: error instanceof Error ? error.message : 'Verification failed',
      }
    }
  }

  /**
   * Build a DID Document for an address
   */
  private buildDIDDocument(
    address: Address,
    serviceEndpoints?: Omit<ServiceEndpoint, 'id'>[]
  ): DIDDocument {
    const did = addressToDID(address)
    const verificationMethodId = `${did}#controller`
    const blockchainAccountId = `eip155:${VERYCHAIN_CHAIN_ID}:${address}`

    const document: DIDDocument = {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/secp256k1recovery-2020/v2',
      ],
      id: did,
      controller: did,
      verificationMethod: [
        {
          id: verificationMethodId,
          type: 'EcdsaSecp256k1RecoveryMethod2020',
          controller: did,
          blockchainAccountId,
        },
      ],
      authentication: [verificationMethodId],
      assertionMethod: [verificationMethodId],
    }

    if (serviceEndpoints?.length) {
      document.service = serviceEndpoints.map((ep, index) => ({
        id: `${did}#service-${index}`,
        type: ep.type,
        serviceEndpoint: ep.serviceEndpoint,
      }))
    }

    return document
  }

  /**
   * Check if a string is a valid did:ethr:verychain DID
   */
  isValidDID(did: string): boolean {
    if (!did.startsWith(DID_PREFIX)) return false
    const address = did.slice(DID_PREFIX.length)
    return /^0x[a-fA-F0-9]{40}$/.test(address)
  }

  /**
   * Extract the address from a DID
   */
  extractAddress(did: string): Address | null {
    if (!this.isValidDID(did)) return null
    return did.slice(DID_PREFIX.length) as Address
  }
}

export const didService = new DIDService()
