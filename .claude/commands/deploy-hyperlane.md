---
description: Deploy Hyperlane to new chain with ICA + warp route configuration on all chains
argument: <chain-name> <chain-id> <rpc-url> [native-token-symbol] [explorer-url]
---

# Deploy Hyperlane to New Chain

**CRITICAL:** Deploys Hyperlane core, configures ICA routers, and extends warp routes to support the new chain.

## Input Parameters

- **chain-name** (required): Lowercase identifier (e.g., `basesepolia`, `arbitrumsepolia`)
- **chain-id** (required): The chain ID number
- **rpc-url** (required): Public RPC endpoint URL
- **native-token-symbol** (optional): Native token symbol (default: ETH)
- **explorer-url** (optional): Block explorer URL

## Prerequisites

1. **HYP_KEY** set in `hyperlane/.env` - deployer private key with funds on new chain
2. **Foundry** installed - `cast` command needed for router enrollment
3. **Existing deployments** - At least one chain already deployed

## Phase 1: Create Chain Configuration

Create `hyperlane/chains/{chain-name}.yaml`:

```yaml
chainId: {chain-id}
domainId: {chain-id}
name: {chain-name}
displayName: {Display Name}
protocol: ethereum
isTestnet: true

rpcUrls:
  - http: {rpc-url}

nativeToken:
  name: {Native Token Name}
  symbol: {SYMBOL}
  decimals: 18

blocks:
  confirmations: 1
  estimateBlockTime: 2
  reorgPeriod: 1

blockExplorers:
  - name: Explorer
    url: {explorer-url}
    apiUrl: {explorer-url}/api
    family: etherscan
```

## Phase 2: Deploy Hyperlane Core

```bash
cd hyperlane && ./scripts/deploy-core.sh {chain-name}
```

This automatically:
1. Copies chain metadata to `~/.hyperlane/chains/` AND `registry-clone/chains/`
2. Deploys core contracts (Mailbox, ISM, Hooks, ICA Router)
3. Saves addresses to `deployments/{chain-name}.yaml` AND `registry-clone/chains/{chain-name}/addresses.yaml`
4. Enrolls ICA routers with existing chains

**Verify:** `cat hyperlane/deployments/{chain-name}.yaml`

## Phase 3: Deploy Warp Route (if extending existing route)

### 3a. Update Warp Route Config

Edit `hyperlane/configs/warp-route-deployment.yaml` to add the new chain:

```yaml
# For ERC20 tokens (e.g., USDC):
# - Use "collateral" on the chain with the REAL token (locks tokens)
# - Use "synthetic" on other chains (mints wrapped tokens)

sepolia:  # Origin chain with real USDC
  type: collateral
  token: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238"  # Real USDC address
  mailbox: "0x..."
  name: "USD Coin"
  symbol: "USDC"
  decimals: 6

{chain-name}:  # New chain gets synthetic
  type: synthetic
  mailbox: "{mailbox-from-phase-2}"
  name: "USD Coin"
  symbol: "USDC"
  decimals: 6
```

### 3b. Deploy Warp Route

**CRITICAL:** Must use `--registry ./registry-clone` flag for CLI to find custom chain addresses:

```bash
cd hyperlane
./scripts/deploy-warp-route.sh
```

Or manually:
```bash
npx hyperlane warp deploy \
  --config ./configs/warp-route-deployment.yaml \
  --registry ./registry-clone \
  --yes
```

### 3c. Save Warp Route Addresses

```bash
cp -r ~/.hyperlane/deployments/warp_routes/USDC-* deployments/warp-routes/
```

The deployment YAML shows all router addresses and connections.

## Phase 4: Verify Deployments

```bash
cd hyperlane && source .env

# Check ICA router enrollment (should return non-zero bytes32)
NEW_ICA=$(grep "interchainAccountRouter:" deployments/{chain-name}.yaml | awk '{print $2}' | tr -d '"')
cast call $NEW_ICA "routers(uint32)(bytes32)" 1315 --rpc-url "{rpc-url}"

# Check warp router enrollment
npx hyperlane warp read --symbol USDC --registry ./registry-clone
```

