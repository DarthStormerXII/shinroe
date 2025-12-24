/**
 * Tenderly SDK client-side wrapper
 * Now uses server-side API to protect access token
 */

import { tenderlyCache } from './tenderly-cache'

// =============================================================================
// Tenderly Chain Support
// =============================================================================

/**
 * Chains that support Tenderly simulation (111+ networks)
 * Source: https://docs.tenderly.co/supported-networks
 * Last updated: 2025-07
 */
export const TENDERLY_SUPPORTED_CHAINS = [
  // === Mainnets ===
  1,        // Ethereum Mainnet
  10,       // Optimism
  14,       // Flare
  30,       // RSK
  56,       // BNB Smart Chain
  100,      // Gnosis Chain
  130,      // Unichain
  137,      // Polygon
  143,      // Monad
  146,      // Sonic
  196,      // X Layer
  232,      // Lens
  239,      // TAC
  252,      // Fraxtal
  288,      // Boba Ethereum
  324,      // zkSync Era
  360,      // Shape
  480,      // World Chain
  988,      // Stable
  1030,     // Conflux eSpace
  1088,     // Metis Andromeda
  1135,     // Lisk
  1284,     // Moonbeam
  1285,     // Moonriver
  1329,     // Sei
  1514,     // Story
  1776,     // Injective
  1868,     // Soneium
  1923,     // Swellchain
  2020,     // Ronin
  3338,     // peaq
  5000,     // Mantle
  7000,     // ZetaChain
  8008,     // Polynomial
  8453,     // Base
  9069,     // ApexFusion Nexus
  9745,     // Plasma
  13371,    // Immutable zkEVM
  33111,    // Curtis
  33139,    // ApeChain
  42161,    // Arbitrum One
  42170,    // Arbitrum Nova
  42220,    // Celo
  43114,    // Avalanche C-Chain
  48900,    // Zircuit
  50104,    // Sophon
  56288,    // Boba BNB
  57073,    // Ink
  59144,    // Linea
  60808,    // BOB
  80094,    // Berachain
  81457,    // Blast
  98866,    // Plume
  129399,   // Katana Tatara
  167000,   // Taiko
  534352,   // Scroll
  737373,   // Katana Bokuto
  747474,   // Katana
  5064014,  // Ethereal
  21000000, // Corn

  // === Testnets ===
  31,       // RSK Testnet
  71,       // Conflux eSpace Testnet
  97,       // BNB Testnet
  300,      // zkSync Sepolia
  1287,     // Moonbase Alpha
  1301,     // Unichain Sepolia
  1315,     // Story Aeneid
  1328,     // Sei Atlantic-2
  1439,     // Injective Testnet
  1924,     // Swellchain Sepolia
  1946,     // Soneium Minato
  1952,     // X Layer Testnet
  2021,     // Ronin Testnet
  2201,     // Stable Testnet
  2391,     // TAC SPB Testnet
  4202,     // Lisk Sepolia
  4801,     // World Chain Sepolia
  5003,     // Mantle Sepolia
  7001,     // ZetaChain Testnet
  9070,     // ApexFusion Nexus Testnet
  9728,     // Boba BNB Testnet
  9746,     // Plasma Testnet
  9990,     // peaq agung
  10143,    // Monad Testnet
  10200,    // Gnosis Chiado
  11011,    // Shape Sepolia
  11142220, // Celo Sepolia
  11155111, // Ethereum Sepolia
  11155420, // Optimism Sepolia
  13473,    // Immutable Testnet
  28882,    // Boba Sepolia
  37111,    // Lens Testnet
  43113,    // Avalanche Fuji
  48898,    // Zircuit Garfield
  57054,    // Sonic Blaze
  59141,    // Linea Sepolia
  59902,    // Metis Sepolia
  80002,    // Polygon Amoy
  80008,    // Polynomial Sepolia
  80069,    // Bepolia
  84532,    // Base Sepolia
  98867,    // Plume Testnet
  421614,   // Arbitrum Sepolia
  534351,   // Scroll Sepolia
  560048,   // Ethereum Hoodi
  531050104, // Sophon Testnet
  763373,   // Ink Sepolia
  808813,   // BOB Testnet
  13374202, // Ethereal Testnet
  21000001, // Corn Testnet
] as const

