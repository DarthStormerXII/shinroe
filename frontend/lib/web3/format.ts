import { formatEther, formatGwei, parseEther, parseGwei, formatUnits, parseUnits } from 'viem'

/**
 * Format an EVM address for display
 */
export function formatAddress(address: string, truncate = true, length = 6): string {
  if (!address) return ''
  
  if (!truncate) return address
  
  if (address.length <= length * 2) return address
  
  return `${address.slice(0, length)}...${address.slice(-length)}`
}

/**
 * Format a token balance for display
 * Uses viem's formatUnits for accurate conversion
 */
export function formatBalance(
  balance: string | number | bigint,
  decimals = 18,
  displayDecimals = 6
): string {
  if (!balance) return '0'
  
  // Convert to bigint if necessary
  let balanceBigInt: bigint
  if (typeof balance === 'bigint') {
    balanceBigInt = balance
  } else if (typeof balance === 'string') {
    try {
      balanceBigInt = BigInt(balance)
    } catch {
      return '0'
    }
  } else {
    balanceBigInt = BigInt(Math.floor(balance))
  }
  
  // Use viem's formatUnits to get the decimal representation
  const formatted = formatUnits(balanceBigInt, decimals)
  const num = parseFloat(formatted)
  
  if (num === 0) return '0'
  
  // For very small numbers, show more decimals
  if (num < 0.01) {
    return num.toFixed(displayDecimals).replace(/\.?0+$/, '')
  }
  
  // For regular numbers, show fewer decimals
  if (num < 1) {
    return num.toFixed(4).replace(/\.?0+$/, '')
  }
  
  // For larger numbers, show even fewer decimals
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + 'M'
  }
  
  if (num >= 1000) {
    return (num / 1000).toFixed(2) + 'K'
  }
  
  return num.toFixed(2).replace(/\.?0+$/, '')
}

/**
 * Format USD value for display
 */
export function formatUSD(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(num)) return '$0'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: num < 0.01 ? 4 : 2,
    maximumFractionDigits: num < 0.01 ? 4 : 2,
  }).format(num)
}

/**
 * Format percentage for display
 */
export function formatPercentage(value: number, decimals = 2): string {
  if (isNaN(value)) return '0%'
  
  return `${value.toFixed(decimals)}%`
}

/**
 * Format time relative to now (e.g., "2 hours ago")
 */
export function formatTimeAgo(timestamp: number): string {
  const now = Date.now()
  const diffMs = now - timestamp * 1000 // timestamp is in seconds
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins === 1) return '1 minute ago'
  if (diffMins < 60) return `${diffMins} minutes ago`
  if (diffHours === 1) return '1 hour ago'
  if (diffHours < 24) return `${diffHours} hours ago`
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 30) return `${diffDays} days ago`
  
  return new Date(timestamp * 1000).toLocaleDateString()
}

/**
 * Format gas price from wei to gwei display
 * Uses viem's formatGwei for accurate conversion
 */
export function formatGasPrice(wei: string | number | bigint): string {
  let weiBigInt: bigint
  
  if (typeof wei === 'bigint') {
    weiBigInt = wei
  } else if (typeof wei === 'string') {
    try {
      weiBigInt = BigInt(wei)
    } catch {
      return '0 gwei'
    }
  } else {
    weiBigInt = BigInt(Math.floor(wei))
  }
  
  const gweiValue = formatGwei(weiBigInt)
  const num = parseFloat(gweiValue)
  
  if (num < 1) {
    return `${(num * 1000).toFixed(0)} mwei`
  }
  
  return `${num.toFixed(1)} gwei`
}

/**
 * Format transaction hash for display
 */
export function formatTxHash(hash: string, length = 10): string {
  if (!hash) return ''
  return `${hash.slice(0, length)}...${hash.slice(-length + 4)}`
}

/**
 * Get color for transaction status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'success':
      return 'text-green-600'
    case 'failed':
    case 'error':
      return 'text-red-600'
    case 'pending':
      return 'text-yellow-600'
    case 'cancelled':
      return 'text-gray-600'
    default:
      return 'text-gray-500'
  }
}

/**
 * Get background color for status badge
 */
