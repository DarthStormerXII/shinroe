// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "../utils/BaseTest.sol";
import {Counter} from "@/Counter.sol";

/// @title CounterFuzzTest
/// @notice Fuzz tests for the Counter contract
contract CounterFuzzTest is BaseTest {
    Counter public counter;

    function setUp() public override {
        super.setUp();
        
        vm.prank(DEPLOYER);
        counter = new Counter();
    }

    /*//////////////////////////////////////////////////////////////
                         FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Fuzz test increment by arbitrary amounts
    function testFuzz_IncrementBy(uint256 amount) public {
        // Assume non-zero amount
        vm.assume(amount > 0);
        
        uint256 initialCount = counter.count();
        
        vm.prank(ALICE);
        counter.incrementBy(amount);
        
        assertEq(counter.count(), initialCount + amount);
    }

    /// @notice Fuzz test multiple increments
    function testFuzz_MultipleIncrements(uint8 times) public {
        // Bound to reasonable number of iterations
        vm.assume(times > 0 && times <= 100);
        
        for (uint256 i = 0; i < times; i++) {
            vm.prank(ALICE);
            counter.increment();
        }
        
        assertEq(counter.count(), times);
    }

    /// @notice Fuzz test increment and decrement cycles
    function testFuzz_IncrementDecrementCycle(uint256 incrementAmount, uint256 decrementAmount) public {
        // Setup reasonable bounds
        vm.assume(incrementAmount > 0 && incrementAmount < type(uint128).max);
        vm.assume(decrementAmount > 0 && decrementAmount <= incrementAmount);
        
        // Increment
        vm.prank(ALICE);
        counter.incrementBy(incrementAmount);
        
        // Decrement multiple times
        uint256 timesToDecrement = decrementAmount;
        for (uint256 i = 0; i < timesToDecrement; i++) {
            vm.prank(BOB);
            counter.decrement();
        }
        
        assertEq(counter.count(), incrementAmount - decrementAmount);
    }

    /// @notice Fuzz test owner transfer
    function testFuzz_TransferOwnership(address newOwner) public {
        // Assume valid address
        vm.assume(newOwner != address(0));
        
        vm.prank(DEPLOYER);
        counter.transferOwnership(newOwner);
        
        assertEq(counter.owner(), newOwner);
        assertTrue(counter.isOwner(newOwner));
    }

    /// @notice Fuzz test access control
    function testFuzz_OnlyOwnerCanReset(address caller) public {
        // Setup
        vm.assume(caller != DEPLOYER && caller != address(0));
        
        // Increment counter
        vm.prank(ALICE);
        counter.incrementBy(100);
        
        // Try to reset as non-owner
        vm.expectRevert(Counter.Unauthorized.selector);
        vm.prank(caller);
        counter.reset();
        
        // Verify count unchanged
        assertEq(counter.count(), 100);
    }

    /// @notice Differential fuzz test - compare with reference implementation
    function testFuzz_Differential_IncrementBy(uint256 amount) public {
        vm.assume(amount > 0 && amount < type(uint128).max);
        
        // Reference implementation
        uint256 referenceCount = 0;
        referenceCount += amount;
        
        // Actual implementation
        vm.prank(ALICE);
        counter.incrementBy(amount);
        
        assertEq(counter.count(), referenceCount);
    }

    /// @notice Stateful fuzz test with bounded random operations
    function testFuzz_RandomOperations(uint256 seed) public {
        uint256 expectedCount = 0;
        uint256 numOperations = (seed % 20) + 1; // 1-20 operations
        
        for (uint256 i = 0; i < numOperations; i++) {
            uint256 operation = uint256(keccak256(abi.encode(seed, i))) % 3;
            
            if (operation == 0) {
                // Increment
                vm.prank(ALICE);
                counter.increment();
                expectedCount++;
            } else if (operation == 1 && expectedCount > 0) {
                // Decrement (if possible)
                vm.prank(BOB);
                counter.decrement();
                expectedCount--;
            } else if (operation == 2 && i % 3 == 0) {
                // Reset (occasionally)
                vm.prank(DEPLOYER);
                counter.reset();
                expectedCount = 0;
            }
        }
        
        assertEq(counter.count(), expectedCount);
    }

    /// @notice Fuzz test for gas usage patterns
    function testFuzz_GasUsage(uint256 amount) public {
        vm.assume(amount > 0 && amount < 1000);
        
        uint256 gasBefore = gasleft();
        vm.prank(ALICE);
        counter.incrementBy(amount);
        uint256 gasUsed = gasBefore - gasleft();
        
        // Gas should be relatively constant regardless of amount
        assertTrue(gasUsed < 50000, "Gas usage too high");
    }

    /// @notice Property-based test: count never decreases with increment
    function testFuzz_Property_CountNeverDecreasesWithIncrement(uint256 amount) public {
        vm.assume(amount > 0 && amount < type(uint128).max);
        
        uint256 countBefore = counter.count();
        
        vm.prank(ALICE);
        counter.incrementBy(amount);
        
        uint256 countAfter = counter.count();
        
        assertTrue(countAfter > countBefore, "Count should increase");
        assertEq(countAfter - countBefore, amount, "Count should increase by exact amount");
    }

    /// @notice Edge case fuzz test
    function testFuzz_EdgeCases(uint256 amount) public {
        if (amount == 0) {
            // Test zero increment
            vm.expectRevert(Counter.InvalidIncrement.selector);
            vm.prank(ALICE);
            counter.incrementBy(amount);
        } else if (amount == type(uint256).max) {
            // Test max value
            vm.prank(ALICE);
            counter.incrementBy(1);
            
            // Should revert on overflow
            vm.expectRevert();
            vm.prank(ALICE);
            counter.incrementBy(amount);
        } else {
            // Normal case
            vm.prank(ALICE);
            counter.incrementBy(amount);
            assertEq(counter.count(), amount);
        }
    }
}