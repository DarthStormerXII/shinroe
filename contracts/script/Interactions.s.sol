// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseScript} from "./Base.s.sol";
import {Counter} from "@/Counter.sol";
import {console2} from "forge-std/console2.sol";

/// @title InteractionsScript
/// @notice Scripts for interacting with deployed contracts
contract InteractionsScript is BaseScript {
    /// @notice Increment the counter
    function increment() public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        console2.log("Current count:", counter.count());
        
        counter.increment();
        
        console2.log("New count:", counter.count());
        
        endDeployment();
    }

    /// @notice Increment by a specific amount
    function incrementBy(uint256 amount) public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        console2.log("Current count:", counter.count());
        
        counter.incrementBy(amount);
        
        console2.log("Incremented by:", amount);
        console2.log("New count:", counter.count());
        
        endDeployment();
    }

    /// @notice Reset the counter (only owner)
    function reset() public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        console2.log("Current count:", counter.count());
        console2.log("Current owner:", counter.owner());
        console2.log("Caller:", config.deployer);
        
        require(counter.owner() == config.deployer, "Caller is not the owner");
        
        counter.reset();
        
        console2.log("Counter reset. New count:", counter.count());
        
        endDeployment();
    }

    /// @notice Transfer ownership
    function transferOwnership(address newOwner) public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        console2.log("Current owner:", counter.owner());
        
        require(counter.owner() == config.deployer, "Caller is not the owner");
        
        counter.transferOwnership(newOwner);
        
        console2.log("Ownership transferred to:", newOwner);
        
        endDeployment();
    }

    /// @notice Get contract information
    function getInfo() public view {
        Counter counter = Counter(loadDeployment("Counter"));
        
        console2.log("====================================");
        console2.log("Counter Contract Information");
        console2.log("====================================");
        console2.log("Address:", address(counter));
        console2.log("Current count:", counter.count());
        console2.log("Owner:", counter.owner());
        console2.log("====================================");
    }

    /// @notice Batch operations example
    function batchOperations() public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        
        console2.log("Starting batch operations...");
        console2.log("Initial count:", counter.count());
        
        // Perform multiple operations
        counter.increment();
        console2.log("After increment:", counter.count());
        
        counter.incrementBy(5);
        console2.log("After incrementBy(5):", counter.count());
        
        if (counter.count() > 0) {
            counter.decrement();
            console2.log("After decrement:", counter.count());
        }
        
        console2.log("Batch operations completed");
        
        endDeployment();
    }

    /// @notice Simulate a complex scenario
    function simulateScenario() public {
        DeploymentConfig memory config = startDeployment();
        
        Counter counter = Counter(loadDeployment("Counter"));
        
        console2.log("====================================");
        console2.log("Simulating Complex Scenario");
        console2.log("====================================");
        
        // Reset if owner
        if (counter.owner() == config.deployer && counter.count() > 0) {
            console2.log("Resetting counter...");
            counter.reset();
        }
        
        // Simulate multiple users
        uint256 numUsers = 5;
        for (uint256 i = 0; i < numUsers; i++) {
            counter.incrementBy(i + 1);
            console2.log("User", i, "incremented by", i + 1);
            console2.log("Current count:", counter.count());
        }
        
        console2.log("Final count:", counter.count());
        console2.log("====================================");
        
        endDeployment();
    }
}

/// @title DebugScript
/// @notice Debug and inspect deployed contracts
contract DebugScript is BaseScript {
    /// @notice Check deployment status
    function checkDeployment() public view {
        console2.log("====================================");
        console2.log("Deployment Check");
        console2.log("====================================");
        console2.log("Chain ID:", block.chainid);
        console2.log("Chain Name:", getChainName());
        console2.log("Is Testnet:", isTestnet());
        console2.log("Is Local:", isLocal());
        
        // Try to load Counter deployment
        try this.tryLoadCounter() returns (address counterAddr) {
            console2.log("Counter deployed at:", counterAddr);
            
            Counter counter = Counter(counterAddr);
            console2.log("- Count:", counter.count());
            console2.log("- Owner:", counter.owner());
        } catch {
            console2.log("Counter not deployed on this network");
        }
        
        console2.log("====================================");
    }

    /// @notice Helper to try loading Counter
    function tryLoadCounter() external view returns (address) {
        return loadDeployment("Counter");
    }

    /// @notice Estimate gas for operations
    function estimateGas() public {
        Counter counter = Counter(loadDeployment("Counter"));
        
        console2.log("====================================");
        console2.log("Gas Estimation");
        console2.log("====================================");
        
        // Estimate increment
        uint256 incrementGas = gasleft();
        try counter.increment() {} catch {}
        incrementGas = incrementGas - gasleft();
        console2.log("Increment gas:", incrementGas);
        
        // Estimate incrementBy
        uint256 incrementByGas = gasleft();
        try counter.incrementBy(10) {} catch {}
        incrementByGas = incrementByGas - gasleft();
        console2.log("IncrementBy(10) gas:", incrementByGas);
        
        // Estimate decrement
        uint256 decrementGas = gasleft();
        try counter.decrement() {} catch {}
        decrementGas = decrementGas - gasleft();
        console2.log("Decrement gas:", decrementGas);
        
        console2.log("====================================");
    }
}