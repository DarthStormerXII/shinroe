# Foundry Starter Kit

A comprehensive, production-ready starter kit for Ethereum smart contract development using Foundry v1.0.

[![Tests](https://github.com/your-org/foundry-starter-kit/actions/workflows/test.yml/badge.svg)](https://github.com/your-org/foundry-starter-kit/actions/workflows/test.yml)
[![Lint](https://github.com/your-org/foundry-starter-kit/actions/workflows/lint.yml/badge.svg)](https://github.com/your-org/foundry-starter-kit/actions/workflows/lint.yml)
[![Coverage](https://codecov.io/gh/your-org/foundry-starter-kit/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/foundry-starter-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- ⚡ **Foundry v1.3+** - Latest features including 5.2x faster compilation
- 🧪 **Comprehensive Testing** - Unit, fuzz, invariant, table tests, and gas snapshots
- 📊 **Gas Optimization** - Function/section snapshots and advanced profiling
- 🔍 **Security First** - Slither integration and security best practices
- 🚀 **CI/CD Ready** - GitHub Actions with Blockscout verification
- 📝 **Documentation** - Auto-generated docs with Foundry
- 🎨 **Code Quality** - Prettier, Solhint, and pre-commit hooks
- 🔧 **Developer Experience** - Makefile, debugging tools, and helper scripts
- 🔐 **EIP-712** - Typed structured data signing examples
- 📦 **Soldeer** - Native Solidity package manager
- 🐛 **Tenderly Integration** - Advanced debugging for failed transactions
- ✅ **Blockscout Verification** - Automatic contract verification

## Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) >= 18.0.0
- [Foundry](https://getfoundry.sh/)
- [Make](https://www.gnu.org/software/make/) (optional but recommended)

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/foundry-starter-kit.git
   cd foundry-starter-kit
   ```

2. **Install dependencies**
   ```bash
   make install
   # or manually:
   forge install
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Run tests**
   ```bash
   make test
   # or
   forge test
   ```

## Project Structure

```
.
├── .github/                 # GitHub Actions workflows
│   └── workflows/
│       ├── test.yml        # Testing workflow
│       └── lint.yml        # Linting workflow
├── lib/                    # Foundry dependencies
├── script/                 # Deployment and interaction scripts
│   ├── Base.s.sol         # Base script with utilities
│   ├── Deploy.s.sol       # Deployment scripts
│   └── Interactions.s.sol # Contract interaction scripts
├── src/                    # Smart contracts
│   ├── interfaces/        # Contract interfaces
│   ├── libraries/         # Solidity libraries
│   └── Counter.sol        # Example contract
├── test/                   # Test files
│   ├── unit/             # Unit tests
│   ├── integration/      # Integration tests
│   ├── fuzz/            # Fuzz tests
│   ├── invariant/       # Invariant tests
│   └── utils/           # Test utilities
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore file
├── .prettierrc.yml       # Prettier configuration
├── .solhint.json         # Solhint configuration
├── foundry.toml          # Foundry configuration
├── Makefile              # Make commands
├── package.json          # Node.js dependencies
└── README.md             # This file
```

## Development

### Building

```bash
# Build contracts
make build

# Build with production optimizations
make build-prod

# Check contract sizes
make size
```

### Testing

```bash
# Run all tests
make test

# Run specific test types
make test-unit          # Unit tests only
make test-integration   # Integration tests only
make test-fuzz         # Fuzz tests (intensive)
make test-invariant    # Invariant tests

# Run with gas report
make test-gas

# Run with coverage
make test-coverage

# Watch mode
forge test --watch
```

### Fork Testing (MANDATORY Before Deployment)

**Always test on forked networks before deploying to live networks**

```bash
# Fork Testing Workflow
# 1. Test on forked target network first
make test-fork NETWORK=sepolia
make test-fork-gas NETWORK=sepolia

# 2. Deploy to fork and verify
make deploy-fork NETWORK=sepolia
make test-fork-deployment NETWORK=sepolia

# 3. Interactive testing on fork
make fork-interact NETWORK=sepolia

# 4. Complete fork testing workflow
make deploy-with-fork-test NETWORK=sepolia

# Advanced fork testing
make test-fork-at-block NETWORK=mainnet BLOCK=18500000
make fork-test-contract NETWORK=mainnet CONTRACT=CounterTest
```

**Benefits of Fork Testing:**
- Test with real network conditions and gas prices
- Interact with existing contracts (WETH, Uniswap, etc.)
- Debug issues cheaply before mainnet deployment
- Validate gas estimates accurately
- Test against actual network state

### Code Quality

```bash
# Format code
make format

# Check formatting
make format-check

# Lint contracts
make lint

# Run security analysis
make slither
```

### Deployment

**CRITICAL: Always use fork testing before live deployment**

```bash
# STEP 1: Fork Testing (MANDATORY)
make deploy-with-fork-test NETWORK=sepolia    # Complete fork workflow
# This runs: test-fork → deploy-fork → test-fork-deployment

# STEP 2: Live Network Deployment (only after fork testing passes)
make deploy-testnet NETWORK=sepolia           # Deploy to testnet (uses PRIVATE_KEY)
make verify-deployment NETWORK=sepolia        # Verify deployment works
make deploy-mainnet NETWORK=mainnet           # Deploy to mainnet (uses MAINNET_PRIVATE_KEY)

# Alternative: Local development
make deploy-local                             # Deploy to local anvil
make deploy-tenderly                          # Deploy to Tenderly DevNet

# Advanced options
make deploy-deterministic NETWORK=sepolia     # Deploy with deterministic addresses

# Manual verification
make verify ADDRESS=0x... CONTRACT=Counter NETWORK=sepolia     # Blockscout (automatic)
make verify-tenderly ADDRESS=0x... CONTRACT=Counter           # Tenderly (debugging)
```

**Deployment Workflow:**
1. **Fork Test**: `make deploy-with-fork-test NETWORK=target`
2. **Live Deploy**: `make deploy-testnet NETWORK=target` (only after fork success)
3. **Verify**: `make verify-deployment NETWORK=target`
4. **Mainnet**: `make deploy-mainnet NETWORK=mainnet` (final step)

## Configuration

### Foundry Profiles

The project includes multiple Foundry profiles for different use cases:

- **default** - Standard development settings
- **ci** - Continuous integration with more test runs
- **production** - Optimized for mainnet deployment
- **debug** - Enhanced debugging features
- **coverage** - Optimized for coverage analysis

Use a profile:
```bash
FOUNDRY_PROFILE=production forge build
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Private keys - SEPARATE FOR SECURITY!
PRIVATE_KEY=              # Testnet deployments
MAINNET_PRIVATE_KEY=      # Mainnet deployments

# RPC URLs
MAINNET_RPC_URL=
SEPOLIA_RPC_URL=
ARBITRUM_RPC_URL=
OPTIMISM_RPC_URL=

# Blockscout Verifier URLs (auto-configured)
BLOCKSCOUT_MAINNET_URL=
BLOCKSCOUT_SEPOLIA_URL=
# ... more networks

# Tenderly Configuration
TENDERLY_ACCESS_TOKEN=
TENDERLY_PROJECT=
TENDERLY_USERNAME=

# Optional
FORK_BLOCK_NUMBER=
```

## Advanced Features

### Gas Snapshots

Advanced gas profiling with function and section snapshots:

```bash
# Create snapshot
make snapshot

# Check against snapshot
make snapshot-check

# Run gas snapshot tests
make test-gas-snapshot

# Create detailed snapshot
make snapshot-detailed

# Compare snapshots
make snapshot-diff
```

### Table Testing

Run parameterized tests with multiple inputs:

```bash
# Run table tests
make test-table
```

See `test/TableTest.t.sol` for examples.

### EIP-712 Signatures

Implement gasless transactions with typed structured data:

```bash
# Test EIP-712 implementation
make test-eip712

# Generate EIP-712 hash
make eip712-hash
```

See `src/EIP712Example.sol` for implementation.

### Fork Testing

Test against mainnet state:

```bash
# In your test file
uint256 mainnetFork = vm.createFork(vm.envString("MAINNET_RPC_URL"));
vm.selectFork(mainnetFork);
```

### Invariant Testing

The project includes advanced invariant testing setup:

```solidity
// See test/invariant/CounterInvariant.t.sol
contract CounterInvariantTest is BaseTest {
    // Invariant: counter value should match operations
    function invariant_CounterValueMatchesNetOperations() public {
        // Implementation
    }
}
```

### Deterministic Deployments

Deploy contracts to the same address across chains:

```bash
forge script script/Deploy.s.sol:DeployScript \
    --sig "runDeterministic()" \
    --rpc-url sepolia \
    --broadcast
```

## Scripts

### Deployment Scripts

- `Deploy.s.sol` - Main deployment script with Blockscout verification
- `DeployMultichain.s.sol` - Multi-chain deployment
- `UpgradeScript.s.sol` - Upgrade existing contracts
- `TenderlyDebug.s.sol` - Tenderly debugging utilities

### Interaction Scripts

```bash
# Increment counter
make interact-increment NETWORK=sepolia

# Get contract info
make interact-info NETWORK=sepolia

# Debug failed transaction
make debug-tx TX_HASH=0x... NETWORK=sepolia

# Simulate failure for debugging
make simulate-failure TARGET=0x... DATA=0x... NETWORK=sepolia
```

### Tenderly Integration

```bash
# Get Tenderly DevNet info
make tenderly-info

# Verify all contracts on Tenderly
make tenderly-verify-all
```

## Security

### Best Practices

- Use custom errors for gas efficiency
- Implement proper access control
- Follow checks-effects-interactions pattern
- Use latest Solidity version
- Enable optimizer for production
- **Separate private keys for testnet/mainnet**
- **Automatic Blockscout verification**

### Security Tools

```bash
# Run Slither with custom config
make slither

# Run Mythril
make mythril

# Manual audit checklist
# See CLAUDE.md for security checklist
```

## CI/CD

The project includes GitHub Actions workflows:

1. **Test Workflow** - Runs on every push/PR
   - Unit, integration, fuzz, invariant, and table tests
   - Gas reports and snapshots
   - Coverage reporting

2. **Lint Workflow** - Code quality checks
   - Solidity formatting
   - Solhint rules
   - Commit message linting

3. **Deploy Workflow** - Manual deployment
   - Automatic Blockscout verification
   - Network-specific private keys
   - Tenderly integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`npm run commit`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `test:` Test additions or modifications
- `chore:` Maintenance tasks

## Debugging Failed Transactions

### Debugging Workflow

**Always start with cast commands, then use Tenderly for complex errors**

#### Step 1: Cast Commands (First Attempt)
```bash
# Get transaction details
cast tx <TX_HASH> --rpc-url <RPC_URL>

# Run transaction trace
cast run <TX_HASH> --rpc-url <RPC_URL>

# Decode revert reason
cast 4byte-decode <REVERT_DATA>

# Check event logs
cast logs --address <CONTRACT> --rpc-url <RPC_URL>
```

#### Step 2: Tenderly (If Cast Fails)
```bash
# Quick debug with dashboard link
make debug-tx TX_HASH=0x... NETWORK=sepolia

# Get detailed API response
make debug-tx-details TX_HASH=0x...

# Simulate transaction
make tenderly-simulate FROM=0x... TO=0x... DATA=0x...
```

### When to Use Tenderly

Tenderly is **mandatory** for debugging when:
- Cast commands don't reveal the error
- Silent failures (no revert reason)
- Complex nested call traces
- Gas profiling needed
- State changes visualization required

### Debug Commands

```bash
# Show debugging workflow
make debug-workflow

# Debug specific transaction
make debug-tx TX_HASH=0x... NETWORK=sepolia

# Get Tenderly API details
make tenderly-api-debug TX_HASH=0x...

# Check Tenderly setup
make tenderly-info
```

## Troubleshooting

### Common Issues

1. **Compilation errors**
   ```bash
   forge clean
   forge build
   ```

2. **Test failures**
   ```bash
   # Run with verbosity
   forge test -vvvv
   ```

3. **Gas snapshot mismatches**
   ```bash
   # Update snapshots
   forge snapshot
   ```

4. **Transaction reverts without reason**
   ```bash
   # MUST use Tenderly for these
   make debug-tx TX_HASH=0x... NETWORK=sepolia
   ```

## Package Management

### Soldeer - Native Solidity Package Manager

```bash
# Install a package
make soldeer-install PACKAGE=@openzeppelin-contracts

# Update all packages
make soldeer-update

# Push package to registry
make soldeer-push PACKAGE=my-package

# Login to soldeer
make soldeer-login
```

Packages are configured in `foundry.toml` under `[dependencies]`.

## Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [Blockscout Documentation](https://docs.blockscout.com/)
- [Tenderly Documentation](https://docs.tenderly.co/)
- [Soldeer Registry](https://soldeer.xyz/)
- [Solidity Documentation](https://docs.soliditylang.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/)
- [Ethereum Development Documentation](https://ethereum.org/developers)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Foundry](https://github.com/foundry-rs/foundry) by Paradigm
- [OpenZeppelin](https://openzeppelin.com/) for security standards
- [Solmate](https://github.com/transmissions11/solmate) for gas-optimized contracts

## Important Notes

### 🔐 Security
- **Always use separate private keys**: `PRIVATE_KEY` for testnet, `MAINNET_PRIVATE_KEY` for mainnet
- **Verification is automatic**: Contracts verify on Blockscout during deployment
- **Debug with Tenderly**: Use `make debug-tx` for failed transactions

### 📚 Documentation
- See `CLAUDE.md` for comprehensive development guide with Claude Code
- Run `forge doc` to generate contract documentation
- Check `test/` directory for usage examples

### 🚀 Quick Tips
- Use `--slow` flag for Tenderly deployments
- Enable corpus directory for coverage-guided fuzzing
- Profile gas usage with snapshot tests
- Use table tests for multiple scenarios

---

Built with ❤️ using Foundry v1.3+