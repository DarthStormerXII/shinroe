/**
 * Connect Button Re-export
 *
 * This file re-exports the ConnectButton from the active auth provider.
 * The actual implementation is in lib/web3/providers/{active-provider}/
 *
 * To switch providers, edit lib/web3/providers/index.ts
 */

'use client'

export { ConnectButton } from '@/lib/web3'
