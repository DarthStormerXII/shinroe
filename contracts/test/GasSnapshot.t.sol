// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console2} from "forge-std/Test.sol";
import {Counter} from "@/Counter.sol";
import {EIP712Example} from "@/EIP712Example.sol";

/// @title GasSnapshotTest
/// @notice Demonstrates gas function snapshots and gas section snapshots
/// @dev Use forge snapshot to create and compare gas usage over time
contract GasSnapshotTest is Test {
    Counter public counter;
    EIP712Example public eip712;

    uint256 constant SNAPSHOT_GROUP_DEPLOYMENT = 1;
    uint256 constant SNAPSHOT_GROUP_OPERATIONS = 2;
    uint256 constant SNAPSHOT_GROUP_COMPLEX = 3;

    function setUp() public {
        counter = new Counter();
        eip712 = new EIP712Example();
    }

    /*//////////////////////////////////////////////////////////////
                       GAS FUNCTION SNAPSHOTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Snapshot gas for simple increment
    function test_gasSnapshot_Increment() public {
        uint256 gasStart = gasleft();
        counter.increment();
        uint256 gasUsed = gasStart - gasleft();
        
        // This will be captured by forge snapshot
        console2.log("Gas used for increment:", gasUsed);
    }

    /// @notice Snapshot gas for increment by amount
    function test_gasSnapshot_IncrementBy() public {
        uint256[] memory amounts = new uint256[](5);
        amounts[0] = 1;
        amounts[1] = 10;
        amounts[2] = 100;
        amounts[3] = 1000;
        amounts[4] = 10000;

        for (uint256 i = 0; i < amounts.length; i++) {
            // Reset counter
            counter = new Counter();
            
            uint256 gasStart = gasleft();
            counter.incrementBy(amounts[i]);
            uint256 gasUsed = gasStart - gasleft();
            
            console2.log(
                string.concat("Gas for incrementBy(", vm.toString(amounts[i]), "):"),
                gasUsed
            );
        }
    }

    /// @notice Snapshot gas for ownership transfer
    function test_gasSnapshot_TransferOwnership() public {
        address newOwner = makeAddr("newOwner");
        
        uint256 gasStart = gasleft();
        counter.transferOwnership(newOwner);
        uint256 gasUsed = gasStart - gasleft();
        
        console2.log("Gas used for ownership transfer:", gasUsed);
    }

    /*//////////////////////////////////////////////////////////////
                       GAS SECTION SNAPSHOTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Section snapshot for deployment costs
    function test_gasSectionSnapshot_Deployment() public {
        // Start section snapshot
        vm.pauseGasMetering();
        
        console2.log("=== Deployment Gas Section ===");
        
        // Resume and measure Counter deployment
        vm.resumeGasMetering();
        uint256 gasStart = gasleft();
        Counter newCounter = new Counter();
        uint256 counterDeployGas = gasStart - gasleft();
        vm.pauseGasMetering();
        
        console2.log("Counter deployment gas:", counterDeployGas);
        
        // Resume and measure EIP712Example deployment
        vm.resumeGasMetering();
        gasStart = gasleft();
        EIP712Example newEIP712 = new EIP712Example();
        uint256 eip712DeployGas = gasStart - gasleft();
        vm.pauseGasMetering();
        
        console2.log("EIP712Example deployment gas:", eip712DeployGas);
        console2.log("Total deployment gas:", counterDeployGas + eip712DeployGas);
        
        vm.resumeGasMetering();
    }

    /// @notice Section snapshot for complex operation sequence
    function test_gasSectionSnapshot_ComplexOperations() public {
        uint256 totalGas = 0;
        
        console2.log("=== Complex Operations Gas Section ===");
        
        // Section 1: Setup
        vm.pauseGasMetering();
        console2.log("Section 1: Initial setup");
        vm.resumeGasMetering();
        
        uint256 gasStart = gasleft();
        counter.incrementBy(100);
        uint256 setupGas = gasStart - gasleft();
        totalGas += setupGas;
        
        vm.pauseGasMetering();
        console2.log("Setup gas:", setupGas);
        
        // Section 2: Multiple operations
        console2.log("Section 2: Multiple operations");
        vm.resumeGasMetering();
        
        gasStart = gasleft();
        for (uint256 i = 0; i < 10; i++) {
            counter.increment();
        }
        uint256 multiOpGas = gasStart - gasleft();
        totalGas += multiOpGas;
        
        vm.pauseGasMetering();
        console2.log("10x increment gas:", multiOpGas);
        console2.log("Average per increment:", multiOpGas / 10);
        
        // Section 3: State-changing operations
        console2.log("Section 3: State changes");
        vm.resumeGasMetering();
        
        gasStart = gasleft();
        counter.reset();
        counter.incrementBy(50);
        counter.transferOwnership(address(0x123));
        uint256 stateChangeGas = gasStart - gasleft();
        totalGas += stateChangeGas;
        
        vm.pauseGasMetering();
        console2.log("State change operations gas:", stateChangeGas);
        console2.log("Total gas for all sections:", totalGas);
        vm.resumeGasMetering();
    }

    /*//////////////////////////////////////////////////////////////
                    COMPARATIVE GAS SNAPSHOTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Compare gas costs between different approaches
    function test_gasComparison_IncrementMethods() public {
        console2.log("=== Increment Methods Gas Comparison ===");
        
        // Method 1: Multiple increment() calls
        counter = new Counter();
        uint256 gasStart = gasleft();
        for (uint256 i = 0; i < 10; i++) {
            counter.increment();
        }
        uint256 method1Gas = gasStart - gasleft();
        console2.log("Method 1 (10x increment()):", method1Gas);
        
        // Method 2: Single incrementBy() call
        counter = new Counter();
        gasStart = gasleft();
        counter.incrementBy(10);
        uint256 method2Gas = gasStart - gasleft();
        console2.log("Method 2 (incrementBy(10)):", method2Gas);
        
        // Analysis
        console2.log("Gas saved:", method1Gas - method2Gas);
        console2.log("Efficiency gain:", ((method1Gas - method2Gas) * 100) / method1Gas, "%");
    }

    /// @notice Compare storage access patterns
    function test_gasComparison_StoragePatterns() public {
        console2.log("=== Storage Access Patterns ===");
        
        // Pattern 1: Multiple storage reads
        uint256 gasStart = gasleft();
        uint256 value1 = counter.count();
        uint256 value2 = counter.count();
        uint256 value3 = counter.count();
        uint256 pattern1Gas = gasStart - gasleft();
        console2.log("Pattern 1 (3x storage reads):", pattern1Gas);
        
        // Pattern 2: Single storage read with memory cache
        gasStart = gasleft();
        uint256 cachedValue = counter.count();
        uint256 useCached1 = cachedValue;
        uint256 useCached2 = cachedValue;
        uint256 pattern2Gas = gasStart - gasleft();
        console2.log("Pattern 2 (1x read + memory):", pattern2Gas);
        
        console2.log("Gas saved by caching:", pattern1Gas - pattern2Gas);
    }

    /*//////////////////////////////////////////////////////////////
                     CONDITIONAL GAS SNAPSHOTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Snapshot gas based on different conditions
    function test_conditionalGasSnapshot() public {
        uint256[] memory testSizes = new uint256[](4);
        testSizes[0] = 10;
        testSizes[1] = 100;
        testSizes[2] = 1000;
        testSizes[3] = 10000;
        
        console2.log("=== Conditional Gas Snapshots ===");
        
        for (uint256 i = 0; i < testSizes.length; i++) {
            uint256 size = testSizes[i];
            counter = new Counter();
            
            if (size <= 100) {
                // Small size - use increment loop
                uint256 gasStart = gasleft();
                for (uint256 j = 0; j < size; j++) {
                    counter.increment();
                }
                uint256 gasUsed = gasStart - gasleft();
                console2.log(
                    string.concat("Small size (", vm.toString(size), ") loop gas:"),
                    gasUsed
                );
            } else {
                // Large size - use incrementBy
                uint256 gasStart = gasleft();
                counter.incrementBy(size);
                uint256 gasUsed = gasStart - gasleft();
                console2.log(
                    string.concat("Large size (", vm.toString(size), ") incrementBy gas:"),
                    gasUsed
                );
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                        EIP-712 GAS SNAPSHOTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Gas snapshot for EIP-712 operations
    function test_gasSnapshot_EIP712Operations() public {
        uint256 privateKey = 0xA11CE;
        address signer = vm.addr(privateKey);
        
        console2.log("=== EIP-712 Gas Snapshots ===");
        
        // Permit operation
        uint256 gasStart = gasleft();
        bytes32 digest = eip712.getMetaTransactionDigest(
            signer,
            abi.encodeWithSelector(EIP712Example.setBalance.selector, 1000)
        );
        uint256 digestGas = gasStart - gasleft();
        console2.log("Digest calculation gas:", digestGas);
        
        // Signature verification simulation
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(privateKey, digest);
        
        gasStart = gasleft();
        address recovered = ecrecover(digest, v, r, s);
        uint256 ecrecoverGas = gasStart - gasleft();
        console2.log("ecrecover gas:", ecrecoverGas);
        
        // Full meta transaction
        gasStart = gasleft();
        eip712.executeMetaTransaction(
            signer,
            abi.encodeWithSelector(EIP712Example.setBalance.selector, 1000),
            r,
            s,
            v
        );
        uint256 metaTxGas = gasStart - gasleft();
        console2.log("Full meta transaction gas:", metaTxGas);
    }

    /*//////////////////////////////////////////////////////////////
                          OPTIMIZATION HINTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Demonstrate gas optimization opportunities
    function test_gasOptimizationHints() public {
        console2.log("=== Gas Optimization Opportunities ===");
        
        // Before optimization
        Counter unoptimized = new Counter();
        uint256 gasStart = gasleft();
        for (uint256 i = 0; i < 5; i++) {
            unoptimized.increment();
            uint256 currentCount = unoptimized.count(); // Unnecessary read
        }
        uint256 beforeGas = gasStart - gasleft();
        console2.log("Before optimization:", beforeGas);
        
        // After optimization
        Counter optimized = new Counter();
        gasStart = gasleft();
        optimized.incrementBy(5); // Batch operation
        uint256 finalCount = optimized.count(); // Single read at end
        uint256 afterGas = gasStart - gasleft();
        console2.log("After optimization:", afterGas);
        
        console2.log("Gas saved:", beforeGas - afterGas);
        console2.log("Optimization percentage:", ((beforeGas - afterGas) * 100) / beforeGas, "%");
    }
}