---
description: Verify deployed contracts match source and are verified on explorers
---

# Verify Contract Deployment

Fetch latest deployments and ensure all contracts are verified on their respective block explorers, with consistent addresses across the stack.

**SINGLE SOURCE OF TRUTH:** `contracts/deployment.config.json`
**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `contracts-dev` skill
- Read `contracts/deployment.config.json` for deployment info
- Ensure `contracts/.env` has RPC URLs configured

### Context7 Lookups (if unsure about syntax)

Before executing, look up current syntax if needed:
- Verification: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "forge verify-contract" })`
- Cast calls: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "cast call" })`

## What This Checks

1. **Deployment Records** - Latest deployment info from broadcast files
2. **Explorer Verification** - Contracts verified on network's explorer
3. **Address Consistency** - Same addresses in deployment, frontend, subgraphs
4. **ABI Sync** - Frontend/subgraph ABIs match compiled contracts
5. **Network Config** - All network info properly configured

## Network Configuration Structure

### Contracts Side (`contracts/deployment.config.json`)
```json
{
  "chains": {
    "sepolia": {
      "chainId": 11155111,
      "rpcEnvVar": "SEPOLIA_RPC_URL",
      "explorer": {
        "name": "Blockscout",
        "url": "https://eth-sepolia.blockscout.com",
        "apiUrl": "https://eth-sepolia.blockscout.com/api/",
        "verifier": "blockscout"
      },
      "nativeCurrency": {
        "name": "Sepolia ETH",
        "symbol": "ETH",
        "decimals": 18
      }
    },
    "base-sepolia": {
      "chainId": 84532,
      "rpcEnvVar": "BASE_SEPOLIA_RPC_URL",
      "explorer": {
        "name": "Basescan",
        "url": "https://sepolia.basescan.org",
        "apiUrl": "https://api-sepolia.basescan.org/api",
        "verifier": "etherscan",
        "apiKeyEnvVar": "BASESCAN_API_KEY"
      },
      "nativeCurrency": {
        "name": "Sepolia ETH",
        "symbol": "ETH",
        "decimals": 18
      }
    }
  },
  "deployments": {
    "sepolia": {
      "timestamp": "2024-...",
      "contracts": {
        "FreeMintToken": {
          "address": "0x...",
          "txHash": "0x...",
          "blockNumber": 123456,
          "verified": true
        }
      }
    }
  }
}
```

### Frontend Side (`frontend/lib/config/chains.ts`)
```typescript
export const supportedChains = {
  11155111: {
    name: 'Sepolia',
    network: 'sepolia',
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL,
    blockExplorer: 'https://eth-sepolia.blockscout.com',
    nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
  },
  // ... other chains
}
```

## Verification Steps

### 1. Fetch Latest Deployments

```bash
cd contracts

# For each configured chain, find latest deployment
for chainId in 11155111 84532; do
  if [ -f "broadcast/Deploy.s.sol/$chainId/run-latest.json" ]; then
    echo "=== Chain $chainId ==="
    cat "broadcast/Deploy.s.sol/$chainId/run-latest.json" | jq '.transactions[] | {contract: .contractName, address: .contractAddress}'
  fi
done
```

### 2. Check Explorer Verification

**Get the list:** Read `contracts/deployment.config.json` -> `deployments.{network}.contracts` object.

**For EACH contract in the deployment:**

1. Get contract address from deployment config
2. Check verification status:
   ```bash
   curl -s "https://eth-sepolia.blockscout.com/api?module=contract&action=getabi&address={ADDRESS}" | jq '.status'
   ```
   - If status is "1" -> verified, continue
   - If status is "0" -> not verified, run step 3

3. If not verified, verify it:
   ```bash
   source .env
   forge verify-contract {ADDRESS} src/{ContractName}.sol:{ContractName} \
     --chain-id {chainId} \
     --verifier blockscout \
     --verifier-url "https://eth-sepolia.blockscout.com/api/" \
     --watch
   ```

4. Update `deployment.config.json`: set `verified: true`

5. Repeat for all contracts

**For Etherscan-based explorers:**
```bash
forge verify-contract {ADDRESS} src/{ContractName}.sol:{ContractName} \
  --chain-id {chainId} \
  --verifier etherscan \
  --etherscan-api-key $BASESCAN_API_KEY \
  --watch
```

### 3. Address Consistency Check

**For EACH deployed contract:**

1. Get address from broadcast file (source of truth):
   `contracts/broadcast/Deploy.s.sol/{chainId}/run-latest.json` -> `transactions[].contractAddress`

2. Check `deployment.config.json` matches:
   `deployments.{network}.contracts.{ContractName}.address`
   - If mismatch -> UPDATE deployment.config.json

3. Check frontend configs match:
   - `frontend/constants/tokens/{chainId}/erc20.json`
   - `frontend/constants/tokens/{chainId}/erc721.json`
   - `frontend/constants/contracts/{chainId}/index.ts`
   - If mismatch -> UPDATE frontend configs

4. Check subgraph manifests match:
   - `subgraphs/{name}/subgraph.yaml` -> `dataSources[].source.address`
   - If mismatch -> UPDATE subgraph.yaml

**Address flow:**
```
contracts/broadcast/.../run-latest.json  (source of truth)
         ↓
contracts/deployment.config.json
         ↓
frontend/constants/tokens/{chainId}/*.json
frontend/constants/contracts/{chainId}/index.ts
         ↓
subgraphs/{name}/subgraph.yaml
```

