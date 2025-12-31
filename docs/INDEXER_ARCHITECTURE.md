# Indexer Integration Architecture

## Overview

This document outlines the architecture for integrating **The Graph** and **Goldsky** as indexer providers in the EVM Starter Kit. The goal is to provide a pre-configured, copy-paste-ready setup that allows instant indexing when contracts are deployed.

## Provider Comparison

| Feature | The Graph | Goldsky |
|---------|-----------|---------|
| **Decentralization** | Decentralized network | Centralized (managed) |
| **Pricing** | GRT token + query fees | Subscription-based |
| **Speed** | Standard | Up to 6x faster |
| **Webhooks** | No native support | Native webhook support |
| **Instant Subgraphs** | No | Yes (from ABI) |
| **CLI** | `@graphprotocol/graph-cli` | `@goldskycom/cli` |
| **Uptime** | Varies by indexer | 99.9%+ guaranteed |
| **Custom Chains** | Limited | Extensive support |

## User Flow

```
Home Page
    ↓
Indexer Card (click)
    ↓
Provider Selection Page (/indexer)
    ├── The Graph Card → /indexer/thegraph
    └── Goldsky Card → /indexer/goldsky
            ↓
    Provider-Specific Dashboard
        ├── Subgraph List
        ├── Entity Explorer
        ├── Query Playground
        └── Deployment Wizard
```

## Directory Structure

### 1. Subgraph Development Directory (`/subgraph`)

```
subgraph/
├── README.md                    # Setup instructions
├── package.json                 # Dependencies
├── networks.json                # Multi-network config
├── subgraph.template.yaml       # Manifest template
├── schema.graphql               # GraphQL schema
├── src/
│   ├── mappings/               # Event handlers
│   │   └── contract.ts
│   └── utils/
│       └── helpers.ts
├── abis/                        # Contract ABIs
│   └── Contract.json
├── config/                      # Network-specific configs
│   ├── mainnet.json
│   ├── sepolia.json
│   └── base.json
└── generated/                   # Auto-generated (git-ignored)
    ├── Contract/
    ├── schema.ts
    └── frontend-config.json     # Export for frontend
```

### 2. Frontend Indexer Module (`/frontend/lib/indexer`)

```
frontend/lib/indexer/
├── index.ts                     # Main exports
├── types.ts                     # TypeScript types
├── providers/
│   ├── index.ts                 # Provider exports
│   ├── base.ts                  # Abstract provider interface
│   ├── thegraph.ts              # The Graph implementation
│   └── goldsky.ts               # Goldsky implementation
├── config/
│   ├── store.ts                 # IndexedDB config storage
│   └── networks.ts              # Supported networks
├── services/
│   ├── data-fetcher.ts          # GraphQL data fetching
│   ├── schema-parser.ts         # Schema parsing utilities
│   └── query-builder.ts         # Dynamic query generation
└── hooks/
    ├── use-indexer-provider.ts  # Provider context hook
    ├── use-subgraph-config.ts   # Config management hook
    ├── use-entity-data.ts       # Entity data fetching hook
    └── use-subscription.ts      # Real-time data hook
```

### 3. Frontend UI Components

```
frontend/app/indexer/
├── page.tsx                     # Provider selection page
├── layout.tsx                   # Shared layout
├── [provider]/
│   ├── page.tsx                 # Provider dashboard
│   └── components/
│       ├── subgraph-manager.tsx
│       ├── entity-explorer.tsx
│       ├── query-playground.tsx
│       ├── deployment-guide.tsx
│       └── connection-tester.tsx
└── components/                  # Shared components
    ├── provider-card.tsx
    ├── subgraph-card.tsx
    ├── entity-data-table.tsx
    ├── add-subgraph-dialog.tsx
    └── schema-viewer.tsx
```

## Core Types

```typescript
// Provider Types
type IndexerProvider = 'thegraph' | 'goldsky';

interface ProviderConfig {
  id: IndexerProvider;
  name: string;
  description: string;
  features: string[];
  documentationUrl: string;
  networks: NetworkConfig[];
}

// Subgraph Configuration
interface SubgraphConfig {
  id: string;
  provider: IndexerProvider;
  name: string;
  slug: string;                    // e.g., "my-subgraph/v1"
  network: string;
  endpoint: string;
  studioUrl?: string;              // The Graph Studio URL
  dashboardUrl?: string;           // Goldsky dashboard URL
  schemaContent: string;
  status: 'syncing' | 'synced' | 'failed';
  lastSyncedBlock?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Entity Types (parsed from schema)
interface GraphQLEntity {
  name: string;
  pluralName: string;
  fields: GraphQLField[];
  isTimeseries: boolean;
  directives: string[];
}

interface GraphQLField {
  name: string;
  type: string;
  isRequired: boolean;
  isArray: boolean;
  isRelation: boolean;
  relatedEntity?: string;
}
```

## Provider Interface

