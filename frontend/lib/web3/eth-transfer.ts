/**
 * Utilities for ETH transfers
 */

import type { PublicClient, WalletClient, Address, Hex, TransactionReceipt } from 'viem'
import { getTenderlyClient, formatSimulationResult, isTenderlySupported } from './tenderly'

export interface ETHTransferParams {
  to: Address
  value: bigint
}

export interface ETHTransferResult {
  hash: Hex
  receipt: TransactionReceipt
}

/**
 * Simulate ETH transfer using Tenderly
 */
export async function simulateETHTransfer(
  publicClient: PublicClient,
  from: Address,
  params: ETHTransferParams,
  chainId?: number
) {
  try {
    // Check if Tenderly is supported for this chain
    if (chainId && !isTenderlySupported(chainId)) {
      console.log('Tenderly simulation not supported for this chain, using gas estimation');
      
      // Use gas estimation for Flow EVM
      const gas = await publicClient.estimateGas({
        account: from,
        to: params.to,
        value: params.value,
      })
      
      return {
        success: true,
        gasUsed: gas.toString(),
        gasLimit: ((gas * 120n) / 100n).toString(), // 20% buffer
        // Note: Tenderly simulation not supported for Flow EVM
      }
    }
    
    // Try Tenderly simulation first
    try {
      const tenderly = getTenderlyClient()
      const blockNumber = await publicClient.getBlockNumber()
      
      const simulationParams = {
        from,
        to: params.to,
        value: `0x${params.value.toString(16)}`,
        block_number: Number(blockNumber),
        network_id: chainId || 1,
      }
      
      const simulation = await tenderly.simulator.simulateTransaction(simulationParams)
      const formattedResult = formatSimulationResult(simulation)
      
      if (formattedResult.success) {
        return {
          success: true,
          gasUsed: formattedResult.gasUsed?.toString(),
          gasLimit: formattedResult.gasLimit?.toString(),
          stateChanges: formattedResult.stateChanges,
          assetChanges: formattedResult.assetChanges,
          logs: formattedResult.logs,
        }
      } else {
        // Tenderly returned failure - fall back to gas estimation
        console.warn('Tenderly simulation returned failure, falling back to estimate:', formattedResult.errorMessage)
        throw new Error(formattedResult.errorMessage || 'Tenderly returned failure')
      }
    } catch (tenderlyError) {
      console.warn('Tenderly simulation failed, falling back to estimate:', tenderlyError instanceof Error ? tenderlyError.message : String(tenderlyError))

      // Fall back to gas estimation
      const gas = await publicClient.estimateGas({
        account: from,
        to: params.to,
        value: params.value,
      })

      return {
        success: true,
        gasUsed: gas.toString(),
        gasLimit: ((gas * 120n) / 100n).toString(), // 20% buffer
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Simulation failed',
    }
  }
}

/**
 * Execute ETH transfer
 * @param simulationResult - Optional pre-computed simulation result to avoid duplicate calls
 */
export async function transferETH(
  publicClient: PublicClient,
  walletClient: WalletClient,
  from: Address,
  params: ETHTransferParams,
  simulationResult?: any
): Promise<ETHTransferResult> {
  // Optionally validate simulation result if provided
  if (simulationResult && !simulationResult.success) {
    throw new Error(`Transaction simulation failed: ${simulationResult.error}`)
  }
  
  // Send the transaction
  const hash = await walletClient.sendTransaction({
    account: from,
    to: params.to,
    value: params.value,
    chain: walletClient.chain,
  })
  
  // Wait for confirmation
  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 1,
  })
  
  if (receipt.status === 'reverted') {
    throw new Error('Transaction reverted')
  }
  
  return { hash, receipt }
}

/**
 * Estimate gas for ETH transfer
 * @param simulationResult - Optional pre-computed simulation result to avoid duplicate calls
 */
export async function estimateETHTransferGas(
  publicClient: PublicClient,
  from: Address,
  params: ETHTransferParams,
  simulationResult?: any
): Promise<bigint> {
  // Use provided simulation result if available
  if (simulationResult?.success && simulationResult.gasUsed) {
    // Use Tenderly's gas estimate with 20% buffer
    const tenderlyGas = BigInt(simulationResult.gasUsed);
    return (tenderlyGas * 120n) / 100n;
  }
  
  const gas = await publicClient.estimateGas({
    account: from,
    to: params.to,
    value: params.value,
  })
  
  // Add 20% buffer
  return (gas * 120n) / 100n
}