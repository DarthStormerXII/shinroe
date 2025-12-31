# Publish Component to Registry

Migrate a component from the working app to the registry for CLI distribution.

**Usage:** `/publish-to-registry <category> <name>`

## Arguments
- `$ARGUMENTS` - Format: `<category> <name>`
  - Categories: `auth`, `contracts`, `indexer`, `database`, `protocol`
  - Example: `auth reown`, `contracts foundry`, `indexer goldsky`, `protocol lifi`

---

## Category: Auth Provider

When `$ARGUMENTS` starts with `auth`:

### Required Files to Copy
From `frontend/` to `registry/auth-providers/<name>/frontend/`:
```
lib/web3/account.ts
lib/web3/balance.ts
lib/web3/chain.ts
lib/web3/clients.ts
lib/web3/config.ts
lib/web3/connection.ts
lib/web3/contract.ts
lib/web3/ens.ts
lib/web3/signature.ts
lib/web3/transaction.ts
providers/web3-provider.tsx
components/web3/connect-button.tsx
```

### Interface Requirements
Each file MUST implement the types from `registry/foundation/web3-interface/frontend/lib/web3/types.ts`:
- `useAccount()` → `Web3Account`
- `usePublicClient()` → `UsePublicClientReturn`
- `useWalletClient()` → `UseWalletClientReturn`
- `useChainId()` → `number | undefined`
- `useSwitchChain()` → `UseSwitchChainReturn`
- `useBalance()` → `UseBalanceReturn`
- `useSendTransaction()` → `UseSendTransactionReturn`
- `useReadContract()` → `UseReadContractReturn`
- `useWriteContract()` → `UseWriteContractReturn`
- `useConnect()` → `UseConnectReturn`
- `useDisconnect()` → `UseDisconnectReturn`
- `useSignMessage()` → `UseSignMessageReturn`

### meta.json Template
```json
{
  "name": "<name>",
  "displayName": "<Display Name>",
  "version": "1.0.0",
  "description": "<description>",
  "dependencies": {
    // SDK dependencies
  },
  "envVars": [
    { "name": "NEXT_PUBLIC_...", "description": "...", "required": true }
  ],
  "files": [
    { "source": "frontend/lib/web3/account.ts", "target": "lib/web3/account.ts" },
    // ... all 12 files
  ]
}
```

### Update registry.json
Add to `authProviders` section.

---

## Category: Contract Framework

When `$ARGUMENTS` starts with `contracts`:

### Required Structure
```
registry/contract-frameworks/<name>/
├── meta.json
└── contracts/
    ├── src/              # Contract source files
    ├── test/             # Test files
    ├── script/           # Deployment scripts (Foundry) or ignition/ (Hardhat)
    └── [config files]    # foundry.toml or hardhat.config.ts
```

### meta.json Template
```json
{
  "name": "<name>",
  "displayName": "<Display Name>",
  "version": "1.0.0",
  "description": "<description>",
  "dependencies": {},
  "envVars": [
    { "name": "PRIVATE_KEY", "description": "Deployer key", "required": false },
    { "name": "RPC_URL", "description": "RPC endpoint", "required": false }
  ],
  "files": [
    // List all files to copy
  ],
  "postInstall": [
    // Commands to run after copying (e.g., "forge install")
  ]
}
```

### Update registry.json
Add to `contractFrameworks` section.

---

## Category: Indexer

When `$ARGUMENTS` starts with `indexer`:

### Required Structure
```
registry/indexers/<name>/
├── meta.json
├── subgraph/
│   ├── schema.graphql
│   ├── subgraph.template.yaml
│   ├── package.json
│   ├── config/
│   │   ├── sepolia.json
│   │   └── mainnet.json
│   └── src/mappings/
│       └── [mapping files].ts
└── frontend/
    └── lib/indexer/
        ├── client.ts      # Apollo client setup
        ├── queries.ts     # GraphQL queries
        └── hooks.ts       # React hooks
```