/**
 * Check if Tenderly simulation is supported for a chain
 */
export function isTenderlySupported(chainId: number): boolean {
  return TENDERLY_SUPPORTED_CHAINS.includes(chainId as typeof TENDERLY_SUPPORTED_CHAINS[number])
}

// =============================================================================
// Tenderly Types
// =============================================================================

// Tenderly types - these are not exported from SDK so we define them locally
interface SimulateTransactionParams {
  from: string;
  to: string;
  input?: string;
  value?: string;
  gas?: number;
  gas_price?: string;
  network_id: number;
  save?: boolean;
  save_if_fails?: boolean;
  simulation_type?: string;
  state_objects?: Array<{
    contract: string;
    storage: Record<string, string>;
  }>;
  block_number?: number;
}

interface SimulationData {
  success?: boolean;
  status?: boolean;
  gasUsed?: number;
  gas_used?: number;
  gasLimit?: number;
  gas?: number;
  blockNumber?: number;
  block_number?: number;
  logs?: unknown[];
  stateChanges?: unknown[];
  state_objects?: unknown[];
  assetChanges?: unknown[];
  asset_changes?: unknown[];
  callTrace?: unknown;
  call_trace?: unknown;
  trace?: unknown;
  errorMessage?: string;
  error_message?: string;
  errorInfo?: unknown;
  error_info?: unknown;
}

interface SimulationResponse {
  simulation: SimulationData;
}

// Mock Tenderly client interface for compatibility
export interface TenderlyClient {
  simulator: {
    simulateTransaction: (params: SimulateTransactionParams) => Promise<SimulationResponse>;
  };
}

// Create a mock client that calls our server-side API
export function getTenderlyClient(): TenderlyClient {
  return {
    simulator: {
      simulateTransaction: async (params: SimulateTransactionParams): Promise<SimulationResponse> => {
        try {
          if (!params || !params.from || !params.to) {
            throw new Error('Invalid simulation parameters: missing required fields');
          }
          
          // Check cache first
          const cachedResult = tenderlyCache.get({
            from: params.from as `0x${string}`,
            to: params.to as `0x${string}`,
            input: params.input,
            value: params.value,
            network_id: params.network_id,
            block_number: params.block_number,
          });
          
          if (cachedResult) {
            return cachedResult;
          }
          console.log("Tenderly Params")
          console.log(params)
          
        const response = await fetch('/api/tenderly/simulate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(params),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Tenderly API error: ${response.status}`);
          }

          const data = await response.json();
          
          if (!data.success) {
            throw new Error(data.error || 'Simulation failed');
          }

          // Return the raw simulation data in the expected format
          const result = {
            simulation: data.raw || data.simulation,
          } as SimulationResponse;
          
          // Cache the successful result
          tenderlyCache.set({
            from: params.from as `0x${string}`,
            to: params.to as `0x${string}`,
            input: params.input,
            value: params.value,
            network_id: params.network_id,
            block_number: params.block_number,
          }, result);
          
          return result;
        } catch (error) {
          console.log("Tenderly Error")
          console.log(error)
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('Failed to simulate transaction:', errorMessage);
          throw error;
        }
      },
    },
  };
}

// Helper function to format simulation results
export function formatSimulationResult(simulation: SimulationResponse) {
  const simulationData = simulation?.simulation || simulation || {}
  return {
    success: simulationData.success || simulationData.status === true,
    gasUsed: simulationData.gasUsed || simulationData.gas_used,
    gasLimit: simulationData.gasLimit || simulationData.gas,
    blockNumber: simulationData.blockNumber || simulationData.block_number,
    logs: simulationData.logs || [],
    stateChanges: simulationData.stateChanges || simulationData.state_objects || [],
    assetChanges: simulationData.assetChanges || simulationData.asset_changes || [],
    callTrace: simulationData.callTrace || simulationData.call_trace || simulationData.trace,
    errorMessage: simulationData.errorMessage || simulationData.error_message,
    errorInfo: simulationData.errorInfo || simulationData.error_info,
  };
}

// Export types for use in other modules
export type { SimulateTransactionParams, SimulationResponse };