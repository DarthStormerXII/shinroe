// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseScript} from "./Base.s.sol";
import {Counter} from "@/Counter.sol";
import {console2} from "forge-std/console2.sol";

/// @title ForkTestScript
/// @notice Script for testing deployments on forked networks
/// @dev This script validates that deployments work correctly on fork before live deployment
contract ForkTestScript is BaseScript {
    
    /// @notice Main test function - validates deployment functionality
    function run() public {
        console2.log("====================================");
        console2.log("Fork Deployment Testing");
        console2.log("====================================");
        console2.log("Network:", getNetworkName());
        console2.log("Chain ID:", block.chainid);
        console2.log("Block Number:", block.number);
        console2.log("Fork Block:", block.number);
        console2.log("====================================");
        
        // Test deployment loading
        testDeploymentLoading();
        
        // Test contract functionality
        testContractFunctionality();
        
        // Test gas usage
        testGasUsage();
        
        // Test edge cases
        testEdgeCases();
        
        console2.log("====================================");
        console2.log("Fork deployment test PASSED SUCCESS");
        console2.log("Ready for live network deployment");
        console2.log("====================================");
    }
    
    /// @notice Test that deployed contracts can be loaded
    function testDeploymentLoading() public view {
        console2.log("Testing deployment loading...");
        
        // Load Counter contract
        address counterAddr = loadDeployment("Counter");
        require(counterAddr != address(0), "Counter deployment not found");
        console2.log("SUCCESS Counter loaded at:", counterAddr);
        
        // Verify contract has code
        require(counterAddr.code.length > 0, "Counter has no code");
        console2.log("SUCCESS Counter has bytecode");
        
        console2.log("SUCCESS Deployment loading test passed");
    }
    
    /// @notice Test basic contract functionality
    function testContractFunctionality() public {
        console2.log("Testing contract functionality...");
        
        // Load contract
        Counter counter = Counter(loadDeployment("Counter"));
        
        // Test initial state
        uint256 initialCount = counter.count();
        console2.log("Initial count:", initialCount);
        
        // Test increment
        uint256 gasStart = gasleft();
        counter.increment();
        uint256 gasUsed = gasStart - gasleft();
        console2.log("Increment gas used:", gasUsed);
        
        uint256 newCount = counter.count();
        require(newCount == initialCount + 1, "Increment failed");
        console2.log("SUCCESS Increment works, new count:", newCount);
        
        // Test incrementBy
        gasStart = gasleft();
        counter.incrementBy(5);
        gasUsed = gasStart - gasleft();
        console2.log("IncrementBy(5) gas used:", gasUsed);
        
        uint256 finalCount = counter.count();
        require(finalCount == newCount + 5, "IncrementBy failed");
        console2.log("SUCCESS IncrementBy works, final count:", finalCount);
        
        // Test decrement
        gasStart = gasleft();
        counter.decrement();
        gasUsed = gasStart - gasleft();
        console2.log("Decrement gas used:", gasUsed);
        
        uint256 decrementedCount = counter.count();
        require(decrementedCount == finalCount - 1, "Decrement failed");
        console2.log("SUCCESS Decrement works, count:", decrementedCount);
        
        console2.log("SUCCESS Contract functionality test passed");
    }
    
    /// @notice Test gas usage is within expected ranges
    function testGasUsage() public {
        console2.log("Testing gas usage...");
        
        Counter counter = Counter(loadDeployment("Counter"));
        
        // Expected gas ranges (update based on your contract)
        uint256 MAX_INCREMENT_GAS = 50_000;
        uint256 MAX_DECREMENT_GAS = 50_000;
        uint256 MAX_RESET_GAS = 50_000;
        
        // Test increment gas
        uint256 gasStart = gasleft();
        counter.increment();
        uint256 incrementGas = gasStart - gasleft();
        require(incrementGas < MAX_INCREMENT_GAS, "Increment gas too high");
        console2.log("SUCCESS Increment gas acceptable:", incrementGas);
        
        // Test decrement gas
        gasStart = gasleft();
        counter.decrement();
        uint256 decrementGas = gasStart - gasleft();
        require(decrementGas < MAX_DECREMENT_GAS, "Decrement gas too high");
        console2.log("SUCCESS Decrement gas acceptable:", decrementGas);
        
        // Test reset gas (as owner)
        gasStart = gasleft();
        counter.reset();
        uint256 resetGas = gasStart - gasleft();
        require(resetGas < MAX_RESET_GAS, "Reset gas too high");
        console2.log("SUCCESS Reset gas acceptable:", resetGas);
        
        console2.log("SUCCESS Gas usage test passed");
    }
    
    /// @notice Test edge cases and error conditions
    function testEdgeCases() public {
        console2.log("Testing edge cases...");
        
        Counter counter = Counter(loadDeployment("Counter"));
        
        // Test unauthorized reset (should fail)
        vm.startPrank(address(0x1234));
        try counter.reset() {
            revert("Reset should have failed for non-owner");
        } catch {
            console2.log("SUCCESS Unauthorized reset correctly reverted");
        }
        vm.stopPrank();
        
        // Test large increment
        counter.incrementBy(1000);
        uint256 largeCount = counter.count();
        require(largeCount >= 1000, "Large increment failed");
        console2.log("SUCCESS Large increment works, count:", largeCount);
        
        // Test underflow protection (if applicable)
        counter.reset(); // Reset to 0
        try counter.decrement() {
            // If decrement doesn't revert, check it handles underflow correctly
            uint256 underflowResult = counter.count();
            console2.log("Underflow result:", underflowResult);
            console2.log("SUCCESS Underflow handled");
        } catch {
            console2.log("SUCCESS Underflow correctly reverted");
        }
        
        console2.log("SUCCESS Edge cases test passed");
    }
    
    /// @notice Test contract interactions with existing network state
    function testNetworkInteraction() public view {
        console2.log("Testing network interaction...");
        
        // Check we're on the expected network
        uint256 expectedChainId = getExpectedChainId();
        require(block.chainid == expectedChainId, "Wrong chain ID");
        console2.log("SUCCESS Correct chain ID:", block.chainid);
        
        // Check block number is reasonable (not genesis)
        require(block.number > 1000, "Block number too low");
        console2.log("SUCCESS Reasonable block number:", block.number);
        
        // Check we have forked at a recent block
        require(block.timestamp > 1640000000, "Timestamp too old"); // After 2021
        console2.log("SUCCESS Recent timestamp:", block.timestamp);
        
        console2.log("SUCCESS Network interaction test passed");
    }
    
    /// @notice Get expected chain ID for current network
    function getExpectedChainId() internal view returns (uint256) {
        string memory network = getNetworkName();
        
        if (keccak256(bytes(network)) == keccak256(bytes("mainnet"))) {
            return 1;
        } else if (keccak256(bytes(network)) == keccak256(bytes("sepolia"))) {
            return 11155111;
        } else if (keccak256(bytes(network)) == keccak256(bytes("arbitrum"))) {
            return 42161;
        } else if (keccak256(bytes(network)) == keccak256(bytes("optimism"))) {
            return 10;
        } else if (keccak256(bytes(network)) == keccak256(bytes("polygon"))) {
            return 137;
        } else if (keccak256(bytes(network)) == keccak256(bytes("base"))) {
            return 8453;
        } else {
            return 11155111; // Default to Sepolia
        }
    }
    
    /// @notice Get current network name
    function getNetworkName() internal view returns (string memory) {
        // This could be enhanced to detect network from chain ID
        return vm.envOr("NETWORK", string("sepolia"));
    }
}

