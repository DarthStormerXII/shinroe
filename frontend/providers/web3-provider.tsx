/**
 * Web3 Provider Re-export
 *
 * This file re-exports the Web3Provider from the active auth provider.
 * The actual implementation is in lib/web3/providers/{active-provider}/
 *
 * To switch providers, edit lib/web3/providers/index.ts
 */

'use client'

export { Web3Provider } from '@/lib/web3'
