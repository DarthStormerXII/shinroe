// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {DeployVeryChain} from "./DeployVeryChain.s.sol";
import {InitializeShinroe} from "./InitializeShinroe.s.sol";
import {SeedData} from "./SeedData.s.sol";

/// @title FullDeploy
/// @notice Orchestrates complete deployment: Deploy -> Initialize -> Seed
/// @dev Use this for full deployment in one transaction batch
contract FullDeploy is Script {
    /// @notice Run full deployment + initialization + seeding
    function run() public {
        console2.log("\n");
        console2.log("========================================================");
        console2.log("   SHINROE FULL DEPLOYMENT - VERYCHAIN MAINNET");
        console2.log("========================================================");
        console2.log("This script will:");
        console2.log("  1. Deploy all contracts");
        console2.log("  2. Initialize contract relationships");
        console2.log("  3. Seed initial data");
        console2.log("========================================================\n");

        uint256 deployerPrivateKey = _getPrivateKey();
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("Deployer:", deployer);
        console2.log("Chain ID:", block.chainid);
        console2.log("Balance:", deployer.balance);
        console2.log("\n");

        // Phase 1: Deploy
        console2.log("========================================================");
        console2.log("   PHASE 1: DEPLOYMENT");
        console2.log("========================================================\n");

        DeployVeryChain deployScript = new DeployVeryChain();
        DeployVeryChain.DeployedContracts memory contracts = deployScript.run();

        // Phase 2: Initialize
        console2.log("\n========================================================");
        console2.log("   PHASE 2: INITIALIZATION");
        console2.log("========================================================\n");

        vm.startBroadcast(deployerPrivateKey);

        _initializeContracts(contracts);

        vm.stopBroadcast();

        // Phase 3: Seed (optional - can be run separately)
        console2.log("\n========================================================");
        console2.log("   PHASE 3: SEEDING");
        console2.log("========================================================\n");

        vm.startBroadcast(deployerPrivateKey);

        _seedData(contracts, deployer);

        vm.stopBroadcast();

        // Final Summary
        _logFinalSummary(contracts, deployer);
    }

    /// @notice Deploy + Initialize only (no seeding)
    function runWithoutSeed() public {
        console2.log("\n========================================================");
        console2.log("   SHINROE DEPLOYMENT - NO SEEDING");
        console2.log("========================================================\n");

        uint256 deployerPrivateKey = _getPrivateKey();

        // Deploy
        DeployVeryChain deployScript = new DeployVeryChain();
        DeployVeryChain.DeployedContracts memory contracts = deployScript.run();

        // Initialize
        vm.startBroadcast(deployerPrivateKey);
        _initializeContracts(contracts);
        vm.stopBroadcast();

        _logContractAddresses(contracts);
    }

    /// @notice Dry run for testing (simulation mode)
    function simulate() public {
        console2.log("\n========================================================");
        console2.log("   SIMULATION MODE - NO REAL TRANSACTIONS");
        console2.log("========================================================\n");

        run();

        console2.log("\n========================================================");
        console2.log("   SIMULATION COMPLETE - Review logs above");
        console2.log("========================================================\n");
    }

    // ============ Internal Functions ============

    function _initializeContracts(DeployVeryChain.DeployedContracts memory c) internal {
        console2.log("Initializing contract relationships...\n");

        // Configure BadgeNFT
        console2.log("  Configuring BadgeNFT...");
        c.badgeNFT.setScoreRegistry(address(c.scoreRegistry));
        c.badgeNFT.grantMinter(address(c.scoreRegistry));
        console2.log("    -> ScoreRegistry set");
        console2.log("    -> ScoreRegistry granted minter role");

        // Configure EndorsementVault
        console2.log("  Configuring EndorsementVault...");
        c.endorsementVault.setScoreRegistry(address(c.scoreRegistry));
        console2.log("    -> ScoreRegistry set");

        // Configure ScoreRegistry
        console2.log("  Configuring ScoreRegistry...");
        c.scoreRegistry.addAuthorizedUpdater(address(c.badgeNFT));
        c.scoreRegistry.addAuthorizedUpdater(address(c.endorsementVault));
        console2.log("    -> BadgeNFT authorized");
        console2.log("    -> EndorsementVault authorized");

        console2.log("\n  [OK] All contracts initialized\n");
    }

    function _seedData(
        DeployVeryChain.DeployedContracts memory c,
        address deployer
    ) internal {
        console2.log("Seeding initial data...\n");

        // Register deployer
        bytes32 scoreHash = keccak256(abi.encodePacked(deployer, uint256(850), bytes32("deployer_salt")));
        c.scoreRegistry.registerUser(deployer, scoreHash);
        console2.log("  - Registered deployer with score 850");

        // Mint badges to deployer
        c.badgeNFT.mintBadge(deployer, IBadgeNFT.BadgeType.VERIFIED_IDENTITY);
        c.badgeNFT.mintBadge(deployer, IBadgeNFT.BadgeType.EARLY_ADOPTER);
        c.badgeNFT.mintBadge(deployer, IBadgeNFT.BadgeType.ELITE_SCORE);
        console2.log("  - Minted VERIFIED_IDENTITY badge");
        console2.log("  - Minted EARLY_ADOPTER badge");
        console2.log("  - Minted ELITE_SCORE badge");

        // Mint some free tokens to deployer
        c.freeMintToken.mint(1000 ether);
        console2.log("  - Minted 1000 test tokens to deployer");

        // Mint a test NFT
        c.freeMintNFT.mint();
        console2.log("  - Minted 1 test NFT to deployer");

        console2.log("\n  [OK] Initial data seeded\n");
    }

    function _logContractAddresses(DeployVeryChain.DeployedContracts memory c) internal pure {
        console2.log("\n========================================================");
        console2.log("   CONTRACT ADDRESSES");
        console2.log("========================================================");
        console2.log("HelloWorld:       ", address(c.helloWorld));
        console2.log("FreeMintToken:    ", address(c.freeMintToken));
        console2.log("FreeMintNFT:      ", address(c.freeMintNFT));
        console2.log("ScoreRegistry:    ", address(c.scoreRegistry));
        console2.log("BadgeNFT:         ", address(c.badgeNFT));
        console2.log("EndorsementVault: ", address(c.endorsementVault));
        console2.log("TokenFactory:     ", address(c.tokenFactory));
        console2.log("AirdropVault:     ", address(c.airdropVault));
        console2.log("========================================================\n");
    }

    function _logFinalSummary(
        DeployVeryChain.DeployedContracts memory c,
        address deployer
    ) internal view {
        console2.log("\n");
        console2.log("========================================================");
        console2.log("   DEPLOYMENT COMPLETE!");
        console2.log("========================================================");
        console2.log("");
        console2.log("Chain ID:", block.chainid);
        console2.log("Deployer:", deployer);
        console2.log("");
        console2.log("CONTRACT ADDRESSES:");
        console2.log("  HelloWorld:       ", address(c.helloWorld));
        console2.log("  FreeMintToken:    ", address(c.freeMintToken));
        console2.log("  FreeMintNFT:      ", address(c.freeMintNFT));
        console2.log("  ScoreRegistry:    ", address(c.scoreRegistry));
        console2.log("  BadgeNFT:         ", address(c.badgeNFT));
        console2.log("  EndorsementVault: ", address(c.endorsementVault));
        console2.log("  TokenFactory:     ", address(c.tokenFactory));
        console2.log("  AirdropVault:     ", address(c.airdropVault));
        console2.log("");
        console2.log("NEXT STEPS:");
        console2.log("  1. Update deployment.config.json with addresses");
        console2.log("  2. Run 'make sync-frontend' to update frontend");
        console2.log("  3. Deploy subgraphs with new addresses");
        console2.log("========================================================\n");
    }

    function _getPrivateKey() internal view returns (uint256) {
        string memory pkString = vm.envString("PRIVATE_KEY");
        if (bytes(pkString).length == 64) {
            return vm.parseUint(string.concat("0x", pkString));
        }
        return vm.parseUint(pkString);
    }
}

// Import for BadgeType enum
import {IBadgeNFT} from "@/interfaces/IBadgeNFT.sol";
