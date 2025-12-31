---
description: Strategic debugging across contracts, frontend, and subgraphs
argument: <error description or unexpected behavior>
---

# Full-Stack Debug

Strategic debugging system that identifies issues across the entire stack: **contracts <-> frontend <-> subgraphs**.

**SINGLE SOURCE OF TRUTH:** `contracts/deployment.config.json`
**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Read `contracts/deployment.config.json` for addresses
- Identify which layer(s) the error originates from
- Load relevant skill (`contracts-dev`, `web3-integration`, `subgraph-frontend`)

### Context7 Lookups (for debugging patterns)

If unsure about debugging techniques:
- Foundry debugging: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "forge test debug" })`
- Viem errors: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/wevm/viem", topic: "errors" })`
- TheGraph debugging: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/graphprotocol/graph-tooling", topic: "debugging" })`

## Debug Strategy

This command doesn't just look at errors in isolation - it traces issues across layer boundaries where most bugs hide.

### Phase 1: Classify the Issue

First, determine which layer(s) are involved:

| Symptom | Primary Layer | Check Also |
|---------|---------------|------------|
| Transaction reverts | Contracts | Frontend (wrong params, ABI mismatch) |
| UI shows wrong data | Frontend | Subgraph (stale index), Contracts (wrong event) |
| Query returns empty | Subgraph | Contracts (events not emitted), Config (wrong address) |
| Wallet won't connect | Frontend | Network config mismatch |
| "Function not found" | Frontend | ABI sync issue with contracts |
| Indexing stuck | Subgraph | Contract (mapping error), Start block |

### Phase 2: Cross-Layer Verification