If enrollment failed, run manually:
```bash
./scripts/enroll-ica-routers.sh {chain-name}
./scripts/enroll-warp-routers.sh
```

## Phase 5: Sync to Frontend

Update these files manually:

### `frontend/constants/hyperlane/deployments.ts`

Add to `SELF_HOSTED_DEPLOYMENTS`:
```typescript
{chain-id}: {
  chainId: {chain-id},
  chainName: '{chain-name}',
  displayName: '{Display Name}',
  domainId: {chain-id},
  mailbox: '{mailbox}',
  proxyAdmin: '{proxyAdmin}',
  validatorAnnounce: '{validatorAnnounce}',
  interchainAccountRouter: '{interchainAccountRouter}',
  testRecipient: '{testRecipient}',
  staticMerkleRootMultisigIsmFactory: '{...}',
  staticMessageIdMultisigIsmFactory: '{...}',
  staticAggregationIsmFactory: '{...}',
  domainRoutingIsmFactory: '{...}',
  staticAggregationHookFactory: '{...}',
  explorerUrl: '{explorer-url}',
  isTestnet: true,
  nativeCurrency: { name: '{Name}', symbol: '{SYMBOL}', decimals: 18 },
},
```

Add chain to warp route in `SELF_HOSTED_WARP_ROUTES`:
```typescript
{
  chainId: {chain-id},
  chainName: '{chain-name}',
  routerAddress: '{warp-router}',
  tokenAddress: '{token-or-same-as-router}',
  type: 'synthetic',  // or 'collateral' if origin chain
},
```

### `frontend/constants/hyperlane/chains.ts`

```typescript
export const {chainName}Chain: HyperlaneChainConfig = {
  chainId: {chain-id},
  domainId: {chain-id},
  name: '{chain-name}',
  displayName: '{Display Name}',
  protocol: 'ethereum',
  isTestnet: true,
  rpcUrl: '{rpc-url}',
  explorerUrl: '{explorer-url}',
  nativeToken: { name: '{Name}', symbol: '{SYMBOL}', decimals: 18 },
}

// Add to HYPERLANE_CHAINS array
```

## Phase 6: Run Relayer

```bash
cd hyperlane && ./scripts/run-relayer.sh
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `Registry factory addresses not found` | CLI can't find chain addresses | Add `--registry ./registry-clone` flag |
| `No chain signer set` | HYP_KEY not loaded | Use deploy script or `source .env` first |
| `no router specified for destination` | Router not enrolled | Run enrollment scripts |
| `insufficient funds` | No native tokens | Get from faucet |
| Messages not delivered | Relayer not running | `./scripts/run-relayer.sh` |

## Warp Route Types Reference

| Type | Use Case | What Happens |
|------|----------|--------------|
| `native` | Bridge native token (ETH, AVAX) | Locks native, mints synthetic |
| `collateral` | Bridge ERC20 from origin chain | Locks ERC20, mints synthetic |
| `synthetic` | Receive bridged tokens | Mints/burns wrapped tokens |

**Rule:** One chain has `native`/`collateral` (origin), all others have `synthetic`.

## File Locations Reference

| File | Purpose |
|------|---------|
| `hyperlane/chains/{chain}.yaml` | Chain config for deployment |
| `hyperlane/deployments/{chain}.yaml` | Core deployment addresses |
| `hyperlane/registry-clone/chains/{chain}/` | CLI registry (metadata.yaml + addresses.yaml) |
| `hyperlane/configs/warp-route-deployment.yaml` | Warp route config |
| `hyperlane/deployments/warp-routes/` | Deployed warp route addresses |
| `frontend/constants/hyperlane/deployments.ts` | Frontend deployment constants |
| `frontend/constants/hyperlane/chains.ts` | Frontend chain configs |
