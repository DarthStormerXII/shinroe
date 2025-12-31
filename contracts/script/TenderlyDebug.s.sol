// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {BaseScript} from "./Base.s.sol";
import {Counter} from "@/Counter.sol";
import {console2} from "forge-std/console2.sol";

/// @title TenderlyDebugScript
/// @notice Scripts for deploying and debugging with Tenderly DevNets
/// @dev Use --slow flag when running to prevent transaction batching
contract TenderlyDebugScript is BaseScript {
    /// @notice Deploy to Tenderly DevNet with verification
    function deployToTenderly() public returns (Counter) {
        // Start deployment
        DeploymentConfig memory config = startDeployment();
        
        console2.log("====================================");
        console2.log("Deploying to Tenderly DevNet");
        console2.log("====================================");
        
        // Deploy Counter
        Counter counter = new Counter();
        console2.log("Counter deployed to:", address(counter));
        
        // Save deployment
        saveDeployment("Counter", address(counter));
        
        // Verify on Tenderly for debugging
        if (config.verify) {
            verifyContractTenderly(address(counter), "src/Counter.sol:Counter");
        }
        
        // End deployment
        endDeployment();
        
        return counter;
    }
    
    /// @notice Deploy with intentional revert for debugging
    function deployWithRevert() public {
        startDeployment();
        
        console2.log("Deploying contract that will revert...");
        
        // This will revert - useful for testing Tenderly debugging
        revert("Intentional revert for debugging demo");
    }
    
    /// @notice Test transaction that fails
    function testFailingTransaction() public {
        DeploymentConfig memory config = startDeployment();
        
        // Load existing counter
        Counter counter = Counter(loadDeployment("Counter"));
        
        // Attempt an unauthorized operation
        console2.log("Attempting unauthorized reset...");
        counter.reset(); // This should fail if not owner
        
        endDeployment();
    }
    
    /// @notice Deploy and perform multiple operations for debugging
    function complexDeploymentScenario() public {
        DeploymentConfig memory config = startDeployment();
        
        console2.log("Starting complex deployment scenario...");
        
        // Deploy multiple contracts
        Counter counter1 = new Counter();
        Counter counter2 = new Counter();
        
        // Perform operations
        counter1.increment();
        counter1.incrementBy(10);
        
        counter2.increment();
        counter2.increment();
        
        // Transfer ownership
        counter1.transferOwnership(address(counter2));
        
        // Save deployments
        saveDeployment("Counter1", address(counter1));
        saveDeployment("Counter2", address(counter2));
        
        // Log final state
        console2.log("Counter1 final count:", counter1.count());
        console2.log("Counter2 final count:", counter2.count());
        console2.log("Counter1 owner:", counter1.owner());
        
        endDeployment();
    }
}

/// @title TenderlyVerificationHelper
/// @notice Helper contract for Tenderly-specific verification tasks
contract TenderlyVerificationHelper is BaseScript {
    /// @notice Verify all contracts in a deployment
    function verifyAll() public {
        // Get all deployed contracts
        address counter = loadDeployment("Counter");
        
        console2.log("Verifying all contracts on Tenderly...");
        
        // Verify each contract
        verifyContractTenderly(counter, "src/Counter.sol:Counter");
        
        console2.log("Verification complete!");
    }
    
    /// @notice Get Tenderly DevNet info
    function getDevNetInfo() public view {
        console2.log("====================================");
        console2.log("Tenderly DevNet Information");
        console2.log("====================================");
        console2.log("DevNet URL:", vm.envString("TENDERLY_DEVNET_URL"));
        console2.log("Project:", vm.envString("TENDERLY_PROJECT"));
        console2.log("Username:", vm.envString("TENDERLY_USERNAME"));
        console2.log("Chain ID:", block.chainid);
        console2.log("====================================");
    }
}