```typescript
abstract class IndexerProvider {
  abstract readonly id: string;
  abstract readonly name: string;

  // Configuration
  abstract getNetworks(): NetworkConfig[];
  abstract buildEndpoint(config: EndpointConfig): string;

  // Deployment
  abstract getDeploymentInstructions(): DeploymentStep[];
  abstract getCliCommands(subgraph: SubgraphConfig): string[];

  // Querying
  abstract query<T>(endpoint: string, query: string, variables?: object): Promise<T>;
  abstract testConnection(endpoint: string): Promise<ConnectionStatus>;

  // Metadata
  abstract fetchSubgraphMeta(endpoint: string): Promise<SubgraphMeta>;
}
```

## The Graph Specifics

### Endpoint Structure
```
# Subgraph Studio (development)
https://api.studio.thegraph.com/query/<STUDIO_ID>/<SUBGRAPH_SLUG>/<VERSION>

# Decentralized Network (production)
https://gateway.thegraph.com/api/<API_KEY>/subgraphs/id/<SUBGRAPH_ID>
```

### Deployment Flow
1. Install CLI: `npm install -g @graphprotocol/graph-cli`
2. Initialize: `graph init --studio <SUBGRAPH_SLUG>`
3. Authenticate: `graph auth --studio <DEPLOY_KEY>`
4. Generate types: `graph codegen`
5. Build: `graph build`
6. Deploy: `graph deploy --studio <SUBGRAPH_SLUG>`
7. Publish to network (optional)

### Network Support
- Ethereum Mainnet, Sepolia, Goerli
- Polygon, Polygon Mumbai
- Arbitrum One, Arbitrum Sepolia
- Optimism, Base, Scroll
- And 40+ more networks

## Goldsky Specifics

### Endpoint Structure
```
# Standard endpoint
https://api.goldsky.com/api/public/<PROJECT_ID>/subgraphs/<SUBGRAPH_NAME>/<VERSION>/gn

# Tagged endpoint
https://api.goldsky.com/api/public/<PROJECT_ID>/subgraphs/<SUBGRAPH_NAME>/<TAG>/gn
```

### Deployment Flow
1. Install CLI: `curl https://goldsky.com | sh` (macOS/Linux) or `npm install -g @goldskycom/cli` (Windows)
2. Login: `goldsky login`
3. Deploy from source: `goldsky subgraph deploy <name>/<version> --path .`
4. OR deploy instant subgraph: `goldsky subgraph deploy <name>/<version> --from-abi <path>`
5. Tag version: `goldsky subgraph tag create <name>/<version> --tag prod`

### Unique Features
- **Instant Subgraphs**: Generate from ABI without writing code
- **Webhooks**: Push notifications on entity changes
- **Mirror Pipelines**: Stream data to external databases
- **Tags**: Manage endpoints without URL changes

## Frontend Integration Workflow

### Step 1: Copy Generated Files
After deploying a subgraph, copy the generated config to frontend:

```bash
# From subgraph/generated/
cp frontend-config.json ../frontend/lib/indexer/generated/

# This file contains:
{
  "provider": "thegraph",
  "subgraph": {
    "name": "my-subgraph",
    "endpoint": "https://...",
    "network": "base"
  },
  "schema": {
    "entities": [...],
    "queries": {...}
  }
}
```

### Step 2: Register in Frontend
The config is automatically loaded by the indexer module:

```typescript
// frontend/lib/indexer/config/loader.ts
import config from './generated/frontend-config.json';

export const registeredSubgraphs = [config];
```

### Step 3: Use Hooks in Components
```typescript
import { useEntityData, useSubgraphMeta } from '@/lib/indexer/hooks';

function MyComponent() {
  const { data, loading, error, refetch } = useEntityData('Transfer', {
    first: 10,
    orderBy: 'timestamp',
    orderDirection: 'desc'
  });

  const { blockNumber, syncStatus } = useSubgraphMeta();
}
```

## UI/UX Test Features

The indexer dashboard includes:

1. **Connection Tester**: Verify endpoint accessibility
2. **Schema Viewer**: Browse entities and fields
3. **Entity Explorer**: Browse indexed data with pagination
4. **Query Playground**: Execute custom GraphQL queries
5. **Live Sync Status**: Show syncing progress
6. **Export Tools**: Download query results as JSON/CSV

## Environment Variables

```env
# The Graph
NEXT_PUBLIC_GRAPH_STUDIO_API_KEY=your_studio_key
NEXT_PUBLIC_GRAPH_GATEWAY_API_KEY=your_gateway_key

# Goldsky
NEXT_PUBLIC_GOLDSKY_PROJECT_ID=your_project_id
GOLDSKY_API_KEY=your_api_key  # Server-side only
```

## CLI Scripts

```json
{
  "scripts": {
    "subgraph:codegen": "graph codegen",
    "subgraph:build": "graph build",
    "subgraph:deploy:thegraph": "graph deploy --studio $SUBGRAPH_SLUG",
    "subgraph:deploy:goldsky": "goldsky subgraph deploy $SUBGRAPH_SLUG --path .",
    "subgraph:export": "node scripts/export-frontend-config.js"
  }
}
```

## Migration Path

For users migrating from The Graph to Goldsky (or vice versa):

1. Both providers use the same subgraph format (subgraph.yaml, schema.graphql, mappings)
2. Only endpoint URLs change
3. The frontend abstraction layer handles provider differences
4. Use tags/versions to maintain backwards compatibility
