// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "../utils/BaseTest.sol";
import {Counter} from "@/Counter.sol";
import {ICounter} from "@/interfaces/ICounter.sol";
import {console2} from "forge-std/console2.sol";

/// @title CounterTest
/// @notice Unit tests for the Counter contract
contract CounterTest is BaseTest {
    Counter public counter;

    /// @notice Events to test
    event CounterIncremented(address indexed user, uint256 newValue);
    event CounterDecremented(address indexed user, uint256 newValue);
    event CounterReset(address indexed user);
    event OwnerChanged(address indexed previousOwner, address indexed newOwner);

    function setUp() public override {
        super.setUp();
        
        vm.startPrank(DEPLOYER);
        counter = new Counter();
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                             DEPLOYMENT
    //////////////////////////////////////////////////////////////*/

    function test_Deployment() public {
        assertEq(counter.count(), 0);
        assertEq(counter.owner(), DEPLOYER);
    }

    /*//////////////////////////////////////////////////////////////
                            INCREMENT
    //////////////////////////////////////////////////////////////*/

    function test_Increment() public {
        vm.expectEmit(true, false, false, true);
        emit CounterIncremented(ALICE, 1);
        
        vm.prank(ALICE);
        counter.increment();
        
        assertEq(counter.count(), 1);
    }

    function test_IncrementMultipleTimes() public {
        uint256 times = 5;
        
        for (uint256 i = 0; i < times; i++) {
            vm.prank(ALICE);
            counter.increment();
        }
        
        assertEq(counter.count(), times);
    }

    function test_IncrementBy() public {
        uint256 amount = 10;
        
        vm.expectEmit(true, false, false, true);
        emit CounterIncremented(BOB, amount);
        
        vm.prank(BOB);
        counter.incrementBy(amount);
        
        assertEq(counter.count(), amount);
    }

    function test_IncrementBy_RevertWhen_ZeroAmount() public {
        vm.expectRevert(ICounter.InvalidIncrement.selector);
        
        vm.prank(ALICE);
        counter.incrementBy(0);
    }

    /*//////////////////////////////////////////////////////////////
                            DECREMENT
    //////////////////////////////////////////////////////////////*/

    function test_Decrement() public {
        // First increment
        vm.prank(ALICE);
        counter.increment();
        
        // Then decrement
        vm.expectEmit(true, false, false, true);
        emit CounterDecremented(BOB, 0);
        
        vm.prank(BOB);
        counter.decrement();
        
        assertEq(counter.count(), 0);
    }

    function test_Decrement_RevertWhen_WouldUnderflow() public {
        vm.expectRevert(ICounter.WouldUnderflow.selector);
        
        vm.prank(ALICE);
        counter.decrement();
    }

    /*//////////////////////////////////////////////////////////////
                              RESET
    //////////////////////////////////////////////////////////////*/

    function test_Reset() public {
        // Increment counter
        vm.prank(ALICE);
        counter.incrementBy(100);
        
        // Reset as owner
        vm.expectEmit(true, false, false, false);
        emit CounterReset(DEPLOYER);
        
        vm.prank(DEPLOYER);
        counter.reset();
        
        assertEq(counter.count(), 0);
    }

    function test_Reset_RevertWhen_NotOwner() public {
        vm.expectRevert(ICounter.Unauthorized.selector);
        
        vm.prank(ALICE);
        counter.reset();
    }

    /*//////////////////////////////////////////////////////////////
                         OWNERSHIP
    //////////////////////////////////////////////////////////////*/

    function test_TransferOwnership() public {
        vm.expectEmit(true, true, false, false);
        emit OwnerChanged(DEPLOYER, ALICE);
        
        vm.prank(DEPLOYER);
        counter.transferOwnership(ALICE);
        
        assertEq(counter.owner(), ALICE);
        assertTrue(counter.isOwner(ALICE));
        assertFalse(counter.isOwner(DEPLOYER));
    }

    function test_TransferOwnership_RevertWhen_NotOwner() public {
        vm.expectRevert(ICounter.Unauthorized.selector);
        
        vm.prank(ALICE);
        counter.transferOwnership(BOB);
    }

    function test_TransferOwnership_RevertWhen_ZeroAddress() public {
        vm.expectRevert("New owner cannot be zero address");
        
        vm.prank(DEPLOYER);
        counter.transferOwnership(address(0));
    }

    /*//////////////////////////////////////////////////////////////
                         VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function test_GetCount() public {
        vm.prank(ALICE);
        counter.incrementBy(42);
        
        assertEq(counter.getCount(), 42);
        assertEq(counter.getCount(), counter.count());
    }

    function test_IsOwner() public {
        assertTrue(counter.isOwner(DEPLOYER));
        assertFalse(counter.isOwner(ALICE));
        assertFalse(counter.isOwner(BOB));
        assertFalse(counter.isOwner(address(0)));
    }

    /*//////////////////////////////////////////////////////////////
                         GAS BENCHMARKS
    //////////////////////////////////////////////////////////////*/

    function test_GasBenchmark_Increment() public measureGas("increment") {
        counter.increment();
    }

    function test_GasBenchmark_IncrementBy() public measureGas("incrementBy") {
        counter.incrementBy(100);
    }

    function test_GasBenchmark_Decrement() public {
        counter.incrementBy(100);
        
        uint256 gasBefore = gasleft();
        counter.decrement();
        uint256 gasUsed = gasBefore - gasleft();
        
        console2.log("decrement gas used:", gasUsed);
    }

    /*//////////////////////////////////////////////////////////////
                         SNAPSHOT TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Snapshot_ComplexScenario() public {
        uint256 snapshot = vm.snapshot();
        
        // Perform operations
        vm.prank(ALICE);
        counter.incrementBy(50);
        
        vm.prank(BOB);
        counter.increment();
        
        assertEq(counter.count(), 51);
        
        // Revert to snapshot
        vm.revertTo(snapshot);
        
        assertEq(counter.count(), 0);
    }
}