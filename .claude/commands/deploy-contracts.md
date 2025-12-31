---
description: Deploy contracts and sync to frontend (no subgraphs)
---

# Contract Deployment & Frontend Sync

Deploy contracts to network, verify them, and update frontend with new addresses and ABIs.

**SINGLE SOURCE OF TRUTH:** `contracts/deployment.config.json`
**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `contracts-dev` skill
- Read `contracts/deployment.config.json` for network config
- Ensure `contracts/.env` has `PRIVATE_KEY` and RPC URLs

### Context7 Lookups (if unsure about syntax)

Before executing, look up current syntax if needed:
- Foundry commands: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "forge script broadcast" })`
- Verification: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "forge verify-contract" })`

## Steps

### 1. Build & Test

```bash
cd contracts
source .env
forge build
forge test -vv
```

**STOP if tests fail.** Fix issues before deploying.

### 2. Deploy

```bash
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --broadcast -vvv
```

### 3. Get Deployed Addresses

Read from: `contracts/broadcast/Deploy.s.sol/11155111/run-latest.json`

Extract:
- Contract names
- Deployed addresses
- Transaction hashes

### 4. Verify Each Contract

**Get the list:** Read `contracts/broadcast/Deploy.s.sol/{chainId}/run-latest.json` -> `transactions` array where `transactionType` is `CREATE`.

**For EACH contract in the list:**

1. Extract `contractAddress` and `contractName` from the transaction
2. Run verification:
   ```bash
   forge verify-contract {contractAddress} src/{ContractName}.sol:{ContractName} \
     --chain-id {chainId} \
     --verifier blockscout \
     --verifier-url "https://eth-sepolia.blockscout.com/api/" \
     --watch
   ```
3. Check result:
   - If "Already verified" -> continue (this is OK)
   - If "Contract verified" -> continue (success)
   - If other error -> STOP and report the error
4. Update `contracts/deployment.config.json`: set `deployments.{network}.{ContractName}.verified = true`

**After all contracts:**
- Verify `deployment.config.json` has `verified: true` for ALL contracts in the deployment

**DO NOT pass `--constructor-args`** - Blockscout auto-detects them.

### 5. Update Frontend Token Configs

Update with new addresses:
- `frontend/constants/tokens/11155111/erc20.json`
- `frontend/constants/tokens/11155111/erc721.json`

### 6. Copy ABIs to Frontend

**For EACH contract deployed:**

1. Find the ABI file: `contracts/out/{ContractName}.sol/{ContractName}.json`
2. Create target directory if needed: `frontend/constants/contracts/{chainId}/abis/`
3. Copy the ABI:
   ```bash
   cp contracts/out/{ContractName}.sol/{ContractName}.json \
      frontend/constants/contracts/{chainId}/abis/
   ```
4. Verify the file was copied successfully

**After all ABIs copied:**
- Run `ls frontend/constants/contracts/{chainId}/abis/` to confirm all ABIs present

### 7. Update deployment.config.json (REQUIRED)

Update the `deployments` section in `contracts/deployment.config.json`:
```json
{
  "deployments": {
    "sepolia": {
      "ContractName": {
        "address": "0x...",
        "deploymentTx": "0x...",
        "blockNumber": 123456,
        "verified": true
      }
    }
  }
}
```

This is the ONLY place deployment info should be stored.

## Success Checklist

Before marking this task complete, verify:

- [ ] All tests pass (`forge test` exits 0)
- [ ] Contracts deployed successfully (tx hashes in broadcast file)
- [ ] ALL contracts verified on Blockscout (check each explorer link)
- [ ] Frontend token configs updated with new addresses
- [ ] ABIs copied to `frontend/constants/contracts/{chainId}/abis/`
- [ ] `deployment.config.json` updated with addresses, txHash, blockNumber, verified

**Run this to confirm:**
```bash
cd contracts && forge test && echo "Tests passed"
cat deployment.config.json | jq '.deployments'
ls ../frontend/constants/contracts/*/abis/
```

---

## If This Fails

### Error: "Script failed: ... insufficient funds"
**Cause:** Deployer wallet doesn't have enough ETH for gas.
**Fix:**
1. Check deployer address: `cast wallet address --private-key $PRIVATE_KEY`
2. Get testnet ETH from faucet (Sepolia: https://sepoliafaucet.com)
3. Retry deployment

### Error: "PRIVATE_KEY not set" or "RPC_URL not set"
**Cause:** Environment variables not loaded.
**Fix:**
1. Verify `.env` file exists: `cat contracts/.env`
2. Run `source contracts/.env` before commands
3. Check variable names match what script expects

### Error: "Contract verification failed"
**Cause:** Explorer API issue, wrong compiler settings, or already verified.
**Fix:**
1. If "Already verified" - this is OK, continue
2. Check compiler version matches: `forge config | grep solc`
3. Check optimizer settings match deployed contract
4. Try again in 1 minute (rate limiting)
5. Verify manually on explorer website if API fails

### Error: "Execution reverted" during deployment
**Cause:** Constructor arguments invalid or contract logic issue.
**Fix:**
1. Check constructor args in `Deploy.s.sol`
2. Run `forge test -vvvv` to debug
3. Look for revert reason in trace output

### Error: "broadcast/Deploy.s.sol/.../run-latest.json not found"
**Cause:** Deployment didn't complete or wrong directory.
**Fix:**
1. Check if deployment ran: `ls contracts/broadcast/`
2. Ensure `--broadcast` flag was used
3. Check chainId matches: `cast chain-id --rpc-url $RPC_URL`

### General Debugging

1. Check `contracts/.env` has correct values
2. Verify network connectivity: `cast block-number --rpc-url $RPC_URL`
3. Check gas prices: `cast gas-price --rpc-url $RPC_URL`
4. If still stuck, run with `-vvvv` for max verbosity
