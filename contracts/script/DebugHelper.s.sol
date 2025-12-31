// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

/// @title DebugHelper
/// @notice Helper contract demonstrating the debugging workflow
/// @dev Start with cast commands, fallback to Tenderly for complex errors
contract DebugHelper is Script {
    /// @notice Show debugging workflow for a failed transaction
    function showDebugWorkflow() public view {
        console2.log("====================================");
        console2.log("Smart Contract Debugging Workflow");
        console2.log("====================================");
        console2.log("");
        console2.log("Step 1: Use Cast Commands First");
        console2.log("--------------------------------");
        console2.log("1. Get transaction details:");
        console2.log("   cast tx <TX_HASH> --rpc-url <RPC_URL>");
        console2.log("");
        console2.log("2. Run transaction trace:");
        console2.log("   cast run <TX_HASH> --rpc-url <RPC_URL>");
        console2.log("");
        console2.log("3. Decode revert reason:");
        console2.log("   cast 4byte-decode <REVERT_DATA>");
        console2.log("");
        console2.log("4. Check logs:");
        console2.log("   cast logs --address <CONTRACT> --rpc-url <RPC_URL>");
        console2.log("");
        console2.log("Step 2: Use Tenderly for Complex Errors");
        console2.log("---------------------------------------");
        console2.log("If cast commands don't reveal the error:");
        console2.log("");
        console2.log("1. Quick debug:");
        console2.log("   make debug-tx TX_HASH=0x... NETWORK=sepolia");
        console2.log("");
        console2.log("2. Detailed API debug:");
        console2.log("   make tenderly-api-debug TX_HASH=0x...");
        console2.log("");
        console2.log("3. Simulate transaction:");
        console2.log("   make tenderly-simulate FROM=0x... TO=0x... DATA=0x...");
        console2.log("");
        console2.log("Why use Tenderly?");
        console2.log("-----------------");
        console2.log("- Stack traces for nested calls");
        console2.log("- State changes visualization");
        console2.log("- Gas profiling per operation");
        console2.log("- Event logs in context");
        console2.log("- Simulation before execution");
        console2.log("====================================");
    }
    
    /// @notice Example of debugging a specific error
    function debugExample(address target, bytes calldata data) public {
        console2.log("Attempting transaction...");
        
        // Try the call
        (bool success, bytes memory returnData) = target.call(data);
        
        if (!success) {
            console2.log("Transaction failed!");
            console2.log("");
            console2.log("Step 1: Try cast commands");
            console2.log("cast run <TX_HASH> --rpc-url <RPC_URL>");
            console2.log("");
            
            // Try to decode error
            if (returnData.length >= 4) {
                bytes4 selector = bytes4(returnData);
                console2.log("Error selector:", vm.toString(selector));
                console2.log("Decode with: cast 4byte-decode", vm.toString(selector));
            }
            
            console2.log("");
            console2.log("Step 2: If cast fails, use Tenderly");
            console2.log("make debug-tx TX_HASH=<hash> NETWORK=<network>");
            console2.log("");
            console2.log("Tenderly will show:");
            console2.log("- Exact line where error occurred");
            console2.log("- Stack trace through all calls");
            console2.log("- State changes before failure");
            console2.log("- Gas usage breakdown");
        }
    }
    
    /// @notice Common error patterns and how to debug them
    function commonErrors() public view {
        console2.log("====================================");
        console2.log("Common Errors & Debug Strategies");
        console2.log("====================================");
        console2.log("");
        console2.log("1. 'Execution reverted' (no reason)");
        console2.log("   - Often from require() without message");
        console2.log("   - Use Tenderly to find exact line");
        console2.log("");
        console2.log("2. 'Out of gas'");
        console2.log("   - Check gas limit vs usage");
        console2.log("   - Use Tenderly gas profiler");
        console2.log("");
        console2.log("3. Silent failures");
        console2.log("   - Low-level calls that don't bubble errors");
        console2.log("   - MUST use Tenderly for these");
        console2.log("");
        console2.log("4. Stack too deep");
        console2.log("   - Compile error, not runtime");
        console2.log("   - Refactor to use structs/fewer vars");
        console2.log("");
        console2.log("5. Invalid opcode");
        console2.log("   - Often from assert() failures");
        console2.log("   - Check invariants with Tenderly");
        console2.log("====================================");
    }
}