# Fork Testing Guide

This directory contains examples and utilities for fork testing with Foundry.

## What is Fork Testing?

Fork testing allows you to test smart contracts against the exact state of a live blockchain network without spending real tokens or making actual transactions. It's like creating a local copy of the blockchain at a specific point in time.

## Why Fork Test?

1. **Real Network Conditions**: Test with actual gas prices, existing contracts, and network state
2. **Cost-Free**: No need to spend real ETH or tokens during testing
3. **Safe**: Debug and fix issues before deploying to live networks
4. **Comprehensive**: Test interactions with protocols like Uniswap, AAVE, etc.

## Quick Start

### 1. Set up RPC URLs in .env
```bash
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
ARBITRUM_RPC_URL=https://arb-mainnet.g.alchemy.com/v2/YOUR-API-KEY
```

### 2. Run fork tests
```bash
# Test on forked Sepolia
make test-fork NETWORK=sepolia

# Test on forked Mainnet
make test-fork NETWORK=mainnet

# Deploy to fork first, then test
make deploy-fork NETWORK=sepolia
make test-fork-deployment NETWORK=sepolia
```

### 3. Full fork testing workflow
```bash
# This does everything: fork → test → deploy → verify
make deploy-with-fork-test NETWORK=sepolia
```

## Fork Testing Patterns

### Basic Fork Test
```solidity
contract MyForkTest is Test {
    uint256 mainnetFork;
    
    function setUp() public {
        // Create fork of mainnet
        mainnetFork = vm.createFork(vm.envString("MAINNET_RPC_URL"));
        vm.selectFork(mainnetFork);
    }
    
    function testDeployOnFork() public {
        // Deploy your contract on the fork
        MyContract contract = new MyContract();
        
        // Test functionality
        contract.someFunction();
        assertEq(contract.someValue(), expectedValue);
    }
}
```

### Multi-Fork Testing
```solidity
function testMultipleNetworks() public {
    uint256 mainnetFork = vm.createFork(vm.envString("MAINNET_RPC_URL"));
    uint256 sepoliaFork = vm.createFork(vm.envString("SEPOLIA_RPC_URL"));
    
    // Test on Mainnet fork
    vm.selectFork(mainnetFork);
    // ... deploy and test ...
    
    // Test on Sepolia fork
    vm.selectFork(sepoliaFork);
    // ... deploy and test ...
}
```

### Historical Fork Testing
```solidity
function testAtSpecificBlock() public {
    // Fork at specific block number
    uint256 blockNumber = 18000000;
    uint256 historicalFork = vm.createFork(
        vm.envString("MAINNET_RPC_URL"), 
        blockNumber
    );
    
    vm.selectFork(historicalFork);
    assertEq(block.number, blockNumber);
    
    // Test against historical state
}
```

### Existing Contract Integration
```solidity
function testWithExistingContracts() public {
    vm.selectFork(mainnetFork);
    
    // Interact with WETH on mainnet
    IWETH weth = IWETH(0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2);
    
    // Give ourselves some ETH to wrap
    vm.deal(address(this), 10 ether);
    
    // Test WETH interaction
    weth.deposit{value: 1 ether}();
    assertEq(weth.balanceOf(address(this)), 1 ether);
}
```

## Commands Reference

### Fork Testing Commands
- `make test-fork NETWORK=sepolia` - Run tests on forked network
- `make test-fork-gas NETWORK=sepolia` - Fork tests with gas report
- `make deploy-fork NETWORK=sepolia` - Deploy to fork
- `make test-fork-deployment NETWORK=sepolia` - Test fork deployment
- `make fork-interact NETWORK=sepolia` - Interact with fork contracts
- `make test-fork-at-block NETWORK=mainnet BLOCK=18500000` - Fork at specific block
- `make deploy-with-fork-test NETWORK=sepolia` - Complete fork workflow

### Environment Variables
- `NETWORK` - Target network (sepolia, mainnet, arbitrum, etc.)
- `BLOCK` - Specific block number for historical forks
- `CONTRACT` - Specific contract to test

## Best Practices

### 1. Always Fork First
```bash
# ✅ CORRECT - Test on fork first
make deploy-fork NETWORK=sepolia
make test-fork-deployment NETWORK=sepolia
make deploy-testnet NETWORK=sepolia

# ❌ WRONG - Deploy directly to live network
make deploy-testnet NETWORK=sepolia
```

### 2. Test Gas Usage
```bash
# Compare gas usage between fork and live network
make test-fork-gas NETWORK=sepolia
```

### 3. Test Edge Cases
```solidity
function testEdgeCases() public {
    // Test with 0 ETH balance
    vm.deal(address(this), 0);
    
    // Test with max values
    // Test with unauthorized access
    // Test with contract at different states
}
```

### 4. Use Persistent Accounts
```solidity
function testPersistentAccounts() public {
    vm.makePersistent(address(myContract));
    
    // Switch forks while keeping contract state
    vm.selectFork(otherFork);
    // myContract state persists across forks
}
```

## Troubleshooting

### Common Issues

1. **RPC Rate Limits**
   - Use dedicated RPC endpoints (Alchemy, Infura)
   - Add delays between requests if needed

2. **Block Number Too Old**
   - Some RPC providers don't support very old blocks
   - Use recent block numbers for historical testing

3. **Contract Not Found**
   - Ensure you're forking the correct network
   - Check that the contract exists at the fork block

4. **Gas Estimation Differences**
   - Fork gas usage should match live network
   - If different, check block number and network state

### Debug Fork Issues

```bash
# Check fork status
forge test --fork-url $MAINNET_RPC_URL -vvvv

# Test specific fork functionality
make test-fork-deployment NETWORK=sepolia

# Use Tenderly for advanced debugging
make debug-tx TX_HASH=0x... NETWORK=sepolia
```

## Advanced Usage

### Performance Testing
```solidity
function testPerformanceOnFork() public {
    uint256 iterations = 100;
    uint256 totalGas = 0;
    
    for (uint256 i = 0; i < iterations; i++) {
        uint256 gasStart = gasleft();
        contract.operationToTest();
        totalGas += gasStart - gasleft();
    }
    
    console.log("Average gas:", totalGas / iterations);
}
```

### State Snapshots
```solidity
function testWithSnapshots() public {
    // Take snapshot of current state
    uint256 snapshot = vm.snapshot();
    
    // Modify state
    contract.changeState();
    
    // Revert to snapshot
    vm.revertTo(snapshot);
    
    // State is back to original
}
```

### Time Manipulation
```solidity
function testTimeTravel() public {
    // Move to future block
    vm.roll(block.number + 1000);
    
    // Move time forward
    vm.warp(block.timestamp + 30 days);
    
    // Test time-dependent functionality
}
```

Remember: **Fork testing is mandatory before any live deployment!**