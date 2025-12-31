---
description: Switch auth provider in frontend/
argument: <thirdweb|reown|dynamic|privy|rainbowkit>
---

# Switch Auth Provider to $ARGUMENTS

All provider implementations are in `frontend/lib/web3/providers/`. Switching involves:
1. Commenting out the old provider's files
2. Uncommenting the new provider's files
3. Updating providers/index.ts exports

**DO NOT uninstall packages** - all provider packages stay installed but unused providers are commented out.

## Steps

### 1. Comment out the CURRENT provider files

Find the currently active provider (the one NOT commented out) and wrap all its files in comment blocks.

For each file in `frontend/lib/web3/providers/{current_provider}/`:
```
// Wrap entire file content like this:
/**
 * DISABLED - This provider is not currently active
 * To enable, uncomment this file and update providers/index.ts
 *
 * {original file content here with each line prefixed with " * "}
 */
```

### 2. Uncomment the NEW provider files

For each file in `frontend/lib/web3/providers/$ARGUMENTS/`:
- Remove the `/**` comment block wrapper
- Remove the ` * ` prefix from each line
- Remove the trailing ` */`

The files should be restored to their original executable TypeScript/TSX code.

### 3. Update providers/index.ts

Edit `frontend/lib/web3/providers/index.ts` - change ALL imports from current provider to `$ARGUMENTS`:

```typescript
// Core Hooks - change all paths
export { useAccount } from './$ARGUMENTS/account'
export { usePublicClient, useWalletClient } from './$ARGUMENTS/clients'
export { useChainId, useSwitchChain, useChains } from './$ARGUMENTS/chain'
export { useBalance } from './$ARGUMENTS/balance'
export { useSendTransaction, useWaitForTransaction, useGasPrice } from './$ARGUMENTS/transaction'
export { useReadContract, useWriteContract } from './$ARGUMENTS/contract'
export { useConnect, useDisconnect } from './$ARGUMENTS/connection'
export { useEnsName, useEnsAvatar } from './$ARGUMENTS/ens'
export { useSignMessage, useSignTypedData } from './$ARGUMENTS/signature'

// Components
export { ConnectButton } from './$ARGUMENTS/connect-button'
export { Web3Provider } from './$ARGUMENTS/web3-provider'

// Provider-specific exports (update based on provider)
// See provider-specific exports section below

// Types
export type { ... } from './$ARGUMENTS/types'
```

### 4. Update provider-specific exports

Each provider has unique exports. Update the provider-specific section in index.ts:

**thirdweb:**
```typescript
export {
  thirdwebClient,
  getThirdwebClient,
  isThirdwebConfigured,
  useThirdwebWallet,
  useThirdwebAccount,
} from './thirdweb/thirdweb-client'
export { supportedChains, getSupportedChainIds } from './thirdweb/config'
```

**reown:**
```typescript
export { wagmiAdapter, wagmiConfig, supportedChains, projectId, appKitMetadata } from './reown/config'
```

**dynamic:**
```typescript
export { wagmiConfig, chains, type SupportedChainId } from './dynamic/config'
```

**privy:**
```typescript
export { usePrivy, useWallets, useLogin, useLogout } from '@privy-io/react-auth'
export { wagmiConfig, chains } from './privy/config'
export type { SupportedChainId } from './privy/config'
```

**rainbowkit:**
```typescript
export { wagmiConfig, chains } from './rainbowkit/config'
export type { SupportedChainId } from './rainbowkit/config'
```

### 5. Set environment variable

Add to `frontend/.env.local`:

| Provider | Env Var |
|----------|---------|
| thirdweb | `NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id` |
| reown | `NEXT_PUBLIC_REOWN_PROJECT_ID=your_project_id` |
| dynamic | `NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_env_id` |
| privy | `NEXT_PUBLIC_PRIVY_APP_ID=your_app_id` |
| rainbowkit | `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id` |

### 6. Verify

```bash
cd frontend && npm run build
```

## Notes

- All protocols import from `@/lib/web3` - no changes needed in protocol pages
- `/x402/*` pages require thirdweb specifically (has x402 payment integration)
- All 5 providers remain installed - only the active one is uncommented
- Provider files are in `lib/web3/providers/{provider}/`
