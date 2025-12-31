import { keccak256, stringToHex, pad, padHex } from "viem";

/**
 * Convert a string to bytes32 format
 * @param input - The string to convert
 * @returns The bytes32 representation
 */
export function stringToBytes32(input: string): `0x${string}` {
  // For empty strings, return empty bytes32
  if (!input) {
    return "0x0000000000000000000000000000000000000000000000000000000000000000";
  }
  
  // For short strings, pad them directly
  if (input.length <= 31) {
    const hex = stringToHex(input);
    return padHex(hex, { size: 32 });
  }
  
  // For longer strings, hash them to fit in 32 bytes
  const hash = keccak256(stringToHex(input));
  return hash;
}

/**
 * Alias for stringToBytes32 - hash a string to bytes32 format
 * @param input - The string to convert
 * @returns The bytes32 representation
 */
export const hashToBytes32 = stringToBytes32;

/**
 * Format token balance for display
 * @param balance - The balance in smallest unit
 * @param decimals - Number of decimals (default 6 for USDC)
 * @returns Formatted balance string
 */
export function formatTokenBalance(balance: bigint, decimals: number = 6): string {
  const divisor = BigInt(10 ** decimals);
  const wholePart = balance / divisor;
  const fractionalPart = balance % divisor;
  
  // Pad fractional part with leading zeros if needed
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0');
  
  // Remove trailing zeros
  const trimmedFractional = fractionalStr.replace(/0+$/, '');
  
  if (trimmedFractional === '') {
    return wholePart.toString();
  }
  
  return `${wholePart}.${trimmedFractional}`;
}