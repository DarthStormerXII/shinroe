# Shinroe (신뢰) - Reference Implementation

**⭐ This is the REFERENCE IMPLEMENTATION for all VeryChain dApps.**

All other projects should copy patterns, structure, and code from this project.

---

## Stack Overview

| Layer | Technology | Notes |
|-------|------------|-------|
| **Auth** | WEPIN | Only auth layer supporting VeryChain mainnet |
| **Chat** | VeryChat API | Messaging integration |
| **Indexing** | TheGraph (self-hosted) | No external indexers support VeryChain |
| **Contracts** | Foundry | EVM compatible |
| **Frontend** | Next.js + shadcn/ui | Standard template |

---

## Critical Rules

**NEVER mock or create placeholder code.** If blocked, STOP and explain why.

- No scope creep - only implement what's requested
- No assumptions - ask for clarification
- Follow existing patterns in codebase
- Verify work before completing
- Use conventional commits (`feat:`, `fix:`, `refactor:`)

---

## Strategy Mode & Prompts

Use `/strategy` to generate implementation prompts for multi-step tasks.

### Generate Prompts
```bash
/strategy setup full integration
/strategy integrate verychat api
/strategy setup local graph node
```

### Run Prompts
```bash
/run-prompt 1
/run-prompt 2
```

Prompts stored in: `.claude/prompts/1.md, 2.md, ...`
Auto-deleted on success.

---

## Integration Phases

| Phase | Description | Skill |
|-------|-------------|-------|
| 1 | WEPIN auth setup for VeryChain | `web3-integration` |
| 2 | VeryChat API integration | `ui-dev` |
| 3 | Local graph-node setup | `thegraph-dev` |
| 4 | Contract deployment to VeryChain | `contracts-dev` |
| 5 | Subgraph for contract events | `thegraph-dev` |
| 6 | Frontend subgraph queries | `subgraph-frontend` |

---

## File Size Limits (CRITICAL)

**HARD LIMIT: 300 lines per file maximum. NO EXCEPTIONS.**

| File Type | Max Lines | Purpose |
|-----------|-----------|---------|
| `page.tsx` | 150 | Orchestration only |
| `*-tab.tsx` | 250 | Tab components |
| `use-*.ts` | 200 | Hooks with business logic |
| `types.ts` | 100 | Type definitions |
| `constants.ts` | 150 | ABIs, addresses |
| `*-service.ts` | 300 | API services |

---

## Documentation Lookup (MANDATORY)

**ALWAYS use Context7 MCP for documentation. NEVER use WebFetch for docs.**

```
1. First resolve the library ID:
   mcp__context7__resolve-library-id({ libraryName: "viem" })

2. Then fetch the docs:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/wevm/viem",
     topic: "sendTransaction",
     mode: "code"
   })
```

### Libraries for This Project

| Library | Context7 ID |
|---------|-------------|
| viem | `/wevm/viem` |
| wagmi | `/wevm/wagmi` |
| Next.js | `/vercel/next.js` |
| shadcn/ui | `/shadcn-ui/ui` |
| TheGraph | `/graphprotocol/graph-node` |

---

## Skills (LOAD BEFORE STARTING TASKS)

| Task Type | Required Skill |
|-----------|----------------|
| **Strategy Planning** | `strategy` |
| **UI/Frontend** | `ui-dev` |
| **Smart Contract Interactions** | `web3-integration` |
| **Smart Contract Development** | `contracts-dev` |
| **Subgraph Development** | `thegraph-dev` |
| **Subgraph Queries** | `subgraph-frontend` |
| **E2E Testing** | `playwright-testing` |

---

## VeryChain Configuration

```typescript
// VeryChain mainnet
export const verychain = {
  id: /* VeryChain chain ID */,
  name: 'VeryChain',
  network: 'verychain',
  nativeCurrency: {
    name: 'VERY',
    symbol: 'VERY',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['/* VeryChain RPC URL */'] },
  },
  blockExplorers: {
    default: { name: 'VeryScan', url: '/* Explorer URL */' },
  },
}
```

---

## WEPIN Auth Implementation

WEPIN is required because it's the only auth layer that supports VeryChain mainnet.

```typescript
// lib/web3/wepin-config.ts
import { WepinSDK } from '@aspect-solutions/wepin-sdk'

export const wepinConfig = {
  appId: process.env.NEXT_PUBLIC_WEPIN_APP_ID!,
  appKey: process.env.NEXT_PUBLIC_WEPIN_APP_KEY!,
  // VeryChain network config
}
```

---

## VeryChat API Integration