### 4. ABI Consistency Check

**For EACH deployed contract:**

1. Get source ABI (source of truth):
   `contracts/out/{ContractName}.sol/{ContractName}.json`

2. Compare with frontend ABI:
   ```bash
   diff contracts/out/{ContractName}.sol/{ContractName}.json \
        frontend/constants/contracts/{chainId}/abis/{ContractName}.json
   ```
   - If diff output -> UPDATE: `cp contracts/out/{ContractName}.sol/{ContractName}.json frontend/constants/contracts/{chainId}/abis/`

3. Compare with subgraph ABI:
   ```bash
   diff contracts/out/{ContractName}.sol/{ContractName}.json \
        subgraphs/{name}/abis/{ContractName}.json
   ```
   - If diff output -> UPDATE: `cp contracts/out/{ContractName}.sol/{ContractName}.json subgraphs/{name}/abis/`

4. Repeat for all contracts

### 5. Network Config Completeness

Before adding a new network, ensure you have:

**Required in `contracts/deployment.config.json`:**
- [ ] chainId
- [ ] rpcEnvVar (and actual RPC URL in .env)
- [ ] explorer.url
- [ ] explorer.apiUrl
- [ ] explorer.verifier (`blockscout` or `etherscan`)
- [ ] explorer.apiKeyEnvVar (if etherscan-based)
- [ ] nativeCurrency info

**Required in `frontend/lib/config/chains.ts`:**
- [ ] Chain entry with name, network, rpcUrl
- [ ] blockExplorer URL
- [ ] nativeCurrency

**Required in `subgraphs/deployment.config.json`:**
- [ ] Network name for TheGraph
- [ ] Network name for Goldsky

## Output Report

```
## Deployment Verification Report

### Network: Sepolia (11155111)

| Contract | Address | Verified | Explorer |
|----------|---------|----------|----------|
| FreeMintToken | 0x2Dfc... | ✅ | [View](https://eth-sepolia.blockscout.com/address/0x2Dfc...) |
| FreeMintNFT | 0x1B3b... | ✅ | [View](https://eth-sepolia.blockscout.com/address/0x1B3b...) |

### Address Consistency

| Location | FreeMintToken | FreeMintNFT |
|----------|---------------|-------------|
| broadcast/run-latest.json | 0x2Dfc... | 0x1B3b... |
| deployment.config.json | ✅ Match | ✅ Match |
| frontend/tokens/*.json | ✅ Match | ✅ Match |
| subgraphs/subgraph.yaml | ✅ Match | ✅ Match |

### ABI Sync

| Contract | Frontend | Subgraph |
|----------|----------|----------|
| FreeMintToken | ✅ Current | ✅ Current |
| FreeMintNFT | ✅ Current | ✅ Current |

### Issues Found

✅ All checks passed

OR

⚠️ FreeMintNFT not verified on Blockscout - verifying now...
⚠️ Frontend ABI for FreeMintToken is outdated - updating...
❌ Address mismatch: frontend has 0xOLD, deployment has 0xNEW
```

## Example Usage

```
/contract-verify-deployment
```

---

## Success Checklist

Before marking this task complete, verify:

- [ ] All contracts verified on explorer (check each link manually)
- [ ] All addresses consistent across broadcast -> deployment.config.json -> frontend -> subgraphs
- [ ] All ABIs match between contracts/out and frontend/subgraphs
- [ ] `deployment.config.json` has `verified: true` for all contracts
- [ ] No address mismatches in report

**Run this to confirm:**
```bash
cd contracts && source .env
cat deployment.config.json | jq '.deployments | .[].contracts | .[].verified'
# Should output all "true"
```

---

## If This Fails

### Error: "Verification failed: contract not found"
**Cause:** Contract address doesn't exist on chain.
**Fix:**
1. Verify address in broadcast file
2. Check chainId matches: `cast chain-id --rpc-url $RPC_URL`
3. Ensure transaction was actually broadcast (check explorer)

### Error: "Already verified"
**Cause:** Contract was previously verified.
**Fix:** This is OK - mark as verified and continue.

### Error: "Compiler version mismatch"
**Cause:** Explorer expecting different Solidity version.
**Fix:**
1. Check `foundry.toml` for `solc_version`
2. Verify same version used in deployment
3. Rebuild if needed: `forge build --force`

### Error: "Address mismatch between files"
**Cause:** Deployment config not updated after deploy.
**Fix:**
1. Use broadcast file as source of truth
2. Update deployment.config.json with correct address
3. Propagate to frontend/subgraph configs

### Error: "ABI mismatch"
**Cause:** ABIs out of sync after contract changes.
**Fix:**
1. Run `forge build`
2. Copy updated ABIs: `cp contracts/out/{Contract}.sol/{Contract}.json frontend/constants/contracts/{chainId}/abis/`
3. If subgraph uses ABI, copy there too

### Error: "curl returns empty/error"
**Cause:** Explorer API down or rate limited.
**Fix:**
1. Try again in 1 minute
2. Check explorer status manually
3. Use alternative verification method

### General Debugging

1. Start with broadcast file as single source of truth
2. Work through each layer: deployment.config -> frontend -> subgraph
3. Fix mismatches as you find them
4. Re-run verification after fixes
5. If explorer verification fails repeatedly, verify manually on website
