// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "../utils/BaseTest.sol";
import {Counter} from "@/Counter.sol";
import {console2} from "forge-std/console2.sol";

/// @title ForkTest
/// @notice Demonstrates fork testing patterns and best practices
/// @dev Run with: forge test --fork-url <RPC_URL> --match-contract ForkTest
contract ForkTest is BaseTest {
    
    uint256 mainnetFork;
    uint256 sepoliaFork;
    uint256 arbitrumFork;
    
    Counter counter;
    
    /// @notice Setup forks for testing
    function setUp() public override {
        super.setUp();
        
        // Create forks for different networks
        mainnetFork = vm.createFork(vm.envString("MAINNET_RPC_URL"));
        sepoliaFork = vm.createFork(vm.envString("SEPOLIA_RPC_URL"));
        
        // Try to create Arbitrum fork if URL is available
        try vm.envString("ARBITRUM_RPC_URL") returns (string memory arbitrumUrl) {
            arbitrumFork = vm.createFork(arbitrumUrl);
        } catch {
            console2.log("Arbitrum RPC URL not set, skipping arbitrum fork");
        }
        
        // Deploy Counter on current fork
        counter = new Counter();
    }
    
    /// @notice Test fork switching between networks
    function test_ForkSwitching() public {
        console2.log("Testing fork switching...");
        
        // Start on Sepolia
        vm.selectFork(sepoliaFork);
        assertEq(block.chainid, 11155111, "Should be on Sepolia");
        console2.log("SUCCESS Switched to Sepolia, chain ID:", block.chainid);
        
        // Switch to Mainnet
        vm.selectFork(mainnetFork);
        assertEq(block.chainid, 1, "Should be on Mainnet");
        console2.log("SUCCESS Switched to Mainnet, chain ID:", block.chainid);
    }
    
    /// @notice Test deployment on forked network
    function test_ForkDeployment() public {
        console2.log("Testing deployment on fork...");
        
        // Deploy on current fork
        Counter forkCounter = new Counter();
        
        // Test basic functionality
        forkCounter.increment();
        assertEq(forkCounter.count(), 1, "Counter should be 1");
        console2.log("SUCCESS Fork deployment successful");
        
        // Test gas usage on fork (should match live network)
        uint256 gasStart = gasleft();
        forkCounter.increment();
        uint256 gasUsed = gasStart - gasleft();
        console2.log("Gas used for increment on fork:", gasUsed);
        
        // Gas should be reasonable (adjust based on your contract)
        assertTrue(gasUsed < 100000, "Gas usage too high");
        console2.log("SUCCESS Fork gas usage reasonable");
    }
    
    /// @notice Test interaction with existing contracts on fork
    function test_ForkExistingContracts() public {
        // This test demonstrates interacting with contracts that exist on the forked network
        // For example, testing against WETH on mainnet
        
        vm.selectFork(mainnetFork);
        
        // WETH contract address on mainnet
        address WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        
        // Check WETH exists
        assertTrue(WETH.code.length > 0, "WETH should exist on mainnet fork");
        console2.log("SUCCESS WETH contract found on mainnet fork");
        
        // Could test interactions here (deposit, withdrawal, etc.)
        console2.log("SUCCESS Fork existing contract test passed");
    }
    
    /// @notice Test block manipulation on fork
    function test_ForkBlockManipulation() public {
        console2.log("Testing block manipulation on fork...");
        
        uint256 originalBlock = block.number;
        uint256 originalTimestamp = block.timestamp;
        
        console2.log("Original block:", originalBlock);
        console2.log("Original timestamp:", originalTimestamp);
        
        // Roll forward 100 blocks
        vm.roll(originalBlock + 100);
        assertEq(block.number, originalBlock + 100, "Block should advance");
        console2.log("SUCCESS Block rolled forward:", block.number);
        
        // Warp time forward 1 hour
        vm.warp(originalTimestamp + 3600);
        assertEq(block.timestamp, originalTimestamp + 3600, "Time should advance");
        console2.log("SUCCESS Time warped forward:", block.timestamp);
        
        // Test that contract still works after manipulation
        counter.increment();
        assertEq(counter.count(), 1, "Counter should still work");
        console2.log("SUCCESS Contract works after block manipulation");
    }
    
    /// @notice Test persistent accounts across forks
    function test_ForkPersistentAccounts() public {
        console2.log("Testing persistent accounts...");
        
        // Make test contract persistent
        vm.makePersistent(address(this));
        vm.makePersistent(address(counter));
        
        // Increment counter on Sepolia fork
        vm.selectFork(sepoliaFork);
        counter.increment();
        assertEq(counter.count(), 1, "Counter should be 1 on Sepolia");
        console2.log("SUCCESS Counter incremented on Sepolia");
        
        // Switch to mainnet fork - persistent contracts should maintain state
        vm.selectFork(mainnetFork);
        assertEq(counter.count(), 1, "Counter should persist across forks");
        console2.log("SUCCESS Persistent account works across forks");
        
        // Clean up
        vm.revokePersistent(address(this));
        vm.revokePersistent(address(counter));
    }
    
    /// @notice Test fork at specific block number
    function test_ForkAtBlock() public {
        console2.log("Testing fork at specific block...");
        
        // Create fork at specific block (adjust block number as needed)
        uint256 blockNumber = 18000000; // Example block number
        
        try vm.createFork(vm.envString("MAINNET_RPC_URL"), blockNumber) returns (uint256 specificFork) {
            vm.selectFork(specificFork);
            
            assertEq(block.number, blockNumber, "Should be at specific block");
            console2.log("SUCCESS Forked at specific block:", block.number);
            
            // Could test historical state here
            console2.log("SUCCESS Fork at block test passed");
        } catch {
            console2.log("Could not create fork at specific block - RPC might not support it");
        }
    }
    
    /// @notice Test multi-fork contract interaction
    function test_MultiForkInteraction() public {
        console2.log("Testing multi-fork contract interaction...");
        
        // Deploy counter on Sepolia
        vm.selectFork(sepoliaFork);
        Counter sepoliaCounter = new Counter();
        sepoliaCounter.increment();
        sepoliaCounter.increment();
        assertEq(sepoliaCounter.count(), 2, "Sepolia counter should be 2");
        
        // Deploy counter on Mainnet
        vm.selectFork(mainnetFork);
        Counter mainnetCounter = new Counter();
        mainnetCounter.increment();
        assertEq(mainnetCounter.count(), 1, "Mainnet counter should be 1");
        
        // Verify each fork maintains its own state
        vm.selectFork(sepoliaFork);
        assertEq(sepoliaCounter.count(), 2, "Sepolia state preserved");
        
        vm.selectFork(mainnetFork);
        assertEq(mainnetCounter.count(), 1, "Mainnet state preserved");
        
        console2.log("SUCCESS Multi-fork interaction test passed");
    }
    
    /// @notice Test gas estimation accuracy on fork
    function test_ForkGasEstimation() public {
        console2.log("Testing gas estimation accuracy on fork...");
        
        // Deploy contract and measure gas
        uint256 gasStart = gasleft();
        Counter gasTestCounter = new Counter();
        uint256 deploymentGas = gasStart - gasleft();
        console2.log("Deployment gas on fork:", deploymentGas);
        
        // Test function call gas
        gasStart = gasleft();
        gasTestCounter.increment();
        uint256 incrementGas = gasStart - gasleft();
        console2.log("Increment gas on fork:", incrementGas);
        
        // Compare with expected ranges
        assertTrue(deploymentGas > 100000, "Deployment should use significant gas");
        assertTrue(incrementGas < 100000, "Increment should be efficient");
        
        console2.log("SUCCESS Fork gas estimation test passed");
    }
    
    /// @notice Test failure scenarios on fork
    function test_ForkFailureScenarios() public {
        console2.log("Testing failure scenarios on fork...");
        
        // Test unauthorized access
        vm.prank(address(0x1234));
        vm.expectRevert();
        counter.reset(); // Should fail for non-owner
        console2.log("SUCCESS Unauthorized access correctly reverted");
        
        // Test with insufficient balance
        address poorAddress = address(0x5678);
        vm.deal(poorAddress, 0); // Give 0 ETH
        
        vm.prank(poorAddress);
        // Deploy should work (no ETH required for this contract)
        Counter poorCounter = new Counter();
        assertEq(poorCounter.count(), 0, "Counter should deploy successfully");
        console2.log("SUCCESS Deployment works with 0 ETH balance");
        
        console2.log("SUCCESS Failure scenarios test passed");
    }
}

/// @title ForkBenchmark
/// @notice Performance benchmarking on forked networks
contract ForkBenchmark is BaseTest {
    
    Counter counter;
    
    function setUp() public override {
        super.setUp();
        counter = new Counter();
    }
    
    /// @notice Benchmark operations on fork
    function test_BenchmarkOnFork() public {
        console2.log("Benchmarking operations on fork...");
        
        uint256 iterations = 100;
        uint256 totalGas = 0;
        
        // Benchmark increment operations
        for (uint256 i = 0; i < iterations; i++) {
            uint256 gasStart = gasleft();
            counter.increment();
            totalGas += gasStart - gasleft();
        }
        
        uint256 avgGas = totalGas / iterations;
        console2.log("Average gas per increment:", avgGas);
        console2.log("Total iterations:", iterations);
        console2.log("Final count:", counter.count());
        
        // Verify reasonable gas usage
        assertTrue(avgGas < 50000, "Average gas should be reasonable");
        assertEq(counter.count(), iterations, "Count should match iterations");
        
        console2.log("SUCCESS Fork benchmark completed");
    }
}