### Frontend Interface Requirements
All indexers must export from `lib/indexer/`:
- `apolloClient` - Configured Apollo client
- `useQuery` hooks for common queries
- GraphQL query definitions

### meta.json Template
```json
{
  "name": "<name>",
  "displayName": "<Display Name>",
  "version": "1.0.0",
  "description": "<description>",
  "dependencies": {
    "@apollo/client": "^3.11.0",
    "graphql": "^16.9.0"
  },
  "envVars": [
    { "name": "NEXT_PUBLIC_SUBGRAPH_URL", "description": "...", "required": true }
  ],
  "files": [
    // List all files
  ],
  "postInstall": ["cd subgraph && npm install"]
}
```

### Update registry.json
Add to `indexers` section.

---

## Category: Protocol

When `$ARGUMENTS` starts with `protocol`:

### Step 1: Validate Protocol Exists in Frontend

Check these locations exist:
```
frontend/app/swap/<name>/page.tsx
frontend/lib/services/<name>-service.ts (or similar)
frontend/hooks/protocols/<name>/ (if exists)
frontend/constants/protocols/<name>/ (if exists)
```

If the protocol doesn't exist in frontend, STOP and inform the user.

### Step 2: Create Registry Directory Structure

```bash
mkdir -p registry/protocols/<name>/frontend/{app/swap/<name>,lib/services,hooks/protocols/<name>,constants/protocols/<name>}
```

### Step 3: Copy Protocol Files

Copy all protocol-related files from frontend to registry:

```bash
# Page
cp frontend/app/swap/<name>/page.tsx registry/protocols/<name>/frontend/app/swap/<name>/

# Service
cp frontend/lib/services/<name>-service.ts registry/protocols/<name>/frontend/lib/services/ 2>/dev/null || true

# Hooks (if directory exists)
cp -r frontend/hooks/protocols/<name>/* registry/protocols/<name>/frontend/hooks/protocols/<name>/ 2>/dev/null || true

# Constants (if directory exists)
cp -r frontend/constants/protocols/<name>/* registry/protocols/<name>/frontend/constants/protocols/<name>/ 2>/dev/null || true
```

### Step 4: Verify Web3 Abstraction Usage

**CRITICAL:** Scan all copied files and ensure they use the web3 abstraction layer.

Search for these INCORRECT patterns and fix them:
```typescript
// WRONG - Direct wagmi imports
import { useAccount } from 'wagmi'
import { usePublicClient } from 'wagmi'
import { useWalletClient } from 'wagmi'

// CORRECT - Use abstraction
import { useAccount, usePublicClient, useWalletClient } from '@/lib/web3'
```

If you find direct wagmi imports, update them to use `@/lib/web3` before proceeding.

### Step 5: Create meta.json

Create `registry/protocols/<name>/meta.json`:

```json
{
  "name": "<name>",
  "displayName": "<Display Name>",
  "version": "1.0.0",
  "description": "<One-line description>",
  "category": "<dex|bridge|lending|staking|other>",
  "dependencies": {
    // Add any npm dependencies the protocol needs
    // e.g., "@lifi/sdk": "^3.0.0"
  },
  "envVars": [
    // Add required environment variables
    // { "name": "NEXT_PUBLIC_XXX_API_KEY", "description": "...", "required": true }
  ],
  "files": [
    { "source": "frontend/app/swap/<name>/page.tsx", "target": "app/swap/<name>/page.tsx" },
    { "source": "frontend/lib/services/<name>-service.ts", "target": "lib/services/<name>-service.ts" }
    // Add all other files that were copied
  ]
}
```

Determine the correct:
- `displayName`: Human-readable name (e.g., "LI.FI", "Uniswap", "CoW Swap")
- `category`: One of `dex`, `bridge`, `lending`, `staking`, `other`
- `dependencies`: Check the service file for any SDK imports
- `files`: List ALL files that were copied

### Step 6: Update registry.json

