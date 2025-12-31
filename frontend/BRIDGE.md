# EVM ↔ EVM Bridge

A comprehensive cross-chain bridge application that enables seamless token transfers between different EVM chains with optional execute actions.

## 🚀 Features

### Core Bridging
- **Multi-Chain Support**: Bridge between Ethereum, Polygon, Arbitrum, Optimism, Base, and Sepolia testnet
- **Multiple Protocols**: Powered by Avail Nexus, Wormhole, LayerZero, Across, and Hop protocols
- **Real-time Quotes**: Get instant bridge quotes with fees and time estimates
- **Transaction Tracking**: Monitor bridge status from initiation to completion
- **Intent-Based Bridging**: Advanced Avail Nexus integration with smart routing

### Bridge + Execute
- **Composable Actions**: Execute actions on the destination chain upon token arrival
- **Swap on Arrival**: Automatically swap bridged tokens for other assets
- **Staking Integration**: Stake tokens immediately after bridging
- **Custom Actions**: Execute arbitrary smart contract functions

### Wallet Integration
- **EVM Wallets**: Full Reown (WalletConnect) integration supporting 200+ wallets
- **Auto-Reconnection**: Seamless wallet state persistence
- **Multi-Chain Support**: Automatic network switching and management

## 🏗️ Architecture

### Frontend Components
```
components/bridge/
├── bridge-form.tsx           # Main bridge interface
├── chain-selector.tsx        # Source/destination chain selection
├── token-selector.tsx        # Token selection with balances
├── execute-actions-selector.tsx # Bridge + execute configuration
└── bridge-settings.tsx       # Slippage and advanced settings
```

### Services
```
lib/services/
├── nexus-service.ts          # Avail Nexus SDK integration
├── wormhole-service.ts       # Wormhole SDK integration
└── evm-bridge-service.ts     # EVM blockchain operations
```

### Configuration
```
lib/config/
├── evm-config.ts             # EVM networks and tokens
└── env-config.ts             # Environment configuration
```

## 🚦 Getting Started

### Prerequisites
- Node.js 16+
- MetaMask or another Web3 wallet

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   # Copy the existing .env file or create new ones
   cp .env .env.local
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Navigate to http://localhost:3000/bridge

### Usage
1. **Connect Wallet**: Connect your EVM wallet
2. **Select Networks**: Choose source and destination chains
3. **Choose Token & Amount**: Select token and enter amount to bridge
4. **Configure Execute Actions** (Optional): Set up actions to execute on arrival
5. **Review & Bridge**: Review the quote and initiate the bridge

## 🔧 Configuration

### Supported Networks
- **Mainnet**: Ethereum, Polygon, Arbitrum, Optimism, Base
- **Testnet**: Sepolia

### Supported Tokens
- **Common**: USDC, USDT
- **Native**: ETH (on Ethereum, Arbitrum, Optimism, Base), POL (on Polygon)
- **Wrapped**: WETH, MATIC

### Bridge Protocols
- **Avail Nexus**: Intent-based bridging with advanced bridge-and-execute (30 seconds - 2 minutes) ⭐ **Recommended**
- **Wormhole**: Fast and secure cross-chain messaging (2-5 minutes)
- **LayerZero**: Ultra-light node architecture (1-3 minutes)
- **Across**: Optimistic bridging with instant settlement (30 seconds - 2 minutes)
- **Hop**: Rollup-to-rollup transfers (5-15 minutes)

### Execute Actions
- **Swap**: Exchange tokens using DEXs (Uniswap, SushiSwap, etc.)
- **Stake**: Stake tokens with validators or liquid staking protocols
- **Custom**: Execute arbitrary smart contract functions

## 🛡️ Security Features

### Bridge Security
- **Multiple Protocols**: Battle-tested cross-chain messaging
- **Rate Limiting**: Built-in protection against large transfers
- **Slippage Protection**: Configurable slippage tolerance
- **Address Validation**: Comprehensive address format checking

### Smart Contract Safety
- **Function Validation**: Type checking for Solidity functions
- **Gas Estimation**: Accurate gas cost calculations
- **Error Handling**: Comprehensive error recovery mechanisms

## 🧪 Testing

### Testnet Usage
1. Use testnet networks (Sepolia)
2. Get testnet tokens from faucets:
   - Sepolia: https://sepoliafaucet.com/

3. Test bridge operations with small amounts

### Error Scenarios
- Insufficient balance handling
- Network switching prompts
- Transaction failure recovery
- Wallet disconnection handling

## 🔮 Future Enhancements

### Planned Features
- **Additional Chains**: Support for more EVM chains (Avalanche, BSC, etc.)
- **More Protocols**: Celer cBridge integration
- **Advanced Actions**: DeFi protocol integrations
- **NFT Bridging**: Cross-chain NFT transfers

### Technical Roadmap
- **Real SDK Integration**: Replace mock implementations
- **Production Contracts**: Deploy bridge contracts
- **Mainnet Launch**: Full production deployment

## 🐛 Troubleshooting

### Common Issues
1. **Wallet Not Detected**: Ensure wallet extensions are installed
2. **Transaction Stuck**: Check network congestion and gas prices
3. **Bridge Timeout**: Verify wallet is connected to correct network
4. **Execute Action Fails**: Validate contract addresses and parameters

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('bridge-debug', 'true')
```

## 📚 Technical Details

### Supported Bridge Protocols

#### Avail Nexus ⭐ **Default Provider**
- Uses Avail Nexus SDK for intent-based bridging
- Advanced bridge-and-execute functionality with smart contract interactions
- Unified balance management across all supported chains
- Real-time progress tracking with step-by-step updates
- Automatic allowance management and approval handling
- Intent approval system for secure cross-chain operations
- Support for both mainnet and testnet environments

#### Wormhole Connect
- Uses Wormhole Connect SDK v3.8.5
- Supports testnet and mainnet environments
- Implements VAA (Verifiable Action Approval) verification

#### LayerZero (Stargate)
- Ultra-light node architecture
- Native cross-chain token transfers
- Low fees and fast finality

#### Across Protocol
- Optimistic bridging with instant settlement
- Capital efficient liquidity provision
- Fastest transfer times

#### Hop Protocol
- Rollup-to-rollup transfers
- AMM-based bridging
- Native multi-hop support

### EVM Integration
- Wagmi v2 for wallet connections
- Viem for blockchain interactions
- Real-time balance updates
- Transaction history persistence

### State Management
- React Context for wallet states
- Real-time balance updates
- Transaction history persistence

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**Note**: This is a demo application. Use testnet environments for development and testing. Always verify addresses and amounts before bridging on mainnet.