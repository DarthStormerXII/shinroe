---
description: Full auto-deployment - contracts, subgraphs, frontend sync
argument: <optional: network name from deployment.config.json (default: first available)>
---

# Full Deployment Pipeline (Auto-configured)

**SINGLE SOURCE OF TRUTH:** `contracts/deployment.config.json`
**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

Execute the complete deployment workflow automatically:
1. Deploy contracts from `deployment.config.json` steps
2. Verify on block explorer
3. Sync addresses/ABIs to frontend
4. Generate & deploy subgraphs
5. Update frontend with subgraph endpoints

## Input

- **Optional:** Network name (e.g., `sepolia`, `base-sepolia`)
- Default: Uses first network in `deployment.config.json`
- Everything else auto-detected

## Prerequisites

- Load `contracts-dev` skill for contract deployment
- Load `thegraph-dev` or `goldsky-dev` skill for subgraph deployment
- Read `contracts/deployment.config.json` for all network/contract info
- Ensure `.env` has `PRIVATE_KEY` and RPC URLs configured

### Context7 Lookups (if unsure about syntax)

Before executing, look up current syntax if needed:
- Foundry deployment: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "forge script broadcast" })`
- TheGraph CLI: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/graphprotocol/graph-tooling", topic: "graph deploy" })`

## Phase 1: Contract Deployment

1. **Build contracts:**
   ```bash
   cd contracts && source .env && forge build
   ```

2. **Run fork tests** to verify everything works:
   ```bash
   forge test -vv
   ```

3. **Deploy to network:**
   ```bash
   forge script script/Deploy.s.sol:DeployScript --rpc-url "$SEPOLIA_RPC_URL" --broadcast -vvv
   ```

4. **Verify on Blockscout** (for each contract):

   **Get the list:** Read `contracts/broadcast/Deploy.s.sol/{chainId}/run-latest.json` -> `transactions` array where `transactionType` is `CREATE`.

   **For EACH contract:**
   1. Extract `contractAddress` and `contractName`
   2. Run verification:
      ```bash
      forge verify-contract {contractAddress} src/{ContractName}.sol:{ContractName} \
        --chain-id {chainId} --verifier blockscout \
        --verifier-url "https://eth-sepolia.blockscout.com/api/" --watch
      ```
   3. If "Already verified" -> continue (this is OK)
   4. If verification fails -> STOP and report error
   5. Update `deployment.config.json`: set `verified: true`

5. **Get deployed addresses** from:
   - `contracts/broadcast/Deploy.s.sol/{chainId}/run-latest.json`

## Phase 2: Contract Initialization (if needed)

Execute any post-deployment initialization calls:
- Set roles/permissions
- Configure parameters
- Transfer ownership
- Mint initial tokens for testing

## Phase 3: Frontend Contract Sync

1. **Update token configs:**
   - `frontend/constants/tokens/{chainId}/erc20.json`
   - `frontend/constants/tokens/{chainId}/erc721.json`

2. **Copy ABIs** (for EACH deployed contract):
   1. Find ABI: `contracts/out/{ContractName}.sol/{ContractName}.json`
   2. Create directory if needed: `mkdir -p frontend/constants/contracts/{chainId}/abis/`
   3. Copy: `cp contracts/out/{ContractName}.sol/{ContractName}.json frontend/constants/contracts/{chainId}/abis/`
   4. Repeat for all contracts

3. **Update contract addresses** in frontend constants
   - Check each token config has correct address from deployment

## Phase 4: Subgraph Deployment

**Get the list:** Read `subgraphs/` directory for all subgraph folders.

**For EACH subgraph:**

1. **Update subgraph manifest** with new contract addresses:
   - Read `subgraphs/{name}/subgraph.yaml`
   - Update `address` field for each data source with deployed address
   - Update `startBlock` to deployment block number

2. **Rebuild subgraph:**
   ```bash
   cd subgraphs/{name}
   graph codegen && graph build
   ```
   - If codegen fails -> STOP, check ABI compatibility
   - If build fails -> STOP, check mapping code

3. **Deploy:**
   - TheGraph: `graph deploy --studio {name}`
   - Goldsky: `goldsky subgraph deploy {name}/{version} --path . --tag prod`

4. **Verify sync status:**
   - Wait for "Synced" status on indexer dashboard
   - Test a query to confirm data is available

## Phase 5: Frontend Subgraph Sync

1. **Update endpoint config:**
   - `frontend/constants/subgraphs/11155111/[name].ts`

2. **Test queries** work with new data

## Phase 6: Verification

1. Run frontend locally: `cd frontend && npm run dev`
2. Test contract interactions work
3. Test subgraph queries return data
4. Verify all addresses match

## Success Checklist

Before marking this task complete, verify:

- [ ] All contracts deployed (check broadcast file exists)
- [ ] All contracts verified on explorer (check each link)
- [ ] `deployment.config.json` updated with all addresses
- [ ] Frontend token configs updated with new addresses
- [ ] Frontend ABIs copied to `frontend/constants/contracts/{chainId}/abis/`
- [ ] Subgraph manifests updated with new addresses
- [ ] Subgraphs deployed and syncing (check indexer dashboard)
- [ ] Frontend subgraph endpoints updated
- [ ] Frontend builds successfully: `cd frontend && npm run build`
- [ ] Manual test: contract interactions work via frontend

**Run this to confirm:**
```bash
cd contracts && cat deployment.config.json | jq '.deployments'
ls ../frontend/constants/contracts/*/abis/
cd ../frontend && npm run build && echo "Build passed"
```

---

## If This Fails

### Phase 1 Errors (Contract Deployment)

#### Error: "insufficient funds"
**Cause:** Deployer wallet needs more ETH.
**Fix:** Get testnet ETH from faucet and retry.

#### Error: "PRIVATE_KEY not set"
**Cause:** Environment not loaded.
**Fix:** Run `source contracts/.env` first.

#### Error: "Execution reverted"
**Cause:** Constructor args or contract logic issue.
**Fix:** Run `forge test -vvvv` to debug.

### Phase 2 Errors (Initialization)

#### Error: "execution reverted: AccessControl"
**Cause:** Caller doesn't have required role.
**Fix:** Check deployer address matches expected admin.

### Phase 3 Errors (Frontend Sync)

#### Error: ABI file not found
**Cause:** Contract didn't compile or wrong name.
**Fix:** Run `forge build` and check `contracts/out/` for correct path.

### Phase 4 Errors (Subgraph)

#### Error: "Failed to compile mapping"
**Cause:** AssemblyScript type errors in mapping.
**Fix:** Check event handler types match ABI.

#### Error: "Authentication failed"
**Cause:** Missing deploy key.
**Fix:** Set `THEGRAPH_DEPLOY_KEY` or `GOLDSKY_API_KEY` in environment.

#### Error: "Subgraph not found"
**Cause:** Subgraph not created on indexer dashboard.
**Fix:** Create subgraph on TheGraph Studio or Goldsky dashboard first.

### Phase 5/6 Errors (Frontend Subgraph Sync)

#### Error: GraphQL query returns empty
**Cause:** Subgraph not synced or wrong address in manifest.
**Fix:** Check subgraph sync status and verify contract address matches.

### General Debugging

1. Check which phase failed and focus there
2. Verify all `.env` files have required values
3. Check network connectivity to RPC endpoints
4. For subgraph issues, check indexer logs
5. If still stuck, run each phase command manually with verbose output