**Always check these integration points:**

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Contracts  │────▶│  Subgraphs  │────▶│  Frontend   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
  deployment.         subgraph.yaml       constants/
  config.json         (addresses)         tokens/*.json
  broadcast/          abis/               subgraphs/*.ts
  run-latest.json     schema.graphql      contracts/abis/
```

**Address Consistency Check:**
```bash
# 1. Source of truth: latest deployment
cat contracts/broadcast/Deploy.s.sol/11155111/run-latest.json | jq '.transactions[].contractAddress'

# 2. Frontend token configs
cat frontend/constants/tokens/11155111/erc20.json | jq '.[].address'
cat frontend/constants/tokens/11155111/erc721.json | jq '.[].address'

# 3. Subgraph manifest
grep "address:" subgraphs/*/subgraph.yaml
```

**ABI Consistency Check:**
```bash
# Compare contract ABI with frontend/subgraph copies
diff contracts/out/Contract.sol/Contract.json frontend/constants/contracts/11155111/abis/Contract.json
diff contracts/out/Contract.sol/Contract.json subgraphs/*/abis/Contract.json
```

### Phase 3: Layer-Specific Debugging

#### Contract Issues

1. **Transaction Reverts:**
   ```bash
   # Get revert reason from tx hash
   cast run <TX_HASH> --rpc-url $SEPOLIA_RPC_URL

   # Or check on Blockscout
   # https://eth-sepolia.blockscout.com/tx/<TX_HASH>
   ```

2. **Test Failures:**
   ```bash
   cd contracts && source .env
   forge test --match-test "testName" -vvvv  # Max verbosity
   ```

3. **State Issues:**
   ```bash
   # Read contract state
   cast call <ADDRESS> "functionName()" --rpc-url $SEPOLIA_RPC_URL

   # Check storage slot directly
   cast storage <ADDRESS> <SLOT> --rpc-url $SEPOLIA_RPC_URL
   ```

#### Frontend Issues

1. **Contract Call Failures:**
   - Check browser console for errors
   - Verify `chainId` matches connected wallet
   - Verify contract address in constants
   - Compare ABI with deployed contract

2. **Wagmi/Viem Errors:**
   ```typescript
   // Add to hook for debugging
   console.log('Contract config:', { address, abi, functionName, args })
   ```

3. **Network Mismatch:**
   - Check `frontend/lib/config/chains.ts`
   - Verify RPC URLs in environment
   - Confirm wallet is on correct network

#### Subgraph Issues

1. **Build Errors:**
   ```bash
   cd subgraphs/[name]
   graph codegen  # Check for schema/ABI issues
   graph build    # Check for mapping issues
   ```

2. **Indexing Errors:**
   ```bash
   # Check logs (Goldsky)
   goldsky subgraph log [name]/[version]

   # Common causes:
   # - Null entity access in mapping
   # - Wrong event signature
   # - Start block after events
   ```

3. **Query Returns Empty:**
   - Verify contract address in `subgraph.yaml`
   - Check `startBlock` is before first event
   - Test query directly at endpoint
   - Check if subgraph is synced

### Phase 4: Common Integration Bugs

| Bug Pattern | Cause | Fix |
|-------------|-------|-----|
| Frontend works, subgraph empty | Address mismatch | Sync addresses from deployment |
| Tests pass, frontend fails | ABI out of sync | Copy fresh ABI from contracts/out |
| Subgraph builds, no data | Start block too late | Use deployment block or earlier |
| Wallet connects, tx fails | Wrong network in config | Verify chainId in network config |
| Query works, UI shows stale | Apollo cache | Add `fetchPolicy: 'network-only'` |

### Phase 5: Resolution

After identifying the issue:

1. **If config mismatch:** Update the out-of-sync config
2. **If contract bug:** Fix contract → run `/contract-fork-test` → `/contract-real-test`
3. **If subgraph bug:** Fix mapping → run `/deploy-subgraphs`
4. **If frontend bug:** Fix component → test locally

### Debug Checklist

```
□ Reproduced the issue
□ Identified which layer (contracts/frontend/subgraph)
□ Checked address consistency across all configs
□ Checked ABI consistency
□ Checked network/chainId consistency
□ Read error messages/logs carefully
□ Tested component in isolation
□ Fixed and verified resolution
```

## Example Usage

```
/debug Transaction reverts when calling mint() from frontend but works in Foundry tests
```

```
/debug Subgraph query returns empty array but I can see Transfer events on Blockscout
```

```
/debug Frontend shows "Contract function not found" error for the burn function
```

---

## Success Checklist

Before marking debugging complete, verify:

- [ ] Issue reproduced and understood
- [ ] Root cause identified (which layer, what went wrong)
- [ ] Fix implemented and tested
- [ ] Cross-layer consistency verified (addresses, ABIs, configs)
- [ ] Original issue no longer occurs
- [ ] All builds pass

**Run this to verify fix:**
```bash
cd contracts && forge build && forge test && echo "Contracts OK"
cd ../frontend && npm run build && echo "Frontend OK"
# Test the specific scenario that was failing
```

---

## If This Fails

### Issue: Cannot reproduce the error
**Cause:** Environment differences or intermittent issue.
**Fix:**
1. Ask for exact steps to reproduce
2. Check browser console for additional context
3. Verify same network/chainId being used
4. Check if issue is timing/race-condition related

### Issue: Fix in one layer breaks another
**Cause:** Layers are tightly coupled, need coordinated fix.
**Fix:**
1. Map all affected layers before implementing fix
2. Update all layers simultaneously
3. Test cross-layer scenarios after fix

### Issue: Address mismatch keeps reappearing
**Cause:** Multiple sources of truth for addresses.
**Fix:**
1. Use `/contract-verify-deployment` to sync all addresses
2. Identify which source is wrong
3. Fix upstream source and propagate downstream

### Issue: "Function not found" but function exists
**Cause:** ABI mismatch between frontend and deployed contract.
**Fix:**
1. Copy fresh ABI: `cp contracts/out/{Contract}.sol/{Contract}.json frontend/constants/contracts/{chainId}/abis/`
2. Verify function signature matches exactly
3. Check for function name collision with overloads

### Issue: Subgraph shows stale data
**Cause:** Subgraph not synced or cached data.
**Fix:**
1. Check subgraph sync status on indexer dashboard
2. For Apollo: use `fetchPolicy: 'network-only'`
3. Redeploy subgraph if mapping was fixed

### Issue: Transaction works in test, fails on frontend
**Cause:** Different environment conditions (gas, nonce, network).
**Fix:**
1. Check wallet is on correct network
2. Verify frontend is using correct contract address
3. Compare call parameters between test and frontend
4. Check gas estimation isn't failing

### General Debugging Escalation

1. Start with error message - read it carefully
2. Reproduce consistently before debugging
3. Isolate to single layer if possible
4. Add logging/console output to trace values
5. Compare working vs non-working scenarios
6. If completely stuck, share error + code for review
