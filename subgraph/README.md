# Subgraph Development

This directory contains the subgraph configuration for indexing your smart contracts.

## Quick Start

### 1. Install Dependencies

```bash
# Install The Graph CLI
npm install -g @graphprotocol/graph-cli

# Or install Goldsky CLI
curl https://goldsky.com | sh  # macOS/Linux
npm install -g @goldskycom/cli  # Windows
```

### 2. Configure Your Subgraph

1. Copy your contract ABI to `abis/Contract.json`
2. Update `config/mainnet.json` with your contract address and start block
3. Modify `schema.graphql` to define your entities
4. Update `src/mappings/contract.ts` with your event handlers

### 3. Build & Deploy

```bash
# Install dependencies
npm install

# Generate types
npm run codegen

# Build
npm run build

# Deploy to The Graph Studio
npm run deploy:thegraph

# Or deploy to Goldsky
npm run deploy:goldsky
```

## Directory Structure

```
subgraph/
├── README.md               # This file
├── package.json            # Dependencies and scripts
├── subgraph.template.yaml  # Manifest template
├── schema.graphql          # GraphQL schema
├── networks.json           # Multi-network configuration
├── abis/                   # Contract ABIs
│   └── Contract.json
├── config/                 # Network-specific configs
│   ├── mainnet.json
│   ├── sepolia.json
│   └── base.json
├── src/
│   └── mappings/           # Event handlers
│       └── contract.ts
└── scripts/
    └── export-frontend-config.js
```

## Configuration Files

### `config/<network>.json`

Define network-specific values:

```json
{
  "network": "mainnet",
  "address": "0x...",
  "startBlock": 12345678
}
```

### `schema.graphql`

Define your entities:

```graphql
type Transfer @entity {
  id: ID!
  from: Bytes!
  to: Bytes!
  value: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
}
```

### `src/mappings/contract.ts`

Handle events:

```typescript
import { Transfer as TransferEvent } from "../generated/Contract/Contract"
import { Transfer } from "../generated/schema"

export function handleTransfer(event: TransferEvent): void {
  let entity = new Transfer(event.transaction.hash.toHex())
  entity.from = event.params.from
  entity.to = event.params.to
  entity.value = event.params.value
  entity.timestamp = event.block.timestamp
  entity.blockNumber = event.block.number
  entity.save()
}
```

## Frontend Integration

After deploying, run the export script to generate frontend configuration:

```bash
npm run export
```

This creates `generated/frontend-config.json` which you can copy to `frontend/lib/indexer/generated/`.

## Useful Commands

```bash
# Generate code from schema and ABIs
npm run codegen

# Build the subgraph
npm run build

# Deploy to The Graph Studio
npm run deploy:thegraph

# Deploy to Goldsky
npm run deploy:goldsky

# Export frontend config
npm run export

# Prepare for specific network
npm run prepare:mainnet
npm run prepare:sepolia
npm run prepare:base
```

## Resources

- [The Graph Documentation](https://thegraph.com/docs/)
- [Goldsky Documentation](https://docs.goldsky.com/)
- [AssemblyScript API Reference](https://thegraph.com/docs/en/subgraphs/developing/assemblyscript-api/)
