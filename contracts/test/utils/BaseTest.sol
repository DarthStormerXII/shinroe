// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console, console2} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";

/// @title BaseTest
/// @notice Base test contract with common utilities and helpers
/// @dev All test contracts should inherit from this contract
abstract contract BaseTest is Test {
    /// @notice Address constants for testing
    address internal constant ALICE = address(0x1);
    address internal constant BOB = address(0x2);
    address internal constant CHARLIE = address(0x3);
    address internal constant DEPLOYER = address(0x4);
    address internal constant TREASURY = address(0x5);
    address internal constant ZERO_ADDRESS = address(0);

    /// @notice Common test values
    uint256 internal constant INITIAL_BALANCE = 100 ether;
    uint256 internal constant MAX_UINT256 = type(uint256).max;
    uint256 internal constant FORK_BLOCK_NUMBER = 20_000_000; // Example block number for forking

    /// @notice Modifier to measure gas usage
    modifier measureGas(string memory label) {
        uint256 gasBefore = gasleft();
        _;
        uint256 gasUsed = gasBefore - gasleft();
        console2.log(string.concat(label, " gas used:"), gasUsed);
    }

    /// @notice Modifier to run a test as a specific user
    modifier asUser(address user) {
        vm.startPrank(user);
        _;
        vm.stopPrank();
    }

    /// @notice Set up function that runs before each test
    function setUp() public virtual {
        // Deal ETH to test addresses
        vm.deal(ALICE, INITIAL_BALANCE);
        vm.deal(BOB, INITIAL_BALANCE);
        vm.deal(CHARLIE, INITIAL_BALANCE);
        vm.deal(DEPLOYER, INITIAL_BALANCE);
        vm.deal(TREASURY, INITIAL_BALANCE);

        // Label addresses for better trace output
        vm.label(ALICE, "Alice");
        vm.label(BOB, "Bob");
        vm.label(CHARLIE, "Charlie");
        vm.label(DEPLOYER, "Deployer");
        vm.label(TREASURY, "Treasury");
    }

    /// @notice Helper to create users with labels and initial balance
    function createUser(string memory name) internal returns (address payable) {
        address payable user = payable(makeAddr(name));
        vm.deal(user, INITIAL_BALANCE);
        return user;
    }

    /// @notice Helper to create multiple users
    function createUsers(uint256 count) internal returns (address[] memory) {
        address[] memory users = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            users[i] = createUser(string.concat("User", vm.toString(i)));
        }
        return users;
    }

    /// @notice Skip forward in time
    function skipTime(uint256 seconds_) internal {
        skip(seconds_);
    }

    /// @notice Skip forward in blocks
    function skipBlocks(uint256 blocks) internal {
        vm.roll(block.number + blocks);
    }

    /// @notice Set block timestamp
    function setBlockTimestamp(uint256 timestamp) internal {
        vm.warp(timestamp);
    }

    /// @notice Expect an exact revert message
    function expectRevert(bytes memory revertData) internal {
        vm.expectRevert(revertData);
    }

    /// @notice Expect a custom error revert
    function expectRevertCustomError(bytes4 selector) internal {
        vm.expectRevert(selector);
    }

    /// @notice Assert two arrays are equal
    function assertArrayEq(uint256[] memory a, uint256[] memory b) internal pure {
        assertEq(a.length, b.length, "Array lengths do not match");
        for (uint256 i = 0; i < a.length; i++) {
            assertEq(a[i], b[i], string.concat("Array elements at index ", vm.toString(i), " do not match"));
        }
    }

    /// @notice Assert two arrays are equal
    function assertArrayEq(address[] memory a, address[] memory b) internal pure {
        assertEq(a.length, b.length, "Array lengths do not match");
        for (uint256 i = 0; i < a.length; i++) {
            assertEq(a[i], b[i], string.concat("Array elements at index ", vm.toString(i), " do not match"));
        }
    }

    /// @notice Assert an address is a contract
    function assertIsContract(address addr) internal view {
        assertTrue(addr.code.length > 0, "Address is not a contract");
    }

    /// @notice Assert an address is an EOA (not a contract)
    function assertIsEOA(address addr) internal view {
        assertTrue(addr.code.length == 0, "Address is not an EOA");
    }

    /// @notice Get a random number between min and max (inclusive)
    function randomUint(uint256 min, uint256 max) internal view returns (uint256) {
        require(max >= min, "Max must be greater than or equal to min");
        uint256 range = max - min + 1;
        return min + (uint256(keccak256(abi.encode(block.timestamp, block.prevrandao))) % range);
    }

    /// @notice Get a random address
    function randomAddress() internal view returns (address) {
        return address(uint160(randomUint(1, uint256(type(uint160).max))));
    }

    /// @notice Create a snapshot and return the snapshot ID
    function takeSnapshot() internal returns (uint256) {
        return vm.snapshot();
    }

    /// @notice Restore a snapshot
    function restoreSnapshot(uint256 snapshotId) internal {
        vm.revertTo(snapshotId);
    }

    /// @notice Helper to deploy bytecode
    function deployCode(bytes memory bytecode) internal returns (address deployed) {
        assembly {
            deployed := create(0, add(bytecode, 0x20), mload(bytecode))
        }
        require(deployed != address(0), "Deployment failed");
    }

    /// @notice Helper to calculate CREATE2 address
    function computeCreate2Address(
        address deployer,
        bytes32 salt,
        bytes memory creationCode
    ) internal pure returns (address) {
        return address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            deployer,
                            salt,
                            keccak256(creationCode)
                        )
                    )
                )
            )
        );
    }

    /// @notice Get the current timestamp
    function timestamp() internal view returns (uint256) {
        return block.timestamp;
    }

    /// @notice Get the current block number
    function blockNumber() internal view returns (uint256) {
        return block.number;
    }
}