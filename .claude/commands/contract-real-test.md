---
description: Implement, deploy to testnet, and test on real network
argument: <what to implement and test>
---

# Contract Real Test

Implement features, deploy to real testnet, run initializations, and verify on live network.

**This DEPLOYS to real network and costs gas.** Run `/contract-fork-test` first.

**SINGLE SOURCE OF TRUTH:** `contracts/deployment.config.json`
**NO GARBAGE FILES:** Do not create markdown, temp, or documentation files.

## Prerequisites

- Load `contracts-dev` skill
- Fork tests pass (run `/contract-fork-test` first)
- Read `contracts/deployment.config.json` for network config and explorer info
- `contracts/.env` configured with `PRIVATE_KEY` and RPC URLs

### Context7 Lookups (if unsure about syntax)

Before executing, look up current syntax if needed:
- Deployment scripts: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "forge script broadcast" })`
- Cast commands: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "cast send" })`
- Verification: `mcp__context7__get-library-docs({ context7CompatibleLibraryID: "/foundry-rs/foundry", topic: "forge verify-contract" })`

## Input

User provides:
- Features to implement and test
- Initialization steps needed
- Test scenarios for live network

## Steps

### 1. Verify Fork Tests Pass

```bash
cd contracts && source .env
forge test -vv
```

**STOP if tests fail.** Fix before deploying real funds.

### 2. Deploy to Network

```bash
# Get network info from deployment.config.json
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --broadcast -vvv
```

### 3. Extract Deployment Info

From `contracts/broadcast/Deploy.s.sol/[chainId]/run-latest.json`:
- Contract addresses
- Transaction hashes
- Block numbers

### 4. Verify on Block Explorer

```bash
# Using network's explorer from deployment.config.json
forge verify-contract <ADDRESS> src/Contract.sol:Contract \
  --chain-id <CHAIN_ID> \
  --verifier blockscout \
  --verifier-url "<EXPLORER_API_URL>" \
  --watch
```

### 5. Run Initialization Sequence

Execute setup from `deployment.config.json` steps:

```bash
# Example initializations
cast send <CONTRACT> "initialize(address)" <PARAM> \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

cast send <CONTRACT> "grantRole(bytes32,address)" <ROLE> <ADDR> \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

cast send <CONTRACT> "setConfig(uint256)" <VALUE> \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

### 6. Test on Live Network

```bash
# Read state
cast call <CONTRACT> "balanceOf(address)" <ADDR> --rpc-url $SEPOLIA_RPC_URL

# Execute transactions
cast send <CONTRACT> "mint()" --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY

# Verify events emitted
cast logs --address <CONTRACT> --rpc-url $SEPOLIA_RPC_URL
```

### 7. Update Frontend Configs

Update with new addresses:
- `frontend/constants/tokens/[chainId]/erc20.json`
- `frontend/constants/tokens/[chainId]/erc721.json`

Copy ABIs:
```bash
cp contracts/out/Contract.sol/Contract.json \
   frontend/constants/contracts/[chainId]/abis/
```

### 8. Update Deployment Record

Add to `contracts/deployment.config.json`:
```json
{
  "deployments": {
    "[network]": {
      "timestamp": "2024-...",
      "deployer": "0x...",
      "contracts": {
        "ContractName": {
          "address": "0x...",
          "txHash": "0x...",
          "blockNumber": 123456
        }
      }
    }
  }
}
```

## Success Checklist

Before marking this task complete, verify:

- [ ] Fork tests pass: `forge test -vv`
- [ ] Deployed to testnet (check broadcast file)
- [ ] Verified on explorer (check link works)
- [ ] Initialization transactions confirmed
- [ ] Live network tests pass (cast commands return expected values)
- [ ] Frontend token configs updated with new addresses
- [ ] Frontend ABIs updated in `frontend/constants/contracts/{chainId}/abis/`
- [ ] `deployment.config.json` updated with addresses, txHash, blockNumber

**Run this to confirm:**
```bash
cd contracts && source .env
forge test -vv && echo "Fork tests passed"
cat deployment.config.json | jq '.deployments'
ls ../frontend/constants/contracts/*/abis/
```

## Example Usage

```
/contract-real-test Deploy FreeMintToken with new max supply feature. Initialize
with 1M cap. Mint some tokens, verify supply tracking works. Try to mint past
limit and confirm it reverts correctly.
```

```
/contract-real-test Deploy staking contract. Initialize with FreeMintToken address.
Stake tokens, wait a few blocks, verify rewards accumulate, claim rewards, unstake.
Check all balances are correct throughout.
```

---

## If This Fails

### Error: "insufficient funds for gas"
**Cause:** Deployer wallet needs more testnet ETH.
**Fix:**
1. Check balance: `cast balance $(cast wallet address --private-key $PRIVATE_KEY) --rpc-url $SEPOLIA_RPC_URL`
2. Get testnet ETH from faucet
3. Retry deployment

### Error: "PRIVATE_KEY not set"
**Cause:** Environment variables not loaded.
**Fix:**
1. Run `source contracts/.env`
2. Verify: `echo $PRIVATE_KEY | head -c 10`

### Error: "Execution reverted during deployment"
**Cause:** Constructor logic failed.
**Fix:**
1. Check constructor arguments in `Deploy.s.sol`
2. Run fork test to debug: `forge test --fork-url $RPC_URL -vvvv`
3. Look for revert reason in trace

### Error: "Nonce too low"
**Cause:** Transaction already sent with this nonce.
**Fix:**
1. Wait for pending tx to confirm
2. Or use `--nonce X` flag with correct nonce
3. Check pending txs: `cast nonce $(cast wallet address --private-key $PRIVATE_KEY) --rpc-url $RPC_URL`

### Error: "Verification failed"
**Cause:** Compiler settings mismatch or rate limiting.
**Fix:**
1. If "Already verified" - this is OK
2. Check compiler version: `forge config | grep solc`
3. Retry in 1 minute (rate limiting)
4. Verify manually on explorer website

### Error: "cast send" fails with revert
**Cause:** Function call reverted on live network.
**Fix:**
1. Check function exists: `cast call --rpc-url $RPC_URL <ADDRESS> "functionName()"`
2. Check caller has required permissions
3. Verify arguments are correct
4. Check state prerequisites are met

### Error: "Transaction underpriced"
**Cause:** Gas price too low for network conditions.
**Fix:**
1. Check current gas: `cast gas-price --rpc-url $RPC_URL`
2. Use `--gas-price` flag with higher value
3. Or add `--priority-gas-price` for EIP-1559

### General Debugging

1. Always run `/contract-fork-test` first
2. Use `cast run <TX_HASH> --rpc-url $RPC_URL` to debug failed txs
3. Check Blockscout for tx details and revert reason
4. Verify deployer has sufficient balance for all operations
5. If stuck, check network status (is the testnet congested?)
