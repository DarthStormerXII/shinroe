---
description: Deploy subgraphs and sync endpoints to frontend
argument: <optional: goldsky|thegraph (default: goldsky)>
---

# Subgraph Deployment

**SOURCE OF TRUTH:** `contracts/deployment.config.json`

## Prerequisites

- Load `thegraph-dev` or `goldsky-dev` skill based on target
- Read `contracts/deployment.config.json` for contract addresses
- Ensure subgraph exists in `subgraphs/` directory

### Context7 Lookups (if unsure about syntax)

Before executing, look up current syntax if needed:
- TheGraph CLI: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/graphprotocol/graph-tooling", topic: "graph deploy" })`
- Graph codegen: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/graphprotocol/graph-tooling", topic: "graph codegen" })`

## TheGraph: Two-Phase Flow

### Phase 1: Show Requirements (IMMEDIATE)

On `/deploy-subgraphs thegraph`, immediately scan and output:

```
## TheGraph Studio Setup Required

### 1. Create Subgraphs
Go to https://thegraph.com/studio and create:

| Subgraph | Suggested Slug |
|----------|----------------|
| FreeMint Token | `freemint-token` |

### 2. Add Deploy Keys to `.env`

| Variable | For |
|----------|-----|
| `THEGRAPH_DEPLOY_KEY_FREEMINT_TOKEN` | freemint-token |

**Reply when ready:**
- "done" - used suggested slugs
- "done, but I named freemint-token as xyz" - changed slug names
```

**STOP and wait for user response.**

### Phase 2: Deploy (After User Responds)

1. Parse response for slug changes (e.g., "named X as Y" → use Y)
2. Verify deploy keys exist in `.env`
3. Build and deploy each subgraph
4. Update `frontend/constants/subgraphs/[chainId]/[name].ts`
5. Test query

## Goldsky: Direct Deploy

On `/deploy-subgraphs` or `/deploy-subgraphs goldsky`, deploy immediately (no setup phase).

## Env Variable Pattern

`THEGRAPH_DEPLOY_KEY_<SLUG_SCREAMING_SNAKE>` (e.g., `freemint-token` → `THEGRAPH_DEPLOY_KEY_FREEMINT_TOKEN`)

---

## Success Checklist

Before marking this task complete, verify:

- [ ] Subgraph manifest (`subgraph.yaml`) has correct contract addresses
- [ ] Subgraph builds successfully: `graph codegen && graph build`
- [ ] Subgraph deployed to indexer (TheGraph Studio or Goldsky)
- [ ] Subgraph is syncing (check dashboard for sync status)
- [ ] Frontend endpoint updated in `frontend/constants/subgraphs/{chainId}/`
- [ ] Test query returns expected data

**Run this to confirm (Goldsky):**
```bash
cd subgraphs/{name}
graph codegen && graph build && echo "Build passed"
goldsky subgraph list | grep {name}
```

**Run this to confirm (TheGraph):**
```bash
cd subgraphs/{name}
graph codegen && graph build && echo "Build passed"
# Check sync status on https://thegraph.com/studio
```

---

## If This Fails

### Error: "graph: command not found"
**Cause:** Graph CLI not installed globally.
**Fix:**
```bash
npm install -g @graphprotocol/graph-cli
```

### Error: "Failed to compile data source mapping"
**Cause:** AssemblyScript type errors in mapping handlers.
**Fix:**
1. Check event parameter types match ABI
2. Verify entity field types match schema
3. Run `graph codegen` to regenerate types

### Error: "ABI not found"
**Cause:** ABI file missing or wrong path in `subgraph.yaml`.
**Fix:**
1. Copy ABI from contracts: `cp contracts/out/{Contract}.sol/{Contract}.json subgraphs/{name}/abis/`
2. Update `abis` section in `subgraph.yaml`

### Error: "Authentication failed" (TheGraph)
**Cause:** Deploy key not set or invalid.
**Fix:**
1. Get deploy key from TheGraph Studio dashboard
2. Set: `export THEGRAPH_DEPLOY_KEY_XXX=...`
3. Or run: `graph auth --studio {key}`

### Error: "Authentication failed" (Goldsky)
**Cause:** API key not set.
**Fix:**
1. Get API key from Goldsky dashboard
2. Run: `goldsky login`

### Error: "Subgraph name not found" (TheGraph)
**Cause:** Subgraph not created on TheGraph Studio.
**Fix:**
1. Go to https://thegraph.com/studio
2. Create new subgraph with the slug name
3. Retry deploy

### Error: "Start block is ahead of chain head"
**Cause:** `startBlock` in manifest is in the future.
**Fix:**
1. Get deployment block: `cat contracts/broadcast/Deploy.s.sol/{chainId}/run-latest.json | jq '.transactions[0].receipt.blockNumber'`
2. Update `startBlock` in `subgraph.yaml`

### Error: Query returns empty after deploy
**Cause:** Subgraph not synced or wrong address.
**Fix:**
1. Check sync status on indexer dashboard
2. Verify `address` in `subgraph.yaml` matches deployed contract
3. Verify `startBlock` is at or before first event
4. Wait for sync to complete

### General Debugging

1. Run `graph codegen` first to catch type errors early
2. Check indexer logs for runtime errors
3. Verify contract addresses match deployment
4. Test queries in indexer's GraphQL playground
5. If stuck, delete and redeploy subgraph
