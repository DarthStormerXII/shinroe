import type { Address, Abi } from 'viem'

// Contract configuration type
export interface ContractConfig {
  address: Address
  name: string
  description?: string
}

// Contract with ABI loaded
export interface Contract extends ContractConfig {
  abi: Abi
}

// Registry type for chain contracts
export type ContractRegistry = Record<string, ContractConfig>

// Dynamic imports for contract configs and ABIs by chain
const contractImports: Record<number, () => Promise<{ default: ContractRegistry }>> = {
  11155111: () => import('./11155111/contracts'),
  80002: () => import('./80002/contracts'),
  4613: () => import('./4613/contracts'),
}

const abiImports: Record<number, Record<string, () => Promise<{ default: Abi }>>> = {
  11155111: {
    HelloWorld: () => import('./11155111/abis/HelloWorld.json').then(m => ({ default: m.default as Abi })),
    FreeMintToken: () => import('./11155111/abis/FreeMintToken.json').then(m => ({ default: m.default as Abi })),
    FreeMintNFT: () => import('./11155111/abis/FreeMintNFT.json').then(m => ({ default: m.default as Abi })),
  },
  80002: {
    HelloWorld: () => import('./80002/abis/HelloWorld.json').then(m => ({ default: (m.default as { abi: Abi }).abi })),
    FreeMintToken: () => import('./80002/abis/FreeMintToken.json').then(m => ({ default: (m.default as { abi: Abi }).abi })),
    FreeMintNFT: () => import('./80002/abis/FreeMintNFT.json').then(m => ({ default: (m.default as { abi: Abi }).abi })),
    ScoreRegistry: () => import('./80002/abis/ScoreRegistry.json').then(m => ({ default: m.default as Abi })),
    EndorsementVault: () => import('./80002/abis/EndorsementVault.json').then(m => ({ default: (m.default as { abi: Abi }).abi })),
    BadgeNFT: () => import('./80002/abis/BadgeNFT.json').then(m => ({ default: (m.default as { abi: Abi }).abi })),
    TokenFactory: () => import('./80002/abis/TokenFactory.json').then(m => ({ default: (m.default as { abi: Abi }).abi })),
    AirdropVault: () => import('./80002/abis/AirdropVault.json').then(m => ({ default: (m.default as { abi: Abi }).abi })),
  },
  4613: {
    ScoreRegistry: () => import('./4613/abis/ScoreRegistry.json').then(m => ({ default: m.default as Abi })),
    EndorsementVault: () => import('./4613/abis/EndorsementVault.json').then(m => ({ default: (m.default as { abi: Abi }).abi })),
    BadgeNFT: () => import('./4613/abis/BadgeNFT.json').then(m => ({ default: (m.default as { abi: Abi }).abi })),
  },
}

// Cache for loaded contracts
const contractCache: Record<number, ContractRegistry> = {}
const abiCache: Record<number, Record<string, Abi>> = {}

// Get all contracts for a chain
export async function getContractsForChain(chainId: number): Promise<Contract[]> {
  // Check if chain has contracts configured
  if (!contractImports[chainId]) {
    return []
  }

  // Load contract registry if not cached
  if (!contractCache[chainId]) {
    const module = await contractImports[chainId]()
    contractCache[chainId] = module.default
  }

  const registry = contractCache[chainId]
  const contracts: Contract[] = []

  // Load ABIs for each contract
  for (const [name, config] of Object.entries(registry)) {
    const abi = await getContractAbi(chainId, name)
    if (abi) {
      contracts.push({
        ...config,
        abi,
      })
    }
  }

  return contracts
}

// Get ABI for a specific contract
export async function getContractAbi(chainId: number, contractName: string): Promise<Abi | null> {
  // Check cache first
  if (abiCache[chainId]?.[contractName]) {
    return abiCache[chainId][contractName]
  }

  // Check if ABI import exists
  if (!abiImports[chainId]?.[contractName]) {
    return null
  }

  // Load ABI
  const module = await abiImports[chainId][contractName]()

  // Initialize cache for chain if needed
  if (!abiCache[chainId]) {
    abiCache[chainId] = {}
  }

  abiCache[chainId][contractName] = module.default
  return module.default
}

// Get a single contract by name
export async function getContractByName(chainId: number, contractName: string): Promise<Contract | null> {
  // Load contract registry
  if (!contractImports[chainId]) {
    return null
  }

  if (!contractCache[chainId]) {
    const module = await contractImports[chainId]()
    contractCache[chainId] = module.default
  }

  const config = contractCache[chainId][contractName]
  if (!config) {
    return null
  }

  const abi = await getContractAbi(chainId, contractName)
  if (!abi) {
    return null
  }

  return {
    ...config,
    abi,
  }
}

// Check if chain has any contracts configured
export function isChainContractsSupported(chainId: number): boolean {
  return chainId in contractImports
}

// Get supported chain IDs for contracts
export function getSupportedContractChainIds(): number[] {
  return Object.keys(contractImports).map(Number)
}