/// @title DebugFailedTransaction
/// @notice Utilities for debugging failed transactions
contract DebugFailedTransaction is BaseScript {
    /// @notice Structure to store transaction debug info
    struct DebugInfo {
        address from;
        address to;
        uint256 value;
        bytes data;
        uint256 gas;
        string revertReason;
    }
    
    /// @notice Simulate a failed transaction for debugging
    function simulateFailure(
        address target,
        bytes calldata data
    ) public {
        console2.log("Simulating transaction...");
        console2.log("Target:", target);
        console2.log("Data:", vm.toString(data));
        
        // Try the call
        (bool success, bytes memory returnData) = target.call(data);
        
        if (!success) {
            console2.log("Transaction failed!");
            
            // Decode revert reason if possible
            if (returnData.length > 0) {
                string memory reason = _getRevertMsg(returnData);
                console2.log("Revert reason:", reason);
            }
            
            console2.log("Use Tenderly to debug this transaction");
            console2.log("Transaction hash will be available in broadcast logs");
        } else {
            console2.log("Transaction succeeded");
        }
    }
    
    /// @notice Extract revert message from return data
    function _getRevertMsg(bytes memory returnData) internal pure returns (string memory) {
        // If the returnData length is less than 68, the transaction failed silently
        if (returnData.length < 68) return "Transaction reverted silently";
        
        assembly {
            // Slice the sighash (4 bytes) and position (32 bytes)
            returnData := add(returnData, 0x04)
        }
        
        return abi.decode(returnData, (string));
    }
    
    /// @notice Debug a specific transaction hash
    function debugTransaction(bytes32 txHash) public view {
        console2.log("====================================");
        console2.log("Transaction Debug Information");
        console2.log("====================================");
        console2.log("Transaction Hash:", vm.toString(txHash));
        console2.log("View in Tenderly:");
        console2.log(
            string.concat(
                "https://dashboard.tenderly.co/",
                vm.envString("TENDERLY_USERNAME"),
                "/",
                vm.envString("TENDERLY_PROJECT"),
                "/tx/",
                vm.toString(txHash)
            )
        );
        console2.log("====================================");
        console2.log("Run 'cast run <tx_hash> --rpc-url <rpc_url>' for basic trace");
        console2.log("If cast debugging fails, use Tenderly dashboard for:");
        console2.log("- Stack traces");
        console2.log("- State changes");
        console2.log("- Gas profiling");
        console2.log("- Event logs");
        console2.log("====================================");
    }
    
    /// @notice Get detailed error info using Tenderly API
    function getErrorDetails(bytes32 txHash) public {
        console2.log("Fetching error details from Tenderly...");
        console2.log("Note: Ensure TENDERLY_ACCESS_TOKEN is set");
        console2.log("Transaction:", vm.toString(txHash));
        
        // Construct Tenderly API call command
        string memory curlCmd = string.concat(
            "curl -X GET ",
            "https://api.tenderly.co/api/v1/account/",
            vm.envString("TENDERLY_USERNAME"),
            "/project/",
            vm.envString("TENDERLY_PROJECT"),
            "/tx/",
            vm.toString(txHash),
            " -H 'X-Access-Key: $TENDERLY_ACCESS_TOKEN'"
        );
        
        console2.log("Run this command for detailed error info:");
        console2.log(curlCmd);
    }
}

/// @title GasOptimizationDebug
/// @notice Debug and optimize gas usage with Tenderly
contract GasOptimizationDebug is BaseScript {
    /// @notice Profile gas usage for Counter operations
    function profileGasUsage() public {
        startDeployment();
        
        // Deploy fresh counter
        Counter counter = new Counter();
        
        console2.log("====================================");
        console2.log("Gas Profiling Results");
        console2.log("====================================");
        
        // Measure deployment gas
        uint256 deploymentGas = gasleft();
        
        // Profile each operation
        uint256 gasStart;
        uint256 gasUsed;
        
        // Increment
        gasStart = gasleft();
        counter.increment();
        gasUsed = gasStart - gasleft();
        console2.log("increment() gas:", gasUsed);
        
        // IncrementBy
        gasStart = gasleft();
        counter.incrementBy(100);
        gasUsed = gasStart - gasleft();
        console2.log("incrementBy(100) gas:", gasUsed);
        
        // Decrement
        gasStart = gasleft();
        counter.decrement();
        gasUsed = gasStart - gasleft();
        console2.log("decrement() gas:", gasUsed);
        
        // Reset (as owner)
        gasStart = gasleft();
        counter.reset();
        gasUsed = gasStart - gasleft();
        console2.log("reset() gas:", gasUsed);
        
        console2.log("====================================");
        console2.log("View detailed gas breakdown in Tenderly");
        console2.log("====================================");
        
        endDeployment();
    }
}