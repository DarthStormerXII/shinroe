// Wormhole Bridge Service - Stub implementation
// TODO: Implement full Wormhole SDK integration when needed

export interface WormholeQuoteParams {
  sourceChainId: number
  destinationChainId: number
  token: `0x${string}` | 'native'
  amount: bigint
  recipient: `0x${string}`
}

export interface WormholeQuote {
  bridgeFee: bigint
  relayerFee: bigint
  estimatedTime: number
}

export interface WormholeTransferParams extends WormholeQuoteParams {
  slippage?: number
  protocol?: WormholeProtocol
}

export type WormholeProtocol = 'TokenBridge' | 'CCTPBridge' | 'NttBridge'

class WormholeService {
  async getQuote(_params: WormholeQuoteParams): Promise<WormholeQuote> {
    // Stub implementation - returns mock quote
    return {
      bridgeFee: BigInt(0),
      relayerFee: BigInt(0),
      estimatedTime: 900, // 15 minutes
    }
  }

  async executeBridge(
    _params: WormholeQuoteParams & { signer: unknown }
  ): Promise<{ txHash: string }> {
    throw new Error('Wormhole bridge not yet implemented')
  }

  areChainsCompatible(_sourceChainId: number, _destChainId: number): boolean {
    // Stub - return true for now
    return true
  }
}

export const wormholeService = new WormholeService()
