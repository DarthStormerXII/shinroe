// Story Protocol Contract ABIs
// Minimal ABIs for direct contract interactions

// License Registry ABI - for fetching attached licenses
export const LICENSE_REGISTRY_ABI = [
  {
    inputs: [{ name: 'ipId', type: 'address' }],
    name: 'getAttachedLicenseTermsCount',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'ipId', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'getAttachedLicenseTerms',
    outputs: [
      { name: 'licenseTemplate', type: 'address' },
      { name: 'licenseTermsId', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// PIL Template ABI - for fetching license terms details
export const PIL_TEMPLATE_ABI = [
  {
    inputs: [{ name: 'licenseTermsId', type: 'uint256' }],
    name: 'getLicenseTerms',
    outputs: [
      {
        components: [
          { name: 'transferable', type: 'bool' },
          { name: 'royaltyPolicy', type: 'address' },
          { name: 'defaultMintingFee', type: 'uint256' },
          { name: 'expiration', type: 'uint256' },
          { name: 'commercialUse', type: 'bool' },
          { name: 'commercialAttribution', type: 'bool' },
          { name: 'commercializerChecker', type: 'address' },
          { name: 'commercializerCheckerData', type: 'bytes' },
          { name: 'commercialRevShare', type: 'uint32' },
          { name: 'commercialRevCeiling', type: 'uint256' },
          { name: 'derivativesAllowed', type: 'bool' },
          { name: 'derivativesAttribution', type: 'bool' },
          { name: 'derivativesApproval', type: 'bool' },
          { name: 'derivativesReciprocal', type: 'bool' },
          { name: 'derivativeRevCeiling', type: 'uint256' },
          { name: 'currency', type: 'address' },
          { name: 'uri', type: 'string' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// License Token ABI - for fetching owned license tokens
export const LICENSE_TOKEN_ABI = [
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'index', type: 'uint256' },
    ],
    name: 'tokenOfOwnerByIndex',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getLicenseTermsId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getLicensorIpId',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Dispute Module ABI - for dispute operations
export const DISPUTE_MODULE_ABI = [
  {
    inputs: [],
    name: 'baseArbitrationPolicy',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// ERC20 Allowance ABI - for checking token approvals
export const ERC20_ALLOWANCE_ABI = [
  {
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// SPG NFT Contract ABI - for NFT collection info
export const SPG_NFT_ABI = [
  {
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const
