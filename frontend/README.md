# VeryChain EVM Starter Kit - WEPIN Auth

This is a Next.js starter kit for building dApps on VeryChain mainnet with WEPIN authentication and VeryChat API integration.

## Features

- WEPIN wallet authentication (only auth supporting VeryChain mainnet)
- VeryChat member authentication API testing
- Environment-based chain enabling
- Tailwind CSS with dark mode
- Pre-built Web3 UI components
- Transaction simulation with Tenderly
- Supabase integration ready

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm
- WEPIN app credentials

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your configuration

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## WEPIN Auth Setup

1. Get WEPIN credentials from https://wepin.io
2. Set environment variables:
```env
NEXT_PUBLIC_WEPIN_APP_ID=your-app-id
NEXT_PUBLIC_WEPIN_APP_KEY=your-app-key
```

## VeryChat Auth Testing

1. Get VeryChat project ID
2. Set environment variable:
```env
NEXT_PUBLIC_VERYCHAT_PROJECT_ID=your-project-id
```
3. Navigate to /verychat to test authentication

## Chain Configuration

Only chains with configured RPC URLs will be enabled:

```env
# Enable VeryChain (required)
NEXT_PUBLIC_VERYCHAIN_RPC_URL=https://rpc.verychain.io

# Enable Ethereum (optional)
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth.llamarpc.com

# Enable Polygon (optional)
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-rpc.com
```

## Project Structure

```
frontend/
  app/
    page.tsx            # Main landing page
    basic-web3/         # Basic Web3 testing
    contracts/          # Contract interactions
    indexer/            # Subgraph queries
    verychat/           # VeryChat auth testing
  components/
    verychat/           # VeryChat components
    web3/               # Web3 UI components
    ui/                 # Reusable UI components
  lib/
    web3/               # WEPIN auth implementation
    services/           # API services
    hooks/              # Custom React hooks
```

## Available Pages

- `/` - Feature selection
- `/basic-web3` - Wallet connection and basic operations
- `/contracts` - Contract interaction testing
- `/indexer` - Subgraph query testing
- `/verychat` - VeryChat authentication testing

## License

MIT