/// @title ForkBenchmarkScript
/// @notice Benchmark contract performance on fork
contract ForkBenchmarkScript is BaseScript {
    
    /// @notice Run performance benchmarks
    function run() public {
        console2.log("====================================");
        console2.log("Fork Performance Benchmarking");
        console2.log("====================================");
        
        Counter counter = Counter(loadDeployment("Counter"));
        
        // Benchmark multiple operations
        benchmarkIncrement(counter, 100);
        benchmarkIncrementBy(counter, 50);
        benchmarkDecrement(counter, 100);
        
        console2.log("SUCCESS Performance benchmarking complete");
    }
    
    /// @notice Benchmark increment operations
    function benchmarkIncrement(Counter counter, uint256 iterations) internal {
        console2.log("Benchmarking increment...");
        
        uint256 totalGas = 0;
        uint256 gasStart;
        
        for (uint256 i = 0; i < iterations; i++) {
            gasStart = gasleft();
            counter.increment();
            totalGas += gasStart - gasleft();
        }
        
        uint256 avgGas = totalGas / iterations;
        console2.log("Increment average gas:", avgGas);
        console2.log("Total operations:", iterations);
    }
    
    /// @notice Benchmark incrementBy operations
    function benchmarkIncrementBy(Counter counter, uint256 iterations) internal {
        console2.log("Benchmarking incrementBy...");
        
        uint256 totalGas = 0;
        uint256 gasStart;
        
        for (uint256 i = 0; i < iterations; i++) {
            gasStart = gasleft();
            counter.incrementBy(10);
            totalGas += gasStart - gasleft();
        }
        
        uint256 avgGas = totalGas / iterations;
        console2.log("IncrementBy average gas:", avgGas);
        console2.log("Total operations:", iterations);
    }
    
    /// @notice Benchmark decrement operations
    function benchmarkDecrement(Counter counter, uint256 iterations) internal {
        console2.log("Benchmarking decrement...");
        
        uint256 totalGas = 0;
        uint256 gasStart;
        
        for (uint256 i = 0; i < iterations; i++) {
            gasStart = gasleft();
            counter.decrement();
            totalGas += gasStart - gasleft();
        }
        
        uint256 avgGas = totalGas / iterations;
        console2.log("Decrement average gas:", avgGas);
        console2.log("Total operations:", iterations);
    }
}