export function getStatusBgColor(status: string): string {
  switch (status) {
    case 'confirmed':
    case 'success':
      return 'bg-green-100 text-green-800'
    case 'failed':
    case 'error':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

/**
 * Parse and format token amount from wei/raw units
 * Uses viem's formatUnits for accurate conversion
 */
export function parseTokenAmount(
  amount: string | bigint,
  decimals: number,
  displayDecimals = 6
): string {
  if (!amount || amount === '0') return '0'
  
  try {
    let amountBigInt: bigint
    if (typeof amount === 'bigint') {
      amountBigInt = amount
    } else {
      amountBigInt = BigInt(amount)
    }
    
    // Use our existing formatBalance logic for display formatting
    return formatBalance(amountBigInt, decimals, displayDecimals)
  } catch {
    return '0'
  }
}

/**
 * Convert display amount to wei/raw units
 * Uses viem's parseUnits for accurate conversion
 */
export function toTokenUnits(amount: string, decimals: number): string {
  if (!amount || amount === '0') return '0'
  
  try {
    // parseUnits returns bigint in smallest unit
    const result = parseUnits(amount, decimals)
    return result.toString()
  } catch {
    return '0'
  }
}

/**
 * Validate EVM address
 */
export function isValidAddress(address: string): boolean {
  if (!address) return false
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

/**
 * Validate transaction hash
 */
export function isValidTxHash(hash: string): boolean {
  if (!hash) return false
  return /^0x[a-fA-F0-9]{64}$/.test(hash)
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(1) + 'B'
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(1) + 'M'
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Get price change color
 */
export function getPriceChangeColor(change: number): string {
  if (change > 0) return 'text-green-600'
  if (change < 0) return 'text-red-600'
  return 'text-gray-600'
}

/**
 * Format price change with sign
 */
export function formatPriceChange(change: number): string {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${formatPercentage(change)}`
}

/**
 * Format token amount with proper decimal handling
 * Uses viem's formatUnits for accurate conversion
 */
export function formatTokenAmount(amount: string | number | bigint, decimals = 18): string {
  let amountBigInt: bigint
  
  if (typeof amount === 'bigint') {
    amountBigInt = amount
  } else if (typeof amount === 'string') {
    try {
      amountBigInt = BigInt(amount)
    } catch {
      return '0'
    }
  } else {
    amountBigInt = BigInt(Math.floor(amount))
  }
  
  // Use viem's formatUnits for accurate conversion
  const formatted = formatUnits(amountBigInt, decimals)
  const num = parseFloat(formatted)
  
  if (num === 0) return '0'
  if (num < 0.0001) return '<0.0001'
  if (num < 1) return num.toFixed(4)
  if (num < 1000) return num.toFixed(2)
  
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(num)
}

/**
 * Convert bigint amount to decimal number
 * Uses viem's formatUnits for accurate conversion
 */
export function formatTokenAmountRaw(amount: bigint, decimals = 18): number {
  const formatted = formatUnits(amount, decimals)
  return parseFloat(formatted)
}

/**
 * Format ether amount from wei
 * Uses viem's formatEther for accurate conversion
 */
export function formatEtherAmount(wei: string | number | bigint): string {
  let weiBigInt: bigint
  
  if (typeof wei === 'bigint') {
    weiBigInt = wei
  } else if (typeof wei === 'string') {
    try {
      weiBigInt = BigInt(wei)
    } catch {
      return '0'
    }
  } else {
    weiBigInt = BigInt(Math.floor(wei))
  }
  
  return formatEther(weiBigInt)
}

/**
 * Parse ether amount to wei
 * Uses viem's parseEther for accurate conversion
 */
export function parseEtherAmount(ether: string): bigint {
  try {
    return parseEther(ether)
  } catch {
    return BigInt(0)
  }
}

/**
 * Parse gwei to wei
 * Uses viem's parseGwei for accurate conversion
 */
export function parseGweiAmount(gwei: string): bigint {
  try {
    return parseGwei(gwei)
  } catch {
    return BigInt(0)
  }
}