```typescript
// lib/services/verychat-service.ts
class VeryChatService {
  private baseUrl = 'https://api.verychat.io'  // or correct endpoint

  async sendMessage(params: SendMessageParams) { /* ... */ }
  async getMessages(conversationId: string) { /* ... */ }
  async createConversation(participants: string[]) { /* ... */ }
}

export const verychatService = new VeryChatService()
```

---

## Local Graph Node Setup

Since no external indexers support VeryChain, we use self-hosted graph-node:

```yaml
# graph-node/docker-compose.yml
version: '3'
services:
  graph-node:
    image: graphprotocol/graph-node
    environment:
      ethereum: 'verychain:http://host.docker.internal:8545'  # or RPC
      ipfs: 'http://ipfs:5001'
      postgres_host: postgres
  ipfs:
    image: ipfs/kubo
  postgres:
    image: postgres
```

---

## Directory Structure

```
basics/wepin/
├── frontend/
│   ├── app/
│   │   ├── page.tsx              # Main app
│   │   ├── chat/                 # VeryChat integration
│   │   └── indexer/              # Subgraph queries
│   ├── lib/
│   │   ├── web3/                 # WEPIN auth implementation
│   │   └── services/
│   │       ├── verychat-service.ts
│   │       └── subgraph-service.ts
│   └── constants/
│       └── verychain/
├── contracts/                    # Foundry contracts
├── graph-node/                   # Self-hosted graph-node
│   └── docker-compose.yml
└── subgraph/                     # Subgraph for VeryChain
    ├── schema.graphql
    ├── subgraph.yaml
    └── src/mapping.ts
```

---

## Environment Variables

```env
# WEPIN Auth
NEXT_PUBLIC_WEPIN_APP_ID=
NEXT_PUBLIC_WEPIN_APP_KEY=

# VeryChain
NEXT_PUBLIC_VERYCHAIN_RPC_URL=
PRIVATE_KEY=

# VeryChat API
NEXT_PUBLIC_VERYCHAT_API_KEY=
NEXT_PUBLIC_VERYCHAT_API_URL=

# Local Graph Node
GRAPH_NODE_URL=http://localhost:8000
IPFS_URL=http://localhost:5001
```

---

## DO NOT

- **Create files over 300 lines**
- **Use WebFetch for documentation** - Use Context7
- **Skip loading skills**
- **Guess SDK/API usage** - Look it up via Context7
- Import from `wagmi` directly (use abstraction layer)
- Mock WEPIN/VeryChat implementations

## DO

- **Use `/strategy`** to plan multi-step integrations
- **Load skills FIRST** before starting work
- **Use Context7 MCP** for all documentation
- Keep files under 300 lines
- Follow the integration phases in order
- Self-host graph-node for VeryChain indexing

---

## Issues & Learnings System

### Before Starting These Tasks, Read Relevant Issues:

| Task Type | Read First |
|-----------|------------|
| i18n / multilingual | `docs/issues/ui/README.md` → UI-004 |
| Korean localization | `docs/issues/verychain/README.md` → VERY-001 |
| VeryChat transactions | `docs/issues/verychain/README.md` → VERY-002 |
| Subgraph integration | `docs/issues/subgraph/README.md` → SUBGRAPH-001 |
| Subgraph deployment | `docs/issues/subgraph/README.md` → SUBGRAPH-001 (local graph-node only!) |
| Contract deployment | `docs/issues/contracts/README.md` → CONTRACT-001 |
| Contract testing | `docs/issues/contracts/README.md` → CONTRACT-001 (get PRIVATE_KEY first!) |

### When to Document a New Learning

**DOCUMENT if ALL of these are true:**
1. It caused repeated back-and-forth debugging (wasted user's time)
2. It's non-obvious (you wouldn't naturally avoid it)
3. It will happen again in future projects
4. The fix isn't easily searchable in official docs

**DO NOT document:**
- Basic syntax errors or typos
- Standard patterns you already know
- One-off edge cases unlikely to repeat
- Things covered in official documentation
- User preference issues (not bugs)

### How to Add a Learning

1. Determine category: `ui/`, `contracts/`, `subgraph/`, or `verychain/`
2. Read the existing README.md in that folder
3. Add new issue following the format (increment ID)
4. Keep it focused: problem → pitfall examples → fix
5. No basic setup code - only the non-obvious traps

### Issue Quality Bar

Ask yourself: *"If I started a fresh session and didn't read this, would I make the same mistake again?"*
- If YES → Document it
- If NO → Don't clutter the docs

### Quick Document Command

After a painful debugging session, user can run:
```
/document-learning
```
This triggers Claude to analyze the conversation and document the issue automatically.
