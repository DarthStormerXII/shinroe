// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {console2} from "forge-std/console2.sol";
import {ScoreRegistry} from "@/ScoreRegistry.sol";
import {BadgeNFT} from "@/BadgeNFT.sol";
import {EndorsementVault} from "@/EndorsementVault.sol";
import {AirdropVault} from "@/AirdropVault.sol";

/// @title InitializeShinroe
/// @notice Post-deployment initialization and contract linking
/// @dev Run this AFTER DeployVeryChain.s.sol to configure contract relationships
contract InitializeShinroe is Script {
    // ============ Contract Addresses ============
    // These will be set from environment or passed as arguments

    struct ContractAddresses {
        address scoreRegistry;
        address badgeNFT;
        address endorsementVault;
        address airdropVault;
    }

    /// @notice Initialize all contracts with proper linking
    /// @dev Reads addresses from environment variables
    function run() public {
        ContractAddresses memory addrs = _loadAddresses();
        _validateAddresses(addrs);

        uint256 deployerPrivateKey = _getPrivateKey();
        address deployer = vm.addr(deployerPrivateKey);

        console2.log("\n========================================");
        console2.log("   SHINROE CONTRACT INITIALIZATION");
        console2.log("========================================");
        console2.log("Deployer:", deployer);
        console2.log("Chain ID:", block.chainid);
        console2.log("========================================\n");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Configure BadgeNFT
        _configureBadgeNFT(addrs);

        // Step 2: Configure EndorsementVault
        _configureEndorsementVault(addrs);

        // Step 3: Configure ScoreRegistry authorized updaters
        _configureScoreRegistry(addrs);

        vm.stopBroadcast();

        _logInitializationComplete(addrs);
    }

    /// @notice Initialize with explicit addresses (for testing)
    function runWithAddresses(
        address scoreRegistry,
        address badgeNFT,
        address endorsementVault,
        address airdropVault
    ) public {
        ContractAddresses memory addrs = ContractAddresses({
            scoreRegistry: scoreRegistry,
            badgeNFT: badgeNFT,
            endorsementVault: endorsementVault,
            airdropVault: airdropVault
        });

        _validateAddresses(addrs);

        uint256 deployerPrivateKey = _getPrivateKey();

        vm.startBroadcast(deployerPrivateKey);

        _configureBadgeNFT(addrs);
        _configureEndorsementVault(addrs);
        _configureScoreRegistry(addrs);

        vm.stopBroadcast();

        _logInitializationComplete(addrs);
    }

    /// @notice Verify initialization was successful
    function verify() public view {
        ContractAddresses memory addrs = _loadAddresses();

        console2.log("\n========================================");
        console2.log("   VERIFICATION RESULTS");
        console2.log("========================================\n");

        // Verify BadgeNFT
        BadgeNFT badge = BadgeNFT(addrs.badgeNFT);
        address badgeScoreRegistry = address(badge.scoreRegistry());
        bool badgeConfigured = badgeScoreRegistry == addrs.scoreRegistry;
        console2.log("BadgeNFT.scoreRegistry:", badgeScoreRegistry);
        console2.log("  -> Configured correctly:", badgeConfigured);

        // Verify EndorsementVault
        EndorsementVault vault = EndorsementVault(addrs.endorsementVault);
        address vaultScoreRegistry = address(vault.scoreRegistry());
        bool vaultConfigured = vaultScoreRegistry == addrs.scoreRegistry;
        console2.log("EndorsementVault.scoreRegistry:", vaultScoreRegistry);
        console2.log("  -> Configured correctly:", vaultConfigured);

        // Verify ScoreRegistry authorized updaters
        ScoreRegistry registry = ScoreRegistry(addrs.scoreRegistry);
        bool badgeAuthorized = registry.isAuthorizedUpdater(addrs.badgeNFT);
        bool vaultAuthorized = registry.isAuthorizedUpdater(addrs.endorsementVault);
        console2.log("ScoreRegistry.isAuthorizedUpdater(BadgeNFT):", badgeAuthorized);
        console2.log("ScoreRegistry.isAuthorizedUpdater(EndorsementVault):", vaultAuthorized);

        console2.log("\n========================================");
        if (badgeConfigured && vaultConfigured && badgeAuthorized && vaultAuthorized) {
            console2.log("   ALL VERIFICATIONS PASSED");
        } else {
            console2.log("   SOME VERIFICATIONS FAILED");
        }
        console2.log("========================================\n");
    }

    // ============ Configuration Functions ============

    function _configureBadgeNFT(ContractAddresses memory addrs) internal {
        console2.log("Configuring BadgeNFT...");

        BadgeNFT badge = BadgeNFT(addrs.badgeNFT);

        // Set ScoreRegistry reference
        badge.setScoreRegistry(addrs.scoreRegistry);
        console2.log("  -> setScoreRegistry:", addrs.scoreRegistry);

        // Grant ScoreRegistry as minter (for admin badge minting)
        badge.grantMinter(addrs.scoreRegistry);
        console2.log("  -> grantMinter(ScoreRegistry)");

        console2.log("  [OK] BadgeNFT configured\n");
    }

    function _configureEndorsementVault(ContractAddresses memory addrs) internal {
        console2.log("Configuring EndorsementVault...");

        EndorsementVault vault = EndorsementVault(addrs.endorsementVault);

        // Set ScoreRegistry reference for auto-registration
        vault.setScoreRegistry(addrs.scoreRegistry);
        console2.log("  -> setScoreRegistry:", addrs.scoreRegistry);

        console2.log("  [OK] EndorsementVault configured\n");
    }

    function _configureScoreRegistry(ContractAddresses memory addrs) internal {
        console2.log("Configuring ScoreRegistry...");

        ScoreRegistry registry = ScoreRegistry(addrs.scoreRegistry);

        // Add BadgeNFT as authorized updater (can auto-register users)
        registry.addAuthorizedUpdater(addrs.badgeNFT);
        console2.log("  -> addAuthorizedUpdater(BadgeNFT):", addrs.badgeNFT);

        // Add EndorsementVault as authorized updater
        registry.addAuthorizedUpdater(addrs.endorsementVault);
        console2.log("  -> addAuthorizedUpdater(EndorsementVault):", addrs.endorsementVault);

        console2.log("  [OK] ScoreRegistry configured\n");
    }

    // ============ Helpers ============

    function _loadAddresses() internal view returns (ContractAddresses memory) {
        return ContractAddresses({
            scoreRegistry: vm.envAddress("SCORE_REGISTRY_ADDRESS"),
            badgeNFT: vm.envAddress("BADGE_NFT_ADDRESS"),
            endorsementVault: vm.envAddress("ENDORSEMENT_VAULT_ADDRESS"),
            airdropVault: vm.envAddress("AIRDROP_VAULT_ADDRESS")
        });
    }

    function _validateAddresses(ContractAddresses memory addrs) internal pure {
        require(addrs.scoreRegistry != address(0), "ScoreRegistry address not set");
        require(addrs.badgeNFT != address(0), "BadgeNFT address not set");
        require(addrs.endorsementVault != address(0), "EndorsementVault address not set");
        require(addrs.airdropVault != address(0), "AirdropVault address not set");
    }

    function _getPrivateKey() internal view returns (uint256) {
        string memory pkString = vm.envString("PRIVATE_KEY");
        if (bytes(pkString).length == 64) {
            return vm.parseUint(string.concat("0x", pkString));
        }
        return vm.parseUint(pkString);
    }

    function _logInitializationComplete(ContractAddresses memory addrs) internal pure {
        console2.log("========================================");
        console2.log("   INITIALIZATION COMPLETE");
        console2.log("========================================");
        console2.log("Contract Links Established:");
        console2.log("  BadgeNFT -> ScoreRegistry");
        console2.log("  EndorsementVault -> ScoreRegistry");
        console2.log("  ScoreRegistry authorized: BadgeNFT, EndorsementVault");
        console2.log("========================================\n");

        console2.log("NEXT STEP:");
        console2.log("Run 'forge script script/InitializeShinroe.s.sol:InitializeShinroe");
        console2.log("--sig \"verify()\" --rpc-url verychain' to verify configuration");
    }
}
