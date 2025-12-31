# Reown (AppKit) Migration Documentation

## Overview
Reown (formerly WalletConnect) is a comprehensive Web3 connection solution that replaces RainbowKit. AppKit is Reown's UI SDK that provides wallet connectivity, social logins, and on-chain interactions.

## Key Features

### 1. Core Features
- **AppKit Modal**: Complete wallet connection UI with customizable themes
- **Multi-chain Support**: EVM, Solana, Bitcoin, and more
- **Social Logins**: Google, Discord, Apple, GitHub, X (Twitter)
- **Email/Phone Wallet**: Built-in smart wallet creation via email/phone
- **On-ramp**: Fiat to crypto conversion
- **Analytics**: Built-in analytics tracking
- **ENS Support**: Domain name resolution
- **WalletConnect Protocol**: QR code and deep linking support

### 2. UI Components

#### Web Components (Global)
- `<appkit-button />` - Main connect/account button
- `<appkit-connect-button />` - Dedicated connect button
- `<appkit-account-button />` - Account management button
- `<appkit-network-button />` - Network switcher button
- `<appkit-wallet-button />` - Specific wallet connection button

#### Component Properties
```tsx
// appkit-button
<appkit-button
  disabled={true}
  balance="show" // or "hide"
  size="md" // or "sm"
  label="Connect"
  loadingLabel="Loading..."
/>

// appkit-wallet-button (for specific wallets)
<appkit-wallet-button
  wallet="metamask"
  namespace="eip155" // or "solana", "bip122"
/>
```

### 3. Hooks & Utilities

#### Core Hooks (React)
```tsx
import { useAppKit } from '@reown/appkit/react'
import { useAppKitState } from '@reown/appkit/react'
import { useAppKitEvents } from '@reown/appkit/react'
import { useAppKitTheme } from '@reown/appkit/react'
import { useAppKitAccount } from '@reown/appkit-adapter-wagmi'
import { useAppKitNetwork } from '@reown/appkit-adapter-wagmi'
```

### 4. Configuration Options

#### Required Configuration
```tsx
const projectId = 'YOUR_PROJECT_ID' // Get from https://dashboard.reown.com

const metadata = {
  name: 'Your App Name',
  description: 'Your App Description',
  url: 'https://yourapp.com',
  icons: ['https://yourapp.com/icon.png']
}
```

#### Feature Flags
```tsx
features: {
  analytics: true,           // Analytics tracking
  email: true,               // Email wallet support
  socials: ['google', 'discord', 'apple'], // Social logins
  emailShowWallets: true,    // Show wallets on email screen
  onramp: true,              // Fiat on-ramp
  swaps: true,               // Token swaps
}
```

#### UI Customization
```tsx
themeMode: 'light', // or 'dark'
themeVariables: {
  '--w3m-color-mix': '#00BB7F',
  '--w3m-color-mix-strength': 40
}
```

## Migration Steps

### 1. Package Changes
**Remove:**
- `@rainbow-me/rainbowkit`
- `@rainbow-me/rainbowkit/styles.css`

**Add:**
- `@reown/appkit` - Core AppKit library
- `@reown/appkit-adapter-wagmi` - Wagmi adapter
- `@reown/appkit/networks` - Network definitions

### 2. Wagmi Configuration
Replace RainbowKit config with Reown's WagmiAdapter:

```tsx
// Old (RainbowKit)
import { getDefaultWallets } from '@rainbow-me/rainbowkit'
const { connectors } = getDefaultWallets({ appName, projectId, chains })

// New (Reown)
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true
})
```

### 3. Provider Updates
Replace RainbowKitProvider with AppKit initialization:

```tsx
// Old
<RainbowKitProvider theme={darkTheme()}>
  {children}
</RainbowKitProvider>

// New
createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata,
  features: { analytics: true }
})
```

### 4. Connect Button
Replace RainbowKit ConnectButton:

```tsx
// Old
import { ConnectButton } from '@rainbow-me/rainbowkit'
<ConnectButton />

// New (Option 1: Web Component)
<appkit-button />

// New (Option 2: Hook)
import { useAppKit } from '@reown/appkit/react'
const { open } = useAppKit()
<button onClick={() => open()}>Connect</button>
```

## Advanced Features

### 1. Multi-chain Support
```tsx
// Support multiple chains simultaneously
const adapters = [
  new WagmiAdapter({ networks: evmNetworks }),
  new SolanaAdapter(),
  new BitcoinAdapter()
]
```

### 2. Custom Wallets
```tsx
import { createAppKitWalletButton } from '@reown/appkit-wallet-button'
const walletButton = createAppKitWalletButton()
walletButton.connect('metamask')
```

### 3. Programmatic Control
```tsx
const modal = createAppKit(config)
modal.open() // Open modal
modal.open({ view: 'Networks' }) // Open specific view
modal.close() // Close modal
modal.getState() // Get current state
modal.subscribeState(callback) // Subscribe to state changes
```

### 4. Event Handling
```tsx
modal.subscribeEvents((event) => {
  console.log('Event:', event)
})
```

## Best Practices

1. **SSR Support**: Use `ssr: true` in WagmiAdapter for Next.js apps
2. **Metadata**: Ensure URL matches your domain for proper wallet display
3. **Icons**: Use high-res icons (minimum 256x256)
4. **Project ID**: Never expose in client code without proper domain restrictions
5. **Theme**: Match your app's theme for consistency
6. **Features**: Only enable features you actually need

## Common Issues & Solutions

1. **Hydration Errors**: Wrap web components in `<ClientOnly>` for SSR apps
2. **TypeScript**: Some web components need type declarations
3. **Style Conflicts**: AppKit uses CSS variables, may need scoping
4. **Network Switching**: Ensure proper chain configuration in wagmi

## Migration Completed ✅

### What was changed:
1. **Package.json**: Removed `@rainbow-me/rainbowkit` and added `@reown/appkit` + `@reown/appkit-adapter-wagmi`
2. **Wagmi Config**: Replaced RainbowKit's `getDefaultConfig` with `WagmiAdapter`
3. **Providers**: Replaced `RainbowKitProvider` with `createAppKit` initialization
4. **Layout**: Added cookies support for SSR hydration
5. **Navbar**: Replaced `ConnectButton.Custom` with `<appkit-button />`
6. **Contract Demo**: Updated `useConnectModal` to `useAppKit`

### Features enabled:
- ✅ Email & phone wallet creation
- ✅ Social logins (Google, Discord, Apple, GitHub, X)
- ✅ On-ramp (fiat to crypto)
- ✅ Token swaps
- ✅ Analytics tracking
- ✅ Dark/light theme support
- ✅ All available wallets
- ✅ Multi-chain support (Polygon, Base, Flow)

### Build Status: ✅ PASSING
- All TypeScript compilation errors resolved
- Build completed successfully
- Dev server starts without issues

## Resources
- [Reown Dashboard](https://dashboard.reown.com)
- [AppKit Docs](https://docs.reown.com/appkit/overview)
- [Migration Guides](https://docs.reown.com/appkit/upgrade)
- [Examples](https://github.com/reown-com/appkit-web-examples)