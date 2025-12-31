// Story Protocol Constants - Stub implementation
// TODO: Configure with actual Story Protocol values when integrating

export const STORY_CHAIN_ID = 1513 // Story Aeneid Testnet
export const STORY_RPC_URL = 'https://aeneid.storyrpc.io'
export const STORY_EXPLORER = 'https://aeneid.storyscan.xyz'
export const STORY_API_PROXY = '/api/story'

// Contract addresses (testnet)
export const STORY_CONTRACTS = {
  IP_ASSET_REGISTRY: '0x0000000000000000000000000000000000000000' as const,
  LICENSING_MODULE: '0x0000000000000000000000000000000000000000' as const,
  ROYALTY_MODULE: '0x0000000000000000000000000000000000000000' as const,
  DISPUTE_MODULE: '0x0000000000000000000000000000000000000000' as const,
  WIP_TOKEN: '0x0000000000000000000000000000000000000000' as const,
  PIL_TEMPLATE: '0x0000000000000000000000000000000000000000' as const,
  ROYALTY_POLICY_LAP: '0x0000000000000000000000000000000000000000' as const,
}

export const WIP_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000' as const

// IP Types for metadata
export const IP_TYPES = [
  'Art',
  'Music',
  'Literature',
  'Photography',
  'Video',
  'Game',
  'Software',
  'Other',
] as const

export type IPType = (typeof IP_TYPES)[number]

// Dispute tags
export const DISPUTE_TAGS = [
  { value: 'IMPROPER_REGISTRATION', label: 'Improper Registration', description: 'The IP was registered improperly or without authorization' },
  { value: 'PLAGIARISM', label: 'Plagiarism', description: 'The IP is a copy of another work without proper attribution' },
  { value: 'FALSE_CLAIM', label: 'False Claim', description: 'The registrant falsely claims ownership of this IP' },
  { value: 'LICENSE_VIOLATION', label: 'License Violation', description: 'The IP violates the terms of its license' },
  { value: 'OTHER', label: 'Other', description: 'Other dispute reasons' },
] as const