Add the protocol to `registry/registry.json` under the `protocols` section:

```json
"protocols": {
  "existing-protocols": { ... },
  "<name>": {
    "name": "<Display Name>",
    "description": "<Description>",
    "category": "<category>",
    "path": "protocols/<name>",
    "dependencies": {
      // Same as meta.json dependencies
    }
  }
}
```

### Step 7: Verify Registry Structure

Confirm the final structure:
```
registry/protocols/<name>/
├── meta.json
└── frontend/
    ├── app/swap/<name>/
    │   └── page.tsx
    ├── lib/services/
    │   └── <name>-service.ts
    ├── hooks/protocols/<name>/
    │   └── use-<name>-*.ts
    └── constants/protocols/<name>/
        └── index.ts
```

---

## Verification Steps

1. **Check file completeness**: Ensure all required files exist
2. **Verify interface compliance**: Check types match the foundation
3. **Test locally**:
   ```bash
   export EVM_KIT_REGISTRY_URL=/path/to/registry
   cd packages/evm-kit && node dist/index.js list
   ```
4. **Update registry.json**: Add entry to correct section
5. **Commit and push**: Registry changes go live immediately

---

## Post-Publish

After publishing:
1. Bump CLI version: `cd packages/evm-kit && npm version patch`
2. Rebuild: `npm run build`
3. Publish: `npm publish --access public`
4. Push to GitHub: `git push origin main`

---

## Success Checklist

Before marking this task complete, verify:

- [ ] All required files copied to `registry/{category}/{name}/`
- [ ] `meta.json` created with correct file mappings
- [ ] All files use web3 abstraction (no direct wagmi imports in protocols)
- [ ] `registry/registry.json` updated with new entry
- [ ] CLI can list the new component: `cd packages/evm-kit && node dist/index.js list`
- [ ] Files copied match what's in meta.json

**Run this to confirm:**
```bash
ls registry/{category}/{name}/
cat registry/{category}/{name}/meta.json | jq '.files'
cat registry/registry.json | jq '.{category}."{name}"'
```

---

## If This Fails

### Error: "Protocol not found in frontend"
**Cause:** Protocol files don't exist in expected locations.
**Fix:**
1. Check if protocol was implemented: `ls frontend/app/swap/{protocol}/`
2. Implement the protocol first before publishing
3. Verify file paths match expected structure

### Error: "Interface mismatch" for auth provider
**Cause:** Auth provider hooks don't match foundation types.
**Fix:**
1. Read `registry/foundation/web3-interface/frontend/lib/web3/types.ts`
2. Update provider implementation to match interface exactly
3. Test by running frontend with this provider

### Error: "Direct wagmi imports found"
**Cause:** Protocol files import from wagmi instead of @/lib/web3.
**Fix:**
1. Find all wagmi imports: `grep -r "from 'wagmi'" registry/protocols/{name}/`
2. Replace with: `import { ... } from '@/lib/web3'`
3. This is critical for auth provider switching to work

### Error: "registry.json invalid JSON"
**Cause:** Syntax error in registry.json after editing.
**Fix:**
1. Validate: `cat registry/registry.json | jq .`
2. Find syntax error (trailing comma, missing quote, etc.)
3. Fix and validate again

### Error: "meta.json file paths don't match"
**Cause:** Files in meta.json don't exist.
**Fix:**
1. Check each file in meta.json exists in registry
2. Update paths or copy missing files
3. Ensure source/target pairs are correct

### Error: CLI doesn't show new component
**Cause:** registry.json not updated or CLI not rebuilt.
**Fix:**
1. Verify registry.json has the entry
2. Rebuild CLI: `cd packages/evm-kit && npm run build`
3. Test: `node dist/index.js list`

### General Debugging

1. Start with the frontend working code
2. Copy files to registry, then verify each exists
3. Create meta.json with exact paths
4. Update registry.json
5. Test CLI locally before publishing
6. If stuck, compare with existing similar component in registry
