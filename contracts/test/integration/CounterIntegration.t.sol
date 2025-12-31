// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseTest} from "../utils/BaseTest.sol";
import {Counter} from "@/Counter.sol";
import {MockERC20} from "../utils/Mocks.sol";
import {console2} from "forge-std/console2.sol";

/// @title CounterIntegrationTest
/// @notice Integration tests showing fork testing and complex scenarios
contract CounterIntegrationTest is BaseTest {
    Counter public counter;
    MockERC20 public token;
    
    // Fork testing variables
    uint256 public mainnetFork;
    uint256 public sepoliaFork;
    
    // Real mainnet addresses (examples)
    address constant WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    
    function setUp() public override {
        super.setUp();
        
        // Deploy contracts
        vm.startPrank(DEPLOYER);
        counter = new Counter();
        token = new MockERC20("Test Token", "TEST", 18);
        vm.stopPrank();
        
        // Mint tokens to test addresses
        token.mint(ALICE, 1000 ether);
        token.mint(BOB, 1000 ether);
    }
    
    /*//////////////////////////////////////////////////////////////
                         FORK TESTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Test interaction with mainnet fork
    function test_ForkMainnet() public {
        // Create mainnet fork at specific block
        string memory mainnetRpc = vm.envOr("MAINNET_RPC_URL", string(""));
        vm.skip(bytes(mainnetRpc).length == 0);
        
        mainnetFork = vm.createFork(mainnetRpc, FORK_BLOCK_NUMBER);
        vm.selectFork(mainnetFork);
        
        // Deploy counter on fork
        Counter forkedCounter = new Counter();
        
        // Test interactions
        forkedCounter.increment();
        assertEq(forkedCounter.count(), 1);
        
        // Could interact with real mainnet contracts here
        // For example, check WETH balance of a whale
        address wethWhale = 0x8EB8a3b98659Cce290402893d0123abb75E3ab28; // Example
        uint256 whaleBalance = MockERC20(WETH).balanceOf(wethWhale);
        assertTrue(whaleBalance > 0, "Whale should have WETH");
    }
    
    /// @notice Test with multiple forks
    function test_MultipleForks() public {
        // Skip if RPC URLs not set
        string memory mainnetRpc = vm.envOr("MAINNET_RPC_URL", string(""));
        string memory sepoliaRpc = vm.envOr("SEPOLIA_RPC_URL", string(""));
        vm.skip(bytes(mainnetRpc).length == 0 || bytes(sepoliaRpc).length == 0);
        
        // Create forks
        mainnetFork = vm.createFork(mainnetRpc);
        sepoliaFork = vm.createFork(sepoliaRpc);
        
        // Test on mainnet fork
        vm.selectFork(mainnetFork);
        Counter mainnetCounter = new Counter();
        mainnetCounter.incrementBy(100);
        
        // Switch to sepolia fork
        vm.selectFork(sepoliaFork);
        Counter sepoliaCounter = new Counter();
        sepoliaCounter.incrementBy(200);
        
        // Verify isolation
        vm.selectFork(mainnetFork);
        assertEq(mainnetCounter.count(), 100);
        
        vm.selectFork(sepoliaFork);
        assertEq(sepoliaCounter.count(), 200);
    }
    
    /*//////////////////////////////////////////////////////////////
                    COMPLEX INTEGRATION SCENARIOS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Test counter with token rewards system
    function test_CounterWithTokenRewards() public {
        // Setup a reward system where users get tokens for incrementing
        uint256 rewardPerIncrement = 10 ether;
        
        // Fund the reward pool
        token.mint(address(this), 10000 ether);
        
        // Track initial balances
        uint256 aliceInitialBalance = token.balanceOf(ALICE);
        uint256 aliceInitialCount = counter.count();
        
        // Alice increments and gets reward
        vm.prank(ALICE);
        counter.increment();
        
        // Simulate reward distribution
        token.transfer(ALICE, rewardPerIncrement);
        
        // Verify
        assertEq(counter.count(), aliceInitialCount + 1);
        assertEq(token.balanceOf(ALICE), aliceInitialBalance + rewardPerIncrement);
    }
    
    /// @notice Test multi-user interaction scenario
    function test_MultiUserScenario() public {
        // Create multiple users
        address[] memory users = createUsers(5);
        
        // Each user increments the counter
        for (uint256 i = 0; i < users.length; i++) {
            vm.prank(users[i]);
            counter.incrementBy(i + 1);
        }
        
        // Calculate expected total
        uint256 expectedTotal = 1 + 2 + 3 + 4 + 5; // 15
        assertEq(counter.count(), expectedTotal);
        
        // Owner resets
        vm.prank(address(this));
        counter.reset();
        assertEq(counter.count(), 0);
        
        // Users increment again with different pattern
        for (uint256 i = 0; i < users.length; i++) {
            vm.startPrank(users[i]);
            counter.increment();
            counter.increment();
            vm.stopPrank();
        }
        
        assertEq(counter.count(), users.length * 2);
    }
    
    /// @notice Test time-based scenarios
    function test_TimeBasedScenario() public {
        uint256 startTime = block.timestamp;
        
        // Increment at different times
        counter.increment();
        uint256 firstIncrementTime = block.timestamp;
        
        // Skip 1 day
        skip(1 days);
        counter.increment();
        uint256 secondIncrementTime = block.timestamp;
        
        // Skip 1 week
        skip(1 weeks);
        counter.increment();
        uint256 thirdIncrementTime = block.timestamp;
        
        // Verify time progression
        assertEq(secondIncrementTime - firstIncrementTime, 1 days);
        assertEq(thirdIncrementTime - secondIncrementTime, 1 weeks);
        assertEq(counter.count(), 3);
    }
    
    /// @notice Test with contract interactions
    function test_ContractInteractions() public {
        // Deploy a contract that interacts with counter
        CounterUser user = new CounterUser(counter);
        
        // Let the contract increment
        user.incrementCounter();
        assertEq(counter.count(), 1);
        
        // Multiple operations
        user.incrementMultiple(5);
        assertEq(counter.count(), 6);
        
        // Transfer ownership to the contract
        counter.transferOwnership(address(user));
        
        // Contract can now reset
        user.resetCounter();
        assertEq(counter.count(), 0);
    }
    
    /*//////////////////////////////////////////////////////////////
                         STRESS TESTS
    //////////////////////////////////////////////////////////////*/
    
    /// @notice Stress test with many operations
    function test_StressTest() public {
        uint256 operations = 100;
        uint256 gasUsed;
        uint256 totalGas;
        
        // Measure gas for many increments
        for (uint256 i = 0; i < operations; i++) {
            uint256 gasBefore = gasleft();
            counter.increment();
            gasUsed = gasBefore - gasleft();
            totalGas += gasUsed;
        }
        
        console2.log("Average gas per increment:", totalGas / operations);
        assertEq(counter.count(), operations);
        
        // Reset and test batch increment
        counter.reset();
        counter.incrementBy(operations);
        assertEq(counter.count(), operations);
    }
}

/// @title CounterUser
/// @notice Helper contract that interacts with Counter
contract CounterUser {
    Counter public counter;
    
    constructor(Counter _counter) {
        counter = _counter;
    }
    
    function incrementCounter() external {
        counter.increment();
    }
    
    function incrementMultiple(uint256 times) external {
        for (uint256 i = 0; i < times; i++) {
            counter.increment();
        }
    }
    
    function resetCounter() external {
        counter.reset();
    }
}