---
name: thegraph-dev
description: Build and deploy subgraphs to TheGraph Studio for indexing blockchain events. Use when creating subgraphs, writing mappings, or deploying to TheGraph.
---

# TheGraph Development Skill

## BEFORE WRITING ANY CODE

**MANDATORY: Use Context7 MCP for all documentation lookups.**

```
1. Resolve library ID:
   mcp__context7__resolve-library-id({ libraryName: "graph-cli" })
   mcp__context7__resolve-library-id({ libraryName: "graph-ts" })

2. Fetch docs for your specific task:
   mcp__context7__get-library-docs({
     context7CompatibleLibraryID: "/graphprotocol/graph-tooling",
     topic: "event handlers",
     mode: "code"
   })

3. NEVER guess graph-ts types or APIs - verify with Context7 first
4. If Context7 doesn't have the library, state this and ask user for docs
```

---

## When to Use This Skill

Load this skill when:
- Creating a new subgraph from scratch
- Writing event handler mappings
- Deploying subgraphs to TheGraph Studio
- Debugging subgraph indexing issues
- Writing Matchstick tests

## Critical Rules

1. **Read deployment.config.json** - Get addresses and network info from single source of truth
2. **Copy ABIs from contracts/out/** - Never mock ABI data
3. **NO markdown/temp files** - Only code files
4. **Use immutable entities** - For event logs (much faster)
5. **Check null before access** - Subgraph STOPS on any error

## Decision Tree

```
Creating a subgraph?
├─ Create folder structure
├─ Copy ABIs from contracts/out/
├─ Write schema.graphql (entities)
├─ Write subgraph.yaml (manifest)
├─ Write mappings (handlers)
└─ Build and deploy

Writing schema?
├─ Event logs → @entity(immutable: true)
├─ Aggregations → Regular @entity
├─ Relationships → Use @derivedFrom
└─ Addresses → Use Bytes! type

Writing mappings?
├─ Load or create entity
├─ Check null before access
├─ Set all required fields
├─ Save entity
└─ Never use external calls

Deploying?
├─ graph codegen → Generate types
├─ graph build → Compile to WASM
├─ graph test → Run Matchstick tests
└─ graph deploy --studio → Push to Studio
```

## Common Tasks

### Creating a New Subgraph

1. Look up graph-cli commands via Context7
2. Create folder structure under `subgraphs/[name]/`
3. Copy ABIs from `contracts/out/` to `abis/`
4. Write schema.graphql with entity definitions
5. Write subgraph.yaml manifest
6. Write mapping handlers in `src/mapping.ts`
7. Run `graph codegen && graph build`

### Writing Event Handlers

1. Look up graph-ts entity patterns via Context7
2. Create unique ID from tx hash + log index
3. Load or create entity (always null check)
4. Set all required fields
5. Call entity.save()

### Deploying to TheGraph Studio

1. Run `graph codegen && graph build`
2. Authenticate: `graph auth --studio <DEPLOY_KEY>`
3. Deploy: `graph deploy --studio [subgraph-name]`
4. Verify indexing in Studio dashboard

## Project Structure

```
subgraphs/
├── package.json
├── [subgraph-name]/
│   ├── subgraph.yaml      # Manifest
│   ├── schema.graphql     # Data model
│   ├── src/
│   │   └── mapping.ts     # Event handlers
│   ├── abis/              # Copy from contracts/out/
│   │   └── Contract.json
│   └── tests/             # Matchstick tests
│       └── mapping.test.ts
└── generated/             # Auto-generated (gitignored)
```

## Anti-Patterns (NEVER DO)

```typescript
// NEVER access without null check
let account = Account.load(address)
account.balance = BigInt.zero()  // CRASH if null!

// Always check for null
let account = Account.load(address)
if (!account) {
  account = new Account(address)
  account.balance = BigInt.zero()
}

// NEVER use mutable for event logs
type Transfer @entity {  // Slow!

// Use immutable
type Transfer @entity(immutable: true) {

// NEVER store formatted values
transfer.amountFormatted = formatEther(amount)  // Doesn't exist

// Store raw, format on frontend
transfer.amount = event.params.value
```

## Workflow Commands

```bash
cd subgraphs/[name]

# Generate types
graph codegen

# Build
graph build

# Test
graph test

# Authenticate (one time)
graph auth --studio <DEPLOY_KEY>

# Deploy
graph deploy --studio [subgraph-name]
```

## Related Skills

- **contracts-dev** - For deploying contracts that emit events
- **subgraph-frontend** - For querying the deployed subgraph
- **goldsky-dev** - Alternative deployment target

## Quick Reference

| Task | Command |
|------|---------|
| Generate types | `graph codegen` |
| Build | `graph build` |
| Test | `graph test` |
| Deploy | `graph deploy --studio [name]` |
| Auth | `graph auth --studio <key>` |

See `reference.md` for schema patterns and `examples.md` for common mappings.
