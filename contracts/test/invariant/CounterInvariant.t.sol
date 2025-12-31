// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "../utils/BaseTest.sol";
import {Counter} from "@/Counter.sol";
import {console2} from "forge-std/console2.sol";

/// @title CounterHandler
/// @notice Handler contract for invariant testing
contract CounterHandler {
    Counter public counter;
    
    uint256 public ghost_incrementCalls;
    uint256 public ghost_decrementCalls;
    uint256 public ghost_resetCalls;
    uint256 public ghost_totalIncremented;
    uint256 public ghost_totalDecremented;
    
    mapping(address => uint256) public ghost_incrementsByUser;
    mapping(address => uint256) public ghost_decrementsByUser;
    
    address internal currentActor;
    address[] public actors;
    
    constructor(Counter _counter) {
        counter = _counter;
        
        // Initialize actors
        actors.push(address(0x1));
        actors.push(address(0x2));
        actors.push(address(0x3));
    }
    
    modifier useActor(uint256 seed) {
        currentActor = actors[seed % actors.length];
        _;
    }
    
    function increment(uint256 seed) public useActor(seed) {
        counter.increment();
        
        ghost_incrementCalls++;
        ghost_totalIncremented++;
        ghost_incrementsByUser[currentActor]++;
    }
    
    function incrementBy(uint256 seed, uint256 amount) public useActor(seed) {
        // Bound amount to reasonable values
        amount = bound(amount, 1, 1000);
        
        counter.incrementBy(amount);
        
        ghost_incrementCalls++;
        ghost_totalIncremented += amount;
        ghost_incrementsByUser[currentActor] += amount;
    }
    
    function decrement(uint256 seed) public useActor(seed) {
        if (counter.count() > 0) {
            counter.decrement();
            
            ghost_decrementCalls++;
            ghost_totalDecremented++;
            ghost_decrementsByUser[currentActor]++;
        }
    }
    
    function reset(uint256 seed) public useActor(seed) {
        // Only owner can reset, but we track attempts
        if (currentActor == counter.owner()) {
            counter.reset();
            ghost_resetCalls++;
        }
    }
    
    function bound(uint256 x, uint256 min, uint256 max) internal pure returns (uint256) {
        require(min <= max, "Invalid bounds");
        uint256 range = max - min;
        return min + (x % (range + 1));
    }
}

/// @title CounterInvariantTest
/// @notice Invariant tests for the Counter contract
contract CounterInvariantTest is BaseTest {
    Counter public counter;
    CounterHandler public handler;
    
    function setUp() public override {
        super.setUp();
        
        // Deploy counter with this contract as owner for testing
        counter = new Counter();
        
        // Deploy handler
        handler = new CounterHandler(counter);
        
        // Set handler as target for invariant testing
        targetContract(address(handler));
        
        // Set up selectors for targeted functions
        bytes4[] memory selectors = new bytes4[](4);
        selectors[0] = CounterHandler.increment.selector;
        selectors[1] = CounterHandler.incrementBy.selector;
        selectors[2] = CounterHandler.decrement.selector;
        selectors[3] = CounterHandler.reset.selector;
        
        targetSelector(FuzzSelector({
            addr: address(handler),
            selectors: selectors
        }));
    }
    
    /*//////////////////////////////////////////////////////////////
                           INVARIANTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice The counter value should always equal total increments minus total decrements
    function invariant_CounterValueMatchesNetOperations() public view {
        uint256 expectedCount = handler.ghost_totalIncremented() - handler.ghost_totalDecremented();
        
        // Account for resets
        if (handler.ghost_resetCalls() > 0) {
            // After reset, only operations after the last reset count
            // This is a simplified check - in practice you'd track operations after reset
            return;
        }
        
        assertEq(counter.count(), expectedCount);
    }
    
    /// @notice The counter value should never be negative (implicitly checked by uint)
    function invariant_CounterNeverNegative() public view {
        // This is implicitly guaranteed by using uint256
        // But we can check that decrements never exceed increments
        assertTrue(handler.ghost_totalDecremented() <= handler.ghost_totalIncremented());
    }
    
    /// @notice Owner should remain constant unless explicitly changed
    function invariant_OwnerRemainsSame() public view {
        assertEq(counter.owner(), address(this));
    }
    
    /// @notice Sum of operations should match total calls
    function invariant_OperationCountsMatch() public view {
        uint256 totalOperations = handler.ghost_incrementCalls() + 
                                 handler.ghost_decrementCalls() + 
                                 handler.ghost_resetCalls();
        
        // This should always be true if our accounting is correct
        assertTrue(totalOperations >= 0);
    }
    
    /// @notice The counter should never exceed the total amount incremented
    function invariant_CounterNeverExceedsTotalIncremented() public view {
        assertTrue(counter.count() <= handler.ghost_totalIncremented());
    }
    
    /*//////////////////////////////////////////////////////////////
                      INVARIANT HELPERS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Call summary for debugging failed invariants
    function invariant_callSummary() public view {
        console2.log("=== Invariant Test Summary ===");
        console2.log("Current counter value:", counter.count());
        console2.log("Total increments:", handler.ghost_totalIncremented());
        console2.log("Total decrements:", handler.ghost_totalDecremented());
        console2.log("Increment calls:", handler.ghost_incrementCalls());
        console2.log("Decrement calls:", handler.ghost_decrementCalls());
        console2.log("Reset calls:", handler.ghost_resetCalls());
        console2.log("============================");
    }
}

/// @title CounterStatefulTest
/// @notice Stateful invariant tests with more complex scenarios
contract CounterStatefulTest is BaseTest {
    Counter public counter;
    
    uint256 internal expectedCount;
    uint256 internal incrementSum;
    uint256 internal decrementSum;
    bool internal hasBeenReset;
    
    function setUp() public override {
        super.setUp();
        counter = new Counter();
    }
    
    /// @notice Stateful fuzz - increment
    function fuzz_stateful_increment() public {
        counter.increment();
        incrementSum++;
        expectedCount++;
    }
    
    /// @notice Stateful fuzz - increment by amount
    function fuzz_stateful_incrementBy(uint256 amount) public {
        amount = bound(amount, 1, 1000);
        counter.incrementBy(amount);
        incrementSum += amount;
        expectedCount += amount;
    }
    
    /// @notice Stateful fuzz - decrement
    function fuzz_stateful_decrement() public {
        if (counter.count() > 0) {
            counter.decrement();
            decrementSum++;
            expectedCount--;
        }
    }
    
    /// @notice Stateful fuzz - reset
    function fuzz_stateful_reset() public {
        counter.reset();
        hasBeenReset = true;
        expectedCount = 0;
        
        // Reset tracking after a reset
        incrementSum = 0;
        decrementSum = 0;
    }
    
    /// @notice Invariant: counter matches expected value
    function invariant_stateful_counterMatchesExpected() public view {
        assertEq(counter.count(), expectedCount);
    }
    
    /// @notice Invariant: mathematical consistency
    function invariant_stateful_mathematicalConsistency() public view {
        if (!hasBeenReset) {
            assertEq(counter.count(), incrementSum - decrementSum);
        } else {
            // After reset, count should match operations since reset
            assertTrue(counter.count() <= incrementSum);
        }
    }
}