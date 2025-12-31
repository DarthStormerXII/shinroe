// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";

/// @title BaseScript
/// @notice Base script with common utilities for deployments
abstract contract BaseScript is Script {
    /// @notice Deployment configuration
    struct DeploymentConfig {
        address deployer;
        uint256 deployerPrivateKey;
        string rpcUrl;
        uint256 chainId;
        bool verify;
        bool broadcast;
    }

    /// @notice Chain IDs
    uint256 internal constant SEPOLIA = 11155111;
    uint256 internal constant LOCALHOST = 31337;

    /// @notice Common addresses
    address internal constant ZERO_ADDRESS = address(0);

    /// @notice Deployment artifacts
    mapping(string => address) public deployments;
    mapping(address => string) public deploymentNames;

    /// @notice Get deployment configuration
    function getDeploymentConfig() internal view returns (DeploymentConfig memory config) {
        // Always use testnet private key (only supporting Sepolia)
        config.deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0));
        
        config.rpcUrl = vm.rpcUrl("anvil"); // Default to anvil
        config.chainId = block.chainid;
        
        // Don't verify on forks
        config.verify = !isFork() && vm.envOr("VERIFY_CONTRACTS", false);
        config.broadcast = vm.envOr("BROADCAST", true);

        if (config.deployerPrivateKey == 0) {
            if (isLocal()) {
                // Use default anvil private key for local testing
                config.deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
            } else {
                revert("Missing private key. Please set PRIVATE_KEY in .env");
            }
        }

        config.deployer = vm.addr(config.deployerPrivateKey);
    }

    /// @notice Start deployment with proper configuration
    function startDeployment() internal returns (DeploymentConfig memory config) {
        config = getDeploymentConfig();

        console2.log("====================================");
        console2.log("Deploying to chain:", config.chainId);
        console2.log("Deployer address:", config.deployer);
        console2.log("RPC URL:", config.rpcUrl);
        console2.log("====================================");

        if (config.broadcast) {
            // Always use CLI-provided key - let forge handle it
            vm.startBroadcast();
        }

        return config;
    }

    /// @notice End deployment
    function endDeployment() internal {
        DeploymentConfig memory config = getDeploymentConfig();
        
        if (config.broadcast) {
            vm.stopBroadcast();
        }

        // Log all deployments
        console2.log("\n====================================");
        console2.log("Deployment Summary:");
        console2.log("====================================");
        
        // Note: In a real implementation, you'd iterate through deployments
        // This is simplified for the example
    }

    /// @notice Save deployment address
    function saveDeployment(string memory name, address addr) internal {
        deployments[name] = addr;
        deploymentNames[addr] = name;
        console2.log(string.concat(name, " deployed to:"), addr);
    }

    /// @notice Load deployment address
    function loadDeployment(string memory name) internal view returns (address) {
        address addr = deployments[name];
        require(addr != address(0), string.concat("Deployment not found: ", name));
        return addr;
    }

    /// @notice Get chain name from chain ID
    function getChainName() internal view returns (string memory) {
        uint256 chainId = block.chainid;
        
        if (chainId == SEPOLIA) return "sepolia";
        if (chainId == LOCALHOST) return "localhost";
        
        return "unknown";
    }

    /// @notice Check if current network is a testnet
    function isTestnet() internal view returns (bool) {
        uint256 chainId = block.chainid;
        return chainId == SEPOLIA || chainId == LOCALHOST;
    }

    /// @notice Check if current network is a mainnet
    function isMainnetChain() internal view returns (bool) {
        // No mainnet support in this template
        return false;
    }

    /// @notice Check if current network is local
    function isLocal() internal view returns (bool) {
        return block.chainid == LOCALHOST;
    }

    /// @notice Check if we're running on a fork
    /// @dev Detects fork by checking if we have a fork URL set or specific fork indicators
    function isFork() internal view override returns (bool) {
        // Method 1: Check if fork URL is set in environment
        try vm.envString("FORK_RPC_URL") returns (string memory forkUrl) {
            if (bytes(forkUrl).length > 0) {
                return true;
            }
        } catch {}

        // Method 2: Check if we're in a test environment with real chain ID
        // Forks will have real chain IDs but test environment indicators
        if (block.chainid != LOCALHOST) {
            try vm.envBool("IS_FORK") returns (bool fork) {
                if (fork) return true;
            } catch {}
        }

        return false;
    }

    /// @notice Get fork information if running on a fork
    function getForkInfo() internal view returns (uint256 forkBlockNumber, uint256 forkChainId) {
        if (isFork()) {
            forkBlockNumber = block.number;
            forkChainId = block.chainid;
        }
    }

    /// @notice Generate salt for deterministic deployments
    function generateSalt(string memory name) internal view returns (bytes32) {
        return keccak256(abi.encodePacked(name, block.chainid, msg.sender));
    }

    /// @notice Deploy with CREATE2 for deterministic addresses
    function deployDeterministic(
        bytes memory bytecode,
        bytes32 salt
    ) internal returns (address deployed) {
        assembly {
            deployed := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
        }
        require(deployed != address(0), "CREATE2 deployment failed");
    }

    /// @notice Compute CREATE2 address
    function predictCreate2Address(
        bytes32 salt,
        bytes32 bytecodeHash
    ) internal view returns (address) {
        return address(
            uint160(
                uint256(
                    keccak256(
                        abi.encodePacked(
                            bytes1(0xff),
                            address(this),
                            salt,
                            bytecodeHash
                        )
                    )
                )
            )
        );
    }

    /// @notice Verify contract using Blockscout
    function verifyContract(
        address contractAddress,
        string memory contractPath
    ) internal {
        DeploymentConfig memory config = getDeploymentConfig();
        
        if (!config.verify || isLocal()) {
            return;
        }

        console2.log("Verifying contract on Blockscout...");
        
        // Build verification command
        string[] memory inputs = new string[](11);
        inputs[0] = "forge";
        inputs[1] = "verify-contract";
        inputs[2] = vm.toString(contractAddress);
        inputs[3] = contractPath;
        inputs[4] = "--chain";
        inputs[5] = vm.toString(config.chainId);
        inputs[6] = "--verifier";
        inputs[7] = "blockscout";
        inputs[8] = "--verifier-url";
        inputs[9] = getBlockscoutUrl();
        inputs[10] = "--watch";
        
        vm.ffi(inputs);
    }

    /// @notice Verify contract using Tenderly (for DevNets)
    function verifyContractTenderly(
        address contractAddress,
        string memory contractPath
    ) internal {
        DeploymentConfig memory config = getDeploymentConfig();
        
        if (!config.verify || isLocal()) {
            return;
        }

        console2.log("Verifying contract on Tenderly...");
        
        string[] memory inputs = new string[](13);
        inputs[0] = "forge";
        inputs[1] = "verify-contract";
        inputs[2] = vm.toString(contractAddress);
        inputs[3] = contractPath;
        inputs[4] = "--chain";
        inputs[5] = vm.toString(config.chainId);
        inputs[6] = "--verifier";
        inputs[7] = "etherscan";
        inputs[8] = "--verifier-url";
        inputs[9] = vm.envString("TENDERLY_VERIFIER_URL");
        inputs[10] = "--etherscan-api-key";
        inputs[11] = vm.envString("TENDERLY_ACCESS_TOKEN");
        inputs[12] = "--watch";
        
        vm.ffi(inputs);
    }

    /// @notice Get appropriate Blockscout URL for current chain
    function getBlockscoutUrl() internal view returns (string memory) {
        uint256 chainId = block.chainid;

        if (chainId == SEPOLIA) {
            return vm.envOr("BLOCKSCOUT_SEPOLIA_URL", string("https://eth-sepolia.blockscout.com/api"));
        }

        revert("Unsupported chain for Blockscout verification");
    }

    /// @notice Sleep for a duration (useful between deployments)
    function sleep(uint256 milliseconds) internal {
        uint256 start = block.timestamp * 1000;
        while (block.timestamp * 1000 < start + milliseconds) {
            // Wait
        }
    }

    /// @notice Modifier to only run on specific chains
    modifier onlyChain(uint256 chainId) {
        require(block.chainid == chainId, "Wrong chain");
        _;
    }

    /// @notice Modifier to only run on testnets
    modifier onlyTestnet() {
        require(isTestnet(), "Only testnet");
        _;
    }

    /// @notice Modifier to only run on mainnet
    modifier onlyMainnet() {
        require(!isTestnet() && !isLocal(), "Only mainnet");
        _;
    }
}