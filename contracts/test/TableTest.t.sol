// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console2} from "forge-std/Test.sol";
import {Counter} from "@/Counter.sol";
import {MathLib} from "@/libraries/MathLib.sol";

/// @title TableTest
/// @notice Demonstrates table testing pattern in Foundry
/// @dev Table tests allow running the same test with multiple parameter sets
contract TableTest is Test {
    Counter public counter;

    /// @notice Test case structure for counter operations
    struct CounterTestCase {
        string name;
        uint256 initialValue;
        uint256 incrementBy;
        uint256 expectedResult;
        bool shouldRevert;
    }

    /// @notice Test case structure for math operations
    struct MathTestCase {
        string name;
        uint256 a;
        uint256 b;
        string operation;
        uint256 expectedResult;
        bool shouldRevert;
    }

    /// @notice Test case structure for access control
    struct AccessControlTestCase {
        string name;
        address caller;
        string action;
        bool shouldSucceed;
    }

    function setUp() public {
        counter = new Counter();
    }

    /*//////////////////////////////////////////////////////////////
                         COUNTER TABLE TESTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Table test for counter increment operations
    function test_CounterOperations_Table() public {
        CounterTestCase[5] memory testCases = [
            CounterTestCase({
                name: "Simple increment",
                initialValue: 0,
                incrementBy: 1,
                expectedResult: 1,
                shouldRevert: false
            }),
            CounterTestCase({
                name: "Large increment",
                initialValue: 100,
                incrementBy: 999,
                expectedResult: 1099,
                shouldRevert: false
            }),
            CounterTestCase({
                name: "Zero increment",
                initialValue: 50,
                incrementBy: 0,
                expectedResult: 50,
                shouldRevert: true // Should revert on zero increment
            }),
            CounterTestCase({
                name: "Max value increment",
                initialValue: type(uint256).max - 1,
                incrementBy: 1,
                expectedResult: type(uint256).max,
                shouldRevert: false
            }),
            CounterTestCase({
                name: "Overflow case",
                initialValue: type(uint256).max,
                incrementBy: 1,
                expectedResult: 0,
                shouldRevert: true // Should revert on overflow
            })
        ];

        for (uint256 i = 0; i < testCases.length; i++) {
            CounterTestCase memory tc = testCases[i];
            console2.log("Running test case:", tc.name);

            // Reset counter for each test
            counter = new Counter();

            // Set initial value
            if (tc.initialValue > 0) {
                counter.incrementBy(tc.initialValue);
            }

            // Execute test
            if (tc.shouldRevert) {
                if (tc.incrementBy == 0) {
                    vm.expectRevert(Counter.InvalidIncrement.selector);
                } else {
                    vm.expectRevert(); // Expect arithmetic overflow
                }
                counter.incrementBy(tc.incrementBy);
            } else {
                counter.incrementBy(tc.incrementBy);
                assertEq(
                    counter.count(),
                    tc.expectedResult,
                    string.concat("Failed: ", tc.name)
                );
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                          MATH TABLE TESTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Table test for MathLib operations
    function test_MathOperations_Table() public {
        MathTestCase[8] memory testCases = [
            // Addition tests
            MathTestCase({
                name: "Add two numbers",
                a: 100,
                b: 200,
                operation: "add",
                expectedResult: 300,
                shouldRevert: false
            }),
            MathTestCase({
                name: "Add with overflow",
                a: type(uint256).max,
                b: 1,
                operation: "add",
                expectedResult: 0,
                shouldRevert: true
            }),
            // Subtraction tests
            MathTestCase({
                name: "Subtract smaller from larger",
                a: 500,
                b: 200,
                operation: "sub",
                expectedResult: 300,
                shouldRevert: false
            }),
            MathTestCase({
                name: "Subtract with underflow",
                a: 100,
                b: 200,
                operation: "sub",
                expectedResult: 0,
                shouldRevert: true
            }),
            // Multiplication tests
            MathTestCase({
                name: "Multiply two numbers",
                a: 50,
                b: 100,
                operation: "mul",
                expectedResult: 5000,
                shouldRevert: false
            }),
            MathTestCase({
                name: "Multiply by zero",
                a: 1000,
                b: 0,
                operation: "mul",
                expectedResult: 0,
                shouldRevert: false
            }),
            // Division tests
            MathTestCase({
                name: "Divide two numbers",
                a: 1000,
                b: 10,
                operation: "div",
                expectedResult: 100,
                shouldRevert: false
            }),
            MathTestCase({
                name: "Divide by zero",
                a: 100,
                b: 0,
                operation: "div",
                expectedResult: 0,
                shouldRevert: true
            })
        ];

        for (uint256 i = 0; i < testCases.length; i++) {
            MathTestCase memory tc = testCases[i];
            console2.log("Running math test:", tc.name);

            if (tc.shouldRevert) {
                if (keccak256(bytes(tc.operation)) == keccak256(bytes("add"))) {
                    vm.expectRevert(MathLib.Overflow.selector);
                    MathLib.safeAdd(tc.a, tc.b);
                } else if (keccak256(bytes(tc.operation)) == keccak256(bytes("sub"))) {
                    vm.expectRevert(MathLib.Underflow.selector);
                    MathLib.safeSub(tc.a, tc.b);
                } else if (keccak256(bytes(tc.operation)) == keccak256(bytes("div"))) {
                    vm.expectRevert(MathLib.DivisionByZero.selector);
                    MathLib.safeDiv(tc.a, tc.b);
                }
            } else {
                uint256 result;
                if (keccak256(bytes(tc.operation)) == keccak256(bytes("add"))) {
                    result = MathLib.safeAdd(tc.a, tc.b);
                } else if (keccak256(bytes(tc.operation)) == keccak256(bytes("sub"))) {
                    result = MathLib.safeSub(tc.a, tc.b);
                } else if (keccak256(bytes(tc.operation)) == keccak256(bytes("mul"))) {
                    result = MathLib.safeMul(tc.a, tc.b);
                } else if (keccak256(bytes(tc.operation)) == keccak256(bytes("div"))) {
                    result = MathLib.safeDiv(tc.a, tc.b);
                }
                assertEq(result, tc.expectedResult, string.concat("Failed: ", tc.name));
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                      ACCESS CONTROL TABLE TESTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Table test for access control scenarios
    function test_AccessControl_Table() public {
        address owner = address(this);
        address alice = makeAddr("alice");
        address bob = makeAddr("bob");

        AccessControlTestCase[6] memory testCases = [
            AccessControlTestCase({
                name: "Owner can reset",
                caller: owner,
                action: "reset",
                shouldSucceed: true
            }),
            AccessControlTestCase({
                name: "Non-owner cannot reset",
                caller: alice,
                action: "reset",
                shouldSucceed: false
            }),
            AccessControlTestCase({
                name: "Anyone can increment",
                caller: alice,
                action: "increment",
                shouldSucceed: true
            }),
            AccessControlTestCase({
                name: "Owner can transfer ownership",
                caller: owner,
                action: "transferOwnership",
                shouldSucceed: true
            }),
            AccessControlTestCase({
                name: "Non-owner cannot transfer ownership",
                caller: bob,
                action: "transferOwnership",
                shouldSucceed: false
            }),
            AccessControlTestCase({
                name: "Anyone can read count",
                caller: bob,
                action: "getCount",
                shouldSucceed: true
            })
        ];

        for (uint256 i = 0; i < testCases.length; i++) {
            AccessControlTestCase memory tc = testCases[i];
            console2.log("Running access control test:", tc.name);

            // Reset state
            counter = new Counter();
            counter.incrementBy(100); // Set some state

            vm.startPrank(tc.caller);

            if (keccak256(bytes(tc.action)) == keccak256(bytes("reset"))) {
                if (tc.shouldSucceed) {
                    counter.reset();
                    assertEq(counter.count(), 0, "Reset should set count to 0");
                } else {
                    vm.expectRevert(Counter.Unauthorized.selector);
                    counter.reset();
                }
            } else if (keccak256(bytes(tc.action)) == keccak256(bytes("increment"))) {
                if (tc.shouldSucceed) {
                    uint256 prevCount = counter.count();
                    counter.increment();
                    assertEq(counter.count(), prevCount + 1, "Increment should add 1");
                }
            } else if (keccak256(bytes(tc.action)) == keccak256(bytes("transferOwnership"))) {
                if (tc.shouldSucceed) {
                    counter.transferOwnership(alice);
                    assertEq(counter.owner(), alice, "Ownership should transfer");
                } else {
                    vm.expectRevert(Counter.Unauthorized.selector);
                    counter.transferOwnership(alice);
                }
            } else if (keccak256(bytes(tc.action)) == keccak256(bytes("getCount"))) {
                uint256 count = counter.getCount();
                assertTrue(count >= 0, "Should be able to read count");
            }

            vm.stopPrank();
        }
    }

    /*//////////////////////////////////////////////////////////////
                         EDGE CASES TABLE TEST
    //////////////////////////////////////////////////////////////*/

    /// @notice Edge case data structure
    struct EdgeCase {
        string name;
        uint256 value;
        string expectedBehavior;
    }

    /// @notice Table test for edge cases and boundary values
    function test_EdgeCases_Table() public {

        EdgeCase[6] memory edgeCases = [
            EdgeCase({
                name: "Zero value",
                value: 0,
                expectedBehavior: "normal"
            }),
            EdgeCase({
                name: "One",
                value: 1,
                expectedBehavior: "normal"
            }),
            EdgeCase({
                name: "Max uint256 - 1",
                value: type(uint256).max - 1,
                expectedBehavior: "normal"
            }),
            EdgeCase({
                name: "Max uint256",
                value: type(uint256).max,
                expectedBehavior: "overflow_on_increment"
            }),
            EdgeCase({
                name: "Half of max",
                value: type(uint256).max / 2,
                expectedBehavior: "normal"
            }),
            EdgeCase({
                name: "Powers of 2",
                value: 2**128,
                expectedBehavior: "normal"
            })
        ];

        for (uint256 i = 0; i < edgeCases.length; i++) {
            EdgeCase memory ec = edgeCases[i];
            console2.log("Testing edge case:", ec.name);
            console2.log("Value:", ec.value);

            counter = new Counter();

            // Set to edge case value
            if (ec.value > 0) {
                counter.incrementBy(ec.value);
            }

            // Test behavior at edge
            if (keccak256(bytes(ec.expectedBehavior)) == keccak256(bytes("overflow_on_increment"))) {
                vm.expectRevert();
                counter.increment();
            } else {
                // Should work normally
                uint256 before = counter.count();
                counter.increment();
                assertEq(counter.count(), before + 1, string.concat("Failed at: ", ec.name));
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                      PARAMETERIZED HELPER
    //////////////////////////////////////////////////////////////*/

    /// @notice Helper function to run parameterized tests
    function runParameterizedTest(
        string memory testName,
        uint256[] memory inputs,
        uint256[] memory expectedOutputs,
        function(uint256) returns (uint256) operation
    ) internal {
        require(inputs.length == expectedOutputs.length, "Input/output length mismatch");

        console2.log("Running parameterized test:", testName);

        for (uint256 i = 0; i < inputs.length; i++) {
            uint256 result = operation(inputs[i]);
            assertEq(
                result,
                expectedOutputs[i],
                string.concat(
                    "Failed for input: ",
                    vm.toString(inputs[i])
                )
            );
        }
    }
}